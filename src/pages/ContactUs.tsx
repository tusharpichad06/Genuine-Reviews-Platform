import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  Mail,
  MessageCircle,
  Lightbulb,
  Lock,
  Send,
  ShieldCheck,
  FileText,
  Star,
  Grid2X2,
  Users,
  Heart,
  Store,
} from "lucide-react";

import Layout from "../components/layout/Layout";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";


function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Question");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);


async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!name.trim()) {
    toast.error("Please enter your name.");
    return;
  }

  if (!email.trim()) {
    toast.error("Please enter your email address.");
    return;
  }

  if (!message.trim()) {
    toast.error("Please enter your message.");
    return;
  }

  if (submitting) return;

  setSubmitting(true);

  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim(),
        topic: topic.trim(),
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("CONTACT MESSAGE SUPABASE ERROR:", error);
      throw error;
    }

    if (!data) {
      throw new Error("Message was not saved.");
    }

    toast.success("Your message has been sent successfully.");

    setName("");
    setEmail("");
    setTopic("General Question");
    setMessage("");

  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Could not send your message. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}


  return (
    <Layout>
      <main className="min-h-screen bg-[#eef8ff]">

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* =====================================================
              BREADCRUMB
          ===================================================== */}

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
              <HomeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Home</span>
            </Link>

            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#9AA9BD]" />

            <span className="text-[#617493]">
              Contact Us
            </span>
          </div>

          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="mt-6 grid items-start gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            {/* LEFT HERO */}

            <div className="flex items-center gap-4 sm:gap-6">

              {/* Mail Illustration */}

              <div
                className="
                  hidden
                  size-28 sm:size-32
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#D6E2F2]
                  bg-[#E8F3FF]
                  sm:flex
                "
              >
                <div className="relative">

                  <Mail className="h-14 w-14 sm:h-16 sm:w-16 text-[#2875F5]" />

                  <span
                    className="
                      absolute
                      -bottom-1
                      -right-2
                      flex
                      size-8 sm:size-9
                      items-center
                      justify-center
                      rounded-full
                      bg-[#2875F5]
                      text-white
                      shadow-sm
                    "
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>

                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#2875F5]">
                  Support
                </p>

                <h1
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    tracking-tight
                    text-[#10182D]
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Contact Us
                </h1>

                <p
                  className="
                    mt-2 sm:mt-3
                    max-w-xl
                    text-xs
                    leading-5
                    text-[#617493]
                    sm:text-base
                    sm:leading-7
                    lg:text-lg
                  "
                >
                  Have a question, feedback, or need help with
                  Genuine Reviews? We’re here to help. Send us a
                  message and we’ll get back to you as soon as
                  possible.
                </p>
              </div>

            </div>

            {/* =================================================
                HERO ILLUSTRATION
            ================================================== */}

            <div
              className="
                relative
                hidden
                min-h-[200px]
                overflow-hidden
                rounded-[40%]
                border
                border-[#D6E2F2]
                bg-[#E8F3FF]
                lg:flex
              "
            >

              {/* Chat bubble */}

              <div
                className="
                  absolute
                  right-16
                  top-8
                  flex
                  size-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#2875F5]
                  text-white
                  shadow-md
                "
              >
                <MessageCircle className="h-8 w-8" />
              </div>

              {/* Paper plane */}

              <div className="absolute right-10 top-5 text-[#2875F5]">
                <Send className="h-12 w-12 -rotate-12" />
              </div>

              {/* Sparkles */}

              <div className="absolute left-[42%] top-14 text-[#60A5FA]">
                ✦
              </div>

              <div className="absolute left-[55%] top-28 text-[#93C5FD]">
                ✦
              </div>

              {/* Plant */}

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">

                <div className="relative flex items-end gap-2">

                  <div className="h-20 w-16 rounded-t-full bg-green-500/50" />

                  <div className="h-28 w-20 rounded-t-full bg-green-500/60" />

                  <div className="h-24 w-16 rounded-t-full bg-green-500/40" />

                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-10
                      w-24
                      -translate-x-1/2
                      rounded-t-md
                      border
                      border-[#C9D7EA]
                      bg-white
                    "
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <section
            className="
              mt-6 sm:mt-8
              grid
              gap-4 sm:gap-5
              rounded-2xl
              border
              border-[#D6E2F2]
              bg-white/70
              p-3 sm:p-4
              shadow-sm
              lg:grid-cols-[1.35fr_0.95fr]
              lg:p-5
            "
          >


                    {/* ===================================================
                RIGHT COLUMN — CONTACT FORM
            =================================================== */}

            <div
              className="
                rounded-xl
                border
                border-[#D6E2F2]
                bg-white
                p-4
                shadow-sm
                sm:p-6
                lg:p-7
              "
            >

              <div className="flex items-start gap-3.5 sm:gap-4">

                <div
                  className="
                    flex
                    size-10 sm:size-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8F3FF]
                  "
                >
                  <Send className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                </div>

                <div>

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-[#10182D]
                      sm:text-2xl
                    "
                  >
                    How can we help?
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-[#617493]
                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    Fill out the form below and we’ll get back
                    to you.
                  </p>

                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-5 sm:mt-7 space-y-4 sm:space-y-5"
              >

                {/* =================================================
                    NAME
                ================================================== */}

                <div>
                  <label
                    htmlFor="contact-name"
                    className="
                      text-xs sm:text-sm
                      font-semibold
                      text-[#10182D]
                    "
                  >
                    Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your name"
                    className="
                      mt-1.5 sm:mt-2
                      h-11 sm:h-12
                      w-full
                      rounded-lg
                      border
                      border-[#C9D7EA]
                      bg-white
                      px-3.5 sm:px-4
                      text-xs sm:text-sm
                      text-[#10182D]
                      outline-none
                      transition
                      placeholder:text-[#9AA9BD]
                      focus:border-[#2875F5]
                      focus:ring-2
                      focus:ring-[#2875F5]/15
                    "
                    required
                  />
                </div>

                {/* =================================================
                    EMAIL
                ================================================== */}

                <div>
                  <label
                    htmlFor="contact-email"
                    className="
                      text-xs sm:text-sm
                      font-semibold
                      text-[#10182D]
                    "
                  >
                    Email
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Your email address"
                    className="
                      mt-1.5 sm:mt-2
                      h-11 sm:h-12
                      w-full
                      rounded-lg
                      border
                      border-[#C9D7EA]
                      bg-white
                      px-3.5 sm:px-4
                      text-xs sm:text-sm
                      text-[#10182D]
                      outline-none
                      transition
                      placeholder:text-[#9AA9BD]
                      focus:border-[#2875F5]
                      focus:ring-2
                      focus:ring-[#2875F5]/15
                    "
                    required
                  />
                </div>

                {/* =================================================
                    TOPIC
                ================================================== */}

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="
                      text-xs sm:text-sm
                      font-semibold
                      text-[#10182D]
                    "
                  >
                    What can we help you with?
                  </label>

                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(event) =>
                      setTopic(event.target.value)
                    }
                    className="
                      mt-1.5 sm:mt-2
                      h-11 sm:h-12
                      w-full
                      rounded-lg
                      border
                      border-[#C9D7EA]
                      bg-white
                      px-3.5 sm:px-4
                      text-xs sm:text-sm
                      text-[#10182D]
                      outline-none
                      transition
                      focus:border-[#2875F5]
                      focus:ring-2
                      focus:ring-[#2875F5]/15
                    "
                  >
                    <option>General Question</option>
                    <option>Feedback</option>
                    <option>Account Help</option>
                    <option>Review Question</option>
                    <option>Technical Issue</option>

                    {/* Business Support */}

                    <option>Business Profile Issues</option>
                    <option>Business Profile Deletion</option>
                    <option>Proposal Problems</option>
                    <option>Proposal Attachments</option>
                    <option>Deal Problems</option>
                    <option>Deal Message Problems</option>
                    <option>Deal Attachment Problems</option>
                    <option>Privacy Concerns</option>

                    <option>Other</option>
                  </select>
                </div>

                {/* =================================================
                    MESSAGE
                ================================================== */}

                <div>
                  <label
                    htmlFor="contact-message"
                    className="
                      text-xs sm:text-sm
                      font-semibold
                      text-[#10182D]
                    "
                  >
                    Message
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative mt-1.5 sm:mt-2">

                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value.slice(0, 1000)
                        )
                      }
                      placeholder="Tell us how we can help..."
                      className="
                        min-h-[130px] sm:min-h-[145px]
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-[#C9D7EA]
                        bg-white
                        px-3.5 sm:px-4
                        py-3
                        text-xs sm:text-sm
                        leading-5 sm:leading-6
                        text-[#10182D]
                        outline-none
                        transition
                        placeholder:text-[#9AA9BD]
                        focus:border-[#2875F5]
                        focus:ring-2
                        focus:ring-[#2875F5]/15
                      "
                      required
                    />

                    <span
                      className="
                        absolute
                        bottom-2.5 sm:bottom-3
                        right-3
                        text-[10px] sm:text-xs
                        text-[#617493]
                      "
                    >
                      {message.length} / 1000
                    </span>

                  </div>
                </div>

                {/* =================================================
                    SUBMIT
                ================================================== */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex
                    h-11 sm:h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#2875F5]
                    px-6
                    text-xs sm:text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#155DCC]
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Send className="h-4 w-4" />

                  {submitting
                    ? "Sending..."
                    : "Send Message"}
                </button>

                {/* Privacy note */}

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-1.5 sm:gap-2
                    pt-1 sm:pt-2
                    text-[11px] sm:text-xs
                    leading-4.5 sm:leading-5
                    text-[#617493]
                    text-center
                  "
                >
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />

                  <span>
                    Your information will only be used to respond
                    to your message.
                  </span>
                </div>

              </form>
            </div>

            {/* ===================================================
                Right COLUMN
            =================================================== */}

            <div className="space-y-3.5 sm:space-y-4">

              {/* Review Help */}

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

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-10 sm:size-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E8F3FF]
                    "
                  >
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <h2
                      className="
                        text-base sm:text-xl
                        font-bold
                        text-[#10182D]
                      "
                    >
                      Need help with a review?
                    </h2>

                    <p
                      className="
                        mt-1.5 sm:mt-2
                        text-xs sm:text-sm
                        leading-5 sm:leading-6
                        text-[#617493]
                      "
                    >
                      If you have a question about a review,
                      your own review, or something you
                      experienced while using the platform,
                      tell us about it in the form.
                    </p>

                  </div>

                </div>

              </div>

              {/* Report Review */}

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

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-10 sm:size-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E8F3FF]
                    "
                  >
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <h2
                      className="
                        text-base sm:text-xl
                        font-bold
                        text-[#10182D]
                      "
                    >
                      Want to report a specific review?
                    </h2>

                    <p
                      className="
                        mt-1.5 sm:mt-2
                        text-xs sm:text-sm
                        leading-5 sm:leading-6
                        text-[#617493]
                      "
                    >
                      Use the report option available on that
                      review. It helps us take faster action.
                    </p>

                  </div>

                </div>

              </div>

              {/* Help Us Improve */}

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

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-10 sm:size-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E8F3FF]
                    "
                  >
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <h2
                      className="
                        text-base sm:text-xl
                        font-bold
                        text-[#10182D]
                      "
                    >
                      Help us improve
                    </h2>

                    <p
                      className="
                        mt-1.5 sm:mt-2
                        text-xs sm:text-sm
                        leading-5 sm:leading-6
                        text-[#617493]
                      "
                    >
                      Have an idea, suggestion, or feedback
                      about Genuine Reviews? We’d love to hear
                      it. Your feedback helps us build a better
                      experience for everyone.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  BUSINESS & COLLABORATION SUPPORT
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

                <div className="flex items-start gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-10 sm:size-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E8F3FF]
                    "
                  >
                    <Store className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <h2
                      className="
                        text-base sm:text-xl
                        font-bold
                        text-[#10182D]
                      "
                    >
                      Business & Collaboration Support
                    </h2>

                    <p
                      className="
                        mt-1.5 sm:mt-2
                        text-xs sm:text-sm
                        leading-5 sm:leading-6
                        text-[#617493]
                      "
                    >
                      Need help with a Business Profile,
                      proposal, or deal? Contact our support
                      team and include relevant information such
                      as your business name, proposal or deal
                      reference, and a description of the issue.
                    </p>

                    {/* Business topics */}

                    <div className="mt-3.5 sm:mt-4">

                      <p className="text-xs sm:text-sm font-semibold text-[#10182D]">
                        Common topics:
                      </p>

                      <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">

                        {[
                          "Business Profile issues",
                          "Business Profile deletion",
                          "Proposal problems",
                          "Proposal attachments",
                          "Deal problems",
                          "Deal message problems",
                          "Deal attachment problems",
                          "Reporting business activity",
                          "Privacy concerns",
                        ].map((item) => (
                          <span
                            key={item}
                            className="
                              rounded-full
                              border
                              border-[#CFE3F7]
                              bg-[#EAF5FF]
                              px-2.5 sm:px-3
                              py-1 sm:py-1.5
                              text-[11px] sm:text-xs
                              font-medium
                              text-[#2875F5]
                            "
                          >
                            {item}
                          </span>
                        ))}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  RESPONSE TIME
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">

                  <div
                    className="
                      flex
                      size-10 sm:size-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E8F3FF]
                    "
                  >
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs sm:text-sm font-semibold text-[#617493]">
                      We typically respond within
                    </p>

                    <p
                      className="
                        mt-0.5 sm:mt-1
                        text-xl sm:text-2xl
                        font-bold
                        text-[#10182D]
                      "
                    >
                      24 – 48 hours
                    </p>

                  </div>

                  <p
                    className="
                      sm:ml-auto
                      text-xs sm:text-sm
                      leading-5 sm:leading-6
                      text-[#617493]
                    "
                  >
                    We do our best to respond to all messages
                    as quickly as possible.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              LOOKING FOR SOMETHING ELSE
          ===================================================== */}

          <section
            className="
              mt-5
              rounded-xl
              border
              border-[#D6E2F2]
              bg-white
              p-4 sm:p-6
              shadow-sm
            "
          >

            <h2
              className="
                text-lg sm:text-xl
                font-bold
                text-[#10182D]
              "
            >
              Looking for something else?
            </h2>

            <p
              className="
                mt-1
                text-xs sm:text-sm
                leading-5 sm:leading-6
                text-[#617493]
              "
            >
              Here are some useful links that might help you.
            </p>

            <div className="mt-4 sm:mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

              {/* Guidelines */}

              <Link
                to="/guidelines"
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  p-3.5 sm:p-4
                  transition
                  hover:border-[#2875F5]
                  hover:bg-[#F3F7FF]
                "
              >
                <div
                  className="
                    flex
                    size-9 sm:size-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E8F3FF]
                  "
                >
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
                </div>

                <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
                  Community Guidelines
                </h3>

                <p className="mt-1 text-[11px] sm:text-xs leading-4.5 sm:leading-5 text-[#617493]">
                  Read our community rules and policies.
                </p>

                <ChevronRight className="mt-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2875F5]" />
              </Link>

              {/* Privacy */}

              <Link
                to="/privacy"
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  p-3.5 sm:p-4
                  transition
                  hover:border-[#16A34A]
                  hover:bg-[#F0FDF4]
                "
              >
                <div
                  className="
                    flex
                    size-9 sm:size-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#ECFDF3]
                  "
                >
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[#16A34A]" />
                </div>

                <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
                  Privacy Policy
                </h3>

                <p className="mt-1 text-[11px] sm:text-xs leading-4.5 sm:leading-5 text-[#617493]">
                  Learn how we protect your information.
                </p>

                <ChevronRight className="mt-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#16A34A]" />
              </Link>

              {/* Terms */}

              <Link
                to="/terms"
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  p-3.5 sm:p-4
                  transition
                  hover:border-[#7C3AED]
                  hover:bg-[#F5F3FF]
                "
              >
                <div
                  className="
                    flex
                    size-9 sm:size-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F3E8FF]
                  "
                >
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C3AED]" />
                </div>

                <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
                  Terms of Use
                </h3>

                <p className="mt-1 text-[11px] sm:text-xs leading-4.5 sm:leading-5 text-[#617493]">
                  Check our terms and conditions of use.
                </p>

                <ChevronRight className="mt-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7C3AED]" />
              </Link>

              {/* All Reviews */}

              <Link
                to="/reviews"
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  p-3.5 sm:p-4
                  transition
                  hover:border-[#F59E0B]
                  hover:bg-[#FFFBEB]
                "
              >
                <div
                  className="
                    flex
                    size-9 sm:size-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF7E6]
                  "
                >
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#F59E0B]" />
                </div>

                <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
                  All Reviews
                </h3>

                <p className="mt-1 text-[11px] sm:text-xs leading-4.5 sm:leading-5 text-[#617493]">
                  Explore reviews from our community.
                </p>

                <ChevronRight className="mt-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F59E0B]" />
              </Link>

              {/* Categories */}

              <Link
                to="/categories"
                className="
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  p-3.5 sm:p-4
                  transition
                  hover:border-[#0284C7]
                  hover:bg-[#F0F9FF]
                "
              >
                <div
                  className="
                    flex
                    size-9 sm:size-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E0F2FE]
                  "
                >
                  <Grid2X2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#0284C7]" />
                </div>

                <h3 className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
                  Categories
                </h3>

                <p className="mt-1 text-[11px] sm:text-xs leading-4.5 sm:leading-5 text-[#617493]">
                  Browse reviews by categories and find what you need.
                </p>

                <ChevronRight className="mt-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0284C7]" />
              </Link>

            </div>
          </section>

          {/* =====================================================
              THANK YOU
          ===================================================== */}

          <section
            className="
              mt-5
              mb-4
              overflow-hidden
              rounded-xl
              border
              border-[#D6E2F2]
              bg-[#EAF5FF]
              p-5
              sm:p-7
            "
          >

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

              <div
                className="
                  flex
                  size-12 sm:size-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-sm
                "
              >
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
              </div>

              <div>
                <h2
                  className="
                    text-base sm:text-lg
                    font-bold
                    text-[#10182D]
                  "
                >
                  Thank you!
                </h2>

                <p
                  className="
                    mt-1
                    max-w-3xl
                    text-xs sm:text-sm
                    leading-5 sm:leading-6
                    text-[#617493]
                  "
                >
                  We appreciate you taking the time to reach out.
                  Your questions, feedback, and suggestions help us
                  keep Genuine Reviews genuine, useful and
                  trustworthy.
                </p>
              </div>

              <div className="ml-auto hidden items-center gap-2 lg:flex">
                <Heart className="h-7 w-7 fill-current text-[#2875F5]/70" />
                <MessageCircle className="h-10 w-10 text-[#2875F5]/60" />
                <Heart className="h-6 w-6 fill-current text-[#F59E0B]" />
              </div>

            </div>
          </section>

        </div>
      </main>
    </Layout>
  );
}

export default ContactUs;