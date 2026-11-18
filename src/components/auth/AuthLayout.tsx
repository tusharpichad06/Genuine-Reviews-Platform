import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef8ff] px-3 py-6 sm:px-4 sm:py-10">
      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="mb-6 text-center sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 sm:gap-3"
          >
            <div
              className="
                flex
                size-8
                items-center
                justify-center
                rounded-xl
                border
                border-blue-400/60
                bg-blue-500/10
                text-lg
                text-blue-300
                sm:size-9
                sm:text-xl
              "
            >
              🛡
            </div>

            <span className="text-xl font-bold tracking-tight text-[#10182D] sm:text-2xl">
              Genuine Reviews
            </span>
          </Link>

          <p className="mt-2.5 px-2 text-xs leading-5 text-[#617493] sm:mt-3 sm:px-0 sm:text-sm sm:leading-normal">
            Honest reviews from real people.
            <br />
            Helping everyone make better decisions.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-8 shadow-xl shadow-blue-100/40">
          {children}
        </div>

      </div>
    </div>
  );
}