import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ChevronRight,
  ShieldCheck,
  Info,
  MessageCircle,
  Star,
  Users,
  Pencil,
  Eye,
  Heart,
  ThumbsUp,
  Lock,
  ShieldAlert,
  Megaphone,
  Flag,
  Shield,
  CircleHelp,
  BriefcaseBusiness,
  FileText,
  MessageSquare,
  Paperclip,
  UserRound,
  Handshake,
  Ban,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const sections = [
  {
    id: "share-opinion",
    title: "Share Your Opinion Freely",
    icon: MessageCircle,
    iconClass: "bg-blue-50 text-blue-600",
    content: (
      <>
        <p>
          You are free to share your honest opinion on Genuine Reviews.
          You can write positive, negative, or mixed reviews based on
          your experience.
        </p>

        <p className="mt-3">
          There is no requirement for a review to be positive, negative,
          favorable, critical, or balanced in any particular way.
        </p>
      </>
    ),
  },
  {
    id: "rating-choice",
    title: "Your Rating Is Your Choice",
    icon: Star,
    iconClass: "bg-green-50 text-green-600",
    content: (
      <p>
        You are free to give any rating that reflects your opinion and
        experience. A low rating is just as welcome as a high rating.
      </p>
    ),
  },
  {
    id: "different-experiences",
    title: "Different Experiences Are Welcome",
    icon: Users,
    iconClass: "bg-amber-50 text-amber-600",
    content: (
      <p>
        Different people can have very different experiences with the
        same product, service, place, food, business, or other subject.
        Genuine Reviews welcomes these different perspectives.
      </p>
    ),
  },
  {
    id: "write-experience",
    title: "Write Reviews Based on Your Experience",
    icon: Pencil,
    iconClass: "bg-purple-50 text-purple-600",
    content: (
      <p>
        When sharing a review, try to describe your actual experience
        and what you personally think. You can include the things you
        liked, disliked, or anything that affected your experience.
      </p>
    ),
  },
  {
    id: "discover-information",
    title: "Reviews Are Also for Discovering Information",
    icon: Eye,
    iconClass: "bg-blue-50 text-blue-600",
    content: (
      <p>
        Genuine Reviews is not only a place to write reviews. It is also
        a place to discover and read experiences shared by other people.
        When reading reviews, consider different people's experiences and
        perspectives before making your own decision.
      </p>
    ),
  },
  {
    id: "respect-opinions",
    title: "Respect Different Opinions",
    icon: Heart,
    iconClass: "bg-red-50 text-red-500",
    content: (
      <p>
        You may disagree with another person's review or opinion.
        Different opinions are a normal part of a review community.
        Disagreement with a review does not make that review invalid.
      </p>
    ),
  },
  {
    id: "helpful-votes",
    title: "Helpful Votes",
    icon: ThumbsUp,
    iconClass: "bg-green-50 text-green-600",
    content: (
      <p>
        Use the Helpful feature when you find a review useful,
        informative, or helpful in understanding another person's
        experience. Helpful votes are intended to reflect genuine
        community feedback and should not be manipulated.
      </p>
    ),
  },
  {
    id: "community-useful",
    title: "Keep the Community Useful",
    icon: Users,
    iconClass: "bg-orange-50 text-orange-600",
    content: (
      <p>
        While opinions and ratings are completely up to the reviewer,
        the platform should not be used for spam, repeated unwanted
        content, or activity intended to manipulate the community.
      </p>
    ),
  },
  {
    id: "personal-information",
    title: "Personal Information",
    icon: Lock,
    iconClass: "bg-cyan-50 text-cyan-600",
    content: (
      <p>
        Avoid sharing private or sensitive personal information about
        yourself or other people in reviews or community interactions.
      </p>
    ),
  },
  {
    id: "harassment",
    title: "Harassment and Abusive Behaviour",
    icon: ShieldAlert,
    iconClass: "bg-red-50 text-red-500",
    content: (
      <p>
        Negative reviews and criticism are allowed. However, reviews
        and community interactions should not be used to threaten,
        harass, intimidate, or personally target other people.
      </p>
    ),
  },
  {
    id: "advertising-spam",
    title: "Advertising and Spam",
    icon: Megaphone,
    iconClass: "bg-purple-50 text-purple-600",
    content: (
      <p>
        Reviews should not be used primarily for advertising,
        unsolicited promotion, or repetitive promotional content.
      </p>
    ),
  },
  {
    id: "reporting",
    title: "Reporting Reviews",
    icon: Flag,
    iconClass: "bg-blue-50 text-blue-600",
    content: (
      <>
        <p>
          If you believe a review or other community content violates
          these guidelines, you can report it for review.
        </p>

        <p className="mt-3">
          A review should not be reported simply because you disagree
          with its opinion, rating, or experience.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "Moderation",
    icon: Shield,
    iconClass: "bg-amber-50 text-amber-600",
    content: (
      <>
        <p>
          Genuine Reviews may review reported content and take
          appropriate action when content or activity violates these
          guidelines or negatively affects the community.
        </p>

        <p className="mt-3">
          Depending on the situation, content or accounts may be
          restricted, removed, or otherwise moderated.
        </p>
      </>
    ),
  },
];

const businessSections = [
  {
    id: "business-profiles",
    title: "Business Profiles",
    icon: BriefcaseBusiness,
    iconClass: "bg-blue-50 text-blue-600",
    content: (
      <p>
        Provide accurate and up-to-date information about your
        business. Do not impersonate another business or provide
        false information.
      </p>
    ),
  },
  {
    id: "proposals",
    title: "Proposals",
    icon: FileText,
    iconClass: "bg-purple-50 text-purple-600",
    content: (
      <p>
        Use proposals for genuine collaboration purposes. Be clear
        about your requirements, deliverables, budget, and timeline.
        Do not use proposals for spam or harassment.
      </p>
    ),
  },
  {
    id: "deal-communication",
    title: "Deal Communication",
    icon: MessageSquare,
    iconClass: "bg-green-50 text-green-600",
    content: (
      <p>
        Keep deal conversations professional and respectful. Do not
        share or request personal information outside the platform's
        intended scope.
      </p>
    ),
  },
  {
    id: "attachments",
    title: "Attachments",
    icon: Paperclip,
    iconClass: "bg-orange-50 text-orange-600",
    content: (
      <p>
        Upload only relevant files such as business portfolio,
        proposal, or deal-related documents. Do not upload malware,
        illegal content, or sensitive personal information.
      </p>
    ),
  },
  {
    id: "privacy-personal-profiles",
    title: "Privacy & Personal Profiles",
    icon: UserRound,
    iconClass: "bg-cyan-50 text-cyan-600",
    content: (
      <p>
        Businesses cannot freely browse or access reviewer personal
        profiles through the proposal workflow. Respect everyone's
        privacy.
      </p>
    ),
  },
  {
    id: "respectful-communication",
    title: "Respectful Communication",
    icon: Handshake,
    iconClass: "bg-blue-50 text-blue-600",
    content: (
      <p>
        Be professional and courteous in all business interactions.
        Do not harass, threaten, or use the platform for inappropriate
        purposes.
      </p>
    ),
  },
  {
    id: "cancellation-completion",
    title: "Cancellation & Completion",
    icon: ShieldCheck,
    iconClass: "bg-green-50 text-green-600",
    content: (
      <p>
        You can cancel an active deal through the platform's workflow.
        Once a deal is cancelled or completed, it cannot be treated as
        an active deal again.
      </p>
    ),
  },
  {
    id: "prohibited-use",
    title: "Prohibited Use",
    icon: Ban,
    iconClass: "bg-red-50 text-red-500",
    content: (
      <p>
        Do not use the platform for fraud, illegal activities, spam,
        or any other behaviour that violates these guidelines or the
        Terms & Conditions.
      </p>
    ),
  },
];

function Guidelines() {
  return (
    <div className="min-h-screen bg-[#eef8ff] text-[#10182D]">
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =====================================================
            BREADCRUMB
        ====================================================== */}

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            to="/"
            className="
              flex
              items-center
              gap-1.5 sm:gap-2
              font-medium
              text-[#2875F5]
              transition-colors
              hover:text-[#155DCC]
            "
          >
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Home</span>
          </Link>

          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#9AA9BD]" />

          <span className="text-[#617493]">
            Guidelines
          </span>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="mt-6 sm:mt-8 grid gap-5 md:grid-cols-[150px_1fr] md:items-start lg:grid-cols-[170px_1fr]">

          {/* Shield */}

          <div className="flex justify-center md:justify-start">
            <div
              className="
                flex
                size-24 sm:size-28
                items-center
                justify-center
                rounded-full
                border
                border-[#D6E2F2]
                bg-[#E8F3FF]
              "
            >
              <ShieldCheck className="size-12 sm:size-16 text-[#2875F5]" />
            </div>
          </div>

          {/* Heading */}

          <div className="min-w-0 text-center md:text-left">
            <p className="text-xs sm:text-sm font-semibold text-[#2875F5]">
              Community
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
                text-[#10182D]
                sm:text-4xl
              "
            >
              Guidelines
            </h1>

            <p
              className="
                mt-2.5 sm:mt-3
                max-w-3xl
                text-xs
                leading-5
                text-[#617493]
                sm:text-base
                sm:leading-7
              "
            >
              Genuine Reviews is a platform where people can share
              their experiences and discover reviews from others.
              These guidelines help keep the community useful,
              genuine, respectful, and easy to use.
            </p>

            {/* =================================================
                INFO BANNER
            ================================================== */}

            <div
              className="
                mt-5 sm:mt-6
                flex
                gap-3
                rounded-xl
                border
                border-[#CFE3F7]
                bg-[#EAF5FF]
                p-3.5 sm:p-4
                text-left
              "
            >
              <div className="shrink-0">
                <Info className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#10182D]">
                  You are free to share any positive or negative opinion.
                </p>

                <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                  Our guidelines focus on how we use the platform, not
                  what opinion you share.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="mt-6 sm:mt-8 grid gap-4 lg:grid-cols-[210px_1fr] lg:items-start lg:gap-5">

          {/* =================================================
              LEFT SIDEBAR
          ================================================== */}

          <aside className="hidden lg:sticky lg:top-24 lg:block">

            {/* On This Page */}

            <div
              className="
                rounded-xl
                border
                border-[#D6E2F2]
                bg-white
                p-4
                shadow-sm
              "
            >
              <h2 className="text-sm font-bold text-[#10182D]">
                On This Page
              </h2>

              <div className="mt-3 border-t border-[#E3EBF5] pt-2">
                <nav className="flex flex-col">

                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="
                        border-l-2
                        border-transparent
                        px-3
                        py-2
                        text-xs sm:text-sm
                        leading-5
                        text-[#617493]
                        transition-colors
                        hover:border-[#2875F5]
                        hover:bg-[#F3F7FF]
                        hover:text-[#2875F5]
                      "
                    >
                      {index + 1}. {section.title}
                    </a>
                  ))}

                  {/* Business heading */}

                  <div
                    className="
                      mt-3
                      border-t
                      border-[#E3EBF5]
                      pt-3
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        px-3
                        pb-2
                        text-xs sm:text-sm
                        font-semibold
                        text-[#2875F5]
                      "
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                      Business & Collaboration
                    </div>

                    {businessSections.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="
                          border-l-2
                          border-transparent
                          px-3
                          py-2
                          text-xs sm:text-sm
                          leading-5
                          text-[#617493]
                          transition-colors
                          hover:border-[#2875F5]
                          hover:bg-[#F3F7FF]
                          hover:text-[#2875F5]
                        "
                      >
                        {sections.length + index + 1}. {section.title}
                      </a>
                    ))}
                  </div>
                </nav>
              </div>
            </div>

            {/* Contact box */}

            <div
              className="
                mt-4
                rounded-xl
                border
                border-[#D6E2F2]
                bg-white
                p-4
                shadow-sm
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D6E2F2]
                    bg-[#F3F7FF]
                  "
                >
                  <CircleHelp className="h-4 w-4 text-[#2875F5]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#10182D]">
                    Have a question?
                  </p>

                  <Link
                    to="/contact"
                    className="
                      text-xs
                      font-medium
                      text-[#2875F5]
                      hover:text-[#155DCC]
                      hover:underline
                    "
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              RIGHT CONTENT
          ================================================== */}

          <main className="min-w-0">

            {/* =================================================
                COMMUNITY GUIDELINES HEADER
            ================================================== */}

            <div
              className="
                rounded-xl
                border
                border-[#D6E2F2]
                bg-white
                p-4 sm:p-6
                shadow-sm
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    size-10 sm:size-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E8F3FF]
                  "
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                </div>

                <h2
                  className="
                    text-lg sm:text-2xl
                    font-bold
                    text-[#10182D]
                  "
                >
                  Community Guidelines
                </h2>
              </div>

              <p
                className="
                  mt-3 sm:mt-4
                  text-xs sm:text-base
                  leading-6 sm:leading-7
                  text-[#617493]
                "
              >
                Genuine Reviews is a platform where people can share
                their experiences and discover reviews from others.
                These guidelines help keep the community useful,
                genuine, respectful, and easy to use.
              </p>
            </div>

            {/* =================================================
                COMMUNITY GUIDELINE CARDS
            ================================================== */}

            <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">

              {sections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="
                      scroll-mt-24
                      rounded-xl
                      border
                      border-[#D6E2F2]
                      bg-white
                      p-4 sm:p-6
                      shadow-sm
                      transition-shadow
                      hover:shadow-md
                    "
                  >
                    <div className="flex gap-3.5 sm:gap-4">

                      {/* Icon */}

                      <div
                        className={`
                          flex
                          size-10 sm:size-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          ${section.iconClass}
                        `}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      {/* Content */}

                      <div className="min-w-0">
                        <h2
                          className="
                            text-base sm:text-lg
                            font-bold
                            leading-6 sm:leading-7
                            text-[#10182D]
                          "
                        >
                          {index + 1}. {section.title}
                        </h2>

                        <div
                          className="
                            mt-1.5 sm:mt-2
                            text-xs sm:text-base
                            leading-6 sm:leading-7
                            text-[#617493]
                          "
                        >
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {/* =================================================
                BUSINESS & COLLABORATION HEADER
            ================================================== */}

            <div
              id="business-collaboration"
              className="
                mt-6 sm:mt-8
                scroll-mt-24
                rounded-xl
                border
                border-[#D6E2F2]
                bg-white
                p-4 sm:p-6
                shadow-sm
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    size-10 sm:size-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E8F3FF]
                  "
                >
                  <BriefcaseBusiness className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                </div>

                <h2
                  className="
                    text-lg sm:text-2xl
                    font-bold
                    text-[#10182D]
                  "
                >
                  Business & Collaboration Guidelines
                </h2>
              </div>

              <p
                className="
                  mt-3 sm:mt-4
                  text-xs sm:text-base
                  leading-6 sm:leading-7
                  text-[#617493]
                "
              >
                The Business & Collaboration feature allows businesses
                and users to connect through business profiles,
                proposals and deals. Please follow these guidelines to
                keep the platform safe and productive for everyone.
              </p>
            </div>

            {/* =================================================
                BUSINESS GUIDELINE CARDS
            ================================================== */}

            <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">

              {businessSections.map((section, index) => {
                const Icon = section.icon;
                const sectionNumber = sections.length + index + 1;

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="
                      scroll-mt-24
                      rounded-xl
                      border
                      border-[#D6E2F2]
                      bg-white
                      p-4 sm:p-6
                      shadow-sm
                      transition-shadow
                      hover:shadow-md
                    "
                  >
                    <div className="flex gap-3.5 sm:gap-4">

                      {/* Icon */}

                      <div
                        className={`
                          flex
                          size-10 sm:size-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          ${section.iconClass}
                        `}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>

                      {/* Content */}

                      <div className="min-w-0">
                        <h2
                          className="
                            text-base sm:text-lg
                            font-bold
                            leading-6 sm:leading-7
                            text-[#10182D]
                          "
                        >
                          {sectionNumber}. {section.title}
                        </h2>

                        <div
                          className="
                            mt-1.5 sm:mt-2
                            text-xs sm:text-base
                            leading-6 sm:leading-7
                            text-[#617493]
                          "
                        >
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {/* =================================================
                OUR GOAL
            ================================================== */}

            <section
              className="
                mt-6 sm:mt-8
                rounded-xl
                border
                border-[#CFE3F7]
                bg-[#EAF5FF]
                p-4 sm:p-6
              "
            >
              <div className="flex gap-3.5 sm:gap-4">

                <div
                  className="
                    flex
                    size-10 sm:size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    shadow-sm
                  "
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      text-base sm:text-lg
                      font-bold
                      text-[#2875F5]
                    "
                  >
                    Our Goal
                  </h2>

                  <p
                    className="
                      mt-1.5 sm:mt-2
                      text-xs sm:text-base
                      leading-6 sm:leading-7
                      text-[#617493]
                    "
                  >
                    Genuine Reviews is built around real experiences
                    and different opinions. Our goal is to give people
                    the freedom to share what they genuinely think
                    while making it easy for others to discover and
                    learn from those experiences.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Guidelines;