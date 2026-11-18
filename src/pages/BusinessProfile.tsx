import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Send,
  Star,
  Store,
  User,
  X,
  Handshake,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import type {
  BusinessProfile as BusinessProfileData,
} from "../components/business/BusinessProfileForm";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BusinessAttachmentViewer from "../components/business/BusinessAttachmentViewer";
import ProposalForm, { type ProposalFormData } from "../components/proposals/ProposalForm";

type Attachment = {
  id: string;
  business_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

type Review = {
  id: string;
  user_id: string | null;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  helpful_count: number | null;
};

type ReviewerProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type ReviewWithProfile = Review & {
  username: string;
  avatar_url: string | null;
};

type SenderBusinessData = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
};

function getInitial(name: string) {
  return (
    name.trim().charAt(0).toUpperCase() || "U"
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatFileSize(
  size: number | null
) {
  if (!size) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function isImage(fileType: string | null) {
  return Boolean(
    fileType &&
    fileType.startsWith("image/")
  );
}

function isVideo(fileType: string | null) {
  return Boolean(
    fileType &&
    fileType.startsWith("video/")
  );
}

function isDocument(fileType: string | null) {
  if (!fileType) {
    return false;
  }

  return (
    fileType.includes("pdf") ||
    fileType.includes("document") ||
    fileType.includes("word") ||
    fileType.includes("text") ||
    fileType.includes("spreadsheet") ||
    fileType.includes("presentation")
  );
}

function getAttachmentUrl(
  filePath: string
) {
  const {
    data,
  } = supabase.storage
    .from("business-assets")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function BusinessProfile() {
  const { businessId } =
    useParams<{
      businessId: string;
    }>();

  const navigate = useNavigate();

  const [business, setBusiness] =
    useState<BusinessProfileData | null>(
      null
    );

  const [attachments, setAttachments] =
    useState<Attachment[]>([]);

  const [selectedAttachment, setSelectedAttachment] =
    useState<{
      fileName: string;
      fileType: string;
      fileUrl: string;
    } | null>(null);

  const [reviews, setReviews] =
    useState<ReviewWithProfile[]>(
      []
    );

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [currentUserBusinessId, setCurrentUserBusinessId] =
    useState<string | null>(null);

  const [senderBusiness, setSenderBusiness] =
    useState<SenderBusinessData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [retrying, setRetrying] =
    useState(false);

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  async function loadBusinessProfile() {
    if (!businessId) {
      setError(
        "Business profile could not be found."
      );
      setLoading(false);
      return;
    }

    try {
      setError("");

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(
          user.id
        );

        const {
          data: ownBusiness,
          error: ownBusinessError,
        } = await supabase
          .from("business_profiles")
          .select("id, user_id, business_name, logo_url")
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle();

        if (ownBusinessError) {
          console.error(
            "LOAD CURRENT BUSINESS ERROR:",
            ownBusinessError
          );
        }

        setCurrentUserBusinessId(
          ownBusiness?.id ?? null
        );

        if (ownBusiness) {
          setSenderBusiness(ownBusiness as SenderBusinessData);
        }
      } else {
        setCurrentUserId(null);
        setCurrentUserBusinessId(null);
        setSenderBusiness(null);
      }

      const {
        data: businessData,
        error: businessError,
      } = await supabase
        .from("business_profiles")
        .select(`
          id,
          user_id,
          business_name,
          logo_url,
          category,
          short_description,
          description,
          location,
          website,
          business_email,
          business_phone,
          services,
          created_at,
          updated_at
        `)
        .eq(
          "id",
          businessId
        )
        .maybeSingle();

      if (businessError) {
        console.error(
          "LOAD BUSINESS PROFILE ERROR:",
          businessError
        );

        setError(
          "Unable to load this business profile. Please try again."
        );

        return;
      }

      if (!businessData) {
        setBusiness(null);
        setError(
          "Business profile not found."
        );
        return;
      }

      const businessProfile =
        businessData as BusinessProfileData;

      setBusiness(
        businessProfile
      );

      const {
        data: attachmentData,
        error: attachmentError,
      } = await supabase
        .from("business_attachments")
        .select(`
          id,
          business_id,
          uploaded_by,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at
        `)
        .eq(
          "business_id",
          businessId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (attachmentError) {
        console.error(
          "LOAD BUSINESS ATTACHMENTS ERROR:",
          attachmentError
        );
      }

      setAttachments(
        (attachmentData ||
          []) as Attachment[]
      );

      const {
        data: reviewData,
        error: reviewError,
      } = await supabase
        .from("reviews")
        .select(`
          id,
          user_id,
          subject,
          category,
          rating,
          title,
          content,
          created_at,
          helpful_count
        `)
        .eq(
          "subject",
          businessProfile.business_name
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(6);

      if (reviewError) {
        console.error(
          "LOAD BUSINESS REVIEWS ERROR:",
          reviewError
        );

        setReviews([]);
      } else {
        const rawReviews =
          (reviewData ||
            []) as Review[];

        const userIds =
          Array.from(
            new Set(
              rawReviews
                .map(
                  (review) =>
                    review.user_id
                )
                .filter(
                  (
                    id
                  ): id is string =>
                    Boolean(id)
                )
            )
          );

        let profiles: ReviewerProfile[] =
          [];

        if (
          userIds.length > 0
        ) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select(`
              id,
              username,
              avatar_url
            `)
            .in(
              "id",
              userIds
            );

          if (profileError) {
            console.error(
              "LOAD REVIEWER PROFILES ERROR:",
              profileError
            );
          } else {
            profiles =
              (profileData ||
                []) as ReviewerProfile[];
          }
        }

        const profileMap =
          new Map(
            profiles.map(
              (profile) => [
                profile.id,
                profile,
              ]
            )
          );

        const formattedReviews =
          rawReviews.map(
            (review) => {
              const profile =
                review.user_id
                  ? profileMap.get(
                      review.user_id
                    )
                  : undefined;

              return {
                ...review,
                username:
                  profile?.username ||
                  "Anonymous User",
                avatar_url:
                  profile?.avatar_url ??
                  null,
              };
            }
          );

        setReviews(
          formattedReviews
        );
      }
    } catch (err) {
      console.error(
        "BUSINESS PROFILE LOAD ERROR:",
        err
      );

      setError(
        "Something went wrong while loading this business profile."
      );
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadBusinessProfile();
  }, [businessId]);

  const isOwner =
    Boolean(
      business &&
        currentUserId &&
        business.user_id ===
          currentUserId
    );

  const isBusinessUser =
    Boolean(
      currentUserBusinessId
    );

  const canSendProposal =
    isBusinessUser &&
    !isOwner &&
    Boolean(
      business
    );

  const imageAttachments =
    useMemo(
      () =>
        attachments.filter(
          (attachment) =>
            isImage(
              attachment.file_type
            )
        ),
      [attachments]
    );

  const videoAttachments =
    useMemo(
      () =>
        attachments.filter(
          (attachment) =>
            isVideo(
              attachment.file_type
            )
        ),
      [attachments]
    );

  const documentAttachments =
    useMemo(
      () =>
        attachments.filter(
          (attachment) =>
            isDocument(
              attachment.file_type
            ) ||
            !isImage(
              attachment.file_type
            ) &&
              !isVideo(
                attachment.file_type
              )
        ),
      [attachments]
    );

  const reviewCount =
    reviews.length;

  const ratingValues =
    reviews
      .map(
        (review) =>
          review.rating
      )
      .filter(
        (
          rating
        ): rating is number =>
          typeof rating ===
            "number" &&
          rating > 0
      );

  const averageRating =
    ratingValues.length >
    0
      ? ratingValues.reduce(
          (
            total,
            rating
          ) =>
            total +
            rating,
          0
        ) /
        ratingValues.length
      : null;

  async function handleRetry() {
    setRetrying(true);
    await loadBusinessProfile();
  }

  function handleSendProposalClick() {
    if (!business) {
      return;
    }

    if (!currentUserId) {
      const returnTo =
        window.location.pathname +
        window.location.search;

      sessionStorage.setItem(
        "auth_return_to",
        returnTo
      );

      navigate(
        `/auth?mode=login&returnTo=${encodeURIComponent(
          returnTo
        )}`
      );

      return;
    }

    if (!isBusinessUser || isOwner) {
      return;
    }

    setIsProposalModalOpen(true);
  }

  async function handleProposalSubmit(data: ProposalFormData) {
    if (!currentUserId || !business) return;

    setSubmittingProposal(true);
    try {
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .insert({
          business_id: business.id,
          sender_id: currentUserId,
          recipient_id: business.user_id,
          recipient_type: "business",
          review_id: data.reviewId || null,
          title: data.title,
          message: data.message,
          requirements: data.requirements || null,
          deliverables: data.deliverables || null,
          budget: Number(data.budget),
          currency: data.currency,
          start_date: data.startDate || new Date().toISOString().split("T")[0],
          end_date: data.endDate || new Date().toISOString().split("T")[0],
          status: "pending",
        })
        .select("id")
        .single();

      if (proposalError || !proposalData) {
        throw proposalError || new Error("Failed to create proposal.");
      }

      const proposalId = proposalData.id;

      if (data.attachments && data.attachments.length > 0) {
        for (const file of data.attachments) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const filePath = `proposal/${proposalId}/${Date.now()}-${safeName}`;

          const { error: uploadErr } = await supabase.storage
            .from("proposal-assets")
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

          if (!uploadErr) {
            await supabase.from("proposal_attachments").insert({
              proposal_id: proposalId,
              uploaded_by: currentUserId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
            });
          }
        }
      }

      await supabase.from("notifications").insert({
        user_id: business.user_id,
        type: "proposal",
        message: `You received a new proposal: "${data.title}"`,
        reference_id: proposalId,
        review_id: data.reviewId || null,
        is_read: false,
      });

      setIsProposalModalOpen(false);
      navigate(`/proposals/${proposalId}`);
    } catch (err) {
      console.error("SUBMIT PROPOSAL ERROR:", err);
      throw err;
    } finally {
      setSubmittingProposal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-9 w-32 rounded-xl bg-[#dcecff]" />

            <div className="mt-4 rounded-[16px] border border-[#d6e8fa] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="h-24 w-24 shrink-0 rounded-full bg-[#e1eefc] sm:h-28 sm:w-28" />

                <div className="flex-1">
                  <div className="h-7 w-48 rounded-lg bg-[#dcecff] sm:h-8 sm:w-64" />
                  <div className="mt-2.5 h-6 w-36 rounded-full bg-[#e7f2fd] sm:mt-3 sm:w-44" />
                  <div className="mt-3.5 h-4 w-full max-w-md rounded bg-[#e7f2fd] sm:mt-4 sm:w-80" />
                </div>
              </div>
            </div>

            <div className="mt-4 h-12 rounded-xl bg-white" />

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.75fr_0.8fr] sm:mt-5 sm:gap-5">
              <div className="space-y-4 sm:space-y-5">
                <div className="h-40 rounded-[16px] bg-white" />
                <div className="h-36 rounded-[16px] bg-white" />
                <div className="h-72 rounded-[16px] bg-white" />
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div className="h-64 rounded-[16px] bg-white" />
                <div className="h-48 rounded-[16px] bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !business
  ) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-[1180px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[20px] border border-[#d6e2f2] bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf4ff] text-[#2875F5]">
              <Store className="h-7 w-7" />
            </div>

            <h1 className="mt-4 text-lg font-bold text-[#10182D] sm:text-xl">
              {error ===
              "Business profile not found."
                ? "Business Not Found"
                : "Unable to load business profile"}
            </h1>

            <p className="mt-2 text-xs leading-5 text-[#617493] sm:text-sm sm:leading-6">
              {error ||
                "This business profile does not exist or is no longer available."}
            </p>

            <div className="mt-5 flex flex-col justify-center gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
              {error !==
                "Business profile not found." && (
                <Button
                  type="button"
                  onClick={
                    handleRetry
                  }
                  disabled={
                    retrying
                  }
                  variant="outline"
                  className="border-[#c9dcf2] text-[#2875F5] hover:bg-[#f3f8ff]"
                >
                  {retrying
                    ? "Trying..."
                    : "Try Again"}
                </Button>
              )}

              <Button
                type="button"
                onClick={() =>
                  navigate(
                    "/businesses"
                  )
                }
                className="bg-[#2875F5] text-white hover:bg-[#155DCC]"
              >
                Browse Businesses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <main className="relative z-10">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

          <Link
            to="/businesses"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-[#a9d7ff]
              bg-white/90
              px-3.5 py-1.5
              text-xs
              font-semibold
              text-[#2875F5]
              shadow-sm
              transition
              hover:bg-white
              hover:border-[#2875F5]
              sm:px-4 sm:py-2 sm:text-sm
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Businesses
          </Link>

          <section
            className="
              mt-3
              rounded-[16px]
              border
              border-[#cfe5f8]
              bg-white
              p-4
              shadow-[0_8px_30px_rgba(40,117,245,0.07)]
              sm:p-6
            "
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 min-w-0">

                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#d6e2f2] bg-[#edf6ff] sm:h-28 sm:w-28 mx-auto sm:mx-0">
                  {business.logo_url ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAttachment({
                          fileName: `${business.business_name} logo`,
                          fileType: "image/jpeg",
                          fileUrl: business.logo_url!,
                        })
                      }
                      className="
                        group
                        block
                        h-full
                        w-full
                        cursor-pointer
                      "
                      aria-label={`Open ${business.business_name} profile image`}
                    >
                      <img
                        src={business.logo_url}
                        alt={`${business.business_name} logo`}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-105
                        "
                      />
                    </button>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#2875F5]">
                      <Store className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#123b7a] sm:text-4xl truncate">
                    {
                      business.business_name
                    }
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-semibold text-[#2875F5]">
                      {
                        business.category
                      }
                    </span>

                    {isOwner && (
                      <span className="rounded-full bg-[#f1f6fc] px-3 py-1 text-xs font-semibold text-[#617493]">
                        Your Business
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs sm:text-sm text-[#617493]">
                    {averageRating !==
                      null ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#2875F5]">
                        <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                        {averageRating.toFixed(
                          1
                        )}
                        <span className="font-normal text-[#617493]">
                          (
                          {reviewCount}{" "}
                          {reviewCount ===
                          1
                            ? "review"
                            : "reviews"}
                          )
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#617493]">
                        <Star className="h-4 w-4 text-[#a9b6c8]" />
                        No reviews yet
                      </span>
                    )}

                    {business.location && (
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <MapPin className="h-4 w-4 shrink-0 text-[#2875F5]" />
                        <span className="truncate">{business.location}</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#4771a8] sm:text-sm sm:leading-6">
                    {
                      business.short_description
                    }
                  </p>
                </div>
              </div>

              {/* Owner / Proposal action */}

              <div className="shrink-0 pt-2 lg:pt-0">
                {isOwner ? (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/business/edit"
                        )
                      }
                      className="
                        w-full
                        bg-[#2875F5]
                        text-white
                        shadow-md
                        shadow-[#2875F5]/20
                        hover:bg-[#155DCC]
                        sm:w-auto
                      "
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Business Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/proposals")}
                      className="w-full border-[#D6E2F2] bg-white text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5] sm:w-auto"
                    >
                      <FileText className="mr-2 h-4 w-4 text-[#2875F5]" />
                      My Proposals
                    </Button>

                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/deals")}
                    className="w-full border-[#D6E2F2] bg-white text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5] sm:w-auto"
                  >
                    <Handshake className="mr-2 h-4 w-4 text-[#2875F5]" />
                    My Deals
                  </Button>
                  
                  </div>
                ) : canSendProposal ? (
                  <Button
                    type="button"
                    onClick={
                      handleSendProposalClick
                    }
                    className="
                      w-full
                      bg-[#2875F5]
                      text-white
                      shadow-md
                      shadow-[#2875F5]/20
                      hover:bg-[#155DCC]
                      sm:w-auto
                    "
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Proposal
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <nav
            className="
              mt-4
              flex
              overflow-x-auto
              rounded-xl
              border
              border-[#d6e2f2]
              bg-white
              p-1
              shadow-sm
              sm:mt-5
            "
          >
            <a
              href="#about"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold text-[#2875F5] hover:bg-[#f3f8ff] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              About
            </a>

            <a
              href="#information"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium text-[#617493] hover:bg-[#f3f8ff] hover:text-[#2875F5] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Business Information
            </a>

            <a
              href="#services"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium text-[#617493] hover:bg-[#f3f8ff] hover:text-[#2875F5] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Services
            </a>

            <a
              href="#portfolio"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium text-[#617493] hover:bg-[#f3f8ff] hover:text-[#2875F5] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Portfolio & Attachments
            </a>

            <a
              href="#reviews"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium text-[#617493] hover:bg-[#f3f8ff] hover:text-[#2875F5] sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Reviews
            </a>
          </nav>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.75fr_0.8fr] sm:mt-5 sm:gap-5">

            <div className="space-y-4 sm:space-y-5">

              <section
                id="about"
                className="
                  scroll-mt-24
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-6
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e8f4ff] text-[#2875F5]">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="text-base font-bold text-[#123b7a] sm:text-lg">
                    About{" "}
                    {
                      business.business_name
                    }
                  </h2>
                </div>

                <p className="mt-3 sm:mt-4 whitespace-pre-line text-xs sm:text-sm leading-6 sm:leading-7 text-[#4771a8]">
                  {
                    business.description
                  }
                </p>
              </section>

              <section
                id="services"
                className="
                  scroll-mt-24
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-6
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e8f7f2] text-[#16A34A]">
                    <BriefcaseBusiness className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="text-base font-bold text-[#123b7a] sm:text-lg">
                    Services
                  </h2>
                </div>

                {business.services
                  ?.filter(
                    (service) =>
                      service.trim()
                  ).length >
                0 ? (
                  <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
                    {business.services
                      .filter(
                        (service) =>
                          service.trim()
                      )
                      .map(
                        (
                          service
                        ) => (
                          <span
                            key={
                              service
                            }
                            className="
                              rounded-full
                              border
                              border-[#cfe5f8]
                              bg-[#eef8ff]
                              px-3.5 py-1.5
                              text-xs
                              font-semibold
                              text-[#2875F5]
                            "
                          >
                            {
                              service
                            }
                          </span>
                        )
                      )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs sm:text-sm text-[#617493]">
                    No services have
                    been added yet.
                  </p>
                )}
              </section>

              <section
                id="portfolio"
                className="
                  scroll-mt-24
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-6
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#f0eaff] text-[#7c3aed]">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <h2 className="text-base font-bold text-[#123b7a] sm:text-lg">
                      Portfolio &
                      Attachments
                    </h2>
                  </div>

                  {attachments.length >
                    0 && (
                    <span className="text-xs font-medium text-[#617493]">
                      {
                        attachments.length
                      }{" "}
                      file
                      {attachments.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  )}
                </div>

                {attachments.length ===
                0 ? (
                  <div className="mt-4 sm:mt-5 rounded-xl border border-dashed border-[#cfe5f8] bg-[#f8fcff] px-4 py-6 text-center sm:px-5 sm:py-8">
                    <ImageIcon className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#a9c8e8]" />

                    <p className="mt-2.5 text-xs sm:text-sm font-semibold text-[#4771a8]">
                      No portfolio
                      attachments yet.
                    </p>

                    <p className="mt-1 text-xs text-[#617493]">
                      This business
                      has not uploaded
                      any public
                      portfolio files.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 sm:mt-5 space-y-5">

                    {imageAttachments.length >
                      0 && (
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wide text-[#2875F5]">
                            Images
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                          {imageAttachments
                            .slice(
                              0,
                              8
                            )
                            .map(
                              (
                                attachment
                              ) => {
                                const url =
                                  getAttachmentUrl(
                                    attachment.file_path
                                  );

                                return (
                                  <a
                                    key={
                                      attachment.id
                                    }
                                    href={
                                      url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                      group
                                      relative
                                      aspect-[4/3]
                                      overflow-hidden
                                      rounded-xl
                                      border
                                      border-[#d6e2f2]
                                      bg-[#edf6ff]
                                    "
                                  >
                                    <img
                                      src={
                                        url
                                      }
                                      alt={
                                        attachment.file_name
                                      }
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                        transition
                                        duration-300
                                        group-hover:scale-105
                                      "
                                    />

                                    <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 opacity-0 transition group-hover:opacity-100">
                                      <p className="truncate text-[10px] font-medium text-white">
                                        {
                                          attachment.file_name
                                        }
                                      </p>
                                    </div>
                                  </a>
                                );
                              }
                            )}
                        </div>
                      </div>
                    )}

                    {videoAttachments.length >
                      0 && (
                      <div>
                        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#2875F5]">
                          Videos
                        </h3>

                        <div className="space-y-2">
                          {videoAttachments.map(
                            (
                              attachment
                            ) => {
                              const url =
                                getAttachmentUrl(
                                  attachment.file_path
                                );

                              return (
                                <a
                                  key={
                                    attachment.id
                                  }
                                  href={
                                    url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    flex
                                    items-center
                                    gap-2.5 sm:gap-3
                                    rounded-xl
                                    border
                                    border-[#d6e2f2]
                                    bg-[#f8fcff]
                                    p-2.5 sm:p-3
                                    transition
                                    hover:border-[#a9d7ff]
                                    hover:bg-[#f0f8ff]
                                  "
                                >
                                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f4ff] text-[#2875F5]">
                                    <ExternalLink className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs sm:text-sm font-semibold text-[#10182D]">
                                      {
                                        attachment.file_name
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#617493]">
                                      Video
                                      {attachment.file_size
                                        ? ` • ${formatFileSize(
                                            attachment.file_size
                                          )}`
                                        : ""}
                                    </p>
                                  </div>

                                  <ChevronRight className="h-4 w-4 text-[#2875F5]" />
                                </a>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {documentAttachments.length >
                      0 && (
                      <div>
                        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#2875F5]">
                          Documents
                        </h3>

                        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                          {documentAttachments.map(
                            (
                              attachment
                            ) => {
                              const url =
                                getAttachmentUrl(
                                  attachment.file_path
                                );

                              return (
                                <a
                                  key={
                                    attachment.id
                                  }
                                  href={
                                    url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    flex
                                    items-center
                                    gap-2.5 sm:gap-3
                                    rounded-xl
                                    border
                                    border-[#d6e2f2]
                                    bg-[#f8fcff]
                                    p-2.5 sm:p-3
                                    transition
                                    hover:border-[#a9d7ff]
                                    hover:bg-[#f0f8ff]
                                  "
                                >
                                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f4ff] text-[#2875F5]">
                                    <Download className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs sm:text-sm font-semibold text-[#10182D]">
                                      {
                                        attachment.file_name
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#617493]">
                                      {attachment.file_type ||
                                        "Document"}

                                      {attachment.file_size
                                        ? ` • ${formatFileSize(
                                            attachment.file_size
                                          )}`
                                        : ""}
                                    </p>
                                  </div>
                                </a>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section
                id="reviews"
                className="
                  scroll-mt-24
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-6
                "
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#fff4dd] text-[#F59E0B]">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#123b7a] sm:text-lg">
                        Reviews
                      </h2>

                      <p className="text-xs text-[#617493]">
                        Reviews from people about this business.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {averageRating !==
                      null && (
                      <span className="text-xs sm:text-sm font-bold text-[#10182D]">
                        <span className="text-[#F59E0B]">
                          ★
                        </span>{" "}
                        {averageRating.toFixed(
                          1
                        )}{" "}
                        <span className="font-normal text-[#617493]">
                          out of 5
                        </span>
                      </span>
                    )}

                    {reviewCount >
                      0 && (
                      <span className="text-xs text-[#2875F5]">
                        {reviewCount}{" "}
                        reviews
                      </span>
                    )}
                  </div>
                </div>

                {reviews.length ===
                0 ? (
                  <div className="mt-4 sm:mt-5 rounded-xl border border-dashed border-[#cfe5f8] bg-[#f8fcff] px-4 py-6 text-center sm:px-5 sm:py-8">
                    <MessageSquare className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#a9c8e8]" />

                    <p className="mt-2.5 text-xs sm:text-sm font-semibold text-[#4771a8]">
                      No reviews yet
                    </p>

                    <p className="mt-1 text-xs text-[#617493]">
                      Reviews for this
                      business will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 sm:mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map(
                      (review) => (
                        <Link
                          key={
                            review.id
                          }
                          to={`/review/${review.id}`}
                          className="
                            group
                            rounded-xl
                            border
                            border-[#d6e2f2]
                            bg-white
                            p-3.5 sm:p-4
                            transition
                            hover:border-[#a9d7ff]
                            hover:shadow-sm
                          "
                        >
                          <div className="flex items-center gap-2.5">
                            {review.avatar_url ? (
                              <img
                                src={
                                  review.avatar_url
                                }
                                alt=""
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#e8f2ff] text-xs sm:text-sm font-bold text-[#2875F5]">
                                {getInitial(
                                  review.username
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#10182D]">
                                {
                                  review.username
                                }
                              </p>

                              <p className="text-[10px] text-[#617493]">
                                {formatDate(
                                  review.created_at
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5 sm:mt-3 flex items-center gap-1">
                            {Array.from({
                              length: 5,
                            }).map(
                              (
                                _,
                                index
                              ) => (
                                <Star
                                  key={
                                    index
                                  }
                                  className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                    index <
                                    Math.round(
                                      review.rating ??
                                        0
                                    )
                                      ? "fill-[#F59E0B] text-[#F59E0B]"
                                      : "text-[#c7d1df]"
                                  }`}
                                />
                              )
                            )}

                            <span className="ml-1 text-[11px] font-semibold text-[#617493]">
                              {review.rating ??
                                "—"}
                            </span>
                          </div>

                          {review.title && (
                            <h3 className="mt-2.5 sm:mt-3 line-clamp-1 text-xs sm:text-sm font-bold text-[#123b7a]">
                              {
                                review.title
                              }
                            </h3>
                          )}

                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#617493]">
                            {
                              review.content
                            }
                          </p>

                          <div className="mt-3 flex items-center justify-between text-[10px] sm:text-xs text-[#2875F5]">
                            <span>
                              View Review
                            </span>

                            <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                )}

                {reviews.length >
                  0 && (
                  <div className="mt-4 sm:mt-5 text-center">
                    <Link
                      to={`/reviews?business=${encodeURIComponent(
                        business.business_name
                      )}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2875F5] hover:text-[#155DCC]"
                    >
                      View All Reviews
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-4 sm:space-y-5">

              <section
                id="information"
                className="
                  scroll-mt-24
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e8f4ff] text-[#2875F5]">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[#123b7a]">
                    Business Information
                  </h2>
                </div>

                <div className="mt-3 sm:mt-4 divide-y divide-[#e3edf7]">
                  {business.location && (
                    <div className="flex gap-3 py-3 sm:py-4 first:pt-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#2875F5]">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10182D]">
                          Location
                        </p>
                        <p className="mt-0.5 sm:mt-1 text-xs leading-5 text-[#617493]">
                          {
                            business.location
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex gap-3 py-3 sm:py-4">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#2875F5]">
                        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10182D]">
                          Website
                        </p>

                        <a
                          href={
                            business.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 sm:mt-1 block truncate text-xs text-[#2875F5] hover:text-[#155DCC]"
                        >
                          {
                            business.website
                          }
                        </a>
                      </div>
                    </div>
                  )}

                  {business.business_email && (
                    <div className="flex gap-3 py-3 sm:py-4">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#2875F5]">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10182D]">
                          Business Email
                        </p>

                        <a
                          href={`mailto:${business.business_email}`}
                          className="mt-0.5 sm:mt-1 block truncate text-xs text-[#2875F5] hover:text-[#155DCC]"
                        >
                          {
                            business.business_email
                          }
                        </a>
                      </div>
                    </div>
                  )}

                  {business.business_phone && (
                    <div className="flex gap-3 py-3 sm:py-4 last:pb-0">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[#2875F5]">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10182D]">
                          Business Phone
                        </p>

                        <a
                          href={`tel:${business.business_phone}`}
                          className="mt-0.5 sm:mt-1 block text-xs text-[#2875F5] hover:text-[#155DCC]"
                        >
                          {
                            business.business_phone
                          }
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {!business.location &&
                  !business.website &&
                  !business.business_email &&
                  !business.business_phone && (
                    <p className="mt-4 sm:mt-5 rounded-xl bg-[#f8fcff] px-4 py-4 sm:py-5 text-center text-xs text-[#617493]">
                      No additional
                      business
                      information has
                      been provided.
                    </p>
                  )}
              </section>

              {canSendProposal && (
                <section
                  className="
                    rounded-[16px]
                    border
                    border-[#b9dcff]
                    bg-[#edf7ff]
                    p-4
                    shadow-sm
                    sm:p-5
                  "
                >
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#dceeff] text-[#2875F5]">
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#123b7a]">
                    Interested in
                    collaborating?
                  </h2>

                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#4771a8]">
                    Send a proposal to{" "}
                    {
                      business.business_name
                    }{" "}
                    and start a business
                    partnership.
                  </p>

                  <Button
                    type="button"
                    onClick={
                      handleSendProposalClick
                    }
                    className="
                      mt-4 sm:mt-5
                      w-full
                      bg-[#2875F5]
                      text-white
                      shadow-md
                      shadow-[#2875F5]/20
                      hover:bg-[#155DCC]
                    "
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Proposal
                  </Button>
                </section>
              )}

              {isOwner && (
                <section
                  className="
                    rounded-[16px]
                    border
                    border-[#cfe5f8]
                    bg-white
                    p-4
                    shadow-sm
                    sm:p-5
                  "
                >
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#e8f4ff] text-[#2875F5]">
                    <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <h2 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#123b7a]">
                    Manage Your Business
                  </h2>

                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                    Update your business
                    information and manage
                    your public profile.
                  </p>

                  <div className="mt-3.5 sm:mt-4 flex flex-col gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigate(
                          "/business/edit"
                        )
                      }
                      className="
                        w-full
                        border-[#c9dcf2]
                        bg-white
                        text-xs sm:text-sm
                        text-[#2875F5]
                        hover:border-[#a9d7ff]
                        hover:bg-[#f3f8ff]
                      "
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Business Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/proposals")}
                      className="
                        w-full
                        border-[#c9dcf2]
                        bg-white
                        text-xs sm:text-sm
                        text-[#2875F5]
                        hover:border-[#a9d7ff]
                        hover:bg-[#f3f8ff]
                      "
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      My Proposals
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/deals")}
                      className="
                        w-full
                        border-[#c9dcf2]
                        bg-white
                        text-xs sm:text-sm
                        text-[#2875F5]
                        hover:border-[#a9d7ff]
                        hover:bg-[#f3f8ff]
                      "
                    >
                      <Handshake className="mr-2 h-4 w-4" />
                      My Deals
                    </Button>
                  </div>
                </section>
              )}

              <section
                className="
                  overflow-hidden
                  rounded-[16px]
                  border
                  border-[#cfe5f8]
                  bg-white
                  p-5 sm:p-6
                  text-center
                  shadow-sm
                "
              >
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#eaf5ff] text-[#2875F5]">
                  <Store className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <h2 className="mt-3.5 sm:mt-4 text-sm sm:text-base font-bold text-[#123b7a]">
                  Support Local
                  Businesses
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                  Help great businesses
                  grow by leaving honest
                  reviews and exploring new
                  opportunities.
                </p>

                <Link
                  to="/businesses"
                  className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#2875F5] hover:text-[#155DCC]"
                >
                  Explore Businesses
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* In-Page Proposal Modal */}
      {isProposalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D6E2F2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D6E2F2] pb-4 mb-4">
              <h2 className="text-lg font-bold text-[#10182D]">
                Send Proposal to {business.business_name}
              </h2>

              <button
                type="button"
                onClick={() => setIsProposalModalOpen(false)}
                className="rounded-full p-1 text-[#617493] hover:bg-[#E8F2FF] hover:text-[#2875F5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ProposalForm
              businessId={business.id}
              businessName={senderBusiness?.business_name}
              businessLogoUrl={senderBusiness?.logo_url}
              recipientId={business.user_id}
              recipientName={business.business_name}
              reviewId={null}
              onSubmit={handleProposalSubmit}
              onCancel={() => setIsProposalModalOpen(false)}
              loading={submittingProposal}
            />
          </div>
        </div>
      )}

      {selectedAttachment && (
        <BusinessAttachmentViewer
          fileName={selectedAttachment.fileName}
          fileType={selectedAttachment.fileType}
          fileUrl={selectedAttachment.fileUrl}
          onClose={() => setSelectedAttachment(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default BusinessProfile;