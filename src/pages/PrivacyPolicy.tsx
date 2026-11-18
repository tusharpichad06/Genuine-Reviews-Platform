import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  CalendarDays,
  User,
  Monitor,
  Users,
  Globe,
  ShieldCheck,
  ThumbsUp,
  Cookie,
  Share2,
  LockKeyhole,
  Clock3,
  Link2,
  FilePenLine,
  Mail,
  ArrowRight,
  CheckCircle2,
  BriefcaseBusiness,
  FileText,
  Handshake,
} from "lucide-react";

import Layout from "../components/layout/Layout";

type PrivacyItemProps = {
  children: React.ReactNode;
  iconClass?: string;
};

function PrivacyItem({
  children,
  iconClass = "text-[#2875F5]",
}: PrivacyItemProps) {
  return (
    <li className="flex items-start gap-2 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#24446F]">
      <CheckCircle2
        className={`mt-0.5 sm:mt-1 h-3.5 w-3.5 shrink-0 ${iconClass}`}
      />

      <span>{children}</span>
    </li>
  );
}

type PrivacySectionProps = {
  icon: React.ReactNode;
  iconBackground: string;
  title: string;
  children: React.ReactNode;
};

function PrivacySection({
  icon,
  iconBackground,
  title,
  children,
}: PrivacySectionProps) {
  return (
    <section className="rounded-xl border border-[#D6E7F7] bg-white p-4 shadow-sm sm:px-6 sm:py-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`mt-0.5 flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full ${iconBackground}`}
        >
          {icon}
        </div>

        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-bold leading-6 text-[#0E2E66] sm:text-[17px]">
            {title}
          </h2>

          <div className="mt-2 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyPolicy() {
  return (
    <Layout>
      <main className="min-h-screen bg-[#F3FAFF]">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-8 lg:px-10">

          {/* =====================================================
              BREADCRUMB
          ===================================================== */}

          <div className="flex items-center gap-2 text-xs font-medium text-[#53749C] sm:text-sm">
            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-1.5 sm:gap-2
                rounded-full
                border
                border-[#CDE5F8]
                bg-white
                px-2.5 sm:px-3
                py-1 sm:py-1.5
                text-xs sm:text-sm
                text-[#2875F5]
                shadow-sm
                transition
                hover:border-[#2875F5]
                hover:bg-[#F0F7FF]
              "
            >
              <span className="text-xs sm:text-sm">←</span>
              <HomeIcon className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>

            <ChevronRight className="h-3.5 w-3.5 text-[#8BA6C3]" />

            <span className="text-[#53749C]">
              Privacy Policy
            </span>
          </div>

          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="mt-6 sm:mt-7 grid items-center gap-6 lg:grid-cols-[1.02fr_0.98fr]">

            {/* LEFT HERO */}

            <div className="pl-0 sm:pl-4 lg:pl-6 text-center lg:text-left">

              <h1 className="text-3xl font-extrabold tracking-tight text-[#102F67] sm:text-[48px] sm:leading-[1.08]">
                Privacy Policy
              </h1>

              <p className="mt-3 sm:mt-4 max-w-[570px] text-xs sm:text-[15px] leading-6 sm:leading-7 text-[#3D6798]">
                Genuine Reviews respects your privacy. This Privacy Policy
                explains what information we collect, how we use it, how we
                protect it, and the choices you have when using our platform.
              </p>

              <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D8EAF9] bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-[13px] text-[#47698F] shadow-sm">
                <CalendarDays className="h-4 w-4 text-[#2875F5]" />

                <span className="font-medium">
                  Last updated:
                </span>

                <span className="font-semibold text-[#2875F5]">
                  October 2, 2026
                </span>
              </div>

            </div>

            {/* RIGHT HERO ILLUSTRATION */}

            <div className="relative hidden min-h-[270px] lg:flex lg:items-center lg:justify-center">

              <div className="absolute right-4 top-1 h-[235px] w-[410px] rounded-[48%] bg-[#E7F4FF]" />

              <div className="absolute right-5 top-2 text-[#CFEAFF]">
                <span className="text-4xl">✦</span>
              </div>

              {/* Laptop */}

              <div className="relative z-10 mt-2">

                <div className="relative h-[190px] w-[330px] rounded-t-[14px] border-[9px] border-[#16355D] bg-white shadow-md">

                  <div className="flex h-full items-center justify-center overflow-hidden rounded-sm bg-[#F7FBFF]">

                    <div className="relative flex h-[120px] w-[110px] items-center justify-center">

                      <div className="absolute inset-0 rounded-[50%] bg-[#E5F2FF]" />

                      <ShieldCheck
                        className="relative z-10 h-[92px] w-[92px] fill-[#2875F5] text-[#2875F5]"
                        strokeWidth={1.4}
                      />

                      <div className="absolute z-20 flex items-center justify-center rounded-full bg-white p-3 shadow-md">
                        <LockKeyhole className="h-8 w-8 text-[#2875F5]" />
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mx-auto h-[13px] w-[375px] rounded-b-xl border border-[#C5D3E2] bg-[#7D96AF]" />

                <div className="mx-auto mt-1 h-[5px] w-20 rounded-full bg-[#C5D3E2]" />

              </div>

              {/* User card */}

              <div className="absolute left-0 top-12 z-20 rounded-xl border border-[#D5E9F9] bg-white p-3 shadow-md">

                <div className="flex items-start gap-2.5">

                  <div className="flex size-9 items-center justify-center rounded-full bg-[#EAF5FF]">
                    <User className="h-5 w-5 text-[#2875F5]" />
                  </div>

                  <div className="pt-1">

                    <div className="h-2.5 w-16 rounded-full bg-[#D8E5F2]" />

                    <div className="mt-2 h-2 w-11 rounded-full bg-[#E8F0F7]" />

                    <div className="mt-2 h-2 w-14 rounded-full bg-[#E8F0F7]" />

                  </div>

                </div>

              </div>

              {/* Stars */}

              <div className="absolute right-0 top-24 z-20 rounded-lg border border-[#D5E9F9] bg-white px-3 py-2.5 shadow-md">

                <div className="flex items-center gap-1">

                  <span className="text-sm font-bold tracking-wide text-[#2875F5]">
                    ★★★★★
                  </span>

                </div>

              </div>

              {/* Green check */}

              <div className="absolute bottom-7 right-20 z-20 flex size-9 items-center justify-center rounded-full bg-[#16A34A] text-white shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              {/* Plant */}

              <div className="absolute bottom-3 left-24 z-20">

                <div className="relative h-28 w-20">

                  <div className="absolute bottom-0 left-1/2 h-16 w-2 -translate-x-1/2 rounded-full bg-[#15803D]" />

                  <div className="absolute bottom-12 left-1 h-12 w-7 -rotate-[35deg] rounded-[100%_0] bg-[#22C55E]" />

                  <div className="absolute bottom-16 left-9 h-14 w-7 rotate-[18deg] rounded-[0_100%] bg-[#22C55E]" />

                  <div className="absolute bottom-20 left-5 h-11 w-6 -rotate-[12deg] rounded-[100%_0] bg-[#4ADE80]" />

                  <div className="absolute bottom-0 left-2 h-9 w-12 rounded-b-[18px] rounded-t-md bg-[#D9E4EE]" />

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              MAIN CONTENT TOP
          ===================================================== */}

          <section className="mt-6 sm:mt-7 grid items-start gap-4 sm:gap-5 lg:grid-cols-[1.58fr_1fr]">

            {/* =================================================
                LEFT FLOW : 1 - 5
            ================================================= */}

            <div className="rounded-xl border border-[#D6E7F7] bg-white p-4 shadow-sm sm:p-5 lg:p-6">

              {/* =================================================
                  1. INFORMATION WE COLLECT
              ================================================* */}

              <section>

                <h2 className="px-1 text-lg font-bold text-[#0E2E66] sm:text-[21px]">
                  1. Information We Collect
                </h2>

                <p className="px-1 pt-1 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#53749C]">
                  We collect different types of information to provide and
                  improve our services.
                </p>

                <div className="mt-4 grid gap-3.5 sm:gap-4 lg:grid-cols-3">

                  {/* A */}

                  <div className="rounded-xl border border-[#D7E9F8] bg-[#F5FAFF] p-4 sm:p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#E1F1FF]">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                      </div>

                      <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                        Information You
                        <br />
                        Provide
                      </h3>

                    </div>

                    <ul className="mt-3.5 sm:mt-4 space-y-2.5">

                      <PrivacyItem>
                        Name / username,
                        <br />
                        email address
                      </PrivacyItem>

                      <PrivacyItem>
                        Profile information
                      </PrivacyItem>

                      <PrivacyItem>
                        Reviews, ratings &amp; content
                      </PrivacyItem>

                      <PrivacyItem>
                        Images, videos or attachments
                      </PrivacyItem>

                      <PrivacyItem>
                        Information via Contact Us
                      </PrivacyItem>

                      <PrivacyItem>
                        Other information you voluntarily provide
                      </PrivacyItem>

                    </ul>

                  </div>

                  {/* B */}

                  <div className="rounded-xl border border-[#D7E9F8] bg-[#F5FCF9] p-4 sm:p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#E2F8ED]">
                        <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-[#16A34A]" />
                      </div>

                      <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                        Information Collected
                        <br />
                        Automatically
                      </h3>

                    </div>

                    <ul className="mt-3.5 sm:mt-4 space-y-2.5">

                      <PrivacyItem iconClass="text-[#16A34A]">
                        IP address
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#16A34A]">
                        Browser &amp; device information
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#16A34A]">
                        Pages visited &amp; usage data
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#16A34A]">
                        Cookies or similar technologies
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#16A34A]">
                        Basic technical information for security and
                        functionality
                      </PrivacyItem>

                    </ul>

                  </div>

                  {/* C */}

                  <div className="rounded-xl border border-[#D7E9F8] bg-[#FAF7FF] p-4 sm:p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#EFE6FF]">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#7C3AED]" />
                      </div>

                      <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                        Information From
                        <br />
                        Other Sources
                      </h3>

                    </div>

                    <ul className="mt-3.5 sm:mt-4 space-y-2.5">

                      <PrivacyItem iconClass="text-[#7C3AED]">
                        Information from Google when you sign in with Google
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#7C3AED]">
                        Authentication &amp; account information
                      </PrivacyItem>

                      <PrivacyItem iconClass="text-[#7C3AED]">
                        Other information from trusted third-party services
                      </PrivacyItem>

                    </ul>

                  </div>

                </div>

              </section>

              {/* Divider */}

              <div className="my-4 sm:my-5 border-t border-[#E1EDF7]" />

              {/* =================================================
                  2. REVIEWS & PUBLIC CONTENT
              ================================================= */}

              <PrivacySection
                icon={<Globe className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />}
                iconBackground="bg-[#EAF5FF]"
                title="2. Reviews & Public Content"
              >
                <p>
                  Reviews, ratings, username and profile information are
                  public. Images, videos or attachments you upload may be
                  visible with your review. Do not share personal or sensitive
                  information in your reviews.
                </p>
              </PrivacySection>

              <div className="my-2" />

              {/* =================================================
                  3. HOW WE USE YOUR INFORMATION
              ================================================= */}

              <PrivacySection
                icon={<ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                iconBackground="bg-[#16A34A]"
                title="3. How We Use Your Information"
              >
                <p>
                  We use your information to provide, maintain and improve
                  our platform, publish and manage reviews, improve search
                  and discovery, operate helpful voting and community
                  features, ensure security, respond to support requests and
                  legal obligations, and improve our services.
                </p>
              </PrivacySection>

              <div className="my-2" />

              {/* =================================================
                  4. HELPFUL VOTES
              ================================================= */}

              <PrivacySection
                icon={<ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#F59E0B]" />}
                iconBackground="bg-[#FFF7E5]"
                title="4. Helpful Votes & Community Activity"
              >
                <p>
                  We process information related to helpful votes and
                  activity to maintain platform integrity, detect abuse or
                  manipulation, and make the community experience better for
                  everyone.
                </p>
              </PrivacySection>

              <div className="my-2" />

              {/* =================================================
                  5. COOKIES
              ================================================= */}

              <PrivacySection
                icon={<Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />}
                iconBackground="bg-[#EAF5FF]"
                title="5. Cookies & Similar Technologies"
              >
                <p>
                  We use cookies and similar technologies to enhance your
                  experience, remember your preferences, and analyze platform
                  usage. You can control cookies through your browser
                  settings.
                </p>
              </PrivacySection>

            </div>

            {/* =================================================
                BUSINESS & COLLABORATION
            ================================================== */}

            <section className="rounded-xl border border-[#D6E7F7] bg-white p-4 shadow-sm sm:p-6">

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-[#E8F4FF]">
                  <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                </div>

                <div>

                  <h2 className="text-base font-bold text-[#0E2E66] sm:text-[19px]">
                    Business &amp; Collaboration
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-[13px] leading-5 text-[#53749C]">
                    Your privacy matters, even in business.
                  </p>

                </div>

              </div>

              <p className="mt-4 sm:mt-5 text-xs sm:text-[14px] leading-6 text-[#355A88]">
                Genuine Reviews also allows businesses and reviewers to
                connect through our Business Profile, Proposal and Deal
                system. We collect and use certain information to support
                this feature while keeping your personal data secure and
                private.
              </p>

              {/* Business Profiles */}

              <div className="mt-4 sm:mt-5 rounded-xl border border-[#D7E9F8] bg-[#F7FBFF] px-3.5 sm:px-4">

                <div className="flex gap-3 border-b border-[#D9EAF8] py-4">

                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#E4F2FF]">
                    <BriefcaseBusiness className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div>

                    <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                      Business Profiles (Public)
                    </h3>

                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
                      Business profile information, services, portfolio and
                      business contact details are public and can be viewed
                      in the business directory and on public profiles.
                    </p>

                  </div>

                </div>

                {/* Proposals */}

                <div className="flex gap-3 border-b border-[#D9EAF8] py-4">

                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#E4F2FF]">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div>

                    <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                      Proposals (Private)
                    </h3>

                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
                      Proposal details and attachments are only accessible
                      to the sender, recipient and authorized administrators.
                      We store proposal attachments in private storage and
                      do not make them public.
                    </p>

                  </div>

                </div>

                {/* Deals */}

                <div className="flex gap-3 border-b border-[#D9EAF8] py-4">

                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#E4F2FF]">
                    <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div>

                    <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                      Deals (Private)
                    </h3>

                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
                      Once a proposal is accepted, a deal is created. Deal
                      details, messages and attachments are only visible to
                      the deal participants and authorized administrators.
                      These are stored in private storage and are not public.
                    </p>

                  </div>

                </div>

                {/* No Profile Access */}

                <div className="flex gap-3 py-4">

                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-[#E4F2FF]">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div>

                    <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                      No Access to Personal Profiles
                    </h3>

                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
                      Businesses cannot browse or open the personal profiles
                      of reviewers or other users through the proposal or deal
                      system. We only share the necessary information through
                      the proposal or deal itself.
                    </p>

                  </div>

                </div>

              </div>

              {/* Data Storage */}

              <div className="mt-3 rounded-xl border border-[#CFE5F8] bg-[#EFF8FF] p-3.5 sm:p-4">

                <div className="flex items-start gap-3">

                  <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-white">
                    <LockKeyhole className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                  </div>

                  <div>

                    <h3 className="text-xs sm:text-[14px] font-bold leading-5 text-[#103A72]">
                      Data Storage for Business System
                    </h3>

                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">
                      We use separate storage areas to keep different types
                      of files secure:
                    </p>

                    <ul className="mt-2 space-y-1 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#355A88]">

                      <li>
                        • <strong>business-assets</strong> (public -
                        business portfolios)
                      </li>

                      <li>
                        • <strong>proposal-assets</strong> (private -
                        proposal attachments)
                      </li>

                      <li>
                        • <strong>deal-assets</strong> (private - deal
                        attachments)
                      </li>

                    </ul>

                  </div>

                </div>

              </div>

            </section>

          </section>

          {/* =====================================================
              6. HOW WE SHARE INFORMATION
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#7C3AED]" />}
              iconBackground="bg-[#F2EAFF]"
              title="6. How We Share Information"
            >
              <p>
                We may share information with service &amp; infrastructure
                providers, authentication providers (such as Google), legal
                authorities when required, and during business transfers.
                We do not sell your personal information.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              7. DATA SECURITY
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<LockKeyhole className="h-5 w-5 sm:h-6 sm:w-6 text-[#16A34A]" />}
              iconBackground="bg-[#EAF9F0]"
              title="7. Data Security"
            >
              <p>
                We use reasonable security measures to protect your
                information from unauthorized access, use or disclosure.
                However, no system can be 100% secure.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              8. DATA RETENTION
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<Clock3 className="h-5 w-5 sm:h-6 sm:w-6 text-[#F59E0B]" />}
              iconBackground="bg-[#FFF7E5]"
              title="8. Data Retention"
            >
              <p>
                We keep your information as long as necessary to provide our
                services, comply with legal obligations, ensure security,
                and resolve disputes.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              9. PRIVACY RIGHTS
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />}
              iconBackground="bg-[#EAF5FF]"
              title="9. Your Choices & Privacy Rights"
            >
              <p>
                You can update your account and profile information, manage
                your reviews and content using available features, request
                deletion of your account and information, and contact us if
                you have any privacy-related questions.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              10. CHILDREN'S PRIVACY
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#16A34A]" />}
              iconBackground="bg-[#ECFDF3]"
              title="10. Children's Privacy"
            >
              <p>
                Genuine Reviews is not intended for children who are not
                permitted to use the platform under applicable law.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              11. THIRD-PARTY SERVICES & LINKS
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#8B5CF6]" />}
              iconBackground="bg-[#F3EFFF]"
              title="11. Third-Party Services & Links"
            >
              <p>
                Our platform may contain links to third-party websites or
                services. Their privacy practices are governed by their
                own policies.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              12. CHANGES TO THIS POLICY
          ===================================================== */}

          <div className="mt-3">

            <PrivacySection
              icon={<FilePenLine className="h-5 w-5 sm:h-6 sm:w-6 text-[#F59E0B]" />}
              iconBackground="bg-[#FFF7E6]"
              title="12. Changes to This Policy"
            >
              <p>
                We may update this Privacy Policy from time to time. When
                we make changes, we will update the “Last updated” date
                and provide additional notice.
              </p>
            </PrivacySection>

          </div>

          {/* =====================================================
              13. CONTACT US ABOUT PRIVACY
          ===================================================== */}

          <section className="mt-3 rounded-xl border border-[#CFE5F8] bg-[#EDF8FF] p-4 sm:px-7 sm:py-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              {/* Icon */}

              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full border border-[#CFE5F8] bg-white">
                <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
              </div>

              {/* Text */}

              <div className="flex-1 min-w-0">

                <h2 className="text-base font-bold text-[#0E2E66] sm:text-[18px]">
                  13. Contact Us About Privacy
                </h2>

                <p className="mt-1 text-xs sm:text-[14px] leading-5 sm:leading-6 text-[#53749C]">
                  If you have questions, concerns or requests about this
                  Privacy Policy or your personal information, please contact
                  us through our Contact Us page. We&apos;re here to help.
                </p>

              </div>

              {/* Button */}

              <Link
                to="/contact"
                className="
                  inline-flex
                  h-10
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
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </section>

        </div>
      </main>
    </Layout>
  );
}

export default PrivacyPolicy;