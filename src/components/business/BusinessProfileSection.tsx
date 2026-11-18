import type { ReactNode } from "react";

type BusinessProfileSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

function BusinessProfileSection({
  title,
  description,
  icon,
  children,
  className = "",
}: BusinessProfileSectionProps) {
  return (
    <section
      className={`
        rounded-2xl
        border
        border-[#D6E2F2]
        bg-white
        p-4 sm:p-6
        shadow-sm
        ${className}
      `}
    >
      {/* Section header */}
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className="
              flex
              size-9 sm:size-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#E8F2FF]
              text-[#2875F5]
            "
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#10182D]">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-[#617493]">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Section content */}
      <div className="mt-4 sm:mt-5">
        {children}
      </div>
    </section>
  );
}

export default BusinessProfileSection;