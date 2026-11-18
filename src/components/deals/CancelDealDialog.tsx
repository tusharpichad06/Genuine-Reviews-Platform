import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

type CancelDealDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading?: boolean;
};

function CancelDealDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: CancelDealDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  async function handleConfirm() {
    if (loading) {
      return;
    }

    setError("");

    try {
      await onConfirm(reason.trim());
      setReason("");
    } catch (err) {
      console.error(
        "CANCEL DEAL DIALOG ERROR:",
        err
      );

      setError(
        "Unable to cancel the deal. Please try again."
      );
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setReason("");
    setError("");
    onClose();
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        px-4 py-6
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-deal-title"
    >
      <div
        className="
          relative w-full max-w-md
          rounded-2xl
          border border-[#D6E2F2]
          bg-white
          p-5 sm:p-6
          shadow-2xl
        "
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="
            absolute right-3.5 top-3.5 sm:right-4 sm:top-4
            flex h-8 w-8 items-center
            justify-center rounded-full
            text-[#7890AD]
            transition
            hover:bg-[#F3F7FF]
            hover:text-[#2875F5]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FFF1F1]">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-[#DC2626]" />
        </div>

        {/* Title */}
        <h2
          id="cancel-deal-title"
          className="mt-3.5 sm:mt-4 pr-8 text-lg sm:text-xl font-bold text-[#10182D]"
        >
          Cancel Deal
        </h2>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
          Are you sure you want to cancel this
          deal? This action cannot be undone.
        </p>

        {/* Reason */}
        <div className="mt-4 sm:mt-5">
          <label
            htmlFor="deal-cancellation-reason"
            className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
          >
            Cancellation Reason
            <span className="ml-1 font-normal text-[#8AA0BD] text-[11px] sm:text-xs">
              (optional)
            </span>
          </label>

          <textarea
            id="deal-cancellation-reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            disabled={loading}
            maxLength={1000}
            rows={4}
            placeholder="Enter the reason for cancelling this deal..."
            className="
              w-full resize-none
              rounded-xl
              border border-[#C9D7EA]
              bg-white
              px-3 py-2.5 sm:py-3
              text-xs sm:text-sm
              leading-5 sm:leading-6
              text-[#10182D]
              outline-none
              placeholder:text-[#9AA9BD]
              focus:border-[#2875F5]
              focus:ring-2
              focus:ring-[#2875F5]/20
              disabled:bg-[#F3F7FF]
            "
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[11px] sm:text-xs text-[#8AA0BD]">
              {reason.length}/1000
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-2.5 sm:mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs sm:text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="
              w-full sm:w-auto
              border-[#D6E2F2]
              bg-white
              text-xs sm:text-sm
              text-[#617493]
              hover:bg-[#F3F7FF]
              hover:text-[#10182D]
            "
          >
            Keep Deal
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="
              w-full sm:w-auto
              bg-[#DC2626]
              text-xs sm:text-sm
              text-white
              shadow-sm
              hover:bg-[#B91C1C]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Deal"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CancelDealDialog;