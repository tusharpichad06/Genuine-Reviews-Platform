import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Electronics",
    icon: "📱",
  },
  {
    name: "Food & Drinks",
    icon: "🍔",
  },
  {
    name: "Entertainment",
    icon: "🎬",
  },
  {
    name: "Apps & Software",
    icon: "💻",
  },
  {
    name: "Hotels & Travel",
    icon: "🏨",
  },
  {
    name: "Education",
    icon: "🎓",
  },
  {
    name: "Healthcare",
    icon: "🏥",
  },
  {
    name: "Automobiles",
    icon: "🚗",
  },
  {
    name: "Shopping",
    icon: "🛒",
  },
  {
    name: "Fitness",
    icon: "🏋️",
  },
  {
    name: "Services",
    icon: "💼",
  },
  {
    name: "Other",
    icon: "🌍",
  },
];

function PopularCategories() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-10 lg:px-16">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Explore by topic
          </p>

          <h2 className="mt-1 text-xl sm:text-3xl font-bold tracking-tight">
            Popular Categories
          </h2>

          <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-base text-muted-foreground">
            Find genuine experiences across the things that matter to you.
          </p>
        </div>

        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => navigate(`/search?category=${encodeURIComponent(category.name)}`)}
              className="group flex items-center gap-2.5 sm:gap-3 rounded-xl border bg-background p-3 sm:p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-base sm:text-xl">
                {category.icon}
              </span>

              <span className="text-xs sm:text-sm font-medium group-hover:underline truncate">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCategories;