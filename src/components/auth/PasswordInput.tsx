import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-10 sm:h-11
          pr-10
          border-[#C9D8EA]
          bg-white
          text-xs sm:text-sm
          text-[#10182D]
          placeholder:text-[#9AA9BD]
          transition
          hover:border-[#9BBBE8]
          focus-visible:border-[#2875F5]
          focus-visible:ring-2
          focus-visible:ring-[#2875F5]/20
        "
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-[#10182D]"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}