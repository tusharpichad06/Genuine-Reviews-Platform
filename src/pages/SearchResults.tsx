import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { supabase } from "../lib/supabase";
import ReviewCard from "../components/review/ReviewCard";
import SearchBar from "../components/home/SearchBar";
//import BackButton from "../components/ui/BackButton";

import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
};

type ReviewWithUsername = Review & {
  username: string;
};

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

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SearchResults() {
  const [params, setParams] =
    useSearchParams();

  const query =
    params.get("q") ?? "";

  const urlCategory =
    params.get("category") ?? "all";

  const [reviews, setReviews] =
    useState<ReviewWithUsername[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [category, setCategory] =
    useState(urlCategory);

  const [rating, setRating] =
    useState("all");

  const [sort, setSort] =
    useState("all");

  useEffect(() => {
    setCategory(
      params.get("category") ?? "all"
    );
  }, [params]);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError("");

      try {
        let reviewQuery = supabase
          .from("reviews")
          .select(
            "id, subject, category, rating, title, content, created_at, user_id, helpful_count, is_verified"
          );

        if (query.trim()) {
          const safeQuery =
            query.trim().replace(/,/g, " ");

          reviewQuery =
            reviewQuery.or(
              `subject.ilike.%${safeQuery}%,title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`
            );
        }

        if (category !== "all") {
          reviewQuery =
            reviewQuery.eq(
              "category",
              category
            );
        }

        if (rating !== "all") {
          reviewQuery =
            reviewQuery.gte(
              "rating",
              Number(rating)
            );
        }

        if (
          sort === "highest-rated"
        ) {
          reviewQuery =
            reviewQuery
              .order("rating", {
                ascending: false,
                nullsFirst: false,
              })
              .order("created_at", {
                ascending: false,
              });
        } else if (
          sort === "most-helpful"
        ) {
          reviewQuery =
            reviewQuery
              .order("helpful_count", {
                ascending: false,
                nullsFirst: false,
              })
              .order("created_at", {
                ascending: false,
              });
        } else {
          reviewQuery =
            reviewQuery.order(
              "created_at",
              {
                ascending: false,
              }
            );
        }

        const {
          data: reviewData,
          error: reviewError,
        } = await reviewQuery;

        if (reviewError) {
          console.error(
            "SEARCH REVIEWS ERROR:",
            reviewError
          );

          setError(
            "Unable to load reviews."
          );

          setReviews([]);
          return;
        }

        const reviewsData =
          (reviewData as Review[]) ?? [];

        const userIds = [
          ...new Set(
            reviewsData
              .map(
                (review) =>
                  review.user_id
              )
              .filter(
                (
                  userId
                ): userId is string =>
                  Boolean(userId)
              )
          ),
        ];

        let profilesData: Profile[] =
          [];

        if (userIds.length > 0) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select(
              "id, username"
            )
            .in("id", userIds);

          if (profileError) {
            console.error(
              "SEARCH PROFILES ERROR:",
              profileError
            );
          }

          profilesData =
            (profileData as Profile[]) ??
            [];
        }

        const combinedReviews =
          reviewsData.map(
            (review) => {
              const profile =
                profilesData.find(
                  (item) =>
                    item.id ===
                    review.user_id
                );

              return {
                ...review,
                username:
                  profile?.username ??
                  "Unknown user",
              };
            }
          );

        setReviews(
          combinedReviews
        );
      } catch (err) {
        console.error(
          "SEARCH ERROR:",
          err
        );

        setError(
          "Something went wrong while loading reviews."
        );

        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [
    query,
    category,
    rating,
    sort,
  ]);

  function clearFilters() {
    setCategory("all");
    setRating("all");
    setSort("all");

    if (query) {
      setParams({
        q: query,
      });
    } else {
      setParams({});
    }
  }

  const hasFilters =
    category !== "all" ||
    rating !== "all" ||
    sort !== "all";

  return (
    <div className="min-h-screen bg-[#F3F7FF]">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/*<div className="mb-4 sm:mb-6">
          <BackButton />
        </div> */}

        <SearchBar />

        <div className="mt-5 sm:mt-6">
          <p className="inline-flex items-center gap-1 rounded-full bg-[#E1EEFF] px-4 py-1 text-xs font-bold text-[#2875F5]">
            Explore the community
          </p>

          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            {query
              ? "Search Results"
              : "All Reviews"}
          </h1>

          {query ? (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
              Searching for:
              <strong className="ml-1">
                "{query}"
              </strong>
            </p>
          ) : (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
              Discover genuine experiences
              shared by the community.
            </p>
          )}
        </div>

        {/* =================================================
            FILTERS (Horizontal layout fixed for mobile view)
        ================================================== */}
        <div className="mt-6 sm:mt-8 rounded-xl border bg-background p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">

            {/* Horizontal Grid for Category, Rating, Sort by */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 min-w-0">

              {/* CATEGORY */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] sm:text-sm font-medium block truncate">
                  Category
                </label>

                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setCategory(value);

                      const nextParams =
                        new URLSearchParams(
                          params
                        );

                      if (
                        value === "all"
                      ) {
                        nextParams.delete(
                          "category"
                        );
                      } else {
                        nextParams.set(
                          "category",
                          value
                        );
                      }

                      setParams(
                        nextParams
                      );
                    }
                  }}
                >
                  <SelectTrigger className="h-9 sm:h-11 px-2 sm:px-3 bg-white text-xs sm:text-sm text-[#10182D] border-[#C9D7EA] w-full truncate">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="bg-white border border-slate-200 shadow-md"
                  >
                    <SelectItem value="all">
                      All Categories
                    </SelectItem>

                    {categories.map(
                      (item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* RATING */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] sm:text-sm font-medium block truncate">
                  Rating
                </label>

                <Select
                  value={rating}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setRating(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 sm:h-11 px-2 sm:px-3 bg-white text-xs sm:text-sm text-[#10182D] border-[#C9D7EA] w-full truncate">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="bg-white border border-slate-200 shadow-md"
                  >
                    <SelectItem value="all">
                      Any Rating
                    </SelectItem>

                    <SelectItem value="5">
                      ⭐ 5 stars
                    </SelectItem>

                    <SelectItem value="4">
                      ⭐ 4+ stars
                    </SelectItem>

                    <SelectItem value="3">
                      ⭐ 3+ stars
                    </SelectItem>

                    <SelectItem value="2">
                      ⭐ 2+ stars
                    </SelectItem>

                    <SelectItem value="1">
                      ⭐ 1+ stars
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SORT BY */}
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] sm:text-sm font-medium block truncate">
                  Sort by
                </label>

                <Select
                  value={sort}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setSort(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 sm:h-11 px-2 sm:px-3 bg-white text-xs sm:text-sm text-[#10182D] border-[#C9D7EA] w-full truncate">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="bg-white border border-slate-200 shadow-md"
                  >
                    <SelectItem value="all">
                      All
                    </SelectItem>
                    
                    <SelectItem value="newest">
                      Newest
                    </SelectItem>

                    <SelectItem value="highest-rated">
                      Highest Rated
                    </SelectItem>

                    <SelectItem value="most-helpful">
                      Most Helpful
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* CLEAR FILTERS BUTTON */}
            <div className="pt-2 lg:pt-0">
              <Button
                type="button"
                variant="outline"
                className="h-9 sm:h-11 w-full lg:w-auto px-3 bg-white text-xs sm:text-sm text-[#10182D] border-[#C9D7EA]"
                disabled={!hasFilters}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {!loading &&
          !error &&
          reviews.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}{" "}
                found
              </p>
            </div>
          )}

        {loading && (
          <div className="mt-8 sm:mt-10 py-10 text-center text-xs sm:text-sm text-muted-foreground">
            Loading reviews...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 sm:mt-10 rounded-xl border border-red-200 bg-red-50 p-5 sm:p-6 text-center text-xs sm:text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          reviews.length === 0 && (
            <div className="mt-8 sm:mt-10 rounded-xl border bg-background p-8 sm:p-10 text-center shadow-sm">
              <h2 className="text-base sm:text-lg font-semibold">
                No reviews found
              </h2>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                Try changing your search or
                filters.
              </p>

              {hasFilters && (
                <Button
                  variant="outline"
                  className="mt-4 sm:mt-5 text-xs sm:text-sm"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          reviews.length > 0 && (
            <div className="mt-5 sm:mt-6 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map(
                (review) => (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    userId={review.user_id}
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
                    time={formatReviewTime(
                      review.created_at
                    )}
                    helpfulCount={
                      review.helpful_count ??
                      0
                    }
                    isVerified={Boolean(review.is_verified)}
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

export default SearchResults;