import { useEffect, useMemo, useState } from "react";
import ReviewCard from "../components/review/ReviewCard";
import { supabase } from "../lib/supabase";
import { Search } from "lucide-react";
import Footer from "../components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type Review = {
  id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  user_id: string | null;
  helpful_count: number | null;
  is_verified: boolean | null;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type ReviewWithProfile = Review & {
  username: string;
  avatar_url: string | null;
};

type SortOption =
  | "latest"
  | "oldest"
  | "highest-rated"
  | "most-helpful";

const categories = [
  "All Categories",
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

function formatReviewTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMinutes = Math.floor(
    (now.getTime() - date.getTime()) / 60000
  );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AllReviews() {
  const [reviews, setReviews] = useState<
    ReviewWithProfile[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [sortBy, setSortBy] =
    useState<SortOption>("latest");

  useEffect(() => {
    let cancelled = false;

    async function fetchAllReviews() {
      try {
        setLoading(true);

        /*
         * =====================================================
         * 1. GET ALL PUBLISHED REVIEWS
         * =====================================================
         */

        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("reviews")
          .select(
            "id, subject, category, rating, title, content, created_at, user_id, helpful_count, is_verified"
          )
          .eq("status", "published");

        if (reviewError) {
          console.error(
            "ALL REVIEWS ERROR:",
            reviewError
          );

          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const reviewsData =
          (reviewData as Review[]) ?? [];

        /*
         * =====================================================
         * 2. GET UNIQUE USER IDS
         * =====================================================
         */

        const userIds = [
          ...new Set(
            reviewsData
              .map(
                (review) =>
                  review.user_id
              )
              .filter(
                (userId): userId is string =>
                  Boolean(userId)
              )
          ),
        ];

        /*
         * =====================================================
         * 3. GET PROFILES
         * =====================================================
         */

        let profilesData: Profile[] = [];

        if (userIds.length > 0) {
          const {
            data,
            error: profilesError,
          } = await supabase
            .from("profiles")
            .select(
              "id, username, avatar_url"
            )
            .in("id", userIds);

          if (profilesError) {
            console.error(
              "ALL REVIEWS PROFILES ERROR:",
              profilesError
            );
          } else {
            profilesData =
              (data as Profile[]) ?? [];
          }
        }

        /*
         * =====================================================
         * 4. COMBINE REVIEW + PROFILE
         * =====================================================
         */

        const combinedReviews =
          reviewsData.map((review) => {
            const profile =
              profilesData.find(
                (profile) =>
                  profile.id ===
                  review.user_id
              );

            return {
              ...review,

              username:
                profile?.username ??
                "Unknown user",

              avatar_url:
                profile?.avatar_url ??
                null,

              helpful_count:
                review.helpful_count ?? 0,

              is_verified:
                review.is_verified ??
                false,
            };
          });

        if (!cancelled) {
          setReviews(
            combinedReviews
          );
        }
      } catch (error) {
        console.error(
          "ALL REVIEWS ERROR:",
          error
        );

        if (!cancelled) {
          setReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAllReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =====================================================
   * SEARCH + CATEGORY + SORT
   * =====================================================
   */

  const filteredReviews = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    const result = reviews.filter(
      (review) => {
        /*
         * SEARCH
         */

        const matchesSearch =
          !searchText ||
          review.subject
            .toLowerCase()
            .includes(searchText) ||
          (review.title ?? "")
            .toLowerCase()
            .includes(searchText) ||
          review.content
            .toLowerCase()
            .includes(searchText) ||
          review.username
            .toLowerCase()
            .includes(searchText) ||
          review.category
            .toLowerCase()
            .includes(searchText);

        /*
         * CATEGORY
         */

        const matchesCategory =
          categoryFilter ===
            "All Categories" ||
          review.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );

    /*
     * SORT
     */

    result.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
          );

        case "oldest":
          return (
            new Date(
              a.created_at
            ).getTime() -
            new Date(
              b.created_at
            ).getTime()
          );

        case "highest-rated":
          return (
            (b.rating ?? 0) -
            (a.rating ?? 0)
          );

        case "most-helpful":
          return (
            (b.helpful_count ?? 0) -
            (a.helpful_count ?? 0)
          );

        default:
          return 0;
      }
    });

    return result;
  }, [
    reviews,
    search,
    categoryFilter,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* =================================================
            HEADER
        ================================================== */}

        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#E1EEFF] px-4 py-1.5 text-xs font-bold text-[#2875F5] sm:px-5 sm:py-2 sm:text-sm">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Explore everything
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            All Reviews
          </h1>

          <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:mt-2 sm:text-base">
            Browse all reviews shared by the community.
          </p>
        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================== */}

        <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3 lg:flex-row">

          {/* Search */}

          <div className="flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search reviews..."
              className="
                h-10
                w-full
                rounded-lg
                border
                bg-white
                px-3
                text-xs
                outline-none
                transition
                placeholder:text-muted-foreground
                focus:ring-2
                focus:ring-primary/20
                sm:h-11
                sm:px-4
                sm:text-sm
              "
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">
            {/* Category */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                bg-white
                px-3
                text-xs
                outline-none
                focus:ring-2
                focus:ring-primary/20
                sm:h-11
                sm:px-4
                sm:text-sm
                lg:w-56
              "
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            {/* Sort */}

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as SortOption
                )
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                bg-white
                px-3
                text-xs
                outline-none
                focus:ring-2
                focus:ring-primary/20
                sm:h-11
                sm:px-4
                sm:text-sm
                lg:w-52
              "
            >
              <option value="latest">
                Latest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="highest-rated">
                Highest Rated
              </option>

              <option value="most-helpful">
                Most Helpful
              </option>
            </select>
          </div>

        </div>

        {/* =================================================
            RESULT COUNT
        ================================================== */}

        {!loading && (
          <div className="mt-4 text-xs text-muted-foreground sm:mt-5 sm:text-sm">
            {filteredReviews.length}{" "}
            {filteredReviews.length === 1
              ? "review"
              : "reviews"}{" "}
            found
          </div>
        )}

        {/* =================================================
            REVIEWS
        ================================================== */}

        {loading ? (
          <div className="mt-6 grid items-stretch gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[280px] animate-pulse rounded-xl border bg-muted/40 sm:h-[300px]"
                />
              )
            )}
          </div>
        ) : filteredReviews.length ===
          0 ? (
          <div className="mt-8 rounded-xl border p-8 text-center sm:mt-10 sm:p-10">
            <p className="text-sm font-medium sm:text-base">
              No reviews found
            </p>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Try changing your search or
              category filter.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map(
              (review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  userId={
                    review.user_id
                  }
                  subjectName={
                    review.subject
                  }
                  category={
                    review.category
                  }
                  rating={
                    review.rating ??
                    undefined
                  }
                  title={
                    review.title ??
                    undefined
                  }
                  content={
                    review.content
                  }
                  author={
                    review.username
                  }
                  avatarUrl={
                    review.avatar_url
                  }
                  time={formatReviewTime(
                    review.created_at
                  )}
                  helpfulCount={
                    review.helpful_count ??
                    0
                  }
                  isVerified={
                    review.is_verified ??
                    false
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default AllReviews;