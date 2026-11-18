import { useEffect, useState } from "react";
import {
  Share2,
  Link2,
  X,
} from "lucide-react";

type BusinessAttachmentViewerProps = {
  fileName: string;
  fileType: string;
  fileUrl: string;
  onClose: () => void;
};

export default function BusinessAttachmentViewer({
  fileName,
  fileType,
  fileUrl,
  onClose,
}: BusinessAttachmentViewerProps) {
  const [copied, setCopied] = useState(false);

  const isImage =
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(fileUrl);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleShareProfile() {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: fileName,
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("SHARE PROFILE ERROR:", error);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY LINK ERROR:", error);
    }
  }

  if (!isImage) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/40
          backdrop-blur-md
          p-4 sm:p-6
        "
        onClick={onClose}
      >
        <div
          className="
            relative
            w-full
            max-w-md
            rounded-2xl sm:rounded-3xl
            border
            border-white/20
            bg-[#10182D]/95
            p-6 sm:p-8
            text-center
            text-white
            shadow-2xl
          "
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-3.5 top-3.5 sm:right-4 sm:top-4
              flex
              h-9 w-9 sm:h-10 sm:w-10
              items-center
              justify-center
              rounded-full
              bg-black/50
              text-white
              transition
              hover:bg-black/70
            "
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <p className="text-sm sm:text-base font-semibold truncate px-4">
            {fileName}
          </p>

          <p className="mt-2 text-xs sm:text-sm text-white/70">
            Preview is available only for images.
          </p>
        </div>
      </div>
    );
  }

  return (
<div
  className="
    fixed
    inset-0
    z-[100]
    overflow-hidden
    bg-[#111820]/45
    backdrop-blur-xl
  "
  onPointerDown={(event) => {
    const target = event.target as HTMLElement;

    if (
      !target.closest("[data-viewer-interactive='true']")
    ) {
      onClose();
    }
  }}
>

    {/* ================================================= */}
    {/* BLURRED BACKGROUND IMAGE                          */}
    {/* ================================================= */}

    <div
  className="
    pointer-events-none
    absolute
    inset-0
    overflow-hidden
  "
>
      <img
        src={fileUrl}
        alt=""
        aria-hidden="true"
        className="
          absolute
          inset-0
          h-full
          w-full
          scale-110
          object-cover
          blur-3xl
          opacity-60
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-black/35
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-black/10
          via-black/10
          to-black/45
        "
      />
    </div>

    {/* ================================================= */}
    {/* CLOSE BUTTON                                      */}
    {/* ================================================= */}

    <button
      type="button"
      onClick={onClose}
      className="
        absolute
        right-4 top-4 sm:right-5 sm:top-5
        z-30
        flex
        h-10 w-10 sm:h-11 sm:w-11
        items-center
        justify-center
        rounded-full
        border
        border-white/20
        bg-black/55
        text-white
        shadow-lg
        backdrop-blur-md
        transition
        hover:bg-black/75
      "
      aria-label="Close"
    >
      <X className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>

    {/* ================================================= */}
    {/* MAIN CONTENT                                      */}
    {/* ================================================= */}

   <div
  className="
    relative
    z-10
    flex
    min-h-screen
    flex-col
    items-center
    justify-between
    px-4 sm:px-5
    pb-8 sm:pb-12
    pt-14 sm:pt-10
  "
>
        {/* ================================================= */}
        {/* PROFILE IMAGE                                     */}
        {/* ================================================= */}

      <div
  className="flex flex-1 items-center justify-center py-4"
  data-viewer-interactive="true"
>
          <div
            className="
              h-[min(75vw,360px)] sm:h-[min(48vw,420px)]
              w-[min(75vw,360px)] sm:w-[min(48vw,420px)]
              max-h-[420px]
              max-w-[420px]
              min-h-[200px] sm:min-h-[220px]
              min-w-[200px] sm:min-w-[220px]
              overflow-hidden
              rounded-full
              border
              border-white/10
              bg-black/10
              shadow-[0_25px_80px_rgba(0,0,0,0.35)]
            "
          >
            <img
              src={fileUrl}
              alt={fileName}
              className="
                h-full
                w-full
                object-cover
              "
              draggable={false}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM OPTIONS                                    */}
        {/* ================================================= */}

<div
  className="
    flex
    w-full
    items-start
    justify-center
    gap-5 sm:gap-10
    pb-4 sm:pb-0
  "
  data-viewer-interactive="true"
>
          {/* SHARE PROFILE */}

          <button
            type="button"
            onClick={handleShareProfile}
            className="
              flex
              w-20 sm:w-24
              flex-col
              items-center
              gap-2 sm:gap-3
              text-white
            "
            
          >
            <span
              className="
                flex
                h-14 w-14 sm:h-[62px] sm:w-[62px]
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-[#05080C]/95
                shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                transition
                hover:scale-105
                hover:bg-[#0B1017]
              "
            >
              <Share2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
            </span>

            <span
              className="
                text-xs sm:text-sm
                font-medium
                tracking-tight
                text-white
                drop-shadow-md
              "
            >
              Share profile
            </span>
          </button>

          {/* COPY LINK */}

          <button
            type="button"
            onClick={handleCopyLink}
            className="
              flex
              w-20 sm:w-24
              flex-col
              items-center
              gap-2 sm:gap-3
              text-white
            "
          >
            <span
              className="
                flex
                h-14 w-14 sm:h-[62px] sm:w-[62px]
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-[#05080C]/95
                shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                transition
                hover:scale-105
                hover:bg-[#0B1017]
              "
            >
              <Link2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[1.8]" />
            </span>

            <span
              className="
                text-xs sm:text-sm
                font-medium
                tracking-tight
                text-white
                drop-shadow-md
              "
            >
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}