import { useEffect, useState } from "react";
import ReviewCard from "../components/review/ReviewCard";
import SearchBar from "../components/home/SearchBar";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

type Review = {
  id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  helpful_count: number | null;
  user_id: string | null;
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
  helpful_count: number;
  is_verified: boolean;
};

function calculateTopReviewScore(
  review: Review
) {
  const rating =
    review.rating ?? 0;

  const helpful =
    review.helpful_count ?? 0;

  const ratingScore =
    rating * 10;

  const helpfulScore =
    helpful * 3;

  const verificationScore =
    review.is_verified ? 5 : 0;

  const createdAt =
    new Date(
      review.created_at
    ).getTime();

  const ageInDays =
    Math.max(
      0,
      Date.now() - createdAt
    ) /
    (1000 * 60 * 60 * 24);

  const freshnessScore =
    10 /
    (1 + ageInDays / 30);

  return (
    ratingScore +
    helpfulScore +
    verificationScore +
    freshnessScore
  );
}

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

function TopReviewsPage() {
  const [reviews, setReviews] =
    useState<ReviewWithProfile[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setLoading(true);

        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("reviews")
          .select(
            "id, subject, category, rating, title, content, created_at, helpful_count, user_id, is_verified"
          )
          .eq("status", "published")
          .not("rating", "is", null)
          .order("created_at", {
            ascending: false,
          });

        if (reviewError) {
          console.error(
            "TOP REVIEWS PAGE ERROR:",
            reviewError
          );

          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const reviewsData =
          (reviewData as Review[]) ??
          [];

        const scoredReviews =
          reviewsData.map(
            (review) => ({
              review,
              score:
                calculateTopReviewScore(
                  review
                ),
            })
          );

        scoredReviews.sort(
          (a, b) => {
            if (
              b.score !==
              a.score
            ) {
              return (
                b.score -
                a.score
              );
            }

            return a.review.id.localeCompare(
              b.review.id
            );
          }
        );

        const sortedReviews =
          scoredReviews.map(
            (item) =>
              item.review
          );

        const userIds = [
          ...new Set(
            sortedReviews
              .map(
                (review) =>
                  review.user_id
              )
              .filter(
                (
                  id
                ): id is string =>
                  Boolean(id)
              )
          ),
        ];

        let profilesData: Profile[] =
          [];

        if (
          userIds.length > 0
        ) {
          const {
            data,
            error,
          } = await supabase
            .from("profiles")
            .select(
              "id, username, avatar_url"
            )
            .in(
              "id",
              userIds
            );

          if (error) {
            console.error(
              "TOP PROFILE ERROR:",
              error
            );
          } else {
            profilesData =
              (data as Profile[]) ?? [];
          }
        }

        const profileMap =
          new Map(
            profilesData.map(
              (profile) => [
                profile.id,
                profile,
              ]
            )
          );

        const formattedReviews =
          sortedReviews.map(
            (review) => {
              const profile =
                review.user_id
                  ? profileMap.get(
                      review.user_id
                    )
                  : undefined;

              return {
                ...review,

                username:
                  profile?.username ??
                  "Unknown user",

                avatar_url:
                  profile?.avatar_url ??
                  null,

                helpful_count:
                  review.helpful_count ??
                  0,

                is_verified:
                  review.is_verified ??
                  false,
              };
            }
          );

        if (!cancelled) {
          setReviews(
            formattedReviews
          );
        }
      } catch (error) {
        console.error(
          "TOP REVIEWS PAGE ERROR:",
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

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Search */}
        <SearchBar />

        {/* Header */}
        <div className="mt-6 sm:mt-10">
          <p className="text-xs sm:text-sm font-medium text-primary">
            Community favorites
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Top Reviews
          </h1>

          <p className="mt-1.5 max-w-2xl text-xs sm:text-base text-muted-foreground">
            Explore reviews that the community has found especially helpful.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-6 grid items-stretch gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[280px] sm:h-[300px] animate-pulse rounded-xl border bg-muted/40"
                />
              )
            )}
          </div>
        ) : reviews.length === 0 ? (
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
            No rated reviews yet.
          </p>
        ) : (
          <div className="mt-6 sm:mt-8 grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                  avatarUrl={
                    review.avatar_url
                  }
                  time={formatReviewTime(
                    review.created_at
                  )}
                  helpfulCount={
                    review.helpful_count
                  }
                  isVerified={
                    review.is_verified
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TopReviewsPage;