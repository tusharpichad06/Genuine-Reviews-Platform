import {
  BriefcaseBusiness,
  Car,
  Coffee,
  GraduationCap,
  HeartPulse,
  Laptop,
  MapPin,
  ShoppingBag,
  Cpu,
  Building2
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";


const categories = [
  {
    name: "Products",
    icon: ShoppingBag,
  },
  {
    name: "Services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Places",
    icon: MapPin,
  },
  {
    name: "Food & Restaurants",
    icon: Coffee,
  },
  {
    name: "Electronics",
    icon: Laptop,
  },
  {
    name: "Travel",
    icon: MapPin,
  },
  {
    name: "Education",
    icon: GraduationCap,
  },
  {
    name: "Health & Wellness",
    icon: HeartPulse,
  },
  {
    name: "Automotive",
    icon: Car,
  },
  {
    name: "Technology",
    icon: Cpu,
  },

  {
    name: "Business",
    icon: Building2,
    
  },

  {
    name: "Other",
    icon: BriefcaseBusiness,
  },
];

function Categories() {
  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#174A8B] sm:text-3xl">
            Categories
          </h1>

          <p className="mt-1 text-xs text-[#617493] sm:mt-2 sm:text-sm">
            Browse reviews by category.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                to={`/categories/${encodeURIComponent(category.name)}`}
                className="group rounded-xl border border-[#BFD9F5] bg-white p-4 text-left shadow-[3px_4px_0px_#D7E7F8] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 sm:shadow-[4px_5px_0px_#D7E7F8]"
              >
                {/* Category Icon */}

                <div className="mb-3 flex size-9 sm:size-10 items-center justify-center rounded-xl bg-transparent sm:mb-4">
                  <Icon
                    className={`size-5 ${
                      category.name === "Services" ||
                      category.name === "Food & Restaurants" ||
                      category.name === "Travel" ||
                      category.name === "Health & Wellness" ||
                      category.name === "Technology"
                        ? "text-[#00C781]"
                        : "text-[#2875F5]"
                    }`}
                  />
                </div>

                <h2 className="text-sm font-semibold text-[#10182D] sm:text-base">
                  {category.name}
                </h2>
              </Link>
            );
          })}
        </div>
        
      </div>
      <Footer />
    </div>
  );
}

export default Categories;