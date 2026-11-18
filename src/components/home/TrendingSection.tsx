import { useEffect, useState } from "react";
import ReviewCard from "../review/ReviewCard";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

type TrendingReview = {
  id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  helpful_count: number | null;
  user_id: string | null;
};

type Profile = {
  id: string;
  username: string;
};

type TrendingReviewWithUsername = TrendingReview & {
  username: string;
  is_verified: boolean;
  trending_score: number;
};

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

/*
 * Calculate a simple trending score.
 *
 * Helpful votes have the strongest influence.
 * Recent reviews receive a freshness bonus.
 * Rating and verification provide smaller bonuses.
 */
function calculateTrendingScore(
  review: TrendingReview,
  isVerified: boolean
) {
  const helpful = review.helpful_count ?? 0;
  const rating = review.rating ?? 0;

  const createdAt = new Date(
    review.created_at
  ).getTime();

  const now = Date.now();

  const ageInHours =
    Math.max(
      0,
      now - createdAt
    ) / (1000 * 60 * 60);

  /*
   * Freshness:
   *
   * 0 hours old  → 20 points
   * 24 hours old → around 10 points
   * 48 hours old → around 6.7 points
   *
   * The score slowly decreases with age.
   */
  const freshnessScore =
    20 /
    (1 + ageInHours / 24);

  /*
   * Helpful votes.
   */
  const helpfulScore =
    helpful * 5;

  /*
   * Rating bonus.
   *
   * Maximum = 5 points.
   */
  const ratingScore =
    rating;

  /*
   * Small verification bonus.
   */
  const verificationScore =
    isVerified ? 2 : 0;

  return (
    helpfulScore +
    freshnessScore +
    ratingScore +
    verificationScore
  );
}

