import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminNavigation from "../components/AdminNavigation";
import { supabase } from "../lib/supabase";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  category: string;
  short_description: string;
  description: string;
  location: string | null;
  website: string | null;
  business_email: string | null;
  business_phone: string | null;
  services: string[];
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  username: string;
};

type BusinessAttachment = {
  id: string;
  business_id: string;
  file_path: string;
};

const ITEMS_PER_PAGE = 7;

export default function AdminBusinesses() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [attachments, setAttachments] = useState<
    Record<string, BusinessAttachment[]>
  >({});

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteBusiness, setDeleteBusiness] =
    useState<BusinessProfile | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setErrorMessage("");

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Check admin role
      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (adminProfile?.role !== "admin") {
        navigate("/");
        return;
      }

      // Load all business profiles
      const { data: businessData, error: businessError } =
        await supabase
          .from("business_profiles")
          .select(
            `
              id,
              user_id,
              business_name,
              logo_url,
              category,
              short_description,
              description,
              location,
              website,
              business_email,
              business_phone,
              services,
              created_at,
              updated_at
            `,
          )
          .order("created_at", { ascending: false });

      if (businessError) {
        throw businessError;
      }

      const businessList =
        (businessData as BusinessProfile[]) || [];

      setBusinesses(businessList);

      // Load owners
      const ownerIds = [
        ...new Set(businessList.map((business) => business.user_id)),
      ];

      if (ownerIds.length > 0) {
        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, username")
            .in("id", ownerIds);

        if (profileError) {
          throw profileError;
        }

        const profileMap: Record<string, Profile> = {};

        (profileData as Profile[] | null)?.forEach((profile) => {
          profileMap[profile.id] = profile;
        });

        setProfiles(profileMap);
      } else {
        setProfiles({});
      }

      // Load business attachments
      const businessIds = businessList.map(
        (business) => business.id,
      );

      if (businessIds.length > 0) {
        const { data: attachmentData, error: attachmentError } =
          await supabase
            .from("business_attachments")
            .select("id, business_id, file_path")
            .in("business_id", businessIds);

        if (attachmentError) {
          throw attachmentError;
        }

        const attachmentMap: Record<
          string,
          BusinessAttachment[]
        > = {};

        (attachmentData as BusinessAttachment[] | null)?.forEach(
          (attachment) => {
            if (!attachmentMap[attachment.business_id]) {
              attachmentMap[attachment.business_id] = [];
            }

            attachmentMap[attachment.business_id].push(
              attachment,
            );
          },
        );

        setAttachments(attachmentMap);
      } else {
        setAttachments({});
      }
    } catch (error) {
      console.error("Error loading businesses:", error);

      setErrorMessage(
        "Unable to load business profiles. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
  };

  const categories = useMemo(() => {
    return [
      ...new Set(
        businesses
          .map((business) => business.category)
          .filter(Boolean),
      ),
    ].sort();
  }, [businesses]);

  const locations = useMemo(() => {
    return [
      ...new Set(
        businesses
          .map((business) => business.location?.trim())
          .filter(
            (location): location is string =>
              Boolean(location),
          ),
      ),
    ].sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const owner =
        profiles[business.user_id]?.username?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        business.business_name
          .toLowerCase()
          .includes(searchValue) ||
        business.category
          .toLowerCase()
          .includes(searchValue) ||
        (business.location || "")
          .toLowerCase()
          .includes(searchValue) ||
        owner.includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        business.category === categoryFilter;

      const matchesLocation =
        locationFilter === "all" ||
        business.location === locationFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });
  }, [
    businesses,
    profiles,
    search,
    categoryFilter,
    locationFilter,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, locationFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBusinesses.length / ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedBusinesses = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredBusinesses.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredBusinesses, currentPage]);

  const firstItem =
    filteredBusinesses.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const lastItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredBusinesses.length,
  );

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getInitial = (name: string) => {
    return (
      name.trim().charAt(0).toUpperCase() || "B"
    );
  };

  const getBusinessLogo = (
    business: BusinessProfile,
  ) => {
    return business.logo_url;
  };

  const handleView = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  const getStoragePathFromUrl = (
    url: string | null,
  ) => {
    if (!url) return null;

    const marker = "/business-assets/";

    const index = url.indexOf(marker);

    if (index === -1) return null;

    return url.substring(index + marker.length);
  };

  const handleDelete = async () => {
    if (!deleteBusiness) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      const businessId = deleteBusiness.id;

      /*
       * First remove public business attachments
       * from the storage bucket.
       */
      const businessFiles =
        attachments[businessId] || [];

      const attachmentPaths = businessFiles
        .map((attachment) => attachment.file_path)
        .filter(Boolean);

      if (attachmentPaths.length > 0) {
        const { error: storageError } =
          await supabase.storage
            .from("business-assets")
            .remove(attachmentPaths);

        if (storageError) {
          console.error(
            "Error deleting business attachments:",
            storageError,
          );
        }
      }

      /*
       * Remove logo from storage when its URL
       * belongs to business-assets.
       */
      const logoPath = getStoragePathFromUrl(
        deleteBusiness.logo_url,
      );

      if (logoPath) {
        const { error: logoError } =
          await supabase.storage
            .from("business-assets")
            .remove([logoPath]);

        if (logoError) {
          console.error(
            "Error deleting business logo:",
            logoError,
          );
        }
      }

      /*
       * Remove attachment records.
       */
      const { error: attachmentDeleteError } =
        await supabase
          .from("business_attachments")
          .delete()
          .eq("business_id", businessId);

      if (attachmentDeleteError) {
        throw attachmentDeleteError;
      }

      /*
       * Finally delete the business profile.
       *
       * If proposals/deals reference this business
       * with restrictive foreign keys, Supabase will
       * return an error instead of deleting related data.
       */
      const { error: businessDeleteError } =
        await supabase
          .from("business_profiles")
          .delete()
          .eq("id", businessId);

      if (businessDeleteError) {
        throw businessDeleteError;
      }

      setBusinesses((previous) =>
        previous.filter(
          (business) => business.id !== businessId,
        ),
      );

      setDeleteBusiness(null);

      if (
        paginatedBusinesses.length === 1 &&
        currentPage > 1
      ) {
        setPage((previous) =>
          Math.max(1, previous - 1),
        );
      }
    } catch (error: any) {
      console.error(
        "Error deleting business:",
        error,
      );

      setErrorMessage(
        error?.message ||
          "Unable to delete this business profile.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold text-[#2875F5] sm:text-sm">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#174A91] sm:text-3xl">
            Business Management
          </h1>

          <p className="mt-1 text-xs text-[#617493] sm:text-sm">
            Manage and monitor all business profiles
            from one place.
          </p>
        </div>

        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Main Content */}
        <div className="mt-4 rounded-xl border border-[#D6E2F2] bg-white p-3 shadow-sm sm:mt-5 sm:p-2.5">
          {/* Search / Filters */}
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#617493]" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search business name, category or location..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  pl-9
                  pr-4
                  text-sm
                  text-[#10182D]
                  outline-none
                  transition
                  placeholder:text-[#8FA2BC]
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                "
              />
            </div>

            {/* Mobile 2-col wrapper for selects & refresh, untouched on lg */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3">
              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  px-3
                  text-xs
                  font-medium
                  text-[#10182D]
                  outline-none
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                  sm:text-sm
                  lg:w-44
                "
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>

              {/* Location */}
              <select
                value={locationFilter}
                onChange={(event) =>
                  setLocationFilter(event.target.value)
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  px-3
                  text-xs
                  font-medium
                  text-[#10182D]
                  outline-none
                  focus:border-[#2875F5]
                  focus:ring-2
                  focus:ring-[#2875F5]/15
                  sm:text-sm
                  lg:w-44
                "
              >
                <option value="all">
                  All Locations
                </option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}
              </select>

              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  col-span-2
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#2875F5]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#155DCC]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:col-span-1
                "
              >
                <RefreshCw
                  className={`size-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />

            <div className="flex-1">
              {errorMessage}
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-[#D6E2F2] bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center sm:min-h-[420px]">
              <div className="flex items-center gap-2 text-sm font-medium text-[#617493]">
                <Loader2 className="size-5 animate-spin text-[#2875F5]" />
                Loading businesses...
              </div>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center sm:min-h-[420px]">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2875F5]">
                <Building2 className="size-6" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-[#10182D]">
                No businesses found
              </h2>

              <p className="mt-1 max-w-md text-sm text-[#617493]">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table (Untouched) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px] border-collapse">
                  <thead>
                    <tr className="bg-[#EAF3FF] text-left">
                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Business
                      </th>

                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Owner
                      </th>

                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Category
                      </th>

                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Location
                      </th>

                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Created
                      </th>

                      <th className="px-4 py-3 text-xs font-bold text-[#174A91]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedBusinesses.map(
                      (business) => {
                        const owner =
                          profiles[business.user_id]
                            ?.username || "Unknown";

                        const logo =
                          getBusinessLogo(
                            business,
                          );

                        return (
                          <tr
                            key={business.id}
                            className="
                              border-b
                              border-[#E5EDF7]
                              last:border-b-0
                              hover:bg-[#FAFCFF]
                            "
                          >
                            {/* Business */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt=""
                                    className="size-9 rounded-full border border-[#D6E2F2] object-cover"
                                  />
                                ) : (
                                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-bold text-[#2875F5]">
                                    {getInitial(
                                      business.business_name,
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#10182D]">
                                    {
                                      business.business_name
                                    }
                                  </p>

                                  <p className="mt-0.5 max-w-[190px] truncate text-xs text-[#7C90AA]">
                                    {
                                      business.short_description ||
                                      "Business profile"
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Owner */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#DCEAFF] text-xs font-bold text-[#2875F5]">
                                  {getInitial(
                                    owner,
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-[#10182D]">
                                    {owner}
                                  </p>

                                  <p className="text-[11px] text-[#7C90AA]">
                                    Owner
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-[#EEF5FF] px-3 py-1.5 text-xs font-semibold text-[#2875F5]">
                                {
                                  business.category
                                }
                              </span>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3">
                              <div className="flex items-start gap-2 text-sm text-[#10182D]">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-[#668DBE]" />

                                <span className="max-w-[130px] truncate">
                                  {business.location ||
                                    "Not specified"}
                                </span>
                              </div>
                            </td>

                            {/* Created */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="size-4 text-[#668DBE]" />

                                <span className="whitespace-nowrap text-sm text-[#10182D]">
                                  {formatDate(
                                    business.created_at,
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleView(
                                      business.id,
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-[#8DB8FF]
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-[#2875F5]
                                    transition
                                    hover:bg-[#F3F7FF]
                                    hover:border-[#2875F5]
                                  "
                                >
                                  <Eye className="size-3.5" />
                                  View
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteBusiness(
                                      business,
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-red-300
                                    bg-white
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-red-500
                                    transition
                                    hover:bg-red-50
                                  "
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (Enhanced with all desktop features & colors) */}
              <div className="divide-y divide-[#E5EDF7] md:hidden">
                {paginatedBusinesses.map(
                  (business) => {
                    const owner =
                      profiles[business.user_id]
                        ?.username || "Unknown";

                    const logo =
                      getBusinessLogo(
                        business,
                      );

                    return (
                      <div
                        key={business.id}
                        className="p-4 transition-colors hover:bg-[#FAFCFF]"
                      >
                        {/* Top row: Business Logo, Name, Short Description & Category Badge */}
                        <div className="flex items-start gap-3">
                          {logo ? (
                            <img
                              src={logo}
                              alt=""
                              className="size-11 shrink-0 rounded-full border border-[#D6E2F2] object-cover"
                            />
                          ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8F0FF] text-sm font-bold text-[#2875F5]">
                              {getInitial(
                                business.business_name,
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-bold text-[#10182D]">
                                {
                                  business.business_name
                                }
                              </h3>

                              <span className="shrink-0 rounded-full bg-[#EEF5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#2875F5]">
                                {
                                  business.category
                                }
                              </span>
                            </div>

                            <p className="mt-0.5 line-clamp-1 text-xs text-[#7C90AA]">
                              {
                                business.short_description ||
                                "Business profile"
                              }
                            </p>
                          </div>
                        </div>

                        {/* Middle info box: Owner, Location & Created Date */}
                        <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-xl border border-[#E5EDF7] bg-[#F8FBFF] p-2.5">
                          {/* Owner */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#DCEAFF] text-[11px] font-bold text-[#2875F5]">
                              {getInitial(owner)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[#10182D]">
                                {owner}
                              </p>
                              <p className="text-[10px] text-[#7C90AA]">
                                Owner
                              </p>
                            </div>
                          </div>

                          {/* Location & Date */}
                          <div className="flex flex-col justify-center gap-1 border-l border-[#E5EDF7] pl-2.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-[#10182D]">
                              <MapPin className="size-3.5 shrink-0 text-[#668DBE]" />
                              <span className="truncate">
                                {business.location || "Not specified"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-[#617493]">
                              <CalendarDays className="size-3.5 shrink-0 text-[#668DBE]" />
                              <span className="whitespace-nowrap">
                                {formatDate(business.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom actions */}
                        <div className="mt-3 flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                business.id,
                              )
                            }
                            className="
                              inline-flex
                              flex-1
                              items-center
                              justify-center
                              gap-1.5
                              rounded-lg
                              border
                              border-[#8DB8FF]
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-[#2875F5]
                              transition
                              hover:border-[#2875F5]
                              hover:bg-[#F3F7FF]
                            "
                          >
                            <Eye className="size-3.5" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteBusiness(
                                business,
                              )
                            }
                            className="
                              inline-flex
                              flex-1
                              items-center
                              justify-center
                              gap-1.5
                              rounded-lg
                              border
                              border-red-300
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-red-500
                              transition
                              hover:bg-red-50
                            "
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EDF7] px-4 py-3">
                <p className="text-xs text-[#617493]">
                  Showing{" "}
                  <span className="font-semibold text-[#174A91]">
                    {firstItem}–{lastItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#174A91]">
                    {filteredBusinesses.length}
                  </span>{" "}
                  businesses
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage((previous) =>
                        Math.max(
                          1,
                          previous - 1,
                        ),
                      )
                    }
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-[#D6E2F2]
                      bg-white
                      text-[#617493]
                      transition
                      hover:bg-[#F3F7FF]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#2875F5] text-xs font-bold text-white shadow-sm">
                    {currentPage}
                  </div>

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(
                          totalPages,
                          previous + 1,
                        ),
                      )
                    }
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-[#D6E2F2]
                      bg-white
                      text-[#617493]
                      transition
                      hover:bg-[#F3F7FF]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#D6E2F2] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle className="size-5" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#10182D] sm:text-lg">
                    Delete Business Profile?
                  </h2>

                  <p className="mt-1 text-xs text-[#617493] sm:text-sm">
                    This will remove the business
                    profile and its public portfolio.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteBusiness(null)
                }
                disabled={deleting}
                className="text-[#8FA2BC] transition hover:text-[#10182D]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[#E5EDF7] bg-[#F8FBFF] px-4 py-3 sm:mt-5">
              <p className="truncate text-sm font-semibold text-[#10182D]">
                {deleteBusiness.business_name}
              </p>

              <p className="mt-1 text-xs text-[#617493]">
                {deleteBusiness.category}
                {deleteBusiness.location
                  ? ` • ${deleteBusiness.location}`
                  : ""}
              </p>
            </div>

            <div className="mt-5 flex gap-2.5 sm:mt-6 sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteBusiness(null)
                }
                disabled={deleting}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-[#D6E2F2]
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#617493]
                  transition
                  hover:bg-[#F3F7FF]
                  disabled:opacity-50
                  sm:flex-none
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="
                  inline-flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:flex-none
                "
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}