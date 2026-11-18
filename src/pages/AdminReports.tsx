import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileWarning,
  Search,
  XCircle,
  EyeOff,
  Trash2,
  BellRing,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AdminNavigation from "../components/AdminNavigation";

import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { supabase } from "../lib/supabase";

import { toast } from "sonner";

import { createPortal } from "react-dom";

import { getAvatarColor } from "@/lib/avatar";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type ReportStatus =
  | "Pending"
  | "Resolved"
  | "Dismissed";


type Report = {
  id: string;
  review_id: string;
  user_id: string;
  reason: string;
  created_at: string;

  warningId: string | null;

  status: ReportStatus;

  reporter: string;
  reporterEmail: string;
  reporterAvatar: string | null;

  reportedUser: string;
  reportedUserEmail: string;
  reportedUserAvatar: string | null;

  reportedUserId: string | null;

  review: string;
  category: string;

  reviewStatus: string | null;
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDate(date: string) {
  const value = new Date(date);

  return {
    date: value.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),

    time: value.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function ReportUserAvatar({
  avatarUrl,
  username,
}: {
  avatarUrl: string | null;
  username: string;
}) {
  const [imageError, setImageError] =
    useState(false);

  const showImage =
    Boolean(avatarUrl) && !imageError;

  if (showImage) {
    return (
      <img
        src={avatarUrl!}
        alt={username}
        onError={() => setImageError(true)}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
        username || "User"
      )}`}
    >
      {(username || "U")
        .trim()
        .charAt(0)
        .toUpperCase() || "U"}
    </div>
  );
}

/*
 * =========================================================
 * ADMIN REPORTS
 * =========================================================
 */

function AdminReports() {
  const navigate = useNavigate();

  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [reports, setReports] =
    useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");



  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openActionMenu, setOpenActionMenu] =
    useState<string | null>(null);

  const [selectedReportIds, setSelectedReportIds] =
    useState<string[]>([]);

  const [deletingReports, setDeletingReports] =
    useState(false);

  const reportsPerPage = 6;


  /*
   * =======================================================
   * LOAD REPORTS
   * =======================================================
   */

  async function loadReports() {
    try {
      setLoading(true);

      const {
        data: reportData,
        error: reportError,
      } = await supabase
        .from("review_reports")
        .select(
          "id, review_id, user_id, reason, created_at, status"
        )
        .order("created_at", {
          ascending: false,
        });

      if (reportError) {
        throw reportError;
      }

      const rawReports =
        reportData ?? [];

      if (
        rawReports.length === 0
      ) {
        setReports([]);
        return;
      }

      const reviewIds =
        Array.from(
          new Set(
            rawReports
              .map(
                (report) =>
                  report.review_id
              )
              .filter(Boolean)
          )
        );

      const reporterIds =
        Array.from(
          new Set(
            rawReports
              .map(
                (report) =>
                  report.user_id
              )
              .filter(Boolean)
          )
        );

      let reviewRows: Array<{
        id: string;
        subject: string | null;
        title: string | null;
        category: string | null;
        user_id: string | null;
        status: string | null;
      }> = [];

      if (
        reviewIds.length > 0
      ) {
        const {
          data,
          error,
        } = await supabase
          .from("reviews")
          .select(
            "id, subject, title, category, user_id, status"
          )
          .in(
            "id",
            reviewIds
          );

        if (error) {
          throw error;
        }

        reviewRows =
          data ?? [];
      }

      const reportedUserIds =
        Array.from(
          new Set(
            reviewRows
              .map(
                (review) =>
                  review.user_id
              )
              .filter(
                Boolean
              ) as string[]
          )
        );

      const profileIds =
        Array.from(
          new Set([
            ...reporterIds,
            ...reportedUserIds,
          ])
        );

      let profileRows: Array<{
        id: string;
        username: string | null;
        avatar_url: string | null;
        contact_email: string | null;
      }> = [];

      if (
        profileIds.length > 0
      ) {
        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, avatar_url, contact_email"
          )
          .in(
            "id",
            profileIds
          );

        if (error) {
          throw error;
        }

        profileRows =
          data ?? [];
      }

      let warningRows: Array<{
        id: string;
        report_id: string | null;
      }> = [];

      const reportIds =
        rawReports.map(
          (report) => report.id
        );

      if (reportIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("user_warnings")
          .select(
            "id, report_id"
          )
          .in(
            "report_id",
            reportIds
          );

        if (error) {
          throw error;
        }

        warningRows =
          data ?? [];
      }

      const reviewMap =
        new Map(
          reviewRows.map(
            (review) => [
              review.id,
              review,
            ]
          )
        );

      const profileMap =
        new Map(
          profileRows.map(
            (profile) => [
              profile.id,
              profile,
            ]
          )
        );

      const warningMap =
        new Map(
          warningRows.map(
            (warning) => [
              warning.report_id,
              warning,
            ]
          )
        );

      const formattedReports: Report[] =
        rawReports.map(
          (report) => {
            const review =
              reviewMap.get(
                report.review_id
              );

            const reporter =
              profileMap.get(
                report.user_id
              );

            const reportedUser =
              review?.user_id
                ? profileMap.get(
                    review.user_id
                  )
                : undefined;

            const warning =
              warningMap.get(
                report.id
              );

            const statusValue =
              report.status;

            const status: ReportStatus =
              statusValue === "Resolved"
                ? "Resolved"
                : statusValue === "Dismissed"
                  ? "Dismissed"
                  : "Pending";

            return {
              id:
                report.id,

              review_id:
                report.review_id,

              user_id:
                report.user_id,

              reason:
                report.reason,

              created_at:
                report.created_at,

              status,

              warningId:
                warning?.id ??
                null,

              reporter:
                reporter?.username ||
                "Unknown user",

              reporterEmail:
                reporter?.contact_email ||
                "—",

              reporterAvatar:
                reporter?.avatar_url ||
                null,

              reportedUser:
                reportedUser?.username ||
                "Unknown user",

              reportedUserEmail:
                reportedUser?.contact_email ||
                "—",

              reportedUserAvatar:
                reportedUser?.avatar_url ||
                null,

              reportedUserId:
                review?.user_id ??
                null,

              review:
                review?.title ||
                review?.subject ||
                "Reported review",

              category:
                review?.category ||
                "—",

              reviewStatus:
                review?.status ??
                null,
            };
          }
        );

      setReports(
        formattedReports
      );
    } catch (error) {
      console.error(
        "ADMIN REPORTS LOAD ERROR:",
        error
      );

      toast.error(
        "Could not load reports."
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  }


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {
    loadReports();
  }, []);


  /*
   * =======================================================
   * REALTIME
   * =======================================================
   */

  useEffect(() => {
    const reportsChannel =
      supabase
        .channel(
          "admin-reports-sync"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "review_reports",
          },
          () => {
            loadReports();
          }
        )
        .subscribe();

    const reviewsChannel =
      supabase
        .channel(
          "admin-review-actions-sync"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reviews",
          },
          () => {
            loadReports();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        reportsChannel
      );

      supabase.removeChannel(
        reviewsChannel
      );
    };
  }, []);


  /*
   * =======================================================
   * UPDATE REPORT STATUS
   * =======================================================
   */
  async function updateReportStatus(
    reportId: string,
    nextStatus: ReportStatus
  ) {
    if (actionLoading) {
      return;
    }

    setActionLoading(reportId);
    setOpenActionMenu(null);

    try {
      const {
        data: updatedReport,
        error,
      } = await supabase
        .from("review_reports")
        .update({
          status: nextStatus,
        })
        .eq("id", reportId)
        .select("id, status")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!updatedReport) {
        throw new Error(
          "Report was not updated. Check admin RLS permissions."
        );
      }

      setReports((previous) =>
        previous.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status:
                  updatedReport.status as ReportStatus,
              }
            : report
        )
      );

      toast.success(
        nextStatus === "Resolved"
          ? "Report resolved."
          : "Report dismissed."
      );

      await loadReports();
    } catch (error) {
      console.error(
        "UPDATE REPORT STATUS ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update report status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * =======================================================
   * HIDE REVIEW
   * =======================================================
   */
  async function handleHideReview(report: Report) {
    if (
      actionLoading ||
      !report.review_id
    ) {
      return;
    }

    const isHidden =
      report.reviewStatus === "hidden";

    const confirmed = window.confirm(
      isHidden
        ? `Show the review "${report.review}" again?`
        : `Hide the review "${report.review}"?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(report.id);
    setOpenActionMenu(null);

    try {
      const {
        data: updatedReview,
        error,
      } = await supabase
        .from("reviews")
        .update({
          status: isHidden
            ? "published"
            : "hidden",
        })
        .eq("id", report.review_id)
        .select("id, status")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!updatedReview) {
        throw new Error(
          "Review was not updated. Check admin RLS permissions."
        );
      }

      setReports((previous) =>
        previous.map((item) =>
          item.id === report.id
            ? {
                ...item,
                reviewStatus: isHidden
                  ? "published"
                  : "hidden",
              }
            : item
        )
      );

      toast.success(
        isHidden
          ? "Review is visible again."
          : "Review hidden."
      );

      await loadReports();
    } catch (error) {
      console.error(
        "TOGGLE REVIEW VISIBILITY ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not change review visibility."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * =======================================================
   * WARN USER
   * =======================================================
   */
  async function getReportedUserId(
    report: Report
  ): Promise<string | null> {
    if (report.reportedUserId) {
      return report.reportedUserId;
    }

    if (!report.review_id) {
      return null;
    }

    const {
      data,
      error,
    } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", report.review_id)
      .maybeSingle();

    if (error) {
      console.error(
        "GET REPORTED USER ERROR:",
        error
      );

      return null;
    }

    return data?.user_id ?? null;
  }

  async function handleWarnUser(report: Report) {
    if (actionLoading) {
      return;
    }

    const reportedUserId =
      await getReportedUserId(report);

    if (!reportedUserId) {
      toast.error(
        "Reported user could not be identified."
      );
      return;
    }

    const existingWarning =
      report.warningId;

    const confirmed =
      window.confirm(
        existingWarning
          ? `Remove the warning from ${report.reportedUser}?`
          : `Send a warning to ${report.reportedUser}?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(report.id);
    setOpenActionMenu(null);

    try {
      if (existingWarning) {
        const { error: warningDeleteError } =
          await supabase
            .from("user_warnings")
            .delete()
            .eq("id", existingWarning);

        if (warningDeleteError) {
          throw warningDeleteError;
        }

        const { error: removalNotificationError } =
          await supabase
            .from("notifications")
            .insert({
              user_id: reportedUserId,
              type: "warning_removed",
              message:
                "The warning regarding your review has been removed.",
              review_id: report.review_id,
              comment_id: null,
              reply_id: null,
              is_read: false,
            });

        if (removalNotificationError) {
          console.error(
            "WARNING REMOVAL NOTIFICATION ERROR:",
            removalNotificationError
          );
        }

        toast.success(
          `Warning removed from ${report.reportedUser}.`
        );

        await loadReports();

        return;
      }

      const { data: newWarning, error: warningError } =
        await supabase
          .from("user_warnings")
          .insert({
            user_id: reportedUserId,
            report_id: report.id,
            reason:
              `Warning issued for reported review: ${report.reason}`,
          })
          .select("id")
          .maybeSingle();

      if (warningError) {
        throw warningError;
      }

      if (!newWarning) {
        throw new Error(
          "Warning was not created."
        );
      }

      const { error: notificationError } =
        await supabase
          .from("notifications")
          .insert({
            user_id: reportedUserId,
            type: "warning",
            message:
              `You have received a warning regarding your review: ${report.reason}`,
            review_id: report.review_id,
            comment_id: null,
            reply_id: null,
            is_read: false,
          });

      if (notificationError) {
        toast.error(
          `Notification failed: ${notificationError.message}`
        );
      } else {
        toast.success(
          `Warning sent to ${report.reportedUser}.`
        );
      }

      await loadReports();
    } catch (error) {
      console.error(
        "WARN USER ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update warning."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * =======================================================
   * DELETE REVIEW
   * =======================================================
   */
  async function handleDeleteReview(report: Report) {
    if (actionLoading || !report.review_id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this review permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(report.id);
    setOpenActionMenu(null);

    try {
      const { data: deletedReview, error } =
        await supabase
          .from("reviews")
          .delete()
          .eq("id", report.review_id)
          .select("id")
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (!deletedReview) {
        throw new Error(
          "Review was not deleted. Check admin RLS policy."
        );
      }

      setReports((previous) =>
        previous.filter(
          (item) => item.id !== report.id
        )
      );

      toast.success(
        "Review permanently deleted."
      );

      const { error: resolveError } = await supabase
        .from("review_reports")
        .update({
          status: "Resolved",
        })
        .eq("id", report.id);

      if (resolveError) {
        console.error(
          "REPORT RESOLVE AFTER DELETE ERROR:",
          resolveError
        );
      }
    } catch (error) {
      console.error(
        "DELETE REVIEW ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not permanently delete review."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /*
   * =======================================================
   * VIEW REPORTED REVIEW
   * =======================================================
   */
  function handleViewReport(
    report: Report
  ) {
    if (
      !report.review_id
    ) {
      return;
    }

    setOpenActionMenu(
      null
    );

    navigate(
      `/review/${report.review_id}`
    );
  }

  /*
   * =======================================================
   * RESOLVE
   * =======================================================
   */
  async function handleResolveReport(
    report: Report
  ) {
    if (actionLoading) {
      return;
    }

    const isResolved =
      report.status === "Resolved";

    const confirmed =
      window.confirm(
        isResolved
          ? "Reopen this resolved report?"
          : "Mark this report as Resolved?"
      );

    if (!confirmed) {
      return;
    }

    await updateReportStatus(
      report.id,
      isResolved
        ? "Pending"
        : "Resolved"
    );
  }

  /*
   * =======================================================
   * DISMISS
   * =======================================================
   */
  async function handleDismissReport(
    report: Report
  ) {
    if (actionLoading) {
      return;
    }

    const isDismissed =
      report.status === "Dismissed";

    const confirmed =
      window.confirm(
        isDismissed
          ? "Reopen this dismissed report?"
          : "Dismiss this report without taking moderation action?"
      );

    if (!confirmed) {
      return;
    }

    await updateReportStatus(
      report.id,
      isDismissed
        ? "Pending"
        : "Dismissed"
    );
  }

  /*
   * =======================================================
   * FILTERING
   * =======================================================
   */
  const filteredReports =
    useMemo(() => {
      return reports.filter(
        (report) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchText ||
            report.reason
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.reporter
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.reportedUser
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.review
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.category
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            report.status ===
              statusFilter;

          const matchesCategory =
            categoryFilter ===
              "All Categories" ||
            report.reason ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      reports,
      search,
      statusFilter,
      categoryFilter,
    ]);

  /*
   * =======================================================
   * STATISTICS
   * =======================================================
   */
  const totalReports =
    reports.length;

  const pendingReports =
    reports.filter(
      (report) =>
        report.status ===
        "Pending"
    ).length;

  const resolvedReports =
    reports.filter(
      (report) =>
        report.status ===
        "Resolved"
    ).length;

  const dismissedReports =
    reports.filter(
      (report) =>
        report.status ===
        "Dismissed"
    ).length;

  /*
   * =======================================================
   * PAGINATION
   * =======================================================
   */
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredReports.length /
          reportsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    reportsPerPage;

  const visibleReports =
    filteredReports.slice(
      startIndex,
      startIndex +
        reportsPerPage
    );

  /*
   * =======================================================
   * SELECT REPORTS
   * =======================================================
   */
  function toggleReportSelection(
    reportId: string
  ) {
    setSelectedReportIds((previous) =>
      previous.includes(reportId)
        ? previous.filter(
            (id) => id !== reportId
          )
        : [...previous, reportId]
    );
  }

  function toggleSelectAll() {
    if (
      visibleReports.length > 0 &&
      visibleReports.every((report) =>
        selectedReportIds.includes(
          report.id
        )
      )
    ) {
      setSelectedReportIds((previous) =>
        previous.filter(
          (id) =>
            !visibleReports.some(
              (report) =>
                report.id === id
            )
        )
      );
    } else {
      setSelectedReportIds((previous) => [
        ...new Set([
          ...previous,
          ...visibleReports.map(
            (report) => report.id
          ),
        ]),
      ]);
    }
  }

  const allVisibleReportsSelected =
    visibleReports.length > 0 &&
    visibleReports.every((report) =>
      selectedReportIds.includes(
        report.id
      )
    );

  /*
   * =======================================================
   * DELETE SELECTED REPORTS
   * =======================================================
   */
  async function handleDeleteSelectedReports() {
    if (
      deletingReports ||
      selectedReportIds.length === 0
    ) {
      return;
    }

    const selectedCount =
      selectedReportIds.length;

    const confirmed =
      window.confirm(
        `Delete ${selectedCount} selected report${
          selectedCount > 1 ? "s" : ""
        } permanently?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingReports(true);

    try {
      const { data: deletedReports, error } = await supabase
        .from("review_reports")
        .delete()
        .in("id", selectedReportIds)
        .select("id");

      if (error) {
        throw error;
      }

      if (
        !deletedReports ||
        deletedReports.length === 0
      ) {
        throw new Error(
          "No reports were deleted. Please check the review_reports DELETE policy."
        );
      }

      setReports((previous) =>
        previous.filter(
          (report) =>
            !selectedReportIds.includes(
              report.id
            )
        )
      );

      setSelectedReportIds([]);
      setOpenActionMenu(null);

      toast.success(
        `${selectedCount} report${
          selectedCount > 1 ? "s" : ""
        } deleted successfully.`
      );
    } catch (error) {
      console.error(
        "DELETE REPORTS ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete selected reports."
      );
    } finally {
      setDeletingReports(false);
    }
  }

  /*
   * =======================================================
   * RESET FILTERS
   * =======================================================
   */
  function resetFilters() {
    setSearch("");
    setStatusFilter(
      "All Status"
    );

    setCategoryFilter(
      "All Categories"
    );
    setCurrentPage(1);
  }

  /*
   * =======================================================
   * STATUS BADGE
   * =======================================================
   */
  function StatusBadge({
    status,
  }: {
    status: ReportStatus;
  }) {
    if (
      status ===
      "Pending"
    ) {
      return (
        <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
          Pending
        </span>
      );
    }

    if (
      status ===
      "Resolved"
    ) {
      return (
        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Resolved
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md border border-muted bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        Dismissed
      </span>
    );
  }

  /*
   * =======================================================
   * TAKE ACTION MENU
   * =======================================================
   */
  function ActionMenu({
    report,
    mobile = false,
  }: {
    report: Report;
    mobile?: boolean;
  }) {
    const busy = actionLoading === report.id;
    const menuOpen = openActionMenu === report.id;

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [menuPosition, setMenuPosition] = useState({
      top: 0,
      left: 0,
    });

    const [isViewportMobile, setIsViewportMobile] =
      useState(() =>
        typeof window !== "undefined"
          ? window.innerWidth < 768
          : false
      );

    useEffect(() => {
      function handleViewportResize() {
        setIsViewportMobile(
          window.innerWidth < 768
        );
      }

      window.addEventListener(
        "resize",
        handleViewportResize
      );

      return () => {
        window.removeEventListener(
          "resize",
          handleViewportResize
        );
      };
    }, []);

    const isActiveInstance =
      mobile === isViewportMobile;

    useEffect(() => {
      if (!menuOpen) {
        return;
      }

      function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;

        const clickedButton =
          buttonRef.current?.contains(target);

        const clickedMenu =
          menuRef.current?.contains(target);

        const clickedAnyActionMenu =
          target instanceof Element &&
          !!target.closest(
            "[data-admin-action-menu]"
          );

        if (
          !clickedButton &&
          !clickedMenu &&
          !clickedAnyActionMenu
        ) {
          setOpenActionMenu(null);
        }
      }

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
      };
    }, [menuOpen]);

    function updateMenuPosition() {
      if (!buttonRef.current) {
        return;
      }

      if (
        buttonRef.current.offsetParent === null
      ) {
        return;
      }

      const rect =
        buttonRef.current.getBoundingClientRect();

      const menuWidth = 200;
      const gap = 8;
      const padding = 12;

      let left =
        rect.right + gap;

      let top =
        rect.top;

      if (
        left + menuWidth >
        window.innerWidth - padding
      ) {
        left =
          window.innerWidth -
          menuWidth -
          padding;
      }

      if (left < padding) {
        left = padding;
      }

      const menuHeight = 360;

      if (
        top + menuHeight >
        window.innerHeight - padding
      ) {
        top =
          window.innerHeight -
          menuHeight -
          padding;
      }

      if (top < padding) {
        top = padding;
      }

      setMenuPosition({
        top,
        left,
      });
    }

    useEffect(() => {
      if (!menuOpen) {
        return;
      }

      updateMenuPosition();

      function handleResize() {
        updateMenuPosition();
      }

      function handleScroll() {
        updateMenuPosition();
      }

      window.addEventListener(
        "resize",
        handleResize
      );

      window.addEventListener(
        "scroll",
        handleScroll,
        true
      );

      return () => {
        window.removeEventListener(
          "resize",
          handleResize
        );

        window.removeEventListener(
          "scroll",
          handleScroll,
          true
        );
      };
    }, [menuOpen]);

    return (
      <>
        {/* TAKE ACTION BUTTON */}
        {isActiveInstance && (
          <Button
            ref={buttonRef}
            type="button"
            data-admin-action-menu
            variant="outline"
            size="sm"
            disabled={busy}
            className="gap-1.5 whitespace-nowrap hover:bg-[#f4f9ff]"
            onMouseDown={(event) => {
              event.stopPropagation();

              if (busy || !buttonRef.current) {
                return;
              }

              if (menuOpen) {
                setOpenActionMenu(null);
                return;
              }

              updateMenuPosition();
              setOpenActionMenu(report.id);
            }}
          >
            {busy ? (
              "Updating..."
            ) : (
              <>
                Take Action
                <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        )}

        {/* DROPDOWN */}
        {isActiveInstance &&
          menuOpen &&
          buttonRef.current &&
          createPortal(
            <div
              ref={menuRef}
              data-admin-action-menu
              className="fixed z-[9999] w-44 overflow-hidden rounded-xl border border-border bg-white p-1.5 text-foreground shadow-2xl"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {/* VIEW */}
              <button
                type="button"
                onClick={() =>
                  handleViewReport(report)
                }
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f4f9ff]"
              >
                <Eye className="size-4 shrink-0" />
                <span>View</span>
              </button>

              <div className="my-1 border-t" />

              {/* HIDE REVIEW */}
              <button
                type="button"
                onClick={() =>
                  handleHideReview(report)
                }
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f4f9ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <EyeOff className="size-4 shrink-0" />
                <span>
                  {report.reviewStatus === "hidden"
                    ? "Show Review"
                    : "Hide Review"}
                </span>
              </button>

              {/* WARN USER */}
              <button
                type="button"
                onClick={() =>
                  handleWarnUser(report)
                }
                disabled={
                  busy ||
                  !report.reportedUserId
                }
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f4f9ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <BellRing className="size-4 shrink-0" />
                <span>
                  {report.warningId
                    ? "Remove Warning"
                    : "Warn User"}
                </span>
              </button>

              {/* DELETE REVIEW */}
              <button
                type="button"
                onClick={() =>
                  handleDeleteReview(report)
                }
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4 shrink-0" />
                <span>Delete Review</span>
              </button>

              <div className="my-1 border-t" />

              {/* RESOLVE */}
              <button
                type="button"
                onClick={() =>
                  handleResolveReport(report)
                }
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f4f9ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                <span>
                  {report.status === "Resolved"
                    ? "Undo Resolve"
                    : "Resolve Report"}
                </span>
              </button>

              {/* DISMISS */}
              <button
                type="button"
                onClick={() =>
                  handleDismissReport(report)
                }
                disabled={busy}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f4f9ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="size-4 shrink-0 text-muted-foreground" />
                <span>
                  {report.status === "Dismissed"
                    ? "Undo Dismiss"
                    : "Dismiss Report"}
                </span>
              </button>
            </div>,
            document.body
          )}
      </>
    );
  }

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* =================================================
            HEADER
        ================================================== */}

        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#2875F5] sm:text-sm">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="hover:text-foreground"
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
              Reports
            </span>
          </div>

          <p className="mt-4 text-xs font-medium text-primary sm:mt-5 sm:text-sm">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">
            Reports Management
          </h1>

          <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-base">
            Review and manage reports submitted by users.
          </p>
        </div>

        <AdminNavigation />

        {/* =================================================
            SEARCH + FILTERS
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
                  setSearch(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Search reports, users or reviews..."
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* Filters wrapper for mobile grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">

              {/* Status */}

              <div className="relative">

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value
                    );

                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none"
                >
                  <option>
                    All Status
                  </option>

                  <option>
                    Pending
                  </option>

                  <option>
                    Resolved
                  </option>

                  <option>
                    Dismissed
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              </div>

              {/* Category */}

              <div className="relative">

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(event) => {
                    setCategoryFilter(
                      event.target.value
                    );

                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none"
                >
                  <option>
                    All Categories
                  </option>

                  <option>
                    Spam
                  </option>

                  <option>
                    Inappropriate Content
                  </option>

                  <option>
                    Fake / Misleading Review
                  </option>

                  <option>
                    Offensive Content
                  </option>

                  <option>
                    Irrelevant
                  </option>

                  <option>
                    Other
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              </div>

            </div>

            {/* Clear */}

            <Button
              type="button"
              variant="outline"
              className={"h-10 w-full hover:bg-[#f4f9ff] lg:w-auto"}
              onClick={
                resetFilters
              }
            >
              Clear Filters
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
                <FileWarning className="size-4 text-primary sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {totalReports}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Total Reports
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
                  {pendingReports}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Pending
                </p>

              </div>

            </div>

            {/* Resolved */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 sm:size-11">
                <CheckCircle2 className="size-4 text-green-600 sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {resolvedReports}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Resolved
                </p>

              </div>

            </div>

            {/* Dismissed */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted sm:size-11">
                <XCircle className="size-4 text-muted-foreground sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {dismissedReports}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Dismissed
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            REPORTS TABLE
        ================================================== */}

        <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">

          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <input
                  type="checkbox"
                  checked={allVisibleReportsSelected}
                  onChange={toggleSelectAll}
                  disabled={
                    visibleReports.length === 0 ||
                    deletingReports
                  }
                  className="size-4 cursor-pointer accent-primary"
                  aria-label="Select all reports"
                />

                <span className="text-xs text-muted-foreground sm:text-sm">
                  {selectedReportIds.length > 0
                    ? `${selectedReportIds.length} selected`
                    : "Select reports"}
                </span>
              </div>

              {selectedReportIds.length > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className={"hover:bg-red-100"}
                  disabled={deletingReports}
                  onClick={
                    handleDeleteSelectedReports
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />

                  {deletingReports
                    ? "Deleting..."
                    : `Delete ${
                        selectedReportIds.length
                      } Report${
                        selectedReportIds.length > 1
                          ? "s"
                          : ""
                      }`}
                </Button>
              )}
            </div>
          )}

          {/* Loading */}

          {loading && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />

              <p className="mt-4 text-sm text-muted-foreground">
                Loading reports...
              </p>

            </div>
          )}

          {!loading && (
            <>

              {/* =================================================
                  DESKTOP
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[1200px] border-collapse">

                  <thead>

                    <tr className="border-b bg-muted/20 text-left">

                      <th className="w-12 px-5 py-4"></th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Report
                      </th>

                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Reporter
                      </th>

                      <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Reported User
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

                    {visibleReports.map(
                      (report) => {
                        const formattedDate =
                          formatDate(
                            report.created_at
                          );

                        return (
                          <tr
                            key={
                              report.id
                            }
                            className="border-b last:border-b-0 hover:bg-muted/20"
                          >
                            {/* CHECKBOX */}

                            <td className="w-12 px-5 py-4">
                              <input
                                type="checkbox"
                                checked={selectedReportIds.includes(
                                  report.id
                                )}
                                onChange={() =>
                                  toggleReportSelection(
                                    report.id
                                  )
                                }
                                disabled={deletingReports}
                                className="size-4 cursor-pointer accent-primary"
                                aria-label={`Select report ${report.id}`}
                              />
                            </td>

                            {/* REPORT */}

                            <td className="max-w-[300px] px-5 py-4">

                              <p className="truncate text-sm font-semibold">
                                {
                                  report.reason
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                Report submitted by{" "}
                                {
                                  report.reporter
                                }
                              </p>

                              <p className="mt-2 truncate text-xs font-medium text-primary">
                                Review:{" "}
                                {
                                  report.review
                                }
                              </p>

                            </td>

                            {/* REPORTER */}

                            <td className="px-4 py-4">

                              <div className="flex items-center gap-3">
                                <ReportUserAvatar
                                  avatarUrl={report.reporterAvatar}
                                  username={report.reporter}
                                />

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-medium">
                                    {
                                      report.reporter
                                  }
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {
                                    report.reporterEmail
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* REPORTED USER */}

                          <td className="px-4 py-4">

                           <div className="flex items-center gap-2">

                              <ReportUserAvatar
                                avatarUrl={report.reportedUserAvatar}
                                username={report.reportedUser}
                              />

                              <span className="text-sm font-medium truncate">
                                {report.reportedUser}
                              </span>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-4">

                            <StatusBadge
                              status={
                                report.status
                              }
                            />

                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-4 py-4">

                            <p className="text-sm">
                              {
                                formattedDate.date
                              }
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                formattedDate.time
                              }
                            </p>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-4">

                            <ActionMenu
                              report={
                                report
                              }
                              mobile={false}
                            />

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE
              ================================================== */}

            <div className="divide-y md:hidden">

              {visibleReports.map(
                (report) => {
                  const formattedDate =
                    formatDate(
                      report.created_at
                    );

                  return (
                    <div
                      key={
                        report.id
                      }
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedReportIds.includes(
                              report.id
                            )}
                            onChange={() =>
                              toggleReportSelection(
                                report.id
                              )
                            }
                            disabled={deletingReports}
                          className="size-4 shrink-0 cursor-pointer accent-primary"
                          aria-label={`Select report ${report.id}`}
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {
                              report.reason
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            Report submitted by {report.reporter}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={
                          report.status
                        }
                      />

                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:text-sm">

                    <div>

                      <p className="text-muted-foreground">
                        Reporter
                      </p>

                      <p className="mt-0.5 font-medium truncate">
                        {
                          report.reporter
                      }
                      </p>

                    </div>

                    <div>

                      <p className="text-muted-foreground">
                        Reported User
                      </p>

                      <p className="mt-0.5 font-medium truncate">
                        {
                          report.reportedUser
                      }
                      </p>

                    </div>

                    <div>

                      <p className="text-muted-foreground">
                        Date
                      </p>

                      <p className="mt-0.5 font-medium">
                        {
                          formattedDate.date
                      }
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 rounded-lg bg-muted/40 p-3">

                    <p className="text-xs text-muted-foreground">
                      Reported Review
                    </p>

                    <p className="mt-1 text-xs font-medium sm:text-sm truncate">
                      {
                        report.review
                      }
                    </p>

                  </div>

                  <div className="mt-3.5 flex items-center justify-end">
                    <ActionMenu
                      report={report}
                      mobile={true}
                    />
                  </div>

                </div>
              );
              })}

            </div>

            {/* =================================================
                EMPTY
              ================================================== */}

            {visibleReports.length ===
              0 && (
              <div className="px-6 py-16 text-center">

                <AlertTriangle className="mx-auto size-10 text-muted-foreground/50" />

                <h3 className="mt-4 text-sm font-semibold">
                  No reports found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or filters.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 hover:bg-[#f4f9ff]"
                  onClick={
                    resetFilters
                  }
                >
                  Clear Filters
                </Button>

              </div>
            )}

            {/* =================================================
                PAGINATION
              ================================================== */}

            <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">

              <p className="text-xs text-muted-foreground sm:text-sm">

                Showing{" "}

                <span className="font-medium text-foreground">
                  {
                    visibleReports.length
                  }
                </span>

                {" "}of{" "}

                <span className="font-medium text-foreground">
                  {
                    filteredReports.length
                  }
                </span>

                {" "}reports

              </p>

              <div className="flex items-center gap-2">

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={
                    safeCurrentPage <=
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  Previous
                </Button>

                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
                  {
                    safeCurrentPage
                  }
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={
                    safeCurrentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
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

          </>

        )}

        </section>

      </div>
      
      <Footer />
  </div>
  );
}

export default AdminReports;