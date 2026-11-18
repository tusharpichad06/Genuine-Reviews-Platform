import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import PasswordInput from "./PasswordInput";
import SocialLogin from "./SocialLogin";

import {
  login,
  loginWithGoogle,
} from "@/services/auth";

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  /*
   * ---------------------------------------------
   * GET ORIGINAL PAGE
   * ---------------------------------------------
   */

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

  /*
   * ---------------------------------------------
   * REDIRECT AFTER LOGIN
   * ---------------------------------------------
   */

  function goBackAfterAuth() {
    const returnTo =
      searchParams.get("returnTo") ||
      sessionStorage.getItem("auth_return_to");

    if (returnTo) {
      sessionStorage.removeItem("auth_return_to");

      window.location.replace(returnTo);
      return;
    }

    window.location.replace("/");
  }

  /*
   * ---------------------------------------------
   * NORMAL LOGIN
   * ---------------------------------------------
   */

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

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

      await login(
        email,
        password
      );

      /*
       * Login successful.
       * Go back to original review/page.
       */

      goBackAfterAuth();
    } catch (err) {
      console.error(
        "LOGIN FORM ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to login. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------
   * GOOGLE LOGIN
   * ---------------------------------------------
   */

  async function handleGoogleLogin() {
    setError("");

    try {
      setGoogleLoading(true);

      /*
       * Save return URL before leaving
       * the website for Google OAuth.
       */

      const returnTo = getReturnTo();

      if (returnTo) {
        sessionStorage.setItem(
          "auth_return_to",
          returnTo
        );
      }

      await loginWithGoogle(
        returnTo
          ? `${window.location.origin}${returnTo}`
          : undefined
      );
    } catch (err) {
      console.error(
        "GOOGLE LOGIN FORM ERROR:",
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
      onSubmit={handleLogin}
    >
      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#10182D] sm:mb-2">
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
          className="h-10 sm:h-11 border-[#C9D8EA] bg-white text-xs sm:text-sm text-[#10182D] placeholder:text-[#9AA9BD] focus-visible:border-[#2875F5] focus-visible:ring-[#2875F5]/20"
        />
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#10182D] sm:mb-2">
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

      {/* Forgot Password */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <Button
          variant="link"
          type="button"
          onClick={() =>
            navigate(
              "/forgot-password"
            )
          }
          className="h-auto px-0 text-xs sm:text-sm font-semibold text-[#2875F5] hover:text-[#155DCC]"
        >
          Forgot Password?
        </Button>
      </div>

      {/* Login */}
      <Button
        type="submit"
        className="h-10 sm:h-11 w-full bg-[#2875F5] text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-200/60 hover:bg-[#155DCC]"
        disabled={
          loading ||
          googleLoading
        }
      >
        {loading
          ? "Signing In..."
          : "Login"}
      </Button>

      {/* Google Login */}
      <SocialLogin
        onGoogleLogin={
          handleGoogleLogin
        }
        loading={googleLoading}
      />
    </form>
  );
}