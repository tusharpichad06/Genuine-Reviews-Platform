import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import AdminNavigation from "../components/AdminNavigation";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";


type DashboardStats = {
  totalReviews: number;
  pendingReviews: number;

  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;

  totalUsers: number;

  approvedReviews: number;
  rejectedReviews: number;
};

const initialStats: DashboardStats = {
  totalReviews: 0,
  pendingReviews: 0,

  totalReports: 0,
  pendingReports: 0,
  resolvedReports: 0,
  dismissedReports: 0,

  totalUsers: 0,

  approvedReviews: 0,
  rejectedReviews: 0,
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [statsData, setStatsData] =
    useState<DashboardStats>(initialStats);

  const [loading, setLoading] =
    useState(true);

  async function loadDashboardStats() {
    try {
      setLoading(true);

      const [
        reviewsRes,
        reportsRes,
        usersRes,
      ] = await Promise.all([
        supabase
          .from("reviews")
          .select("status, moderation_status"),

        supabase
          .from("review_reports")
          .select("status"),

        supabase
          .from("profiles")
          .select("id"),
      ]);

      if (reviewsRes.error) {
        throw reviewsRes.error;
      }

      if (reportsRes.error) {
        throw reportsRes.error;
      }

      if (usersRes.error) {
        throw usersRes.error;
      }

      const reviews =
        reviewsRes.data ?? [];

      const reports =
        reportsRes.data ?? [];

      const users =
        usersRes.data ?? [];

      setStatsData({
        totalReviews:
          reviews.length,

        approvedReviews:
          reviews.filter(
            (review) =>
              review.moderation_status === "Approved"
          ).length,

        pendingReviews:
          reviews.filter(
            (review) =>
              review.moderation_status === "Pending"
          ).length,

        rejectedReviews:
          reviews.filter(
            (review) =>
              review.moderation_status === "Rejected"
          ).length,

        totalReports:
          reports.length,

        pendingReports: reports.filter(
          (report) => report.status === "Pending"
        ).length,

        resolvedReports: reports.filter(
          (report) => report.status === "Resolved"
        ).length,

        dismissedReports: reports.filter(
          (report) => report.status === "Dismissed"
        ).length,

        totalUsers:
          users.length,
      });
    } catch (error) {
      console.error(
        "Failed to load dashboard stats:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * INITIAL LOAD + REALTIME SYNC
   * =====================================================
   */

  useEffect(() => {
    loadDashboardStats();

    const reportsChannel =
      supabase
        .channel(
          "admin-dashboard-reports"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "review_reports",
          },
          () => {
            loadDashboardStats();
          }
        )
        .subscribe();

    const reviewsChannel = supabase
      .channel("admin-dashboard-reviews")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
        },
        () => {
          loadDashboardStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reviews",
        },
        () => {
          loadDashboardStats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "reviews",
        },
        () => {
          loadDashboardStats();
        }
      )
      .subscribe();

    const profilesChannel =
      supabase
        .channel(
          "admin-dashboard-profiles"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
          },
          () => {
            loadDashboardStats();
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

      supabase.removeChannel(
        profilesChannel
      );
    };
  }, []);

  /*
   * =====================================================
   * DASHBOARD STAT CARDS
   * =====================================================
   */

  const stats = [
    {
      title: "Total Reviews",
      value: statsData.totalReviews,
      description: "All reviews",
      icon: FileText,
      iconClass:
        "bg-blue-100 text-blue-600",
    },

    {
      title: "Pending Reviews",
      value: statsData.pendingReviews,
      description: "Need moderation",
      icon: Clock3,
      iconClass:
        "bg-yellow-100 text-yellow-600",
    },

    {
      title: "Reports",
      value: statsData.totalReports,
      description: "All reports",
      icon: Flag,
      iconClass:
        "bg-red-100 text-red-600",
    },

    {
      title: "Users",
      value: statsData.totalUsers,
      description: "Registered users",
      icon: Users,
      iconClass:
        "bg-green-100 text-green-600",
    },
  ];

  return (

    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

     
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <p className="text-xs font-medium text-[#2875F5] sm:text-sm">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17385F] sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-1.5 text-xs text-[#617493] sm:mt-2 sm:text-base">
            Manage reviews, reports, and users from one place.
          </p>
        </div>
        
        <AdminNavigation />

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-[#D6E7F7] bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">

                  <div className="min-w-0">
                   <p className="truncate text-xs text-[#617493] sm:text-sm">
                      {stat.title}
                    </p>

                    <p className="mt-1.5 text-2xl font-bold text-[#17385F] sm:mt-2 sm:text-3xl">
                      {loading
                        ? "..."
                        : stat.value}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#617493] sm:mt-1 sm:text-xs">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 ${stat.iconClass}`}
                  >
                    <Icon className="size-4 sm:size-5" />
                  </div>

                </div>
              </div>
            );
          })}

        </section>

        {/* =================================================
            MANAGEMENT SECTIONS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-3">

          {/* Reviews */}

          <div className="rounded-xl border border-[#D6E7F7] bg-white p-5 shadow-sm sm:rounded-2xl sm:p-6">

            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 sm:size-12">
              <FileText className="size-5 sm:size-6" />
            </div>

            <h2 className="mt-4 text-base font-semibold sm:mt-5 sm:text-lg">
              Review Management
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
              View, moderate and manage all user reviews.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5 w-full gap-2 border-[#C9DDF2] bg-white text-sm text-[#2875F5] hover:bg-[#F3F7FF] hover:text-[#155DCC] sm:mt-6"
              onClick={() =>
                navigate("/admin/reviews")
              }
            >
              Manage Reviews

              <ArrowRight className="size-4" />
            </Button>

          </div>

          {/* Reports */}

          <div className="rounded-xl border border-[#D6E7F7] bg-white p-5 shadow-sm sm:rounded-2xl sm:p-6">

            <div className="flex size-11 items-center justify-center rounded-xl bg-red-100 text-red-600 sm:size-12">
              <Flag className="size-5 sm:size-6" />
            </div>

            <h2 className="mt-4 text-base font-semibold sm:mt-5 sm:text-lg">
              Reports Management
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
              Review reported content and take moderation actions.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5 w-full gap-2 border-[#C9DDF2] bg-white text-sm text-[#2875F5] hover:bg-[#F3F7FF] hover:text-[#155DCC] sm:mt-6"
              onClick={() =>
                navigate("/admin/reports")
              }
            >
              Manage Reports

              <ArrowRight className="size-4" />
            </Button>

          </div>

          {/* Users */}

          <div className="rounded-xl border border-[#D6E7F7] bg-white p-5 shadow-sm sm:rounded-2xl sm:p-6">

            <div className="flex size-11 items-center justify-center rounded-xl bg-green-100 text-green-600 sm:size-12">
              <Users className="size-5 sm:size-6" />
            </div>

            <h2 className="mt-4 text-base font-semibold sm:mt-5 sm:text-lg">
              User Management
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">
              View users and manage account activity.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5 w-full gap-2 border-[#C9DDF2] bg-white text-sm text-[#2875F5] hover:bg-[#F3F7FF] hover:text-[#155DCC] sm:mt-6"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              Manage Users

              <ArrowRight className="size-4" />
            </Button>

          </div>

        </section>

        {/* =================================================
            REVIEW OVERVIEW
        ================================================= */}

        <section className="mt-6 rounded-xl border border-[#D6E7F7] bg-white shadow-sm sm:mt-8 sm:rounded-2xl">

          <div className="border-b px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-base font-semibold sm:text-lg">
              Review Overview
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
              Current review moderation status.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            {/* Approved */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-6">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 sm:size-11">
                <CheckCircle2 className="size-4 text-green-600 sm:size-5" />
              </div>

              <div>
                <p className="text-xl font-bold sm:text-2xl">
                  {loading
                    ? "..."
                    : statsData.approvedReviews}
                </p>

                <p className="text-xs text-muted-foreground sm:text-sm">
                  Approved Reviews
                </p>
              </div>

            </div>

            {/* Pending */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-6">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:size-11">
                <Clock3 className="size-4 text-yellow-600 sm:size-5" />
              </div>

              <div>
                <p className="text-xl font-bold sm:text-2xl">
                  {loading
                    ? "..."
                    : statsData.pendingReviews}
                </p>

                <p className="text-xs text-muted-foreground sm:text-sm">
                  Pending Reviews
                </p>
              </div>

            </div>

            {/* Rejected */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-6">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 sm:size-11">
                <XCircle className="size-4 text-red-600 sm:size-5" />
              </div>

              <div>
                <p className="text-xl font-bold sm:text-2xl">
                  {loading
                    ? "..."
                    : statsData.rejectedReviews}
                </p>

                <p className="text-xs text-muted-foreground sm:text-sm">
                  Rejected Reviews
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            REPORT OVERVIEW
        ================================================= */}

        <section className="mt-6 rounded-xl border border-[#D6E7F7] bg-white shadow-sm sm:mt-8 sm:rounded-2xl">

          <div className="border-b px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-base font-semibold sm:text-lg">
              Report Overview
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
              Current report moderation status.
            </p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-x sm:divide-y-0">

            <div className="p-4 sm:p-5">
              <p className="text-xl font-bold sm:text-2xl">
                {loading
                  ? "..."
                  : statsData.totalReports}
              </p>

              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Total Reports
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-xl font-bold sm:text-2xl">
                {loading
                  ? "..."
                  : statsData.pendingReports}
              </p>

              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Pending
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-xl font-bold sm:text-2xl">
                {loading
                  ? "..."
                  : statsData.resolvedReports}
              </p>

              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Resolved
              </p>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-xl font-bold sm:text-2xl">
                {loading
                  ? "..."
                  : statsData.dismissedReports}
              </p>

              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Dismissed
              </p>
            </div>

          </div>

        </section>

        {/* =================================================
            ADMIN INFO
        ================================================= */}

        <section className="mt-6 rounded-xl border border-[#C9DDF2] bg-[#EAF3FF] p-4 sm:mt-8 sm:rounded-2xl sm:p-6">

          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4">

            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#DCEBFF] sm:size-12">
              <ShieldCheck className="size-5 text-[#2875F5] sm:size-6" />
            </div>

            <div>
              <h2 className="text-sm font-semibold sm:text-base">
                Administration Panel
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#617493] sm:text-sm sm:leading-6">
                Use the management sections above to navigate between
                reviews, reports and users.
              </p>
            </div>

          </div>

        </section>

      </div>
    
      <Footer />
    </div>
  );
}

export default AdminDashboard;