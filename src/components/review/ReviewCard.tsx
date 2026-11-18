import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MoreVertical,
  ThumbsUp,
  BadgeCheck,
  ExternalLink,
  Share2,
  Pencil,
  Trash2,
  Bookmark,
} from "lucide-react";

import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { getAvatarColor } from "../../lib/avatar";

type ReviewCardProps = {
  id: string;
  userId?: string | null;
  avatarUrl?: string | null;
  onUnsave?: (reviewId: string) => void;
  subjectName: string;
  category: string;
  rating?: number;
  title?: string;
  content: string;
  author: string;
  time: string;
  helpfulCount: number;
  isVerified?: boolean;
  trustScore?: number;
};

function getVisitorId(): string {
  const STORAGE_KEY =
    "genuine_reviews_visitor_id";

  let visitorId =
    localStorage.getItem(STORAGE_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    localStorage.setItem(
      STORAGE_KEY,
      visitorId
    );
  }

  return visitorId;
}

function ReviewCard({
  id,
  userId,
  onUnsave,
  subjectName,
  category,
  rating,
  title,
  content,
  author,
  time,
  helpfulCount,
  isVerified = false,
}: ReviewCardProps) {
    const navigate = useNavigate();

  const { user } = useAuth();

  const isOwner =
    !!user && !!userId && user.id === userId;

  const [count, setCount] =
    useState(helpfulCount ?? 0);

  const [isHelpful, setIsHelpful] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [loadingHelpful, setLoadingHelpful] =
    useState(true);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const [isSaved, setIsSaved] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

    const [authorAvatar, setAuthorAvatar] =
  useState<string | null>(null);

  
  useEffect(() => {
  let cancelled = false;

  async function loadAuthorProfile() {
    if (!userId) {
      setAuthorAvatar(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "REVIEW CARD AVATAR ERROR:",
        error
      );
      return;
    }

    if (!cancelled) {
      setAuthorAvatar(
        data?.avatar_url || null
      );
    }
  }

  loadAuthorProfile();

  return () => {
    cancelled = true;
  };
}, [userId]);

  useEffect(() => {
    setCount(helpfulCount ?? 0);
  }, [helpfulCount]);

  useEffect(() => {
    let cancelled = false;

    async function loadHelpfulState() {
      try {
        setLoadingHelpful(true);

        let voteQuery;

        if (user) {
          voteQuery = supabase
            .from("review_helpful")
            .select("id")
            .eq("review_id", id)
            .eq("user_id", user.id)
            .limit(1);
        } else {
          const visitorId =
            getVisitorId();

          voteQuery = supabase
            .from("review_helpful")
            .select("id")
            .eq("review_id", id)
            .eq(
              "visitor_id",
              visitorId
            )
            .is("user_id", null)
            .limit(1);
        }

        const { data, error } =
          await voteQuery;

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setIsHelpful(
            (data?.length ?? 0) > 0
          );
        }
      } catch (error) {
        console.error(
          "LOAD HELPFUL STATE ERROR:",
          error
        );

        if (!cancelled) {
          setIsHelpful(false);
        }
      } finally {
        if (!cancelled) {
          setLoadingHelpful(false);
        }
      }
    }

    loadHelpfulState();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  useEffect(() => {
  let cancelled = false;

  async function loadSavedState() {
    if (!user || !id) {
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
        .eq("review_id", id)
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
}, [id, user]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        ) &&
        buttonRef.current &&
        !buttonRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
      window.addEventListener("scroll", () => setMenuOpen(false), true);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      window.removeEventListener("scroll", () => setMenuOpen(false), true);
    };
  }, [menuOpen]);

  function getReviewUrl() {
    return `${window.location.origin}/review/${id}`;
  }

  async function handleSaveReview() {
    if (!user) {
      toast.error("Please sign in to save reviews.");
      return;
    }

    if (!id || saveLoading) {
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
          .eq("review_id", id);

        if (error) {
          throw error;
        }

        onUnsave?.(id);

        toast.success(
          "Review removed from saved reviews."
        );
      } else {
        const { error } = await supabase
          .from("saved_reviews")
          .insert({
            user_id: user.id,
            review_id: id,
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

  async function handleShare(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    const url = getReviewUrl();

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            title ||
            subjectName,
          text:
            `Check out this review of ${subjectName}`,
          url,
        });

        setMenuOpen(false);
        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      toast.success(
        "Review link copied"
      );

      setMenuOpen(false);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "SHARE ERROR:",
        error
      );

      toast.error(
        "Could not share the review"
      );
    }
  }

  function handleOpenReview(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);

    navigate(`/review/${id}`);
  }

  function handleEditReview(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!isOwner) {
      return;
    }

    setMenuOpen(false);

    navigate(`/write-review?edit=${id}`);
  }

  async function handleDeleteReview(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!user || !isOwner) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } =
        await supabase
          .from("reviews")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      toast.success(
        "Review deleted successfully"
      );

      setMenuOpen(false);

      window.location.reload();
    } catch (error) {
      console.error(
        "DELETE REVIEW ERROR:",
        error
      );

      toast.error(
        "Could not delete the review"
      );
    }
  }  

  async function handleHelpful(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (
      updating ||
      loadingHelpful
    ) {
      return;
    }

    setUpdating(true);

    const previousHelpful =
      isHelpful;

    const previousCount =
      count;

    const nextHelpful =
      !previousHelpful;

    setIsHelpful(nextHelpful);

    setCount(
      nextHelpful
        ? previousCount + 1
        : Math.max(
            0,
            previousCount - 1
          )
    );

    try {
      if (user) {
        if (previousHelpful) {
          const { error } =
            await supabase
              .from(
                "review_helpful"
              )
              .delete()
              .eq(
                "review_id",
                id
              )
              .eq(
                "user_id",
                user.id
              );

          if (error) {
            throw error;
          }
        } else {
          const { error } =
            await supabase
              .from(
                "review_helpful"
              )
              .insert({
                review_id: id,
                user_id: user.id,
                visitor_id: null,
              });

          if (error) {
            throw error;
          }
        }
      } else {
        const visitorId =
          getVisitorId();

        if (previousHelpful) {
          const { error } =
            await supabase
              .from(
                "review_helpful"
              )
              .delete()
              .eq(
                "review_id",
                id
              )
              .eq(
                "visitor_id",
                visitorId
              )
              .is(
                "user_id",
                null
              );

          if (error) {
            throw error;
          }
        } else {
          const { error } =
            await supabase
              .from(
                "review_helpful"
              )
              .insert({
                review_id: id,
                user_id: null,
                visitor_id:
                  visitorId,
              });

          if (error) {
            throw error;
          }
        }
      }

      const {
        count: finalCount,
        error: finalCountError,
      } = await supabase
        .from("review_helpful")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "review_id",
          id
        );

      if (finalCountError) {
        throw finalCountError;
      }

      setCount(
        finalCount ?? 0
      );
    } catch (error) {
      console.error(
        "HELPFUL ERROR:",
        error
      );

      setIsHelpful(
        previousHelpful
      );

      setCount(
        previousCount
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <Link
        to={`/review/${id}`}
        state={{
          review: {
            id,
            subject: subjectName,
            category,
            rating:
              rating ?? null,
            title:
              title ?? null,
            content,
            author,
            time,
          },
        }}
        className="
          flex
          h-full
          flex-col
          rounded-xl
          border
          border-[#D6E2F2]
          bg-white
          p-4 sm:p-5
          shadow-sm
          transition
          hover:shadow-md
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-start gap-2">
          {/* Subject + Category */}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm sm:text-base font-semibold text-[#10182D]">
              {subjectName}
            </h2>

            <p className="mt-0.5 sm:mt-1 text-xs text-[#617493]">
              {category}
            </p>
          </div>

          {/* =================================================
              VERIFIED + THREE DOTS
          ================================================== */}

          <div
            className="
              relative
              ml-auto
              flex
              shrink-0
              items-center
              gap-1
            "
          >
            {/* Verified */}

            {isVerified && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  whitespace-nowrap
                  rounded-full
                  border
                  border-[#BBE7C8]
                  bg-[#ECFDF3]
                  px-2.5 sm:px-3
                  py-0.5 sm:py-1
                  text-[11px] sm:text-xs
                  font-medium
                  text-[#16A34A]
                "
                title="Verified review"
              >
                <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

                <span>
                  Verified
                </span>
              </span>
            )}

            {/* Three dots */}

            <Button
              ref={buttonRef}
              type="button"
              variant="ghost"
              size="icon"
              className="text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]"
              aria-label="Review options"
              aria-expanded={menuOpen}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!menuOpen && buttonRef.current) {
                  const rect = buttonRef.current.getBoundingClientRect();
                  setMenuPosition({
                    top: rect.bottom + 6,
                    right: window.innerWidth - rect.right,
                  });
                }

                setMenuOpen(
                  (current) =>
                    !current
                );
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* =================================================
            RATING
        ================================================== */}

        {rating !== undefined && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <span className="text-xs sm:text-sm tracking-wide text-[#F59E0B]">
              {"★".repeat(
                Math.round(rating)
              )}

              {"☆".repeat(
                Math.max(
                  0,
                  5 -
                    Math.round(
                      rating
                    )
                )
              )}
            </span>

            <span className="text-xs sm:text-sm font-medium text-[#10182D]">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* =================================================
            TITLE
        ================================================== */}

        {title && (
          <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold">
            {title}
          </h3>
        )}

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="flex-1">
          <p className="mt-2 line-clamp-3 text-xs sm:text-sm leading-5 sm:leading-6 text-[#10182D]">
            {content}
          </p>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="mt-4 sm:mt-5 flex items-center justify-between gap-3 border-t border-[#B8CCE6] pt-3.5 sm:pt-4">
          {/* Author */}

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={author}
                className="size-8 sm:size-9 shrink-0 rounded-full border object-cover"
              />
            ) : (
              <div
                className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-full border text-xs sm:text-sm font-semibold ${getAvatarColor(author)}`}
              >
                {(author || "U")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-medium ">
                {author}
              </p>

              <p className="text-[11px] sm:text-xs text-[#617493]">
                {time}
              </p>
            </div>
          </div>

          {/* Helpful */}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              updating ||
              loadingHelpful
            }
            onClick={
              handleHelpful
            }
            className={
              isHelpful
                ? "text-[#2875F5] text-xs sm:text-sm"
                : "text-[#617493] text-xs sm:text-sm hover:bg-[#F3F7FF] hover:text-[#2875F5]"
            }
          >
            <ThumbsUp
              className={`mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                isHelpful
                  ? "fill-current text-[#2875F5]"
                  : "text-[#2875F5]"
              }`}
            />

            Helpful {count}
          </Button>
        </div>
      </Link>

      {/* =================================================
          PORTAL / FIXED MENU (Yeh card ke bahar render hota hai taaki cut na ho)
      ================================================== */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
          className="
            fixed
            z-[99999]
            w-40
            overflow-hidden
            rounded-lg
            border
            border-[#D6E2F2]
            bg-white
            p-1
            shadow-2xl
          "
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {/* Open review */}
          <button
            type="button"
            onClick={handleOpenReview}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-3
              py-2
              text-left
              text-xs sm:text-sm
              transition-colors
              hover:bg-[#F3F7FF]
            "
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Review</span>
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSaveReview}
            disabled={saveLoading}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-3
              py-2
              text-left
              text-xs sm:text-sm
              transition-colors
              hover:bg-gray-100
            "
          >
            <Bookmark
              className={`h-4 w-4 ${
                isSaved ? "fill-current" : ""
              }`}
            />
            <span>
              {isSaved ? "Unsave Review" : "Save Review"}
            </span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-3
              py-2
              text-left
              text-xs sm:text-sm
              transition-colors
              hover:bg-gray-100
            "
          >
            <Share2 className="h-4 w-4" />
            <span>Share Review</span>
          </button>

          {isOwner && (
            <>
              <div className="my-1 border-t" />

              {/* Edit Review */}
              <button
                type="button"
                onClick={handleEditReview}
                className="
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-md
                  px-3
                  py-2
                  text-left
                  text-xs sm:text-sm
                  transition-colors
                  hover:bg-gray-100
                "
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Review</span>
              </button>

              {/* Delete Review */}
              <button
                type="button"
                onClick={handleDeleteReview}
                className="
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-md
                  px-3
                  py-2
                  text-left
                  text-xs sm:text-sm
                  text-red-600
                  transition-colors
                  hover:bg-red-50
                "
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Review</span>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ReviewCard;