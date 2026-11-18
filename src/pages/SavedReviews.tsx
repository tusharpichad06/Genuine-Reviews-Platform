import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import ReviewCard from "../components/review/ReviewCard";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type SavedReview = {
  id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  user_id: string | null;
  is_verified: boolean;
  author: string;
};

type SavedReviewRow = {
  id: string;
  review_id: string;
  created_at: string;
  review: SavedReview | null;
};

function formatTime(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SavedReviews() {
  const { user } = useAuth();

  const [savedReviews, setSavedReviews] =
    useState<SavedReviewRow[]>([]);

  const [helpfulCounts, setHelpfulCounts] =
    useState<Record<string, number>>({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedReviews() {
      if (!user) {
        setSavedReviews([]);
        setHelpfulCounts({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } =
          await supabase
            .from("saved_reviews")
            .select(`
              id,
              review_id,
              created_at,
              review:reviews!saved_reviews_review_id_fkey (
                id,
                subject,
                category,
                rating,
                title,
                content,
                created_at,
                user_id,
                is_verified
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            });

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        const rows =
          (data ?? []) as unknown as SavedReviewRow[];

        const reviewerIds = rows
          .map((item) => item.review?.user_id)
          .filter(
            (id): id is string => !!id
          );

        const usernameMap: Record<string, string> = {};

        if (reviewerIds.length > 0) {
          const {
            data: profiles,
            error: profilesError,
          } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", reviewerIds);

          if (profilesError) {
            console.error(
              "PROFILE LOAD ERROR:",
              profilesError
            );
          } else {
            for (const profile of profiles ?? []) {
              usernameMap[profile.id] =
                profile.username ?? "User";
            }
          }
        }

        const rowsWithAuthors =
          rows.map((item) => {
            if (!item.review) {
              return item;
            }

            return {
              ...item,
              review: {
                ...item.review,
                author:
                  usernameMap[
                    item.review.user_id ?? ""
                  ] ?? "User",
              },
            };
          });

        setSavedReviews(rowsWithAuthors);

        const reviewIds = rows
          .map((item) => item.review_id)
          .filter(Boolean);

        if (reviewIds.length === 0) {
          setHelpfulCounts({});
          return;
        }

        const {
          data: helpfulData,
          error: helpfulError,
        } = await supabase
          .from("review_helpful")
          .select("review_id")
          .in("review_id", reviewIds);

        if (helpfulError) {
          console.error(
            "HELPFUL COUNT LOAD ERROR:",
            helpfulError
          );

          setHelpfulCounts({});
          return;
        }

        const counts: Record<
          string,
          number
        > = {};

        for (const row of helpfulData ?? []) {
          counts[row.review_id] =
            (counts[row.review_id] ?? 0) + 1;
        }

        if (!cancelled) {
          setHelpfulCounts(counts);
        }
      } catch (error) {
        console.error(
          "SAVED REVIEWS LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setSavedReviews([]);
          setHelpfulCounts({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSavedReviews();

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleUnsave(
    reviewId: string
  ) {
    setSavedReviews((current) =>
      current.filter(
        (item) =>
          item.review_id !== reviewId
      )
    );

    setHelpfulCounts((current) => {
      const next = {
        ...current,
      };

      delete next[reviewId];

      return next;
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-xl border border-[#D6E2F2] bg-white p-6 sm:p-8 text-center shadow-sm">
            <h1 className="text-xl sm:text-2xl font-bold text-[#10182D]">
              Saved Reviews
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Sign in to view your saved reviews.
            </p>

            <Link
              to="/auth?mode=login"
              className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#10182D]">
            Saved Reviews
          </h1>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Reviews you saved for later.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-60 sm:h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-60 sm:h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : savedReviews.length === 0 ? (
          <div className="mt-6 sm:mt-8 rounded-xl border border-dashed border-[#D6E2F2] bg-white p-8 sm:p-10 text-center shadow-sm">
            <p className="text-xs sm:text-sm font-medium text-[#10182D]">
              No saved reviews yet.
            </p>

            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Save reviews from the ⋮ menu to find them here.
            </p>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {savedReviews
              .filter(
                (item) =>
                  item.review !== null
              )
              .map((item) => {
                const review =
                  item.review!;

                return (
                  <ReviewCard
                    key={item.id}
                    id={review.id}
                    userId={review.user_id}
                    onUnsave={handleUnsave}
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
                    author={review.author}
                    time={formatTime(
                      review.created_at
                    )}
                    helpfulCount={
                      helpfulCounts[
                        review.id
                      ] ?? 0
                    }
                    isVerified={
                      review.is_verified
                    }
                  />
                );
              })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}