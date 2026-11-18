import {
  LayoutDashboard,
  MessageSquare,
  Flag,
  Users,
  Building2,
  FileText,
  Handshake,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

const adminNavItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Reviews",
    path: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: Flag,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Businesses",
    path: "/admin/businesses",
    icon: Building2,
  },
  {
    label: "Proposals",
    path: "/admin/proposals",
    icon: FileText,
  },
  {
    label: "Deals",
    path: "/admin/deals",
    icon: Handshake,
  },
];

function AdminNavigation() {
  return (
    <nav className="mt-4 sm:mt-6 overflow-x-auto rounded-xl border border-[#D6E7F7] bg-[#E7F2FF] shadow-sm scrollbar-none">
      <div className="flex min-w-max items-center gap-1 p-1 sm:p-1.5">
        {adminNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors",
                  "whitespace-nowrap",
                  isActive
                    ? "bg-[#2875F5] text-white shadow-sm"
                    : "text-[#6B8AAE] hover:bg-white hover:text-[#2875F5]",
                ].join(" ")
              }
            >
              <Icon className="size-3.5 sm:size-4" />

              <span>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default AdminNavigation;