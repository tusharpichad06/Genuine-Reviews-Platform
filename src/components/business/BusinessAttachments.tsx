import {
  Download,
  FileText,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { supabase } from "../../lib/supabase";

type BusinessAttachment = {
  id: string;
  business_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
};

type BusinessAttachmentsProps = {
  businessId?: string | null;
  disabled?: boolean;
  onPendingFilesChange?: (files: File[]) => void;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function formatFileSize(size: number | null) {
  if (!size) {
    return "Unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(fileType: string) {
  return fileType.startsWith("image/");
}

function BusinessAttachments({
  businessId,
  disabled = false,
  onPendingFilesChange,
}: BusinessAttachmentsProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [attachments, setAttachments] =
    useState<BusinessAttachment[]>([]);

  const [pendingFiles, setPendingFiles] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    onPendingFilesChange?.(pendingFiles);
  }, [pendingFiles, onPendingFilesChange]);

  useEffect(() => {
    if (!businessId) {
      setAttachments([]);
      return;
    }

    let cancelled = false;

    async function loadAttachments() {
      setLoading(true);
      setError("");

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("business_attachments")
        .select(
          `
            id,
            business_id,
            uploaded_by,
            file_name,
            file_path,
            file_type,
            file_size,
            created_at
          `
        )
        .eq("business_id", businessId)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) {
        return;
      }

      if (fetchError) {
        console.error(
          "BUSINESS ATTACHMENTS LOAD ERROR:",
          fetchError
        );

        setError(
          "Unable to load portfolio attachments."
        );

        setLoading(false);
        return;
      }

      setAttachments(
        (data ?? []) as BusinessAttachment[]
      );

      setLoading(false);
    }

    loadAttachments();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    setError("");

    const availableSlots =
      MAX_FILES -
      attachments.length -
      pendingFiles.length;

    if (availableSlots <= 0) {
      setError(
        `You can upload up to ${MAX_FILES} portfolio files.`
      );

      event.target.value = "";
      return;
    }

    const selectedFiles =
      files.slice(0, availableSlots);

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const isAllowedExt =
        fileExt &&
        [
          "jpg",
          "jpeg",
          "png",
          "webp",
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx",
        ].includes(fileExt);

      const isAllowedMime =
        ALLOWED_FILE_TYPES.includes(file.type) ||
        file.type.startsWith("image/");

      if (!isAllowedExt && !isAllowedMime) {
        setError(
          `"${file.name}" is not a supported file type.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" is larger than 10 MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (!businessId) {
        setPendingFiles((current) => [
          ...current,
          ...validFiles,
        ]);
      } else {
        uploadFiles(validFiles);
      }
    }

    event.target.value = "";
  }

  async function uploadFiles(files: File[]) {
    if (!businessId || files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "You need to log in to upload attachments."
        );
        return;
      }

      for (const file of files) {
        const safeFileName =
          file.name
            .replace(/[^a-zA-Z0-9._-]/g, "-")
            .replace(/-+/g, "-");

        const filePath =
          `business/${businessId}/portfolio/${Date.now()}-${safeFileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("business-assets")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              contentType: file.type,
              upsert: false,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          error: databaseError,
        } = await supabase
          .from("business_attachments")
          .insert({
            business_id: businessId,
            uploaded_by: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          });

        if (databaseError) {
          await supabase.storage
            .from("business-assets")
            .remove([filePath]);

          throw databaseError;
        }
      }

      const {
        data,
        error: refreshError,
      } = await supabase
        .from("business_attachments")
        .select(
          `
            id,
            business_id,
            uploaded_by,
            file_name,
            file_path,
            file_type,
            file_size,
            created_at
          `
        )
        .eq("business_id", businessId)
        .order("created_at", {
          ascending: false,
        });

      if (refreshError) {
        throw refreshError;
      }

      setAttachments(
        (data ?? []) as BusinessAttachment[]
      );
    } catch (err: unknown) {
      console.error(
        "BUSINESS ATTACHMENT UPLOAD ERROR:",
        err
      );

      const message =
        (err as { message?: string })?.message ||
        "Unable to upload one or more attachments.";

      setError(
        `Upload failed: ${message}`
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(
    attachment: BusinessAttachment
  ) {
    if (!businessId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${attachment.file_name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const {
      error: storageError,
    } = await supabase.storage
      .from("business-assets")
      .remove([attachment.file_path]);

    if (storageError) {
      console.error(
        "BUSINESS ATTACHMENT STORAGE DELETE ERROR:",
        storageError
      );
    }

    const {
      error: databaseError,
    } = await supabase
      .from("business_attachments")
      .delete()
      .eq("id", attachment.id)
      .eq("business_id", businessId);

    if (databaseError) {
      console.error(
        "BUSINESS ATTACHMENT DATABASE DELETE ERROR:",
        databaseError
      );

      setError(
        "Unable to delete the attachment."
      );

      return;
    }

    setAttachments((current) =>
      current.filter(
        (item) =>
          item.id !== attachment.id
      )
    );
  }

  function removePendingFile(index: number) {
    setPendingFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  }

  function getPublicUrl(filePath: string) {
    const {
      data,
    } = supabase.storage
      .from("business-assets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  const totalFiles =
    attachments.length +
    pendingFiles.length;

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleFileSelection}
        disabled={
          disabled ||
          uploading ||
          totalFiles >= MAX_FILES
        }
        className="hidden"
      />

      <button
        type="button"
        disabled={
          disabled ||
          uploading ||
          totalFiles >= MAX_FILES
        }
        onClick={() =>
          fileInputRef.current?.click()
        }
        className="
          flex
          w-full
          flex-col
          items-center
          justify-center
          rounded-[10px]
          border
          border-dashed
          border-[#a9d7ff]
          bg-[#f8fcff]
          px-4 sm:px-5
          py-6 sm:py-7
          text-center
          transition
          hover:border-[#2875F5]
          hover:bg-[#f2f9ff]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin text-[#2875F5]" />
        ) : (
          <span
            className="
              flex
              h-10 w-10 sm:h-11 sm:w-11
              items-center
              justify-center
              rounded-full
              bg-[#e8f4ff]
              text-[#2875F5]
            "
          >
            <ImagePlus className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        )}

        <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#0874df]">
          {uploading
            ? "Uploading..."
            : "Upload Portfolio Files"}
        </span>

        <span className="mt-1 text-[10px] sm:text-[11px] leading-4 sm:leading-5 text-[#617493]">
          Images, PDF, Word and Excel files · Maximum
          10 MB each
        </span>

        <span
          className="
            mt-2.5 sm:mt-3
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-[#2875F5]
            px-3
            py-1 sm:py-1.5
            text-[10px] sm:text-xs
            font-semibold
            text-white
          "
        >
          <Upload className="h-3 w-3" />
          Choose Files
        </span>
      </button>

      {error && (
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-[#F2C5C5]
            bg-[#FEF2F2]
            px-3
            py-2
            text-xs
            font-medium
            text-[#B91C1C]
          "
        >
          {error}
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#123b7a]">
            Files ready to upload
          </p>

          {pendingFiles.map(
            (file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-lg
                  border
                  border-[#cfe5f8]
                  bg-[#f8fcff]
                  px-3
                  py-2.5
                "
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-[#2875F5]" />

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#10182D]">
                      {file.name}
                    </p>

                    <p className="text-[10px] text-[#617493]">
                      {formatFileSize(
                        file.size
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removePendingFile(
                      index
                    )
                  }
                  disabled={disabled}
                  className="
                    shrink-0
                    rounded-full
                    p-1.5
                    text-[#617493]
                    transition
                    hover:bg-[#feecec]
                    hover:text-[#dc2626]
                  "
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {loading ? (
        <div className="py-4 text-center text-xs text-[#617493]">
          Loading portfolio...
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#123b7a]">
            Uploaded files
          </p>

          {attachments.map(
            (attachment) => {
              const publicUrl =
                getPublicUrl(
                  attachment.file_path
                );

              return (
                <div
                  key={attachment.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    border
                    border-[#cfe5f8]
                    bg-white
                    px-3
                    py-2.5
                  "
                >
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    {isImage(
                      attachment.file_type
                    ) ? (
                      <img
                        src={publicUrl}
                        alt={attachment.file_name}
                        className="
                          h-9 w-9 sm:h-10 sm:w-10
                          shrink-0
                          rounded-md
                          border
                          border-[#d6e2f2]
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-9 w-9 sm:h-10 sm:w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          bg-[#e8f4ff]
                          text-[#2875F5]
                        "
                      >
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#10182D]">
                        {attachment.file_name}
                      </p>

                      <p className="text-[10px] text-[#617493]">
                        {formatFileSize(
                          attachment.file_size
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        rounded-full
                        p-1.5
                        text-[#2875F5]
                        transition
                        hover:bg-[#eef6ff]
                      "
                      aria-label={`Open ${attachment.file_name}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>

                    {businessId && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            attachment
                          )
                        }
                        disabled={disabled}
                        className="
                          rounded-full
                          p-1.5
                          text-[#617493]
                          transition
                          hover:bg-[#feecec]
                          hover:text-[#dc2626]
                        "
                        aria-label={`Delete ${attachment.file_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : null}

      <p className="text-[10px] text-[#617493]">
        {totalFiles}/{MAX_FILES} portfolio files
      </p>
    </div>
  );
}

export default BusinessAttachments;