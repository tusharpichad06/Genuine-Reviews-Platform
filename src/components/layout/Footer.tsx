import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-10 border-t border-blue-200/40 bg-[#102D52] text-white sm:mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-10 lg:px-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-8 lg:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="flex w-fit items-center gap-2"
            >
              <div
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-400/60
                  bg-blue-500/10
                  text-xl
                  text-blue-300
                "
              >
                🛡
              </div>

              <span className="font-semibold text-white">
                Genuine Reviews
              </span>
            </Link>

            <p
              className="
                mt-3
                max-w-xs
                text-xs
                leading-5
                text-blue-100/75
                sm:text-sm
                sm:leading-6
              "
            >
              Honest reviews from real experiences. Discover what people
              genuinely think before you decide.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Explore
            </h3>

            <nav
              className="
                mt-3
                flex
                flex-col
                gap-2.5
                text-xs
                text-blue-100/75
                sm:mt-4
                sm:gap-3
                sm:text-sm
              "
            >
              <Link
                to="/reviews"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                All Reviews
              </Link>

              <Link
                to="/categories"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Categories
              </Link>

              <Link
                to="/search"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Search
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Community
            </h3>

            <nav
              className="
                mt-3
                flex
                flex-col
                gap-2.5
                text-xs
                text-blue-100/75
                sm:mt-4
                sm:gap-3
                sm:text-sm
              "
            >
              <Link
                to="/write-review"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Write a Review
              </Link>

              <Link
                to="/guidelines"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Guidelines
              </Link>

              <Link
                to="/contact"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Genuine Reviews */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Genuine Reviews
            </h3>

            <nav
              className="
                mt-3
                flex
                flex-col
                gap-2.5
                text-xs
                text-blue-100/75
                sm:mt-4
                sm:gap-3
                sm:text-sm
              "
            >
              <Link
                to="/about"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                About Us
              </Link>

              <Link
                to="/privacy"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="
                  w-fit
                  py-0.5
                  transition-colors
                  hover:text-white
                "
              >
                Terms & Conditions
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
            mt-8
            flex
            flex-col
            gap-2
            border-t
            border-blue-200/20
            pt-5
            text-[11px]
            leading-5
            text-blue-100/70
            sm:mt-10
            sm:gap-3
            sm:pt-6
            sm:text-xs
            sm:leading-normal
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © 2026 Genuine Reviews. All rights reserved.
          </p>

          <p>
            Honest opinions. Real experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;