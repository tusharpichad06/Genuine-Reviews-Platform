import { useState } from "react";
import type { ElementType } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User,
  Star,
  MessageCircle,
  ThumbsUp,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Users,
  Lock,
  Scale,
  Mail,
  CalendarDays,
  Info,
  Flag,
  Eye,
  Trash2,
  Pencil,
  CheckCircle2,
  Handshake,
  Paperclip,
  Building2,
} from "lucide-react";

import Layout from "../components/layout/Layout";

type Section = {
  number: number;
  title: string;
  description: string;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
};

const sections: Section[] = [
  {
    number: 1,
    title: "Acceptance of Terms",
    description:
      "By accessing or using Genuine Reviews, you agree to these Terms of Use, our Community Guidelines, and our Privacy Policy.",
    icon: FileText,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
  {
    number: 2,
    title: "About Genuine Reviews",
    description:
      "Genuine Reviews is a platform where users can read, discover and share reviews about products, services, businesses and experiences.",
    icon: Info,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
  {
    number: 3,
    title: "Eligibility & Accounts",
    description:
      "You must be eligible to use our platform and provide accurate information when creating an account. You are responsible for keeping your account secure.",
    icon: User,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    number: 4,
    title: "Reviews & User-Generated Content",
    description:
      "Share your genuine experiences and opinions. You are responsible for the content you post, including text, ratings, images, videos and attachments.",
    icon: MessageCircle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    number: 5,
    title: "Community Guidelines",
    description:
      "Your use of Genuine Reviews and your contributions are also subject to our Community Guidelines.",
    icon: FileText,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    number: 6,
    title: "Helpful Votes & Community Features",
    description:
      "Helpful votes and other community features are for genuine use only. Do not manipulate votes or engagement in any way.",
    icon: ThumbsUp,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    number: 7,
    title: "Prohibited Use",
    description:
      "Do not use the platform for any illegal, harmful, abusive, misleading or unauthorized purpose. See our Community Guidelines for prohibited activities.",
    icon: AlertCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    number: 8,
    title: "Content Moderation & Removal",
    description:
      "We may review, hide, remove or restrict content or accounts that violate these Terms, our Community Guidelines or applicable policies.",
    icon: ShieldCheck,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    number: 9,
    title: "User Content & License",
    description:
      "You retain ownership of your content. You grant Genuine Reviews a limited license to use, display and distribute it to operate and improve the platform.",
    icon: FileText,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    number: 10,
    title: "Intellectual Property",
    description:
      "All rights, title and interest in the platform, design, logos, content and software belong to Genuine Reviews or its licensors.",
    icon: Star,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    number: 11,
    title: "Third-Party Services & Links",
    description:
      "We may use third-party services such as Google Sign-In. Third-party services and links may have their own terms and privacy policies.",
    icon: LinkIcon,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
  {
    number: 12,
    title: "Reviews Are Individual Opinions",
    description:
      "Reviews reflect the individual opinions and experiences of users and do not represent the views, guarantees or factual statements of Genuine Reviews.",
    icon: Users,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    number: 13,
    title: "No Warranty / Service Availability",
    description:
      "The platform is provided 'as is'. We do not guarantee uninterrupted, error-free or secure access, accuracy or availability at all times.",
    icon: ShieldCheck,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
  {
    number: 14,
    title: "Limitation of Liability",
    description:
      "To the fullest extent permitted by law, Genuine Reviews is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
    icon: AlertCircle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
  },
  {
    number: 15,
    title: "Indemnification",
    description:
      "You agree to indemnify and hold Genuine Reviews harmless from any claims, losses, damages or expenses arising from your use of the platform or violation of these Terms.",
    icon: Scale,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    number: 16,
    title: "Suspension & Termination",
    description:
      "We may suspend or terminate your account or access if you violate these Terms or engage in harmful activity. You may also delete your account at any time.",
    icon: Lock,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    number: 17,
    title: "Changes to These Terms",
    description:
      "We may update these Terms from time to time. We will notify you of significant changes where appropriate. Continued use means you accept the updated Terms.",
    icon: Pencil,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
  {
    number: 18,
    title: "Contact Us",
    description:
      "If you have any questions about these Terms, please contact us through our Contact Us page.",
    icon: Mail,
    iconColor: "text-[#2875F5]",
    iconBg: "bg-[#EAF5FF]",
  },
];

function TermsConditions() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (number: number) => {
    setOpenSection((current) =>
      current === number ? null : number
    );
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-16">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="flex items-center gap-2 text-xs font-medium text-[#617493] sm:text-sm">

          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 transition-colors hover:text-[#2875F5]"
          >
            <HomeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Home</span>
          </Link>

          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#9AA9BD]" />

          <span>Terms &amp; Conditions</span>

        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="mt-6 sm:mt-8 grid items-center gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">

          {/* LEFT HERO */}

          <div className="px-0 sm:px-3 text-center lg:text-left">

            <h1 className="text-3xl font-bold tracking-tight text-[#101B3A] sm:text-5xl">
              Terms &amp; Conditions
            </h1>

            <p className="mt-3.5 sm:mt-5 max-w-2xl mx-auto lg:mx-0 text-xs sm:text-base leading-6 sm:leading-7 text-[#617493]">
              These Terms of Use govern your access to and use
              of Genuine Reviews. Please read them carefully.
            </p>

            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EAF5FF] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#617493]">

              <CalendarDays className="h-4 w-4 text-[#2875F5]" />

              <span>
                Last updated:{" "}
                <span className="font-semibold text-[#2875F5]">
                  October 2, 2026
                </span>
              </span>

            </div>

          </div>

          {/* HERO ILLUSTRATION */}

          <div className="relative hidden min-h-[230px] overflow-hidden rounded-[42%] bg-[#EAF5FF]/80 lg:block">

            {/* Plant */}

            <div className="absolute bottom-5 left-16">

              <div className="relative">

                <div className="h-28 w-8 rotate-[-18deg] rounded-t-full bg-emerald-500/80" />

                <div className="absolute left-5 top-3 h-20 w-7 rotate-[30deg] rounded-full bg-emerald-500/70" />

                <div className="absolute left-[-12px] top-10 h-20 w-7 rotate-[-55deg] rounded-full bg-emerald-500/60" />

                <div className="absolute left-3 top-[-18px] h-16 w-6 rotate-[5deg] rounded-full bg-emerald-500/70" />

                <div className="absolute -bottom-1 left-[-4px] h-10 w-16 rounded-b-[45%] bg-slate-300" />

              </div>

            </div>

            {/* Document */}

            <div className="absolute left-1/2 top-10 -translate-x-1/2">

              <div className="relative h-40 w-32 rounded-t-lg bg-white shadow-md">

                <div className="absolute left-4 top-6 h-2 w-20 rounded bg-[#B9DBFF]" />

                <div className="absolute left-4 top-12 h-2 w-24 rounded bg-[#D9ECFF]" />

                <div className="absolute left-4 top-[72px] h-2 w-20 rounded bg-[#D9ECFF]" />

                <div className="absolute left-1/2 top-[88px] flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-[#2875F5]/10">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2875F5] shadow-sm">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>

                </div>

              </div>

              <div className="absolute -bottom-4 left-[-20px] h-4 w-40 rounded-full bg-[#2875F5]/70" />

            </div>

            {/* Stars */}

            <div className="absolute right-12 top-12 flex items-center gap-1 rounded-lg border border-[#D6E2F2] bg-white px-4 py-3 shadow-sm">

              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />

            </div>

            {/* Scales */}

            <div className="absolute bottom-7 right-12">
              <Scale className="h-20 w-20 text-[#617493]" />
            </div>

            {/* Check */}

            <div className="absolute bottom-5 right-5 flex size-8 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>

            {/* Decorative stars */}

            <div className="absolute right-32 top-3 text-[#B9DBFF]">
              <span className="text-4xl">✦</span>
            </div>

            <div className="absolute left-20 top-5 text-[#B9DBFF]">
              <span className="text-3xl">✦</span>
            </div>

          </div>

        </section>

        {/* =====================================================
            CONTENT AREA
        ===================================================== */}

        <section className="mt-5 sm:mt-6 grid gap-4 lg:grid-cols-[220px_1fr] lg:gap-5">

          {/* ===================================================
              LEFT SIDEBAR
          =================================================== */}

          <aside className="hidden lg:block">

            <div className="sticky top-6 rounded-xl border border-[#D6E2F2] bg-white p-4 shadow-sm">

              <h2 className="text-sm font-bold text-[#101B3A]">
                On this page
              </h2>

              <nav className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">

                {sections.map((section) => (
                  <button
                    key={section.number}
                    type="button"
                    onClick={() => toggleSection(section.number)}
                    className="flex w-full items-start gap-3 text-left text-xs sm:text-sm text-[#617493] transition-colors hover:text-[#2875F5]"
                  >
                    <span className="w-5 shrink-0 font-semibold text-[#2875F5]">
                      {String(section.number).padStart(2, "0")}
                    </span>

                    <span>{section.title}</span>
                  </button>
                ))}

              </nav>

              <div className="mt-5 sm:mt-6 rounded-lg border border-[#CFE5FA] bg-[#EAF5FF] p-3.5 sm:p-4">

                <ShieldCheck className="h-5 w-5 text-[#2875F5]" />

                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-5 text-[#617493]">
                  By using Genuine Reviews, you confirm that you
                  have read, understood, and agree to these Terms
                  of Use.
                </p>

                <div className="mt-3 h-0.5 w-8 bg-[#2875F5]" />

              </div>

            </div>

          </aside>

          {/* ===================================================
              RIGHT CONTENT
          =================================================== */}

          <div className="min-w-0">

            {/* =================================================
                IMPORTANT
            ================================================= */}

            <div className="rounded-xl border border-[#CFE5FA] bg-[#EAF5FF]/70 p-4 sm:p-6 lg:p-7 shadow-sm">

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#DCEEFF]">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                </div>

                <div className="flex-1 min-w-0">

                  <h2 className="text-base sm:text-lg font-bold text-[#101B3A]">
                    Important
                  </h2>

                  <p className="mt-1.5 sm:mt-2 max-w-3xl text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">

                    Genuine Reviews welcomes both{" "}

                    <span className="font-semibold text-emerald-600">
                      Positive
                    </span>{" "}

                    and{" "}

                    <span className="font-semibold text-red-500">
                      Negative
                    </span>{" "}

                    reviews. Reviews reflect the individual
                    experiences and opinions of users, and do not
                    represent the views or guarantees of Genuine
                    Reviews.

                  </p>

                </div>

                <div className="hidden items-center gap-3 sm:flex">

                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
                    <ThumbsUp className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                    <ThumbsUp className="h-5 w-5 rotate-180 text-red-500" />
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                YOUR RESPONSIBILITIES
            ================================================= */}

            <div className="mt-4 rounded-xl border border-[#D6E2F2] bg-white p-4 sm:p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#101B3A]">
                  Your responsibilities
                </h3>

              </div>

              <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">

                {[
                  "Use the platform lawfully and respectfully",
                  "Share genuine experiences and opinions",
                  "Do not post harmful, illegal or misleading content",
                  "Respect the rights and privacy of others",
                  "Keep your account information secure",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#617493]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}

              </ul>

            </div>

            {/* =================================================
                CONTENT & MODERATION
            ================================================= */}

            <div className="mt-4 rounded-xl border border-[#D6E2F2] bg-white p-4 sm:p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-purple-50">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#101B3A]">
                  Content &amp; moderation
                </h3>

              </div>

              <div className="mt-5 sm:mt-6 grid gap-4 sm:gap-6 md:grid-cols-3">

                {/* Report */}

                <div className="flex items-center gap-3.5 sm:gap-4 md:block md:text-center">

                  <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] md:mx-auto">
                    <Flag className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <p className="mt-0 text-xs sm:text-sm font-semibold text-[#101B3A] md:mt-2">
                      Report
                    </p>

                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                      Content can be reported
                    </p>

                  </div>

                </div>

                {/* Review */}

                <div className="flex items-center gap-3.5 sm:gap-4 md:block md:text-center">

                  <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF] md:mx-auto">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <p className="mt-0 text-xs sm:text-sm font-semibold text-[#101B3A] md:mt-2">
                      Review
                    </p>

                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                      Our team may review it
                    </p>

                  </div>

                </div>

                {/* Action */}

                <div className="flex items-center gap-3.5 sm:gap-4 md:block md:text-center">

                  <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-red-50 md:mx-auto">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </div>

                  <div className="min-w-0">

                    <p className="mt-0 text-xs sm:text-sm font-semibold text-[#101B3A] md:mt-2">
                      Action
                    </p>

                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
                      Remove or suspend
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                BUSINESS & COLLABORATION
            ================================================= */}

            <div className="mt-4 rounded-xl border border-[#CFE5FA] bg-[#F5FAFF] p-4 sm:p-6 shadow-sm">

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#DCEEFF]">
                  <Handshake className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-base sm:text-lg font-bold text-[#101B3A]">
                    Business &amp; Collaboration
                  </h3>

                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                    Genuine Reviews may allow users with a Business
                    Profile to connect with reviewers and other businesses
                    through proposals and private deals. Business
                    collaboration features are subject to these Terms,
                    our Community Guidelines, and applicable policies.
                  </p>

                </div>

              </div>

              <div className="mt-4 sm:mt-5 space-y-3">

                {/* Business Profiles */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF]">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Business Profiles
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        Users may create one Business Profile to present
                        business information, services, contact details and
                        public portfolio content. Business information
                        should be accurate, current and not misleading.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Proposals */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF]">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Proposals
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        Businesses may send proposals to reviewers,
                        normal users or other businesses. Proposals may
                        include requirements, deliverables, budget,
                        currency and expected dates. Proposals should be
                        relevant, genuine and sent for legitimate purposes.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Deals */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF]">
                      <Handshake className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Deals &amp; Collaboration
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        An accepted proposal may create a private Deal
                        between the participants. Deal participants may
                        communicate, share relevant files and manage the
                        collaboration through the platform.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Attachments */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF]">
                      <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Business, Proposal &amp; Deal Attachments
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        Business portfolio attachments may be public.
                        Proposal and Deal attachments are private and are
                        intended only for the relevant participants and
                        authorized administrators. Do not upload unlawful,
                        harmful or unauthorized material.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Privacy */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5FF]">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Privacy &amp; Personal Information
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        Businesses must respect reviewer and user privacy.
                        The Business Collaboration system does not provide
                        businesses with access to personal profiles beyond
                        the information necessary for the proposal or Deal.
                      </p>

                    </div>

                  </div>

                </div>

                {/* Responsibility */}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>

                    <div className="min-w-0">

                      <h4 className="text-xs sm:text-sm font-bold text-[#101B3A]">
                        Business Responsibility
                      </h4>

                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                        Businesses are responsible for their business
                        information, proposals, communications, attachments
                        and agreements with other users. Genuine Reviews does
                        not guarantee business performance or completion of
                        any collaboration.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                TERMS ACCORDION
            ================================================= */}

            <div className="mt-4 space-y-2.5 sm:space-y-3">

              {sections.map((section) => {

                const Icon = section.icon;
                const isOpen = openSection === section.number;

                return (
                  <div
                    key={section.number}
                    className="overflow-hidden rounded-xl border border-[#D6E2F2] bg-white shadow-sm"
                  >

                    <button
                      type="button"
                      onClick={() => toggleSection(section.number)}
                      className="flex w-full items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-4 sm:py-5 text-left transition-colors hover:bg-[#F5FAFF]"
                    >

                      {/* NUMBER */}

                      <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-xs font-bold text-[#2875F5]">
                        {String(section.number).padStart(2, "0")}
                      </div>

                      {/* ICON */}

                      <div
                        className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full ${section.iconBg}`}
                      >
                        <Icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${section.iconColor}`}
                        />
                      </div>

                      {/* TEXT */}

                      <div className="min-w-0 flex-1">

                        <h3 className="text-xs sm:text-base font-bold text-[#101B3A]">
                          {section.number}. {section.title}
                        </h3>

                        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                          {section.description}
                        </p>

                      </div>

                      {/* ARROW */}

                      <ChevronDown
                        className={`
                          h-4 w-4 sm:h-5 sm:w-5
                          shrink-0
                          text-[#7B8DA6]
                          transition-transform
                          ${isOpen ? "rotate-180" : ""}
                        `}
                      />

                    </button>

                    {isOpen && (
                      <div className="border-t border-[#D6E2F2] bg-[#F8FBFF] px-3.5 sm:px-5 py-3.5 sm:py-4">

                        <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                          {section.description}
                        </p>

                      </div>
                    )}

                  </div>
                );

              })}

            </div>

          </div>

        </section>

        {/* =====================================================
            CONTACT CTA
        ===================================================== */}

        <section className="mt-6 sm:mt-8 overflow-hidden rounded-xl border border-[#CFE5FA] bg-[#EAF5FF]/70 p-5 sm:p-8 shadow-sm">

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">

            {/* Illustration */}

            <div className="hidden shrink-0 sm:block">

              <div className="relative flex size-28 items-center justify-center">

                <div className="absolute inset-0 rounded-full bg-[#DCEEFF]" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-[#2875F5] shadow-sm">
                  <Mail className="h-10 w-10 text-white" />
                </div>

                <div className="absolute bottom-0 left-0 text-[#B9DBFF]">
                  ✦
                </div>

                <div className="absolute right-0 top-0 text-[#B9DBFF]">
                  ✦
                </div>

              </div>

            </div>

            {/* TEXT */}

            <div className="flex-1 text-center sm:text-left min-w-0">

              <h2 className="text-lg sm:text-2xl font-bold text-[#101B3A]">
                Questions about these Terms?
              </h2>

              <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                If you have any questions or concerns about these
                Terms of Use, we’re here to help.
              </p>

            </div>

            {/* BUTTON */}

            <Link
              to="/contact"
              className="
                inline-flex
                h-11 sm:h-12
                w-full sm:w-auto
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#2875F5]
                px-5 sm:px-6
                text-xs sm:text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#155DCC]
              "
            >
              Go to Contact Us
              <ChevronRight className="h-4 w-4" />
            </Link>

          </div>

        </section>

      </main>
    </Layout>
  );
}

export default TermsConditions;