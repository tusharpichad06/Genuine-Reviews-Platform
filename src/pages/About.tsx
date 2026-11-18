import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Pencil,
  Users,
  Check,
  Search,
  ThumbsUp,
  MessageCircle,
  Heart,
  Lightbulb,
  Handshake,
  Star,
  ArrowRight,
  User,
  Store,
  BriefcaseBusiness,
  FileText,
  Building2,
  UserRound,
} from "lucide-react";

import Layout from "../components/layout/Layout";


function About() {
  return (
    <Layout>
      <main className="min-h-screen overflow-x-hidden bg-[#eef8ff] text-[#10182D]">

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-6 lg:px-10">

          
          {/* =====================================================
              HERO
          ===================================================== */}

          <section
            className="
              relative
              mt-2
              grid
              items-center
              gap-6
              sm:mt-6
              sm:gap-8
              lg:grid-cols-[1.05fr_0.95fr]
              lg:gap-10
            "
          >

            {/* Decorative background circles */}

            <div
              className="
                pointer-events-none
                absolute
                -left-24
                top-24
                hidden
                size-36
                rounded-full
                bg-[#DDF1FF]
                lg:block
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                right-[-30px]
                top-[-20px]
                hidden
                size-40
                rounded-full
                bg-[#E5F4FF]
                lg:block
              "
            />

            {/* LEFT */}

            <div className="relative z-10">

              <div className="mb-3 hidden items-center gap-3 sm:flex">

              </div>

              <h1
                className="
                  max-w-xl
                  text-3xl
                  font-extrabold
                  leading-[1.1]
                  tracking-tight
                  text-[#174A91]
                  sm:text-5xl
                  sm:leading-[1.05]
                  lg:text-[48px]
                "
              >
                About Genuine
                <br />
                Reviews
              </h1>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  font-medium
                  leading-6
                  text-[#5279B2]
                  sm:mt-4
                  sm:text-lg
                  sm:leading-8
                "
              >
                A platform where people share genuine
                experiences and discover reviews from
                others to make more informed decisions.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">

                <Link
                  to="/reviews"
                  className="
                    inline-flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#1688F8]
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#0D75DC]
                    hover:shadow-md
                    sm:w-auto
                  "
                >
                  <Search className="h-4 w-4" />
                  Explore Reviews
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/write-review"
                  className="
                    inline-flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-[#9DCEF7]
                    bg-white/80
                    px-5
                    text-sm
                    font-bold
                    text-[#2875F5]
                    transition
                    hover:border-[#2875F5]
                    hover:bg-white
                    sm:w-auto
                  "
                >
                  <Pencil className="h-4 w-4" />
                  Write a Review
                </Link>

              </div>
            </div>

            {/* RIGHT HERO ILLUSTRATION (Visible & scaled on mobile, untouched on lg) */}

            <div
              className="
                relative
                mx-auto
                block
                min-h-[225px]
                w-full
                max-w-[360px]
                overflow-hidden
                rounded-[42%]
                bg-[#E5F4FF]
                sm:max-w-[440px]
                sm:min-h-[260px]
                lg:mx-0
                lg:max-w-none
                lg:min-h-[275px]
                lg:rounded-[45%]
              "
            >

              {/* Clouds / circles */}

              <div
                className="
                  absolute
                  left-8
                  top-14
                  size-20
                  rounded-full
                  bg-[#D5ECFF]
                  sm:left-14
                  sm:top-20
                  sm:size-28
                "
              />

              <div
                className="
                  absolute
                  left-24
                  top-8
                  size-24
                  rounded-full
                  bg-[#CFE9FF]
                  sm:left-36
                  sm:top-12
                  sm:size-32
                "
              />

              <div
                className="
                  absolute
                  right-6
                  top-10
                  size-28
                  rounded-full
                  bg-[#D5ECFF]
                  sm:right-10
                  sm:top-14
                  sm:size-36
                "
              />

              {/* Person / review illustration */}

              <div
                className="
                  absolute
                  bottom-3
                  left-1/2
                  h-44
                  w-[330px]
                  -translate-x-1/2
                  origin-bottom
                  scale-[0.82]
                  sm:bottom-6
                  sm:scale-100
                "
              >

                {/* Left person */}

                <div className="absolute bottom-8 left-3">

                  <div
                    className="
                      mx-auto
                      size-12
                      rounded-full
                      border-4
                      border-white
                      bg-[#F3C7A8]
                      shadow-sm
                    "
                  />

                  <div
                    className="
                      mt-[-2px]
                      h-20
                      w-16
                      rounded-t-[28px]
                      bg-[#1688F8]
                    "
                  />

                  <div
                    className="
                      absolute
                      left-7
                      top-7
                      h-7
                      w-10
                      rounded-t-full
                      bg-[#174A91]
                    "
                  />

                </div>

                {/* Right person */}

                <div className="absolute bottom-8 right-3">

                  <div
                    className="
                      mx-auto
                      size-12
                      rounded-full
                      border-4
                      border-white
                      bg-[#F1C2A3]
                      shadow-sm
                    "
                  />

                  <div
                    className="
                      absolute
                      right-0
                      top-2
                      h-10
                      w-12
                      rounded-full
                      bg-[#174A91]
                    "
                  />

                  <div
                    className="
                      mt-[-2px]
                      h-20
                      w-16
                      rounded-t-[28px]
                      bg-[#4F9FF4]
                    "
                  />

                </div>

                {/* Laptop */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    w-[215px]
                    -translate-x-1/2
                  "
                >

                  <div
                    className="
                      rounded-xl
                      border-[6px]
                      border-[#D9E6F5]
                      bg-white
                      p-3
                      shadow-lg
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-[#F5FAFF]
                        p-2
                      "
                    >

                      <div
                        className="
                          flex
                          size-7
                          items-center
                          justify-center
                          rounded-full
                          bg-[#E5F3FF]
                        "
                      >
                        <UserRound className="h-4 w-4 text-[#2875F5]" />
                      </div>

                      <div className="flex-1">

                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map((item) => (
                            <Star
                              key={item}
                              className="
                                h-3
                                w-3
                                fill-current
                                text-[#F59E0B]
                              "
                            />
                          ))}

                          <Star className="h-3 w-3 text-[#CBD5E1]" />
                        </div>

                        <div className="mt-1 h-1.5 w-24 rounded-full bg-[#C9DFF5]" />
                        <div className="mt-1 h-1.5 w-16 rounded-full bg-[#DCEAF7]" />

                      </div>
                    </div>

                  </div>

                  <div
                    className="
                      mx-auto
                      h-2
                      w-[235px]
                      rounded-b-lg
                      bg-[#D6E4F2]
                    "
                  />

                </div>

              </div>

              {/* Like bubble */}

              <div
                className="
                  absolute
                  right-5
                  top-3
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#2875F5]
                  text-white
                  shadow-md
                  sm:right-7
                  sm:top-5
                  sm:size-12
                "
              >
                <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              {/* Sparkles */}

              <span className="absolute left-[35%] top-10 text-base text-white sm:top-14 sm:text-lg">
                ✦
              </span>

              <span className="absolute right-[28%] top-20 text-xs text-white sm:top-28 sm:text-sm">
                ✦
              </span>

            </div>

          </section>

          {/* =====================================================
              WHAT IS GENUINE REVIEWS
          ===================================================== */}

          <section
            className="
              mt-6
              rounded-xl
              border
              border-[#D1E5F7]
              bg-white/85
              p-4
              shadow-sm
              sm:mt-8
              sm:p-6
            "
          >

            <div className="grid items-center gap-5 sm:gap-6 lg:grid-cols-[1.2fr_1fr]">

              {/* Text */}

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div
                  className="
                    flex
                    size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E1F2FF]
                    ring-4
                    ring-[#EDF8FF]
                    sm:size-14
                    sm:ring-8
                  "
                >
                  <ShieldCheck className="h-6 w-6 text-[#1688F8] sm:h-7 sm:w-7" />
                </div>

                <div>

                  <h2
                    className="
                      text-lg
                      font-extrabold
                      text-[#174A91]
                      sm:text-2xl
                    "
                  >
                    What is Genuine Reviews?
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-2xl
                      text-xs
                      font-medium
                      leading-5
                      text-[#5279B2]
                      sm:mt-3
                      sm:text-base
                      sm:leading-6
                    "
                  >
                    Genuine Reviews is a community-driven platform
                    where people can share their experiences and
                    discover reviews from others. Whether you’re
                    looking for honest opinions before making a
                    decision or want to share your own experience,
                    Genuine Reviews brings both sides together.
                  </p>

                </div>

              </div>

              {/* Three values */}

              <div
                className="
                  grid
                  grid-cols-3
                  divide-x
                  divide-[#D7E8F7]
                  rounded-xl
                  border
                  border-[#D9EBF9]
                  bg-[#F3FAFF]
                  p-3
                  sm:p-4
                "
              >

                <div className="px-1.5 text-center sm:px-2">

                  <div
                    className="
                      mx-auto
                      flex
                      size-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#DDF8EF]
                      sm:size-12
                    "
                  >
                    <Users className="h-5 w-5 text-[#16A879] sm:h-6 sm:w-6" />
                  </div>

                  <h3 className="mt-2.5 text-[11px] font-extrabold text-[#174A91] sm:mt-3 sm:text-sm">
                    Real People
                  </h3>

                  <p className="mt-1 text-[10px] leading-3.5 text-[#5279B2] sm:text-xs sm:leading-4">
                    Authentic
                    <br />
                    experiences
                  </p>

                </div>

                <div className="px-1.5 text-center sm:px-2">

                  <div
                    className="
                      mx-auto
                      flex
                      size-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E2F2FF]
                      sm:size-12
                    "
                  >
                    <MessageCircle className="h-5 w-5 text-[#1688F8] sm:h-6 sm:w-6" />
                  </div>

                  <h3 className="mt-2.5 text-[11px] font-extrabold text-[#174A91] sm:mt-3 sm:text-sm">
                    Honest Reviews
                  </h3>

                  <p className="mt-1 text-[10px] leading-3.5 text-[#5279B2] sm:text-xs sm:leading-4">
                    Both positive &
                    <br />
                    negative opinions
                  </p>

                </div>

                <div className="px-1.5 text-center sm:px-2">

                  <div
                    className="
                      mx-auto
                      flex
                      size-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F0E7FF]
                      sm:size-12
                    "
                  >
                    <Heart className="h-5 w-5 fill-current text-[#8B4DE8] sm:h-6 sm:w-6" />
                  </div>

                  <h3 className="mt-2.5 text-[11px] font-extrabold text-[#174A91] sm:mt-3 sm:text-sm">
                    Better Decisions
                  </h3>

                  <p className="mt-1 text-[10px] leading-3.5 text-[#5279B2] sm:text-xs sm:leading-4">
                    Make informed
                    <br />
                    choices
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              BUSINESS & COLLABORATION
          ===================================================== */}

          <section
            className="
              mt-4
              rounded-xl
              border
              border-[#D1E5F7]
              bg-white/90
              p-4
              shadow-sm
              sm:p-6
            "
          >

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">

              {/* Left */}

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div
                  className="
                    flex
                    size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E1F2FF]
                    ring-4
                    ring-[#EDF8FF]
                    sm:size-14
                    sm:ring-8
                  "
                >
                  <BriefcaseBusiness className="h-6 w-6 text-[#1688F8] sm:h-7 sm:w-7" />
                </div>

                <div className="flex-1">

                  <h2
                    className="
                      text-lg
                      font-extrabold
                      text-[#174A91]
                      sm:text-2xl
                    "
                  >
                    Our Business & Collaboration System
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-xs
                      font-medium
                      leading-5
                      text-[#5279B2]
                      sm:mt-3
                      sm:text-base
                      sm:leading-6
                    "
                  >
                    Genuine Reviews also helps businesses connect
                    with reviewers and other businesses through a
                    structured proposal and deal system. Businesses
                    can create public profiles, showcase their
                    services and portfolio, and send proposals to
                    users or other businesses. After a proposal is
                    accepted, it becomes a Deal where both sides can
                    collaborate, share messages and exchange files —
                    all within a secure and organized space.
                  </p>

                  <Link
                    to="/businesses"
                    className="
                      mt-4
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-[#1688F8]
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-[#0D75DC]
                      sm:mt-5
                      sm:w-auto
                    "
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>

              </div>

              {/* Workflow */}

              <div
                className="
                  rounded-xl
                  border
                  border-[#CFE3F7]
                  bg-[#F5FBFF]
                  p-4
                  sm:p-5
                "
              >

                <h3 className="text-sm font-extrabold text-[#174A91] sm:text-base">
                  The Business Workflow
                </h3>

                {/* Steps */}

                <div className="mt-4 grid grid-cols-4 gap-1.5 sm:mt-5 sm:gap-2">

                  <div className="text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        size-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#E1F2FF]
                        sm:size-12
                      "
                    >
                      <Building2 className="h-5 w-5 text-[#2875F5] sm:h-6 sm:w-6" />
                    </div>

                    <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#174A91] sm:text-xs">
                      Business
                      <br />
                      Profile
                    </p>

                  </div>

                  <div className="flex items-start justify-center pt-4 sm:pt-5">
                    <ArrowRight className="h-4 w-4 text-[#2875F5] sm:h-5 sm:w-5" />
                  </div>

                  <div className="text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        size-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#E1F2FF]
                        sm:size-12
                      "
                    >
                      <FileText className="h-5 w-5 text-[#2875F5] sm:h-6 sm:w-6" />
                    </div>

                    <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#174A91] sm:text-xs">
                      Proposal
                    </p>

                  </div>

                  <div className="flex items-start justify-center pt-4 sm:pt-5">
                    <ArrowRight className="h-4 w-4 text-[#2875F5] sm:h-5 sm:w-5" />
                  </div>

                </div>

                {/* Second row */}

                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">

                  <div className="text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        size-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#DDF8EF]
                        sm:size-12
                      "
                    >
                      <Check className="h-5 w-5 text-[#16A879] sm:h-6 sm:w-6" />
                    </div>

                    <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#174A91] sm:text-xs">
                      Accepted
                      <br />
                      Proposal
                    </p>

                  </div>

                  <div className="flex items-start justify-center pt-4 sm:pt-5">
                    <ArrowRight className="h-4 w-4 text-[#2875F5] sm:h-5 sm:w-5" />
                  </div>

                  <div className="text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        size-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#F0E7FF]
                        sm:size-12
                      "
                    >
                      <Handshake className="h-5 w-5 text-[#8B4DE8] sm:h-6 sm:w-6" />
                    </div>

                    <p className="mt-2 text-[11px] font-extrabold leading-4 text-[#174A91] sm:text-xs">
                      Deal
                    </p>

                  </div>

                  <div />

                </div>

                {/* Workflow details */}

                <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">

                  <div
                    className="
                      rounded-lg
                      bg-[#EDF8FF]
                      p-3.5
                      sm:p-4
                    "
                  >

                    <h4 className="text-xs font-extrabold text-[#174A91] sm:text-sm">
                      The Businesses
                    </h4>

                    <div className="mt-2.5 space-y-2 sm:mt-3">

                      {[
                        "Create a public business profile",
                        "Showcase services & portfolio",
                        "Send proposals to users or businesses",
                        "Collaborate through deals",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 text-xs leading-5 text-[#5279B2]"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A879]" />
                          <span>{item}</span>
                        </div>
                      ))}

                    </div>

                  </div>

                  <div
                    className="
                      rounded-lg
                      bg-[#F2FAFF]
                      p-3.5
                      sm:p-4
                    "
                  >

                    <h4 className="text-xs font-extrabold text-[#174A91] sm:text-sm">
                      For Reviewers & Users
                    </h4>

                    <div className="mt-2.5 space-y-2 sm:mt-3">

                      {[
                        "Receive proposals",
                        "Accept or decline proposals",
                        "Participate in deals",
                        "Share messages & files",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 text-xs leading-5 text-[#5279B2]"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A879]" />
                          <span>{item}</span>
                        </div>
                      ))}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              BUILT FOR BOTH SIDES
          ===================================================== */}

          <section
            className="
              mt-4
              rounded-xl
              border
              border-[#D1E5F7]
              bg-white/85
              p-4
              shadow-sm
              sm:p-6
            "
          >

            <div className="flex items-start gap-3.5 sm:gap-4">

              <div
                className="
                  flex
                  size-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E1F2FF]
                  sm:size-14
                "
              >
                <Users className="h-6 w-6 text-[#2875F5] sm:h-7 sm:w-7" />
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-[#174A91]
                    sm:text-2xl
                  "
                >
                  Built for Both Sides
                </h2>

                <p className="mt-1.5 text-xs font-medium leading-5 text-[#5279B2] sm:mt-2 sm:text-base">
                  Genuine Reviews is not only about writing reviews.
                  It is also about discovering and learning from them.
                </p>

              </div>

            </div>

            <div className="mt-4 grid gap-3.5 sm:mt-5 sm:gap-4 lg:grid-cols-2">

              {/* Reviewers */}

              <div
                className="
                  rounded-xl
                  border
                  border-[#CFE3F7]
                  bg-[#F4FAFF]
                  p-4
                  sm:p-5
                "
              >

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E2F2FF]
                      sm:size-12
                    "
                  >
                    <UserRound className="h-5 w-5 text-[#2875F5] sm:h-6 sm:w-6" />
                  </div>

                  <div>

                    <h3 className="text-sm font-extrabold text-[#174A91] sm:text-base">
                      For Reviewers
                    </h3>

                    <div className="mt-2.5 space-y-2 sm:mt-3">

                      {[
                        "Share your experiences",
                        "Express your honest opinion",
                        "Help the community with your voice",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 text-xs font-medium leading-5 text-[#5279B2] sm:text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A879]" />
                          <span>{item}</span>
                        </div>
                      ))}

                    </div>

                  </div>

                </div>

              </div>

              {/* Businesses */}

              <div
                className="
                  rounded-xl
                  border
                  border-[#CFE3F7]
                  bg-[#F4FAFF]
                  p-4
                  sm:p-5
                "
              >

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E2F2FF]
                      sm:size-12
                    "
                  >
                    <Store className="h-5 w-5 text-[#2875F5] sm:h-6 sm:w-6" />
                  </div>

                  <div>

                    <h3 className="text-sm font-extrabold text-[#174A91] sm:text-base">
                      For Businesses
                    </h3>

                    <div className="mt-2.5 space-y-2 sm:mt-3">

                      {[
                        "Discover potential collaborators",
                        "Find genuine reviewers",
                        "Grow through trusted partnerships",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 text-xs font-medium leading-5 text-[#5279B2] sm:text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A879]" />
                          <span>{item}</span>
                        </div>
                      ))}

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Handwritten-style message (Now visible on mobile too) */}

            <div className="mt-4 flex justify-end pr-2 sm:pr-0">
              <div
                className="
                  max-w-xs
                  rotate-[-3deg]
                  text-right
                  text-sm
                  font-semibold
                  leading-5
                  text-[#1688F8]
                  sm:text-lg
                  sm:leading-7
                "
              >
                Real people.
                <br />
                Real experiences.
                <br />
                Better decisions.
              </div>
            </div>

          </section>

          {/* =====================================================
              OUR APPROACH
          ===================================================== */}

          <section
            className="
              mt-4
              rounded-xl
              border
              border-[#D1E5F7]
              bg-white/85
              p-4
              shadow-sm
              sm:p-6
            "
          >

            <div className="flex items-start gap-3.5 sm:gap-4">

              <div
                className="
                  flex
                  size-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E1F2FF]
                  sm:size-14
                "
              >
                <Lightbulb className="h-6 w-6 text-[#2875F5] sm:h-7 sm:w-7" />
              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-[#174A91]
                    sm:text-2xl
                  "
                >
                  Our Approach to Reviews
                </h2>

                <p className="mt-1 text-xs font-medium leading-5 text-[#5279B2] sm:text-base">
                  We focus on what makes reviews valuable for everyone.
                </p>

              </div>

            </div>

            <div className="mt-5 grid items-start gap-2 sm:mt-6 sm:gap-4 md:grid-cols-7">

              {/* Reviews */}

              <div className="rounded-xl bg-[#F8FCFF] p-3 text-center md:bg-transparent md:p-0">

                <div
                  className="
                    mx-auto
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8F4FF]
                  "
                >
                  <MessageCircle className="h-6 w-6 text-[#2875F5]" />
                </div>

                <h3 className="mt-2.5 text-sm font-extrabold text-[#174A91] sm:mt-3">
                  Reviews
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#5279B2]">
                  Real experiences
                  <br />
                  from real people
                </p>

              </div>

              <div className="flex items-center justify-center py-0.5 text-lg font-bold text-[#2875F5] md:py-0 md:pt-5 md:text-xl md:font-normal">
                +
              </div>

              {/* Opinions */}

              <div className="rounded-xl bg-[#F8FCFF] p-3 text-center md:bg-transparent md:p-0">

                <div
                  className="
                    mx-auto
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8F4FF]
                  "
                >
                  <MessageCircle className="h-6 w-6 text-[#2875F5]" />
                </div>

                <h3 className="mt-2.5 text-sm font-extrabold text-[#174A91] sm:mt-3">
                  Opinions
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#5279B2]">
                  Different perspectives
                  <br />
                  and viewpoints
                </p>

              </div>

              <div className="flex items-center justify-center py-0.5 text-lg font-bold text-[#2875F5] md:py-0 md:pt-5 md:text-xl md:font-normal">
                +
              </div>

              {/* Helpful */}

              <div className="rounded-xl bg-[#F8FCFF] p-3 text-center md:bg-transparent md:p-0">

                <div
                  className="
                    mx-auto
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8F4FF]
                  "
                >
                  <ThumbsUp className="h-6 w-6 text-[#2875F5]" />
                </div>

                <h3 className="mt-2.5 text-sm font-extrabold text-[#174A91] sm:mt-3">
                  Helpful Votes
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#5279B2]">
                  Community engagement
                  <br />
                  and trust
                </p>

              </div>

              <div className="flex items-center justify-center py-0.5 text-lg font-bold text-[#2875F5] md:py-0 md:pt-5 md:text-xl md:font-normal">
                =
              </div>

              {/* Discoverability */}

              <div className="rounded-xl border border-[#FDE68A]/60 bg-[#FFFDF5] p-3 text-center md:border-none md:bg-transparent md:p-0">

                <div
                  className="
                    mx-auto
                    flex
                    size-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF6D9]
                  "
                >
                  <Star className="h-6 w-6 fill-current text-[#F59E0B]" />
                </div>

                <h3 className="mt-2.5 text-sm font-extrabold text-[#174A91] sm:mt-3">
                  Better Discoverability
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#5279B2]">
                  Help others make
                  <br />
                  informed decisions
                </p>

              </div>

            </div>

          </section>

          {/* =====================================================
              FOUNDER
          ===================================================== */}

          <section
            className="
              mt-4
              rounded-xl
              border
              border-[#D1E5F7]
              bg-white/90
              p-5
              shadow-sm
              sm:p-6
            "
          >

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">

              {/* Founder Avatar */}

              <div className="relative shrink-0">

                <div
                  className="
                    flex
                    size-20
                    items-center
                    justify-center
                    rounded-full
                    bg-[#DDEAF6]
                    ring-6
                    ring-[#EFF7FD]
                    sm:size-24
                    sm:ring-8
                  "
                >
                  <User className="h-11 w-11 text-[#60758E] sm:h-14 sm:w-14" />
                </div>

                <div
                  className="
                    absolute
                    right-0
                    top-0.5
                    flex
                    size-6
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1688F8]
                    text-white
                    sm:top-1
                    sm:size-7
                  "
                >
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

              </div>

              {/* Founder text */}

              <div className="relative flex-1">

                <div className="absolute -top-2 left-0 hidden text-3xl font-black text-[#1688F8] sm:-left-1 sm:block">
                  “
                </div>

                <h2 className="text-base font-extrabold text-[#174A91] sm:pl-6 sm:text-lg">
                  A Note from the Founder
                </h2>

                <p className="mt-2 text-xs font-medium leading-5 text-[#5279B2] sm:pl-6 sm:text-sm">
                  “Genuine Reviews was created to make it easier for
                  people to share their experiences and discover what
                  others genuinely think. So I build this platform
                  where people could openly share their experiences
                  while giving others a useful place to discover
                  different opinions.”
                </p>

                <div className="mt-3 sm:pl-6">

                  <p className="text-xs font-extrabold text-[#2875F5] sm:text-sm">
                    — Tushar Pichad
                  </p>

                  <p className="text-xs font-medium text-[#5279B2]">
                    Founder, Genuine Reviews
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>
      </main>
    </Layout>
  );
}

export default About;