import { Button } from "@/components/ui/button";

type Props = {
  onGoogleLogin: () => void;
  loading?: boolean;
};

export default function SocialLogin({
  onGoogleLogin,
  loading = false,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />

        <span className="text-xs text-muted-foreground">
          OR
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

    <Button
  type="button"
  variant="outline"
  className="
    h-10 sm:h-11
    w-full
    border-[#C9D8EA]
    bg-white
    text-xs sm:text-sm
    text-[#10182D]
    transition-colors
    hover:border-[#2875F5]
    hover:bg-[#F3F7FF]
    hover:text-[#155DCC]
  "
  onClick={onGoogleLogin}
  disabled={loading}
>
  {!loading && (
    <svg
      className="mr-2 h-4 w-4 sm:h-5 sm:w-5 shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
      />
    </svg>
  )}

  {loading
    ? "Connecting to Google..."
    : "Continue with Google"}
</Button>
    </>
  );
}