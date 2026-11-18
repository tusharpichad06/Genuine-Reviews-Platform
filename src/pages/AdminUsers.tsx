import {
  Ban,
  ChevronDown,
  Eye,
  FileText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminNavigation from "../components/AdminNavigation";

import { Button } from "../components/ui/button";

import { supabase } from "../lib/supabase";

import { toast } from "sonner";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";


//import {Link,} from "react-router-dom";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */
type UserStatus = "Active" | "Suspended" | "Pending";

type UserRole = "User" | "Admin";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  reviews: number;
  joinedDate: string;
  lastActive: string;
  avatarUrl?: string | null;
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatJoinedDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/*
 * =========================================================
 * ADMIN USERS
 * =========================================================
 */

function AdminUsers() {

  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [roleFilter, setRoleFilter] =
    useState("All Roles");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [managingUserId, setManagingUserId] =
    useState<string | null>(null);

  const [selectedUserIds, setSelectedUserIds] =
    useState<string[]>([]);

  const [bulkActionLoading, setBulkActionLoading] =
    useState(false);

  const usersPerPage = 7;


  /*
   * =======================================================
   * handleSuspend
   * =======================================================
   */
  async function handleSuspend(user: AdminUser) {
    const confirmed = window.confirm(
      `Are you sure you want to suspend @${user.username}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        status: "Suspended",
      })
      .eq("id", user.id);

    if (error) {
      console.error("Suspend user error:", error);

      toast.error("Could not suspend user", {
        description: error.message,
      });

      return;
    }

    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: "Suspended",
            }
          : item
      )
    );

    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({
        ...selectedUser,
        status: "Suspended",
      });
    }

    toast.success(`@${user.username} has been suspended`);
  }



  async function handleUndoSuspend(user: AdminUser) {
    const confirmed = window.confirm(
      `Undo suspension for @${user.username}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        status: "Active",
      })
      .eq("id", user.id);

    if (error) {
      console.error("Undo suspend error:", error);

      toast.error("Could not undo suspension", {
        description: error.message,
      });

      return;
    }

    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: "Active",
            }
          : item
      )
    );

    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({
        ...selectedUser,
        status: "Active",
      });
    }

    toast.success(`@${user.username} suspension removed`);
  }


    /*
   * =======================================================
   * LOAD USERS
   * =======================================================
   */
  async function loadUsers() {

    try {

      setLoading(true);

      setError(null);


      /*
       * ---------------------------------------------------
       * LOAD PROFILES
       * ---------------------------------------------------
       */
      const {
        data: profileRows,
        error: profileError,
      } = await supabase.rpc(
        "get_admin_users"
      );


      if (profileError) {
        throw profileError;
      }


      const profiles =
        profileRows ?? [];


      /*
       * ---------------------------------------------------
       * LOAD REVIEW COUNTS
       * ---------------------------------------------------
       */

      const {
        data: reviewRows,
        error: reviewError,
      } = await supabase
        .from("reviews")
        .select(
          "user_id"
        );


      if (reviewError) {
        throw reviewError;
      }


      /*
       * ---------------------------------------------------
       * BUILD REVIEW COUNT MAP
       * ---------------------------------------------------
       */

      const reviewCountMap =
        new Map<string, number>();


      for (
        const review of reviewRows ?? []
      ) {

        if (!review.user_id) {
          continue;
        }


        const currentCount =
          reviewCountMap.get(
            review.user_id
          ) ?? 0;


        reviewCountMap.set(
          review.user_id,
          currentCount + 1
        );
      }


      /*
       * ---------------------------------------------------
       * BUILD USERS
       * ---------------------------------------------------
       */

      const formattedUsers: AdminUser[] =
        profiles.map(
          (profile: {
            id: string;
            username: string | null;
            avatar_url: string | null;
            contact_email: string | null;
            role: string | null;
            status: string | null;
            created_at: string;
            last_active: string | null;
          }) => {

            const roleValue =
              String(
                profile.role ?? "user"
              ).toLowerCase();


            const role: UserRole =
              roleValue === "admin"
                ? "Admin"
                : "User";

            const statusValue = profile.status ? String(profile.status) : "Active";
            const userStatus: UserStatus =
              statusValue.toLowerCase() === "suspended"
                ? "Suspended"
                : statusValue.toLowerCase() === "pending"
                  ? "Pending"
                  : "Active";


            return {

              id: profile.id,

              name:
                profile.username ||
                "Unknown User",

              username:
                profile.username ||
                "unknown",

              email:
                profile.contact_email ||
                "No email",

              role,

              status: userStatus,

              reviews:
                reviewCountMap.get(
                  profile.id
                ) ?? 0,

              joinedDate:
                formatJoinedDate(
                  profile.created_at
                ),

              lastActive: profile.last_active
                ? new Date(
                    profile.last_active
                  ).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never",

              avatarUrl:
                profile.avatar_url ?? null,
            };
          }
        );


      setUsers(
        formattedUsers
      );

    } catch (err) {

      console.error(
        "ADMIN USERS LOAD ERROR:",
        err
      );


      const message =
        err instanceof Error
          ? err.message
          : "Could not load users.";


      setError(message);

      toast.error(
        "Could not load users."
      );

    } finally {

      setLoading(false);

    }
  }


  /*
   * =======================================================
   * INITIAL LOAD + REALTIME
   * =======================================================
   */

  useEffect(() => {

    loadUsers();


    /*
     * ---------------------------------------------------
     * PROFILES REALTIME
     * ---------------------------------------------------
     */

    const profilesChannel =
      supabase
        .channel(
          "admin-users-profiles"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
          },
          () => {

            loadUsers();

          }
        )
        .subscribe();


    /*
     * ---------------------------------------------------
     * REVIEWS REALTIME
     * ---------------------------------------------------
     */

    const reviewsChannel =
      supabase
        .channel(
          "admin-users-reviews"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reviews",
          },
          () => {

            loadUsers();

          }
        )
        .subscribe();


    return () => {

      supabase.removeChannel(
        profilesChannel
      );

      supabase.removeChannel(
        reviewsChannel
      );

    };

  }, []);


  /*
   * =======================================================
   * FILTER USERS
   * =======================================================
   */

  const filteredUsers =
    useMemo(() => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      return users.filter(
        (user) => {

          const matchesSearch =
            !searchText ||
            user.name
              .toLowerCase()
              .includes(searchText) ||
            user.username
              .toLowerCase()
              .includes(searchText) ||
            user.email
              .toLowerCase()
              .includes(searchText);


          const matchesStatus =
            statusFilter === "All Status" ||
            user.status ===
              statusFilter;


          const matchesRole =
            roleFilter === "All Roles" ||
            user.role ===
              roleFilter;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesRole
          );

        }
      );

    }, [
      users,
      search,
      statusFilter,
      roleFilter,
    ]);


  /*
   * =======================================================
   * STATISTICS
   * =======================================================
   */

  const totalUsers =
    users.length;


  const activeUsers =
    users.filter(
      (user) =>
        user.status === "Active"
    ).length;


  const pendingUsers =
    users.filter(
      (user) =>
        user.status === "Pending"
    ).length;


  const suspendedUsers =
    users.filter(
      (user) =>
        user.status === "Suspended"
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
        filteredUsers.length /
          usersPerPage
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (safeCurrentPage - 1) *
    usersPerPage;


  const visibleUsers =
    filteredUsers.slice(
      startIndex,
      startIndex +
        usersPerPage
    );


  /*
   * =======================================================
   * RESET FILTERS
   * =======================================================
   */

  async function suspendUser(user: AdminUser) {
    const confirmed = window.confirm(
      `Are you sure you want to suspend ${user.name}? This user will no longer be able to perform authenticated activities.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "Suspended",
        })
        .eq("id", user.id);

      if (error) {
        console.error("Suspend user error:", error);
        alert(`Could not suspend ${user.name}.`);
        return;
      }

      alert(`${user.name} has been suspended.`);
    } catch (error) {
      console.error("Unexpected suspend error:", error);
      alert("Could not suspend user.");
    }
  }


  function toggleUserSelection(userId: string) {
    setSelectedUserIds((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  }

  function toggleSelectAllVisible() {
    const visibleIds = visibleUsers.map(
      (user) => user.id
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedUserIds.includes(id)
      );

    if (allSelected) {
      setSelectedUserIds((previous) =>
        previous.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedUserIds((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    }
  }

  async function handleBulkAction(
    action: "suspend" | "activate" | "makeAdmin" | "makeUser"
  ) {
    if (selectedUserIds.length === 0) {
      return;
    }

    const selectedUsers = users.filter((user) =>
      selectedUserIds.includes(user.id)
    );

    const actionText =
      action === "suspend"
        ? "suspend"
        : action === "activate"
          ? "activate"
          : action === "makeAdmin"
            ? "make Admin"
            : "make User";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${selectedUsers.length} selected user(s)?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBulkActionLoading(true);

      const updateData =
        action === "suspend"
          ? { status: "Suspended" }
          : action === "activate"
            ? { status: "Active" }
            : action === "makeAdmin"
              ? { role: "admin" }
              : { role: "user" };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .in("id", selectedUserIds);

      if (error) {
        throw error;
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) => {
          if (!selectedUserIds.includes(user.id)) {
            return user;
          }

          return {
            ...user,
            ...(action === "suspend"
              ? { status: "Suspended" as UserStatus }
              : {}),
            ...(action === "activate"
              ? { status: "Active" as UserStatus }
              : {}),
            ...(action === "makeAdmin"
              ? { role: "Admin" as UserRole }
              : {}),
            ...(action === "makeUser"
              ? { role: "User" as UserRole }
              : {}),
          };
        })
      );

      setSelectedUserIds([]);

      toast.success(
        `${selectedUsers.length} user(s) updated successfully.`
      );
    } catch (err) {
      console.error(
        "BULK USER ACTION ERROR:",
        err
      );

      toast.error(
        "Could not update selected users."
      );
    } finally {
      setBulkActionLoading(false);
    }
  }

  function resetFilters() {

    setSearch("");

    setStatusFilter(
      "All Status"
    );

    setRoleFilter(
      "All Roles"
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
    status: UserStatus;
  }) {

    if (status === "Active") {

      return (
        <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Active
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
        Suspended
      </span>
    );

  }


  /*
   * =======================================================
   * ROLE BADGE
   * =======================================================
   */

  function RoleBadge({
    role,
  }: {
    role: UserRole;
  }) {

    if (role === "Admin") {

      return (
        <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          Admin
        </span>
      );

    }


    return (
      <span className="inline-flex items-center rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        User
      </span>
    );

  }


  /*
   * =======================================================
   * CHANGE USER ROLE
   * =======================================================
   */

  async function handleRoleChange(
    user: AdminUser
  ) {

    try {

      setManagingUserId(
        user.id
      );


      const newRole =
        user.role === "Admin"
          ? "user"
          : "admin";


      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          role: newRole,
        })
        .eq(
          "id",
          user.id
        );


      if (updateError) {
        throw updateError;
      }


      /*
       * Update UI immediately.
       */

      setUsers(
        (previousUsers) =>
          previousUsers.map(
            (item) =>
              item.id === user.id
                ? {
                    ...item,
                    role:
                      newRole ===
                      "admin"
                        ? "Admin"
                        : "User",
                  }
                : item
          )
      );


      /*
       * Update selected user
       * if modal is open.
       */

      setSelectedUser(
        (previousUser) =>
          previousUser &&
          previousUser.id ===
            user.id
            ? {
                ...previousUser,
                role:
                  newRole ===
                  "admin"
                    ? "Admin"
                    : "User",
              }
            : previousUser
      );


      toast.success(
        `${user.username} is now ${
          newRole === "admin"
            ? "an Admin"
            : "a User"
        }.`
      );

    } catch (err) {

      console.error(
        "ROLE UPDATE ERROR:",
        err
      );


      toast.error(
        "Could not update user role."
      );

    } finally {

      setManagingUserId(
        null
      );

    }
  }


  /*
   * =======================================================
   * VIEW USER
   * =======================================================
   */

  function handleViewUser(
    user: AdminUser
  ) {

    setSelectedUser(user);

  }


 /*
  * =======================================================
  * AVATAR
  * =======================================================
  */

  function getAvatarColor(username: string) {
    const colors = [
      "bg-red-100 text-red-700 border-red-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-pink-100 text-pink-700 border-pink-200",
    ];

    let hash = 0;

    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }


  function UserAvatar({
    user,
    size = "size-10",
  }: {
    user: AdminUser;
    size?: string;
  }) {
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className={`${size} shrink-0 rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${size} flex shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${getAvatarColor(
          user.username
        )}`}
      >
        {user.username
          .trim()
          .charAt(0)
          .toUpperCase()}
      </div>
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
          <p className="mt-4 text-xs font-medium text-primary sm:mt-5 sm:text-sm">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">
            User Management
          </h1>

          <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-base">
            View and manage platform users.
          </p>
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

                  setSearch(
                    event.target.value
                  );

                  setCurrentPage(1);

                }}
                placeholder="Search users by name, username or email..."
                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>


            {/* Filters wrapper for mobile grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">

              {/* Status */}

              <div className="relative">

                <select
                  value={statusFilter}
                  onChange={(event) => {

                    setStatusFilter(
                      event.target.value
                    );

                    setCurrentPage(1);

                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >

                  <option>
                    All Status
                  </option>

                  <option>
                    Active
                  </option>

                  <option>
                    Pending
                  </option>

                  <option>
                    Suspended
                  </option>

                </select>


                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              </div>


              {/* Role */}

              <div className="relative">

                <select
                  value={roleFilter}
                  onChange={(event) => {

                    setRoleFilter(
                      event.target.value
                    );

                    setCurrentPage(1);

                  }}
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >

                  <option>
                    All Roles
                  </option>

                  <option>
                    User
                  </option>

                  <option>
                    Admin
                  </option>

                </select>


                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              </div>

            </div>


            {/* Reset */}

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
            ERROR
        ================================================== */}

        {error && (
          <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">

            <div className="flex items-start gap-3">

              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />

              <div>

                <p className="text-sm font-semibold text-red-800">
                  Could not load users
                </p>

                <p className="mt-1 text-xs text-red-700 sm:text-sm">
                  {error}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={loadUsers}
                >
                  Try Again
                </Button>

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            STATISTICS
        ================================================== */}

        <section className="mt-5 rounded-2xl border bg-white shadow-sm">

          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">

            {/* Total */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:size-11">
                <Users className="size-4 text-primary sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {totalUsers}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Total Users
                </p>

              </div>

            </div>


            {/* Active */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 sm:size-11">
                <UserCheck className="size-4 text-green-600 sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {activeUsers}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Active Users
                </p>

              </div>

            </div>


            {/* Pending */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:size-11">
                <ShieldCheck className="size-4 text-yellow-600 sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {pendingUsers}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Pending Users
                </p>

              </div>

            </div>


            {/* Suspended */}

            <div className="flex items-center gap-3.5 p-4 sm:gap-4 sm:p-5">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 sm:size-11">
                <Ban className="size-4 text-red-600 sm:size-5" />
              </div>

              <div className="min-w-0">

                <p className="text-xl font-bold sm:text-2xl">
                  {suspendedUsers}
                </p>

                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  Suspended
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <section className="mt-5 rounded-2xl border bg-background p-12 text-center shadow-sm">

            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              Loading users...
            </p>

          </section>
        )}


        {selectedUserIds.length > 0 && (
          <section className="mt-5 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs font-medium sm:text-sm">
                {selectedUserIds.length} user(s) selected
              </p>

              <div className="flex flex-wrap gap-2">

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={bulkActionLoading}
                  onClick={() =>
                    handleBulkAction("activate")
                  }
                >
                  <UserCheck className="size-4" />
                  Activate
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={bulkActionLoading}
                  onClick={() =>
                    handleBulkAction("suspend")
                  }
                  className="text-red-600 hover:text-red-700"
                >
                  <Ban className="size-4" />
                  Suspend
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={bulkActionLoading}
                  onClick={() =>
                    handleBulkAction("makeAdmin")
                  }
                >
                  <UserCog className="size-4" />
                  Make Admin
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={bulkActionLoading}
                  onClick={() =>
                    handleBulkAction("makeUser")
                  }
                >
                  <UserCog className="size-4" />
                  Make User
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={"hover:bg-[#f4f9ff]"}
                  disabled={bulkActionLoading}
                  onClick={() =>
                    setSelectedUserIds([])
                  }
                >
                  <X className="size-4" />
                  Clear
                </Button>

              </div>
            </div>
          </section>
        )}


        {/* =================================================
            USERS TABLE
        ================================================== */}

        {!loading && (
          <section className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">

            {/* Desktop */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[1050px] border-collapse">

                <thead>

                  <tr className="border-b bg-muted/20 text-left">

                    <th className="w-12 px-5 py-4">
                      <input
                        type="checkbox"
                        checked={
                          visibleUsers.length > 0 &&
                          visibleUsers.every((user) =>
                            selectedUserIds.includes(user.id)
                          )
                        }
                        onChange={toggleSelectAllVisible}
                        className="size-4 rounded border accent-primary"
                      />
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      User
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Role
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Reviews
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Joined
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Last Active
                    </th>


                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {visibleUsers.map(
                    (user) => (

                      <tr
                        key={user.id}
                        className="border-b last:border-b-0 transition-colors hover:bg-muted/20"
                      >

                        <td className="px-5 py-4">

                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() =>
                              toggleUserSelection(user.id)
                            }
                            className="size-4 rounded border accent-primary"
                          />

                        </td>


                        {/* User */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <UserAvatar
                              user={user}
                            />

                            <div className="min-w-0">

                              <p className="truncate text-sm font-medium">
                                {user.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                @{user.username}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* Role */}

                        <td className="px-4 py-4">

                          <RoleBadge
                            role={user.role}
                          />

                        </td>


                        {/* Status */}

                        <td className="px-4 py-4">

                          <StatusBadge
                            status={user.status}
                          />

                        </td>


                        {/* Reviews */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <FileText className="size-4 text-muted-foreground" />

                            <span className="text-sm font-medium">
                              {user.reviews}
                            </span>

                          </div>

                        </td>


                        {/* Joined */}

                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          {user.joinedDate}
                        </td>


                        {/* Last Active */}

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                          {user.lastActive}
                        </td>


                        {/* Actions */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5 hover:bg-[#f4f9ff]"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="size-3.5" />
                              View
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5 hover:bg-[#f4f9ff]"
                              disabled={managingUserId === user.id}
                              onClick={() => handleRoleChange(user)}
                            >
                              <UserCog className="size-3.5" />
                              {managingUserId === user.id
                                ? "Updating..."
                                : user.role === "Admin"
                                  ? "Make User"
                                  : "Make Admin"}
                            </Button>

                            {user.status === "Suspended" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleUndoSuspend(user)}
                              >
                                <UserCheck className="size-3.5" />
                                Undo Suspend
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-red-600 hover:text-red-700"
                                onClick={() => handleSuspend(user)}
                              >
                                <Ban className="size-3.5" />
                                Suspend
                              </Button>
                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                MOBILE
            ================================================== */}

            <div className="divide-y md:hidden">

              {visibleUsers.map(
                (user) => (

                  <div
                    key={user.id}
                    className="p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() =>
                            toggleUserSelection(user.id)
                          }
                          className="size-4 shrink-0 rounded border accent-primary"
                        />

                        <UserAvatar
                          user={user}
                          size="size-10"
                        />

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            @{user.username}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>

                        </div>

                      </div>


                      <StatusBadge
                        status={user.status}
                      />

                    </div>


                    <div className="mt-3 flex flex-wrap gap-2">

                      <RoleBadge
                        role={user.role}
                      />

                      <span className="inline-flex items-center rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {user.reviews} Reviews
                      </span>

                    </div>


                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">

                      <div>

                        <p className="text-muted-foreground">
                          Joined
                        </p>

                        <p className="mt-0.5 font-medium">
                          {user.joinedDate}
                        </p>

                      </div>


                      <div>

                        <p className="text-muted-foreground">
                          Last Active
                        </p>

                        <p className="mt-0.5 font-medium truncate">
                          {user.lastActive}
                        </p>

                      </div>

                    </div>


                    <div className="mt-4 flex flex-wrap gap-2">

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 hover:bg-[#f4f9ff]"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="size-4" />
                        View
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 hover:bg-[#f4f9ff]"
                        disabled={managingUserId === user.id}
                        onClick={() => handleRoleChange(user)}
                      >
                        <UserCog className="size-4" />
                        {managingUserId === user.id
                          ? "Updating..."
                          : user.role === "Admin"
                            ? "Make User"
                            : "Make Admin"}
                      </Button>

                      {user.status !== "Suspended" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-red-600 hover:text-red-700"
                          onClick={() => handleSuspend(user)}
                        >
                          <Ban className="size-4" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleUndoSuspend(user)}
                        >
                          <UserCheck className="size-4" />
                          Undo
                        </Button>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================== */}

            {visibleUsers.length ===
              0 && (

              <div className="px-6 py-16 text-center">

                <Users className="mx-auto size-10 text-muted-foreground/50" />

                <h3 className="mt-4 text-sm font-semibold">
                  No users found
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
                PAGINATION
            ================================================== */}

            <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">

              <p className="text-xs text-muted-foreground sm:text-sm">

                Showing{" "}

                <span className="font-medium text-foreground">
                  {visibleUsers.length}
                </span>{" "}

                of{" "}

                <span className="font-medium text-foreground">
                  {filteredUsers.length}
                </span>{" "}

                users

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
                  {safeCurrentPage}
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

          </section>
        )}

      </div>


      {/* =====================================================
          VIEW USER MODAL
      ====================================================== */}

      {selectedUser && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedUser(
                null
              );
            }

          }}
        >

          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 text-black shadow-xl sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  User Details
                </p>

                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  {selectedUser.name}
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

            </div>


            <div className="mt-5 flex items-center gap-3.5 sm:mt-6 sm:gap-4">

              <UserAvatar
                user={selectedUser}
                size="size-14 sm:size-16"
              />

              <div className="min-w-0">

                <p className="text-base font-semibold sm:text-lg truncate">
                  {selectedUser.name}
                </p>

                <p className="text-xs text-muted-foreground sm:text-sm truncate">
                  @{selectedUser.username}
                </p>

                <p className="mt-0.5 break-all text-xs text-muted-foreground sm:text-sm">
                  {selectedUser.email}
                </p>

              </div>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">

              <div className="rounded-xl border p-3.5 sm:p-4">

                <p className="text-xs text-muted-foreground">
                  Role
                </p>

                <div className="mt-2">
                  <RoleBadge
                    role={
                      selectedUser.role
                    }
                  />
                </div>

              </div>


              <div className="rounded-xl border p-3.5 sm:p-4">

                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      selectedUser.status
                    }
                  />
                </div>

              </div>


              <div className="rounded-xl border p-3.5 sm:p-4">

                <p className="text-xs text-muted-foreground">
                  Reviews
                </p>

                <p className="mt-1 text-base font-bold sm:text-lg">
                  {selectedUser.reviews}
                </p>

              </div>


              <div className="rounded-xl border p-3.5 sm:p-4">

                <p className="text-xs text-muted-foreground">
                  Joined
                </p>

                <p className="mt-1 text-xs font-semibold sm:text-sm truncate">
                  {selectedUser.joinedDate}
                </p>

              </div>

            </div>


            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">

              <Button
                type="button"
                variant="outline"
                className="h-10 w-full border border-gray-300 bg-white text-black hover:bg-gray-100 sm:flex-1"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                Close
              </Button>

             {/*
              <Link
                to={`/profile/${selectedUser.id}`}
                className="sm:flex-1"
              >
                <Button
                  variant="outline"
                  className="h-10 w-full border border-gray-300 bg-white text-black hover:bg-gray-100"
                >
                  View Profile
                </Button>
              </Link>
              */}

              <Button
                type="button"
                className="h-10 w-full border border-gray-300 bg-white text-black hover:bg-gray-100 sm:flex-1"
                disabled={
                  managingUserId ===
                  selectedUser.id
                }
                onClick={() =>
                  handleRoleChange(
                    selectedUser
                  )
                }
              >

                <UserCog className="size-4" />

                {managingUserId ===
                selectedUser.id
                  ? "Updating..."
                  : selectedUser.role ===
                    "Admin"
                    ? "Make User"
                    : "Make Admin"}

              </Button>

            </div>

          </div>

        </div>

      )}
      
      <Footer />
    </div>
  );
}


export default AdminUsers;