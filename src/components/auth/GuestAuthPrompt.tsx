import { X, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

type GuestAuthPromptProps = {
  open: boolean;
  onClose: () => void;
  action?: "comment" | "reply" | "like";
};

export default function GuestAuthPrompt({
  open,
  onClose,
  action = "comment",
}: GuestAuthPromptProps) {
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  const actionText =
    action === "like"
      ? "like comments"
      : action === "reply"
        ? "reply to comments"
        : "comment";

  function handleLogin() {
    onClose();

    navigate("/auth?mode=login", {
      state: {
        from: window.location.pathname,
      },
    });
  }

  function handleSignup() {
    onClose();

    navigate("/auth?mode=signup", {
      state: {
        from: window.location.pathname,
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-auth-title"
        className="relative w-full max-w-md rounded-2xl border bg-background p-5 sm:p-6 shadow-2xl"
      >
        {/* Close */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Icon */}

        <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted text-lg sm:text-xl">
          🛡️
        </div>

        {/* Heading */}

        <div className="mt-4 sm:mt-5 text-center">
          <h2
            id="guest-auth-title"
            className="text-lg sm:text-xl font-semibold"
          >
            Sign in to continue
          </h2>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground">
            Please sign in or create a free account to{" "}
            <span className="font-medium text-foreground">
              {actionText}
            </span>
            .
          </p>
        </div>

        {/* Actions */}

        <div className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
          <Button
            type="button"
            className="h-10 sm:h-11 w-full text-xs sm:text-sm"
            onClick={handleLogin}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-10 sm:h-11 w-full text-xs sm:text-sm"
            onClick={handleSignup}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create account
          </Button>
        </div>

        {/* Guest */}

        <button
          type="button"
          onClick={onClose}
          className="mt-3.5 sm:mt-4 w-full text-center text-xs sm:text-sm text-muted-foreground transition hover:text-foreground"
        >
          Continue browsing as guest
        </button>
      </div>
    </div>
  );
}