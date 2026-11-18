import {
  Bell,
  Pencil,
  Trash2,
  LogOut,
  UserCircle,
  Check,
  Menu,
  X,
  FileText,
  Handshake,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "../ui/button";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getAvatarColor } from "@/lib/avatar";
import { BriefcaseBusiness } from "lucide-react";


type Notification = {
  id: string;
  user_id: string;
  type:
    | "review_reply"
    | "comment_reply"
    | "review_verified"
    | "warning"
    | "warning_removed"
    | "proposal"
    | "proposal_accepted"
    | "proposal_declined"
    | "proposal_withdrawn"
    | "deal"
    | "system";
  message: string;
  review_id: string | null;
  comment_id: string | null;
  reply_id: string | null;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
};

function Navbar() {
  const { user, loading } = useAuth();

  const [profileUsername, setProfileUsername] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [profileAvatar, setProfileAvatar] =
    useState<string | null>(null);

  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);

  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    // Supabase database se delete karein
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting notification:", error);
      return;
    }

    // UI state update karein taaki refresh ki zaroorat na pade
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    setSelectedNotificationIds((prev) =>
      prev.filter((id) => id !== notificationId)
    );
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotificationIds((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAllNotifications = () => {
    if (
      notifications.length > 0 &&
      selectedNotificationIds.length === notifications.length
    ) {
      setSelectedNotificationIds([]);
    } else {
      setSelectedNotificationIds(notifications.map((n) => n.id));
    }
  };

  const deleteSelectedNotifications = async () => {
    if (!user || selectedNotificationIds.length === 0) return;

    // Supabase database se multiple notifications delete karein
    const { error } = await supabase
      .from("notifications")
      .delete()
      .in("id", selectedNotificationIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting selected notifications:", error);
      return;
    }

    // UI state update karein
    setNotifications((prev) =>
      prev.filter((n) => !selectedNotificationIds.includes(n.id))
    );
    setSelectedNotificationIds([]);
  };

  /*
   * =========================================================
   * LOAD PROFILE
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadNavbarProfile() {
      if (!user) {
        setProfileUsername("");
        setProfileAvatar(null);
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "username, avatar_url, role"
        )
        .eq("id", user.id)
        .maybeSingle();

      const { data: businessProfile } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setBusinessProfileId(businessProfile?.id ?? null);

      if (error) {
        console.error(
          "NAVBAR PROFILE ERROR:",
          error
        );
        return;
      }

      if (!cancelled) {
        setProfileUsername(
          data?.username ||
            user.user_metadata?.username ||
            "User"
        );

        setProfileAvatar(
          data?.avatar_url || null
        );

        setIsAdmin(
          data?.role === "admin"
        );
      }
    }

    loadNavbarProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileNotificationsOpen, setMobileNotificationsOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement | null>(null);

  const accountRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * =========================================================
   * CLOSE DROPDOWNS ON OUTSIDE CLICK
   * =========================================================
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          target
        )
      ) {
        setNotificationsOpen(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(
          target
        )
      ) {
        setAccountOpen(false);
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
  }, []);

  /*
   * =========================================================
   * MOBILE MENU
   * =========================================================
   */

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setMobileNotificationsOpen(false);
  }

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );
        return;
      }

      setAccountOpen(false);
      setNotificationsOpen(false);
      setMobileNotificationsOpen(false);
      setMobileMenuOpen(false);

      navigate("/");
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  }

  /*
   * =========================================================
   * LOAD NOTIFICATIONS
   * =========================================================
   */

  async function loadNotifications() {
    if (!user) {
      setNotifications([]);
      return;
    }

    setNotificationsLoading(true);

    try {
      const { data, error } =
        await supabase
          .from("notifications")
          .select(
            `
              id,
              user_id,
              type,
              message,
              review_id,
              comment_id,
              reply_id,
              reference_id,
              is_read,
              created_at
            `
          )
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(20);

      if (error) {
        console.error(
          "LOAD NOTIFICATIONS ERROR:",
          error
        );
        return;
      }

      setNotifications(
        (data as Notification[]) || []
      );
    } catch (error) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setSelectedNotificationIds([]);
      return;
    }

    loadNotifications();
  }, [user]);

  /*
   * =========================================================
   * REALTIME NOTIFICATIONS
   * =========================================================
   */

  useEffect(() => {
    if (!user) return;

    const channel =
      supabase
        .channel(
          `notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification =
              payload.new as Notification;

            setNotifications(
              (previous) =>
                [
                  newNotification,
                  ...previous,
                ].slice(0, 20)
            );
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [user]);

  /*
   * =========================================================
   * UNREAD COUNT
   * =========================================================
   */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const allNotificationsSelected =
    notifications.length > 0 &&
    selectedNotificationIds.length === notifications.length;

  /*
   * =========================================================
   * MARK NOTIFICATION AS READ & NAVIGATION HANDLER
   * =========================================================
   */

  async function handleNotificationClick(
    notification: Notification
  ) {
    if (!notification.is_read) {
      const { error } =
        await supabase
          .from("notifications")
          .update({
            is_read: true,
          })
          .eq(
            "id",
            notification.id
          )
          .eq(
            "user_id",
            user?.id
          );

      if (error) {
        console.error(
          "MARK NOTIFICATION READ ERROR:",
          error
        );
      } else {
        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
            )
        );
      }
    }

    setNotificationsOpen(false);
    setMobileNotificationsOpen(false);

// Smart Navigation based on Notification Type / IDs
  if (
    notification.type === "proposal" ||
    notification.type === "proposal_declined" ||
    notification.type === "proposal_withdrawn"
  ) {
    if (notification.reference_id) {
      navigate(`/proposals/${notification.reference_id}`);
    }
  } else if (
    notification.type === "proposal_accepted" ||
    notification.type === "deal"
  ) {
    if (notification.reference_id) {
      navigate(`/deals/${notification.reference_id}`);
    }
  } else if (notification.review_id) {
    navigate(`/review/${notification.review_id}`);
  }
  }

  /*
   * =========================================================
   * MARK ALL AS READ
   * =========================================================
   */

  async function handleMarkAllAsRead() {
    if (
      !user ||
      unreadCount === 0
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "is_read",
          false
        );

    if (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error
      );
      return;
    }

    setNotifications(
      (previous) =>
        previous.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
    );
  }

  /*
   * =========================================================
   * FORMAT NOTIFICATION TIME
   * =========================================================
   */

  function formatNotificationTime(
    dateString: string
  ) {
    const date =
      new Date(dateString);

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const minutes =
      Math.floor(
        difference /
          (1000 * 60)
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  }

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-[#e1edf7]
          bg-[#eef7ff]/95
          shadow-[0_2px_12px_rgba(22,135,248,0.045)]
          backdrop-blur-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[76px]
            w-full
            max-w-[1440px]
            items-center
            px-4
            sm:px-6
            lg:px-8
            xl:px-12
          "
        >
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 w-fit"
          >
            <div
              className="
                flex
                size-9
                items-center
                justify-center
                rounded-xl
                border
                border-blue-400/60
                bg-blue-500/10
                text-xl
                text-blue-300
              "
            >
              🛡
            </div>

            <span className="hidden text-2xl font-bold tracking-tight text-black sm:inline">
              Genuine Reviews
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="
              ml-auto
              hidden
              items-center
              gap-1
              sm:flex
            "
          >
            {isAdmin && (
              <Link
                to="/admin"
                className="
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#102c59]
                  transition-colors
                  hover:bg-[#eef7ff]
                  hover:text-[#1687f8]
                "
              >
                Admin Dashboard
              </Link>
            )}

            <Link
              to="/"
              className="
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-semibold
                text-[#102c59]
                transition-colors
                hover:bg-[#eef7ff]
                hover:text-[#1687f8]
              "
            >
              Home
            </Link>

            <Link
              to="/reviews"
              className="
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-semibold
                text-[#102c59]
                transition-colors
                hover:bg-[#eef7ff]
                hover:text-[#1687f8]
              "
            >
              Reviews
            </Link>

            <Link
              to="/categories"
              className="
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-semibold
                text-[#102c59]
                transition-colors
                hover:bg-[#eef7ff]
                hover:text-[#1687f8]
              "
            >
              Categories
            </Link>

            <Link
              to="/businesses"
              className="
                rounded-lg
                px-4
                py-2.5
                text-sm
                font-semibold
                text-[#102c59]
                transition-colors
                hover:bg-[#eef7ff]
                hover:text-[#1687f8]
              "
            >
              Businesses
            </Link>

            <Link
              to={
                user
                  ? "/write-review"
                  : "/auth?mode=login"
              }
              className="ml-2"
            >
              <Button
                className="
                  h-11
                  rounded-xl
                  border
                  border-[#1687f8]
                  bg-[#1687f8]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_5px_14px_rgba(22,135,248,0.20)]
                  transition-all
                  hover:bg-[#0f76df]
                  hover:shadow-[0_7px_18px_rgba(22,135,248,0.28)]
                "
              >
                <Pencil className="mr-2 size-4" />
                Write Review
              </Button>
            </Link>

            {loading ? null : user ? (
              <>
                <div
                  ref={notificationRef}
                  className="relative ml-2"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    onClick={() => {
                      setNotificationsOpen(
                        (previous) =>
                          !previous
                      );

                      setAccountOpen(false);
                    }}
                    className="
                      relative
                      size-11
                      rounded-xl
                      text-[#8B6415]
                      transition-all
                      hover:bg-[#FFF8E7]
                      hover:text-[#7A5510]
                    "
                  >
                    <Bell
                      className="
                        size-[21px]
                        stroke-[2]
                      "
                    />

                    {unreadCount > 0 && (
                      <span
                        className="
                          absolute
                          right-[7px]
                          top-[7px]
                          size-2.5
                          rounded-full
                          bg-red-500
                          ring-2
                          ring-[#fbfdff]
                        "
                      />
                    )}
                  </Button>

                  {notificationsOpen && (
                    <div
                      className="
                        absolute
                        right-0
                        top-[52px]
                        z-50
                        w-80
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#dcecfb]
                        bg-white
                        shadow-[0_15px_45px_rgba(15,72,130,0.15)]
                        sm:w-96
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-2
                          border-b
                          border-[#edf3f8]
                          px-4
                          py-3.5
                        "
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#102c59]">
                            Notifications
                          </h3>

                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={
                                handleMarkAllAsRead
                              }
                              className="
                                text-xs
                                font-semibold
                                text-[#1687f8]
                                hover:underline
                              "
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#617493] select-none">
                              <input
                                type="checkbox"
                                checked={allNotificationsSelected}
                                onChange={toggleSelectAllNotifications}
                                className="size-3.5 rounded border-[#cbd5e1] accent-[#1687f8]"
                              />
                              Select all
                            </label>

                            {selectedNotificationIds.length > 0 && (
                              <button
                                type="button"
                                onClick={deleteSelectedNotifications}
                                className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                              >
                                <Trash2 className="size-3" />
                                Delete ({selectedNotificationIds.length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Loading notifications...
                          </div>
                        ) : notifications.length ===
                          0 ? (
                          <div className="px-4 py-10 text-center">
                            <Bell
                              className="
                                mx-auto
                                mb-3
                                size-8
                                text-[#b3914c]
                              "
                            />

                            <p className="text-sm font-semibold text-[#102c59]">
                              No notifications yet
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              You're all caught up.
                            </p>
                          </div>
                        ) : (
                          notifications.map(
                            (notification) => (
                              <div
                                key={
                                  notification.id
                                }
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className={`
                                  flex
                                  w-full
                                  cursor-pointer
                                  items-start
                                  gap-3
                                  border-b
                                  border-[#edf3f8]
                                  px-4
                                  py-3
                                  text-left
                                  transition-colors
                                  hover:bg-[#f4f9fe]
                                  ${
                                    !notification.is_read
                                      ? "bg-[#f5faff]"
                                      : ""
                                  }
                                `}
                              >
                                <div
                                  className="pt-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedNotificationIds.includes(
                                      notification.id
                                    )}
                                    onChange={() =>
                                      toggleSelectNotification(notification.id)
                                    }
                                    className="size-3.5 cursor-pointer rounded border-[#cbd5e1] accent-[#1687f8]"
                                  />
                                </div>

                                <div className="pt-1.5">
                                  {!notification.is_read ? (
                                    <span
                                      className="
                                        block
                                        size-2
                                        rounded-full
                                        bg-red-500
                                      "
                                    />
                                  ) : (
                                    <Check className="size-4 text-muted-foreground" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`
                                      text-sm
                                      leading-5
                                      text-[#102c59]
                                      ${
                                        !notification.is_read
                                          ? "font-semibold"
                                          : ""
                                      }
                                    `}
                                  >
                                    {
                                      notification.message
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-[#8199b1]">
                                    {formatNotificationTime(
                                      notification.created_at
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="rounded-md p-1.5 text-[#617493] hover:bg-red-50 hover:text-red-600"
                                  title="Delete notification"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  ref={accountRef}
                  className="relative ml-1"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Account"
                    onClick={() => {
                      setAccountOpen(
                        (previous) =>
                          !previous
                      );

                      setNotificationsOpen(
                        false
                      );
                    }}
                    className="
                      size-11
                      rounded-full
                      p-1
                      text-[#102c59]
                      transition-colors
                      hover:bg-[#eef7ff]
                    "
                  >
                    {profileAvatar ? (
                      <img
                        src={profileAvatar}
                        alt={
                          profileUsername ||
                          "Profile"
                        }
                        className="
                          size-9
                          rounded-full
                          border-2
                          border-[#d8e8f7]
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className={`
                          flex
                          size-9
                          items-center
                          justify-center
                          rounded-full
                          border-2
                          border-[#d8e8f7]
                          text-sm
                          font-bold
                          ${getAvatarColor(
                            profileUsername ||
                              "User"
                          )}
                        `}
                      >
                        {(
                          profileUsername ||
                          "U"
                        )
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </Button>

                  {accountOpen && (
                    <div
                      className="
                        absolute
                        right-0
                        top-[52px]
                        z-50
                        w-60
                        rounded-2xl
                        border
                        border-[#dcecfb]
                        bg-white
                        p-2
                        shadow-[0_15px_45px_rgba(15,72,130,0.15)]
                      "
                    >
                      <div
                        className="
                          border-b
                          border-[#edf3f8]
                          px-3
                          py-3
                        "
                      >
                        <p className="truncate text-sm font-bold text-[#102c59]">
                          {profileUsername ||
                            "User"}
                        </p>

                        {user.email && (
                          <p className="mt-1 truncate text-xs text-[#8199b1]">
                            {user.email}
                          </p>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() =>
                            setAccountOpen(
                              false
                            )
                          }
                          className="
                            mt-1
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            text-sm
                            font-medium
                            text-[#102c59]
                            hover:bg-[#eef7ff]
                          "
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="
                          mt-1
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          text-[#102c59]
                          hover:bg-[#eef7ff]
                        "
                      >
                        <UserCircle className="size-4" />
                        Profile
                      </Link>

                      {businessProfileId && (
                        <Link
                          to={`/business/${businessProfileId}`}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-3
                            py-2.5
                            text-sm
                            font-medium
                            text-[#617493]
                            transition-colors
                            hover:bg-[#F3F7FF]
                            hover:text-[#2875F5]
                          "
                        >
                          <BriefcaseBusiness className="size-4" />
                          Business Profile
                        </Link>
                      )}

                      {/* --- MY PROPOSALS LINK (Business Profile ke niche) --- */}
                      <Link
                        to="/proposals"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="
                          mt-1
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          text-[#102c59]
                          hover:bg-[#eef7ff]
                        "
                      >
                        <FileText className="size-4" />
                        My Proposals
                      </Link>

                      {/* --- MY DEALS LINK --- */}
                      <Link
                        to="/deals"
                        onClick={() =>
                          setAccountOpen(
                            false
                          )
                        }
                        className="
                          mt-1
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-sm
                          font-medium
                          text-[#102c59]
                          hover:bg-[#eef7ff]
                        "
                      >
                        <Handshake className="size-4" />
                        My Deals
                      </Link>

                      <button
                        type="button"
                        disabled={loggingOut}
                        onClick={
                          handleLogout
                        }
                        className="
                          mt-1
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-2.5
                          text-left
                          text-sm
                          font-medium
                          text-red-600
                          hover:bg-red-50
                          disabled:opacity-50
                        "
                      >
                        <LogOut className="size-4" />

                        {loggingOut
                          ? "Logging out..."
                          : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/auth?mode=login"
                className="ml-2"
              >
                <Button
                  variant="ghost"
                  className="
                    h-10
                    rounded-xl
                    border
                    border-transparent
                    px-4
                    text-sm
                    font-semibold
                    text-[#102c59]
                    transition-all
                    hover:border-[#cfe4f8]
                    hover:bg-[#eef7ff]
                    hover:text-[#1687f8]
                  "
                >
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <div className="ml-auto sm:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => {
                setMobileMenuOpen(true);
                setAccountOpen(false);
                setNotificationsOpen(false);
              }}
              className="
                relative
                size-10
                rounded-xl
                text-[#102c59]
                hover:bg-[#eef7ff]
              "
            >
              <Menu className="size-6" />
              {user && unreadCount > 0 && (
                <span
                  className="
                    absolute
                    right-1.5
                    top-1.5
                    size-2.5
                    rounded-full
                    bg-red-500
                    ring-2
                    ring-[#eef7ff]
                  "
                />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[999] sm:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="
              fixed
              inset-0
              bg-black/50
              backdrop-blur-[2px]
            "
          />

          <aside
            style={{ backgroundColor: "#eef7ff" }}
            className="
              fixed
              bottom-0
              right-0
              top-0
              z-10
              flex
              h-[100dvh]
              w-[85%]
              max-w-sm
              flex-col
              border-l
              border-[#c9e0f4]
              bg-[#eef7ff]
              shadow-2xl
            "
          >
            <div
              className="
                flex
                h-[76px]
                shrink-0
                items-center
                justify-between
                border-b
                border-[#dcecfb]
                bg-[#eef7ff]
                px-4
              "
            >
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3"
              >
                <div
                  className="
                    flex
                    size-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-400/60
                    bg-blue-500/10
                    text-xl
                    text-blue-300
                  "
                >
                  🛡️
                </div>

                <span className="text-lg font-bold tracking-tight text-[#102c59]">
                  Genuine Reviews
                </span>
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={closeMobileMenu}
                className="
                  rounded-xl
                  text-[#102c59]
                  hover:bg-[#dcecfb]
                "
              >
                <X className="size-5" />
              </Button>
            </div>

            {user && (
              <div
                className="
                  shrink-0
                  border-b
                  border-[#dcecfb]
                  bg-white/60
                  px-4
                  py-4
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      border-2
                      border-[#d8e8f7]
                    "
                  >
                    {profileAvatar ? (
                      <img
                        src={profileAvatar}
                        alt={
                          profileUsername ||
                          "Profile"
                        }
                        className="
                          size-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className={`
                          flex
                          size-full
                          items-center
                          justify-center
                          text-sm
                          font-bold
                          ${getAvatarColor(
                            profileUsername ||
                              "User"
                          )}
                        `}
                      >
                        {(
                          profileUsername ||
                          "U"
                        )
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#102c59]">
                      {profileUsername ||
                        "User"}
                    </p>

                    {user.email && (
                      <p className="truncate text-xs text-[#8199b1]">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              className="
                flex-1
                space-y-1
                overflow-y-auto
                p-3
              "
            >
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-[#102c59]
                  hover:bg-white
                "
              >
                Home
              </Link>

              <Link
                to="/reviews"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-[#102c59]
                  hover:bg-white
                "
              >
                Reviews
              </Link>

              <Link
                to="/categories"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-[#102c59]
                  hover:bg-white
                "
              >
                Categories
              </Link>

              <Link
                to="/businesses"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-[#102c59]
                  hover:bg-white
                "
              >
                Businesses
              </Link>

              <div className="pt-1 pb-1">
                <Link
                  to={
                    user
                      ? "/write-review"
                      : "/auth?mode=login"
                  }
                  onClick={closeMobileMenu}
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#1687f8]
                    bg-[#1687f8]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_5px_14px_rgba(22,135,248,0.20)]
                  "
                >
                  <Pencil className="size-4" />
                  Write Review
                </Link>
              </div>

              {user && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNotificationsOpen(
                        (previous) => !previous
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-[#102c59]
                      hover:bg-white
                    "
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="size-5 text-[#8B6415]" />
                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <span
                        className="
                          flex
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-red-500
                          px-1.5
                          py-0.5
                          text-[10px]
                          font-bold
                          text-white
                        "
                      >
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  {mobileNotificationsOpen && (
                    <div
                      className="
                        mt-1
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#dcecfb]
                        bg-white
                        shadow-sm
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-2
                          border-b
                          border-[#edf3f8]
                          px-3.5
                          py-2.5
                        "
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#102c59]">
                            Recent Notifications
                          </span>

                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllAsRead}
                              className="
                                text-xs
                                font-semibold
                                text-[#1687f8]
                                hover:underline
                              "
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="flex items-center justify-between pt-0.5">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#617493] select-none">
                              <input
                                type="checkbox"
                                checked={allNotificationsSelected}
                                onChange={toggleSelectAllNotifications}
                                className="size-3.5 rounded border-[#cbd5e1] accent-[#1687f8]"
                              />
                              Select all
                            </label>

                            {selectedNotificationIds.length > 0 && (
                              <button
                                type="button"
                                onClick={deleteSelectedNotifications}
                                className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100"
                              >
                                <Trash2 className="size-3" />
                                Delete ({selectedNotificationIds.length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {notificationsLoading ? (
                          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <Bell className="mx-auto mb-2 size-6 text-[#b3914c]" />
                            <p className="text-xs font-semibold text-[#102c59]">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                handleNotificationClick(notification);
                                closeMobileMenu();
                              }}
                              className={`
                                flex
                                w-full
                                cursor-pointer
                                items-start
                                gap-2.5
                                border-b
                                border-[#edf3f8]
                                px-3.5
                                py-2.5
                                text-left
                                hover:bg-[#f4f9fe]
                                ${
                                  !notification.is_read
                                    ? "bg-[#f5faff]"
                                    : ""
                                }
                              `}
                            >
                              <div
                                className="pt-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedNotificationIds.includes(
                                    notification.id
                                  )}
                                  onChange={() =>
                                    toggleSelectNotification(notification.id)
                                  }
                                  className="size-3.5 cursor-pointer rounded border-[#cbd5e1] accent-[#1687f8]"
                                />
                              </div>

                              <div className="pt-1.5">
                                {!notification.is_read ? (
                                  <span className="block size-2 rounded-full bg-red-500" />
                                ) : (
                                  <Check className="size-3.5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`
                                    text-xs
                                    leading-4
                                    text-[#102c59]
                                    ${
                                      !notification.is_read
                                        ? "font-semibold"
                                        : ""
                                    }
                                  `}
                                >
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-[11px] text-[#8199b1]">
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="rounded-md p-1 text-[#617493] hover:bg-red-50 hover:text-red-600"
                                title="Delete notification"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user && (
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                    hover:bg-white
                  "
                >
                  <UserCircle className="size-5 text-[#1687f8]" />
                  Profile
                </Link>
              )}

              {user && businessProfileId && (
                <Link
                  to={`/business/${businessProfileId}`}
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                    hover:bg-white
                  "
                >
                  <BriefcaseBusiness className="size-5 text-[#1687f8]" />
                  Business Profile
                </Link>
              )}

              {/* --- MOBILE MY PROPOSALS LINK (Business Profile ke niche) --- */}
              {user && (
                <Link
                  to="/proposals"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                    hover:bg-white
                  "
                >
                  <FileText className="size-5 text-[#1687f8]" />
                  My Proposals
                </Link>
              )}

              {/* --- MOBILE MY DEALS LINK --- */}
              {user && (
                <Link
                  to="/deals"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                    hover:bg-white
                  "
                >
                  <Handshake className="size-5 text-[#1687f8]" />
                  My Deals
                </Link>
              )}

              {user && isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                    hover:bg-white
                  "
                >
                  Admin Dashboard
                </Link>
              )}

              {!user && !loading && (
                <Link
                  to="/auth?mode=login"
                  onClick={closeMobileMenu}
                  className="
                    mt-2
                    flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#cfe4f8]
                    bg-white
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#102c59]
                  "
                >
                  Login / Sign Up
                </Link>
              )}
            </div>

            {user && (
              <div
                className="
                  shrink-0
                  border-t
                  border-[#dcecfb]
                  bg-[#eef7ff]
                  p-3
                "
              >
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-red-600
                    hover:bg-red-50
                    disabled:opacity-50
                  "
                >
                  <LogOut className="size-5" />
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

export default Navbar;