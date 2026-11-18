import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import CategorySection from "../components/home/CategorySection";
import { Button } from "../components/ui/button";
import { Pencil } from "lucide-react";
import TrendingSection from "../components/home/TrendingSection";
import LatestReviews from "../components/home/LatestReviews";
import TopReviews from "../components/home/TopReviews";

function Home() {
  return (
    <Layout>
      <Hero />

      <SearchBar />

      {/* Write Review */}
      <div className="flex justify-center px-4 py-6 sm:px-6 sm:py-8">
        <Button
          size="lg"
          onClick={() => {
            window.location.href = "/write-review";
          }}
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[#1d6ff2]
            bg-[#1d6ff2]
            px-6
            py-3.5
            text-sm
            font-semibold
            text-white
            shadow-[0_8px_20px_rgba(29,111,242,0.20)]
            transition-all
            duration-200
            hover:bg-[#155dcc]
            hover:shadow-[0_10px_24px_rgba(29,111,242,0.28)]
            hover:-translate-y-[1px]
            sm:px-8
            sm:py-4
            sm:text-base
          "
        >
          <Pencil className="h-5 w-5 shrink-0" />
          <span>Write a Review</span>
        </Button>
      </div>

      <TrendingSection />

      <LatestReviews />

      <CategorySection />

      <TopReviews />
    </Layout>
  );
}

export default Home;