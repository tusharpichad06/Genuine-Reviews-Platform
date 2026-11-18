import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Handshake,
  Info,
  List,
  Paperclip,
  Send,
  Store,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import type {
  ProposalActionStatus,
} from "../components/proposals/ProposalActions";
import { supabase } from "../lib/supabase";

type ProposalStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn";

type ProposalData = {
  id: string;
  business_id: string;
  sender_id: string;
  recipient_id: string;
  recipient_type: "user" | "business";
  review_id: string | null;
  title: string;
  message: string;
  requirements: string | null;
  deliverables: string | null;
  budget: number | string;
  currency: string;
  start_date: string;
  end_date: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
};

type BusinessData = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
  short_description: string;
  location: string | null;
  website: string | null;
};

type ProfileData = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type ReviewData = {
  id: string;
  title: string;
};

type AttachmentData = {
  id: string;
  proposal_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  signed_url?: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(
  budget: number | string,
  currency: string
) {
  const amount = Number(budget);

  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbols[currency] || currency;

  if (!Number.isFinite(amount)) {
    return `${symbol}${budget}`;
  }

  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

function formatFileSize(size: number) {
  if (!size || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusClasses(
  status: ProposalStatus
) {
  switch (status) {
    case "accepted":
      return "border-[#b8ead6] bg-[#e9faf3] text-[#0f9f72]";

    case "declined":
      return "border-[#fecaca] bg-[#fff4f4] text-[#dc2626]";

    case "withdrawn":
      return "border-[#d6e2f2] bg-[#f5f8fc] text-[#617493]";

    default:
      return "border-[#ffe0a8] bg-[#fff7e8] text-[#f59e0b]";
  }
}

function ProposalDetails() {
  const { proposalId } = useParams<{
    proposalId: string;
  }>();

  const navigate = useNavigate();

  const [userId, setUserId] = useState<
    string | null
  >(null);

  const [proposal, setProposal] =
    useState<ProposalData | null>(null);

  const [recipientBusiness, setRecipientBusiness] =
    useState<BusinessData | null>(null);

  const [senderBusiness, setSenderBusiness] =
    useState<BusinessData | null>(null);

  const [senderProfile, setSenderProfile] =
    useState<ProfileData | null>(null);

  const [recipientProfile, setRecipientProfile] =
    useState<ProfileData | null>(null);

  const [relatedReview, setRelatedReview] =
    useState<ReviewData | null>(null);

  const [attachments, setAttachments] =
    useState<AttachmentData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * ============================================================
   * LOAD PROPOSAL
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadProposal() {
      if (!proposalId) {
        setError("Proposal not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        setUserId(user.id);

        /*
         * --------------------------------------------------------
         * PROPOSAL
         * --------------------------------------------------------
         */

        const {
          data: proposalData,
          error: proposalError,
        } = await supabase
          .from("proposals")
          .select(
            `
              id,
              business_id,
              sender_id,
              recipient_id,
              recipient_type,
              review_id,
              title,
              message,
              requirements,
              deliverables,
              budget,
              currency,
              start_date,
              end_date,
              status,
              created_at,
              updated_at
            `
          )
          .eq("id", proposalId)
          .maybeSingle();

        if (proposalError) {
          throw proposalError;
        }

        if (!proposalData) {
          setError(
            "This proposal could not be found."
          );
          return;
        }

        const currentProposal =
          proposalData as ProposalData;

        if (
          currentProposal.sender_id !== user.id &&
          currentProposal.recipient_id !== user.id
        ) {
          setError(
            "You are not authorized to view this proposal."
          );
          return;
        }

        if (!cancelled) {
          setProposal(currentProposal);
        }

        // Fetch related review if review_id exists
        if (currentProposal.review_id) {
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("id, title")
            .eq("id", currentProposal.review_id)
            .maybeSingle();

          if (!cancelled) {
            setRelatedReview(reviewData as ReviewData | null);
          }
        }

        /*
         * --------------------------------------------------------
         * 1. RECIPIENT BUSINESS (if recipient_type is business)
         * --------------------------------------------------------
         */
        if (currentProposal.recipient_type === "business") {
          const { data: recipientBizData } = await supabase
            .from("business_profiles")
            .select("id, user_id, business_name, logo_url, category, short_description, location, website")
            .eq("id", currentProposal.business_id)
            .maybeSingle();

          if (!cancelled) {
            setRecipientBusiness(recipientBizData as BusinessData | null);
          }
        } else {
          const { data: recipientBizData } = await supabase
            .from("business_profiles")
            .select("id, user_id, business_name, logo_url, category, short_description, location, website")
            .eq("id", currentProposal.business_id)
            .maybeSingle();

          if (!cancelled) {
            setRecipientBusiness(recipientBizData as BusinessData | null);
          }
        }

        /*
         * --------------------------------------------------------
         * 2. SENDER BUSINESS (Owned by proposal.sender_id)
         * --------------------------------------------------------
         */
        const { data: senderBizData } = await supabase
          .from("business_profiles")
          .select("id, user_id, business_name, logo_url, category, short_description, location, website")
          .eq("user_id", currentProposal.sender_id)
          .maybeSingle();

        if (!cancelled) {
          setSenderBusiness(senderBizData as BusinessData | null);
        }

        /*
         * --------------------------------------------------------
         * PROFILES
         * --------------------------------------------------------
         */

        const profileIds = Array.from(
          new Set([
            currentProposal.sender_id,
            currentProposal.recipient_id,
          ])
        );

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url"
          )
          .in("id", profileIds);

        if (profileError) {
          throw profileError;
        }

        const profiles =
          (profileData ??
            []) as ProfileData[];

        const sender = profiles.find(
          (profile) =>
            profile.id ===
            currentProposal.sender_id
        );

        const recipient = profiles.find(
          (profile) =>
            profile.id ===
            currentProposal.recipient_id
        );

        if (!cancelled) {
          setSenderProfile(
            sender ?? null
          );

          setRecipientProfile(
            recipient ?? null
          );
        }

        /*
         * --------------------------------------------------------
         * ATTACHMENTS
         * --------------------------------------------------------
         */

        const {
          data: attachmentData,
          error: attachmentError,
        } = await supabase
          .from("proposal_attachments")
          .select(
            `
              id,
              proposal_id,
              uploaded_by,
              file_name,
              file_path,
              file_type,
              file_size,
              created_at
            `
          )
          .eq(
            "proposal_id",
            currentProposal.id
          )
          .order("created_at", {
            ascending: true,
          });

        if (attachmentError) {
          throw attachmentError;
        }

        const attachmentRows =
          (attachmentData ??
            []) as AttachmentData[];

        const attachmentsWithUrls =
          await Promise.all(
            attachmentRows.map(
              async (attachment) => {
                let fileUrl: string | null = null;

                const { data: publicData } = supabase.storage
                  .from("business-assets")
                  .getPublicUrl(attachment.file_path);

                if (publicData?.publicUrl) {
                  fileUrl = publicData.publicUrl;
                } else {
                  const { data: signedData } = await supabase.storage
                    .from("proposal-assets")
                    .createSignedUrl(
                      attachment.file_path,
                      60
                    );
                  fileUrl = signedData?.signedUrl ?? null;
                }

                return {
                  ...attachment,
                  signed_url: fileUrl,
                };
              }
            )
          );

        if (!cancelled) {
          setAttachments(
            attachmentsWithUrls
          );
        }
      } catch (err) {
        console.error(
          "PROPOSAL DETAILS LOAD ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load this proposal."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProposal();

    return () => {
      cancelled = true;
    };
  }, [proposalId, navigate]);

  /*
   * ============================================================
   * PROPOSAL ACTIONS
   * ============================================================
   */

  async function updateProposalStatus(
    nextStatus: ProposalStatus
  ) {
    if (!proposal || !userId) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const isSender = proposal.sender_id === userId;
      const isRecipient = proposal.recipient_id === userId;

      if (
        nextStatus === "withdrawn" &&
        (!isSender || proposal.status !== "pending")
      ) {
        throw new Error(
          "You cannot withdraw this proposal."
        );
      }

      if (
        (nextStatus === "accepted" ||
          nextStatus === "declined") &&
        (!isRecipient || proposal.status !== "pending")
      ) {
        throw new Error(
          "You cannot change this proposal."
        );
      }

      if (nextStatus === "accepted") {
        let reviewerId = proposal.recipient_id;

        if (proposal.recipient_type === "business") {
          const { data: recipientBusinessData, error: recipientBusinessError } =
            await supabase
              .from("business_profiles")
              .select("id, user_id")
              .eq("id", proposal.business_id)
              .maybeSingle();

          if (recipientBusinessError) {
            throw recipientBusinessError;
          }

          if (recipientBusinessData?.user_id) {
            reviewerId = recipientBusinessData.user_id;
          }
        }

        const {
          data: existingDeal,
          error: existingDealError,
        } = await supabase
          .from("deals")
          .select("id")
          .eq("proposal_id", proposal.id)
          .maybeSingle();

        if (existingDealError) {
          throw existingDealError;
        }

        const { data: updatedProposal, error: updateError } =
          await supabase
            .from("proposals")
            .update({
              status: "accepted",
              updated_at: new Date().toISOString(),
            })
            .eq("id", proposal.id)
            .eq("status", "pending")
            .select()
            .maybeSingle();

        if (updateError) {
          throw updateError;
        }

        let dealId = existingDeal?.id ?? null;

        if (!dealId) {
          const currentDate = new Date().toISOString().split("T")[0];

          const { data: newDeal, error: dealError } =
            await supabase
              .from("deals")
              .insert({
                proposal_id: proposal.id,
                business_id: proposal.business_id,
                reviewer_id: reviewerId,
                title: proposal.title,
                description: proposal.message,
                budget: proposal.budget || 0,
                currency: proposal.currency || "INR",
                start_date: proposal.start_date || currentDate,
                end_date: proposal.end_date || currentDate,
                status: "active",
              })
              .select("id")
              .single();

          if (dealError) {
            throw dealError;
          }

          dealId = newDeal.id;
        }

        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: proposal.sender_id,
            type: "proposal_accepted",
            message: `Your proposal "${proposal.title}" has been accepted.`,
            reference_id: dealId,
            review_id: proposal.review_id,
            is_read: false,
          });

        if (notifError) {
          console.error("NOTIFICATION INSERT ERROR:", notifError);
        }

        const now = new Date().toISOString();

        setProposal((current) =>
          current
            ? {
                ...current,
                status: "accepted",
                updated_at: now,
              }
            : current
        );

        navigate(`/deals/${dealId}`);

        return;
      }

      const { error: updateError } = await supabase
        .from("proposals")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id)
        .eq("status", "pending");

      if (updateError) {
        throw updateError;
      }

      if (nextStatus === "declined") {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: proposal.sender_id,
            type: "proposal_declined",
            message: `Your proposal "${proposal.title}" was declined.`,
            reference_id: proposal.id,
            review_id: proposal.review_id,
            is_read: false,
          });

        if (notifError) {
          console.error("NOTIFICATION INSERT ERROR:", notifError);
        }
      }

      setProposal((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : current
      );
    } catch (err) {
      console.error(
        "PROPOSAL STATUS UPDATE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the proposal."
      );

      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    await updateProposalStatus(
      "accepted"
    );
  }

  async function handleDecline() {
    await updateProposalStatus(
      "declined"
    );
  }

  async function handleWithdraw() {
    await updateProposalStatus(
      "withdrawn"
    );
  }

  async function handleViewDeal() {
    if (!proposal) return;

    try {
      let { data: deal, error: dealError } = await supabase
        .from("deals")
        .select("id")
        .eq("proposal_id", proposal.id)
        .maybeSingle();

      if (dealError) {
        throw dealError;
      }

      if (!deal && proposal.status === "accepted") {
        let reviewerId = proposal.recipient_id;

        if (proposal.recipient_type === "business") {
          const { data: recipientBusinessData } = await supabase
            .from("business_profiles")
            .select("user_id")
            .eq("id", proposal.business_id)
            .maybeSingle();

          if (recipientBusinessData?.user_id) {
            reviewerId = recipientBusinessData.user_id;
          }
        }

        const currentDate = new Date().toISOString().split("T")[0];

        const { data: newDeal, error: createError } = await supabase
          .from("deals")
          .insert({
            proposal_id: proposal.id,
            business_id: proposal.business_id,
            reviewer_id: reviewerId,
            title: proposal.title,
            description: proposal.message,
            budget: proposal.budget || 0,
            currency: proposal.currency || "INR",
            start_date: proposal.start_date || currentDate,
            end_date: proposal.end_date || currentDate,
            status: "active",
          })
          .select("id")
          .single();

        if (createError) {
          throw createError;
        }

        deal = newDeal;
      }

      if (!deal?.id) {
        setError("The deal could not be found or created.");
        return;
      }

      navigate(`/deals/${deal.id}`);
    } catch (err) {
      console.error("VIEW DEAL ERROR:", err);
      setError("Unable to open the deal.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />

        <main className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 rounded-lg bg-[#dcecff]" />
            <div className="mt-5 h-8 w-60 rounded-lg bg-[#dcecff]" />
            <div className="mt-2.5 h-4 w-80 rounded bg-[#e4f0fc]" />
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="h-96 rounded-xl border border-[#d6e8f8] bg-white/80" />
              <div className="h-80 rounded-xl border border-[#d6e8f8] bg-white/80" />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-[1180px] items-center justify-center px-3 py-6">
          <div className="w-full max-w-md rounded-xl border border-[#d6e2f2] bg-white p-5 text-center shadow-sm sm:p-6">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#e8f3ff]">
              <Info className="size-5 text-[#2875F5]" />
            </div>

            <h1 className="mt-3 text-base sm:text-lg font-bold text-[#10182D]">
              Unable to open proposal
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-[#617493]">
              {error}
            </p>

            <Link
              to="/proposals"
              className="
                mt-4
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-[#2875F5]
                px-4
                py-2
                text-xs sm:text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#155DCC]
              "
            >
              <ArrowLeft className="size-3.5" />
              Back to Proposals
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  const isSender =
    proposal.sender_id === userId;

  const isRecipient =
    proposal.recipient_id === userId;

  const senderName =
    senderBusiness?.business_name ||
    senderProfile?.username ||
    "Sender Business";

  const recipientName =
    proposal.recipient_type === "business"
      ? recipientBusiness?.business_name || "Recipient Business"
      : recipientProfile?.username || "Recipient User";

  const recipientLogoOrAvatar =
    proposal.recipient_type === "business"
      ? recipientBusiness?.logo_url
      : recipientProfile?.avatar_url;

  return (
    <div className="min-h-screen bg-[#eef8ff] text-[#10182D]">
      <Navbar />

      <main className="overflow-hidden">
        <div className="mx-auto w-full max-w-[1320px] px-3 pb-8 pt-5 sm:px-6 lg:px-8 lg:pt-10">

          <div className="relative">
            <Link
              to="/proposals"
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg sm:rounded-xl
                border
                border-[#c7e4fa]
                bg-white/80
                px-3
                py-1.5 sm:py-2
                text-xs sm:text-sm
                font-semibold
                text-[#2875F5]
                shadow-sm
                transition
                hover:bg-white
              "
            >
              <ArrowLeft className="size-3.5 sm:size-4" />
              Back to Proposals
            </Link>

            <div className="mt-4 sm:mt-7 flex items-end justify-between gap-8">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#102d63] sm:text-5xl">
                  Proposal Details
                </h1>

                <p className="mt-1.5 sm:mt-3 text-xs sm:text-lg text-[#4771a8]">
                  View all the details about this proposal and take the necessary action.
                </p>
              </div>

              <div className="hidden h-[150px] w-[430px] shrink-0 lg:block">
                <div className="relative h-full w-full">
                  <div className="absolute bottom-0 left-16 h-28 w-44 rounded-[50%] bg-[#d8efff]" />
                  <div className="absolute bottom-0 left-24 h-28 w-24 rounded-t-[70px] bg-[#2875F5]/15" />
                  <div className="absolute bottom-0 right-16 h-28 w-24 rounded-t-[70px] bg-[#e8f7ff]" />
                  <div className="absolute left-24 top-2 flex size-14 items-center justify-center rounded-full bg-[#e9f5ff]">
                    <User className="size-8 text-[#2875F5]" />
                  </div>
                  <div className="absolute right-16 top-7 flex size-14 items-center justify-center rounded-full bg-[#fff0db]">
                    <User className="size-8 text-[#f59e0b]" />
                  </div>
                  <div className="absolute left-1/2 top-0 flex h-28 w-40 -translate-x-1/2 rotate-2 flex-col rounded-xl border border-[#cde5f8] bg-white p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-[#e7f2ff]">
                        <Send className="size-4 text-[#2875F5]" />
                      </div>
                      <div className="h-2 w-16 rounded-full bg-[#cfe4f7]" />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 w-full rounded-full bg-[#e0edf8]" />
                      <div className="h-2 w-[85%] rounded-full bg-[#e0edf8]" />
                      <div className="h-2 w-[65%] rounded-full bg-[#e0edf8]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">

            <section className="overflow-hidden rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white shadow-sm">

              <div className="grid border-b border-[#dceaf7] md:grid-cols-[1fr_1fr_auto]">
                <div className="flex items-center gap-3 px-4 py-4 sm:px-7 sm:py-5">
                  {senderBusiness?.logo_url ? (
                    <img
                      src={senderBusiness.logo_url}
                      alt={senderName}
                      className="size-11 sm:size-16 rounded-full border border-[#dce4ee] object-cover"
                    />
                  ) : (
                    <div className="flex size-11 sm:size-16 shrink-0 items-center justify-center rounded-full bg-[#102d63] text-xs sm:text-sm font-bold text-white">
                      <Store className="size-5 sm:size-7" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[#4771a8]">
                      From
                    </p>

                    <p className="mt-0.5 truncate text-sm sm:text-base font-bold text-[#103579]">
                      {senderName}
                    </p>

                    {senderBusiness && (
                      <Link
                        to={`/business/${senderBusiness.id}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2875F5] hover:text-[#155DCC]"
                      >
                        View Business
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-[#dceaf7] px-4 py-4 md:border-l md:border-t-0 sm:px-7 sm:py-5">
                  {recipientLogoOrAvatar ? (
                    <img
                      src={recipientLogoOrAvatar}
                      alt={recipientName}
                      className="size-11 sm:size-16 rounded-full border border-[#dce4ee] object-cover"
                    />
                  ) : proposal.recipient_type === "business" ? (
                    <div className="flex size-11 sm:size-16 shrink-0 items-center justify-center rounded-full bg-[#e5f1ff] text-[#2875F5]">
                      <Store className="size-5 sm:size-7" />
                    </div>
                  ) : (
                    <div className="flex size-11 sm:size-16 shrink-0 items-center justify-center rounded-full bg-[#e5f1ff] text-[#2875F5] font-bold text-sm sm:text-xl">
                      {recipientName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[#4771a8]">
                      To
                    </p>

                    <p className="mt-0.5 truncate text-sm sm:text-base font-bold text-[#103579]">
                      {recipientName}
                    </p>

                    {proposal.recipient_type === "business" && recipientBusiness && (
                      <Link
                        to={`/business/${recipientBusiness.id}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2875F5] hover:text-[#155DCC]"
                      >
                        View Business
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-start px-4 py-4 md:justify-center sm:px-6">
                  <div
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-3.5 sm:px-5
                      py-1.5 sm:py-3
                      text-xs sm:text-sm
                      font-semibold
                      ${getStatusClasses(
                        proposal.status
                      )}
                    `}
                  >
                    <Clock3 className="size-4 sm:size-5" />
                    {proposal.status ===
                    "pending"
                      ? "Pending"
                      : proposal.status
                          .charAt(0)
                          .toUpperCase() +
                        proposal.status.slice(
                          1
                        )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 sm:px-7 sm:py-7">
                {relatedReview && (
                  <div className="mb-4 rounded-xl border border-[#c9e2fb] bg-[#eef7ff] p-3.5 sm:p-4">
                    <p className="text-xs font-medium text-[#4771a8]">Related Review</p>
                    <Link
                      to={`/review/${relatedReview.id}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#2875F5] hover:underline"
                    >
                      <span>⭐ {relatedReview.title}</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#103579]">
                  {proposal.title}
                </h2>

                <p className="mt-2.5 sm:mt-3 max-w-[720px] whitespace-pre-wrap text-xs sm:text-[15px] leading-relaxed sm:leading-7 text-[#4771a8]">
                  {proposal.message}
                </p>

                <div className="mt-5 sm:mt-6 grid border-y border-[#dceaf7] sm:grid-cols-3">
                  <div className="flex items-center gap-3 py-3.5 sm:py-5 sm:pr-5">
                    <div className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                      <span className="text-base sm:text-lg font-bold">
                        ₹
                      </span>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-[#4771a8]">
                        Budget
                      </p>

                      <p className="mt-0.5 text-sm sm:text-base font-bold text-[#103579]">
                        {formatBudget(
                          proposal.budget,
                          proposal.currency
                        )}
                      </p>

                      <p className="mt-0.5 text-[11px] sm:text-xs text-[#6f8db5]">
                        Fixed Budget
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-[#dceaf7] py-3.5 sm:border-l sm:border-t-0 sm:px-5 sm:py-5">
                    <div className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                      <CalendarDays className="size-4 sm:size-5" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-[#4771a8]">
                        Expected Timeline
                      </p>

                      <p className="mt-0.5 text-sm sm:text-base font-bold text-[#103579]">
                        {Math.max(
                          1,
                          Math.ceil(
                            (new Date(
                              proposal.end_date
                            ).getTime() -
                              new Date(
                                proposal.start_date
                              ).getTime()) /
                              (1000 *
                                60 *
                                60 *
                                24)
                          )
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-[#dceaf7] py-3.5 sm:border-l sm:border-t-0 sm:pl-5 sm:py-5">
                    <div className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                      <CalendarDays className="size-4 sm:size-5" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-[#4771a8]">
                        Sent
                      </p>

                      <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#103579]">
                        {formatDate(
                          proposal.created_at
                        )}
                      </p>

                      <p className="mt-0.5 text-[11px] sm:text-xs text-[#6f8db5]">
                        Last Updated:{" "}
                        {formatDate(
                          proposal.updated_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 border-b border-[#dceaf7] pb-5 md:grid-cols-2">
                  <div className="md:border-r md:border-[#dceaf7] md:pr-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e8f3ff] text-[#2875F5]">
                        <List className="size-4 sm:size-5" />
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#103579]">
                        Work Requested
                      </h3>
                    </div>

                    {proposal.requirements ? (
                      <div className="mt-3.5 space-y-2">
                        {proposal.requirements
                          .split("\n")
                          .map(
                            (item, index) => {
                              const cleanItem =
                                item
                                  .replace(
                                    /^[-•✓]\s*/,
                                    ""
                                  )
                                  .trim();

                              if (!cleanItem) {
                                return null;
                              }

                              return (
                                <div
                                  key={`${cleanItem}-${index}`}
                                  className="flex items-start gap-2 text-xs sm:text-sm text-[#4771a8]"
                                >
                                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#2875F5]" />

                                  <span>
                                    {
                                      cleanItem
                                    }
                                  </span>
                                </div>
                              );
                            }
                          )}
                      </div>
                    ) : (
                      <p className="mt-3.5 text-xs sm:text-sm text-[#6f8db5]">
                        No specific work was
                        requested.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e8f3ff] text-[#2875F5]">
                        <FileText className="size-4 sm:size-5" />
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#103579]">
                        Additional Requirements
                      </h3>
                    </div>

                    {proposal.deliverables ? (
                      <p className="mt-3.5 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#4771a8]">
                        {proposal.deliverables}
                      </p>
                    ) : (
                      <p className="mt-3.5 text-xs sm:text-sm text-[#6f8db5]">
                        No additional requirements
                        were provided.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e8f3ff] text-[#2875F5]">
                      <Paperclip className="size-4 sm:size-5" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#103579]">
                      Attachments
                    </h3>
                  </div>

                  {attachments.length > 0 ? (
                    <div className="mt-3.5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {attachments.map(
                        (attachment) => (
                          <div
                            key={attachment.id}
                            className="rounded-xl border border-[#d4e7f8] bg-white p-3.5 transition hover:border-[#b9d9f5]"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#edf6ff] text-[#2875F5]">
                                <FileText className="size-5 sm:size-6" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-semibold text-[#103579]">
                                  {
                                    attachment.file_name
                                  }
                                </p>

                                <p className="mt-0.5 text-[11px] sm:text-xs text-[#6f8db5]">
                                  {formatFileSize(
                                    attachment.file_size
                                  )}
                                </p>
                              </div>
                            </div>

                            {attachment.signed_url && (
                              <a
                                href={
                                  attachment.signed_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="
                                  mt-3
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-[#c9e3fa]
                                  bg-white
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  text-[#2875F5]
                                  transition
                                  hover:bg-[#edf6ff]
                                "
                              >
                                <Download className="size-3.5" />
                                Open
                              </a>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="mt-3.5 rounded-xl border border-dashed border-[#d5e5f4] bg-[#f9fcff] px-4 py-6 text-center">
                      <Paperclip className="mx-auto size-5 text-[#9db5d0]" />

                      <p className="mt-1.5 text-xs sm:text-sm text-[#617493]">
                        No attachments were added.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-4 sm:space-y-5">

              <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                    <Send className="size-4 sm:size-5" />
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[#103579]">
                    Proposal Status
                  </h2>
                </div>

                <div className="mt-5 sm:mt-7">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-3.5 right-3.5 top-3.5 h-1 bg-[#dceafa]" />

                    <div className="absolute left-3.5 top-3.5 h-1 bg-[#2875F5] transition-all" style={{
                      width:
                        proposal.status ===
                        "pending"
                          ? "33%"
                          : proposal.status ===
                              "accepted"
                            ? "66%"
                            : proposal.status ===
                                "declined"
                              ? "33%"
                              : "0%",
                    }} />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex size-7 sm:size-8 items-center justify-center rounded-full border-2 sm:border-4 border-white bg-[#2875F5] text-white shadow-sm">
                        <Check className="size-3.5 sm:size-4" />
                      </div>

                      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-semibold text-[#103579]">
                        Sent
                      </p>

                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#6f8db5]">
                        {formatDate(
                          proposal.created_at
                        )}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`
                          flex
                          size-7 sm:size-8
                          items-center
                          justify-center
                          rounded-full
                          border-2 sm:border-4
                          border-white
                          shadow-sm
                          ${
                            proposal.status ===
                            "pending"
                              ? "bg-[#2875F5] text-white"
                              : "bg-[#dceafa] text-white"
                          }
                        `}
                      >
                        <Clock3 className="size-3.5 sm:size-4" />
                      </div>

                      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-semibold text-[#103579]">
                        Pending
                      </p>

                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#6f8db5]">
                        {proposal.status ===
                        "pending"
                          ? formatDate(
                              proposal.updated_at
                            )
                          : "-"}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`
                          flex
                          size-7 sm:size-8
                          items-center
                          justify-center
                          rounded-full
                          border-2 sm:border-4
                          border-white
                          shadow-sm
                          ${
                            proposal.status ===
                            "accepted"
                              ? "bg-[#0fba88] text-white"
                              : "bg-[#dceafa] text-white"
                          }
                        `}
                      >
                        <Check className="size-3.5 sm:size-4" />
                      </div>

                      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-semibold text-[#103579]">
                        Accepted
                      </p>

                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#6f8db5]">
                        {proposal.status ===
                        "accepted"
                          ? formatDate(
                              proposal.updated_at
                            )
                          : "-"}
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex size-7 sm:size-8 items-center justify-center rounded-full border-2 sm:border-4 border-white bg-[#dceafa] text-white shadow-sm">
                        <Handshake className="size-3.5 sm:size-4" />
                      </div>

                      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-semibold text-[#103579]">
                        Deal
                      </p>

                      <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#6f8db5]">
                        -
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                    <Zap className="size-4 sm:size-5" />
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[#103579]">
                    Actions
                  </h2>
                </div>

                <div className="mt-4 sm:mt-5">
                  {isRecipient &&
                    proposal.status ===
                      "pending" && (
                      <div className="space-y-2.5 sm:space-y-3">
                        <button
                          type="button"
                          onClick={
                            handleAccept
                          }
                          disabled={
                            actionLoading
                          }
                          className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-[#0fb58a]
                            px-4
                            py-3 sm:py-3.5
                            text-xs sm:text-sm
                            font-bold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-[#099a75]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <CheckCircle2 className="size-4 sm:size-5" />
                          {actionLoading
                            ? "Processing..."
                            : "Accept Proposal"}
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleDecline
                          }
                          disabled={
                            actionLoading
                          }
                          className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-[#ff6b75]
                            bg-white
                            px-4
                            py-3 sm:py-3.5
                            text-xs sm:text-sm
                            font-bold
                            text-[#ef4444]
                            transition
                            hover:bg-[#fff5f5]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <X className="size-4 sm:size-5" />
                          Decline Proposal
                        </button>
                      </div>
                    )}

                  {isSender &&
                    proposal.status ===
                      "pending" && (
                      <button
                        type="button"
                        onClick={
                          handleWithdraw
                        }
                        disabled={
                          actionLoading
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-[#ff6b75]
                          bg-white
                          px-4
                          py-3 sm:py-3.5
                          text-xs sm:text-sm
                          font-bold
                          text-[#ef4444]
                          transition
                          hover:bg-[#fff5f5]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        <X className="size-4 sm:size-5" />
                        {actionLoading
                          ? "Withdrawing..."
                          : "Withdraw Proposal"}
                      </button>
                    )}

                  {proposal.status ===
                    "accepted" && (
                    <button
                      type="button"
                      onClick={handleViewDeal}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#2875F5]
                        px-4
                        py-3 sm:py-3.5
                        text-xs sm:text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#155DCC]
                      "
                    >
                      <Handshake className="size-4 sm:size-5" />
                      View Deal
                    </button>
                  )}

                  {proposal.status ===
                    "declined" && (
                    <div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] p-3 sm:p-4 text-center">
                      <XCircle className="mx-auto size-5 sm:size-6 text-[#ef4444]" />

                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-[#b91c1c]">
                        Proposal Declined
                      </p>
                    </div>
                  )}

                  {proposal.status ===
                    "withdrawn" && (
                    <div className="rounded-xl border border-[#d6e2f2] bg-[#f7faff] p-3 sm:p-4 text-center">
                      <XCircle className="mx-auto size-5 sm:size-6 text-[#7187a3]" />

                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-[#617493]">
                        Proposal Withdrawn
                      </p>
                    </div>
                  )}

                  {proposal.status ===
                    "pending" && (
                    <div className="mt-3.5 sm:mt-4 flex gap-2 rounded-xl bg-[#f5faff] p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-[#2875F5]" />

                      <p className="text-[11px] sm:text-xs leading-relaxed text-[#617493]">
                        You can accept or decline
                        this proposal while it's
                        pending.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                    <Handshake className="size-4 sm:size-5" />
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[#103579]">
                    Deal Information
                  </h2>
                </div>

                <div className="mt-4 sm:mt-5 text-center">
                  <div className="mx-auto flex size-16 sm:size-24 items-center justify-center rounded-full bg-[#e5f2ff]">
                    <Handshake className="size-8 sm:size-11 text-[#2875F5]" />
                  </div>

                  <p className="mx-auto mt-3 sm:mt-5 max-w-[250px] text-xs sm:text-sm leading-relaxed text-[#4771a8]">
                    This proposal will be
                    converted into a deal after
                    acceptance.
                  </p>

                  <button
                    type="button"
                    disabled={
                      proposal.status !==
                      "accepted"
                    }
                    onClick={handleViewDeal}
                    className="
                      mt-4 sm:mt-5
                      inline-flex
                      items-center
                      gap-1.5 sm:gap-2
                      rounded-xl
                      bg-[#e6f2ff]
                      px-5 sm:px-6
                      py-2.5 sm:py-3
                      text-xs sm:text-sm
                      font-semibold
                      text-[#2875F5]
                      transition
                      hover:bg-[#d8ebff]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    View Deal
                    <ArrowRight className="size-3.5 sm:size-4" />
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProposalDetails;