import { useEffect, useState } from "react";
import ReviewCard from "../review/ReviewCard";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

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

type ReviewWithUsername = Review & {
  username: string;
  avatar_url: string | null;
};

/*
 * ============================================================
 * TOP REVIEW SCORE
 * ============================================================
 *
 * Top Reviews focuses on overall review quality.
 *
 * Rating       → strongest factor
 * Helpful      → strong community signal
 * Verified     → small trust bonus
 * Recency      → small bonus so very old reviews don't
 *                dominate forever
 */
function calculateTopReviewScore(
  review: Review
) {
  const rating = review.rating ?? 0;
  const helpful = review.helpful_count ?? 0;

  /*
   * Rating score
   *
   * 5-star review = 50 points
   * 4-star review = 40 points
   */
  const ratingScore = rating * 10;

  /*
   * Helpful score
   *
   * Each helpful vote contributes 3 points.
   */
  const helpfulScore = helpful * 3;

  /*
   * Verification bonus
   */
  const verificationScore =
    review.is_verified ? 5 : 0;

  /*
   * Small recency bonus.
   *
   * Maximum = 10 points.
   *
   * This should not overpower rating/helpfulness.
   */
  const createdAt = new Date(
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

function TopReviews() {
  const [reviews, setReviews] =
    useState<ReviewWithUsername[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchTopReviews() {
      try {
        setLoading(true);

        /*
         * =====================================================
         * GET CANDIDATE REVIEWS
         * =====================================================
         *
         * We fetch more than 3 reviews because the final
         * ordering will be calculated locally.
         */

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
          })
          .limit(30);

        if (reviewError) {
          console.error(
            "TOP REVIEWS ERROR:",
            reviewError
          );

          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        const reviewsData =
          (reviewData as Review[]) ?? [];

        if (reviewsData.length === 0) {
          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        /*
         * =====================================================
         * CALCULATE TOP REVIEW SCORE
         * =====================================================
         */

        const scoredReviews =
          reviewsData.map((review) => ({
            review,
            score:
              calculateTopReviewScore(
                review
              ),
          }));

        /*
         * Highest quality first.
         *
         * ID is used as a final deterministic tie-breaker
         * so equal scores don't randomly change order.
         */

        scoredReviews.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          return a.review.id.localeCompare(
            b.review.id
          );
        });

        /*
         * Only keep the top 3 after scoring.
         */

        const topReviews =
          scoredReviews
            .slice(0, 3)
            .map((item) => item.review);

        /*
         * =====================================================
         * GET UNIQUE USER IDS
         * =====================================================
         */

        const userIds = [
          ...new Set(
            topReviews
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
         * GET PROFILES
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
              "TOP PROFILES ERROR:",
              profilesError
            );
          } else {
            profilesData =
              (data as Profile[]) ?? [];
          }
        }

        /*
         * =====================================================
         * COMBINE DATA
         * =====================================================
         */

        const combinedReviews =
          topReviews.map((review) => {
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
          "TOP REVIEWS ERROR:",
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

    fetchTopReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-6 sm:py-10">
      {/* =================================================
          MAIN SECTION CONTAINER
      ================================================== */}

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
              py-1
              text-xs
              font-semibold
              text-[#0aa58f]
              sm:gap-2
              sm:px-4
              sm:py-1.5
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
              ⭐
            </span>

            Community favorites
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
            Top Reviews
          </h2>

          {/* Description + View All */}

          <div
            className="
              mt-2
              flex
              items-start
              justify-between
              gap-3
              sm:mt-1
              sm:items-center
              sm:gap-4
            "
          >
            <p
              className="
                max-w-2xl
                text-xs
                leading-5
                text-black-700/80
                sm:text-base
              "
            >
              Reviews that the community has found
              especially helpful.
            </p>

            <Link
              to="/top-reviews"
              className="
                shrink-0
                whitespace-nowrap
                pt-0.5
                text-xs
                font-semibold
                text-blue-600
                transition-colors
                hover:text-blue-800
                hover:underline
                sm:pt-0
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
              md:grid-cols-2
              lg:grid-cols-3
              sm:mt-6
              sm:gap-4
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
            No rated reviews yet.
          </p>
        ) : (
          <div
            className="
              mt-5
              grid
              items-stretch
              gap-3
              md:grid-cols-2
              lg:grid-cols-3
              sm:mt-6
              sm:gap-4
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
                    review.rating ??
                    undefined
                  }
                  title={
                    review.title ??
                    undefined
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

export default TopReviews;