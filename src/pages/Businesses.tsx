import {
  Building2,
  ChevronDown,
  Grid2X2,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
  short_description: string;
  description: string;
  location: string | null;
  website: string | null;
  business_email: string | null;
  business_phone: string | null;
  services: string[];
  created_at: string;
  updated_at: string;
};

/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const categories = [
  "Products",
  "Services",
  "Places",
  "Food & Restaurants",
  "Electronics",
  "Travel",
  "Education",
  "Health & Wellness",
  "Automotive",
  "Technology",
  "Business",
  "Other",
];

const BUSINESSES_PER_PAGE = 8;

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

function Businesses() {
  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [businesses, setBusinesses] = useState<
    BusinessProfile[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<
    "recent" | "oldest" | "name"
  >("recent");

  const [currentPage, setCurrentPage] = useState(1);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [myBusinessId, setMyBusinessId] =
    useState<string | null>(null);

  /*
   * =======================================================
   * LOAD USER + BUSINESS PROFILE
   * =======================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "BUSINESSES USER ERROR:",
            userError
          );

          if (!cancelled) {
            setCurrentUserId(null);
            setMyBusinessId(null);
          }

          return;
        }

        if (!user) {
          if (!cancelled) {
            setCurrentUserId(null);
            setMyBusinessId(null);
          }

          return;
        }

        if (!cancelled) {
          setCurrentUserId(user.id);
        }

        const {
          data: businessProfile,
          error: businessError,
        } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (businessError) {
          console.error(
            "BUSINESSES MY BUSINESS ERROR:",
            businessError
          );

          if (!cancelled) {
            setMyBusinessId(null);
          }

          return;
        }

        if (!cancelled) {
          setMyBusinessId(
            businessProfile?.id ?? null
          );
        }
      } catch (err) {
        console.error(
          "BUSINESSES USER LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setCurrentUserId(null);
          setMyBusinessId(null);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =======================================================
   * LOAD BUSINESSES
   * =======================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      try {
        setLoading(true);
        setError("");

        const {
          data,
          error: businessesError,
        } = await supabase
          .from("business_profiles")
          .select(
            `
              id,
              user_id,
              business_name,
              logo_url,
              category,
              short_description,
              description,
              location,
              website,
              business_email,
              business_phone,
              services,
              created_at,
              updated_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (businessesError) {
          console.error(
            "BUSINESSES LOAD ERROR:",
            businessesError
          );

          if (!cancelled) {
            setError(
              "Unable to load businesses right now."
            );
          }

          return;
        }

        if (!cancelled) {
          setBusinesses(
            (data as BusinessProfile[]) ?? []
          );
        }
      } catch (err) {
        console.error(
          "BUSINESSES LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Something went wrong while loading businesses."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =======================================================
   * FILTER + SEARCH
   * =======================================================
   */

  const filteredBusinesses = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    const locationValue = location
      .trim()
      .toLowerCase();

    let result = businesses.filter(
      (business) => {
        /*
         * Category
         */

        if (
          category &&
          business.category !== category
        ) {
          return false;
        }

        /*
         * Location
         */

        if (
          locationValue &&
          !(
            business.location ?? ""
          )
            .toLowerCase()
            .includes(locationValue)
        ) {
          return false;
        }

        /*
         * Search
         */

        if (searchValue) {
          const searchableText = [
            business.business_name,
            business.category,
            business.location ?? "",
            business.short_description,
            business.description,
            ...(Array.isArray(
              business.services
            )
              ? business.services
              : []),
          ]
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(
              searchValue
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );

    /*
     * Sort
     */

    result = [...result].sort(
      (a, b) => {
        if (sortBy === "name") {
          return a.business_name.localeCompare(
            b.business_name
          );
        }

        if (sortBy === "oldest") {
          return (
            new Date(
              a.created_at
            ).getTime() -
            new Date(
              b.created_at
            ).getTime()
          );
        }

        return (
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
        );
      }
    );

    return result;
  }, [
    businesses,
    search,
    category,
    location,
    sortBy,
  ]);

  /*
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBusinesses.length /
        BUSINESSES_PER_PAGE
    )
  );

  const visibleBusinesses =
    filteredBusinesses.slice(
      (currentPage - 1) *
        BUSINESSES_PER_PAGE,
      currentPage *
        BUSINESSES_PER_PAGE
    );

  /*
   * =======================================================
   * RESET PAGE WHEN FILTERS CHANGE
   * =======================================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    category,
    location,
    sortBy,
  ]);

  /*
   * =======================================================
   * HELPERS
   * =======================================================
   */

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLocation("");
    setSortBy("recent");
    setCurrentPage(1);
  }

  function getInitial(
    businessName: string
  ) {
    return (
      businessName
        .trim()
        .charAt(0)
        .toUpperCase() || "B"
    );
  }

  function getServicePreview(
    services: string[]
  ) {
    if (!Array.isArray(services)) {
      return [];
    }

    return services
      .map((service) =>
        service.trim()
      )
      .filter(Boolean)
      .slice(0, 3);
  }

  function formatLocation(
    businessLocation: string | null
  ) {
    if (!businessLocation) {
      return "Location not provided";
    }

    return businessLocation;
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <main>
        <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div className="max-w-[760px]">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E8FA] bg-[#E8F4FF] px-3.5 py-1.5 text-xs font-semibold text-[#2875F5]">
                <Grid2X2 className="size-3.5" />
                Businesses
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#123B7A] sm:text-4xl lg:text-[42px]">
                Discover Trusted Businesses
              </h1>

              <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#5B7FAF] sm:text-base sm:leading-7">
                Find and explore verified businesses,
                read reviews, and make informed
                decisions.
              </p>

            </div>

            {/* =================================================
                OWNER ACTIONS
            ================================================== */}

            {currentUserId && (
              <div className="flex flex-col gap-3 sm:flex-row lg:pt-2">

                {myBusinessId ? (
                  <Link
                    to={`/business/${myBusinessId}`}
                    className="
                      inline-flex h-11 items-center
                      justify-center gap-2 rounded-lg
                      border border-[#BBD2FF]
                      bg-white px-5
                      text-sm font-semibold
                      text-[#2875F5]
                      shadow-sm
                      transition
                      hover:border-[#2875F5]
                      hover:bg-[#F3F7FF]
                    "
                  >
                    <UserRound className="size-4" />
                    My Business Profile
                  </Link>
                ) : (
                  <Link
                    to="/business/create"
                    className="
                      inline-flex h-11 items-center
                      justify-center gap-2 rounded-lg
                      bg-[#2875F5] px-5
                      text-sm font-semibold
                      text-white
                      shadow-md
                      shadow-[#2875F5]/20
                      transition
                      hover:bg-[#155DCC]
                      hover:shadow-lg
                    "
                  >
                    <Plus className="size-4" />
                    Create Business Profile
                  </Link>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              SEARCH + FILTERS
          ================================================== */}

          <div className="mt-6 rounded-xl border border-[#CFE5F8] bg-white/80 p-3 shadow-sm backdrop-blur sm:mt-7 sm:p-4">

            <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_250px_250px_220px]">

              {/* Search */}

              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#2875F5] sm:left-4 sm:size-5" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search businesses, categories, location..."
                  className="
                    h-10 w-full rounded-lg
                    border border-[#C9D7EA]
                    bg-white
                    pl-10 pr-3
                    text-xs text-[#10182D]
                    outline-none
                    placeholder:text-[#7D9BC2]
                    transition
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/20
                    sm:h-12 sm:pl-12 sm:pr-4 sm:text-sm
                  "
                />
              </div>

              {/* Category */}

              <div className="relative">
                <Grid2X2 className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-[#2875F5] sm:left-4" />

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="
                    h-10 w-full
                    appearance-none
                    rounded-lg
                    border border-[#C9D7EA]
                    bg-white
                    pl-10 pr-9
                    text-xs
                    text-[#10182D]
                    outline-none
                    transition
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/20
                    sm:h-12 sm:pl-11 sm:pr-10 sm:text-sm
                  "
                >
                  <option value="">
                    All Categories
                  </option>

                  {categories.map(
                    (categoryName) => (
                      <option
                        key={categoryName}
                        value={categoryName}
                      >
                        {categoryName}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6C8DB7] sm:right-4" />
              </div>

              {/* Location */}

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-[#2875F5] sm:left-4" />

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="All Locations"
                  className="
                    h-10 w-full rounded-lg
                    border border-[#C9D7EA]
                    bg-white
                    pl-10 pr-3
                    text-xs text-[#10182D]
                    outline-none
                    placeholder:text-[#7D9BC2]
                    transition
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/20
                    sm:h-12 sm:pl-11 sm:pr-4 sm:text-sm
                  "
                />
              </div>

              {/* Sort */}

              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-[#2875F5] sm:left-4" />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target
                        .value as
                        | "recent"
                        | "oldest"
                        | "name"
                    )
                  }
                  className="
                    h-10 w-full
                    appearance-none
                    rounded-lg
                    border border-[#C9D7EA]
                    bg-white
                    pl-10 pr-9
                    text-xs
                    text-[#10182D]
                    outline-none
                    transition
                    focus:border-[#2875F5]
                    focus:ring-2
                    focus:ring-[#2875F5]/20
                    sm:h-12 sm:pl-11 sm:pr-10 sm:text-sm
                  "
                >
                  <option value="recent">
                    Sort by: Most Recent
                  </option>

                  <option value="oldest">
                    Sort by: Oldest
                  </option>

                  <option value="name">
                    Sort by: Name
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6C8DB7] sm:right-4" />
              </div>

            </div>

          </div>

          {/* =================================================
              SECTION HEADER
          ================================================== */}

          <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">
              <Star className="size-4 fill-current text-[#2875F5] sm:size-5" />

              <h2 className="text-base font-bold text-[#123B7A] sm:text-lg">
                Featured Businesses
              </h2>
            </div>

            {!loading &&
              !error &&
              filteredBusinesses.length > 0 && (
                <p className="text-xs text-[#6484AD] sm:text-sm">
                  Showing{" "}
                  {filteredBusinesses.length}{" "}
                  {filteredBusinesses.length ===
                  1
                    ? "business"
                    : "businesses"}
                </p>
              )}

          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-4 rounded-xl border border-[#F2C5C5] bg-[#FEF2F2] p-4 text-xs text-[#B91C1C] sm:mt-5 sm:p-5 sm:text-sm">
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="mt-4 grid gap-3.5 sm:mt-5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">

              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    h-[280px]
                    animate-pulse
                    rounded-xl
                    border
                    border-[#D6E8F8]
                    bg-white
                    p-4
                    sm:h-[300px] sm:p-5
                  "
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="size-14 rounded-full bg-[#E3EFFB] sm:size-16" />

                    <div className="flex-1">
                      <div className="h-4 w-28 rounded bg-[#E3EFFB] sm:w-32" />
                      <div className="mt-2 h-3 w-20 rounded bg-[#EDF4FB] sm:w-24" />
                    </div>
                  </div>

                  <div className="mt-4 h-4 w-full rounded bg-[#EDF4FB] sm:mt-5" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-[#EDF4FB]" />
                  <div className="mt-2 h-4 w-4/6 rounded bg-[#EDF4FB]" />

                  <div className="mt-4 h-9 w-28 rounded-lg bg-[#E3EFFB] sm:mt-5" />
                </div>
              ))}

            </div>
          )}

          {/* =================================================
              BUSINESS GRID
          ================================================== */}

          {!loading &&
            !error &&
            visibleBusinesses.length > 0 && (
              <div className="mt-4 grid gap-3.5 sm:mt-5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">

                {visibleBusinesses.map(
                  (business) => {
                    const servicePreview =
                      getServicePreview(
                        business.services
                      );

                    return (
                      <article
                        key={business.id}
                        className="
                          flex min-h-[285px]
                          flex-col
                          rounded-xl
                          border
                          border-[#CFE2F5]
                          bg-white
                          p-4
                          shadow-sm
                          transition
                          hover:-translate-y-0.5
                          hover:border-[#AFCFFF]
                          hover:shadow-md
                          sm:min-h-[300px]
                        "
                      >

                        {/* =================================================
                            BUSINESS HEADER
                        ================================================== */}

                        <div className="flex items-start gap-3.5 sm:gap-4">

                          <div
                            className="
                              flex size-14
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-full
                              border
                              border-[#D6E2F2]
                              bg-[#EAF4FF]
                              sm:size-16
                            "
                          >
                            {business.logo_url ? (
                              <img
                                src={
                                  business.logo_url
                                }
                                alt={`${business.business_name} logo`}
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-[#2875F5] sm:text-2xl">
                                {getInitial(
                                  business.business_name
                                )}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <h3 className="truncate text-sm font-bold text-[#123B7A]">
                              {
                                business.business_name
                              }
                            </h3>

                            <p className="mt-0.5 truncate text-xs font-medium text-[#5B7FAF] sm:mt-1">
                              {business.category}
                            </p>

                            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#6A88AE] sm:mt-2 sm:text-xs">
                              <Star className="size-3 fill-current text-[#F59E0B] sm:size-3.5" />
                              <span>
                                Reviews available
                              </span>
                            </div>

                          </div>

                        </div>

                        {/* =================================================
                            LOCATION
                        ================================================== */}

                        <div className="mt-3 flex items-start gap-1.5 text-xs text-[#6484AD] sm:gap-2">

                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#2875F5]" />

                          <span className="line-clamp-1">
                            {formatLocation(
                              business.location
                            )}
                          </span>

                        </div>

                        {/* =================================================
                            DESCRIPTION
                        ================================================== */}

                        <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#5F7FA8] sm:mt-4 sm:text-sm sm:leading-5">
                          {
                            business.short_description
                          }
                        </p>

                        {/* =================================================
                            SERVICES
                        ================================================== */}

                        {servicePreview.length >
                          0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">

                            {servicePreview.map(
                              (service) => (
                                <span
                                  key={service}
                                  className="
                                    rounded-full
                                    bg-[#EDF6FF]
                                    px-2.5 py-1
                                    text-[10px]
                                    font-medium
                                    text-[#2875F5]
                                    sm:text-[11px]
                                  "
                                >
                                  {service}
                                </span>
                              )
                            )}

                            {Array.isArray(
                              business.services
                            ) &&
                              business.services
                                .filter(
                                  (
                                    service
                                  ) =>
                                    service.trim()
                                ).length >
                                3 && (
                                <span
                                  className="
                                    rounded-full
                                    bg-[#EDF6FF]
                                    px-2.5 py-1
                                    text-[10px]
                                    font-medium
                                    text-[#2875F5]
                                    sm:text-[11px]
                                  "
                                >
                                  +
                                  {business.services.filter(
                                    (
                                      service
                                    ) =>
                                      service.trim()
                                  ).length -
                                    3}
                                </span>
                              )}

                          </div>
                        )}

                        {/* =================================================
                            CARD ACTION
                        ================================================== */}

                        <div className="mt-auto pt-4 sm:pt-5">

                          <Link
                            to={`/business/${business.id}`}
                            className="
                              inline-flex h-9
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              border
                              border-[#BBD2FF]
                              bg-white
                              px-4
                              text-xs
                              font-semibold
                              text-[#2875F5]
                              transition
                              hover:bg-[#F3F7FF]
                              hover:border-[#2875F5]
                            "
                          >
                            View Profile
                            <span className="text-base leading-none">
                              →
                            </span>
                          </Link>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {!loading &&
            !error &&
            filteredBusinesses.length ===
              0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-[#BBD2FF] bg-white p-8 text-center shadow-sm sm:mt-6 sm:p-10">

                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E8F3FF] sm:size-14">
                  <Building2 className="size-6 text-[#2875F5] sm:size-7" />
                </div>

                <h3 className="mt-3 text-base font-bold text-[#123B7A] sm:mt-4 sm:text-lg">
                  No businesses found
                </h3>

                <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#617493] sm:mt-2 sm:text-sm sm:leading-6">
                  Try searching for another
                  business, category, or
                  location.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="
                    mt-4
                    border-[#BBD2FF]
                    bg-white
                    text-xs
                    text-[#2875F5]
                    hover:bg-[#F3F7FF]
                    hover:text-[#155DCC]
                    sm:mt-5 sm:text-sm
                  "
                >
                  Clear Filters
                </Button>

              </div>
            )}

          {/* =================================================
              PAGINATION
          ================================================== */}

          {!loading &&
            !error &&
            filteredBusinesses.length >
              BUSINESSES_PER_PAGE && (
              <div className="mt-6 flex items-center justify-center gap-1.5 sm:mt-7 sm:gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="
                    flex size-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#D6E2F2]
                    bg-white
                    text-sm
                    text-[#2875F5]
                    transition
                    hover:bg-[#F3F7FF]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    sm:size-9
                  "
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const page =
                    index + 1;

                  const isActive =
                    page === currentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                      className={`
                        flex size-8
                        items-center
                        justify-center
                        rounded-lg
                        border
                        text-xs
                        font-semibold
                        transition
                        sm:size-9 sm:text-sm
                        ${
                          isActive
                            ? "border-[#2875F5] bg-[#2875F5] text-white shadow-sm"
                            : "border-[#D6E2F2] bg-white text-[#2875F5] hover:bg-[#F3F7FF]"
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="
                    flex size-8
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#D6E2F2]
                    bg-white
                    text-sm
                    text-[#2875F5]
                    transition
                    hover:bg-[#F3F7FF]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    sm:size-9
                  "
                  aria-label="Next page"
                >
                  ›
                </button>

              </div>
            )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Businesses;