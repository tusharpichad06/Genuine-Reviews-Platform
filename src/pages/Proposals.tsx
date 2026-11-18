import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Handshake,
  Inbox,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProposalCard, {
  type ProposalCardData,
  type ProposalDirection,
} from "../components/proposals/ProposalCard";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

type StatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn";

type DirectionFilter =
  | "all"
  | "received"
  | "sent";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type BusinessRow = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
};

type ProposalRow = {
  id: string;
  business_id: string;
  sender_id: string;
  recipient_id: string;
  recipient_type: "user" | "business";
  review_id: string | null;
  title: string;
  message: string;
  requirements: string | null;
  deliverables: string | null;
  budget: number | string;
  currency: string;
  start_date: string;
  end_date: string;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "withdrawn";
  created_at: string;
  updated_at: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitial(name: string) {
  return (
    name.trim().charAt(0).toUpperCase() || "B"
  );
}

function Proposals() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(
    null
  );

  const [proposals, setProposals] = useState<
    ProposalCardData[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [hasBusinessProfile, setHasBusinessProfile] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProposals() {
      try {
        setLoading(true);
        setError("");

        const {
          data: {
            user,
          },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          if (!cancelled) {
            navigate("/auth?mode=login", {
              replace: true,
            });
          }

          return;
        }

        if (cancelled) return;

        setUserId(user.id);

        /*
         * -------------------------------------------------------
         * CHECK BUSINESS PROFILE
         * -------------------------------------------------------
         */

        const {
          data: businessProfile,
          error: businessError,
        } = await supabase
          .from("business_profiles")
          .select(
            "id, user_id, business_name, logo_url"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (businessError) {
          throw businessError;
        }

        if (!cancelled) {
          setHasBusinessProfile(
            Boolean(businessProfile)
          );
        }

        /*
         * -------------------------------------------------------
         * LOAD PROPOSALS
         * -------------------------------------------------------
         */

        const {
          data: proposalRows,
          error: proposalError,
        } = await supabase
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
            `
          )
          .or(
            `sender_id.eq.${user.id},recipient_id.eq.${user.id}`
          )
          .order("created_at", {
            ascending: false,
          });

        if (proposalError) {
          throw proposalError;
        }

        const rows =
          (proposalRows ?? []) as ProposalRow[];

        if (rows.length === 0) {
          if (!cancelled) {
            setProposals([]);
          }

          return;
        }

        /*
         * -------------------------------------------------------
         * LOAD BUSINESS DATA
         * -------------------------------------------------------
         */

        const businessIds = Array.from(
          new Set(
            rows.map(
              (proposal) => proposal.business_id
            )
          )
        );

        const senderUserIds = Array.from(
          new Set(rows.map((proposal) => proposal.sender_id))
        );

        const recipientUserIds = Array.from(
          new Set(rows.map((proposal) => proposal.recipient_id))
        );

        const allUserIdsForBiz = Array.from(
          new Set([...senderUserIds, ...recipientUserIds])
        );

        const {
          data: businessRows,
          error: businessesError,
        } = await supabase
          .from("business_profiles")
          .select(
            "id, user_id, business_name, logo_url"
          )
          .or(
            `id.in.(${businessIds.length > 0 ? businessIds.join(",") : "''"}),user_id.in.(${allUserIdsForBiz.length > 0 ? allUserIdsForBiz.join(",") : "''"})`
          );

        if (businessesError) {
          throw businessesError;
        }

        const businessMap = new Map<
          string,
          BusinessRow
        >();

        const userBusinessMap = new Map<
          string,
          BusinessRow
        >();

        (
          (businessRows ?? []) as BusinessRow[]
        ).forEach((business) => {
          businessMap.set(business.id, business);
          if (business.user_id) {
            userBusinessMap.set(business.user_id, business);
          }
        });

        /*
         * -------------------------------------------------------
         * LOAD USER PROFILE DATA
         * -------------------------------------------------------
         */

        const profileIds = Array.from(
          new Set(
            rows.flatMap((proposal) => [
              proposal.sender_id,
              proposal.recipient_id,
            ])
          )
        );

        const {
          data: profileRows,
          error: profilesError,
        } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", profileIds);

        if (profilesError) {
          throw profilesError;
        }

        const profileMap = new Map<
          string,
          ProfileRow
        >();

        (
          (profileRows ?? []) as ProfileRow[]
        ).forEach((profile) => {
          profileMap.set(profile.id, profile);
        });

        /*
         * -------------------------------------------------------
         * BUILD CARD DATA
         * -------------------------------------------------------
         */

        const mappedProposals: ProposalCardData[] =
          rows.map((proposal) => {
            const business = businessMap.get(
              proposal.business_id
            );

            const senderBusinessProfile = userBusinessMap.get(
              proposal.sender_id
            );

            const senderProfile =
              profileMap.get(proposal.sender_id);

            const recipientProfile =
              profileMap.get(
                proposal.recipient_id
              );

            const senderName =
              senderProfile?.username?.trim() ||
              "User";

            let recipientName =
              recipientProfile?.username?.trim() ||
              "User";

            let recipientLogoUrl = recipientProfile?.avatar_url || null;

            if (
              proposal.recipient_type ===
              "business"
            ) {
              const recipientBusiness = userBusinessMap.get(
                proposal.recipient_id
              );

              if (recipientBusiness) {
                recipientName =
                  recipientBusiness.business_name;
                recipientLogoUrl = recipientBusiness.logo_url;
              }
            }

            return {
              id: proposal.id,
              businessId: proposal.business_id,

              senderName,
              senderBusinessName:
                senderBusinessProfile?.business_name ||
                business?.business_name ||
                "Business",
              senderAvatarUrl: senderProfile?.avatar_url || null,
              senderLogoUrl: senderBusinessProfile?.logo_url || business?.logo_url || null,

              recipientId:
                proposal.recipient_id,

              recipientName,
              recipientLogoUrl,

              recipientType:
                proposal.recipient_type,

              title: proposal.title,
              message: proposal.message,

              requirements:
                proposal.requirements,

              deliverables:
                proposal.deliverables,

              budget: proposal.budget,
              currency: proposal.currency,

              startDate:
                proposal.start_date,

              endDate:
                proposal.end_date,

              status: proposal.status,

              createdAt:
                proposal.created_at,

              updatedAt:
                proposal.updated_at,
            };
          });

        if (!cancelled) {
          setProposals(mappedProposals);
        }
      } catch (err) {
        console.error(
          "PROPOSALS LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load your proposals. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProposals();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
   * ===========================================================
   * FILTER PROPOSALS
   * ===========================================================
   */

  const filteredProposals = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const direction: ProposalDirection =
        proposal.recipientId === userId
          ? "received"
          : "sent";

      if (
        directionFilter !== "all" &&
        direction !== directionFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "all" &&
        proposal.status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        proposal.title,
        proposal.message,
        proposal.senderName,
        proposal.senderBusinessName,
        proposal.recipientName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    proposals,
    userId,
    search,
    statusFilter,
    directionFilter,
  ]);

  /*
   * ===========================================================
   * WITHDRAW
   * ===========================================================
   */

  async function handleWithdraw(
    proposal: ProposalCardData
  ) {
    if (!userId) return;

    setActionLoading(proposal.id);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("proposals")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)
        .eq("sender_id", userId)
        .eq("status", "pending");

      if (updateError) {
        throw updateError;
      }

      /*
       * =========================================================
       * 89. WITHDRAW NOTIFICATION
       * =========================================================
       */
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: proposal.recipientId, // Recipient ko notification bhejne ke liye
          type: "proposal_withdrawn",
          message: `The proposal "${proposal.title}" has been withdrawn.`,
          reference_id: proposal.id,
          is_read: false,
        });

      if (notifError) {
        console.error("WITHDRAW NOTIFICATION ERROR:", notifError);
      }

      setProposals((current) =>
        current.map((item) =>
          item.id === proposal.id
            ? {
                ...item,
                status: "withdrawn",
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "WITHDRAW PROPOSAL ERROR:",
        err
      );

      setError(
        "Unable to withdraw this proposal."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * ===========================================================
   * ACCEPT
   * ===========================================================
   */

  async function handleAccept(
    proposal: ProposalCardData
  ) {
    if (!userId) return;

    setActionLoading(proposal.id);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("proposals")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)
        .eq("recipient_id", userId)
        .eq("status", "pending");

      if (updateError) {
        throw updateError;
      }

      setProposals((current) =>
        current.map((item) =>
          item.id === proposal.id
            ? {
                ...item,
                status: "accepted",
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "ACCEPT PROPOSAL ERROR:",
        err
      );

      setError(
        "Unable to accept this proposal."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * ===========================================================
   * DECLINE
   * ===========================================================
   */

  async function handleDecline(
    proposal: ProposalCardData
  ) {
    if (!userId) return;

    setActionLoading(proposal.id);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("proposals")
        .update({
          status: "declined",
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)
        .eq("recipient_id", userId)
        .eq("status", "pending");

      if (updateError) {
        throw updateError;
      }

      setProposals((current) =>
        current.map((item) =>
          item.id === proposal.id
            ? {
                ...item,
                status: "declined",
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "DECLINE PROPOSAL ERROR:",
        err
      );

      setError(
        "Unable to decline this proposal."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * ===========================================================
   * HERO ILLUSTRATION
   * ===========================================================
   */

  function ProposalIllustration() {
    return (
      <div className="relative hidden h-[320px] sm:h-[410px] w-full max-w-[620px] lg:block">
        <div className="absolute right-[-40px] sm:right-[-80px] top-[-30px] h-44 w-44 rounded-full bg-[#dff3ff]" />
        <div className="absolute bottom-[-30px] right-[-10px] h-40 w-40 rounded-full bg-[#e5f8ff]" />

        <div className="absolute left-[20px] sm:left-[45px] top-[115px] flex size-[90px] sm:size-[105px] items-center justify-center rounded-full border-4 border-white bg-[#4ba8ff] shadow-[0_12px_30px_rgba(40,117,245,0.25)]">
          <div className="flex flex-col items-center text-white">
            <Users className="size-10 sm:size-12" strokeWidth={1.7} />
          </div>
        </div>

        <div className="absolute right-[20px] sm:right-[45px] top-[125px] flex size-[95px] sm:size-[110px] items-center justify-center rounded-full border-4 border-white bg-[#28c995] shadow-[0_12px_30px_rgba(40,201,149,0.22)]">
          <Building2
            className="size-10 sm:size-12 text-white"
            strokeWidth={1.7}
          />
        </div>

        <div className="absolute left-[130px] sm:left-[205px] top-[35px] h-[280px] sm:h-[300px] w-[240px] sm:w-[270px] rotate-[7deg] rounded-2xl border border-[#d7e8fb] bg-white p-5 sm:p-6 shadow-[0_20px_50px_rgba(40,117,245,0.16)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-[#e4f1ff]">
              <Send className="size-5 sm:size-6 text-[#2875F5]" />
            </div>

            <div className="text-lg sm:text-xl font-extrabold text-[#123b7a]">
              Proposal
            </div>
          </div>

          <div className="mt-5 sm:mt-7 space-y-2.5 sm:space-y-3">
            <div className="h-3 w-28 sm:w-32 rounded-full bg-[#d9eaff]" />
            <div className="h-3 w-full rounded-full bg-[#e3effc]" />
            <div className="h-3 w-[88%] rounded-full bg-[#e3effc]" />
            <div className="h-3 w-[76%] rounded-full bg-[#e3effc]" />
            <div className="h-3 w-[62%] rounded-full bg-[#e3effc]" />
          </div>

          <div className="mt-4 sm:mt-6 rounded-xl border border-[#e0edfa] bg-[#f5faff] p-2.5 sm:p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-[#e7f1ff]">
                <Send className="size-3.5 sm:size-4 text-[#2875F5]" />
              </div>

              <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-[#e7f1ff]">
                <Inbox className="size-3.5 sm:size-4 text-[#2875F5]" />
              </div>

              <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-[#e7f1ff]">
                <Handshake className="size-3.5 sm:size-4 text-[#2875F5]" />
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-[#2875F5] text-xs sm:text-sm font-semibold text-white shadow-md">
            Let's Collaborate
            <span>→</span>
          </div>
        </div>

        <div className="absolute left-[110px] sm:left-[135px] top-[150px] sm:top-[160px] text-2xl sm:text-3xl font-bold text-[#2875F5]">
          ↗
        </div>

        <div className="absolute right-[115px] sm:right-[145px] top-[165px] sm:top-[175px] text-2xl sm:text-3xl font-bold text-[#13a77c]">
          ↗
        </div>

        <div className="absolute bottom-[20px] sm:bottom-[30px] left-[40px] sm:left-[90px] flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#d5c9ff] bg-white px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#6740d8] shadow-sm">
          <Handshake className="size-4 sm:size-5" />
          Grow Together
        </div>

        <div className="absolute bottom-[60px] sm:bottom-[75px] right-[-10px] sm:right-[0px] flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#d9caff] bg-white px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#6740d8] shadow-sm">
          <Users className="size-4 sm:size-5" />
          Build Partnerships
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff] text-[#10182D]">
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative">
          <div className="relative mx-auto w-full max-w-[1300px] px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cde7ff] bg-[#e6f5ff] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#2875F5]">
                <Users className="size-3.5 sm:size-4" />
                Collaboration &amp; Growth
              </div>

              <Link
                to="/deals"
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9e2fb] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#2875F5] shadow-sm transition hover:bg-white sm:text-sm"
              >
                <Handshake className="h-4 w-4" />
                Go to Deals
              </Link>
            </div>

            <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.95fr] lg:gap-8 mt-4">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#102d63] sm:text-5xl lg:text-[68px] lg:leading-[1.02]">
                  Proposals
                </h1>

                <p className="mt-3 text-lg font-medium text-[#4285dc] sm:text-2xl">
                  Connect, collaborate, and create new
                  opportunities.
                </p>

                <p className="mt-2.5 sm:mt-3 max-w-[570px] mx-auto lg:mx-0 text-xs sm:text-lg leading-6 sm:leading-7 text-[#4771a8]">
                  Send and receive proposals, work with
                  businesses and individuals, and grow your
                  network.
                </p>

                <div className="mt-6 sm:mt-7 flex max-w-[650px] mx-auto lg:mx-0 flex-col gap-2.5 sm:gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 sm:left-5 top-1/2 size-5 sm:size-6 -translate-y-1/2 text-[#2875F5]" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search proposals..."
                      className="
                        h-12 sm:h-14
                        w-full
                        rounded-xl
                        border
                        border-[#c9e2fa]
                        bg-white/90
                        pl-12 sm:pl-14
                        pr-4 sm:pr-5
                        text-xs sm:text-sm
                        text-[#10182D]
                        outline-none
                        shadow-[0_5px_20px_rgba(40,117,245,0.06)]
                        placeholder:text-[#6d9bd3]
                        focus:border-[#2875F5]
                        focus:ring-2
                        focus:ring-[#2875F5]/15
                      "
                    />
                  </div>

                  <div className="relative w-full sm:w-[155px]">
                    <select
                      value={directionFilter}
                      onChange={(event) =>
                        setDirectionFilter(
                          event.target
                            .value as DirectionFilter
                        )
                      }
                      className="
                        h-12 sm:h-14
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-[#c9e2fa]
                        bg-white/90
                        px-4 sm:px-5
                        pr-10 sm:pr-11
                        text-xs sm:text-sm
                        font-medium
                        text-[#244c82]
                        outline-none
                        shadow-[0_5px_20px_rgba(40,117,245,0.06)]
                        focus:border-[#2875F5]
                        focus:ring-2
                        focus:ring-[#2875F5]/15
                      "
                    >
                      <option value="all">
                        All
                      </option>
                      <option value="received">
                        Received
                      </option>
                      <option value="sent">
                        Sent
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3.5 sm:right-4 top-1/2 size-4 sm:size-5 -translate-y-1/2 text-[#2875F5]" />
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                  {(
                    [
                      ["all", "All"],
                      ["pending", "Pending"],
                      ["accepted", "Accepted"],
                      ["declined", "Declined"],
                      ["withdrawn", "Withdrawn"],
                    ] as const
                  ).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setStatusFilter(value)
                        }
                        className={`
                          rounded-full
                          px-4 sm:px-5
                          py-2 sm:py-2.5
                          text-xs sm:text-sm
                          font-semibold
                          transition
                          ${
                            statusFilter === value
                              ? "bg-[#2875F5] text-white shadow-md shadow-[#2875F5]/20"
                              : "border border-[#d2e7fb] bg-white/65 text-[#2875F5] hover:bg-white hover:shadow-sm"
                          }
                        `}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>

                {hasBusinessProfile && (
                  <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 text-xs sm:text-sm text-[#4771a8]">
                    <ShieldCheck className="size-4 text-[#16a34a]" />
                    Business profile active
                  </div>
                )}
              </div>

              <ProposalIllustration />
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[1300px] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-[#c9e2f8] bg-white/90 shadow-[0_8px_30px_rgba(40,117,245,0.06)] md:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-[#dbeafa] p-5 sm:p-7 md:border-r lg:border-b-0">
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#e4f2ff] text-[#2875F5]">
                <Send className="size-5 sm:size-6" />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#103b8c]">
                Send Proposals
              </h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#4d84c8]">
                Collaborate with businesses
                <br className="hidden sm:inline" />
                and other users.
              </p>
            </div>

            <div className="border-b border-[#dbeafa] p-5 sm:p-7 md:border-r lg:border-b-0">
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#dff9f1] text-[#16a978]">
                <Inbox className="size-5 sm:size-6" />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#103b8c]">
                Receive Proposals
              </h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#4d84c8]">
                Get opportunities from
                <br className="hidden sm:inline" />
                trusted partners.
              </p>
            </div>

            <div className="border-b border-[#dbeafa] p-5 sm:p-7 lg:border-r lg:border-b-0">
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#eee8ff] text-[#6740d8]">
                <Users className="size-5 sm:size-6" />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#103b8c]">
                Build Connections
              </h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#4d84c8]">
                Work with businesses
                <br className="hidden sm:inline" />
                and creators.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-[#fff0cf] text-[#e99a13]">
                <BarChart3 className="size-5 sm:size-6" />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#103b8c]">
                Create Value
              </h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#4d84c8]">
                Turn collaborations
                <br className="hidden sm:inline" />
                into real opportunities.
              </p>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[1300px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[280px] sm:h-[300px] animate-pulse rounded-2xl border border-[#d6e8f8] bg-white/80"
                />
              ))}
            </div>
          ) : filteredProposals.length > 0 ? (
            <div>
              <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#102d63]">
                    Your Proposals
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                    {filteredProposals.length}{" "}
                    proposal
                    {filteredProposals.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    found
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {filteredProposals.map(
                  (proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      direction={
                        proposal.recipientId ===
                        userId
                          ? "received"
                          : "sent"
                      }
                      onWithdraw={
                        proposal.status ===
                        "pending"
                          ? handleWithdraw
                          : undefined
                      }
                      onAccept={
                        proposal.status ===
                        "pending"
                          ? handleAccept
                          : undefined
                      }
                      onDecline={
                        proposal.status ===
                        "pending"
                          ? handleDecline
                          : undefined
                      }
                      actionLoading={
                        actionLoading ===
                        proposal.id
                      }
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c9e2f8] bg-white/75 px-5 py-12 sm:px-6 sm:py-16 text-center">
              <div className="mx-auto flex size-14 sm:size-16 items-center justify-center rounded-full bg-[#e7f3ff] text-[#2875F5]">
                <Send className="size-6 sm:size-7" />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#102d63]">
                No proposals found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                {search ||
                statusFilter !== "all" ||
                directionFilter !==
                  "all"
                  ? "Try changing your search or filters."
                  : "Your proposals will appear here when you send or receive collaboration opportunities."}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Proposals;