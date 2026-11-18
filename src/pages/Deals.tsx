import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Grid2X2,
  Search,
  Tag,
  User,
  XCircle,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabase";

type DealStatus =
  | "active"
  | "completed"
  | "cancelled";

type DealRow = {
  id: string;
  proposal_id: string;
  business_id: string;
  reviewer_id: string;
  title: string;
  description: string | null;
  budget: number | string;
  currency: string;
  start_date: string;
  end_date: string;
  status: DealStatus;
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
  logo_url: string | null;
  category: string;
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type Deal = DealRow & {
  business: BusinessProfile | null;
  reviewer: Profile | null;
};

type DealFilter =
  | "all"
  | "active"
  | "completed"
  | "cancelled";

function Deals() {
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [deals, setDeals] = useState<Deal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState<DealFilter>("all");

  const [statusFilter, setStatusFilter] =
    useState<DealFilter>("all");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDeals() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (cancelled) {
          return;
        }

        setCurrentUserId(user.id);

        /*
         * Find business profiles owned by current user
         */
        const {
          data: ownedBusinesses,
          error: ownedBusinessError,
        } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", user.id);

        if (ownedBusinessError) {
          throw ownedBusinessError;
        }

        const ownedBusinessIds =
          (ownedBusinesses ?? []).map(
            (business) => business.id
          );

        /*
         * Fetch deals where user is either the reviewer OR owns the business.
         * Using .or() query condition to fetch everything cleanly in one go.
         */
        let query = supabase
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
          `);

        if (ownedBusinessIds.length > 0) {
          query = query.or(
            `reviewer_id.eq.${user.id},business_id.in.(${ownedBusinessIds.join(",")})`
          );
        } else {
          query = query.eq("reviewer_id", user.id);
        }

        const { data: uniqueDeals, error: dealsError } = await query;

        if (dealsError) {
          throw dealsError;
        }

        if (!uniqueDeals || uniqueDeals.length === 0) {
          if (!cancelled) {
            setDeals([]);
          }
          return;
        }

        /*
         * -------------------------------------------------------
         * LOAD RELATED BUSINESS PROFILES & PROFILES
         * -------------------------------------------------------
         */

        const businessIds =
          Array.from(
            new Set(
              uniqueDeals.map(
                (deal) =>
                  deal.business_id
              )
            )
          );

        const reviewerIds =
          Array.from(
            new Set(
              uniqueDeals.map(
                (deal) =>
                  deal.reviewer_id
              )
            )
          );

        const [
          businessesResult,
          profilesResult,
        ] = await Promise.all([
          businessIds.length > 0
            ? supabase
                .from(
                  "business_profiles"
                )
                .select(`
                  id,
                  user_id,
                  business_name,
                  logo_url,
                  category
                `)
                .in(
                  "id",
                  businessIds
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),

          reviewerIds.length > 0
            ? supabase
                .from("profiles")
                .select(
                  "id, username, avatar_url"
                )
                .in(
                  "id",
                  reviewerIds
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

        if (
          businessesResult.error
        ) {
          throw businessesResult.error;
        }

        if (
          profilesResult.error
        ) {
          throw profilesResult.error;
        }

        const businessMap =
          new Map<
            string,
            BusinessProfile
          >();

        (
          (businessesResult.data ??
            []) as BusinessProfile[]
        ).forEach(
          (business) => {
            businessMap.set(
              business.id,
              business
            );
          }
        );

        const profileMap =
          new Map<
            string,
            Profile
          >();

        (
          (profilesResult.data ??
            []) as Profile[]
        ).forEach(
          (profile) => {
            profileMap.set(
              profile.id,
              profile
            );
          }
        );

        const completeDeals =
          (uniqueDeals as DealRow[]).map(
            (deal) => ({
              ...deal,
              business:
                businessMap.get(
                  deal.business_id
                ) ?? null,
              reviewer:
                profileMap.get(
                  deal.reviewer_id
                ) ?? null,
            })
          );

        completeDeals.sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );

        if (!cancelled) {
          setDeals(
            completeDeals
          );
        }
      } catch (err) {
        console.error(
          "DEALS LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load your deals."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDeals();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  function formatDate(
    dateString: string | null
  ) {
    if (!dateString) {
      return "-";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatBudget(
    budget: number | string,
    currency: string
  ) {
    const amount =
      Number(budget);

    const symbols: Record<
      string,
      string
    > = {
      INR: "₹",
      USD: "\$",
      EUR: "€",
      GBP: "£",
    };

    const symbol =
      symbols[currency] ??
      currency;

    if (
      Number.isNaN(amount)
    ) {
      return `${symbol}${budget}`;
    }

    return `${symbol}${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  function getInitial(
    name: string
  ) {
    return (
      name
        .trim()
        .charAt(0)
        .toUpperCase() ||
      "U"
    );
  }

  function getDuration(
    startDate: string,
    endDate: string
  ) {
    const start =
      new Date(
        startDate
      ).getTime();

    const end =
      new Date(
        endDate
      ).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end)
    ) {
      return "-";
    }

    const days = Math.max(
      1,
      Math.ceil(
        (end - start) /
          (1000 *
            60 *
            60 *
            24)
      )
    );

    return `${days} day${
      days === 1
        ? ""
        : "s"
    }`;
  }

  /*
   * ============================================================
   * FILTERED DEALS
   * ============================================================
   */

  const filteredDeals =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return deals.filter(
        (deal) => {
          /*
           * Main tab filter
           */

          const matchesFilter =
            filter === "all" ||
            deal.status ===
              filter;

          /*
           * Secondary status filter
           */

          const matchesStatus =
            statusFilter ===
              "all" ||
            deal.status ===
              statusFilter;

          /*
           * Search fields
           */

          const businessName =
            deal.business
              ?.business_name ??
            "";

          const reviewerName =
            deal.reviewer
              ?.username ??
            "";

          const category =
            deal.business
              ?.category ??
            "";

          const searchableText =
            [
              deal.title,
              deal.description ??
                "",
              businessName,
              reviewerName,
              category,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            query.length === 0 ||
            searchableText.includes(
              query
            );

          return (
            matchesFilter &&
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      deals,
      filter,
      statusFilter,
      search,
    ]);

  /*
   * ============================================================
   * GROUP DEALS
   * ============================================================
   */

  const activeDeals =
    filteredDeals.filter(
      (deal) =>
        deal.status ===
        "active"
    );

  const completedDeals =
    filteredDeals.filter(
      (deal) =>
        deal.status ===
        "completed"
    );

  const cancelledDeals =
    filteredDeals.filter(
      (deal) =>
        deal.status ===
        "cancelled"
    );

  /*
   * ============================================================
   * STATUS BADGE
   * ============================================================
   */

  function StatusBadge({
    status,
  }: {
    status: DealStatus;
  }) {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#e4f8f1] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#0b9b70]">
          <span className="size-2 rounded-full bg-[#16b886]" />
          Active
        </span>
      );
    }

    if (
      status ===
      "completed"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#e8f2ff] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#2875F5]">
          <span className="size-2 rounded-full bg-[#2875F5]" />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#fff0f2] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#ef476f]">
        <span className="size-2 rounded-full bg-[#ef476f]" />
        Cancelled
      </span>
    );
  }

  /*
   * ============================================================
   * DEAL CARD
   * ============================================================
   */

  function DealCard({
    deal,
  }: {
    deal: Deal;
  }) {
    const isCurrentUserBusiness =
      deal.business?.user_id ===
      currentUserId;

    /*
     * The card shows the OTHER participant.
     */

    const otherPartyName =
      isCurrentUserBusiness
        ? deal.reviewer
            ?.username ||
          "Reviewer"
        : deal.business
            ?.business_name ||
          "Business";

    const otherPartyImage =
      isCurrentUserBusiness
        ? deal.reviewer
            ?.avatar_url
        : deal.business
            ?.logo_url;

    const otherPartyIsBusiness =
      !isCurrentUserBusiness &&
      Boolean(
        deal.business
      );

    const category =
      deal.business
        ?.category ?? "";

    const dateLabel =
      deal.status ===
      "active"
        ? `Started ${formatDate(
            deal.start_date
          )}`
        : deal.status ===
            "completed"
          ? `Completed ${formatDate(
              deal.completed_at ??
                deal.updated_at
            )}`
          : `Cancelled ${formatDate(
              deal.cancelled_at ??
                deal.updated_at
            )}`;

    return (
      <article
        className="
          flex
          min-h-[205px]
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-[#cfe4f8]
          bg-white
          shadow-[0_4px_18px_rgba(40,117,245,0.04)]
          transition
          duration-200
          hover:-translate-y-0.5
          hover:border-[#a9d4ff]
          hover:shadow-[0_8px_25px_rgba(40,117,245,0.08)]
          md:flex-row
        "
      >
        {/* -----------------------------------------------
            OTHER PARTY
        ------------------------------------------------ */}

        <div className="flex shrink-0 items-center gap-3.5 p-4 sm:gap-4 sm:p-5 md:w-[112px] md:flex-col md:items-start md:justify-center">
          {otherPartyImage ? (
            <img
              src={otherPartyImage}
              alt=""
              className="size-12 sm:size-14 rounded-full border border-[#dce8f5] object-cover"
            />
          ) : otherPartyIsBusiness ? (
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
              <Building2 className="size-6 sm:size-7" />
            </div>
          ) : (
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-[#eee8ff] text-lg sm:text-xl font-bold text-[#7c4dff]">
              {getInitial(
                otherPartyName
              )}
            </div>
          )}

          <span className="rounded-full bg-[#eaf5ff] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#2875F5]">
            {otherPartyIsBusiness
              ? "Business"
              : "User"}
          </span>
        </div>

        {/* -----------------------------------------------
            DEAL INFORMATION
        ------------------------------------------------ */}

        <div className="min-w-0 flex-1 border-t border-[#dceaf7] p-4 sm:p-5 md:border-l md:border-t-0">
          <h3 className="truncate text-sm sm:text-base font-bold text-[#103579]">
            {deal.title}
          </h3>

          <div className="mt-1.5 sm:mt-2 space-y-1">
            {otherPartyIsBusiness ? (
              <Link
                to={`/business/${deal.business_id}`}
                className="flex w-fit items-center gap-1.5 sm:gap-2 text-xs font-medium text-[#4771a8] transition hover:text-[#2875F5]"
              >
                <Building2 className="size-3.5 text-[#2875F5]" />

                <span>
                  {otherPartyName}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-[#4771a8]">
                <User className="size-3.5 text-[#2875F5]" />

                <span>
                  {otherPartyName}
                </span>
              </div>
            )}

            {category && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#4771a8]">
                <Tag className="size-3.5 text-[#2875F5]" />

                <span>
                  {category}
                </span>
              </div>
            )}
          </div>

          <p className="mt-2.5 sm:mt-3 line-clamp-2 text-xs sm:text-sm leading-5 text-[#617493]">
            {deal.description ||
              "Collaboration between the business and participant."}
          </p>

          <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs font-medium text-[#4771a8]">
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="rounded border border-[#b9d9f7] px-1.5 py-0.5 text-[10px] font-bold text-[#2875F5]">
                {deal.currency}
              </span>

              {formatBudget(
                deal.budget,
                deal.currency
              )}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-[#2875F5]" />

              {getDuration(
                deal.start_date,
                deal.end_date
              )}
            </span>
          </div>
        </div>

        {/* -----------------------------------------------
            STATUS
        ------------------------------------------------ */}

        <div className="flex w-full shrink-0 flex-col justify-between border-t border-[#dceaf7] p-4 sm:p-5 md:w-[210px] md:border-l md:border-t-0">
          <div className="flex items-center justify-between md:flex-col md:items-start md:justify-start gap-2">
            <StatusBadge
              status={deal.status}
            />

            <div className="flex items-center gap-1.5 text-xs leading-5 text-[#4771a8] md:mt-3">
              <CalendarDays className="size-3.5 shrink-0 text-[#2875F5]" />

              <span className="truncate">
                {dateLabel}
              </span>
            </div>
          </div>

          <Link
            to={`/deals/${deal.id}`}
            className="
              mt-4 md:mt-5
              inline-flex
              w-fit
              items-center
              gap-1.5 sm:gap-2
              rounded-xl
              border
              border-[#9dceff]
              bg-white
              px-3.5 sm:px-4
              py-2 sm:py-2.5
              text-xs
              font-bold
              text-[#2875F5]
              transition
              hover:border-[#2875F5]
              hover:bg-[#eef7ff]
            "
          >
            View Deal
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
    );
  }

  /*
   * ============================================================
   * SECTION
   * ============================================================
   */

  function DealSection({
    title,
    deals: sectionDeals,
    status,
  }: {
    title: string;
    deals: Deal[];
    status: DealStatus;
  }) {
    if (
      sectionDeals.length === 0
    ) {
      return null;
    }

    return (
      <section>
        <div className="mb-3.5 sm:mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {status ===
            "active" ? (
              <span className="size-2.5 sm:size-3 rounded-full bg-[#55d4ad]" />
            ) : status ===
                "completed" ? (
              <CheckCircle2 className="size-4 text-[#2875F5]" />
            ) : (
              <XCircle className="size-4 text-[#ef476f]" />
            )}

            <h2 className="text-sm sm:text-base font-bold text-[#103579]">
              {title}
            </h2>
          </div>

          <span className="rounded-full bg-[#e7f3ff] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-[#2875F5]">
            {sectionDeals.length}{" "}
            {sectionDeals.length ===
            1
              ? "deal"
              : "deals"}
          </span>
        </div>

        <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
          {sectionDeals.map(
            (deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
              />
            )
          )}
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />

        <main className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-16 rounded bg-[#dcecff]" />

            <div className="mt-4 sm:mt-5 h-10 w-48 sm:h-11 sm:w-56 rounded-lg bg-[#dcecff]" />

            <div className="mt-2.5 sm:mt-3 h-4 sm:h-5 w-64 sm:w-80 rounded bg-[#e4f0fc]" />

            <div className="mt-6 sm:mt-7 h-12 sm:h-14 rounded-xl bg-[#e3f1fc]" />

            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
              <div className="h-[205px] rounded-xl bg-white/80" />
              <div className="h-[205px] rounded-xl bg-white/80" />
              <div className="h-[205px] rounded-xl bg-white/80" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-[1180px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-2xl border border-[#d6e2f2] bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex size-12 sm:size-14 items-center justify-center rounded-full bg-[#e8f3ff]">
              <InfoIcon />
            </div>

            <h1 className="mt-4 text-lg font-bold text-[#10182D] sm:text-xl">
              Unable to load your deals
            </h1>

            <p className="mt-2 text-xs leading-5 text-[#617493] sm:text-sm sm:leading-6">
              Please try again.
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-5 sm:mt-6
                rounded-xl
                bg-[#2875F5]
                px-5
                py-2.5 sm:py-3
                text-xs sm:text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#155DCC]
              "
            >
              Try Again
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /*
   * ============================================================
   * EMPTY
   * ============================================================
   */

  const noDeals =
    filteredDeals.length === 0;

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* ==================================================
            BREADCRUMB & HEADER WITH BUTTON ON RIGHT
        ================================================== */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#2875F5]">
            <Link
              to="/"
              className="transition hover:text-[#155DCC]"
              aria-label="Home"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12 3.2 3.5 10v10.2c0 .4.3.8.8.8h5.2v-6h5v6h5.2c.4 0 .8-.4.8-.8V10L12 3.2Z" />
              </svg>
            </Link>

            <span className="text-[#91aac5]">
              ›
            </span>

            <span>Deals</span>
          </div>

          <Link
            to="/proposals"
            className="inline-flex items-center gap-2 rounded-xl border border-[#c9e2fb] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#2875F5] shadow-sm transition hover:bg-white sm:text-sm"
          >
            <FileText className="h-4 w-4" />
            Go to Proposals
          </Link>
        </div>

        <div className="mt-3.5 sm:mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#103b70] sm:text-4xl">
            My Deals
          </h1>

          <p className="mt-1 text-xs sm:text-base text-[#6a8db7]">
            Your collaborations and active deals.
          </p>
        </div>

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="mt-5 sm:mt-6 rounded-xl border border-[#c9e4f9] bg-[#e8f5ff] p-2">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Tabs */}

            <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 xl:pb-0">
              {(
                [
                  [
                    "all",
                    "All",
                  ],
                  [
                    "active",
                    "Active",
                  ],
                  [
                    "completed",
                    "Completed",
                  ],
                  [
                    "cancelled",
                    "Cancelled",
                  ],
                ] as [
                  DealFilter,
                  string
                ][]
              ).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        value
                      )
                    }
                    className={`
                      rounded-xl
                      px-4 sm:px-6
                      py-2 sm:py-2.5
                      text-xs sm:text-sm
                      font-semibold
                      whitespace-nowrap
                      transition
                      ${
                        filter ===
                        value
                          ? "bg-[#2875F5] text-white shadow-sm"
                          : "text-[#2875F5] hover:bg-white/70"
                      }
                    `}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {/* Search + status */}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1 sm:w-[320px]">
                <Search className="absolute left-3.5 sm:left-4 top-1/2 size-4 -translate-y-1/2 text-[#2875F5]" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search deals..."
                  className="
                    h-10 sm:h-11
                    w-full
                    rounded-xl
                    border
                    border-[#c8e1f7]
                    bg-white
                    pl-10 sm:pl-11
                    pr-4
                    text-xs sm:text-sm
                    text-[#10182D]
                    outline-none
                    placeholder:text-[#8ba8c7]
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/15
                  "
                />
              </div>

              <div className="relative sm:w-[220px]">
                <Grid2X2 className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 size-4 -translate-y-1/2 text-[#2875F5]" />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target
                        .value as DealFilter
                    )
                  }
                  className="
                    h-10 sm:h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-[#c8e1f7]
                    bg-white
                    pl-10 sm:pl-11
                    pr-9 sm:pr-10
                    text-xs sm:text-sm
                    text-[#4771a8]
                    outline-none
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/15
                  "
                >
                  <option value="all">
                    All Statuses
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 sm:right-4 top-1/2 size-4 -translate-y-1/2 text-[#2875F5]" />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            DEAL LIST
        ================================================== */}

        <div className="mt-6 sm:mt-7 space-y-6 sm:space-y-8">
          {!noDeals && (
            <>
              <DealSection
                title="Active Deals"
                deals={activeDeals}
                status="active"
              />

              <DealSection
                title="Completed Deals"
                deals={completedDeals}
                status="completed"
              />

              <DealSection
                title="Cancelled Deals"
                deals={cancelledDeals}
                status="cancelled"
              />
            </>
          )}

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {noDeals && (
            <div className="rounded-2xl border border-[#cfe5f8] bg-white px-5 py-12 sm:px-6 sm:py-16 text-center shadow-sm">
              <div className="mx-auto flex size-14 sm:size-16 items-center justify-center rounded-full bg-[#e8f3ff]">
                <HandshakeIcon />
              </div>

              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#103579]">
                No deals yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                {search.trim()
                  ? "No deals match your search."
                  : filter ===
                      "active"
                    ? "You don't have any active deals yet."
                    : filter ===
                        "completed"
                      ? "You don't have any completed deals yet."
                      : filter ===
                          "cancelled"
                        ? "You don't have any cancelled deals yet."
                        : "Your accepted collaborations will appear here."}
              </p>

              {search.trim() ||
              filter !== "all" ||
              statusFilter !==
                "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setStatusFilter(
                      "all"
                    );
                  }}
                  className="
                    mt-4 sm:mt-5
                    rounded-xl
                    border
                    border-[#b9daf6]
                    bg-white
                    px-4 sm:px-5
                    py-2 sm:py-2.5
                    text-xs sm:text-sm
                    font-semibold
                    text-[#2875F5]
                    transition
                    hover:bg-[#eef7ff]
                  "
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/businesses"
                  className="
                    mt-4 sm:mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#2875F5]
                    px-4 sm:px-5
                    py-2 sm:py-2.5
                    text-xs sm:text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#155DCC]
                  "
                >
                  Browse Businesses
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/*
 * ============================================================
 * LOCAL ICONS
 * ============================================================
 */

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 sm:size-7 text-[#2875F5]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 10v6" />

      <path d="M12 7h.01" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7 sm:size-8 text-[#2875F5]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m8 12 2.5 2.5a2 2 0 0 0 2.8 0L15 12" />

      <path d="m3.5 9.5 3-3 4 2 2-1.5a2 2 0 0 1 2.3.1l5.7 4.4-2.5 3-3-2" />

      <path d="m3.5 9.5 3 5.5 2-1" />

      <path d="m20.5 11.5-2.5 4.5-2-.9" />

      <path d="M10.5 8.5 13 6l3 1.5" />
    </svg>
  );
}

export default Deals;