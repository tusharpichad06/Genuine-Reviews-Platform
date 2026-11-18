import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { toast } from "sonner";

import {
  useSearchParams,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { uploadAttachment } from "../../lib/storage";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "../ui/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  Star,
  Paperclip,
  X,
} from "lucide-react";

const categories = [
  "Products",
  "Services",
  "Places",
  "Food & Restaurants",
  "Electronics",
  "Travel",
  "Education",
  "Health & Wellness",
  "Automotive",
  "Technology",
  "Business",
  "Other",
];

type ExistingReview = {
  id: string;
  user_id: string;
  subject: string;
  category: string | null;
  rating: number | null;
  title: string | null;
  content: string;
};

type ExistingAttachment = {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
};

function ReviewForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  

  const [searchParams] =
    useSearchParams();

  /*
   * =====================================================
   * EDIT MODE
   * =====================================================
   */

  const editReviewId =
    searchParams.get("edit");

  const isEditMode =
    Boolean(editReviewId);

  /*
   * =====================================================
   * FORM STATE
   * =====================================================
   */

  const [rating, setRating] =
    useState(0);

  const [attachments, setAttachments] =
    useState<File[]>([]);

    const [existingAttachments, setExistingAttachments] =
  useState<ExistingAttachment[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingReview, setLoadingReview] =
    useState(isEditMode);

  const [review, setReview] =
    useState<ExistingReview | null>(
      null
    );

const [selectedCategory, setSelectedCategory] =
  useState<string | null>(
    review?.category ?? null
  );
  /*
   * =====================================================
   * LOAD REVIEW FOR EDITING
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadReview() {
      /*
       * Normal create mode.
       */
      if (!editReviewId) {
        setLoadingReview(false);
        return;
      }

      /*
       * User must be logged in.
       */
      if (!user) {
        setLoadingReview(false);
        return;
      }

      setLoadingReview(true);

      try {
        const {
          data,
          error,
        } = await supabase
          .from("reviews")
          .select(
            "id, user_id, subject, category, rating, title, content"
          )
          .eq(
            "id",
            editReviewId
          )
          .eq(
            "user_id",
            user.id
          )
          .maybeSingle();

        if (error) {
          console.error(
            "LOAD REVIEW FOR EDIT ERROR:",
            error
          );

          if (!cancelled) {
            toast.error(
              "Could not load this review."
            );

            navigate("/");
          }

          return;
        }

        /*
         * No review OR review belongs to
         * another user.
         */
        if (!data) {
          if (!cancelled) {
            toast.error(
              "You can only edit your own reviews."
            );

            navigate("/");
          }

          return;
        }

        const {
  data: mediaData,
  error: mediaError,
} = await supabase
  .from("review_media")
  .select(
    "id, file_name, file_type, file_url"
  )
  .eq(
    "review_id",
    editReviewId
  )
  .order("created_at", {
    ascending: true,
  });

if (mediaError) {
  console.error(
    "LOAD REVIEW ATTACHMENTS ERROR:",
    mediaError
  );
}

        if (!cancelled) {
          setReview(
  data as ExistingReview
);

setReview(data as ExistingReview);

setSelectedCategory(
  data.category ?? undefined
);

setRating(data.rating ?? 0);

setRating(
  data.rating ?? 0
);

setExistingAttachments(
  (mediaData as ExistingAttachment[]) ?? []
);
        }
      } catch (error) {
        console.error(
          "LOAD REVIEW ERROR:",
          error
        );

        if (!cancelled) {
          toast.error(
            "Could not load the review."
          );

          navigate("/");
        }
      } finally {
        if (!cancelled) {
          setLoadingReview(false);
        }
      }
    }

    loadReview();

    return () => {
      cancelled = true;
    };
  }, [
    editReviewId,
    user,
    navigate,
  ]);


    /*
   * =====================================================
   * DELETE EXISTING ATTACHMENT
   * =====================================================
   */

