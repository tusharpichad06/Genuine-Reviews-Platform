import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminNavigation from "../components/AdminNavigation";
import { supabase } from "../lib/supabase";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type Deal = {
  id: string;
  proposal_id: string;
  business_id: string;
  reviewer_id: string;
  title: string;
  description: string | null;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled";
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
};

type Profile = {
  id: string;
  username: string;
};

type Proposal = {
  id: string;
  recipient_type: string;
  recipient_id: string;
};

type DealMessage = {
  id: string;
  deal_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type DealAttachment = {
  id: string;
  deal_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

const ITEMS_PER_PAGE = 7;

const STATUS_OPTIONS = [
  "active",
  "completed",
  "cancelled",
];

export default function AdminDeals() {
  const navigate = useNavigate();

  const [deals, setDeals] = useState<Deal[]>([]);

  const [businesses, setBusinesses] = useState<
    Record<string, BusinessProfile>
  >({});

  const [profiles, setProfiles] = useState<
    Record<string, Profile>
  >({});

  const [proposals, setProposals] = useState<
    Record<string, Proposal>
  >({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedDeal, setSelectedDeal] =
    useState<Deal | null>(null);

  const [messages, setMessages] = useState<
    DealMessage[]
  >([]);

  const [attachments, setAttachments] =
    useState<DealAttachment[]>([]);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [loadingAttachments, setLoadingAttachments] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setErrorMessage("");

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Admin check
      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (adminProfile?.role !== "admin") {
        navigate("/");
        return;
      }

      // Deals
      const {
        data: dealData,
        error: dealError,
      } = await supabase
        .from("deals")
        .select(`
          id,
          proposal_id,
          business_id,
          reviewer_id,
          title,
          description,
          budget,
          currency,
          start_date,
          end_date,
          status,
          cancelled_by,
          cancelled_at,
          cancellation_reason,
          completed_at,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (dealError) {
        throw dealError;
      }

      const dealList =
        (dealData as Deal[]) || [];

      setDeals(dealList);

      // Business profiles
      const businessIds = [
        ...new Set(
          dealList.map(
            (deal) => deal.business_id,
          ),
        ),
      ];

      if (businessIds.length > 0) {
        const {
          data: businessData,
          error: businessError,
        } = await supabase
          .from("business_profiles")
          .select(
            "id, user_id, business_name, category",
          )
          .in("id", businessIds);

        if (businessError) {
          throw businessError;
        }

        const businessMap: Record<
          string,
          BusinessProfile
        > = {};

        (
          (businessData as BusinessProfile[]) ||
          []
        ).forEach((business) => {
          businessMap[business.id] =
            business;
        });

        setBusinesses(businessMap);
      } else {
        setBusinesses({});
      }

      // Proposals
      const proposalIds = [
        ...new Set(
          dealList.map(
            (deal) => deal.proposal_id,
          ),
        ),
      ];

      if (proposalIds.length > 0) {
        const {
          data: proposalData,
          error: proposalError,
        } = await supabase
          .from("proposals")
          .select(
            "id, recipient_type, recipient_id",
          )
          .in("id", proposalIds);

        if (proposalError) {
          throw proposalError;
        }

        const proposalMap: Record<
          string,
          Proposal
        > = {};

        (
          (proposalData as Proposal[]) ||
          []
        ).forEach((proposal) => {
          proposalMap[proposal.id] =
            proposal;
        });

        setProposals(proposalMap);
      } else {
        setProposals({});
      }

      // Profile IDs
      const profileIds = [
        ...new Set(
          dealList.map(
            (deal) => deal.reviewer_id,
          ),
        ),
      ];

      if (profileIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", profileIds);

        if (profileError) {
          throw profileError;
        }

        const profileMap: Record<
          string,
          Profile
        > = {};

        (
          (profileData as Profile[]) ||
          []
        ).forEach((profile) => {
          profileMap[profile.id] =
            profile;
        });

        setProfiles(profileMap);
      } else {
        setProfiles({});
      }
    } catch (error) {
      console.error(
        "Error loading deals:",
        error,
      );

      setErrorMessage(
        "Unable to load deals. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeals();
  };

  const getParticipantName = (
    deal: Deal,
  ) => {
    const proposal =
      proposals[deal.proposal_id];

    if (
      proposal?.recipient_type ===
      "business"
    ) {
      const business =
        Object.values(businesses).find(
          (item) =>
            item.user_id ===
            proposal.recipient_id,
        );

      if (business) {
        return business.business_name;
      }
    }

    return (
      profiles[deal.reviewer_id]
        ?.username || "Unknown User"
    );
  };

  const getParticipantType = (
    deal: Deal,
  ) => {
    const proposal =
      proposals[deal.proposal_id];

    if (
      proposal?.recipient_type ===
      "business"
    ) {
      return "Business";
    }

    return "User";
  };

  const filteredDeals = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return deals.filter((deal) => {
      const business =
        businesses[deal.business_id];

      const participant =
        getParticipantName(deal);

      const matchesSearch =
        !value ||
        deal.title
          .toLowerCase()
          .includes(value) ||
        business?.business_name
          ?.toLowerCase()
          .includes(value) ||
        participant
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        deal.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    deals,
    businesses,
    profiles,
    proposals,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDeals.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedDeals = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredDeals.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [
    filteredDeals,
    currentPage,
  ]);

  const firstItem =
    filteredDeals.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const lastItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredDeals.length,
  );

  const formatDate = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(date));
  };

  const formatDateTime = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(new Date(date));
  };

  const formatBudget = (
    budget: number,
    currency: string,
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency:
            currency || "INR",
          maximumFractionDigits: 0,
        },
      ).format(budget);
    } catch {
      return `${currency || "INR"} ${Number(
        budget,
      ).toLocaleString("en-IN")}`;
    }
  };

  const formatFileSize = (
    bytes: number,
  ) => {
    if (!bytes || bytes <= 0) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getStatusClasses = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return "bg-[#DCFCE7] text-[#16A34A]";

      case "completed":
        return "bg-[#E8F0FF] text-[#2875F5]";

      case "cancelled":
        return "bg-[#FEE2E2] text-[#EF4444]";

      default:
        return "bg-[#EAF0F7] text-[#617493]";
    }
  };

  const getStatusLabel = (
    status: string,
  ) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const loadMessages = async (
    dealId: string,
  ) => {
    try {
      setLoadingMessages(true);

      const {
        data,
        error,
      } = await supabase
        .from("deal_messages")
        .select(`
          id,
          deal_id,
          sender_id,
          message,
          created_at
        `)
        .eq("deal_id", dealId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setMessages(
        (data as DealMessage[]) || [],
      );
    } catch (error) {
      console.error(
        "Error loading deal messages:",
        error,
      );

      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadAttachments = async (
    dealId: string,
  ) => {
    try {
      setLoadingAttachments(true);

      const {
        data,
        error,
      } = await supabase
        .from("deal_attachments")
        .select(`
          id,
          deal_id,
          uploaded_by,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at
        `)
        .eq("deal_id", dealId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setAttachments(
        (data as DealAttachment[]) ||
          [],
      );
    } catch (error) {
      console.error(
        "Error loading deal attachments:",
        error,
      );

      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleView = async (
    deal: Deal,
  ) => {
    setSelectedDeal(deal);
    setMessages([]);
    setAttachments([]);

    await Promise.all([
      loadMessages(deal.id),
      loadAttachments(deal.id),
    ]);
  };

  const closeDetails = () => {
    setSelectedDeal(null);
    setMessages([]);
    setAttachments([]);
  };

  const handleAttachment = async (
    attachment: DealAttachment,
  ) => {
    try {
      const {
        data,
        error,
      } = await supabase.storage
        .from("deal-assets")
        .createSignedUrl(
          attachment.file_path,
          60 * 10,
        );

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(
          data.signedUrl,
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (error) {
      console.error(
        "Error opening deal attachment:",
        error,
      );

      setErrorMessage(
        "Unable to open this attachment.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold text-[#2875F5] sm:text-sm">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#174A91] sm:text-3xl">
            Deal Management
          </h1>

          <p className="mt-1 text-xs text-[#617493] sm:text-sm">
            Monitor all active and completed
            business deals from one place.
          </p>
        </div>

        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Search / Filter */}
        <div className="mt-4 rounded-xl border border-[#D6E2F2] bg-white p-3 shadow-sm sm:mt-5 sm:p-2.5">
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#617493]" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search deals by title, business or participant..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  pl-9
                  pr-4
                  text-sm
                  text-[#10182D]
                  outline-none
                  transition
                  placeholder:text-[#8FA2BC]
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                "
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  px-3
                  text-xs
                  font-medium
                  text-[#10182D]
                  outline-none
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                  sm:text-sm
                  lg:w-52
                "
              >
                <option value="all">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {getStatusLabel(
                        status,
                      )}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  col-span-2
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#2875F5]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#155DCC]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:col-span-1
                "
              >
                <RefreshCw
                  className={
                    refreshing
                      ? "size-4 animate-spin"
                      : "size-4"
                  }
                />

                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />

            <p className="flex-1">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Main */}
        <div className="mt-4 flex items-start gap-4">
          {/* Table */}
          <div
            className={`
              min-w-0
              flex-1
              overflow-hidden
              rounded-xl
              border
              border-[#D6E2F2]
              bg-white
              shadow-sm
              ${
                selectedDeal
                  ? "lg:max-w-[calc(100%-390px)]"
                  : ""
              }
            `}
          >
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center sm:min-h-[500px]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#617493]">
                  <Loader2 className="size-5 animate-spin text-[#2875F5]" />
                  Loading deals...
                </div>
              </div>
            ) : filteredDeals.length ===
              0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center sm:min-h-[500px]">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2875F5]">
                  <FileText className="size-6" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-[#10182D]">
                  No deals found
                </h2>

                <p className="mt-1 text-sm text-[#617493]">
                  Try changing your search
                  or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                      <tr className="bg-[#EAF3FF] text-left">
                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Deal
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Business
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Participant
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Budget
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Start
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          End
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Status
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedDeals.map(
                        (deal) => {
                          const business =
                            businesses[
                              deal.business_id
                            ];

                          return (
                            <tr
                              key={deal.id}
                              className="
                                border-b
                                border-[#E5EDF7]
                                last:border-b-0
                                hover:bg-[#FAFCFF]
                              "
                            >
                              {/* Deal */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2875F5]">
                                    <FileText className="size-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[170px] truncate text-sm font-bold text-[#174A91]">
                                      {
                                        deal.title
                                      }
                                    </p>

                                    <p className="mt-1 max-w-[170px] truncate text-xs text-[#7C90AA]">
                                      {deal.description ||
                                        "Deal collaboration"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Business */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Building2 className="size-4 text-[#668DBE]" />

                                  <div>
                                    <p className="text-sm font-semibold text-[#10182D]">
                                      {business
                                        ?.business_name ||
                                        "Unknown"}
                                    </p>

                                    <p className="text-[11px] text-[#7C90AA]">
                                      {business
                                        ?.category ||
                                        "Business"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Participant */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {getParticipantType(
                                    deal,
                                  ) ===
                                  "Business" ? (
                                    <Building2 className="size-4 text-[#668DBE]" />
                                  ) : (
                                    <User className="size-4 text-[#668DBE]" />
                                  )}

                                  <div>
                                    <p className="max-w-[120px] truncate text-sm font-semibold text-[#10182D]">
                                      {getParticipantName(
                                        deal,
                                      )}
                                    </p>

                                    <p className="text-[11px] text-[#7C90AA]">
                                      {
                                        getParticipantType(
                                          deal,
                                        )
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Budget */}
                              <td className="px-4 py-4">
                                <p className="whitespace-nowrap text-sm font-semibold text-[#174A91]">
                                  {formatBudget(
                                    Number(
                                      deal.budget,
                                    ),
                                    deal.currency,
                                  )}
                                </p>

                                <p className="text-[11px] text-[#7C90AA]">
                                  {
                                    deal.currency
                                  }
                                </p>
                              </td>

                              {/* Start */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="size-4 text-[#668DBE]" />

                                  <span className="whitespace-nowrap text-xs font-medium text-[#38516F]">
                                    {formatDate(
                                      deal.start_date,
                                    )}
                                  </span>
                                </div>
                              </td>

                              {/* End */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="size-4 text-[#668DBE]" />

                                  <span className="whitespace-nowrap text-xs font-medium text-[#38516F]">
                                    {formatDate(
                                      deal.end_date,
                                    )}
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-4">
                                <span
                                  className={`
                                    inline-flex
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    ${getStatusClasses(
                                      deal.status,
                                    )}
                                  `}
                                >
                                  {getStatusLabel(
                                    deal.status,
                                  )}
                                </span>
                              </td>

                              {/* Action */}
                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleView(
                                      deal,
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-[#8DB8FF]
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-[#2875F5]
                                    transition
                                    hover:border-[#2875F5]
                                    hover:bg-[#F3F7FF]
                                  "
                                >
                                  <Eye className="size-3.5" />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EDF7] px-4 py-3">
                  <p className="text-xs text-[#617493]">
                    Showing{" "}
                    <span className="font-semibold text-[#174A91]">
                      {firstItem}–
                      {lastItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#174A91]">
                      {
                        filteredDeals.length
                      }
                    </span>{" "}
                    deals
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={() =>
                        setPage(
                          (previous) =>
                            Math.max(
                              1,
                              previous - 1,
                            ),
                        )
                      }
                      className="
                        flex
                        size-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#D6E2F2]
                        bg-white
                        text-[#617493]
                        hover:bg-[#F3F7FF]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#2875F5] text-xs font-bold text-white">
                      {currentPage}
                    </div>

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setPage(
                          (previous) =>
                            Math.min(
                              totalPages,
                              previous + 1,
                            ),
                        )
                      }
                      className="
                        flex
                        size-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#D6E2F2]
                        bg-white
                        text-[#617493]
                        hover:bg-[#F3F7FF]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Details Panel (Desktop) */}
          {selectedDeal && (
            <aside className="hidden w-[370px] shrink-0 overflow-hidden rounded-xl border border-[#D6E2F2] bg-white shadow-sm lg:block">
              <div className="flex max-h-[calc(100vh-120px)] flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#E5EDF7] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#E8F0FF] text-[#2875F5]">
                      <FileText className="size-4" />
                    </div>

                    <h2 className="text-base font-bold text-[#174A91]">
                      Deal Details
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeDetails
                    }
                    className="text-[#668DBE] hover:text-[#10182D]"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="overflow-y-auto">
                  {/* Summary */}
                  <div className="mx-4 mt-4 rounded-xl bg-[#EEF6FF] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#DCEAFF] text-[#2875F5]">
                          <Building2 className="size-5" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-[#174A91]">
                            {
                              selectedDeal.title
                            }
                          </h3>

                          <p className="mt-1 text-xs text-[#7C90AA]">
                            {
                              businesses[
                                selectedDeal
                                  .business_id
                              ]
                                ?.business_name ||
                              "Unknown Business"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          ${getStatusClasses(
                            selectedDeal.status,
                          )}
                        `}
                      >
                        {getStatusLabel(
                          selectedDeal.status,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Deal Information */}
                  <section className="px-5 py-4">
                    <h3 className="text-sm font-bold text-[#174A91]">
                      Deal Information
                    </h3>

                    <div className="mt-3 space-y-3">
                      <DetailRow
                        label="Title"
                        value={
                          selectedDeal.title
                        }
                      />

                      <DetailRow
                        label="Business"
                        value={
                          businesses[
                            selectedDeal
                              .business_id
                          ]
                            ?.business_name ||
                          "Unknown"
                        }
                      />

                      <DetailRow
                        label="Participant"
                        value={`${getParticipantName(
                          selectedDeal,
                        )} (${getParticipantType(
                          selectedDeal,
                        )})`}
                      />

                      <DetailRow
                        label="Budget"
                        value={formatBudget(
                          Number(
                            selectedDeal.budget,
                          ),
                          selectedDeal.currency,
                        )}
                      />

                      <DetailRow
                        label="Currency"
                        value={
                          selectedDeal.currency
                        }
                      />

                      <DetailRow
                        label="Start Date"
                        value={formatDate(
                          selectedDeal.start_date,
                        )}
                      />

                      <DetailRow
                        label="End Date"
                        value={formatDate(
                          selectedDeal.end_date,
                        )}
                      />

                      <DetailRow
                        label="Created"
                        value={formatDateTime(
                          selectedDeal.created_at,
                        )}
                      />
                    </div>
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Description */}
                  <section className="px-5 py-4">
                    <h3 className="text-sm font-bold text-[#174A91]">
                      Description
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                      {selectedDeal.description ||
                        "No description provided."}
                    </p>
                  </section>

                  {/* Cancellation */}
                  {selectedDeal.status ===
                    "cancelled" && (
                    <>
                      <div className="mx-5 border-t border-[#E5EDF7]" />

                      <section className="px-5 py-4">
                        <h3 className="text-sm font-bold text-[#EF4444]">
                          Cancellation
                        </h3>

                        <div className="mt-3 space-y-2.5">
                          {selectedDeal.cancelled_at && (
                            <DetailRow
                              label="Cancelled"
                              value={formatDateTime(
                                selectedDeal.cancelled_at,
                              )}
                            />
                          )}

                          <div>
                            <p className="text-xs text-[#668DBE]">
                              Reason
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#38516F]">
                              {selectedDeal.cancellation_reason ||
                                "No reason provided."}
                            </p>
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                  {/* Messages */}
                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  <section className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-[#2875F5]" />

                      <h3 className="text-sm font-bold text-[#174A91]">
                        Messages
                      </h3>

                      <span className="ml-auto rounded-full bg-[#E8F0FF] px-2 py-0.5 text-[10px] font-semibold text-[#2875F5]">
                        {messages.length}
                      </span>
                    </div>

                    {loadingMessages ? (
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#617493]">
                        <Loader2 className="size-4 animate-spin text-[#2875F5]" />
                        Loading messages...
                      </div>
                    ) : messages.length ===
                      0 ? (
                      <p className="mt-3 text-xs text-[#7C90AA]">
                        No messages in this
                        deal.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                        {messages.map(
                          (message) => {
                            const sender =
                              profiles[
                                message
                                  .sender_id
                              ]?.username ||
                              "User";

                            return (
                              <div
                                key={
                                  message.id
                                }
                                className="rounded-xl border border-[#DCE8F5] bg-[#F8FBFF] p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-[#174A91]">
                                    {sender}
                                  </p>

                                  <p className="text-[10px] text-[#8FA2BC]">
                                    {formatDateTime(
                                      message.created_at,
                                    )}
                                  </p>
                                </div>

                                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                                  {
                                    message.message
                                  }
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </section>

                  {/* Attachments */}
                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  <section className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Paperclip className="size-4 text-[#2875F5]" />

                      <h3 className="text-sm font-bold text-[#174A91]">
                        Attachments
                      </h3>

                      <span className="ml-auto rounded-full bg-[#E8F0FF] px-2 py-0.5 text-[10px] font-semibold text-[#2875F5]">
                        {
                          attachments.length
                        }
                      </span>
                    </div>

                    {loadingAttachments ? (
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#617493]">
                        <Loader2 className="size-4 animate-spin text-[#2875F5]" />
                        Loading attachments...
                      </div>
                    ) : attachments.length ===
                      0 ? (
                      <p className="mt-3 text-xs text-[#7C90AA]">
                        No attachments.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {attachments.map(
                          (attachment) => (
                            <button
                              key={
                                attachment.id
                              }
                              type="button"
                              onClick={() =>
                                handleAttachment(
                                  attachment,
                                )
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-lg
                                border
                                border-[#D6E2F2]
                                bg-white
                                px-3
                                py-2.5
                                text-left
                                transition
                                hover:border-[#8DB8FF]
                                hover:bg-[#F7FAFF]
                              "
                            >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FF] text-[#2875F5]">
                                <FileText className="size-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-[#10182D]">
                                  {
                                    attachment.file_name
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#7C90AA]">
                                  {formatFileSize(
                                    attachment.file_size,
                                  )}
                                </p>
                              </div>

                              <Download className="size-4 text-[#2875F5]" />
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Footer note */}
                  <div className="m-5 rounded-xl border border-[#CDE2FF] bg-[#EEF6FF] px-4 py-3">
                    <p className="text-xs leading-5 text-[#38516F]">
                      Admin view is read-only.
                      Deal participants continue
                      to manage messages,
                      attachments, completion and
                      cancellation from the normal
                      Deal workspace.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Details (Bottom Sheet Modal) */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5EDF7] bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-[#174A91]">
                  Deal Details
                </h2>

                <p className="mt-0.5 text-xs text-[#7C90AA]">
                  {
                    selectedDeal.title
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="text-[#668DBE]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-[#EEF6FF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#174A91]">
                      {
                        selectedDeal.title
                      }
                    </h3>

                    <p className="mt-1 text-xs text-[#7C90AA]">
                      {
                        businesses[
                          selectedDeal
                            .business_id
                        ]
                          ?.business_name ||
                        "Unknown Business"
                      }
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedDeal.status,
                    )}`}
                  >
                    {getStatusLabel(
                      selectedDeal.status,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <DetailRow
                  label="Participant"
                  value={`${getParticipantName(
                    selectedDeal,
                  )} (${getParticipantType(
                    selectedDeal,
                  )})`}
                />

                <DetailRow
                  label="Budget"
                  value={formatBudget(
                    Number(
                      selectedDeal.budget,
                    ),
                    selectedDeal.currency,
                  )}
                />

                <DetailRow
                  label="Start Date"
                  value={formatDate(
                    selectedDeal.start_date,
                  )}
                />

                <DetailRow
                  label="End Date"
                  value={formatDate(
                    selectedDeal.end_date,
                  )}
                />

                <div>
                  <p className="text-xs font-semibold text-[#668DBE]">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#38516F]">
                    {selectedDeal.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#D6E2F2] bg-[#F8FBFF] p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-[#2875F5]" />

                  <h3 className="text-sm font-bold text-[#174A91]">
                    Messages
                  </h3>
                </div>

                {messages.length ===
                0 ? (
                  <p className="mt-3 text-xs text-[#7C90AA]">
                    No messages.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {messages.map(
                      (message) => (
                        <div
                          key={
                            message.id
                          }
                          className="rounded-lg border border-[#DCE8F5] bg-white p-3"
                        >
                          <p className="text-xs font-bold text-[#174A91]">
                            {profiles[
                              message
                                .sender_id
                            ]?.username ||
                              "User"}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                            {
                              message.message
                            }
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-[#D6E2F2] bg-[#F8FBFF] p-4">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-4 text-[#2875F5]" />

                  <h3 className="text-sm font-bold text-[#174A91]">
                    Attachments
                  </h3>
                </div>

                {attachments.length ===
                0 ? (
                  <p className="mt-3 text-xs text-[#7C90AA]">
                    No attachments.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {attachments.map(
                      (attachment) => (
                        <button
                          key={
                            attachment.id
                          }
                          type="button"
                          onClick={() =>
                            handleAttachment(
                              attachment,
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-lg border border-[#D6E2F2] bg-white p-3 text-left"
                        >
                          <FileText className="size-4 text-[#2875F5]" />

                          <span className="flex-1 truncate text-xs font-medium text-[#10182D]">
                            {
                              attachment.file_name
                            }
                          </span>

                          <Download className="size-4 text-[#2875F5]" />
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="mt-5 w-full rounded-lg border border-[#D6E2F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#617493] hover:bg-[#F3F7FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <span className="text-xs text-[#668DBE]">
        {label}
      </span>

      <span className="text-xs font-medium leading-5 text-[#38516F]">
        {value}
      </span>
    </div>
  );
}