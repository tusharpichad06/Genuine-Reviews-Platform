import { useState } from "react";
import {
  CheckSquare,
  FileText,
  Info,
  Paperclip,
  Send,
  MessageCircle,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

export type DealWorkspaceTab =
  | "messages"
  | "attachments"
  | "deliverables"
  | "details";

export type DealMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  message: string;
  createdAt: string;
};

type DealWorkspaceProps = {
  currentUserId: string;
  businessName: string;
  businessLogoUrl?: string | null;
  participantName: string;
  participantAvatarUrl?: string | null;

  messages: DealMessage[];

  activeTab?: DealWorkspaceTab;
  onTabChange?: (tab: DealWorkspaceTab) => void;

  onSendMessage?: (message: string) => Promise<void>;
  onAttachFile?: (file: File) => Promise<void>;

  attachmentCount?: number;
  loading?: boolean;
  disabled?: boolean;
};

function DealWorkspace({
  currentUserId,
  businessName,
  businessLogoUrl,
  participantName,
  participantAvatarUrl,
  messages,
  activeTab = "messages",
  onTabChange,
  onSendMessage,
  onAttachFile,
  attachmentCount = 0,
  loading = false,
  disabled = false,
}: DealWorkspaceProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function getInitial(name: string) {
    return (
      name.trim().charAt(0).toUpperCase() || "U"
    );
  }

  function formatMessageTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  async function handleSendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending || disabled) {
      return;
    }

    if (!onSendMessage) {
      return;
    }

    setError("");
    setSending(true);

    try {
      await onSendMessage(trimmedMessage);
      setMessage("");
    } catch (err) {
      console.error(
        "DEAL SEND MESSAGE ERROR:",
        err
      );

      setError(
        "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || uploading || disabled) {
      return;
    }

    setError("");

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "File size must be 20 MB or smaller."
      );
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
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "This file type is not supported."
      );
      return;
    }

    if (!onAttachFile) {
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      await onAttachFile(file);
      setSelectedFile(null);
    } catch (err) {
      console.error(
        "DEAL ATTACHMENT UPLOAD ERROR:",
        err
      );

      setError(
        "Unable to upload this file. Please try again."
      );
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  }

  function renderAvatar(
    name: string,
    avatarUrl?: string | null,
    isBusiness = false
  ) {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shrink-0"
        />
      );
    }

    return (
      <div
        className={[
          "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full",
          isBusiness
            ? "bg-[#E5F1FF] text-[#2875F5]"
            : "bg-[#2875F5] text-white",
        ].join(" ")}
      >
        {isBusiness ? (
          <span className="text-xs sm:text-sm font-extrabold">
            {getInitial(name)}
          </span>
        ) : (
          <span className="text-xs sm:text-sm font-bold">
            {getInitial(name)}
          </span>
        )}
      </div>
    );
  }

  function renderMessages() {
    if (loading) {
      return (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse rounded-full bg-[#DCEBFA]" />
            <div className="space-y-2">
              <div className="h-3 sm:h-4 w-24 sm:w-28 animate-pulse rounded bg-[#DCEBFA]" />
              <div className="h-14 sm:h-16 w-52 sm:w-64 animate-pulse rounded-xl bg-[#EAF3FC]" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <div className="space-y-2">
              <div className="ml-auto h-3 sm:h-4 w-16 sm:w-20 animate-pulse rounded bg-[#DCEBFA]" />
              <div className="h-14 sm:h-16 w-48 sm:w-60 animate-pulse rounded-xl bg-[#EAF3FC]" />
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse rounded-full bg-[#DCEBFA]" />
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse rounded-full bg-[#DCEBFA]" />
            <div className="space-y-2">
              <div className="h-3 sm:h-4 w-24 sm:w-28 animate-pulse rounded bg-[#DCEBFA]" />
              <div className="h-12 sm:h-14 w-48 sm:w-56 animate-pulse rounded-xl bg-[#EAF3FC]" />
            </div>
          </div>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex min-h-[300px] sm:min-h-[360px] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#E8F2FF]">
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
          </div>

          <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#10182D]">
            No messages yet
          </h3>

          <p className="mt-1 max-w-sm text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
            Start the conversation with the other
            participant.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {messages.map((item) => {
          const isCurrentUser =
            item.senderId === currentUserId;

          const isBusinessSender =
            item.senderName === businessName;

          return (
            <div
              key={item.id}
              className={[
                "flex items-start gap-2.5 sm:gap-3",
                isCurrentUser
                  ? "justify-end"
                  : "justify-start",
              ].join(" ")}
            >
              {!isCurrentUser &&
                renderAvatar(
                  item.senderName,
                  item.senderAvatarUrl,
                  isBusinessSender
                )}

              <div
                className={[
                  "max-w-[85%] sm:max-w-[78%]",
                  isCurrentUser
                    ? "items-end"
                    : "items-start",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-1 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#6C86AA]",
                    isCurrentUser
                      ? "justify-end"
                      : "justify-start",
                  ].join(" ")}
                >
                  <span className="font-semibold text-[#17427E]">
                    {isCurrentUser
                      ? "You"
                      : item.senderName}
                  </span>

                  <span>
                    {formatMessageTime(
                      item.createdAt
                    )}
                  </span>
                </div>

                <div
                  className={[
                    "rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-5 sm:leading-6",
                    isCurrentUser
                      ? "rounded-tr-md bg-[#E7F2FF] text-[#17427E]"
                      : "rounded-tl-md bg-[#F0F7FF] text-[#17427E]",
                  ].join(" ")}
                >
                  {item.message}
                </div>
              </div>

              {isCurrentUser &&
                renderAvatar(
                  participantName,
                  participantAvatarUrl
                )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderAttachmentsTab() {
    return (
      <div className="flex min-h-[300px] sm:min-h-[360px] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#E8F2FF]">
          <Paperclip className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
        </div>

        <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#10182D]">
          Attachments
        </h3>

        <p className="mt-1 max-w-sm text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
          {attachmentCount > 0
            ? `${attachmentCount} file${
                attachmentCount === 1
                  ? ""
                  : "s"
              } shared in this deal.`
            : "Files shared in this deal will appear here."}
        </p>
      </div>
    );
  }

  function renderDeliverablesTab() {
    return (
      <div className="flex min-h-[300px] sm:min-h-[360px] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#E8F2FF]">
          <CheckSquare className="h-6 w-6 sm:h-7 sm:w-7 text-[#2875F5]" />
        </div>

        <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-[#10182D]">
          Deliverables
        </h3>

        <p className="mt-1 max-w-sm text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
          Deliverables for this collaboration will
          appear here.
        </p>
      </div>
    );
  }

  function renderDetailsTab() {
    return (
      <div className="min-h-[300px] sm:min-h-[360px] p-1 sm:p-2">
        <div className="rounded-xl border border-[#D6E2F2] bg-[#F8FBFF] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F2FF]">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#2875F5]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#10182D] truncate">
                Deal Details
              </h3>

              <p className="text-xs sm:text-sm text-[#617493]">
                Information about this collaboration.
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#D6E2F2] pb-3">
              <span className="text-[#617493]">
                Business
              </span>

              <span className="font-semibold text-[#10182D] truncate">
                {businessName}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[#617493]">
                Participant
              </span>

              <span className="font-semibold text-[#10182D] truncate">
                {participantName}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D6E2F2] bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#D6E2F2] bg-white px-3 sm:px-5 py-2.5 sm:py-3 scrollbar-none">
        <button
          type="button"
          onClick={() => onTabChange?.("messages")}
          className={[
            "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "messages"
              ? "bg-[#2875F5] text-white shadow-sm"
              : "text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]",
          ].join(" ")}
        >
          <MessageCircle className="h-4 w-4" />
          Messages
        </button>

        <button
          type="button"
          onClick={() =>
            onTabChange?.("attachments")
          }
          className={[
            "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "attachments"
              ? "bg-[#2875F5] text-white shadow-sm"
              : "text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]",
          ].join(" ")}
        >
          <Paperclip className="h-4 w-4" />
          Attachments

          {attachmentCount > 0 && (
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                activeTab === "attachments"
                  ? "bg-white/20 text-white"
                  : "bg-[#E8F2FF] text-[#2875F5]",
              ].join(" ")}
            >
              {attachmentCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            onTabChange?.("deliverables")
          }
          className={[
            "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "deliverables"
              ? "bg-[#2875F5] text-white shadow-sm"
              : "text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]",
          ].join(" ")}
        >
          <CheckSquare className="h-4 w-4" />
          Deliverables
        </button>

        <button
          type="button"
          onClick={() =>
            onTabChange?.("details")
          }
          className={[
            "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition",
            activeTab === "details"
              ? "bg-[#2875F5] text-white shadow-sm"
              : "text-[#617493] hover:bg-[#F3F7FF] hover:text-[#10182D]",
          ].join(" ")}
        >
          <Info className="h-4 w-4" />
          Deal Details
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === "messages" &&
          renderMessages()}

        {activeTab === "attachments" &&
          renderAttachmentsTab()}

        {activeTab === "deliverables" &&
          renderDeliverablesTab()}

        {activeTab === "details" &&
          renderDetailsTab()}
      </div>

      {/* Message composer */}
      {activeTab === "messages" && (
        <div className="border-t border-[#D6E2F2] bg-white p-3.5 sm:p-5">
          {error && (
            <div className="mb-2.5 sm:mb-3 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FFF5F5] px-3 py-2 text-xs sm:text-sm text-[#DC2626]">
              <span className="min-w-0 flex-1">
                {error}
              </span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-[#DC2626] hover:text-[#991B1B]"
                aria-label="Close error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {selectedFile && uploading && (
            <div className="mb-2.5 sm:mb-3 flex items-center gap-2.5 sm:gap-3 rounded-lg border border-[#D6E2F2] bg-[#F3F8FF] px-3 py-2">
              <Paperclip className="h-4 w-4 text-[#2875F5]" />

              <span className="min-w-0 flex-1 truncate text-xs sm:text-sm text-[#617493]">
                Uploading {selectedFile.name}...
              </span>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-[#D6E2F2] bg-white p-1.5 sm:p-2 transition focus-within:border-[#2875F5] focus-within:ring-2 focus-within:ring-[#2875F5]/10">
            <label
              className={[
                "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#2875F5] transition",
                disabled || uploading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-[#F3F7FF]",
              ].join(" ")}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />

              <input
                type="file"
                className="hidden"
                disabled={disabled || uploading}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt,.mp4"
              />
            </label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void handleSendMessage();
                }
              }}
              disabled={
                disabled ||
                sending ||
                loading
              }
              rows={1}
              placeholder="Write a message..."
              className="
                min-h-9 sm:min-h-10
                max-h-32
                flex-1
                resize-none
                border-0
                bg-transparent
                px-1.5 sm:px-2
                py-2 sm:py-2.5
                text-xs sm:text-sm
                text-[#10182D]
                outline-none
                placeholder:text-[#91A4BE]
                focus:ring-0
              "
            />

            <Button
              type="button"
              onClick={() =>
                void handleSendMessage()
              }
              disabled={
                disabled ||
                sending ||
                loading ||
                !message.trim()
              }
              className="
                h-9 sm:h-10
                shrink-0
                bg-[#2875F5]
                px-3.5 sm:px-4
                text-xs sm:text-sm
                font-semibold
                text-white
                shadow-sm
                hover:bg-[#155DCC]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />

              {sending ? "Sending..." : "Send"}
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 px-1 text-[11px] sm:text-xs text-[#7890AE]">
            <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              Attach files up to 20 MB
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default DealWorkspace;