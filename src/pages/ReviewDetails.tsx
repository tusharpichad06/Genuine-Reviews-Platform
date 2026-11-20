import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  MoreVertical,
  Bookmark,
  Star,
  ThumbsUp,
  MessageCircle,
  Share2,
  BadgeCheck,
  Pencil,
  Trash2,
  Reply,
  Flag,
  X,
  ExternalLink,
  Send,
  BriefcaseBusiness,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarColor } from "@/lib/avatar";
//import BackButton from "../components/ui/BackButton";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProposalForm, {
  type ProposalFormData,
} from "../components/proposals/ProposalForm";

type Review = {
  id: string;
  subject: string;
  category: string;
  rating: number | null;
  title: string | null;
  content: string;
  created_at: string;
  user_id: string | null;
  is_verified: boolean;
};

type BusinessProfileInfo = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
};

type Attachment = {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
};

type CommentRow = {
  id: string;
  review_id: string;
  user_id: string | null;
  visitor_id: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

type CommentLikeRow = {
  id: string;
  comment_id: string;
  user_id: string | null;
  visitor_id: string | null;
};

type CommentItem = CommentRow & {
  username: string;
  avatar_url: string | null;
  likeCount: number;
  isLiked: boolean;
  replies: CommentItem[];
};

type LocationState = {
  review?: {
    id: string;
    subject: string;
    category: string;
    rating: number | null;
    title: string | null;
    content: string;
    author: string;
    time: string;
  };
};

function getVisitorId(): string {
  const STORAGE_KEY = "genuine_reviews_visitor_id";

  let visitorId = localStorage.getItem(STORAGE_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, visitorId);
  }

  return visitorId;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReviewDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const locationState = location.state as LocationState | null;
  const cachedReview = locationState?.review;

  const [review, setReview] = useState<Review | null>(
    cachedReview
      ? {
          id: cachedReview.id,
          subject: cachedReview.subject,
          category: cachedReview.category,
          rating: cachedReview.rating,
          title: cachedReview.title,
          content: cachedReview.content,
          created_at: new Date().toISOString(),
          user_id: null,
          is_verified: false,
        }
      : null
  );

  const [username, setUsername] = useState(
    cachedReview?.author ?? "Unknown user"
  );

  const [authorAvatar, setAuthorAvatar] =
    useState<string | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(!cachedReview);

  /*
   * =========================================================
   * AUTH PROMPT
   * =========================================================
   */

  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const [authPromptMessage, setAuthPromptMessage] = useState(
    "Please sign in or create an account to comment or reply."
  );

  const [reportOpen, setReportOpen] = useState(false);

  function openAuthPrompt(
    message = "Please sign in or create an account to comment or reply."
  ) {
    setAuthPromptMessage(message);
    setAuthPromptOpen(true);
  }

  function closeAuthPrompt() {
    setAuthPromptOpen(false);
  }

  function goToAuth() {
    const returnTo =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    sessionStorage.setItem("auth_return_to", returnTo);

    window.location.href =
      `/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`;
  }

  /*
   * =========================================================
   * REVIEW HELPFUL
   * =========================================================
   */

  const [helpfulCount, setHelpfulCount] = useState(0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState(true);
  const [helpfulUpdating, setHelpfulUpdating] = useState(false);

  /*
   * =========================================================
   * BUSINESS PROFILE & SEND PROPOSAL
   * =========================================================
   */

  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfileInfo | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);

  const isBusinessOwner = Boolean(businessProfile?.id);

  const canSendProposal =
    isBusinessOwner &&
    Boolean(businessProfile) &&
    Boolean(review?.user_id) &&
    user?.id !== review?.user_id;

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessProfile() {
      if (!user?.id) {
        if (!cancelled) {
          setBusinessProfile(null);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("business_profiles")
          .select("id, user_id, business_name, logo_url, category")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("BUSINESS PROFILE FETCH ERROR:", error);
          return;
        }

        if (!cancelled) {
          setBusinessProfile(data as BusinessProfileInfo | null);
        }
      } catch (err) {
        console.error("BUSINESS PROFILE LOAD ERROR:", err);
      }
    }

    loadBusinessProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleProposalSubmit(formData: ProposalFormData) {
    if (!user || !businessProfile || !review?.user_id) {
      toast.error("You must have an active business profile to send a proposal.");
      return;
    }

    setProposalLoading(true);

    try {
      /*
       * 1. Upload proposal attachments (if any) to storage
       */
      const uploadedAttachments: {
        file_name: string;
        file_path: string;
        file_type: string;
        file_size: number;
        file_url: string;
      }[] = [];

      for (const file of formData.attachments) {
        const safeFileName = file.name
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .replace(/-+/g, "-");

        const filePath = `proposals/${businessProfile.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-assets")
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("business-assets")
          .getPublicUrl(filePath);

        uploadedAttachments.push({
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrlData.publicUrl,
        });
      }

      /*
       * 2. Insert proposal matching exact Supabase schema
       */
      const { data: createdProposal, error: proposalError } = await supabase
        .from("proposals")
        .insert({
          business_id: businessProfile.id,
          sender_id: user.id,
          recipient_id: review.user_id,
          recipient_type: "user",
          review_id: review.id,
          title: formData.title,
          message: formData.message,
          requirements: formData.requirements || null,
          deliverables: formData.deliverables || null,
          budget: Number(formData.budget),
          currency: formData.currency,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (proposalError) {
        throw proposalError;
      }

      /*
       * 3. Save attachment metadata if proposal_attachments table exists
       */
      if (createdProposal?.id && uploadedAttachments.length > 0) {
        const attachmentRows = uploadedAttachments.map((att) => ({
          proposal_id: createdProposal.id,
          uploaded_by: user.id,
          file_name: att.file_name,
          file_path: att.file_path,
          file_type: att.file_type,
          file_size: att.file_size,
          file_url: att.file_url,
        }));

        const { error: attachmentDbError } = await supabase
          .from("proposal_attachments")
          .insert(attachmentRows);

        if (attachmentDbError) {
          console.warn(
            "PROPOSAL ATTACHMENTS TABLE INSERT WARNING:",
            attachmentDbError
          );
        }
      }

      /*
       * 4. Send Notification to the Proposal Recipient (Review Author)
       * (Fixed: Removed non-existent 'title' field to prevent PGRST204 error)
       */
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: review.user_id,
          message: `${businessProfile.business_name} sent you a proposal for your review "${review.subject}".`,
          type: "proposal",
          reference_id: createdProposal.id,
          is_read: false,
        });

      if (notifError) {
        console.warn("NOTIFICATION INSERT WARNING:", notifError);
      }

      toast.success(
        `Proposal sent successfully as ${businessProfile.business_name}!`
      );
      setProposalOpen(false);
    } catch (error: any) {
      console.error("SEND PROPOSAL ERROR:", error);
      const errMsg =
        error?.message || "Unable to send proposal. Please try again.";
      toast.error(errMsg);
      throw new Error(errMsg);
    } finally {
      setProposalLoading(false);
    }
  }

  /*
   * =========================================================
   * SHARE
   * =========================================================
   */

  const [shareMessage, setShareMessage] = useState("");

  /*
   * =========================================================
   * REVIEW MENU
   * =========================================================
   */

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [reportReason, setReportReason] =
    useState("");

  const [reportSubmitting, setReportSubmitting] =
    useState(false);

  const isReviewOwner =
    Boolean(user) &&
    Boolean(review?.user_id) &&
    user?.id === review?.user_id;

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [menuOpen]);

  /*
   * =========================================================
   * COMMENTS
   * =========================================================
   */

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [replyingTo, setReplyingTo] =
    useState<CommentItem | null>(null);

  const [commentActionLoading, setCommentActionLoading] =
    useState<string | null>(null);

  /*
   * =========================================================
   * SAVE REVIEW
   * =========================================================
   */

  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedState() {
      if (!user || !review?.id) {
        if (!cancelled) {
          setIsSaved(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("saved_reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("review_id", review.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setIsSaved(Boolean(data));
        }
      } catch (error) {
        console.error(
          "SAVED REVIEW LOAD ERROR:",
          error
        );
      }
    }

    loadSavedState();

    return () => {
      cancelled = true;
    };
  }, [review?.id, user]);

  /*
   * =========================================================
   * LOAD REVIEW
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadReview() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        if (!cachedReview) {
          setLoading(true);
        }

        const reviewPromise = supabase
          .from("reviews")
          .select(
            "id, subject, category, rating, title, content, created_at, user_id, is_verified"
          )
          .eq("id", id)
          .single();

        const mediaPromise = supabase
          .from("review_media")
          .select("id, file_name, file_type, file_url")
          .eq("review_id", id)
          .order("created_at", {
            ascending: true,
          });

        const [reviewResult, mediaResult] =
          await Promise.all([
            reviewPromise,
            mediaPromise,
          ]);

        if (reviewResult.error) {
          throw reviewResult.error;
        }

        if (cancelled) return;

        const reviewData = reviewResult.data as Review;

        setReview(reviewData);

        if (reviewData.user_id) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", reviewData.user_id)
            .maybeSingle();

          if (profileError) {
            console.error(
              "PROFILE ERROR:",
              profileError
            );
          }

          if (!cancelled && profileData) {
            setUsername(
              profileData.username || "Unknown user"
            );

            setAuthorAvatar(
              profileData.avatar_url || null
            );
          }
        }

        if (!cancelled && !mediaResult.error) {
          setAttachments(mediaResult.data ?? []);
        }
      } catch (error) {
        console.error(
          "REVIEW DETAILS ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReview();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !review) return;

    const reportReviewId =
      sessionStorage.getItem(
        "report_review_id"
      );

    if (!reportReviewId) return;

    if (reportReviewId !== review.id) {
      return;
    }

    sessionStorage.removeItem(
      "report_review_id"
    );

    if (review.user_id === user.id) {
      return;
    }

    setReportReason("");
    setReportOpen(true);
  }, [user, review]);

  /*
   * =========================================================
   * LOAD REVIEW HELPFUL
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadHelpful() {
      if (!id) return;

      try {
        setHelpfulLoading(true);

        const countPromise = supabase
          .from("review_helpful")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("review_id", id);

        const visitorId = getVisitorId();

        let votePromise;

        if (user) {
          votePromise = supabase
            .from("review_helpful")
            .select("id")
            .eq("review_id", id)
            .eq("user_id", user.id)
            .limit(1);
        } else {
          votePromise = supabase
            .from("review_helpful")
            .select("id")
            .eq("review_id", id)
            .eq("visitor_id", visitorId)
            .is("user_id", null)
            .limit(1);
        }

        const [
          countResult,
          voteResult,
        ] = await Promise.all([
          countPromise,
          votePromise,
        ]);

        if (countResult.error) {
          throw countResult.error;
        }

        if (voteResult.error) {
          throw voteResult.error;
        }

        if (cancelled) return;

        setHelpfulCount(countResult.count ?? 0);

        setIsHelpful(
          (voteResult.data?.length ?? 0) > 0
        );
      } catch (error) {
        console.error(
          "HELPFUL LOAD ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setHelpfulLoading(false);
        }
      }
    }

    loadHelpful();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  /*
   * =========================================================
   * HANDLE REVIEW HELPFUL
   * =========================================================
   */

  async function handleHelpful() {
    if (
      !id ||
      helpfulLoading ||
      helpfulUpdating
    ) {
      return;
    }

    setHelpfulUpdating(true);

    const previousHelpful = isHelpful;
    const previousCount = helpfulCount;
    const nextHelpful = !previousHelpful;

    setIsHelpful(nextHelpful);

    setHelpfulCount(
      nextHelpful
        ? previousCount + 1
        : Math.max(0, previousCount - 1)
    );

    try {
      const visitorId = getVisitorId();

      if (previousHelpful) {
        let deleteQuery = supabase
          .from("review_helpful")
          .delete()
          .eq("review_id", id);

        if (user) {
          deleteQuery = deleteQuery.eq(
            "user_id",
            user.id
          );
        } else {
          deleteQuery = deleteQuery
            .eq("visitor_id", visitorId)
            .is("user_id", null);
        }

        const { error } = await deleteQuery;

        if (error) {
          throw error;
        }
      } else {
        if (user) {
          const { error } =
            await supabase
              .from("review_helpful")
              .insert({
                review_id: id,
                user_id: user.id,
                visitor_id: null,
              });

          if (error) {
            throw error;
          }
        } else {
          const { error } =
            await supabase
              .from("review_helpful")
              .insert({
                review_id: id,
                user_id: null,
                visitor_id: visitorId,
              });

          if (error) {
            throw error;
          }
        }
      }

      const {
        count,
        error: countError,
      } = await supabase
        .from("review_helpful")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("review_id", id);

      if (countError) {
        throw countError;
      }

      setHelpfulCount(count ?? 0);
    } catch (error) {
      console.error(
        "HELPFUL ERROR:",
        error
      );

      setIsHelpful(previousHelpful);
      setHelpfulCount(previousCount);
    } finally {
      setHelpfulUpdating(false);
    }
  }

  /*
   * =========================================================
   * LOAD COMMENTS
   * =========================================================
   */

  async function loadComments() {
    if (!id) return;

    try {
      setCommentsLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("review_comments")
        .select(
          "id, review_id, user_id, visitor_id, content, parent_id, created_at, updated_at"
        )
        .eq("review_id", id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as CommentRow[];

      const userIds = Array.from(
        new Set(
          rows
            .map(
              (comment) =>
                comment.user_id
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        )
      );

      const usernameMap = new Map<
        string,
        {
          username: string;
          avatar_url: string | null;
        }
      >();

      if (userIds.length > 0) {
        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        if (profileError) {
          console.error(
            "COMMENT PROFILE ERROR:",
            profileError
          );
        }

        for (
          const profile of profiles ?? []
        ) {
          usernameMap.set(profile.id, {
            username:
              profile.username ?? "User",
            avatar_url:
              profile.avatar_url ?? null,
          });
        }
      }

      const commentIds = rows.map(
        (comment) => comment.id
      );

      const likeCountMap =
        new Map<string, number>();

      const likedSet =
        new Set<string>();

      if (commentIds.length > 0) {
        const {
          data: likes,
          error: likesError,
        } = await supabase
          .from("review_comment_likes")
          .select(
            "id, comment_id, user_id, visitor_id"
          )
          .in(
            "comment_id",
            commentIds
          );

        if (likesError) {
          console.error(
            "COMMENT LIKES ERROR:",
            likesError
          );
        }

        const visitorId =
          getVisitorId();

        for (
          const like of
            (likes ?? []) as CommentLikeRow[]
        ) {
          likeCountMap.set(
            like.comment_id,
            (
              likeCountMap.get(
                like.comment_id
              ) ?? 0
            ) + 1
          );

          if (
            user &&
            like.user_id === user.id
          ) {
            likedSet.add(
              like.comment_id
            );
          }

          if (
            !user &&
            like.visitor_id === visitorId &&
            like.user_id === null
          ) {
            likedSet.add(
              like.comment_id
            );
          }
        }
      }

      const mapped: CommentItem[] =
        rows.map(
          (comment) => {
            const profile =
              comment.user_id
                ? usernameMap.get(
                    comment.user_id
                  )
                : null;

            return {
              ...comment,

              username:
                profile?.username ?? "Guest",

              avatar_url:
                profile?.avatar_url ?? null,

              likeCount:
                likeCountMap.get(
                  comment.id
                ) ?? 0,

              isLiked:
                likedSet.has(
                  comment.id
                ),

              replies: [],
            };
          }
        );

      const map =
        new Map<string, CommentItem>();

      for (const comment of mapped) {
        map.set(
          comment.id,
          comment
        );
      }

      const roots: CommentItem[] = [];

      for (const comment of mapped) {
        if (comment.parent_id) {
          const parent =
            map.get(
              comment.parent_id
            );

          if (parent) {
            parent.replies.push(
              comment
            );
          } else {
            roots.push(comment);
          }
        } else {
          roots.push(comment);
        }
      }

      if (user) {
        const currentProfile =
          usernameMap.get(user.id);

        if (currentProfile) {
          const updateProfiles = (
            items: CommentItem[]
          ) => {
            for (const item of items) {
              if (
                item.user_id === user.id
              ) {
                item.username =
                  currentProfile.username;

                item.avatar_url =
                  currentProfile.avatar_url;
              }

              updateProfiles(
                item.replies
              );
            }
          };

          updateProfiles(roots);
        }
      }

      setComments(roots);
    } catch (error) {
      console.error(
        "COMMENTS LOAD ERROR:",
        error
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [id, user]);

  /*
   * =========================================================
   * COMMENT COUNT
   * =========================================================
   */

  const commentCount =
    useMemo(() => {
      function count(
        items: CommentItem[]
      ): number {
        return items.reduce(
          (
            total,
            item
          ) =>
            total +
            1 +
            count(
              item.replies
            ),
          0
        );
      }

      return count(comments);
    }, [comments]);

  /*
   * =========================================================
   * SUBMIT COMMENT / REPLY
   * =========================================================
   */

  async function handleSubmitComment() {
    if (!user) {
      openAuthPrompt();
      return;
    }

    if (
      !id ||
      !commentText.trim() ||
      commentSubmitting
    ) {
      return;
    }

    setCommentSubmitting(true);

    try {
      const content =
        commentText.trim();

      const { error } =
        await supabase
          .from("review_comments")
          .insert({
            review_id: id,
            user_id: user.id,
            visitor_id: null,
            content,
            parent_id:
              replyingTo?.id ?? null,
          });

      if (error) {
        throw error;
      }

      setCommentText("");
      setReplyingTo(null);

      await loadComments();
    } catch (error) {
      console.error(
        "COMMENT CREATE ERROR:",
        error
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  function startEditing(
    comment: CommentItem
  ) {
    if (!user) {
      openAuthPrompt();
      return;
    }

    setEditingCommentId(
      comment.id
    );

    setEditingText(
      comment.content
    );

    setReplyingTo(null);
  }

  function cancelEditing() {
    setEditingCommentId(null);
    setEditingText("");
  }

  async function handleUpdateComment(
    commentId: string
  ) {
    if (!user) {
      openAuthPrompt();
      return;
    }

    if (!editingText.trim()) {
      return;
    }

    setCommentActionLoading(
      commentId
    );

    try {
      const {
        error,
      } = await supabase
        .from("review_comments")
        .update({
          content:
            editingText.trim(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      cancelEditing();

      await loadComments();
    } catch (error) {
      console.error(
        "COMMENT UPDATE ERROR:",
        error
      );
    } finally {
      setCommentActionLoading(null);
    }
  }

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  async function handleDeleteComment(
    commentId: string
  ) {
    if (!user) {
      openAuthPrompt();
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this comment?"
      );

    if (!confirmed) {
      return;
    }

    setCommentActionLoading(
      commentId
    );

    try {
      const {
        error,
      } = await supabase
        .from("review_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (
        editingCommentId ===
        commentId
      ) {
        cancelEditing();
      }

      await loadComments();
    } catch (error) {
      console.error(
        "COMMENT DELETE ERROR:",
        error
      );
    } finally {
      setCommentActionLoading(null);
    }
  }

  /*
   * =========================================================
   * COMMENT LIKE / UNLIKE
   * =========================================================
   */

  async function handleCommentLike(
    comment: CommentItem
  ) {
    const actionKey = `like-${comment.id}`;

    if (
      commentActionLoading === actionKey
    ) {
      return;
    }

    setCommentActionLoading(actionKey);

    const previousLiked =
      comment.isLiked;

    const previousCount =
      comment.likeCount;

    const nextLiked =
      !previousLiked;

    function updateCommentTree(
      items: CommentItem[],
      commentId: string,
      updater: (
        item: CommentItem
      ) => CommentItem
    ): CommentItem[] {
      return items.map((item) => {
        if (item.id === commentId) {
          return updater(item);
        }

        if (
          item.replies &&
          item.replies.length > 0
        ) {
          return {
            ...item,
            replies: updateCommentTree(
              item.replies,
              commentId,
              updater
            ),
          };
        }

        return item;
      });
    }

    setComments(
      (currentComments) =>
        updateCommentTree(
          currentComments,
          comment.id,
          (item) => ({
            ...item,
            isLiked: nextLiked,
            likeCount: nextLiked
              ? item.likeCount + 1
              : Math.max(
                  0,
                  item.likeCount - 1
                ),
          })
        )
    );

    try {
      const visitorId =
        getVisitorId();

      let existingQuery =
        supabase
          .from(
            "review_comment_likes"
          )
          .select("id")
          .eq(
            "comment_id",
            comment.id
          )
          .limit(1);

      if (user) {
        existingQuery =
          existingQuery
            .eq(
              "user_id",
              user.id
            );
      } else {
        existingQuery =
          existingQuery
            .eq(
              "visitor_id",
              visitorId
            )
            .is(
              "user_id",
              null
            );
      }

      const {
        data: existingLike,
        error: existingLikeError,
      } = await existingQuery;

      if (existingLikeError) {
        throw existingLikeError;
      }

      const actuallyLiked =
        (existingLike?.length ?? 0) > 0;

      if (actuallyLiked) {
        let deleteQuery =
          supabase
            .from(
              "review_comment_likes"
            )
            .delete()
            .eq(
              "comment_id",
              comment.id
            );

        if (user) {
          deleteQuery =
            deleteQuery.eq(
              "user_id",
              user.id
            );
        } else {
          deleteQuery =
            deleteQuery
              .eq(
                "visitor_id",
                visitorId
              )
              .is(
                "user_id",
                null
              );
        }

        const {
          error: deleteError,
        } = await deleteQuery;

        if (deleteError) {
          throw deleteError;
        }
      } else {
        if (user) {
          const {
            error: insertError,
          } = await supabase
            .from(
              "review_comment_likes"
            )
            .insert({
              comment_id:
                comment.id,
              user_id:
                user.id,
              visitor_id:
                null,
            });

          if (insertError) {
            throw insertError;
          }
        } else {
          const {
            error: insertError,
          } = await supabase
            .from(
              "review_comment_likes"
            )
            .insert({
              comment_id:
                comment.id,
              user_id:
                null,
              visitor_id:
                visitorId,
            });

          if (insertError) {
            throw insertError;
          }
        }
      }

      const {
        count: finalCount,
        error: countError,
      } = await supabase
        .from(
          "review_comment_likes"
        )
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "comment_id",
          comment.id
        );

      if (countError) {
        throw countError;
      }

      let finalLikeQuery =
        supabase
          .from(
            "review_comment_likes"
          )
          .select("id")
          .eq(
            "comment_id",
            comment.id
          )
          .limit(1);

      if (user) {
        finalLikeQuery =
          finalLikeQuery
            .eq(
              "user_id",
              user.id
            );
      } else {
        finalLikeQuery =
          finalLikeQuery
            .eq(
              "visitor_id",
              visitorId
            )
            .is(
              "user_id",
              null
            );
      }

      const {
        data: finalLike,
        error: finalLikeError,
      } = await finalLikeQuery;

      if (finalLikeError) {
        throw finalLikeError;
      }

      const finalIsLiked =
        (finalLike?.length ?? 0) > 0;

      setComments(
        (currentComments) =>
          updateCommentTree(
            currentComments,
            comment.id,
            (item) => ({
              ...item,
              likeCount:
                finalCount ?? 0,
              isLiked:
                finalIsLiked,
            })
          )
      );
    } catch (error) {
      console.error(
        "COMMENT LIKE ERROR:",
        error
      );

      setComments(
        (currentComments) =>
          updateCommentTree(
            currentComments,
            comment.id,
            (item) => ({
              ...item,
              isLiked:
                previousLiked,
              likeCount:
                previousCount,
            })
          )
      );
    } finally {
      setCommentActionLoading(
        null
      );
    }
  }

  /*
   * =========================================================
   * REVIEW MENU ACTIONS
   * =========================================================
   */

  function handleEditReview() {
    if (!review || !user) return;

    if (review.user_id !== user.id) {
      return;
    }

    setMenuOpen(false);

    navigate(`/write-review?edit=${review.id}`);
  }

  const handleReportReview = () => {
    if (!review) return;

    setMenuOpen(false);

    if (user && review.user_id === user.id) {
      return;
    }

    if (!user) {
      sessionStorage.setItem(
        "report_review_id",
        review.id
      );

      openAuthPrompt(
        "Please sign in or create an account to Report Review."
      );

      return;
    }

    setReportReason("");
    setReportOpen(true);
  };

  async function handleSubmitReport() {
    if (!user) {
      openAuthPrompt();
      return;
    }

    if (!review) {
      return;
    }

    if (review.user_id === user.id) {
      toast.error("You cannot report your own review.");
      return;
    }

    if (!reportReason) {
      toast.error("Please select a reason.");
      return;
    }

    if (reportSubmitting) {
      return;
    }

    setReportSubmitting(true);

    try {
      const { error } = await supabase
        .from("review_reports")
        .insert({
          review_id: review.id,
          user_id: user.id,
          reason: reportReason,
        });

      if (error) {
        console.error(
          "SUPABASE REPORT ERROR:",
          error
        );

        if (
          error.code === "23505" &&
          error.message.includes(
            "review_reports_unique_user_review"
          )
        ) {
          setReportOpen(false);
          setReportSubmitting(true);

          const { data: existingReport, error: existingReportError } =
            await supabase
              .from("review_reports")
              .select("id")
              .eq("review_id", review.id)
              .eq("user_id", user.id)
              .maybeSingle();

          if (existingReportError) {
            console.error(
              "CHECK EXISTING REPORT ERROR:",
              existingReportError
            );

            toast.error(
              "Could not check your previous report."
            );

            return;
          }

          if (existingReport) {
            setReportOpen(false);
            setReportReason("");

            toast.info(
              "You have already reported this review."
            );

            return;
          }

          setReportReason("");

          toast.info(
            "You have already reported this review."
          );

          return;
        }

        toast.error(
          `Report failed: ${error.message}`
        );

        return;
      }

      setReportOpen(false);
      setReportReason("");

      toast.success(
        "Review reported successfully."
      );
    } catch (error) {
      console.error(
        "REPORT UNEXPECTED ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while reporting the review."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  async function handleSaveReview() {
    if (!user) {
      openAuthPrompt(
        "Please sign in or create an account to save reviews."
      );
      return;
    }

    if (!review?.id || saveLoading) {
      return;
    }

    setSaveLoading(true);

    const previousSaved = isSaved;

    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        const { error } = await supabase
          .from("saved_reviews")
          .delete()
          .eq("user_id", user.id)
          .eq("review_id", review.id);

        if (error) {
          throw error;
        }

        toast.success(
          "Review removed from saved reviews."
        );
      } else {
        const { error } = await supabase
          .from("saved_reviews")
          .insert({
            user_id: user.id,
            review_id: review.id,
          });

        if (error) {
          throw error;
        }

        toast.success("Review saved.");
      }
    } catch (error) {
      console.error(
        "SAVE REVIEW ERROR:",
        error
      );

      setIsSaved(previousSaved);

      toast.error(
        "Unable to update saved review."
      );
    } finally {
      setSaveLoading(false);
      setMenuOpen(false);
    }
  }

  async function handleDeleteReview() {
    if (!review || !user) return;

    if (review.user_id !== user.id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this review? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setMenuOpen(false);

    try {
      const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id)
        .eq("user_id", user.id)
        .select("id");

      if (error) {
        console.error(
          "REVIEW DELETE SUPABASE ERROR:",
          error
        );

        throw error;
      }

      if (!data || data.length === 0) {
        console.error(
          "REVIEW DELETE AFFECTED ZERO ROWS",
          {
            reviewId: review.id,
            userId: user.id,
          }
        );

        throw new Error(
          "Review was not deleted. Please check your Supabase DELETE policy."
        );
      }

      navigate("/");
    } catch (error) {
      console.error(
        "REVIEW DELETE ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the review."
      );
    }
  }

  async function handleShare() {
    if (!id) return;

    const shareUrl =
      `${window.location.origin}/review/${id}`;

    const shareData = {
      title:
        review?.title ??
        review?.subject ??
        "Review",

      text:
        review?.content ??
        "Check out this review.",

      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareMessage(
          "Link copied!"
        );

        setTimeout(() => {
          setShareMessage("");
        }, 2000);
      }
    } catch (error) {
      console.log(
        "SHARE:",
        error
      );
    }
  }

  /*
   * =========================================================
   * START REPLY
   * =========================================================
   */

  function startReply(
    comment: CommentItem
  ) {
    if (!user) {
      openAuthPrompt();
      return;
    }

    setReplyingTo(comment);

    setCommentText("");

    setEditingCommentId(null);
    setEditingText("");

    setTimeout(() => {
      document
        .getElementById(
          "comment-input"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  }

  /*
   * =========================================================
   * RENDER COMMENT
   * =========================================================
   */

  function renderComment(
    comment: CommentItem
  ): React.ReactNode {
    const isOwner =
      Boolean(user) &&
      comment.user_id ===
        user?.id;

    const isEditing =
      editingCommentId ===
      comment.id;

    const isLikeLoading =
      commentActionLoading ===
      `like-${comment.id}`;

    return (
      <div
        key={comment.id}
        className="w-full"
      >
        <div className="rounded-xl border border-[#D6E2F2] bg-white p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {comment.avatar_url ? (
                  <img
                    src={comment.avatar_url}
                    alt={comment.username}
                    className="size-8 sm:size-9 shrink-0 rounded-full border border-[#D6E2F2] object-cover"
                  />
                ) : (
                  <div
                    className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border border-[#D6E2F2] text-xs sm:text-sm font-semibold ${getAvatarColor(
                      comment.username
                    )}`}
                  >
                    {(comment.username || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-[#10182D]">
                      {comment.username}
                    </span>

                    <span className="text-[11px] sm:text-xs text-[#5E7191]">
                      {formatCommentDate(
                        comment.created_at
                      )}
                    </span>

                    {comment.updated_at !==
                      comment.created_at && (
                      <span className="text-[11px] sm:text-xs text-[#7B8DA8]">
                        edited
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editingText}
                onChange={(event) =>
                  setEditingText(
                    event.target.value
                  )
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-[#D6E2F2] bg-white px-3 py-2 text-xs sm:text-sm text-[#10182D] outline-none focus:border-[#2875F5] focus:ring-2 focus:ring-[#2875F5]/20"
              />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    !editingText.trim() ||
                    commentActionLoading ===
                      comment.id
                  }
                  onClick={() =>
                    handleUpdateComment(
                      comment.id
                    )
                  }
                  className="bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
                >
                  Save
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={
                    cancelEditing
                  }
                  className="text-xs sm:text-sm text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2.5 sm:mt-3 whitespace-pre-wrap text-xs sm:text-sm leading-5 sm:leading-6 text-[#17233D]">
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={
                  isLikeLoading
                }
                onClick={() =>
                  handleCommentLike(
                    comment
                  )
                }
                className={`h-8 px-2.5 text-xs sm:text-sm ${
                  comment.isLiked
                    ? "text-[#2875F5] hover:bg-[#F3F7FF]"
                    : "text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                }`}
              >
                <ThumbsUp
                  className={`mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    comment.isLiked
                      ? "fill-current"
                      : ""
                  }`}
                />

                {comment.likeCount}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs sm:text-sm text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                onClick={() =>
                  startReply(
                    comment
                  )
                }
              >
                <Reply className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />

                Reply
              </Button>

              {isOwner && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs sm:text-sm text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                    onClick={() =>
                      startEditing(
                        comment
                      )
                    }
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />

                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={
                      commentActionLoading ===
                      comment.id
                    }
                    onClick={() =>
                      handleDeleteComment(
                        comment.id
                      )
                    }
                    className="h-8 px-2.5 text-xs sm:text-sm text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />

                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-3.5 sm:pl-6 border-l-2 border-[#D6E2F2]">
            {comment.replies.map(
              (reply) => (
                <div
                  key={reply.id}
                  className="w-full"
                >
                  <div className="mb-1 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        startReply(
                          comment
                        )
                      }
                      className="text-[11px] sm:text-xs text-[#5E7191] hover:text-[#2875F5]"
                    >
                      Replying to{" "}
                      <span className="font-semibold text-[#10182D]">
                        {
                          comment.username
                        }
                      </span>
                    </button>
                  </div>

                  {renderComment(
                    reply
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-24 rounded bg-[#E3EBF7]" />
            <div className="h-10 w-2/3 rounded bg-[#E3EBF7]" />
            <div className="h-6 w-1/2 rounded bg-[#E3EBF7]" />
            <div className="h-32 w-full rounded bg-[#E3EBF7]" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * NOT FOUND
   * =========================================================
   */

  if (!review) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="text-sm text-[#5E7191]">
            Review not found
          </p>
        </div>
      </div>
    );
  }

  const reviewDate =
    formatDate(
      review.created_at
    );

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <>
      <div className="min-h-screen bg-[#eef8ff]">
        <Navbar />
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">

        {/*  <div className="mb-4 sm:mb-6">
            <BackButton />
          </div>

        */}  

          <div className="space-y-6 sm:space-y-8">

            {/* HEADER */}

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#2875F5]">
                {review.category}
              </p>

              <div className="mt-2 flex items-start justify-between gap-3 sm:gap-4">
                <h1 className="min-w-0 text-2xl font-bold tracking-tight text-[#10182D] sm:text-4xl">
                  {review.subject}
                </h1>

                <div className="flex shrink-0 items-center gap-2">
                  {review.is_verified && (
                    <div className="flex items-center gap-1.5 rounded-full border border-[#B8E8CC] bg-[#E9F8EF] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#159447]">
                      <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Verified
                    </div>
                  )}

                  <div
                    ref={menuRef}
                    className="relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Review options"
                      onClick={() =>
                        setMenuOpen(
                          (open) => !open
                        )
                      }
                      className="text-[#5E7191] hover:bg-[#E8F0FF] hover:text-[#2875F5]"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>

                    {menuOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-[#D6E2F2] bg-white p-1.5 shadow-lg">

                        {!isReviewOwner && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                              disabled={saveLoading}
                              onClick={handleSaveReview}
                            >
                              <Bookmark
                                className={`mr-2 h-4 w-4 ${
                                  isSaved ? "fill-current" : ""
                                }`}
                              />

                              {isSaved
                                ? "Unsave Review"
                                : "Save Review"}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                              onClick={handleReportReview}
                            >
                              <Flag className="mr-2 h-4 w-4" />
                              Report Review
                            </Button>
                          </>
                        )}

                        {isReviewOwner && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                              onClick={handleEditReview}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Review
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm text-[#DC2626] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
                              onClick={handleDeleteReview}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Review
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {review.title && (
                <h2 className="mt-2.5 sm:mt-3 text-lg sm:text-xl font-semibold text-[#10182D]">
                  {review.title}
                </h2>
              )}

              {review.rating !== null && (
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          className={`size-4 sm:size-5 ${
                            star <= review.rating!
                              ? "fill-[#F59E0B] text-[#F59E0B]"
                              : "text-[#A9B6C8]"
                          }`}
                        />
                      )
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-[#10182D]">
                    {review.rating.toFixed(
                      1
                    )}
                    /5
                  </span>
                </div>
              )}

              <div className="mt-3.5 sm:mt-4 flex items-center gap-3">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={username}
                    className="size-8 sm:size-9 shrink-0 rounded-full border border-[#D6E2F2] object-cover"
                  />
                ) : (
                  <div
                    className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border border-[#D6E2F2] text-xs sm:text-sm font-semibold ${getAvatarColor(username)}`}
                  >
                    {(username || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#5E7191]">
                  <span className="font-semibold text-[#10182D]">
                    {username}
                  </span>

                  <span>·</span>

                  <span>
                    {reviewDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#D6E2F2]" />

            {/* CONTENT */}

            <div>
              <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6 sm:leading-7 text-[#17233D]">
                {review.content}
              </p>
            </div>

            {/* ATTACHMENTS */}

            {attachments.length > 0 && (
              <div className="space-y-3 sm:space-y-4 pt-2">
                <h2 className="text-base sm:text-lg font-semibold text-[#10182D]">
                  Attachments
                </h2>

                <div className="space-y-4 sm:space-y-5">
                  {attachments.map((file) => {
                    const lowerName = file.file_name?.toLowerCase() || "";
                    const isImage =
                      file.file_type === "images" ||
                      file.file_type?.startsWith("image/") ||
                      /\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(lowerName);

                    const isVideo =
                      file.file_type === "videos" ||
                      file.file_type?.startsWith("video/") ||
                      /\.(mp4|webm|mov|mkv|ogg)$/i.test(lowerName);

                    const isPdf =
                      file.file_type === "pdf" ||
                      file.file_type === "application/pdf" ||
                      lowerName.endsWith(".pdf");

                    return (
                      <div
                        key={file.id}
                        className="overflow-hidden rounded-xl border border-[#D6E2F2] bg-white"
                      >
                        {isImage && (
                          <>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block cursor-zoom-in"
                              title="Open image"
                            >
                              <img
                                src={file.file_url}
                                alt={file.file_name}
                                loading="lazy"
                                className="max-h-[500px] sm:max-h-[600px] w-full object-contain bg-[#F8FBFF] transition hover:opacity-95"
                              />
                            </a>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#D6E2F2] px-4 py-3">
                              <p className="min-w-0 truncate text-xs sm:text-sm font-medium text-[#10182D]">
                                {file.file_name}
                              </p>

                              <div className="flex shrink-0 items-center gap-2">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[#D6E2F2] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#2875F5] transition hover:border-[#2875F5] hover:bg-[#F3F7FF]"
                                >
                                  <ExternalLink className="size-4" />
                                  Open
                                </a>
                              </div>
                            </div>
                          </>
                        )}

                        {isVideo && (
                          <>
                            <video
                              controls
                              controlsList="nodownload"
                              preload="metadata"
                              className="max-h-[500px] sm:max-h-[600px] w-full bg-black"
                            >
                              <source src={file.file_url} />
                              Your browser does not support video playback.
                            </video>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#D6E2F2] px-4 py-3">
                              <p className="min-w-0 truncate text-xs sm:text-sm font-medium text-[#10182D]">
                                {file.file_name}
                              </p>

                              <div className="flex shrink-0 items-center gap-2">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[#D6E2F2] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#2875F5] transition hover:border-[#2875F5] hover:bg-[#F3F7FF]"
                                >
                                  <ExternalLink className="size-4" />
                                  Open
                                </a>
                              </div>
                            </div>
                          </>
                        )}

                        {isPdf && (
                          <div className="p-3.5 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[#D6E2F2] bg-[#F8FBFF] p-3.5 sm:p-4">
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-[#10182D] truncate">
                                  {file.file_name}
                                </p>

                                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[#617493]">
                                  PDF document
                                </p>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[#D6E2F2] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#2875F5] transition hover:border-[#2875F5] hover:bg-[#F3F7FF]"
                                >
                                  <ExternalLink className="size-4" />
                                  Open
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isImage && !isVideo && !isPdf && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FF] text-[#2875F5]">
                                <ExternalLink className="size-4 sm:size-5" />
                              </div>

                              <p className="truncate text-xs sm:text-sm font-medium text-[#10182D]">
                                {file.file_name}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-[#D6E2F2] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#2875F5] transition hover:border-[#2875F5] hover:bg-[#F3F7FF]"
                              >
                                <ExternalLink className="size-4" />
                                Open
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =====================================================
                ACTION BAR (MOBILE & DESKTOP OPTIMIZED)
                ===================================================== */}

            <div className="border-t border-[#D6E2F2] pt-3.5 sm:pt-5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                {/* Top row on mobile: Helpful, Comment, Share */}
                <div className="flex items-center justify-between gap-1 sm:contents">
                  {/* HELPFUL */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={
                      helpfulLoading ||
                      helpfulUpdating
                    }
                    onClick={
                      handleHelpful
                    }
                    className={`h-9 px-2.5 sm:px-3 text-xs sm:text-sm ${
                      isHelpful
                        ? "text-[#2875F5] hover:bg-[#F3F7FF]"
                        : "text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                    }`}
                  >
                    <ThumbsUp
                      className={`mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        isHelpful
                          ? "fill-current text-[#2875F5]"
                          : "text-[#5E7191]"
                      }`}
                    />
                    Helpful {helpfulCount}
                  </Button>

                  {/* RIGHT SIDE GROUP (Desktop: Send Proposal + Comment + Share) */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* SEND PROPOSAL — DESKTOP INLINE (Before Comment) */}
                    {canSendProposal && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex h-9 items-center rounded-lg border border-[#BBD2FF] bg-[#F3F8FF] px-3.5 text-xs sm:text-sm font-semibold text-[#2875F5] shadow-2xs transition hover:border-[#2875F5] hover:bg-[#E8F2FF] hover:text-[#155DCC]"
                        onClick={() => setProposalOpen(true)}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Send Proposal
                      </Button>
                    )}

                    {/* COMMENT */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                      onClick={() => {
                        document
                          .getElementById(
                            "review-comments"
                          )
                          ?.scrollIntoView({
                            behavior:
                              "smooth",
                          });
                      }}
                    >
                      <MessageCircle className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Comment {commentCount}
                    </Button>

                    {/* SHARE */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                      onClick={
                        handleShare
                      }
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* SEND PROPOSAL — MOBILE FULL-WIDTH BUTTON (Clean, thumb-friendly target) */}
                {canSendProposal && (
                  <Button
                    type="button"
                    onClick={() => setProposalOpen(true)}
                    className="flex sm:hidden h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#BBD2FF] bg-[#F3F8FF] text-xs font-semibold text-[#2875F5] shadow-2xs transition active:scale-[0.99] hover:bg-[#E8F2FF] hover:text-[#155DCC]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Proposal as {businessProfile?.business_name}
                  </Button>
                )}
              </div>

              {shareMessage && (
                <p className="mt-2 text-right text-xs text-[#5E7191]">
                  {shareMessage}
                </p>
              )}
            </div>

            {/* COMMENTS */}

            <section
              id="review-comments"
              className="border-t border-[#D6E2F2] pt-6 sm:pt-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#10182D]">
                    Comments
                  </h2>

                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#5E7191]">
                    Discuss this review and reply to other users.
                  </p>
                </div>

                <span className="rounded-full bg-[#E8F0FF] px-3 py-1 text-xs sm:text-sm font-semibold text-[#2875F5]">
                  {commentCount}
                </span>
              </div>

              {/* COMMENT INPUT */}

              <div
                id="comment-input"
                className="mt-4 sm:mt-5"
              >
                {replyingTo && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-[#D6E2F2] bg-[#F8FAFF] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm text-[#5E7191]">
                      <Reply className="h-4 w-4 shrink-0 text-[#2875F5]" />

                      <span className="truncate">
                        Replying to{" "}
                        <span className="font-semibold text-[#10182D]">
                          {
                            replyingTo.username
                          }
                        </span>
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setReplyingTo(
                          null
                        )
                      }
                      className="text-[#5E7191] hover:bg-[#E8F0FF] hover:text-[#2875F5]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="rounded-xl border border-[#D6E2F2] bg-white p-3">
                  <textarea
                    value={
                      commentText
                    }
                    onChange={(event) =>
                      setCommentText(
                        event.target.value
                      )
                    }
                    onFocus={() => {
                      if (!user) {
                        openAuthPrompt();
                      }
                    }}
                    placeholder={
                      replyingTo
                        ? `Reply to ${replyingTo.username}...`
                        : "Write a comment..."
                    }
                    rows={4}
                    className="w-full resize-none bg-transparent text-xs sm:text-sm text-[#10182D] outline-none placeholder:text-[#A9B3C0]"
                  />

                  <div className="mt-2 flex justify-end">
                    <Button
                      type="button"
                      disabled={
                        !commentText.trim() ||
                        commentSubmitting
                      }
                      onClick={
                        handleSubmitComment
                      }
                      className="w-full sm:w-auto rounded-lg bg-[#2875F5] px-6 text-xs sm:text-sm font-bold text-white shadow-[0_5px_14px_rgba(40,117,245,0.22)] hover:bg-[#155DCC]"
                    >
                      {commentSubmitting
                        ? "Posting..."
                        : replyingTo
                        ? "Reply"
                        : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* COMMENTS LIST */}

              <div className="mt-5 sm:mt-6">
                {commentsLoading ? (
                  <div className="space-y-3">
                    <div className="h-28 animate-pulse rounded-xl bg-[#E8F0FF]" />

                    <div className="h-28 animate-pulse rounded-xl bg-[#E8F0FF]" />
                  </div>
                ) : comments.length ===
                  0 ? (
                  <div className="rounded-xl border border-dashed border-[#D6E2F2] bg-white p-6 sm:p-8 text-center">
                    <MessageCircle className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#7B8DA8]" />

                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-medium text-[#10182D]">
                      No comments yet
                    </p>

                    <p className="mt-1 text-xs text-[#5E7191]">
                      Be the first person to comment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(
                      (comment) =>
                        renderComment(
                          comment
                        )
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </div>

      {/* =====================================================
          SEND PROPOSAL MODAL (MOBILE BOTTOM-SHEET & DESKTOP MODAL)
          ===================================================== */}

      {proposalOpen && businessProfile && review.user_id && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#10182D]/50 p-0 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-proposal-modal-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!proposalLoading) {
                setProposalOpen(false);
              }
            }}
          />

          <div className="relative z-10 flex max-h-[92dvh] sm:max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#D6E2F2] bg-white shadow-2xl">
            {/* Mobile Drag Handle Indicator */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <div className="h-1.5 w-10 rounded-full bg-[#D6E2F2]" />
            </div>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#D6E2F2] px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F2FF] text-[#2875F5]">
                  <BriefcaseBusiness className="size-4 sm:size-5" />
                </div>

                <div className="min-w-0">
                  <h2
                    id="send-proposal-modal-title"
                    className="text-sm sm:text-lg font-bold text-[#10182D]"
                  >
                    Send Collaboration Proposal
                  </h2>
                  <p className="truncate text-[11px] sm:text-xs text-[#617493]">
                    Regarding review:{" "}
                    <span className="font-semibold text-[#10182D]">
                      {review.subject}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={proposalLoading}
                onClick={() => setProposalOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#617493] transition hover:bg-[#F3F7FF] hover:text-[#10182D] disabled:opacity-50"
                aria-label="Close proposal modal"
              >
                <X className="size-4 sm:size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6">
              <ProposalForm
                businessId={businessProfile.id}
                businessName={businessProfile.business_name}
                businessLogoUrl={businessProfile.logo_url}
                recipientId={review.user_id}
                recipientName={username}
                reviewId={review.id}
                onSubmit={handleProposalSubmit}
                onCancel={() => setProposalOpen(false)}
                loading={proposalLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          AUTH PROMPT
          ===================================================== */}

      {authPromptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10182D]/40 p-4">
          <div
            className="absolute inset-0"
            onClick={closeAuthPrompt}
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#10182D]">
                  Sign in to continue
                </h3>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#5E7191]">
                  {authPromptMessage}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={
                  closeAuthPrompt
                }
                className="text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                className="w-full sm:flex-1 bg-[#2875F5] text-white hover:bg-[#155DCC]"
                onClick={
                  goToAuth
                }
              >
                Sign in
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1 border-[#D6E2F2] bg-white text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
                onClick={() => {
                  const returnTo =
                    window.location.pathname +
                    window.location.search +
                    window.location.hash;

                  sessionStorage.setItem(
                    "auth_return_to",
                    returnTo
                  );

                  window.location.href =
                    `/auth?mode=signup&returnTo=${encodeURIComponent(
                      returnTo
                    )}`;
                }}
              >
                Create account
              </Button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#10182D]/40"
            onClick={() => {
              if (!reportSubmitting) {
                setReportOpen(false);
              }
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#D6E2F2] bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#10182D]">
                  Report Review
                </h3>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#5E7191]">
                  Why are you reporting this review?
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={reportSubmitting}
                onClick={() =>
                  setReportOpen(false)
                }
                className="text-[#5E7191] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 sm:mt-5 space-y-2">
              {[
                "Spam",
                "Inappropriate Content",
                "Fake / Misleading Review",
                "Offensive Content",
                "Irrelevant",
                "Other",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  disabled={reportSubmitting}
                  onClick={() =>
                    setReportReason(reason)
                  }
                  className={`w-full rounded-lg border px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium transition-all ${
                    reportReason === reason
                      ? "border-[#2875F5] bg-[#E8F0FF] text-[#2875F5] shadow-sm ring-1 ring-[#2875F5]/30"
                      : "border-[#D6E2F2] bg-white text-[#10182D] hover:border-[#2875F5]/40 hover:bg-[#F3F7FF] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{reason}</span>

                    {reportReason === reason && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2875F5] text-xs font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={reportSubmitting}
                onClick={() => {
                  setReportOpen(false);
                  setReportReason("");
                }}
                className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#10182D] hover:bg-[#F3F7FF] hover:text-[#2875F5]"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  !reportReason ||
                  reportSubmitting
                }
                onClick={handleSubmitReport}
                className="w-full sm:w-auto bg-[#2875F5] text-xs sm:text-sm text-white hover:bg-[#155DCC]"
              >
                {reportSubmitting
                  ? "Submitting..."
                  : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReviewDetails;