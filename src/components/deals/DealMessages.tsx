import { useRef, useState } from "react";
import {
  Paperclip,
  Send,
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

export type DealMessage = {
  id: string;
  deal_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url?: string | null;
  message: string;
  created_at: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_path?: string | null;
};

type DealMessagesProps = {
  messages: DealMessage[];
  currentUserId: string;
  onSendMessage: (
    message: string,
    attachment?: File | null
  ) => Promise<void>;
  onOpenAttachment?: (
    filePath?: string | null,
    fileUrl?: string | null,
    fileName?: string | null
  ) => void;
  loading?: boolean;
  disabled?: boolean;
};

function DealMessages({
  messages,
  currentUserId,
  onSendMessage,
  onOpenAttachment,
  loading = false,
  disabled = false,
}: DealMessagesProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "U";
  }

  // Sender name ke samne dikhane ke liye SIRF TIME
  function formatMessageTime(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Har message ka date key nikalne ke liye (taaki pata chale din kab change hua)
  function getDateKey(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  // WhatsApp style center date divider label ("Today", "Yesterday", ya "31 Oct 2026")
  function formatDateSeparator(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) {
      return "Today";
    }

    if (isSameDay(date, yesterday)) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getAttachmentIcon(fileType?: string | null) {
    if (!fileType) {
      return FileText;
    }

    if (fileType.startsWith("image/")) {
      return ImageIcon;
    }

    if (fileType.startsWith("video/")) {
      return Video;
    }

    return FileText;
  }

  function handleAttachmentChange(
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

    setAttachment(file);
  }

  function removeAttachment() {
    setAttachment(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (disabled || sending) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !attachment) {
      setError("Write a message or attach a file.");
      return;
    }

    setError("");
    setSending(true);

    try {
      await onSendMessage(
        trimmedMessage,
        attachment
      );

      setMessage("");
      removeAttachment();
    } catch (err) {
      console.error("SEND DEAL MESSAGE ERROR:", err);
      setError("Unable to send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex min-h-[480px] sm:min-h-[620px] flex-col rounded-2xl border border-[#D6E2F2] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#D6E2F2] px-4 sm:px-5 py-3.5 sm:py-4">
        <h2 className="text-base sm:text-lg font-bold text-[#10182D]">
          Messages
        </h2>

        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#617493]">
          Communicate with the other participant about this deal.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto px-3.5 sm:px-5 py-4 sm:py-6 max-h-[500px]">
        {loading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-2.5 sm:gap-3"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-[#E3EBF7]" />

                <div className="space-y-2">
                  <div className="h-3 sm:h-4 w-24 sm:w-28 rounded bg-[#E3EBF7]" />
                  <div className="h-12 sm:h-14 w-52 sm:w-64 rounded-xl bg-[#E3EBF7]" />
                </div>
              </div>
            ))}
          </>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[260px] sm:min-h-[340px] items-center justify-center">
            <div className="max-w-sm text-center px-4">
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#E8F2FF]">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-[#2875F5]" />
              </div>

              <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#10182D]">
                No messages yet
              </h3>

              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                Start the conversation with the other participant.
              </p>
            </div>
          </div>
        ) : (
          messages.map((item, index) => {
            const isMine = item.sender_id === currentUserId;
            const AttachmentIcon = getAttachmentIcon(item.attachment_type);
            const hasAttachment = Boolean(
              item.attachment_url || item.attachment_path || item.attachment_name
            );

            // Check if date separator should be shown before this message
            const currentDateKey = getDateKey(item.created_at);
            const prevDateKey =
              index > 0 ? getDateKey(messages[index - 1].created_at) : "";
            const showDateSeparator = currentDateKey !== prevDateKey;

            return (
              <div key={item.id} className="space-y-4 sm:space-y-5">
                {/* WhatsApp Style Centered Date Badge */}
                {showDateSeparator && (
                  <div className="my-2 flex items-center justify-center">
                    <span className="rounded-full border border-[#D6E2F2] bg-[#F3F8FF] px-3.5 py-1 text-[11px] font-semibold text-[#617493] shadow-2xs">
                      {formatDateSeparator(item.created_at)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex gap-2.5 sm:gap-3 ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {item.sender_avatar_url ? (
                    <img
                      src={item.sender_avatar_url}
                      alt={item.sender_name}
                      className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full border border-[#D6E2F2] object-cover"
                    />
                  ) : (
                    <div
                      className={`
                        flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center
                        justify-center rounded-full text-xs sm:text-sm font-bold
                        ${
                          isMine
                            ? "bg-[#2875F5] text-white"
                            : "bg-[#E8F2FF] text-[#2875F5]"
                        }
                      `}
                    >
                      {getInitial(item.sender_name)}
                    </div>
                  )}

                  {/* Message body */}
                  <div
                    className={`
                      max-w-[85%] sm:max-w-[78%] flex flex-col min-w-0
                      ${isMine ? "items-end" : "items-start"}
                    `}
                  >
                    <div
                      className={`
                        mb-1 flex items-center gap-2
                        ${isMine ? "justify-end" : "justify-start"}
                      `}
                    >
                      <span className="text-xs sm:text-sm font-semibold text-[#173B73]">
                        {isMine ? "You" : item.sender_name}
                      </span>

                      {/* Only Time Shown Next to Sender Name */}
                      <span className="text-[10px] sm:text-[11px] text-[#8AA0BD]">
                        {formatMessageTime(item.created_at)}
                      </span>
                    </div>

                    {item.message && (
                      <div
                        className={`
                          rounded-2xl border px-3.5 sm:px-4 py-2.5 sm:py-3
                          text-xs sm:text-sm leading-5 sm:leading-6 whitespace-pre-wrap break-words max-w-full
                          ${
                            isMine
                              ? "rounded-tr-md border-[#BBD8FF] bg-[#E8F2FF] text-[#173B73]"
                              : "rounded-tl-md border-[#D6E2F2] bg-[#F7FAFF] text-[#304B70]"
                          }
                        `}
                      >
                        {item.message}
                      </div>
                    )}

                    {hasAttachment && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenAttachment) {
                            onOpenAttachment(
                              item.attachment_path,
                              item.attachment_url,
                              item.attachment_name
                            );
                          } else if (item.attachment_url) {
                            window.open(
                              item.attachment_url,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                        }}
                        className="
                          mt-2 flex items-center gap-2.5 sm:gap-3
                          rounded-xl border border-[#BBD2FF]
                          bg-white px-3 py-2.5 sm:py-3 text-left
                          cursor-pointer shadow-2xs max-w-full min-w-0
                          transition hover:border-[#2875F5]
                          hover:bg-[#F3F7FF]
                        "
                      >
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F2FF]">
                          <AttachmentIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5] pointer-events-none" />
                        </div>

                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate text-xs sm:text-sm font-semibold text-[#173B73]">
                            {item.attachment_name || "Attachment"}
                          </p>

                          <p className="text-[11px] sm:text-xs font-medium text-[#2875F5]">
                            Click to open file
                          </p>
                        </div>

                        <Download className="h-4 w-4 shrink-0 text-[#2875F5] pointer-events-none" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[#D6E2F2] p-3 sm:p-4">
        {error && (
          <div className="mb-2.5 sm:mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-2 rounded p-0.5 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {attachment && (
          <div className="mb-2.5 sm:mb-3 flex items-center justify-between rounded-xl border border-[#BBD2FF] bg-[#F3F8FF] px-3 py-2 min-w-0">
            <div className="flex min-w-0 items-center gap-2 flex-1 pr-2">
              <Paperclip className="h-4 w-4 shrink-0 text-[#2875F5] pointer-events-none" />

              <span className="truncate text-xs sm:text-sm font-semibold text-[#173B73]">
                {attachment.name}
              </span>
            </div>

            <button
              type="button"
              onClick={removeAttachment}
              disabled={sending || disabled}
              className="shrink-0 rounded-full p-1 text-[#617493] transition hover:bg-[#E8F2FF] hover:text-red-600"
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4 pointer-events-none" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 sm:gap-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachmentChange}
            disabled={sending || disabled}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || disabled}
            className="
              flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center
              justify-center rounded-xl
              border border-[#D6E2F2]
              bg-white text-[#2875F5]
              cursor-pointer
              transition
              hover:border-[#2875F5]
              hover:bg-[#F3F7FF]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            title="Attach file to message"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
          </button>

          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={sending || disabled}
            placeholder={
              attachment
                ? "Add a caption or press Send..."
                : "Write a message..."
            }
            className="
              h-10 sm:h-11 min-w-0 flex-1 rounded-xl
              border border-[#C9D7EA]
              bg-white px-3 sm:px-4
              text-xs sm:text-sm text-[#10182D]
              outline-none
              placeholder:text-[#8AA0BD]
              focus:border-[#2875F5]
              focus:ring-2
              focus:ring-[#2875F5]/20
              disabled:bg-[#F3F7FF]
            "
          />

          <Button
            type="submit"
            disabled={
              sending ||
              disabled ||
              (!message.trim() && !attachment)
            }
            className="
              h-10 sm:h-11 shrink-0
              cursor-pointer
              bg-[#2875F5]
              px-3.5 sm:px-5
              font-semibold
              text-white
              shadow-sm
              hover:bg-[#155DCC]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin pointer-events-none" />
            ) : (
              <Send className="h-4 w-4 pointer-events-none" />
            )}

            <span className="hidden sm:inline sm:ml-1.5">
              {sending ? "Sending..." : "Send"}
            </span>
          </Button>
        </form>

        <p className="mt-2 pl-12 sm:pl-14 text-[11px] sm:text-xs text-[#8AA0BD]">
          You can attach images, documents, PDFs, ZIPs, and videos.
        </p>
      </div>
    </section>
  );
}

export default DealMessages;