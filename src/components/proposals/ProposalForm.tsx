import { useState } from "react";
import {
  CalendarDays,
  FileText,
  Paperclip,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

export type ProposalFormData = {
  businessId: string;
  senderBusinessName?: string;
  recipientId: string;
  reviewId: string | null;
  title: string;
  message: string;
  requirements: string;
  deliverables: string;
  budget: string;
  currency: string;
  startDate: string;
  endDate: string;
  attachments: File[];
};

type ProposalFormProps = {
  businessId: string;
  businessName?: string;
  businessLogoUrl?: string | null;
  recipientId: string;
  recipientName?: string;
  reviewId?: string | null;
  onSubmit: (data: ProposalFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "video/mp4",
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function ProposalForm({
  businessId,
  businessName,
  businessLogoUrl,
  recipientId,
  recipientName,
  reviewId = null,
  onSubmit,
  onCancel,
  loading = false,
}: ProposalFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState("");

  function getInitial(name?: string) {
    return name?.trim().charAt(0).toUpperCase() || "B";
  }

  function getCurrencySymbol(curr: string) {
    return CURRENCY_SYMBOLS[curr] || curr;
  }

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (
      attachments.length + files.length >
      MAX_ATTACHMENTS
    ) {
      setError(
        `You can attach a maximum of ${MAX_ATTACHMENTS} files.`
      );
      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(
          `"${file.name}" is not a supported file type.`
        );
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" is larger than 10 MB.`
        );
        event.target.value = "";
        return;
      }
    }

    setAttachments((current) => [
      ...current,
      ...files,
    ]);

    event.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function formatFileSize(size: number) {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    const trimmedRequirements = requirements.trim();
    const trimmedDeliverables = deliverables.trim();
    const trimmedBudget = budget.trim();

    if (!trimmedTitle) {
      setError("Please enter a proposal title.");
      return;
    }

    if (trimmedTitle.length < 3) {
      setError(
        "Proposal title must be at least 3 characters."
      );
      return;
    }

    if (!trimmedMessage) {
      setError("Please enter a proposal description.");
      return;
    }

    if (trimmedMessage.length < 10) {
      setError(
        "Proposal description must be at least 10 characters."
      );
      return;
    }

    if (!trimmedBudget) {
      setError("Please enter a budget.");
      return;
    }

    const budgetNumber = Number(trimmedBudget);

    if (
      !Number.isFinite(budgetNumber) ||
      budgetNumber <= 0
    ) {
      setError("Please enter a valid budget greater than 0.");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError(
        "Expected completion date cannot be before the start date."
      );
      return;
    }

    try {
      await onSubmit({
        businessId,
        senderBusinessName: businessName,
        recipientId,
        reviewId,
        title: trimmedTitle,
        message: trimmedMessage,
        requirements: trimmedRequirements,
        deliverables: trimmedDeliverables,
        budget: trimmedBudget,
        currency,
        startDate,
        endDate,
        attachments,
      });
    } catch (err) {
      console.error(
        "PROPOSAL FORM SUBMIT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the proposal. Please try again."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-5"
    >
      {/* Business Identity Banner */}
      {businessName && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#D6E2F2] bg-[#F8FBFF] p-3.5 sm:p-4">
          <div className="flex items-center gap-3 min-w-0">
            {businessLogoUrl ? (
              <img
                src={businessLogoUrl}
                alt={businessName}
                className="size-10 shrink-0 rounded-full border border-[#D6E2F2] object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-bold text-[#2875F5]">
                {getInitial(businessName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#617493]">
                Sending Proposal As Business
              </p>
              <p className="truncate text-xs sm:text-sm font-bold text-[#10182D]">
                {businessName}
              </p>
            </div>
          </div>

          {recipientName && (
            <div className="border-t border-[#E1EAF5] pt-2.5 sm:border-t-0 sm:pt-0 sm:text-right">
              <p className="text-[11px] font-medium text-[#617493]">
                Recipient
              </p>
              <p className="truncate text-xs sm:text-sm font-semibold text-[#10182D]">
                @{recipientName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Proposal title (REQUIRED) */}
      <div>
        <label
          htmlFor="proposal-title"
          className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
        >
          Proposal Title{" "}
          <span className="text-[#DC2626]">*</span>
        </label>

        <input
          id="proposal-title"
          type="text"
          required
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="e.g. Product Review Collaboration"
          disabled={loading}
          className="
            w-full rounded-xl border border-[#C9D7EA]
            bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
            outline-none transition
            placeholder:text-[#A7B0BD]
            focus:border-[#2875F5]
            focus:ring-4 focus:ring-[#2875F5]/10
            disabled:cursor-not-allowed
            disabled:bg-[#F3F7FF]
          "
        />
      </div>

      {/* Description (REQUIRED) */}
      <div>
        <label
          htmlFor="proposal-message"
          className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
        >
          Proposal Description{" "}
          <span className="text-[#DC2626]">*</span>
        </label>

        <textarea
          id="proposal-message"
          required
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Describe the collaboration you are proposing..."
          rows={5}
          disabled={loading}
          className="
            w-full resize-y rounded-xl border border-[#C9D7EA]
            bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
            outline-none transition
            placeholder:text-[#A7B0BD]
            focus:border-[#2875F5]
            focus:ring-4 focus:ring-[#2875F5]/10
            disabled:cursor-not-allowed
            disabled:bg-[#F3F7FF]
          "
        />
      </div>

      {/* Requirements (Optional) */}
      <div>
        <label
          htmlFor="proposal-requirements"
          className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
        >
          Work / Requirements{" "}
          <span className="text-xs font-normal text-[#617493]">
            (optional)
          </span>
        </label>

        <textarea
          id="proposal-requirements"
          value={requirements}
          onChange={(event) =>
            setRequirements(event.target.value)
          }
          placeholder="Describe what you would like the recipient to do..."
          rows={4}
          disabled={loading}
          className="
            w-full resize-y rounded-xl border border-[#C9D7EA]
            bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
            outline-none transition
            placeholder:text-[#A7B0BD]
            focus:border-[#2875F5]
            focus:ring-4 focus:ring-[#2875F5]/10
            disabled:cursor-not-allowed
            disabled:bg-[#F3F7FF]
          "
        />
      </div>

      {/* Deliverables (Optional) */}
      <div>
        <label
          htmlFor="proposal-deliverables"
          className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
        >
          Deliverables{" "}
          <span className="text-xs font-normal text-[#617493]">
            (optional)
          </span>
        </label>

        <textarea
          id="proposal-deliverables"
          value={deliverables}
          onChange={(event) =>
            setDeliverables(event.target.value)
          }
          placeholder="Describe the expected deliverables..."
          rows={4}
          disabled={loading}
          className="
            w-full resize-y rounded-xl border border-[#C9D7EA]
            bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
            outline-none transition
            placeholder:text-[#A7B0BD]
            focus:border-[#2875F5]
            focus:ring-4 focus:ring-[#2875F5]/10
            disabled:cursor-not-allowed
            disabled:bg-[#F3F7FF]
          "
        />
      </div>

      {/* Budget (REQUIRED + Dynamic Currency Sign) */}
      <div>
        <label
          htmlFor="proposal-budget"
          className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
        >
          Fixed Budget{" "}
          <span className="text-[#DC2626]">*</span>
        </label>

        <div className="flex gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <span
              className="
                pointer-events-none absolute left-3.5
                top-1/2 -translate-y-1/2
                text-sm sm:text-base font-semibold
                text-[#617493]
              "
            >
              {getCurrencySymbol(currency)}
            </span>

            <input
              id="proposal-budget"
              type="number"
              required
              min="1"
              step="0.01"
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value)
              }
              placeholder="5000"
              disabled={loading}
              className="
                w-full rounded-xl border border-[#C9D7EA]
                bg-white py-2.5 sm:py-3 pl-9 pr-4 text-xs sm:text-sm
                text-[#10182D] outline-none transition
                placeholder:text-[#A7B0BD]
                focus:border-[#2875F5]
                focus:ring-4 focus:ring-[#2875F5]/10
                disabled:cursor-not-allowed
                disabled:bg-[#F3F7FF]
              "
            />
          </div>

          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
            disabled={loading}
            className="
              w-24 sm:w-28 rounded-xl border border-[#C9D7EA]
              bg-white px-2.5 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-medium
              text-[#10182D] outline-none transition
              focus:border-[#2875F5]
              focus:ring-4 focus:ring-[#2875F5]/10
              disabled:cursor-not-allowed
              disabled:bg-[#F3F7FF]
            "
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <p className="mt-1.5 sm:mt-2 text-xs text-[#617493]">
          This is a proposed fixed budget. No payment is
          processed here.
        </p>
      </div>

      {/* Timeline (Optional) */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <CalendarDays className="size-4 text-[#2875F5]" />

          <span className="text-xs sm:text-sm font-semibold text-[#10182D]">
            Expected Timeline{" "}
            <span className="text-xs font-normal text-[#617493]">
              (optional)
            </span>
          </span>
        </div>

        <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="proposal-start-date"
              className="mb-1.5 sm:mb-2 block text-xs font-medium text-[#617493]"
            >
              Start Date
            </label>

            <input
              id="proposal-start-date"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
              disabled={loading}
              className="
                w-full rounded-xl border border-[#C9D7EA]
                bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
                outline-none transition
                focus:border-[#2875F5]
                focus:ring-4 focus:ring-[#2875F5]/10
                disabled:cursor-not-allowed
                disabled:bg-[#F3F7FF]
              "
            />
          </div>

          <div>
            <label
              htmlFor="proposal-end-date"
              className="mb-1.5 sm:mb-2 block text-xs font-medium text-[#617493]"
            >
              Expected Completion
            </label>

            <input
              id="proposal-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              disabled={loading}
              className="
                w-full rounded-xl border border-[#C9D7EA]
                bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#10182D]
                outline-none transition
                focus:border-[#2875F5]
                focus:ring-4 focus:ring-[#2875F5]/10
                disabled:cursor-not-allowed
                disabled:bg-[#F3F7FF]
              "
            />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <div className="mb-2">
          <label
            htmlFor="proposal-attachments"
            className="block text-xs sm:text-sm font-semibold text-[#10182D]"
          >
            Attachments
          </label>

          <p className="mt-0.5 sm:mt-1 text-xs text-[#617493]">
            Add up to 5 files. Maximum 10 MB per file.
          </p>
        </div>

        <label
          htmlFor="proposal-attachments"
          className="
            flex cursor-pointer flex-col items-center
            justify-center rounded-xl border border-dashed
            border-[#BFD1E8] bg-[#F8FBFF] px-4 sm:px-5 py-5 sm:py-7
            text-center transition
            hover:border-[#2875F5]
            hover:bg-[#F3F7FF]
          "
        >
          <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-[#E8F0FF]">
            <Paperclip className="size-4 sm:size-5 text-[#2875F5]" />
          </div>

          <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-[#10182D]">
            Choose files
          </span>

          <span className="mt-1 text-xs text-[#617493]">
            Images, PDF, Word, text and MP4
          </span>
        </label>

        <input
          id="proposal-attachments"
          type="file"
          multiple
          onChange={handleFiles}
          disabled={
            loading ||
            attachments.length >= MAX_ATTACHMENTS
          }
          className="hidden"
        />

        {attachments.length > 0 && (
          <div className="mt-3.5 sm:mt-4 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="
                  flex items-center gap-3 rounded-xl
                  border border-[#D6E2F2] bg-white
                  px-3.5 sm:px-4 py-2.5 sm:py-3
                "
              >
                <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F0FF]">
                  <FileText className="size-4 text-[#2875F5]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-medium text-[#10182D]">
                    {file.name}
                  </p>

                  <p className="text-[11px] sm:text-xs text-[#617493]">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeAttachment(index)
                  }
                  disabled={loading}
                  aria-label={`Remove ${file.name}`}
                  className="
                    flex size-8 shrink-0 items-center
                    justify-center rounded-lg
                    text-[#617493] transition
                    hover:bg-[#FEECEC]
                    hover:text-[#DC2626]
                    disabled:cursor-not-allowed
                  "
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="
            rounded-xl border border-[#F3C6C6]
            bg-[#FFF5F5] px-3.5 sm:px-4 py-2.5 sm:py-3
            text-xs sm:text-sm text-[#B42318]
          "
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2.5 sm:gap-3 border-t border-[#D6E2F2] pt-4 sm:pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="
            w-full sm:w-auto border-[#C9D7EA] bg-white text-xs sm:text-sm text-[#10182D]
            hover:bg-[#F3F7FF]
          "
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            loading ||
            !title.trim() ||
            !message.trim() ||
            !budget.trim()
          }
          className="
            w-full sm:w-auto bg-[#2875F5] text-xs sm:text-sm text-white
            shadow-md shadow-[#2875F5]/20
            hover:bg-[#155DCC]
            hover:shadow-lg hover:shadow-[#2875F5]/25
            disabled:opacity-50
          "
        >
          {loading ? "Sending..." : "Send Proposal"}
        </Button>
      </div>
    </form>
  );
}

export default ProposalForm;