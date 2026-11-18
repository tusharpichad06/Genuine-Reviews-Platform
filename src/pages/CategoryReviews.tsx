import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReviewCard from "../components/review/ReviewCard";
import { supabase } from "../lib/supabase";
import { Search } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";


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

function CategoryReviews() {
  const { category } = useParams();

  const [reviews, setReviews] = useState<
    ReviewWithProfile[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategoryReviews() {
      try {
        setLoading(true);

        if (!category) {
          if (!cancelled) {
            setReviews([]);
          }

          return;
        }

        /*
         * =====================================================
         * GET CATEGORY
         * =====================================================
         */

        const decodedCategory =
          decodeURIComponent(category);

        /*
         * =====================================================
         * GET REAL REVIEWS
         * =====================================================
         *
         * Same source/format as Latest + Top Reviews.
         *
         * Only published reviews are shown publicly.
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
          .eq("category", decodedCategory)
          .order("created_at", {
            ascending: false,
          });

        if (reviewError) {
          console.error(
            "CATEGORY REVIEWS ERROR:",
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
         * GET UNIQUE USER IDS
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
              "CATEGORY PROFILES ERROR:",
              profilesError
            );
          } else {
            profilesData =
              (data as Profile[]) ?? [];
          }
        }

        /*
         * =====================================================
         * COMBINE REVIEW + PROFILE
         * =====================================================
         *
         * This creates exactly the same data shape
         * that Latest Reviews / Top Reviews send
         * to ReviewCard.
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
                review.helpful_count ??
                0,

              is_verified:
                review.is_verified ??
                false,
            };
          });

        if (!cancelled) {
          setReviews(combinedReviews);
        }
      } catch (error) {
        console.error(
          "CATEGORY REVIEWS ERROR:",
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

    fetchCategoryReviews();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const displayCategory = category
    ? decodeURIComponent(category)
    : "Category";

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

          {/* =================================================
              HEADER
          ================================================== */}

          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-[#E1EEFF] px-3.5 py-1 text-xs font-bold text-[#2875F5] sm:px-4 sm:py-1.5">
              <Search className="h-3 w-3" />
              Explore
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {displayCategory}
            </h1>

            <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-base">
              Reviews in this category.
            </p>
          </div>

          {/* =================================================
              REVIEWS
          ================================================== */}

          {loading ? (
            <div className="mt-6 grid items-stretch gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[280px] animate-pulse rounded-xl border bg-muted/40 sm:h-[300px]"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="mt-6 rounded-xl border border-[#D6E2F2] bg-white px-5 py-8 text-center sm:mt-8 sm:px-6 sm:py-10">
              <p className="text-xs text-[#617493] sm:text-sm">
                No reviews found in this category.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid items-stretch gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
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
                  avatarUrl={review.avatar_url}
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CategoryReviews;