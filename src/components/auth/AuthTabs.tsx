import { Button } from "@/components/ui/button";

type Props = {
  mode: "login" | "signup";
  onChange: (mode: "login" | "signup") => void;
};

export default function AuthTabs({
  mode,
  onChange,
}: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 sm:mb-8">
      <Button
        variant="ghost"
        onClick={() => onChange("login")}
        className={`
          relative
          h-10
          rounded-none
          bg-transparent
          text-sm
          font-semibold
          shadow-none
          hover:bg-transparent
          sm:text-base
          ${
            mode === "login"
              ? "text-[#2875F5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2875F5]"
              : "text-[#9AA9BD] hover:text-[#617493]"
          }
        `}
      >
        Login
      </Button>

      <Button
        variant="ghost"
        onClick={() => onChange("signup")}
        className={`
          relative
          h-10
          rounded-none
          bg-transparent
          text-sm
          font-semibold
          shadow-none
          hover:bg-transparent
          sm:text-base
          ${
            mode === "signup"
              ? "text-[#2875F5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2875F5]"
              : "text-[#9AA9BD] hover:text-[#617493]"
          }
        `}
      >
        Sign Up
      </Button>
    </div>
  );
}