function TrendingSection() {
  const [reviews, setReviews] =
    useState<TrendingReviewWithUsername[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrendingReviews() {
      try {
        setLoading(true);

        /*
         * =====================================================
         * 1. GET RECENT REVIEWS
         * =====================================================
         *
         * We intentionally get more than 3 reviews.
         *
         * This gives the trending algorithm enough reviews
         * to compare before selecting the final 3.
         */

        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("review_stats")
          .select(
            "id, subject, category, rating, title, content, created_at, helpful_count, user_id"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(30);

        if (reviewError) {
          console.error(
            "TRENDING REVIEWS ERROR:",
            reviewError
          );

          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const reviewsData =
          (reviewData as TrendingReview[]) ??
          [];

        if (reviewsData.length === 0) {
          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        /*
         * =====================================================
         * CHECK REVIEW VISIBILITY
         * =====================================================
         *
         * AdminReports hides reviews by setting
         * reviews.status = "hidden".
         *
         * Only reviews that are not hidden should
         * appear publicly in Trending Reviews.
         */

        const reviewIds =
          reviewsData.map(
            (review) => review.id
          );

        const {
          data: visibilityData,
          error: visibilityError,
        } = await supabase
          .from("reviews")
          .select("id, status")
          .in("id", reviewIds)
          .eq("status", "published");

        if (visibilityError) {
          console.error(
            "TRENDING VISIBILITY ERROR:",
            visibilityError
          );

          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const publishedReviewIds = new Set(
          (visibilityData ?? []).map(
            (review) => review.id
          )
        );

        const visibleReviewsData =
          reviewsData.filter((review) =>
            publishedReviewIds.has(review.id)
          );

        if (visibleReviewsData.length === 0) {
          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        /*
         * =====================================================
         * 2. GET VERIFICATION STATUS
         * =====================================================
         */

        const visibleReviewIds =
          visibleReviewsData.map(
            (review) => review.id
          );

        const {
          data: verificationData,
          error: verificationError,
        } = await supabase
          .from("reviews")
          .select(
            "id, is_verified"
          )
          .in("id", visibleReviewIds);

        if (verificationError) {
          console.error(
            "TRENDING VERIFICATION ERROR:",
            verificationError
          );
        }

        /*
         * =====================================================
         * 3. GET USER IDS
         * =====================================================
         */

        const userIds = [
          ...new Set(
            visibleReviewsData
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

        /*
         * =====================================================
         * 4. GET PROFILES
         * =====================================================
         */

        let profilesData: Profile[] =
          [];

        if (userIds.length > 0) {
          const {
            data,
            error: profilesError,
          } = await supabase
            .from("profiles")
            .select(
              "id, username"
            )
            .in(
              "id",
              userIds
            );

          if (profilesError) {
            console.error(
              "TRENDING PROFILES ERROR:",
              profilesError
            );
          } else {
            profilesData =
              (data as Profile[]) ??
              [];
          }
        }

        /*
         * =====================================================
         * 5. COMBINE DATA + CALCULATE TRENDING SCORE
         * =====================================================
         */

        const combinedReviews =
          visibleReviewsData.map(
            (review) => {
              const profile =
                profilesData.find(
                  (profile) =>
                    profile.id ===
                    review.user_id
                );

              const verification =
                verificationData?.find(
                  (item) =>
                    item.id ===
                    review.id
                );

              const isVerified =
                verification
                  ?.is_verified ??
                false;

              const helpfulCount =
                review.helpful_count ??
                0;

              const trendingScore =
                calculateTrendingScore(
                  {
                    ...review,
                    helpful_count:
                      helpfulCount,
                  },
                  isVerified
                );

              return {
                ...review,

                helpful_count:
                  helpfulCount,

                username:
                  profile?.username ??
                  "Unknown user",

                is_verified:
                  isVerified,

                trending_score:
                  trendingScore,
              };
            }
          );

        /*
         * =====================================================
         * 6. SORT BY TRENDING SCORE
         * =====================================================
         */

        combinedReviews.sort(
          (a, b) =>
            b.trending_score -
            a.trending_score
        );

        /*
         * =====================================================
         * 7. TAKE TOP 3
         * =====================================================
         */

        const topTrendingReviews =
          combinedReviews.slice(
            0,
            3
          );

        if (!cancelled) {
          setReviews(
            topTrendingReviews
          );
        }
      } catch (error) {
        console.error(
          "TRENDING REVIEWS ERROR:",
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

    fetchTrendingReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-6 sm:py-10">
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          rounded-2xl
          border
          border-blue-100
          bg-gradient-to-br
          from-white
          via-blue-50/40
          to-cyan-50/40
          px-3.5
          py-4
          shadow-sm
          sm:px-5
          sm:py-6
          lg:px-6
        "
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div>
          {/* Blue pill */}

          <div
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-[#dffaf6]
              px-3
              py-1.5
              text-xs
              font-semibold
              text-[#0aa58f]
              sm:gap-2
              sm:px-4
              sm:text-sm
            "
          >
            <span
              className="
                flex
                size-5
                items-center
                justify-center
                rounded-full
                bg-green-500
                text-[11px]
                text-white
              "
            >
              🔥
            </span>

            Trending Now
          </div>

          {/* Heading */}

          <h2
            className="
              mt-2
              text-xl
              font-bold
              leading-tight
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            Reviews People Are Reading
          </h2>

          {/* Description + View All */}

          <div
            className="
              mt-2
              flex
              items-start
              justify-between
              gap-3
              sm:items-center
              sm:gap-4
            "
          >
            <p
              className="
                min-w-0
                max-w-2xl
                text-xs
                leading-5
                text-black-700/80
                sm:text-base
              "
            >
              See what the community is talking about
              right now.
            </p>

            <Link
              to="/trending-reviews"
              className="
                shrink-0
                whitespace-nowrap
                text-xs
                font-semibold
                text-blue-600
                transition-colors
                hover:text-blue-800
                hover:underline
                sm:text-sm
              "
            >
              View All →
            </Link>
          </div>
        </div>

        {/* =================================================
            REVIEWS
        ================================================== */}

        {loading ? (
          <div
            className="
              mt-5
              grid
              items-stretch
              gap-3
              sm:mt-6
              sm:gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-[280px]
                  animate-pulse
                  rounded-xl
                  border
                  border-blue-100
                  bg-white/80
                  sm:h-[300px]
                "
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p
            className="
              mt-5
              text-sm
              text-slate-500
              sm:mt-6
            "
          >
            No trending reviews yet.
          </p>
        ) : (
          <div
            className="
              mt-5
              grid
              items-stretch
              gap-3
              sm:mt-6
              sm:gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-blue-100
                  bg-white
                  shadow-[0_3px_12px_rgba(37,99,235,0.08)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-blue-200
                  hover:shadow-[0_8px_22px_rgba(37,99,235,0.12)]
                "
              >
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  userId={review.user_id}
                  subjectName={review.subject}
                  category={review.category}
                  rating={
                    review.rating ?? undefined
                  }
                  title={
                    review.title ?? undefined
                  }
                  content={review.content}
                  author={review.username}
                  time={formatReviewTime(
                    review.created_at
                  )}
                  helpfulCount={
                    review.helpful_count ?? 0
                  }
                  isVerified={
                    review.is_verified ?? false
                  }
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default TrendingSection;