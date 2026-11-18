import {
  Globe,
  MapPin,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

export type BusinessProfileCardData = {
  id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
  short_description: string;
  location: string | null;
  website: string | null;
  services: string[];
};

type BusinessProfileCardProps = {
  business: BusinessProfileCardData;
};

function BusinessProfileCard({
  business,
}: BusinessProfileCardProps) {
  function getInitial(name: string) {
    return (
      name
        .trim()
        .charAt(0)
        .toUpperCase() || "B"
    );
  }

  function getServicePreview(
    services: string[]
  ) {
    if (!Array.isArray(services)) {
      return [];
    }

    return services
      .map((service) => service.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  const servicePreview =
    getServicePreview(business.services);

  return (
    <article
      className="
        flex
        h-full
        min-h-[280px] sm:min-h-[300px]
        flex-col
        rounded-xl
        border
        border-[#D6E2F2]
        bg-white
        p-4 sm:p-5
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-[#BBD2FF]
        hover:shadow-md
      "
    >
      {/* Business header */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div
          className="
            flex
            size-14 sm:size-16
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-[#D6E2F2]
            bg-[#EAF4FF]
          "
        >
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={`${business.business_name} logo`}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-xl sm:text-2xl font-bold text-[#2875F5]">
              {getInitial(
                business.business_name
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="
              truncate
              text-sm sm:text-base
              font-bold
              text-[#10182D]
            "
            title={business.business_name}
          >
            {business.business_name}
          </h3>

          <p className="mt-0.5 sm:mt-1 truncate text-[11px] sm:text-xs font-semibold text-[#617493]">
            {business.category}
          </p>

          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[11px] sm:text-xs text-[#617493]">
            <Star className="size-3 sm:size-3.5 fill-current text-[#F59E0B]" />
            <span>Reviews available</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mt-3.5 sm:mt-4 flex items-start gap-2 text-xs text-[#617493]">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#2875F5]" />

        <span className="line-clamp-1">
          {business.location ||
            "Location not provided"}
        </span>
      </div>

      {/* Description */}
      <p
        className="
          mt-3 sm:mt-4
          line-clamp-3
          text-xs sm:text-sm
          leading-5
          text-[#617493]
        "
      >
        {business.short_description}
      </p>

      {/* Services */}
      {servicePreview.length > 0 && (
        <div className="mt-3.5 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {servicePreview.map(
            (service) => (
              <span
                key={service}
                className="
                  rounded-full
                  bg-[#EDF6FF]
                  px-2.5
                  py-0.5 sm:py-1
                  text-[10px] sm:text-[11px]
                  font-medium
                  text-[#2875F5]
                "
              >
                {service}
              </span>
            )
          )}

          {business.services.filter(
            (service) =>
              service.trim()
          ).length > 3 && (
            <span
              className="
                rounded-full
                bg-[#EDF6FF]
                px-2.5
                py-0.5 sm:py-1
                text-[10px] sm:text-[11px]
                font-medium
                text-[#2875F5]
              "
            >
              +
              {business.services.filter(
                (service) =>
                  service.trim()
              ).length - 3}
            </span>
          )}
        </div>
      )}

      {/* Website */}
      {business.website && (
        <div className="mt-3.5 sm:mt-4 flex items-center gap-2">
          <Globe className="size-3.5 text-[#2875F5]" />

          <a
            href={business.website}
            target="_blank"
            rel="noreferrer"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              max-w-full
              truncate
              text-xs
              font-medium
              text-[#2875F5]
              hover:text-[#155DCC]
              hover:underline
            "
          >
            Visit website
          </a>
        </div>
      )}

      {/* Action */}
      <div className="mt-auto pt-4 sm:pt-5">
        <Link
          to={`/business/${business.id}`}
          className="
            inline-flex
            h-9 sm:h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-[#BBD2FF]
            bg-white
            px-4
            text-xs sm:text-sm
            font-semibold
            text-[#2875F5]
            transition
            hover:border-[#2875F5]
            hover:bg-[#F3F7FF]
            hover:text-[#155DCC]
          "
        >
          View Profile
          <span className="text-sm sm:text-base leading-none">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export default BusinessProfileCard;