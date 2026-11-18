import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminNavigation from "../components/AdminNavigation";
import { supabase } from "../lib/supabase";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type Proposal = {
  id: string;
  business_id: string;
  sender_id: string;
  recipient_id: string;
  recipient_type: string;
  review_id: string | null;
  title: string;
  message: string;
  requirements: string | null;
  deliverables: string | null;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: string;
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

type Review = {
  id: string;
  title: string | null;
};

type ProposalAttachment = {
  id: string;
  proposal_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

const ITEMS_PER_PAGE = 7;

const STATUS_OPTIONS = [
  "pending",
  "accepted",
  "declined",
  "withdrawn",
];

export default function AdminProposals() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [businesses, setBusinesses] = useState<
    Record<string, BusinessProfile>
  >({});
  const [profiles, setProfiles] = useState<
    Record<string, Profile>
  >({});
  const [reviews, setReviews] = useState<
    Record<string, Review>
  >({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedProposal, setSelectedProposal] =
    useState<Proposal | null>(null);

  const [selectedAttachments, setSelectedAttachments] =
    useState<ProposalAttachment[]>([]);

  const [loadingAttachments, setLoadingAttachments] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [deleteProposal, setDeleteProposal] =
    useState<Proposal | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
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
      const { data: adminProfile, error: adminError } =
        await supabase
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

      // Load proposals
      const { data: proposalData, error: proposalError } =
        await supabase
          .from("proposals")
          .select(
            `
              id,
              business_id,
              sender_id,
              recipient_id,
              recipient_type,
              review_id,
              title,
              message,
              requirements,
              deliverables,
              budget,
              currency,
              start_date,
              end_date,
              status,
              created_at,
              updated_at
            `,
          )
          .order("created_at", {
            ascending: false,
          });

      if (proposalError) {
        throw proposalError;
      }

      const proposalList =
        (proposalData as Proposal[]) || [];

      setProposals(proposalList);

      // Business IDs
      const businessIds = [
        ...new Set(
          proposalList.map(
            (proposal) => proposal.business_id,
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

        (businessData as BusinessProfile[] | null)?.forEach(
          (business) => {
            businessMap[business.id] = business;
          },
        );

        setBusinesses(businessMap);
      } else {
        setBusinesses({});
      }

      // Profile IDs
      const profileIds = [
        ...new Set(
          proposalList.flatMap((proposal) => [
            proposal.sender_id,
            proposal.recipient_id,
          ]),
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

        (profileData as Profile[] | null)?.forEach(
          (profile) => {
            profileMap[profile.id] = profile;
          },
        );

        setProfiles(profileMap);
      } else {
        setProfiles({});
      }

      // Related reviews
      const reviewIds = [
        ...new Set(
          proposalList
            .map((proposal) => proposal.review_id)
            .filter(
              (id): id is string => Boolean(id),
            ),
        ),
      ];

      if (reviewIds.length > 0) {
        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("reviews")
          .select("id, title")
          .in("id", reviewIds);

        if (reviewError) {
          throw reviewError;
        }

        const reviewMap: Record<
          string,
          Review
        > = {};

        (reviewData as Review[] | null)?.forEach(
          (review) => {
            reviewMap[review.id] = review;
          },
        );

        setReviews(reviewMap);
      } else {
        setReviews({});
      }
    } catch (error) {
      console.error(
        "Error loading proposals:",
        error,
      );

      setErrorMessage(
        "Unable to load proposals. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProposals();
  };

  const getRecipientName = (
    proposal: Proposal,
  ) => {
    if (
      proposal.recipient_type === "business"
    ) {
      const recipientBusiness =
        Object.values(businesses).find(
          (business) =>
            business.user_id ===
            proposal.recipient_id,
        );

      return (
        recipientBusiness?.business_name ||
        profiles[proposal.recipient_id]
          ?.username ||
        "Business"
      );
    }

    return (
      profiles[proposal.recipient_id]
        ?.username || "Unknown User"
    );
  };

  const getSenderName = (
    proposal: Proposal,
  ) => {
    const business =
      businesses[proposal.business_id];

    if (business) {
      return business.business_name;
    }

    return (
      profiles[proposal.sender_id]
        ?.username || "Unknown"
    );
  };

  const filteredProposals = useMemo(() => {
    const value = search.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const business =
        businesses[proposal.business_id];

      const sender = getSenderName(proposal);

      const recipient =
        getRecipientName(proposal);

      const matchesSearch =
        !value ||
        proposal.title
          .toLowerCase()
          .includes(value) ||
        business?.business_name
          ?.toLowerCase()
          .includes(value) ||
        sender
          .toLowerCase()
          .includes(value) ||
        recipient
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        proposal.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    proposals,
    businesses,
    profiles,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProposals.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedProposals = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredProposals.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [
    filteredProposals,
    currentPage,
  ]);

  const firstItem =
    filteredProposals.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const lastItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredProposals.length,
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
      return `${currency || "INR"} ${budget.toLocaleString(
        "en-IN",
      )}`;
    }
  };

  const getStatusClasses = (
    status: string,
  ) => {
    switch (status) {
      case "pending":
        return "bg-[#FFF4D6] text-[#D88A00]";

      case "accepted":
        return "bg-[#DCFCE7] text-[#16A34A]";

      case "declined":
        return "bg-[#FEE2E2] text-[#EF4444]";

      case "withdrawn":
        return "bg-[#EAF0F7] text-[#617493]";

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

  const loadProposalAttachments = async (
    proposalId: string,
  ) => {
    try {
      setLoadingAttachments(true);

      const {
        data,
        error,
      } = await supabase
        .from("proposal_attachments")
        .select(
          `
            id,
            proposal_id,
            uploaded_by,
            file_name,
            file_path,
            file_type,
            file_size,
            created_at
          `,
        )
        .eq(
          "proposal_id",
          proposalId,
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setSelectedAttachments(
        (data as ProposalAttachment[]) ||
          [],
      );
    } catch (error) {
      console.error(
        "Error loading proposal attachments:",
        error,
      );

      setSelectedAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleView = async (
    proposal: Proposal,
  ) => {
    setSelectedProposal(proposal);
    setSelectedAttachments([]);

    await loadProposalAttachments(
      proposal.id,
    );
  };

  const closeDetails = () => {
    setSelectedProposal(null);
    setSelectedAttachments([]);
  };

  const handleAttachment = async (
    attachment: ProposalAttachment,
  ) => {
    try {
      // Try proposal-assets first, fallback or handle business-assets if needed
      let { data, error } =
        await supabase.storage
          .from("proposal-assets")
          .createSignedUrl(
            attachment.file_path,
            60 * 10,
          );

      if (error || !data?.signedUrl) {
        const { data: altData, error: altErr } = await supabase.storage
          .from("business-assets")
          .createSignedUrl(
            attachment.file_path,
            60 * 10,
          );
        if (!altErr && altData?.signedUrl) {
          data = altData;
          error = null;
        }
      }

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
        "Error opening attachment:",
        error,
      );

      setErrorMessage(
        "Unable to open this attachment.",
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteProposal) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    try {
      const {
        data: existingDeal,
        error: dealError,
      } = await supabase
        .from("deals")
        .select("id")
        .eq(
          "proposal_id",
          deleteProposal.id,
        )
        .maybeSingle();

      if (dealError) {
        throw dealError;
      }

      if (existingDeal) {
        throw new Error(
          "This proposal is linked to a deal and cannot be deleted.",
        );
      }

      const {
        data: attachmentData,
        error: attachmentError,
      } = await supabase
        .from("proposal_attachments")
        .select("file_path")
        .eq(
          "proposal_id",
          deleteProposal.id,
        );

      if (attachmentError) {
        throw attachmentError;
      }

      const attachmentPaths =
        (attachmentData || [])
          .map(
            (attachment) =>
              attachment.file_path,
          )
          .filter(Boolean);

      if (
        attachmentPaths.length > 0
      ) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("proposal-assets")
          .remove(
            attachmentPaths,
          );

        if (storageError) {
          console.error(
            "Storage delete error:",
            storageError,
          );
        }
      }

      const {
        error:
          attachmentDeleteError,
      } = await supabase
        .from("proposal_attachments")
        .delete()
        .eq(
          "proposal_id",
          deleteProposal.id,
        );

      if (attachmentDeleteError) {
        throw attachmentDeleteError;
      }

      const {
        error: proposalDeleteError,
      } = await supabase
        .from("proposals")
        .delete()
        .eq(
          "id",
          deleteProposal.id,
        );

      if (proposalDeleteError) {
        throw proposalDeleteError;
      }

      setProposals((previous) =>
        previous.filter(
          (proposal) =>
            proposal.id !==
            deleteProposal.id,
        ),
      );

      if (
        selectedProposal?.id ===
        deleteProposal.id
      ) {
        closeDetails();
      }

      setDeleteProposal(null);

      if (
        paginatedProposals.length === 1 &&
        currentPage > 1
      ) {
        setPage((previous) =>
          Math.max(
            1,
            previous - 1,
          ),
        );
      }
    } catch (error: any) {
      console.error(
        "Error deleting proposal:",
        error,
      );

      setErrorMessage(
        error?.message ||
          "Unable to delete this proposal.",
      );
    } finally {
      setDeleting(false);
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
            Proposal Management
          </h1>

          <p className="mt-1 text-xs text-[#617493] sm:text-sm">
            Monitor and manage all business
            proposals from one place.
          </p>
        </div>

        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Search */}
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
                placeholder="Search proposals by title, business, sender or recipient..."
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
                  className={`size-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
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
              className="text-red-500 hover:text-red-700"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="mt-4 flex items-start gap-4">
          {/* Proposal Table */}
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
                selectedProposal
                  ? "lg:max-w-[calc(100%-390px)]"
                  : ""
              }
            `}
          >
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center sm:min-h-[500px]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#617493]">
                  <Loader2 className="size-5 animate-spin text-[#2875F5]" />
                  Loading proposals...
                </div>
              </div>
            ) : filteredProposals.length ===
              0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center sm:min-h-[500px]">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2875F5]">
                  <FileText className="size-6" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-[#10182D]">
                  No proposals found
                </h2>

                <p className="mt-1 text-sm text-[#617493]">
                  Try changing your search
                  or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-[#EAF3FF] text-left">
                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Proposal
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Business
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Sender
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Recipient
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Budget
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Status
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Date
                        </th>

                        <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProposals.map(
                        (proposal) => {
                          const business =
                            businesses[
                              proposal
                                .business_id
                            ];

                          return (
                            <tr
                              key={
                                proposal.id
                              }
                              className="
                                border-b
                                border-[#E5EDF7]
                                last:border-b-0
                                hover:bg-[#FAFCFF]
                              "
                            >
                              {/* Proposal */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2875F5]">
                                    <FileText className="size-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[150px] truncate text-sm font-bold text-[#174A91]">
                                      {
                                        proposal.title
                                      }
                                    </p>

                                    <p className="mt-1 max-w-[150px] text-xs leading-4 text-[#7C90AA]">
                                      {proposal.message.slice(
                                        0,
                                        55,
                                      )}
                                      {proposal.message.length >
                                      55
                                        ? "..."
                                        : ""}
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

                              {/* Sender */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Building2 className="size-4 text-[#668DBE]" />

                                  <div>
                                    <p className="text-sm font-semibold text-[#10182D]">
                                      {getSenderName(
                                        proposal,
                                      )}
                                    </p>

                                    <p className="text-[11px] text-[#7C90AA]">
                                      Business
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Recipient */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <User className="size-4 text-[#668DBE]" />

                                  <div>
                                    <p className="max-w-[110px] truncate text-sm font-semibold text-[#10182D]">
                                      {getRecipientName(
                                        proposal,
                                      )}
                                    </p>

                                    <p className="text-[11px] text-[#7C90AA]">
                                      {proposal.recipient_type ===
                                      "business"
                                        ? "Business"
                                        : "User"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Budget */}
                              <td className="px-4 py-4">
                                <p className="whitespace-nowrap text-sm font-semibold text-[#174A91]">
                                  {formatBudget(
                                    Number(
                                      proposal.budget,
                                    ),
                                    proposal.currency,
                                  )}
                                </p>

                                <p className="mt-0.5 text-[11px] text-[#7C90AA]">
                                  {
                                    proposal.currency
                                  }
                                </p>
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
                                      proposal.status,
                                    )}
                                  `}
                                >
                                  {getStatusLabel(
                                    proposal.status,
                                  )}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="size-4 text-[#668DBE]" />

                                  <div>
                                    <p className="whitespace-nowrap text-xs font-medium text-[#10182D]">
                                      {formatDate(
                                        proposal.created_at,
                                      )}
                                    </p>

                                    <p className="text-[11px] text-[#7C90AA]">
                                      {Math.max(
                                        0,
                                        Math.floor(
                                          (Date.now() -
                                            new Date(
                                              proposal.created_at,
                                            ).getTime()) /
                                            86400000,
                                        ),
                                      )}{" "}
                                      days ago
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleView(
                                        proposal,
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

                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/proposals/${proposal.id}`)
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      gap-1
                                      rounded-lg
                                      border
                                      border-[#D6E2F2]
                                      bg-white
                                      px-2.5
                                      py-1.5
                                      text-xs
                                      font-semibold
                                      text-[#174A91]
                                      transition
                                      hover:border-[#2875F5]
                                      hover:bg-[#F3F7FF]
                                    "
                                    title="Open Full Details Page"
                                  >
                                    <ArrowRight className="size-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteProposal(
                                        proposal,
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      border-red-300
                                      bg-white
                                      p-1.5
                                      text-red-500
                                      transition
                                      hover:bg-red-50
                                    "
                                    title="Delete"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
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
                        filteredProposals.length
                      }
                    </span>{" "}
                    proposals
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

          {/* Proposal Details (Desktop) */}
          {selectedProposal && (
            <aside className="hidden w-[370px] shrink-0 overflow-hidden rounded-xl border border-[#D6E2F2] bg-white shadow-sm lg:block">
              <div className="flex max-h-[calc(100vh-120px)] flex-col">
                {/* Details Header */}
                <div className="flex items-center justify-between border-b border-[#E5EDF7] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#E8F0FF] text-[#2875F5]">
                      <FileText className="size-4" />
                    </div>

                    <h2 className="text-base font-bold text-[#174A91]">
                      Proposal Details
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeDetails
                    }
                    className="text-[#668DBE] transition hover:text-[#10182D]"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="overflow-y-auto">
                  {/* Proposal Summary */}
                  <div className="mx-4 mt-4 rounded-xl bg-[#EEF6FF] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#DCEAFF] text-[#2875F5]">
                          <FileText className="size-5" />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-[#174A91]">
                            {
                              selectedProposal.title
                            }
                          </h3>

                          <p className="mt-1 text-xs text-[#7C90AA]">
                            {selectedProposal
                              .message
                              .slice(
                                0,
                                50,
                              )}
                            {selectedProposal
                              .message
                              .length >
                            50
                              ? "..."
                              : ""}
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
                            selectedProposal.status,
                          )}
                        `}
                      >
                        {getStatusLabel(
                          selectedProposal.status,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Proposal Information */}
                  <section className="px-5 py-4">
                    <h3 className="text-sm font-bold text-[#174A91]">
                      Proposal Information
                    </h3>

                    <div className="mt-3 space-y-2.5">
                      <DetailRow
                        label="Title"
                        value={
                          selectedProposal.title
                        }
                      />

                      <DetailRow
                        label="Business"
                        value={
                          businesses[
                            selectedProposal
                              .business_id
                          ]?.business_name ||
                          "Unknown"
                        }
                      />

                      <DetailRow
                        label="Sender"
                        value={`${getSenderName(
                          selectedProposal,
                        )} (Business)`}
                      />

                      <DetailRow
                        label="Recipient"
                        value={`${getRecipientName(
                          selectedProposal,
                        )} (${
                          selectedProposal.recipient_type ===
                          "business"
                            ? "Business"
                            : "User"
                        })`}
                      />

                      <DetailRow
                        label="Related Review"
                        value={
                          selectedProposal.review_id
                            ? reviews[
                                selectedProposal
                                  .review_id
                              ]?.title ||
                              "Linked Review"
                            : "Not linked"
                        }
                      />

                      <div className="grid grid-cols-[90px_1fr] gap-3">
                        <span className="text-xs text-[#668DBE]">
                          Message
                        </span>

                        <p className="whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                          {
                            selectedProposal.message
                          }
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Requirements */}
                  <section className="px-5 py-4">
                    <h3 className="text-sm font-bold text-[#174A91]">
                      Requirements &
                      Deliverables
                    </h3>

                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-[90px_1fr] gap-3">
                        <span className="text-xs text-[#668DBE]">
                          Requirements
                        </span>

                        <p className="whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                          {selectedProposal
                            .requirements ||
                            "No requirements provided."}
                        </p>
                      </div>

                      <div className="grid grid-cols-[90px_1fr] gap-3">
                        <span className="text-xs text-[#668DBE]">
                          Deliverables
                        </span>

                        <p className="whitespace-pre-wrap text-xs leading-5 text-[#38516F]">
                          {selectedProposal
                            .deliverables ||
                            "No deliverables provided."}
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Budget & Timeline */}
                  <section className="px-5 py-4">
                    <h3 className="text-sm font-bold text-[#174A91]">
                      Budget & Timeline
                    </h3>

                    <div className="mt-3 space-y-2.5">
                      <DetailRow
                        label="Budget"
                        value={formatBudget(
                          Number(
                            selectedProposal.budget,
                          ),
                          selectedProposal.currency,
                        )}
                      />

                      <DetailRow
                        label="Currency"
                        value={
                          selectedProposal.currency
                        }
                      />

                      <DetailRow
                        label="Start Date"
                        value={formatDate(
                          selectedProposal.start_date,
                        )}
                      />

                      <DetailRow
                        label="End Date"
                        value={formatDate(
                          selectedProposal.end_date,
                        )}
                      />
                    </div>
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Attachments */}
                  <section className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Paperclip className="size-4 text-[#2875F5]" />

                      <h3 className="text-sm font-bold text-[#174A91]">
                        Attachments
                      </h3>
                    </div>

                    {loadingAttachments ? (
                      <div className="mt-4 flex items-center gap-2 text-xs text-[#617493]">
                        <Loader2 className="size-4 animate-spin text-[#2875F5]" />
                        Loading attachments...
                      </div>
                    ) : selectedAttachments.length ===
                      0 ? (
                      <p className="mt-3 text-xs text-[#7C90AA]">
                        No attachments.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {selectedAttachments.map(
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

                              <Download className="size-4 shrink-0 text-[#2875F5]" />
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  <div className="mx-5 border-t border-[#E5EDF7]" />

                  {/* Created Date */}
                  <section className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-[#668DBE]" />

                      <span className="text-xs font-semibold text-[#668DBE]">
                        Created Date
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-medium text-[#38516F]">
                      {formatDateTime(
                        selectedProposal.created_at,
                      )}
                    </p>
                  </section>

                  {/* Bottom Actions */}
                  <div className="sticky bottom-0 border-t border-[#E5EDF7] bg-white p-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/proposals/${selectedProposal.id}`)
                        }
                        className="
                          inline-flex
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          bg-[#2875F5]
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          shadow-sm
                          hover:bg-[#155DCC]
                        "
                      >
                        <Eye className="size-4" />
                        Full Details
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteProposal(
                            selectedProposal,
                          )
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-red-300
                          bg-white
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-red-500
                          hover:bg-red-50
                        "
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteProposal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#D6E2F2] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="size-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#10182D]">
                  Delete Proposal?
                </h2>

                <p className="mt-1 text-sm leading-5 text-[#617493]">
                  This will remove the proposal
                  and its private attachments.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteProposal(
                    null,
                  )
                }
                disabled={deleting}
                className="text-[#8FA2BC] hover:text-[#10182D]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#E5EDF7] bg-[#F8FBFF] px-4 py-3">
              <p className="text-sm font-semibold text-[#10182D]">
                {deleteProposal.title}
              </p>

              <p className="mt-1 text-xs text-[#617493]">
                {businesses[
                  deleteProposal
                    .business_id
                ]?.business_name ||
                  "Unknown Business"}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteProposal(
                    null,
                  )
                }
                disabled={deleting}
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#617493]
                  hover:bg-[#F3F7FF]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-red-600
                  disabled:opacity-60
                "
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete
                  </>
                )}
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

function formatFileSize(
  bytes: number,
) {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}