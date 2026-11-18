import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

import { Button } from "../ui/button";

export type DealActionStatus =
  | "active"
  | "completed"
  | "cancelled";

type DealActionsProps = {
  status: DealActionStatus;
  onComplete?: () => Promise<void>;
  onCancel?: (reason: string) => Promise<void>;
  disabled?: boolean;
};

type ConfirmationType =
  | "complete"
  | "cancel"
  | null;

function DealActions({
  status,
  onComplete,
  onCancel,
  disabled = false,
}: DealActionsProps) {
  const [confirmation, setConfirmation] =
    useState<ConfirmationType>(null);

  const [reason, setReason] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  function closeDialog() {
    if (loading) {
      return;
    }

    setConfirmation(null);
    setReason("");
    setError("");
  }

  async function handleComplete() {
    if (!onComplete || loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onComplete();
      closeDialog();
    } catch (err) {
      console.error("COMPLETE DEAL ERROR:", err);
      setError("Unable to complete the deal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!onCancel || loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onCancel(reason.trim());
      closeDialog();
    } catch (err) {
      console.error("CANCEL DEAL ERROR:", err);
      setError("Unable to cancel the deal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "completed") {
    return (
      <div className="rounded-2xl border border-[#BBE7C8] bg-[#F0FFF4] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#16A34A]" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#166534]">
              Deal Completed
            </p>

            <p className="mt-0.5 text-[11px] sm:text-xs text-[#4D7C5A]">
              This collaboration has been completed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-[#F3C6C6] bg-[#FFF7F7] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2]">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#DC2626]" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#991B1B]">
              Deal Cancelled
            </p>

            <p className="mt-0.5 text-[11px] sm:text-xs text-[#9B5C5C]">
              This deal is now read-only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* Only render Mark Deal as Complete if onComplete handler is passed (Business Owner only) */}
        {onComplete && (
          <Button
            type="button"
            disabled={disabled || loading}
            onClick={() => setConfirmation("complete")}
            className="
              w-full
              cursor-pointer
              bg-[#16A34A]
              text-xs sm:text-sm
              text-white
              shadow-sm
              hover:bg-[#15803D]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4 pointer-events-none" />
            Mark Deal as Complete
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={disabled || loading}
            onClick={() => setConfirmation("cancel")}
            className="
              w-full
              cursor-pointer
              border-[#F0B8B8]
              bg-white
              text-xs sm:text-sm
              text-[#DC2626]
              hover:border-[#DC2626]
              hover:bg-[#FFF5F5]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <XCircle className="mr-1.5 h-4 w-4 pointer-events-none" />
            Cancel Deal
          </Button>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmation && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40
            px-4 py-6
          "
          role="dialog"
          aria-modal="true"
        >
          <div
            className="
              w-full max-w-md
              rounded-2xl
              border border-[#D6E2F2]
              bg-white
              p-5 sm:p-6
              shadow-2xl
            "
          >
            {confirmation === "complete" && (
              <>
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#16A34A]" />
                </div>

                <h2 className="mt-3.5 sm:mt-4 text-lg sm:text-xl font-bold text-[#10182D]">
                  Complete Deal?
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                  Are you sure this collaboration has been completed?
                </p>

                {error && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={loading}
                    className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#617493] hover:bg-[#F3F7FF]"
                  >
                    Keep Deal
                  </Button>

                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#16A34A] text-xs sm:text-sm text-white hover:bg-[#15803D]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Complete Deal
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {confirmation === "cancel" && (
              <>
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#FEE2E2]">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-[#DC2626]" />
                </div>

                <h2 className="mt-3.5 sm:mt-4 text-lg sm:text-xl font-bold text-[#10182D]">
                  Cancel Deal
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                  Are you sure you want to cancel this deal?
                </p>

                <div className="mt-4 sm:mt-5">
                  <label
                    htmlFor="deal-cancellation-reason"
                    className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-[#10182D]"
                  >
                    Reason
                    <span className="ml-1 font-normal text-[#8AA0BD] text-[11px] sm:text-xs">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="deal-cancellation-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    disabled={loading}
                    rows={4}
                    maxLength={1000}
                    placeholder="Enter cancellation reason..."
                    className="
                      w-full resize-none
                      rounded-xl
                      border border-[#C9D7EA]
                      bg-white
                      px-3 py-2.5 sm:py-3
                      text-xs sm:text-sm
                      text-[#10182D]
                      outline-none
                      placeholder:text-[#9AA9BD]
                      focus:border-[#2875F5]
                      focus:ring-2
                      focus:ring-[#2875F5]/20
                      disabled:bg-[#F3F7FF]
                    "
                  />

                  <p className="mt-1 text-right text-[11px] sm:text-xs text-[#8AA0BD]">
                    {reason.length}/1000
                  </p>
                </div>

                {error && (
                  <div className="mt-2.5 sm:mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs sm:text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={loading}
                    className="w-full sm:w-auto border-[#D6E2F2] bg-white text-xs sm:text-sm text-[#617493] hover:bg-[#F3F7FF]"
                  >
                    Keep Deal
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#DC2626] text-xs sm:text-sm text-white hover:bg-[#B91C1C]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Cancel Deal
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default DealActions;