function handleDeleteExistingAttachment(
  attachment: ExistingAttachment
) {
  setExistingAttachments(
    (current) =>
      current.filter(
        (item) =>
          item.id !== attachment.id
      )
  );
}



  /*
   * =====================================================
   * SUBMIT
   * =====================================================
   */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /*
     * User must be logged in.
     */
    if (!user) {
      toast.error(
        "Please login to post a review."
      );

      navigate(
        "/auth?mode=login"
      );

      return;
    }

    if (submitting) {
      return;
    }

    /*
     * Edit mode requires a loaded review.
     */
    if (
      isEditMode &&
      !review
    ) {
      toast.error(
        "The review could not be loaded."
      );

      return;
    }

    setSubmitting(true);

    try {
      const form =
        event.currentTarget;

      const formData =
        new FormData(form);

      const subject =
        (
          formData.get(
            "subject"
          ) as string
        )?.trim();

      const category =
  selectedCategory || "Other";

      const titleValue =
        (
          formData.get(
            "title"
          ) as string
        )?.trim();

      const title =
        titleValue || null;

      const content =
        (
          formData.get(
            "content"
          ) as string
        )?.trim();

      /*
       * =================================================
       * BASIC VALIDATION
       * =================================================
       */

      if (!subject) {
        toast.error(
          "Please enter what you are reviewing."
        );

        return;
      }

      if (!content) {
        toast.error(
          "Please write your review."
        );

        return;
      }

      /*
       * =================================================
       * EDIT EXISTING REVIEW
       * =================================================
       */

      if (
        isEditMode &&
        review
      ) {
        /*
         * Extra ownership protection on the
         * client side.
         *
         * The database RLS policy will be
         * the final protection.
         */

        if (
          review.user_id !==
          user.id
        ) {
          toast.error(
            "You can only edit your own reviews."
          );

          return;
        }

        if (
  review.user_id !==
  user.id
) {
  toast.error(
    "You can only edit your own reviews."
  );

  return;
}


const {
  data: updateData,
  error: updateError,
} = await supabase
  .from("reviews")
  .update({
    subject,
    category,
    rating: rating || null,
    title,
    content,
  })
  .eq("id", review.id)
  .eq("user_id", user.id)
  .select(
    "id, user_id, subject, category, rating, title, content"
  );

console.log("UPDATE RESULT:", {
  updateData,
  updateError,
  reviewId: review.id,
  currentUserId: user.id,
});

if (updateError) {
  console.error(
    "SUPABASE REVIEW UPDATE ERROR:",
    updateError
  );

  toast.error(
    updateError.message ||
      "Failed to update review."
  );

  return;
}

if (
  !updateData ||
  updateData.length === 0
) {
  console.error(
    "UPDATE AFFECTED ZERO ROWS"
  );

  toast.error(
    "Review was not updated. Check your Supabase UPDATE policy."
  );

  return;
}

/*
 * =================================================
 * DELETE REMOVED EXISTING ATTACHMENTS
 * =================================================
 */

const {
  data: currentMedia,
  error: currentMediaError,
} = await supabase
  .from("review_media")
  .select(
    "id, file_name, file_type, file_url"
  )
  .eq(
    "review_id",
    review.id
  );

if (currentMediaError) {
  console.error(
    "LOAD CURRENT REVIEW MEDIA ERROR:",
    currentMediaError
  );

  toast.error(
    "Review updated, but attachments could not be synchronized."
  );

  return;
}

const remainingIds =
  new Set(
    existingAttachments.map(
      (attachment) =>
        attachment.id
    )
  );

const removedAttachments =
  (currentMedia ?? []).filter(
    (attachment) =>
      !remainingIds.has(
        attachment.id
      )
  );

if (
  removedAttachments.length > 0
) {
  const removedIds =
    removedAttachments.map(
      (attachment) =>
        attachment.id
    );

  const {
    error: deleteMediaError,
  } = await supabase
    .from("review_media")
    .delete()
    .in(
      "id",
      removedIds
    )
    .eq(
      "review_id",
      review.id
    );

  if (deleteMediaError) {
    console.error(
      "DELETE REMOVED ATTACHMENTS ERROR:",
      deleteMediaError
    );

    toast.error(
      "Review updated, but removed attachments could not be deleted."
    );

    return;
  }
}
        /*
         * =================================================
         * UPLOAD NEW ATTACHMENTS
         * =================================================
         *
         * Existing attachments are preserved.
         * Newly selected files are added.
         */

        if (
          attachments.length > 0
        ) {
          const uploadedFiles: {
            url: string;
            path: string;
            type: string;
            name: string;
          }[] = [];

          try {
            for (
              const file of attachments
            ) {
              const uploaded =
                await uploadAttachment(
                  file,
                  user.id
                );

              uploadedFiles.push(
                uploaded
              );
            }

            if (
              uploadedFiles.length >
              0
            ) {
              const media =
                uploadedFiles.map(
                  (file) => ({
                    review_id:
                      review.id,
                    file_name:
                      file.name,
                    file_type:
                      file.type,
                    file_url:
                      file.url,
                  })
                );

              const {
                error:
                  mediaError,
              } =
                await supabase
                  .from(
                    "review_media"
                  )
                  .insert(
                    media
                  );

              if (
                mediaError
              ) {
                console.error(
                  "SUPABASE MEDIA UPDATE ERROR:",
                  mediaError
                );

                /*
                 * Remove newly uploaded
                 * storage files if database
                 * media insertion fails.
                 */
                const paths =
                  uploadedFiles.map(
                    (file) =>
                      file.path
                  );

                await supabase.storage
                  .from(
                    "review-attachments"
                  )
                  .remove(
                    paths
                  );

                toast.error(
                  "Review was updated, but the new attachments could not be saved."
                );

                return;
              }
            }
          } catch (error) {
            console.error(
              "EDIT ATTACHMENT UPLOAD ERROR:",
              error
            );

            /*
             * Clean up newly uploaded files.
             */
            if (
              uploadedFiles.length >
              0
            ) {
              const paths =
                uploadedFiles.map(
                  (file) =>
                    file.path
                );

              await supabase.storage
                .from(
                  "review-attachments"
                )
                .remove(
                  paths
                );
            }

            toast.error(
              error instanceof Error
                ? error.message
                : "Review updated, but attachments could not be uploaded."
            );

            return;
          }
        }

        toast.success(
          "Review updated successfully!"
        );

        setAttachments([]);

        /*
         * Go directly to the edited review.
         */
        setTimeout(() => {
          navigate(
            `/review/${review.id}`
          );
        }, 500);

        return;
      }

      /*
       * =================================================
       * CREATE NEW REVIEW
       * =================================================
       */

      const {
        data: newReview,
        error: reviewError,
      } =
        await supabase
          .from("reviews")
          .insert({
            user_id:
              user.id,
            subject,
            category,
            rating:
              rating || null,
            title,
            content,
          })
          .select()
          .single();

      if (
        reviewError ||
        !newReview
      ) {
        console.error(
          "SUPABASE REVIEW ERROR:",
          reviewError
        );

        toast.error(
          reviewError?.message ||
            "Failed to submit review."
        );

        return;
      }

      /*
       * =================================================
       * UPLOAD ATTACHMENTS FOR NEW REVIEW
       * =================================================
       */

      const uploadedFiles: {
        url: string;
        path: string;
        type: string;
        name: string;
      }[] = [];

      try {
        for (
          const file of attachments
        ) {
          const uploaded =
            await uploadAttachment(
              file,
              user.id
            );

          uploadedFiles.push(
            uploaded
          );
        }

        if (
          uploadedFiles.length >
          0
        ) {
          const media =
            uploadedFiles.map(
              (file) => ({
                review_id:
                  newReview.id,
                file_name:
                  file.name,
                file_type:
                  file.type,
                file_url:
                  file.url,
              })
            );

          const {
            error: mediaError,
          } =
            await supabase
              .from(
                "review_media"
              )
              .insert(
                media
              );

          if (mediaError) {
            console.error(
              "SUPABASE MEDIA ERROR:",
              mediaError
            );

            const paths =
              uploadedFiles.map(
                (file) =>
                  file.path
              );

            await supabase.storage
              .from(
                "review-attachments"
              )
              .remove(
                paths
              );

            await supabase
              .from("reviews")
              .delete()
              .eq(
                "id",
                newReview.id
              )
              .eq(
                "user_id",
                user.id
              );

            toast.error(
              "Failed to save attachments. Review was not submitted."
            );

            return;
          }
        }
      } catch (error) {
        console.error(
          "ATTACHMENT UPLOAD ERROR:",
          error
        );

        if (
          uploadedFiles.length >
          0
        ) {
          const paths =
            uploadedFiles.map(
              (file) =>
                file.path
            );

          await supabase.storage
            .from(
              "review-attachments"
            )
            .remove(
              paths
            );
        }

        await supabase
          .from("reviews")
          .delete()
          .eq(
            "id",
            newReview.id
          )
          .eq(
            "user_id",
            user.id
          );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to upload attachments."
        );

        return;
      }

      /*
       * =================================================
       * CREATE SUCCESS
       * =================================================
       */

      toast.success(
        "Review submitted successfully!"
      );

      form.reset();

      setRating(0);

      setAttachments([]);

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      console.error(
        "REVIEW SUBMISSION ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =====================================================
   * LOADING EDIT REVIEW
   * =====================================================
   */

  if (
    isEditMode &&
    loadingReview
  ) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Loading review...
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * EDIT REVIEW FAILED / NOT FOUND
   * =====================================================
   */

  if (
    isEditMode &&
    !loadingReview &&
    !review
  ) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold">
          Review not available
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          You can only edit reviews that
          belong to your account.
        </p>

        <Button
          type="button"
          className="mt-6"
          onClick={() =>
            navigate("/")
          }
        >
          Back to Home
        </Button>
      </div>
    );
  }

  /*
   * =====================================================
   * FORM
   * =====================================================
   */

  return (
    <form
      className="
        mx-auto
        w-full
        max-w-[638px]
        space-y-6 sm:space-y-7
        px-4 sm:px-0
      "
      onSubmit={handleSubmit}
    >

      <div className="mb-4 sm:mb-0 sm:absolute sm:left-6 sm:top-10">
        
      </div>

      {/* Heading */}

     <div>
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-[#10182d]
            sm:text-4xl
          "
        >
          {isEditMode
            ? "Edit Review"
            : "Write a Review"}
        </h1>

        <p
          className="
            mt-1.5 sm:mt-2
            text-xs sm:text-[15px]
            leading-5 sm:leading-6
            text-[#617493]
          "
        >
          {isEditMode
            ? "Update your review and keep your experience accurate."
            : "Share your genuine experience and help others make better decisions."}
        </p>
      </div>

      {/* Subject */}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-[#10182d]">
          What are you reviewing?{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <Input
          name="subject"
          defaultValue={
            review?.subject ?? ""
          }
          placeholder="Enter the product, service, place or anything you're reviewing"
          required
          className="
            h-10 sm:h-11
            rounded-lg
            border-[#d6e2f2]
            bg-white
            text-xs sm:text-sm
            text-[#10182d]
            placeholder:text-[#a7b0bd]
            shadow-none
            focus-visible:border-[#2875f5]
            focus-visible:ring-2
            focus-visible:ring-[#2875f5]/15
          "
        />

        <p className="text-[11px] sm:text-xs leading-5 text-[#617493]">
          Enter the exact name so people can
          find your review easily.
        </p>
      </div>

      {/* Category */}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-[#10182d]">
          Category{" "}
          <span className="text-muted-foreground text-[11px] sm:text-xs">
            (Optional)
          </span>
        </label>

        <Select
          name="category"
          value={selectedCategory ?? ""}
          onValueChange={(value) => {
            setSelectedCategory(
              value === selectedCategory
                ? null
                : value
            );
          }}
        >
          <SelectTrigger
            className="
              h-10 sm:h-11
              rounded-lg
              border-[#d6e2f2]
              bg-white
              text-xs sm:text-sm
              text-[#10182d]
              shadow-none
              focus:ring-2
              focus:ring-[#2875f5]/15
            "
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>

          <SelectContent
            side="bottom"
            align="start"
            sideOffset={4}
            alignItemWithTrigger={false}
            className="bg-white border border-slate-200 shadow-md"
          >
            {categories.map(
              (category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="cursor-pointer text-xs sm:text-sm data-[highlighted]:bg-slate-100"
                >
                  {category}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <p className="text-[11px] sm:text-xs leading-5 text-[#617493]">
          Choose a category if it fits your
          review.
        </p>
      </div>

      {/* Rating */}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-[#10182d]">
          Rating{" "}
          <span className="text-muted-foreground text-[11px] sm:text-xs">
            (Optional)
          </span>
        </label>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setRating(
                    rating === star
                      ? 0
                      : star
                  )
                }
                className="
                  rounded-md
                  p-1
                  transition-transform
                  duration-150
                  hover:scale-110
                "
                aria-label={`Rate ${star} out of 5`}
              >
                <Star
                  className={`size-5 sm:size-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-[#9aa9bd]"
                  }`}
                />
              </button>
            )
          )}
        </div>
      </div>

      {/* Review Title */}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-[#10182d]">
          Review Title{" "}
          <span className="text-muted-foreground text-[11px] sm:text-xs">
            (Optional)
          </span>
        </label>

        <Input
          name="title"
          defaultValue={
            review?.title ?? ""
          }
          placeholder="Give your review a short title (optional)"
          className="
            h-10 sm:h-11
            rounded-lg
            border-[#d6e2f2]
            bg-white
            text-xs sm:text-sm
            text-[#10182d]
            placeholder:text-[#a7b0bd]
            shadow-none
            focus-visible:border-[#2875f5]
            focus-visible:ring-2
            focus-visible:ring-[#2875f5]/15
          "
        />
      </div>

      {/* Actual Review */}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-[#10182d]">
          Your Review{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <div
          className="
            overflow-hidden
            rounded-lg
            border
            border-[#d6e2f2]
            bg-white
            shadow-none
          "
        >
          <Textarea
            name="content"
            defaultValue={
              review?.content ?? ""
            }
            placeholder="Share your genuine experience..."
            className="
              min-h-36 sm:min-h-40
              resize-y
              border-0
              bg-white
              text-xs sm:text-sm
              text-[#10182d]
              placeholder:text-[#a7b0bd]
              shadow-none
              focus-visible:ring-0
            "
            required
          />

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-[#e3ebf5]
              bg-white
              px-3.5 sm:px-4
              py-2 sm:py-2.5
            "
          >
            <label
              htmlFor="attachments"
              className="
                flex
                cursor-pointer
                items-center
                gap-1.5 sm:gap-2
                text-xs sm:text-sm
                font-semibold
                text-[#2875f5]
                transition-colors
                hover:text-[#155dcc]
              "
            >
              <Paperclip className="size-4" />
              Attach Files
            </label>

            <span className="text-[11px] sm:text-xs text-[#8191aa]">
              {attachments.length}{" "}
              file(s)
            </span>
          </div>

          <input
            id="attachments"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(event) => {
              const files =
                event.currentTarget
                  .files;

              if (
                !files ||
                files.length === 0
              ) {
                return;
              }

              const selectedFiles =
                Array.from(files);

              setAttachments(
                (previous) => [
                  ...previous,
                  ...selectedFiles,
                ]
              );

              event.currentTarget.value =
                "";
            }}
          />
        </div>

        {isEditMode &&
          existingAttachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs sm:text-sm font-medium">
                Existing Attachments
              </p>

              <div
                className="
                  overflow-hidden
                  rounded-lg
                  border
                  border-[#d6e2f2]
                  bg-white
                "
              >
                {existingAttachments.map(
                  (attachment) => (
                    <div
                      key={attachment.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-[#e8eef6]
                        px-3.5 sm:px-4
                        py-2.5 sm:py-3
                        last:border-b-0
                      "
                    >
                      <a
                        href={
                          attachment.file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 truncate text-xs sm:text-sm font-medium hover:underline"
                      >
                        📎{" "}
                        {attachment.file_name}
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExistingAttachment(
                            attachment
                          )
                        }
                        className="shrink-0 rounded-md p-1"
                        aria-label={`Delete ${attachment.file_name}`}
                      >
                        <X className="size-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}


        {attachments.length >
          0 && (
          <div className="rounded-md border border-[#d6e2f2] bg-white mt-2">
            {attachments.map(
              (
                file,
                index
              ) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between border-b border-[#e8eef6] px-3.5 sm:px-4 py-2.5 sm:py-3 last:border-b-0"
                >
                  <span className="truncate text-xs sm:text-sm">
                    📎{" "}
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setAttachments(
                        (previous) =>
                          previous.filter(
                            (
                              _,
                              fileIndex
                            ) =>
                              fileIndex !==
                              index
                          )
                      )
                    }
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <p className="text-[11px] sm:text-xs leading-5 text-[#617493]">
          {isEditMode
            ? "You can add new attachments to this review."
            : "Share your genuine experience. This field is required."}
        </p>
      </div>

      {/* Submit */}

<Button
  type="submit"
  size="lg"
  disabled={
    submitting ||
    loadingReview
  }
  className="
    h-11
    w-full sm:w-auto
    rounded-lg
    border
    border-[#2875f5]
    bg-[#2875f5]
    px-7
    text-sm
    font-bold
    text-white
    shadow-[0_6px_16px_rgba(40,117,245,0.22)]
    transition-all
    duration-200
    hover:bg-[#155dcc]
    hover:shadow-[0_8px_20px_rgba(40,117,245,0.28)]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  {submitting
    ? isEditMode
      ? "Updating..."
      : "Posting..."
    : isEditMode
    ? "Update Review"
    : "Post Review"}
</Button>
    </form>
  );
}

export default ReviewForm;