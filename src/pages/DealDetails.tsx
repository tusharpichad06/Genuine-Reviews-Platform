import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  FileText,
  Users,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";

import DealMessages from "../components/deals/DealMessages";
import DealAttachments, {
  type DealAttachment as DealAttachmentItem,
} from "../components/deals/DealAttachments";
import DealActions from "../components/deals/DealActions";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type DealStatus =
  | "active"
  | "completed"
  | "cancelled";

type Deal = {
  id: string;
  proposal_id: string | null;
  business_id: string;
  reviewer_id: string;
  title: string;
  description: string | null;
  budget: string | number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  status: DealStatus;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type ReviewData = {
  id: string;
  title: string;
};

type Message = {
  id: string;
  deal_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type DealAttachmentRow = {
  id: string;
  deal_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_url?: string | null;
};

function DealDetails() {
  const { dealId } = useParams<{
    dealId: string;
  }>();

  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [deal, setDeal] =
    useState<Deal | null>(null);

  const [proposalRecipientType, setProposalRecipientType] =
    useState<"user" | "business">("business");

  const [proposalSenderId, setProposalSenderId] =
    useState<string>("");

  const [proposalRecipientId, setProposalRecipientId] =
    useState<string>("");

  const [recipientBusiness, setRecipientBusiness] =
    useState<BusinessProfile | null>(null);

  const [senderBusiness, setSenderBusiness] =
    useState<BusinessProfile | null>(null);

  const [senderProfile, setSenderProfile] =
    useState<Profile | null>(null);

  const [recipientProfile, setRecipientProfile] =
    useState<Profile | null>(null);

  const [dealReview, setDealReview] =
    useState<ReviewData | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [attachments, setAttachments] =
    useState<DealAttachmentRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const isBusinessOwner =
    currentUserId !== "" &&
    (recipientBusiness?.user_id === currentUserId ||
      senderBusiness?.user_id === currentUserId);

  const canInteract =
    deal?.status === "active";

  const statusLabel = useMemo(() => {
    if (!deal) {
      return "";
    }

    if (deal.status === "active") {
      return "Active";
    }

    if (deal.status === "completed") {
      return "Completed";
    }

    return "Cancelled";
  }, [deal]);

  function formatDate(value: string | null) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatBudget() {
    if (!deal?.budget) {
      return "No budget specified";
    }

    return `${deal.currency || "₹"}${Number(
      deal.budget
    ).toLocaleString("en-IN")}`;
  }

  function getInitial(name: string) {
    return (
      name.trim().charAt(0).toUpperCase() ||
      "U"
    );
  }

  async function resolveFileUrl(filePath: string): Promise<string | null> {
    if (!filePath) return null;

    const { data: signedData } = await supabase.storage
      .from("deal-assets")
      .createSignedUrl(filePath, 60);

    if (signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    const { data: publicData } = supabase.storage
      .from("deal-assets")
      .getPublicUrl(filePath);

    return publicData?.publicUrl ?? null;
  }

  async function hydrateAttachmentsWithUrls(
    rawRows: DealAttachmentRow[]
  ): Promise<DealAttachmentRow[]> {
    return Promise.all(
      rawRows.map(async (row) => {
        const url = await resolveFileUrl(row.file_path);
        return {
          ...row,
          file_url: url,
        };
      })
    );
  }

  async function loadDeal() {
    if (!dealId) {
      setError("Deal not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCurrentUserId(user.id);

      const {
        data: dealData,
        error: dealError,
      } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .maybeSingle();

      if (dealError || !dealData) {
        console.error("DEAL DETAILS ERROR:", dealError);
        setError("Unable to load this deal.");
        return;
      }

      const dealRecord = dealData as Deal;

      let senderUid = "";
      let recipientUid = dealRecord.reviewer_id;
      let recType: "user" | "business" = "user";

      if (dealRecord.proposal_id) {
        const { data: propData } = await supabase
          .from("proposals")
          .select("id, sender_id, recipient_id, recipient_type, business_id, review_id")
          .eq("id", dealRecord.proposal_id)
          .maybeSingle();

        if (propData) {
          senderUid = propData.sender_id;
          recipientUid = propData.recipient_id;
          recType = (propData.recipient_type as "user" | "business") || "user";

          if (propData.review_id) {
            const { data: revData } = await supabase
              .from("reviews")
              .select("id, title")
              .eq("id", propData.review_id)
              .maybeSingle();

            setDealReview(revData as ReviewData | null);
          }
        }
      }

      setProposalSenderId(senderUid);
      setProposalRecipientId(recipientUid);
      setProposalRecipientType(recType);

      let loadedSenderBiz: BusinessProfile | null = null;
      if (senderUid) {
        const { data: sBiz } = await supabase
          .from("business_profiles")
          .select("id, user_id, business_name, logo_url, category")
          .eq("user_id", senderUid)
          .maybeSingle();

        loadedSenderBiz = (sBiz as BusinessProfile) ?? null;
      }
      setSenderBusiness(loadedSenderBiz);

      let loadedRecipientBiz: BusinessProfile | null = null;
      if (recType === "business") {
        const { data: rBizByUser } = await supabase
          .from("business_profiles")
          .select("id, user_id, business_name, logo_url, category")
          .eq("user_id", recipientUid)
          .maybeSingle();

        if (rBizByUser) {
          loadedRecipientBiz = rBizByUser as BusinessProfile;
        } else if (dealRecord.business_id) {
          const { data: rBizById } = await supabase
            .from("business_profiles")
            .select("id, user_id, business_name, logo_url, category")
            .eq("id", dealRecord.business_id)
            .maybeSingle();

          loadedRecipientBiz = (rBizById as BusinessProfile) ?? null;
        }
      }
      setRecipientBusiness(loadedRecipientBiz);

      const profileIds = Array.from(
        new Set([senderUid, recipientUid, dealRecord.reviewer_id].filter(Boolean))
      );

      if (profileIds.length > 0) {
        const { data: profRows } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", profileIds);

        const profilesList = (profRows ?? []) as Profile[];
        setSenderProfile(
          profilesList.find((p) => p.id === senderUid) ?? null
        );
        setRecipientProfile(
          profilesList.find((p) => p.id === (recipientUid || dealRecord.reviewer_id)) ?? null
        );
      }

      const isParticipant =
        user.id === senderUid ||
        user.id === recipientUid ||
        user.id === dealRecord.reviewer_id ||
        loadedSenderBiz?.user_id === user.id ||
        loadedRecipientBiz?.user_id === user.id;

      if (!isParticipant) {
        setError("You are not authorized to view this deal.");
        return;
      }

      setDeal(dealRecord);

      const [
        messagesResult,
        attachmentsResult,
      ] = await Promise.all([
        supabase
          .from("deal_messages")
          .select("id, deal_id, sender_id, message, created_at")
          .eq("deal_id", dealId)
          .order("created_at", { ascending: true }),

        supabase
          .from("deal_attachments")
          .select("id, deal_id, uploaded_by, file_name, file_path, file_type, file_size, created_at")
          .eq("deal_id", dealId)
          .order("created_at", { ascending: false }),
      ]);

      setMessages((messagesResult.data as Message[]) ?? []);

      const rawAttachments = (attachmentsResult.data as DealAttachmentRow[]) ?? [];
      const hydrated = await hydrateAttachmentsWithUrls(rawAttachments);
      setAttachments(hydrated);
    } catch (err) {
      console.error("LOAD DEAL ERROR:", err);
      setError("Something went wrong while loading the deal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  async function uploadSingleFile(fileToUpload: File): Promise<DealAttachmentRow> {
    if (!dealId || !currentUserId) {
      throw new Error("Missing deal or user context");
    }

    const safeName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `deal/${dealId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-assets")
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        contentType: fileToUpload.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("DEAL FILE UPLOAD ERROR:", uploadError);
      throw uploadError;
    }

    const { data, error: attachmentError } = await supabase
      .from("deal_attachments")
      .insert({
        deal_id: dealId,
        uploaded_by: currentUserId,
        file_name: fileToUpload.name,
        file_path: filePath,
        file_type: fileToUpload.type,
        file_size: fileToUpload.size,
      })
      .select("id, deal_id, uploaded_by, file_name, file_path, file_type, file_size, created_at")
      .single();

    if (attachmentError || !data) {
      console.error("DEAL ATTACHMENT INSERT ERROR:", attachmentError);
      throw attachmentError || new Error("Failed to save attachment record");
    }

    const resolvedUrl = await resolveFileUrl(filePath);
    const newAttachment: DealAttachmentRow = {
      ...(data as DealAttachmentRow),
      file_url: resolvedUrl,
    };

    setAttachments((prev) => [newAttachment, ...prev]);
    return newAttachment;
  }

  async function sendMessage(
    messageText: string,
    attachmentFile?: File | null
  ) {
    const trimmedMessage = messageText.trim();

    if (
      (!trimmedMessage && !attachmentFile) ||
      !dealId ||
      !currentUserId ||
      !canInteract
    ) {
      return;
    }

    setSendingMessage(true);
    setError("");

    try {
      let finalMessageText = trimmedMessage;

      if (attachmentFile) {
        const uploaded = await uploadSingleFile(attachmentFile);
        const fileTag = `[Attachment: ${uploaded.file_name}]`;
        finalMessageText = finalMessageText
          ? `${finalMessageText}\n${fileTag}`
          : fileTag;
      }

      const { data, error: insertError } = await supabase
        .from("deal_messages")
        .insert({
          deal_id: dealId,
          sender_id: currentUserId,
          message: finalMessageText,
        })
        .select("id, deal_id, sender_id, message, created_at")
        .single();

      if (insertError) {
        console.error("SEND DEAL MESSAGE ERROR:", insertError);
        setError("Unable to send this message.");
        throw insertError;
      }

      if (data) {
        setMessages((previous) => [...previous, data as Message]);
      }
    } finally {
      setSendingMessage(false);
    }
  }

  async function uploadAttachment(file: File) {
    if (!file || !dealId || !currentUserId || !canInteract) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      await uploadSingleFile(file);
    } catch (err) {
      console.error("DEAL UPLOAD ERROR:", err);
      setError("Unable to upload this file.");
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function openOrDownloadAttachment(
    filePath?: string | null,
    existingUrl?: string | null
  ) {
    try {
      if (filePath) {
        const freshUrl = await resolveFileUrl(filePath);
        if (freshUrl) {
          window.open(freshUrl, "_blank", "noopener,noreferrer");
          return;
        }
      }

      if (existingUrl) {
        window.open(existingUrl, "_blank", "noopener,noreferrer");
        return;
      }

      setError("Unable to open this file.");
    } catch (err) {
      console.error("DEAL DOWNLOAD ERROR:", err);
      setError("Unable to open or download this file.");
    }
  }

  async function downloadAttachment(attachment: DealAttachmentItem) {
    await openOrDownloadAttachment(attachment.file_path, attachment.file_url);
  }

  async function markCompleted() {
    if (!deal || !currentUserId || !canInteract) {
      return;
    }

    setActionLoading(true);

    try {
      const { data, error: updateError } = await supabase
        .from("deals")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", deal.id)
        .select("*")
        .single();

      if (updateError) {
        console.error("COMPLETE DEAL ERROR:", updateError);
        setError("Unable to complete this deal.");
        return;
      }

      setDeal(data as Deal);
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelDeal(reason: string) {
    if (!deal || !currentUserId || !canInteract) {
      return;
    }

    setActionLoading(true);

    try {
      const { data, error: updateError } = await supabase
        .from("deals")
        .update({
          status: "cancelled",
          cancelled_by: currentUserId,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deal.id)
        .select("*")
        .single();

      if (updateError) {
        console.error("CANCEL DEAL ERROR:", updateError);
        setError("Unable to cancel this deal.");
        return;
      }

      setDeal(data as Deal);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <main className="mx-auto w-full max-w-[1380px] px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-28 sm:h-9 sm:w-32 rounded-xl bg-[#dcecff]" />
            <div className="mt-3 rounded-xl sm:rounded-2xl bg-white/80 p-4 sm:mt-5 sm:p-6" />
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[315px_minmax(0,1fr)_385px] sm:mt-5 sm:gap-5">
              <div className="h-[350px] lg:h-[500px] rounded-xl sm:rounded-2xl bg-white/80" />
              <div className="h-[350px] lg:h-[500px] rounded-xl sm:rounded-2xl bg-white/80" />
              <div className="h-[350px] lg:h-[500px] rounded-xl sm:rounded-2xl bg-white/80" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <main className="mx-auto flex min-h-[75vh] w-full max-w-[900px] items-center justify-center px-3 py-6 sm:px-6 lg:px-8">
          <div className="w-full rounded-xl sm:rounded-2xl border border-[#d6e2f2] bg-white p-5 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#e8f2ff]">
              <CircleAlert className="h-5 w-5 sm:h-7 sm:w-7 text-[#2875F5]" />
            </div>

            <h1 className="mt-3 text-lg font-bold text-[#10182D] sm:text-2xl">
              Unable to load deal
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#617493] sm:text-sm">
              {error || "This deal could not be found."}
            </p>

            <div className="mt-4 flex justify-center gap-2 sm:mt-6 sm:gap-3">
              <Button
                type="button"
                onClick={() => navigate("/deals")}
                variant="outline"
                className="border-[#c9d7ea] text-xs sm:text-sm text-[#2875F5] hover:bg-[#f3f7ff]"
              >
                Back to Deals
              </Button>

              <Button
                type="button"
                onClick={loadDeal}
                className="bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!deal) return null;

  const senderDisplayName =
    senderBusiness?.business_name ||
    senderProfile?.username ||
    "Sender";

  const senderDisplayLogo =
    senderBusiness?.logo_url ||
    senderProfile?.avatar_url ||
    null;

  const recipientDisplayName =
    proposalRecipientType === "business"
      ? recipientBusiness?.business_name || recipientProfile?.username || "Receiver Business"
      : recipientProfile?.username || "Receiver User";

  const recipientDisplayLogo =
    proposalRecipientType === "business"
      ? recipientBusiness?.logo_url || recipientProfile?.avatar_url || null
      : recipientProfile?.avatar_url || null;

  const isCurrentSender =
    currentUserId === proposalSenderId ||
    (senderBusiness && senderBusiness.user_id === currentUserId);

  const displayHeaderName = isCurrentSender
    ? recipientDisplayName
    : senderDisplayName;

  const displayHeaderLogo = isCurrentSender
    ? recipientDisplayLogo
    : senderDisplayLogo;

  const displayHeaderCategory = isCurrentSender
    ? proposalRecipientType === "business"
      ? recipientBusiness?.category || "Business"
      : "User"
    : senderBusiness?.category || "Business";

  const mappedMessages = messages.map((item) => {
    const attachmentMatch = item.message.match(/\[Attachment:\s*(.+?)\]/);
    const attachedFileName = attachmentMatch ? attachmentMatch[1].trim() : null;

    const matchedAttachment = attachedFileName
      ? attachments.find(
          (att) =>
            att.file_name === attachedFileName &&
            att.uploaded_by === item.sender_id
        ) ||
        attachments.find((att) => att.file_name === attachedFileName)
      : null;

    const cleanMessageText = attachedFileName
      ? item.message.replace(/\[Attachment:\s*.+?\]/, "").trim()
      : item.message;

    const isItemSender =
      item.sender_id === proposalSenderId ||
      item.sender_id === senderProfile?.id ||
      item.sender_id === senderBusiness?.user_id;

    return {
      id: item.id,
      deal_id: item.deal_id,
      sender_id: item.sender_id,
      sender_name:
        item.sender_id === currentUserId
          ? "You"
          : isItemSender
            ? senderDisplayName
            : recipientDisplayName,
      sender_avatar_url:
        item.sender_id === currentUserId
          ? isItemSender
            ? senderDisplayLogo
            : recipientDisplayLogo
          : isItemSender
            ? senderDisplayLogo
            : recipientDisplayLogo,
      message: cleanMessageText,
      created_at: item.created_at,
      attachment_name: matchedAttachment?.file_name || attachedFileName,
      attachment_url: matchedAttachment?.file_url || null,
      attachment_type: matchedAttachment?.file_type || null,
      attachment_path: matchedAttachment?.file_path || null,
    };
  });

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <main className="mx-auto w-full max-w-[1380px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Link
          to="/deals"
          className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-[#c9e2fb] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#2875F5] shadow-sm transition hover:bg-white sm:text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to Deals
        </Link>

        {/* Deal Header */}
        <section className="mt-3 rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-3.5 shadow-sm sm:mt-4 sm:p-6">
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f2ff] mx-auto sm:mx-0 border border-[#d6e2f2]">
                {displayHeaderLogo ? (
                  <img
                    src={displayHeaderLogo}
                    alt={displayHeaderName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-base sm:text-xl font-extrabold text-[#2875F5]">
                    {getInitial(displayHeaderName)}
                  </span>
                )}
              </div>

              <div className="min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-lg font-bold text-[#123b7a] truncate">
                    {displayHeaderName}
                  </h2>

                  {displayHeaderCategory && (
                    <span className="rounded-full bg-[#e8f3ff] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-[#2875F5]">
                      {displayHeaderCategory}
                    </span>
                  )}
                </div>

                <h1 className="mt-0.5 sm:mt-1 truncate text-base sm:text-2xl font-extrabold text-[#123b7a]">
                  {deal.title}
                </h1>

                <p className="text-[11px] sm:text-sm text-[#617493]">
                  Accepted Proposal Collaboration
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center lg:text-right pt-2 border-t border-[#dce8f5] lg:border-t-0 lg:pt-0">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold",
                  deal.status === "active"
                    ? "bg-[#dff8ec] text-[#15945e]"
                    : deal.status === "completed"
                      ? "bg-[#e6f2ff] text-[#2875F5]"
                      : "bg-[#ffe9ec] text-[#ef476f]",
                ].join(" ")}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel}
              </span>

              <p className="mt-1 text-[10px] sm:text-xs text-[#617493]">
                Started: {formatDate(deal.start_date)}
              </p>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[315px_minmax(0,1fr)_385px] sm:mt-5 sm:gap-5">
          {/* LEFT COLUMN */}
          <div className="order-2 lg:order-1 space-y-3.5 sm:space-y-5">
            <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-3.5 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <h2 className="text-xs sm:text-base font-bold text-[#123b7a]">
                  Deal Information
                </h2>
              </div>

              {dealReview && (
                <div className="mt-3 rounded-lg border border-[#c9e2fb] bg-[#eef7ff] p-3">
                  <p className="text-[11px] font-medium text-[#4771a8]">Related Review</p>
                  <Link
                    to={`/review/${dealReview.id}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#2875F5] hover:underline"
                  >
                    <span>⭐ {dealReview.title}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              <div className="mt-3 sm:mt-5 space-y-3 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                    Title
                  </p>
                  <p className="mt-0.5 font-medium text-[#28548f]">
                    {deal.title}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                    Description
                  </p>
                  <p className="mt-0.5 leading-relaxed text-[#28548f]">
                    {deal.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                    Category
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-[#e8f3ff] px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-[#2875F5]">
                    {senderBusiness?.category || recipientBusiness?.category || "Collaboration"}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                    Created
                  </p>
                  <p className="mt-0.5 text-[#28548f]">
                    {formatDate(deal.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                    Started
                  </p>
                  <p className="mt-0.5 text-[#28548f]">
                    {formatDate(deal.start_date)}
                  </p>
                </div>

                {deal.budget && (
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                      Budget
                    </p>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#123b7a]">
                      {formatBudget()}
                    </p>
                  </div>
                )}
              </div>

              {deal.proposal_id && (
                <Link
                  to={`/proposals/${deal.proposal_id}`}
                  className="mt-3.5 sm:mt-5 flex items-center justify-center gap-2 rounded-lg border border-[#9dccff] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#2875F5] transition hover:bg-[#f3f8ff]"
                >
                  View Original Proposal
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              )}
            </section>

            {/* Participants */}
            <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-3.5 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <h2 className="text-xs sm:text-base font-bold text-[#123b7a]">
                  Participants
                </h2>
              </div>

              <div className="mt-3.5 sm:mt-5 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e6f2ff] border border-[#dce4ee]">
                    {senderDisplayLogo ? (
                      <img
                        src={senderDisplayLogo}
                        alt={senderDisplayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-[#2875F5]">
                        {getInitial(senderDisplayName)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                      Sender
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#123b7a] truncate">
                      {senderDisplayName}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#dce8f5]" />

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2875F5] text-white border border-[#dce4ee]">
                    {recipientDisplayLogo ? (
                      <img
                        src={recipientDisplayLogo}
                        alt={recipientDisplayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-bold">
                        {getInitial(recipientDisplayName)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-[#617493]">
                      Receiver
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#123b7a] truncate">
                      {recipientDisplayName}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CENTER COLUMN (Messages) */}
          <div className="order-1 lg:order-2">
            <DealMessages
              messages={mappedMessages}
              currentUserId={currentUserId}
              onSendMessage={(newMessage, attachmentFile) =>
                sendMessage(newMessage, attachmentFile)
              }
              onOpenAttachment={(filePath, fileUrl) => {
                if (filePath || fileUrl) {
                  void openOrDownloadAttachment(filePath, fileUrl);
                }
              }}
              loading={sendingMessage}
              disabled={!canInteract}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="order-3 space-y-3.5 sm:space-y-5">
            <DealAttachments
              attachments={attachments.map((item) => {
                const isUploaderSender =
                  item.uploaded_by === proposalSenderId ||
                  item.uploaded_by === senderProfile?.id ||
                  item.uploaded_by === senderBusiness?.user_id;

                return {
                  id: item.id,
                  deal_id: item.deal_id,
                  uploaded_by: item.uploaded_by,
                  uploader_name: isUploaderSender
                    ? senderDisplayName
                    : recipientDisplayName,
                  file_name: item.file_name,
                  file_path: item.file_path,
                  file_type: item.file_type,
                  file_size: item.file_size,
                  created_at: item.created_at,
                  file_url: item.file_url,
                };
              })}
              currentUserId={currentUserId}
              onUpload={uploadAttachment}
              onDownload={downloadAttachment}
              uploading={uploading}
              disabled={!canInteract}
            />

            <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-3.5 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <h2 className="text-xs sm:text-base font-bold text-[#123b7a]">
                  Private Workspace
                </h2>
              </div>

              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-[#617493]">
                Messages and files in this deal are only available to the two participants.
              </p>
            </section>

            {deal.status === "active" && canInteract && (
              <section className="rounded-xl sm:rounded-2xl border border-[#cfe5f8] bg-white p-3.5 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e7f2ff] text-[#2875F5]">
                    <BriefcaseBusiness className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="text-xs sm:text-base font-bold text-[#123b7a]">
                    Deal Actions
                  </h2>
                </div>

                <div className="mt-3.5 sm:mt-5">
                  <DealActions
                    status={deal.status}
                    onComplete={isBusinessOwner ? markCompleted : undefined}
                    onCancel={(reason) => cancelDeal(reason)}
                    disabled={actionLoading}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DealDetails;