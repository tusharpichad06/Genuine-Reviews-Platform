import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/services/auth";

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
};

export default function ForgotPasswordForm({
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email);

      setSuccess(
        "Password reset link has been sent to your email."
      );

      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
          h-10 sm:h-11
          border-[#C9D7EA]
          bg-white
          text-xs sm:text-sm
          text-[#10182D]
          placeholder:text-[#A7B0BD]
          focus-visible:border-[#2875F5]
          focus-visible:ring-[#2875F5]/20
        "
      />

      {error && (
        <p className="text-xs sm:text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="text-xs sm:text-sm text-green-600">{success}</p>
      )}

      <Button
        type="submit"
        className="
          h-10 sm:h-11
          w-full
          bg-transparent
          text-xs sm:text-sm
          text-[#2875F5]
          font-bold
          shadow-none
          transition-colors
          hover:bg-transparent
          hover:text-[#155DCC]
        "
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}