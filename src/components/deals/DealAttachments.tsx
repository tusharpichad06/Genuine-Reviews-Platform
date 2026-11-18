import { useRef, useState } from "react";
import {
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Lock,
  Upload,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

export type DealAttachment = {
  id: string;
  deal_id: string;
  uploaded_by: string;
  uploader_name: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  file_url?: string | null;
};

type DealAttachmentsProps = {
  attachments: DealAttachment[];
  currentUserId: string;
  onUpload: (file: File) => Promise<void>;
  onDownload?: (attachment: DealAttachment) => void;
  loading?: boolean;
  uploading?: boolean;
  disabled?: boolean;
};

function DealAttachments({
  attachments,
  currentUserId,
  onUpload,
  onDownload,
  loading = false,
  uploading = false,
  disabled = false,
}: DealAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState("");

  function formatFileSize(size: number) {
    if (!size || size <= 0) {
      return "0 KB";
    }

    if (size < 1024 * 1024) {
      return `${Math.max(
        1,
        Math.round(size / 1024)
      )} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getFileIcon(fileType: string) {
    if (fileType?.startsWith("image/")) {
      return ImageIcon;
    }

    if (fileType?.startsWith("video/")) {
      return Video;
    }

    if (
      fileType?.includes("zip") ||
      fileType?.includes("compressed")
    ) {
      return Archive;
    }

    return FileText;
  }

  function getFileIconStyle(fileType: string) {
    if (fileType?.startsWith("image/")) {
      return "bg-[#E8F2FF] text-[#2875F5]";
    }

    if (fileType?.startsWith("video/")) {
      return "bg-[#F1E8FF] text-[#7C3AED]";
    }

    if (fileType?.includes("pdf")) {
      return "bg-[#FFF0F0] text-[#EF4444]";
    }

    return "bg-[#E8F2FF] text-[#2875F5]";
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("File size must be 50 MB or less.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "video/mp4",
      "video/webm",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("This file type is not supported.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    uploadFile(file);
  }

  async function uploadFile(file: File) {
    try {
      await onUpload(file);
    } catch (err) {
      console.error("DEAL ATTACHMENT UPLOAD ERROR:", err);
      setError("Unable to upload the file. Please try again.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDownload(attachment: DealAttachment) {
    if (onDownload) {
      onDownload(attachment);
      return;
    }

    if (attachment.file_url) {
      window.open(
        attachment.file_url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  const otherPartyAttachments = attachments.filter(
    (attachment) => attachment.uploaded_by !== currentUserId
  );

  const myAttachments = attachments.filter(
    (attachment) => attachment.uploaded_by === currentUserId
  );

  function AttachmentItem({
    attachment,
  }: {
    attachment: DealAttachment;
  }) {
    const Icon = getFileIcon(attachment.file_type);
    const canOpen = Boolean(onDownload || attachment.file_url || attachment.file_path);

    return (
      <div
        onClick={() => {
          if (canOpen) {
            handleDownload(attachment);
          }
        }}
        className={`
          flex items-center gap-3
          rounded-xl border border-[#D6E2F2]
          bg-white px-3 py-3
          transition
          ${canOpen ? "cursor-pointer hover:border-[#2875F5] hover:bg-[#F7FAFF]" : ""}
        `}
      >
        <div
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            ${getFileIconStyle(attachment.file_type)}
          `}
        >
          <Icon className="h-5 w-5 pointer-events-none" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs sm:text-sm font-semibold text-[#173B73]"
            title={attachment.file_name}
          >
            {attachment.file_name}
          </p>

          <p className="mt-0.5 text-[11px] sm:text-xs text-[#7890AD]">
            {attachment.file_type
              ?.split("/")
              .pop()
              ?.toUpperCase() || "FILE"}{" "}
            • {formatFileSize(attachment.file_size)}
          </p>

          <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#8AA0BD]">
            {formatDate(attachment.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(attachment);
          }}
          disabled={!canOpen}
          className="
            flex h-9 w-9 shrink-0
            cursor-pointer
            items-center justify-center
            rounded-lg
            text-[#2875F5]
            transition
            hover:bg-[#E8F2FF]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          title="Open or Download"
          aria-label={`Download ${attachment.file_name}`}
        >
          <Download className="h-5 w-5 pointer-events-none" />
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[#D6E2F2] bg-white p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#E8F2FF] text-[#2875F5]">
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#10182D]">
            Attachments
          </h2>
        </div>

        <span className="flex h-6 sm:h-7 min-w-6 sm:min-w-7 items-center justify-center rounded-full bg-[#E8F2FF] px-2 text-xs font-bold text-[#2875F5]">
          {attachments.length}
        </span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-4 sm:mt-5 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-xl border border-[#E3EBF7] p-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#E3EBF7]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-[#E3EBF7]" />
                <div className="h-2 w-1/2 rounded bg-[#E3EBF7]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Other Participant files */}
          {otherPartyAttachments.length > 0 && (
            <div className="mt-4 sm:mt-5">
              <h3 className="mb-2.5 sm:mb-3 text-xs sm:text-sm font-bold text-[#173B73]">
                Shared With You
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {otherPartyAttachments.map((attachment) => (
                  <AttachmentItem
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* My files */}
          {myAttachments.length > 0 && (
            <div className="mt-5 sm:mt-6">
              <h3 className="mb-2.5 sm:mb-3 text-xs sm:text-sm font-bold text-[#173B73]">
                Uploaded By You
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {myAttachments.map((attachment) => (
                  <AttachmentItem
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {attachments.length === 0 && (
            <div className="mt-4 sm:mt-5 rounded-xl border border-dashed border-[#C9D7EA] bg-[#F7FAFF] px-4 py-7 sm:py-8 text-center">
              <div className="mx-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#E8F2FF]">
                <Paperclip className="h-5 w-5 text-[#2875F5]" />
              </div>

              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#173B73]">
                No attachments yet
              </p>

              <p className="mt-1 text-[11px] sm:text-xs leading-5 text-[#7890AD]">
                Upload files to share them with the other participant.
              </p>
            </div>
          )}
        </>
      )}

      {/* Privacy notice */}
      <div className="mt-4 sm:mt-5 flex items-start gap-2 rounded-xl border border-[#C9DFF8] bg-[#EAF5FF] px-3 py-2.5 sm:py-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#2875F5]" />

        <p className="text-[11px] sm:text-xs leading-5 text-[#4771A8]">
          Files shared in this deal are private and only visible to the participants.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="
          mt-4 w-full
          cursor-pointer
          border-[#BBD2FF]
          bg-white
          text-xs sm:text-sm
          text-[#2875F5]
          hover:border-[#2875F5]
          hover:bg-[#F3F7FF]
          disabled:cursor-not-allowed
        "
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin pointer-events-none" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4 pointer-events-none" />
            Upload File
          </>
        )}
      </Button>

      <p className="mt-2 text-center text-[11px] text-[#8AA0BD]">
        Maximum file size: 50 MB
      </p>
    </section>
  );
}

export default DealAttachments;