import {
  BriefcaseBusiness,
  Car,
  Coffee,
  GraduationCap,
  HeartPulse,
  Laptop,
  MapPin,
  ShoppingBag,
  Compass,
} from "lucide-react";

import { Link } from "react-router-dom";

const categories = [
  {
    name: "Products",
    
    description: "Phones, electronics, gadgets and more",
    icon: ShoppingBag,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    name: "Services",
    
    description: "Apps, websites, companies and services",
    icon: BriefcaseBusiness,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    name: "Places",
    
    description: "Hotels, attractions and local places",
    icon: MapPin,
    iconStyle: "bg-amber-100 text-amber-500",
  },
  {
    name: "Food & Restaurants",
    
    description: "Restaurants, cafes and food experiences",
    icon: Coffee,
    iconStyle: "bg-purple-100 text-purple-600",
  },
  {
    name: "Education",
    
    description: "Courses, schools and learning platforms",
    icon: GraduationCap,
    iconStyle: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Health & Wellness",
    
    description: "Healthcare products and wellness services",
    icon: HeartPulse,
    iconStyle: "bg-pink-100 text-pink-600",
  },
  {
    name: "Automotive",
    
    description: "Cars, bikes and automotive services",
    icon: Car,
    iconStyle: "bg-orange-100 text-orange-600",
  },
  {
    name: "Technology",
    
    description: "Software, apps and technology",
    icon: Laptop,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  
];

function CategorySection() {
  return (
    <section className="px-3.5 py-6 sm:px-10 sm:py-14 lg:px-16">
      <div className="mx-auto max-w-[1400px] rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/50 px-3.5 py-4 shadow-[0_8px_30px_rgba(37,99,235,0.06)] sm:rounded-3xl sm:px-6 sm:py-6">
        {/* Header */}

        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-7 sm:items-end sm:gap-4">
          <div className="min-w-0">

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-gradient-to-r from-blue-100 to-cyan-50 px-2.5 py-1 text-xs font-semibold text-blue-700 sm:gap-2 sm:px-3 sm:text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white sm:size-6">
                <Compass className="size-3 sm:size-3.5" />
              </span>

              Explore
            </div>

            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Explore Reviews by Category
            </h2>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-black-700/75 sm:mt-2 sm:text-base">
              Find genuine experiences across products, services, places and more.
            </p>
          </div>

          {/* View All */}

          <Link
            to="/categories"
            className="shrink-0 whitespace-nowrap pt-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline sm:pt-0 sm:text-sm"
          >
            View All →
          </Link>
        </div>

        {/* Homepage Categories */}

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                to={`/categories/${encodeURIComponent(category.name)}`}
                className="group rounded-xl border border-blue-100 bg-white p-4 text-left shadow-[0_3px_12px_rgba(37,99,235,0.04)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_22px_rgba(37,99,235,0.10)] sm:rounded-2xl sm:p-5"
              >
                <div
                  className={`
                    mb-3
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-xl
                    ${category.iconStyle}
                    sm:mb-4
                    sm:size-10
                  `}
                >
                  <Icon className="size-4.5 sm:size-5" />
                </div>

                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-black-700/65 sm:text-sm">
                  {category.description}
                </p>

                <span className="mt-3 inline-block text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700 sm:mt-4 sm:text-sm">
                  Explore →
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default CategorySection;