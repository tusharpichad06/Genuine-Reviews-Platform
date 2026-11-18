import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";

import {
  signUp,
  loginWithGoogle,
} from "@/services/auth";

export default function SignupForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function getReturnTo() {
    const urlReturnTo =
      searchParams.get("returnTo");

    if (urlReturnTo) {
      return urlReturnTo;
    }

    return sessionStorage.getItem(
      "auth_return_to"
    );
  }

  function goBackAfterAuth() {
    const returnTo = getReturnTo();

    sessionStorage.removeItem(
      "auth_return_to"
    );

    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate("/");
    }
  }

  async function handleSignup(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError(
        "Username is required."
      );
      return;
    }

    if (username.trim().length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Email is required."
      );
      return;
    }

    if (!password.trim()) {
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

    try {
      setLoading(true);

      const data = await signUp({
        username,
        email,
        password,
      });

      /*
       * ---------------------------------------------
       * ACCOUNT CREATED + SESSION AVAILABLE
       * ---------------------------------------------
       */

      if (
        data.user &&
        data.session
      ) {
        goBackAfterAuth();
        return;
      }

      /*
       * ---------------------------------------------
       * EMAIL VERIFICATION REQUIRED
       * ---------------------------------------------
       */

      setSuccess(
        "Account created successfully. Please check your email to verify your account."
      );

      setTimeout(() => {
        const returnTo =
          getReturnTo();

        if (returnTo) {
          navigate(
            `/auth?mode=login&returnTo=${encodeURIComponent(
              returnTo
            )}`
          );
        } else {
          navigate(
            "/auth?mode=login"
          );
        }
      }, 2500);
    } catch (err) {
      console.error(
        "SIGNUP FORM ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");

    try {
      setGoogleLoading(true);

      /*
       * Keep the review URL available
       * for Google OAuth redirect.
       */

      const returnTo =
        getReturnTo();

      if (returnTo) {
        sessionStorage.setItem(
          "auth_return_to",
          returnTo
        );
      }

      await loginWithGoogle();
    } catch (err) {
      console.error(
        "GOOGLE SIGNUP ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to continue with Google."
        );
      }

      setGoogleLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 sm:space-y-5"
      onSubmit={handleSignup}
    >
      {/* Username */}
      <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#10182D] sm:mb-2">
          Username
        </label>

        <Input
          placeholder="Choose a username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          autoComplete="username"
          className="h-10 sm:h-11 border-[#C9D7EA] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#10182D] sm:mb-2">
          Email
        </label>

        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          autoComplete="email"
          className="h-10 sm:h-11 border-[#C9D7EA] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#A7B0BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#10182D] sm:mb-2">
          Password
        </label>

        <PasswordInput
          value={password}
          onChange={setPassword}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600 sm:p-3 sm:text-sm sm:leading-normal">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2.5 text-xs leading-5 text-green-700 sm:p-3 sm:text-sm sm:leading-normal">
          {success}
        </div>
      )}

      {/* Create Account */}
      <Button
        type="submit"
        className="h-10 sm:h-11 w-full bg-[#2875F5] text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#2875F5]/20 hover:bg-[#155DCC] hover:shadow-lg hover:shadow-[#2875F5]/25"
        disabled={
          loading ||
          googleLoading
        }
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </Button>

      {/* Google Login */}
      <SocialLogin
        onGoogleLogin={
          handleGoogleSignup
        }
        loading={googleLoading}
      />
    </form>
  );
}