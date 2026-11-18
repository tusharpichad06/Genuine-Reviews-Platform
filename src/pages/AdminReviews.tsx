import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import AdminNavigation from "../components/AdminNavigation";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { getAvatarColor } from "@/lib/avatar";



type ReviewStatus = "Approved" | "Pending" | "Rejected";

type Review = {
  id: string;
  user_id: string | null;
  title: string;
  text: string;
  user: string;
  email: string;
  avatar: string;
  product: string;
  category: string;
  rating: number;
  status: ReviewStatus;
  date: string;
  time: string;
  moderation_status: ReviewStatus;
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  contact_email: string | null;
};

function AdminReviews() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Status");
  const [ratingFilter, setRatingFilter] =
    useState("All Ratings");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [moderatingReviewId, setModeratingReviewId] =
    useState<string | null>(null);

  const [moderateMenuPosition, setModerateMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const moderateButtonRefs =
    useRef<Record<string, HTMLButtonElement | null>>({});

  const reviewsPerPage = 7;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (
        !target.closest("[data-moderation-menu]")
      ) {
        setModeratingReviewId(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      setError(null);

      try {
        // 1. Load reviews
        const {
          data: reviewData,
          error: reviewError,
        } = await supabase
          .from("reviews")
          .select(`
            id,
            subject,
            category,
            rating,
            title,
            content,
            created_at,
            user_id,
            status,
            moderation_status
          `)
          .order("created_at", {
            ascending: false,
          });

        if (reviewError) {
          console.error(
            "LOAD REVIEWS ERROR:",
            reviewError
          );

          setError("Unable to load reviews.");
          return;
        }

        // 2. Get all user IDs
        const userIds = Array.from(
          new Set(
            (reviewData || [])
              .map((review) => review.user_id)
              .filter(Boolean)
          )
        );

        // 3. Load profiles separately
        let profiles: Profile[] = [];

        if (userIds.length > 0) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select(`
              id,
              username,
              avatar_url,
              contact_email
            `)
            .in("id", userIds);

          if (profileError) {
            console.error(
              "LOAD PROFILES ERROR:",
              profileError
            );
          } else {
            profiles = profileData || [];
          }
        }

        // 4. Convert profiles into easy lookup
        const profileMap = new Map(
          profiles.map((profile) => [
            profile.id,
            profile,
          ])
        );

        // 5. Format reviews
        const formattedReviews: Review[] =
          (reviewData || []).map((review: any) => {
            const createdDate = new Date(
              review.created_at
            );

            const profile =
              profileMap.get(review.user_id);

            let formattedStatus: ReviewStatus =
              review.moderation_status === "Pending"
                ? "Pending"
                : review.moderation_status === "Rejected"
                ? "Rejected"
                : "Approved";
            return {
              id: review.id,
              user_id: review.user_id,
              moderation_status: formattedStatus,

              title:
                review.title ||
                review.subject ||
                "Untitled Review",

              text:
                review.content ||
                "No review content.",

              user:
                profile?.username ||
                "Unknown User",

              email:
                profile?.contact_email ||
                "",

              avatar:
                profile?.avatar_url ||
                "",

              product:
                review.subject ||
                "Unknown Product",

              category:
                review.category ||
                "Other",

              rating:
                Number(review.rating) || 0,

              status:
                formattedStatus,

              date:
                createdDate.toLocaleDateString(),

              time:
                createdDate.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                ),
            };
          });

        setReviews(formattedReviews);
      } catch (error) {
        console.error(
          "LOAD ADMIN REVIEWS ERROR:",
          error
        );

        setError(
          "Something went wrong while loading reviews."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);


  /*
   * =========================================================
   * FILTER REVIEWS
   * =========================================================
   */
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        review.title.toLowerCase().includes(searchText) ||
        review.text.toLowerCase().includes(searchText) ||
        review.user.toLowerCase().includes(searchText) ||
        review.email.toLowerCase().includes(searchText) ||
        review.product.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All Status" ||
        review.status === statusFilter;

      const matchesRating =
        ratingFilter === "All Ratings" ||
        review.rating === Number(ratingFilter);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        review.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRating &&
        matchesCategory
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    ratingFilter,
    categoryFilter,
  ]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */
  const categories = [
    "Products",
    "Services",
    "Places",
    "Food & Restaurants",
    "Electronics",
    "Travel",
    "Education",
    "Health & Wellness",
    "Automotive",
    "Technology",
    "Other",
  ];

  const totalReviews = reviews.length;

  const approvedReviews =
    reviews.filter(
      (review) =>
        review.status === "Approved"
    ).length;

  const pendingReviews =
    reviews.filter(
      (review) =>
        review.status === "Pending"
    ).length;

  const rejectedReviews =
    reviews.filter(
      (review) =>
        review.status === "Rejected"
    ).length;

  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length / reviewsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(page, totalPages)
    );
  }, [totalPages]);


  const startIndex =
    (safeCurrentPage - 1) * reviewsPerPage;

  const visibleReviews = filteredReviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );

  /*
   * =========================================================
   * ALL REVIEW SELECTION
   * =========================================================
   */

  function toggleReviewSelection(reviewId: string) {
    setSelectedReviewIds((current) =>
      current.includes(reviewId)
        ? current.filter((id) => id !== reviewId)
        : [...current, reviewId]
    );
  }

  function toggleSelectAllVisible() {
    const visibleIds = visibleReviews.map(
      (review) => review.id
    );

    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedReviewIds.includes(id)
      );

    if (allVisibleSelected) {
      setSelectedReviewIds((current) =>
        current.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedReviewIds((current) =>
        Array.from(
          new Set([...current, ...visibleIds])
        )
      );
    }
  }

  /*
   * =========================================================
   * UPDATE REVIEW STATUS
   * =========================================================
   */

  async function updateReviewStatus(
    reviewId: string,
    newStatus: ReviewStatus
  ) {
    setModeratingReviewId(reviewId);

    try {
      let databaseStatus = "published";

      if (newStatus === "Pending") {
        databaseStatus = "hidden";
      }

      if (newStatus === "Rejected") {
        databaseStatus = "hidden";
      }

      const { error } = await supabase
        .from("reviews")
        .update({
          status: databaseStatus,
          moderation_status: newStatus,
        })
        .eq("id", reviewId);

      if (error) {
        console.error(
          "UPDATE REVIEW STATUS ERROR:",
          error
        );

        alert(
          `Failed to update review status: ${error.message}`
        );

        return;
      }

      // Update UI immediately
      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status: newStatus,
              }
            : review
        )
      );

      // Close moderation menu
      setModeratingReviewId(null);

      // Close detail modal if open
      if (selectedReview?.id === reviewId) {
        setSelectedReview((current) =>
          current
            ? {
                ...current,
                status: newStatus,
              }
            : null
        );
      }
    } catch (error) {
      console.error(
        "UPDATE REVIEW STATUS ERROR:",
        error
      );

      alert(
        "Something went wrong while updating the review."
      );
    } finally {
      setModeratingReviewId(null);
    }
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        console.error(
          "DELETE REVIEW ERROR:",
          error
        );

        alert(
          `Failed to delete review: ${error.message}`
        );

        return;
      }

      // Remove from reviews list
      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) => review.id !== reviewId
        )
      );

      // Remove from selected reviews
      setSelectedReviewIds((currentIds) =>
        currentIds.filter(
          (id) => id !== reviewId
        )
      );

      // Close modal
      setSelectedReview(null);
    } catch (error) {
      console.error(
        "DELETE REVIEW ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting the review."
      );
    }
  }


  async function deleteSelectedReviews() {
    if (selectedReviewIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedReviewIds.length} selected review${
        selectedReviewIds.length > 1 ? "s" : ""
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .in("id", selectedReviewIds);

      if (error) {
        console.error(
          "BULK DELETE REVIEWS ERROR:",
          error
        );

        alert(
          `Failed to delete selected reviews: ${error.message}`
        );

        return;
      }

      setReviews((currentReviews) =>
        currentReviews.filter(
          (review) =>
            !selectedReviewIds.includes(review.id)
        )
      );

      setSelectedReviewIds([]);

    } catch (error) {
      console.error(
        "BULK DELETE REVIEWS ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting selected reviews."
      );
    }
  }

  async function updateSelectedReviewsStatus(
    newStatus: ReviewStatus
  ) {
    if (selectedReviewIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to mark ${selectedReviewIds.length} selected review${
        selectedReviewIds.length > 1 ? "s" : ""
      } as ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      let databaseStatus = "published";

      if (newStatus === "Pending") {
        databaseStatus = "hidden";
      }

      if (newStatus === "Rejected") {
        databaseStatus = "hidden";
      }

      const { error } = await supabase
        .from("reviews")
        .update({
          status: databaseStatus,
          moderation_status: newStatus,
        })
        .in("id", selectedReviewIds);

      if (error) {
        console.error(
          "BULK UPDATE REVIEW STATUS ERROR:",
          error
        );

        alert(
          "Failed to update selected reviews."
        );

        return;
      }

      setReviews((currentReviews) =>
        currentReviews.map((review) =>
          selectedReviewIds.includes(review.id)
            ? {
                ...review,
                status: newStatus,
              }
            : review
        )
      );

      setSelectedReviewIds([]);

    } catch (error) {
      console.error(
        "BULK UPDATE REVIEW STATUS ERROR:",
        error
      );

      alert(
        "Something went wrong while updating selected reviews."
      );
    }
  }

  function exportReviews() {
    if (filteredReviews.length === 0) {
      alert("No reviews available to export.");
      return;
    }

    const headers = [
      "Review ID",
      "Title",
      "Review",
      "User",
      "Email",
      "Product",
      "Category",
      "Rating",
      "Status",
      "Date",
      "Time",
    ];

    const escapeCSV = (value: string | number) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredReviews.map((review) => [
      review.id,
      review.title,
      review.text,
      review.user,
      review.email,
      review.product,
      review.category,
      review.rating,
      review.status,
      review.date,
      review.time,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `reviews-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /*
   * =========================================================
   * RESET FILTERS
   * =========================================================
   */
  function resetFilters() {
    setSearch("");
    setStatusFilter("All Status");
    setRatingFilter("All Ratings");
    setCategoryFilter("All Categories");
    setCurrentPage(1);
    setSelectedReviewIds([]);
  }

  /*
   * =========================================================
   * STATUS BADGE
   * =========================================================
   */

  function StatusBadge({
    status,
  }: {
    status: ReviewStatus;
  }) {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Approved
        </span>
      );
    }

    if (status === "Pending") {
      return (
        <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        Rejected
      </span>
    );
  }

  /*
   * =========================================================
   * RATING
   * =========================================================
   */

  function RatingStars({
    rating,
  }: {
    rating: number;
  }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <Star
            key={starNumber}
            className={`size-4 ${
              starNumber <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading reviews...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="mx-auto size-10 text-destructive" />

          <h2 className="mt-4 text-lg font-semibold">
            Unable to load reviews
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#2875F5] sm:text-sm">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="hover:text-blue"
              >
                Administration
              </button>

              <span>›</span>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="hover:text-foreground"
              >
                Dashboard
              </button>

              <span>›</span>

              <span className="text-foreground">
                Reviews
              </span>
            </div>

            <p className="mt-4 text-xs font-medium text-primary sm:mt-5 sm:text-sm">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">
              Reviews Management
            </h1>

            <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-base">
              Review and manage user reviews submitted across the platform.
            </p>
          </div>

          <Button
            type="button"
            className="w-full gap-2 sm:w-auto"
            onClick={exportReviews}
          >
            <Download className="size-4" />
            Export Reviews
          </Button>
        </div>

        <AdminNavigation />

        {/* =================================================
            SEARCH & FILTERS
        ================================================== */}

        <section className="mt-6 rounded-2xl border bg-white p-3 shadow-sm sm:mt-8 sm:p-4">
          <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row">

            {/* Search */}

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reviews by keyword, product or user..."
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Filters wrapper for mobile grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex lg:items-center lg:gap-3">

              {/* Status */}

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Rating */}

              <div className="relative">
                <select
                  value={ratingFilter}
                  onChange={(event) => {
                    setRatingFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Category */}

              <div className="relative col-span-2 sm:col-span-1">
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>All Categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

            </div>

            {/* Reset Filters */}

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full gap-2 hover:bg-[#f4f9ff] lg:w-auto"
              onClick={resetFilters}
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <section className="mt-5 rounded-2xl border bg-white shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">

            {/* Total */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:size-11">
                <FileText className="size-4 text-primary sm:size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-bold sm:text-2xl">
                  {totalReviews}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Total Reviews
                </p>
              </div>
            </div>

            {/* Approved */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 sm:size-11">
                <CheckCircle2 className="size-4 text-green-600 sm:size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-bold sm:text-2xl">
                  {approvedReviews}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Approved
                </p>
              </div>
            </div>

            {/* Pending */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:size-11">
                <Clock3 className="size-4 text-yellow-600 sm:size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-bold sm:text-2xl">
                  {pendingReviews}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Pending
                </p>
              </div>
            </div>

            {/* Rejected */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 sm:size-11">
                <XCircle className="size-4 text-red-600 sm:size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xl font-bold sm:text-2xl">
                  {rejectedReviews}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Rejected
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================
            REVIEWS TABLE
        ================================================== */}

        <section className="mt-5 rounded-2xl border bg-white shadow-sm">

          {/* =================================================
              BULK ACTIONS
          ================================================== */}

          {selectedReviewIds.length > 0 && (
            <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium sm:text-sm">
                  {selectedReviewIds.length} review
                  {selectedReviewIds.length > 1 ? "s" : ""} selected
                </span>

                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-[#f4f9ff] hover:text-foreground"
                  onClick={() => setSelectedReviewIds([])}
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap gap-2">

                {/* Approve */}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-[#f4f9ff]"
                  onClick={() =>
                    updateSelectedReviewsStatus("Approved")
                  }
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>

                {/* Pending */}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-[#f4f9ff]"
                  onClick={() =>
                    updateSelectedReviewsStatus("Pending")
                  }
                >
                  <Clock3 className="size-4" />
                  Pending
                </Button>

                {/* Reject */}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 hover:text-red-700"
                  onClick={() =>
                    updateSelectedReviewsStatus("Rejected")
                  }
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>

                {/* Delete Review */}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 hover:text-red-700"
                  onClick={deleteSelectedReviews}
                >
                  <Trash2 className="size-4" />
                  Delete Review
                </Button>

              </div>
            </div>
          )}

          {/* Desktop Table */}

          <div className="hidden md:block">
            <table className="w-full min-w-[1100px] border-collapse">

              <thead>
                <tr className="border-b bg-[#f4f9ff] text-left">
                  <th className="w-12 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={
                        visibleReviews.length > 0 &&
                        visibleReviews.every((review) =>
                          selectedReviewIds.includes(review.id)
                        )
                      }
                      onChange={toggleSelectAllVisible}
                      className="size-4 rounded border accent-primary"
                    />
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Review
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    User
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Product
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Rating
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Date
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="relative border-b last:border-b-0 transition-colors hover:bg-muted/20"
                  >

                    {/* Checkbox */}

                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviewIds.includes(
                          review.id
                        )}
                        onChange={() =>
                          toggleReviewSelection(review.id)
                        }
                        className="size-4 rounded border accent-primary"
                      />
                    </td>

                    {/* Review */}

                    <td className="max-w-[280px] px-4 py-4">
                      <p className="truncate text-sm font-semibold">
                        {review.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {review.text}
                      </p>
                    </td>

                    {/* User */}

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 overflow-hidden items-center justify-center rounded-full border">
                          {review.avatar ? (
                            <img
                              src={review.avatar}
                              alt={`${review.user}'s profile`}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div
                              className={`flex size-full items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                                review.user
                              )}`}
                            >
                              {review.user
                                .trim()
                                .charAt(0)
                                .toUpperCase() || "U"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {review.user}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {review.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Product */}

                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">
                        {review.product}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.category}
                      </p>
                    </td>

                    {/* Rating */}

                    <td className="px-4 py-4">
                      <RatingStars rating={review.rating} />
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4">
                      <StatusBadge status={review.status} />
                    </td>

                    {/* Date */}

                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="text-sm">
                        {review.date}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.time}
                      </p>
                    </td>

                    {/* Actions */}

                    <td className="relative px-4 py-4">
                      <div className="flex items-center gap-2">

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 hover:bg-[#f4f9ff]"
                          onClick={() =>
                            setSelectedReview(review)
                          }
                        >
                          <Eye className="size-3.5" />
                          View
                        </Button>

                        <div
                          className="relative"
                          data-moderation-menu
                        >
                          <Button
                            ref={(element) => {
                              moderateButtonRefs.current[review.id] =
                                element;
                            }}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 hover:bg-[#f4f9ff]"
                            onClick={() => {
                              const button =
                                moderateButtonRefs.current[review.id];

                              if (!button) {
                                return;
                              }

                              const rect =
                                button.getBoundingClientRect();

                              const menuHeight = 150;
                              const gap = 8;
                              const padding = 12;

                              let left = rect.right + gap;
                              let top = rect.bottom + gap;

                              if (
                                top + menuHeight >
                                window.innerHeight - padding
                              ) {
                                top = rect.top - menuHeight - gap;
                              }

                              if (top < padding) {
                                top = padding;
                              }

                              setModerateMenuPosition({
                                top,
                                left,
                              });

                              setModeratingReviewId(
                                moderatingReviewId === review.id
                                  ? null
                                  : review.id
                              );
                            }}
                          >
                            Moderate
                            <ChevronDown className="size-3.5" />
                          </Button>

                          {moderatingReviewId === review.id && (
                            <div
                              data-moderation-menu
                              className="fixed z-[9999] w-40 rounded-lg border border-[#dcecfb] bg-white p-1 shadow-lg"
                              style={{
                                top: `${moderateMenuPosition.top}px`,
                                left: `${moderateMenuPosition.left}px`,
                              }}
                            >
                              <button
                                type="button"
                                className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                                onClick={() =>
                                  updateReviewStatus(
                                    review.id,
                                    "Approved"
                                  )
                                }
                              >
                                ✓ Approve
                              </button>

                              <button
                                type="button"
                                className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                                onClick={() =>
                                  updateReviewStatus(
                                    review.id,
                                    "Pending"
                                  )
                                }
                              >
                                ◷ Pending
                              </button>

                              <button
                                type="button"
                                className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  updateReviewStatus(
                                    review.id,
                                    "Rejected"
                                  )
                                }
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* =================================================
              MOBILE REVIEW CARDS
          ================================================== */}

          <div className="divide-y md:hidden">

            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedReviewIds.includes(
                        review.id
                      )}
                      onChange={() =>
                        toggleReviewSelection(review.id)
                      }
                      className="size-4 shrink-0 rounded border accent-primary mt-1"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {review.title}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground truncate">
                        {review.text}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={review.status} />

                </div>

                <div className="mt-3 flex items-center gap-3">

                  <div className="flex size-9 shrink-0 overflow-hidden items-center justify-center rounded-full border">
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={`${review.user}'s profile`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex size-full items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                          review.user
                        )}`}
                      >
                        {review.user
                          .trim()
                          .charAt(0)
                          .toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {review.user}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {review.email}
                    </p>
                  </div>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:text-sm">

                  <div>
                    <p className="text-xs text-gray-500">
                      Product
                    </p>

                    <p className="mt-0.5 font-medium truncate">
                      {review.product}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Rating
                    </p>

                    <div className="mt-0.5">
                      <RatingStars
                        rating={review.rating}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Category
                    </p>

                    <p className="mt-0.5 font-medium truncate">
                      {review.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date
                    </p>

                    <p className="mt-0.5 font-medium truncate">
                      {review.date}
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 hover:bg-[#f4f9ff]"
                    onClick={() =>
                      setSelectedReview(review)
                    }
                  >
                    <Eye className="size-4" />
                    View
                  </Button>

                  <div
                    className="relative flex-1"
                    data-moderation-menu
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 hover:bg-[#f4f9ff]"
                      disabled={
                        moderatingReviewId === review.id
                      }
                      onClick={() =>
                        setModeratingReviewId(
                          moderatingReviewId === review.id
                            ? null
                            : review.id
                        )
                      }
                    >
                      Moderate
                      <ChevronDown className="size-4" />
                    </Button>

                    {moderatingReviewId === review.id && (
                      <div className="absolute bottom-full left-0 z-[9999] mb-2 w-40 rounded-lg border border-[#dcecfb] bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-200 active:bg-gray-200 focus:bg-gray-200"
                          onClick={() =>
                            updateReviewStatus(
                              review.id,
                              "Approved"
                            )
                          }
                        >
                          ✓ Approve
                        </button>

                        <button
                          type="button"
                          className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-200 active:bg-gray-200 focus:bg-gray-200"
                          onClick={() =>
                            updateReviewStatus(
                              review.id,
                              "Pending"
                            )
                          }
                        >
                          ◷ Pending
                        </button>

                        <button
                          type="button"
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-100 active:bg-red-100 focus:bg-red-100"
                          onClick={() =>
                            updateReviewStatus(
                              review.id,
                              "Rejected"
                            )
                          }
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ))}

          </div>

          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {visibleReviews.length === 0 && (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground/50" />

              <h3 className="mt-4 text-sm font-semibold">
                No reviews found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 hover:bg-[#f4f9ff]"
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* =================================================
              FOOTER / PAGINATION
          ================================================== */}

          <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">

            <p className="text-xs text-muted-foreground sm:text-sm">
              Showing{" "}
              <span className="font-medium text-foreground">
                {visibleReviews.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredReviews.length}
              </span>{" "}
              reviews
            </p>

            <div className="flex items-center gap-2">

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:bg-[#f4f9ff]"
                disabled={safeCurrentPage <= 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                Previous
              </Button>

              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
                {safeCurrentPage}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hover:bg-[#f4f9ff]"
                disabled={
                  safeCurrentPage >= totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                  )
                }
              >
                Next
              </Button>

            </div>
          </div>

        </section>

      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#dcecfb] bg-white p-5 text-gray-900 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Review Details
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                  {selectedReview.title}
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReview(null)}
              >
                <XCircle className="size-4" />
              </Button>
            </div>

            {/* User */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#dcecfb] bg-white p-3.5 sm:p-4">
              <div className="flex size-10 shrink-0 overflow-hidden items-center justify-center rounded-full border bg-primary/10 font-semibold text-primary sm:size-11">
                {selectedReview.avatar ? (
                  <img
                    src={selectedReview.avatar}
                    alt={selectedReview.user}
                    className="size-full object-cover"
                  />
                ) : (
                  selectedReview.user
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {selectedReview.user}
                </p>

                {selectedReview.email && (
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {selectedReview.email}
                  </p>
                )}
              </div>
            </div>

            {/* Review Content */}
            <div className="mt-4 sm:mt-5">
              <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                Review
              </p>

              <div className="mt-1.5 rounded-xl border border-[#dcecfb] bg-white p-3.5 sm:p-4">
                <p className="text-xs leading-5 text-gray-900 sm:text-sm sm:leading-6">
                  {selectedReview.text}
                </p>
              </div>
            </div>

            {/* Information */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-4 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500">
                  Product
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-900 sm:text-sm">
                  {selectedReview.product}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-900 sm:text-sm">
                  {selectedReview.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Rating
                </p>

                <div className="mt-1">
                  <RatingStars rating={selectedReview.rating} />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge status={selectedReview.status} />
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 border-t border-[#dcecfb] pt-3.5 sm:mt-5 sm:pt-4">
              <p className="text-xs text-gray-500">
                Submitted
              </p>

              <p className="mt-1 text-xs text-gray-900 sm:text-sm">
                {selectedReview.date} at {selectedReview.time}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-end">

              {/* Open Review */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#f4f9ff]"
                onClick={() =>
                  navigate(`/review/${selectedReview.id}`)
                }
              >
                <Eye className="size-4" />
                Open Review
              </Button>

              {/* Close */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#f4f9ff]"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </Button>

              {/* Approve */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#f4f9ff]"
                onClick={() =>
                  updateReviewStatus(
                    selectedReview.id,
                    "Approved"
                  )
                }
              >
                <CheckCircle2 className="size-4" />
                Approve
              </Button>

              {/* Pending */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-[#f4f9ff]"
                onClick={() =>
                  updateReviewStatus(
                    selectedReview.id,
                    "Pending"
                  )
                }
              >
                <Clock3 className="size-4" />
                Pending
              </Button>

              {/* Reject */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
                onClick={() =>
                  updateReviewStatus(
                    selectedReview.id,
                    "Rejected"
                  )
                }
              >
                <XCircle className="size-4" />
                Reject
              </Button>

              {/* Delete */}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
                onClick={() =>
                  deleteReview(selectedReview.id)
                }
              >
                <Trash2 className="size-4" />
                Delete Review
              </Button>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminReviews;