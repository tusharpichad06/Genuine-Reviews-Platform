import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  IndianRupee,
  Send,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export type ProposalStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "withdrawn";

export type ProposalDirection =
  | "sent"
  | "received";

export type ProposalCardData = {
  id: string;

  businessId: string;

  senderName: string;
  senderBusinessName: string;
  senderAvatarUrl?: string | null;
  senderLogoUrl?: string | null;

  recipientId: string;
  recipientName: string;
  recipientLogoUrl?: string | null;

  recipientType?: "user" | "business";

  title: string;
  message: string;

  requirements?: string | null;
  deliverables?: string | null;

  budget: string | number;
  currency: string;

  startDate?: string | null;
  endDate?: string | null;

  status: ProposalStatus;

  createdAt: string;
  updatedAt?: string | null;
};

type ProposalCardProps = {
  proposal: ProposalCardData;

  direction: ProposalDirection;

  onWithdraw?: (proposal: ProposalCardData) => void;

  onAccept?: (proposal: ProposalCardData) => void;

  onDecline?: (proposal: ProposalCardData) => void;

  actionLoading?: boolean;
};

function ProposalCard({
  proposal,
  direction,
  onWithdraw,
  onAccept,
  onDecline,
  actionLoading = false,
}: ProposalCardProps) {
  const isSent = direction === "sent";
  const isPending = proposal.status === "pending";
  const isAccepted = proposal.status === "accepted";

  function getStatusLabel(
    status: ProposalStatus
  ) {
    switch (status) {
      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "declined":
        return "Declined";

      case "withdrawn":
        return "Withdrawn";

      default:
        return status;
    }
  }

  function getStatusClasses(
    status: ProposalStatus
  ) {
    switch (status) {
      case "pending":
        return "border-[#F6D58A] bg-[#FFF8E6] text-[#A16207]";

      case "accepted":
        return "border-[#B7E4C7] bg-[#ECFDF3] text-[#15803D]";

      case "declined":
        return "border-[#F3C6C6] bg-[#FFF1F1] text-[#B42318]";

      case "withdrawn":
        return "border-[#D6E2F2] bg-[#F3F7FF] text-[#617493]";

      default:
        return "border-[#D6E2F2] bg-[#F3F7FF] text-[#617493]";
    }
  }

  function formatDate(
    date: string | null | undefined
  ) {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateRange() {
    if (!proposal.startDate && !proposal.endDate) {
      return "Timeline not specified";
    }

    if (
      proposal.startDate &&
      proposal.endDate
    ) {
      return `${formatDate(
        proposal.startDate
      )} – ${formatDate(proposal.endDate)}`;
    }

    if (proposal.startDate) {
      return `Starts ${formatDate(
        proposal.startDate
      )}`;
    }

    return `Until ${formatDate(
      proposal.endDate
    )}`;
  }

  function formatBudget() {
    const numericBudget = Number(
      proposal.budget
    );

    if (
      Number.isFinite(numericBudget)
    ) {
      try {
        return new Intl.NumberFormat(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        ).format(numericBudget);
      } catch {
        return String(proposal.budget);
      }
    }

    return String(proposal.budget);
  }

  function getInitial(name: string) {
    return (
      name.trim().charAt(0).toUpperCase() ||
      "U"
    );
  }

  return (
    <article
      className="
        flex h-full flex-col
        rounded-2xl
        border border-[#D6E2F2]
        bg-white
        p-4 sm:p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-[#BBD2FF]
        hover:shadow-md
      "
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span
            className={`
              inline-flex items-center gap-1
              rounded-full border px-2.5 py-0.5 sm:py-1
              text-[11px] sm:text-xs font-bold
              ${getStatusClasses(
                proposal.status
              )}
            `}
          >
            {proposal.status ===
              "accepted" && (
              <Check className="size-3" />
            )}

            {proposal.status ===
              "pending" && (
              <Clock3 className="size-3" />
            )}

            {proposal.status ===
              "declined" && (
              <X className="size-3" />
            )}

            {getStatusLabel(
              proposal.status
            )}
          </span>

          <span
            className="
              inline-flex items-center gap-1
              rounded-full
              bg-[#E8F0FF]
              px-2.5 py-0.5 sm:py-1
              text-[11px] sm:text-xs font-semibold
              text-[#2875F5]
            "
          >
            {isSent ? (
              <>
                <Send className="size-3" />
                Sent
              </>
            ) : (
              <>
                <ArrowRight className="size-3" />
                Received
              </>
            )}
          </span>
        </div>

        <span className="shrink-0 text-[11px] sm:text-xs text-[#8798B0]">
          {formatDate(
            proposal.createdAt
          )}
        </span>
      </div>

      {/* Title */}
      <div className="mt-4 sm:mt-5">
        <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-6 sm:leading-7 text-[#10182D]">
          {proposal.title}
        </h3>

        <p className="mt-1.5 sm:mt-2 line-clamp-3 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
          {proposal.message}
        </p>
      </div>

      {/* Business / recipient */}
      <div
        className="
          mt-4 sm:mt-5 rounded-xl
          border border-[#E1EAF5]
          bg-[#F8FBFF]
          p-3.5 sm:p-4
        "
      >
        {isSent ? (
          <>
            <p className="text-[11px] sm:text-xs font-medium text-[#8798B0]">
              To
            </p>

            <div className="mt-1.5 sm:mt-2 flex items-center gap-2.5 sm:gap-3">
              {proposal.recipientLogoUrl ? (
                <img
                  src={proposal.recipientLogoUrl}
                  alt={proposal.recipientName}
                  className="size-8 sm:size-9 shrink-0 rounded-full object-cover border border-[#D6E2F2]"
                />
              ) : (
                <div
                  className="
                    flex size-8 sm:size-9 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-[#E8F0FF]
                    text-xs sm:text-sm font-bold
                    text-[#2875F5]
                  "
                >
                  {getInitial(
                    proposal.recipientName
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm font-semibold text-[#10182D]">
                  {proposal.recipientName}
                </p>

                <p className="text-[11px] sm:text-xs text-[#617493]">
                  {proposal.recipientType ===
                  "business"
                    ? "Business"
                    : "Recipient"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] sm:text-xs font-medium text-[#8798B0]">
              From
            </p>

            <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                {proposal.senderLogoUrl || proposal.senderAvatarUrl ? (
                  <img
                    src={proposal.senderLogoUrl || proposal.senderAvatarUrl || ""}
                    alt={proposal.senderBusinessName}
                    className="size-8 sm:size-9 shrink-0 rounded-full object-cover border border-[#D6E2F2]"
                  />
                ) : (
                  <div
                    className="
                      flex size-8 sm:size-9 shrink-0
                      items-center justify-center
                      rounded-full
                      bg-[#E8F0FF]
                      text-xs sm:text-sm font-bold
                      text-[#2875F5]
                    "
                  >
                    {getInitial(
                      proposal.senderBusinessName
                    )}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-semibold text-[#10182D]">
                    {
                      proposal.senderBusinessName
                    }
                  </p>

                  <p className="text-[11px] sm:text-xs text-[#617493]">
                    Business
                  </p>
                </div>
              </div>

              <Link
                to={`/business/${proposal.businessId}`}
                className="
                  shrink-0 text-xs font-semibold
                  text-[#2875F5]
                  hover:text-[#155DCC]
                "
              >
                View Business
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Budget + timeline */}
      <div className="mt-4 sm:mt-5 grid gap-2.5 sm:gap-3 sm:grid-cols-2">
        <div
          className="
            rounded-xl
            border border-[#E1EAF5]
            bg-white
            p-3.5 sm:p-4
          "
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <IndianRupee className="size-3.5 sm:size-4 text-[#2875F5]" />

            <span className="text-[11px] sm:text-xs font-medium text-[#8798B0]">
              Budget
            </span>
          </div>

          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-bold text-[#10182D]">
            {proposal.currency}{" "}
            {formatBudget()}
          </p>
        </div>

        <div
          className="
            rounded-xl
            border border-[#E1EAF5]
            bg-white
            p-3.5 sm:p-4
          "
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CalendarDays className="size-3.5 sm:size-4 text-[#2875F5]" />

            <span className="text-[11px] sm:text-xs font-medium text-[#8798B0]">
              Timeline
            </span>
          </div>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-[#10182D]">
            {formatDateRange()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 sm:pt-5">
        <div className="border-t border-[#E1EAF5] pt-3.5 sm:pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* View */}
            <Link
              to={`/proposals/${proposal.id}`}
              className="
                inline-flex items-center
                justify-center gap-1.5 sm:gap-2
                text-xs sm:text-sm font-semibold
                text-[#2875F5]
                transition-colors
                hover:text-[#155DCC]
              "
            >
              View Proposal
              <ArrowRight className="size-4" />
            </Link>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {/* Recipient actions */}
              {!isSent &&
                isPending && (
                  <>
                    <Button
                      type="button"
                      onClick={() =>
                        onDecline?.(proposal)
                      }
                      disabled={
                        actionLoading
                      }
                      variant="outline"
                      className="
                        h-9 sm:h-10 px-3
                        border-[#D6E2F2]
                        bg-white
                        text-xs sm:text-sm
                        text-[#617493]
                        hover:border-[#F3C6C6]
                        hover:bg-[#FFF5F5]
                        hover:text-[#B42318]
                      "
                    >
                      {actionLoading
                        ? "Please wait..."
                        : "Decline"}
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        onAccept?.(proposal)
                      }
                      disabled={
                        actionLoading
                      }
                      className="
                        h-9 sm:h-10 px-4
                        bg-[#2875F5]
                        text-xs sm:text-sm
                        text-white
                        shadow-sm
                        shadow-[#2875F5]/20
                        hover:bg-[#155DCC]
                      "
                    >
                      {actionLoading
                        ? "Please wait..."
                        : "Accept"}
                    </Button>
                  </>
                )}

              {/* Sender action */}
              {isSent &&
                isPending &&
                onWithdraw && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onWithdraw(proposal)
                    }
                    disabled={
                      actionLoading
                    }
                    className="
                      h-9 sm:h-10 px-3
                      border-[#D6E2F2]
                      bg-white
                      text-xs sm:text-sm
                      text-[#617493]
                      hover:border-[#F3C6C6]
                      hover:bg-[#FFF5F5]
                      hover:text-[#B42318]
                    "
                  >
                    {actionLoading
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </Button>
                )}

              {/* Accepted */}
              {isAccepted && (
                <Link
                  to={`/deals?proposal=${proposal.id}`}
                  className="
                    inline-flex items-center
                    justify-center gap-1.5 sm:gap-2
                    rounded-lg
                    bg-[#2875F5]
                    px-3.5 sm:px-4 py-2
                    text-xs sm:text-sm font-semibold
                    text-white
                    shadow-sm
                    shadow-[#2875F5]/20
                    transition
                    hover:bg-[#155DCC]
                  "
                >
                  View Deal
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProposalCard;