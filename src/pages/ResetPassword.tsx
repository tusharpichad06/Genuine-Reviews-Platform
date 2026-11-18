import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    }

    checkRecoverySession();
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password) {
      setError(
        "Password is required."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(
        "Password updated successfully."
      );

      setTimeout(() => {
        navigate(
          "/auth?mode=login",
          {
            replace: true,
          }
        );
      }, 1500);
    } catch (err) {
      console.error(
        "UPDATE PASSWORD ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to update password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          Verifying reset link...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="mb-6 sm:mb-8 text-center">
          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="inline-flex items-center gap-2"
          >
            <span className="text-2xl sm:text-3xl">
              🛡️
            </span>

            <span className="text-xl sm:text-2xl font-bold">
              Genuine Reviews
            </span>
          </button>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
            Create a new password for your account.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-2xl border bg-background p-6 sm:p-8 shadow-xl">

          <h1 className="text-xl sm:text-2xl font-bold">
            Reset Password
          </h1>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Enter your new password below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5 sm:mt-6 space-y-4 sm:space-y-5"
          >

            {/* New Password */}

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
                New Password
              </label>

              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}

            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
                Confirm Password
              </label>

              <PasswordInput
                value={
                  confirmPassword
                }
                onChange={
                  setConfirmPassword
                }
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs sm:text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-xs sm:text-sm text-green-700">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              disabled={
                loading ||
                !!success
              }
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}