import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthTabs from "@/components/auth/AuthTabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = useMemo(() => {
    return searchParams.get("mode") === "signup"
      ? "signup"
      : "login";
  }, [searchParams]);

  const returnTo = searchParams.get("returnTo");

  function changeMode(value: "login" | "signup") {
    const params: Record<string, string> = {
      mode: value,
    };

    if (returnTo) {
      params.returnTo = returnTo;
    }

    setSearchParams(params);
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto px-1 sm:px-0">
        <AuthTabs
          mode={mode}
          onChange={changeMode}
        />

        <div className="mt-4 sm:mt-6">
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}
        </div>
      </div>
    </AuthLayout>
  );
}