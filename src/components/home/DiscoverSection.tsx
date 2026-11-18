import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";

type Category =
  | "Products"
  | "Services"
  | "Places";

type Review = {
  subject: string;
  category: string;
  rating: number | null;
};

function DiscoverSection() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
    useState<Category>("Products");

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * =====================================================
   * FETCH REVIEWS
   * =====================================================
   */
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);

      try {
        const {
          data,
          error,
        } = await supabase
          .from("reviews")
          .select(
            "subject, category, rating"
          )
          .not("subject", "is", null);

        if (error) {
          console.error(
            "DISCOVER REVIEWS ERROR:",
            error
          );

          setReviews([]);
          return;
        }

        setReviews(
          (data as Review[]) ?? []
        );
      } catch (error) {
        console.error(
          "DISCOVER ERROR:",
          error
        );

        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  /*
   * =====================================================
   * CATEGORIES
   * =====================================================
   */
  const categories: Category[] = [
    "Products",
    "Services",
    "Places",
  ];

  /*
   * =====================================================
   * BUILD DISCOVER ITEMS
   * =====================================================
   */
  const categoryItems =
    reviews
      .filter(
        (review) =>
          review.category ===
          activeCategory
      )
      .reduce<
        Record<
          string,
          {
            name: string;
            ratingTotal: number;
            ratingCount: number;
            reviews: number;
          }
        >
      >((acc, review) => {
        const name =
          review.subject.trim();

        if (!name) {
          return acc;
        }

        if (!acc[name]) {
          acc[name] = {
            name,
            ratingTotal: 0,
            ratingCount: 0,
            reviews: 0,
          };
        }

        acc[name].reviews += 1;

        if (
          review.rating !== null
        ) {
          acc[name].ratingTotal +=
            review.rating;

          acc[name].ratingCount += 1;
        }

        return acc;
      }, {});

  const items = Object.values(
    categoryItems
  )
    .map((item) => ({
      ...item,
      rating:
        item.ratingCount > 0
          ? item.ratingTotal /
            item.ratingCount
          : 0,
    }))
    .sort(
      (a, b) =>
        b.reviews - a.reviews
    )
    .slice(0, 3);

  return (
    <section className="px-6 py-14 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================== */}
        <div className="mb-7">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Discover
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Discover More
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Explore highly reviewed products,
            services and places.
          </p>
        </div>

        {/* =================================================
            CATEGORY BUTTONS
        ================================================== */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(
            (category) => (
          <Button
            key={category}
            variant={
              activeCategory === category
                ? "default"
                : "outline"
            }
            className={
              activeCategory === category
                ? "rounded-full"
                : "rounded-md"
            }
      onClick={() => {
        setActiveCategory(category);
        navigate(
          `/search?category=${encodeURIComponent(category)}`
        );
      }}
          >
            {category}
          </Button>
            )
          )}
        </div>

        {/* =================================================
            LOADING
        ================================================== */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-2xl border bg-muted/40"
                />
              )
            )}
          </div>
        ) : items.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================== */
          <div className="rounded-2xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No reviews found in this
              category yet.
            </p>
          </div>
        ) : (
          /* =================================================
             REVIEWED SUBJECTS
          ================================================== */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="font-semibold">
                  {item.name}
                </h3>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm tracking-wide">
                    ★★★★★
                  </span>

                  <span className="text-sm font-medium">
                    {item.rating > 0
                      ? item.rating.toFixed(
                          1
                        )
                      : "No rating"}
                  </span>
                </div>

                {/* Review count */}
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.reviews}{" "}
                  {item.reviews === 1
                    ? "review"
                    : "reviews"}
                </p>

                {/* View reviews */}
                <button
                  type="button"
                  className="mt-4 text-sm font-medium underline-offset-4 hover:underline"
                  id="h7k2qm"
                  onClick={() => {
  window.location.href =
    `/search?category=${encodeURIComponent(
      activeCategory
    )}&q=${encodeURIComponent(
      item.name
    )}`;
}}
                >
                  View reviews →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DiscoverSection;