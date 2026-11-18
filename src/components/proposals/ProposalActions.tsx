import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "../ui/button";

export type ProposalActionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn";

type ProposalActionsProps = {
  status: ProposalActionStatus;

  role: "sender" | "recipient";

  onAccept?: () => Promise<void>;

  onDecline?: () => Promise<void>;

  onWithdraw?: () => Promise<void>;

  onViewDeal?: () => void;

  disabled?: boolean;
};

type ConfirmationType =
  | "accept"
  | "decline"
  | "withdraw"
  | null;

function ProposalActions({
  status,
  role,
  onAccept,
  onDecline,
  onWithdraw,
  onViewDeal,
  disabled = false,
}: ProposalActionsProps) {
  const [confirmation, setConfirmation] =
    useState<ConfirmationType>(null);

  const [loading, setLoading] =
    useState<ConfirmationType>(null);

  /*
   * Accepted proposal
   */
  if (status === "accepted") {
    return (
      <div
        className="
          rounded-2xl
          border border-[#B7E4C7]
          bg-[#ECFDF3]
          p-4 sm:p-5
        "
      >
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="
                flex size-9 sm:size-10 shrink-0
                items-center justify-center
                rounded-full
                bg-[#DDF7E7]
              "
            >
              <Check className="size-4 sm:size-5 text-[#15803D]" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#166534]">
                Proposal Accepted
              </h3>

              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#3F6B4E]">
                This proposal has been accepted and
                converted into a deal.
              </p>
            </div>
          </div>

          {onViewDeal && (
            <Button
              type="button"
              onClick={onViewDeal}
              className="
                w-full sm:w-auto
                shrink-0
                bg-[#2875F5]
                text-xs sm:text-sm
                text-white
                shadow-sm
                shadow-[#2875F5]/20
                hover:bg-[#155DCC]
              "
            >
              View Deal
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  /*
   * Declined proposal
   */
  if (status === "declined") {
    return (
      <div
        className="
          rounded-2xl
          border border-[#F3C6C6]
          bg-[#FFF5F5]
          p-4 sm:p-5
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-9 sm:size-10 shrink-0
              items-center justify-center
              rounded-full
              bg-[#FEECEC]
            "
          >
            <X className="size-4 sm:size-5 text-[#B42318]" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#991B1B]">
              Proposal Declined
            </h3>

            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#7F3D3D]">
              This proposal was declined and can no
              longer be accepted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Withdrawn proposal
   */
  if (status === "withdrawn") {
    return (
      <div
        className="
          rounded-2xl
          border border-[#D6E2F2]
          bg-[#F3F7FF]
          p-4 sm:p-5
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-9 sm:size-10 shrink-0
              items-center justify-center
              rounded-full
              bg-[#E5ECF6]
            "
          >
            <X className="size-4 sm:size-5 text-[#617493]" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#40516B]">
              Proposal Withdrawn
            </h3>

            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
              This proposal has been withdrawn and
              can no longer be accepted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "pending") {
    return null;
  }

  async function handleConfirm() {
    if (!confirmation) {
      return;
    }

    try {
      setLoading(confirmation);

      if (confirmation === "accept") {
        if (onAccept) {
          await onAccept();
        }
      }

      if (confirmation === "decline") {
        if (onDecline) {
          await onDecline();
        }
      }

      if (confirmation === "withdraw") {
        if (onWithdraw) {
          await onWithdraw();
        }
      }

      setConfirmation(null);
    } catch (error) {
      console.error(
        "PROPOSAL ACTION ERROR:",
        error
      );
    } finally {
      setLoading(null);
    }
  }

  function getConfirmationContent() {
    switch (confirmation) {
      case "accept":
        return {
          title: "Accept Proposal?",
          description:
            "Are you sure you want to accept this proposal? Once accepted, a deal will be created between you and the business.",
          confirmText: "Accept Proposal",
          confirmClass:
            "bg-[#2875F5] text-white hover:bg-[#155DCC]",
          icon: (
            <Check className="size-5 text-[#15803D]" />
          ),
          iconBackground: "bg-[#DDF7E7]",
        };

      case "decline":
        return {
          title: "Decline Proposal?",
          description:
            "Are you sure you want to decline this proposal? It cannot be accepted after it has been declined.",
          confirmText: "Decline Proposal",
          confirmClass:
            "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
          icon: (
            <X className="size-5 text-[#B42318]" />
          ),
          iconBackground: "bg-[#FEECEC]",
        };

      case "withdraw":
        return {
          title: "Withdraw Proposal?",
          description:
            "Are you sure you want to withdraw this proposal? The recipient will no longer be able to accept it.",
          confirmText: "Withdraw Proposal",
          confirmClass:
            "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
          icon: (
            <AlertTriangle className="size-5 text-[#B42318]" />
          ),
          iconBackground: "bg-[#FEECEC]",
        };

      default:
        return null;
    }
  }

  const confirmationContent =
    getConfirmationContent();

  return (
    <>
      <div
        className="
          rounded-2xl
          border border-[#D6E2F2]
          bg-white
          p-4 sm:p-5
        "
      >
        <h3 className="text-sm font-bold text-[#10182D]">
          Proposal Actions
        </h3>

        <p className="mt-1 text-xs sm:text-sm text-[#617493]">
          {role === "recipient"
            ? "Review this proposal and choose whether to accept or decline it."
            : "You can withdraw this proposal while it is still pending."}
        </p>

        <div className="mt-3.5 sm:mt-4 flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
          {role === "recipient" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setConfirmation("decline")
                }
                disabled={
                  disabled || loading !== null
                }
                className="
                  w-full sm:w-auto
                  border-[#D6E2F2]
                  bg-white
                  text-xs sm:text-sm
                  text-[#617493]
                  hover:border-[#F3C6C6]
                  hover:bg-[#FFF5F5]
                  hover:text-[#B42318]
                "
              >
                <X className="mr-2 size-4" />
                Decline Proposal
              </Button>

              <Button
                type="button"
                onClick={() =>
                  setConfirmation("accept")
                }
                disabled={
                  disabled || loading !== null
                }
                className="
                  w-full sm:w-auto
                  bg-[#2875F5]
                  text-xs sm:text-sm
                  text-white
                  shadow-md
                  shadow-[#2875F5]/20
                  hover:bg-[#155DCC]
                "
              >
                <Check className="mr-2 size-4" />
                Accept Proposal
              </Button>
            </>
          )}

          {role === "sender" && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setConfirmation("withdraw")
              }
              disabled={
                disabled || loading !== null
              }
              className="
                w-full sm:w-auto
                border-[#D6E2F2]
                bg-white
                text-xs sm:text-sm
                text-[#617493]
                hover:border-[#F3C6C6]
                hover:bg-[#FFF5F5]
                hover:text-[#B42318]
              "
            >
              <X className="mr-2 size-4" />
              Withdraw Proposal
            </Button>
          )}
        </div>
      </div>

      {confirmation &&
        confirmationContent && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/40
              px-4
              py-6
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-action-title"
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
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div
                  className={`
                    flex size-10 sm:size-11 shrink-0
                    items-center justify-center
                    rounded-full
                    ${confirmationContent.iconBackground}
                  `}
                >
                  {confirmationContent.icon}
                </div>

                <div className="min-w-0">
                  <h2
                    id="proposal-action-title"
                    className="
                      text-base sm:text-lg font-bold
                      text-[#10182D]
                    "
                  >
                    {confirmationContent.title}
                  </h2>

                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
                    {
                      confirmationContent.description
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2.5 sm:gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setConfirmation(null)
                  }
                  disabled={loading !== null}
                  className="
                    w-full sm:w-auto
                    border-[#D6E2F2]
                    bg-white
                    text-xs sm:text-sm
                    text-[#10182D]
                    hover:bg-[#F3F7FF]
                  "
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading !== null}
                  className={`
                    w-full sm:w-auto text-xs sm:text-sm
                    ${confirmationContent.confirmClass}
                  `}
                >
                  {loading !== null ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {confirmation ===
                      "accept"
                        ? "Accepting..."
                        : confirmation ===
                            "decline"
                          ? "Declining..."
                          : "Withdrawing..."}
                    </>
                  ) : (
                    confirmationContent.confirmText
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

export default ProposalActions;