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
  user_id: string | null;
  helpful_count: number | null;
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

function LatestReviews() {
  const [reviews, setReviews] = useState<ReviewWithUsername[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatestReviews() {
      try {
        setLoading(true);

        /*
         * =====================================================
         * GET LATEST REVIEWS
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
          .eq("status", "published")
          .order("created_at", {
            ascending: false,
          })
          .limit(6);

        if (reviewError) {
          console.error(
            "LATEST REVIEWS ERROR:",
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
         * GET UNIQUE USER IDS
         * =====================================================
         */

        const userIds = [
          ...new Set(
            reviewsData
              .map((review) => review.user_id)
              .filter(
                (userId): userId is string =>
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
            .select("id, username, avatar_url")
            .in("id", userIds);

          if (profilesError) {
            console.error(
              "LATEST PROFILES ERROR:",
              profilesError
            );
          } else {
            profilesData =
              (data as Profile[]) ?? [];
          }
        }

        /*
         * =====================================================
         * COMBINE REVIEW + USERNAME
         * =====================================================
         */

        const combinedReviews =
          reviewsData.map((review) => {
            const profile =
              profilesData.find(
                (profile) =>
                  profile.id === review.user_id
              );

            return {
              ...review,

              username:
                profile?.username ??
                "Unknown user",

              avatar_url:
                profile?.avatar_url ?? null,

              helpful_count:
                review.helpful_count ?? 0,

              is_verified:
                review.is_verified ?? false,
            };
          });

        if (!cancelled) {
          setReviews(combinedReviews);
        }
      } catch (error) {
        console.error(
          "LATEST REVIEWS ERROR:",
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

    fetchLatestReviews();

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
              👥
            </span>

            Fresh from the Community
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
            Latest Reviews
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
              See the newest experiences shared by
              the community.
            </p>

            <Link
              to="/latest-reviews"
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
            No reviews yet. Be the first to share
            your experience!
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
                  avatarUrl={review.avatar_url}
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

export default LatestReviews;