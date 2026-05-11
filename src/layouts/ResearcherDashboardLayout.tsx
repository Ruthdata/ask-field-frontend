import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  DollarSign,
  HelpCircle,
  Folder,
  MessageSquare,
  WalletMinimal,
  Users,
  CircleQuestionMark,
  MessageCircleMore,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useCurrentUser } from "@hooks/useCurrentUser";

const navigation = [
  { name: "Dashboard", href: "/dashboard/researcher", icon: Home },
  {
    name: "My Projects",
    href: "/dashboard/researcher/projects",
    icon: Folder,
  },
  {
    name: "Wallet",
    href: "/dashboard/researcher/wallet",
    icon: WalletMinimal,
  },
  {
    name: "Workspace Team",
    href: "/dashboard/researcher/workspace-team",
    icon: Users,
  },
  {
    name: "Help & Support",
    href: "/dashboard/researcher/support",
    icon: CircleQuestionMark,
  },
  {
    name: "Messages",
    href: "/dashboard/researcher/messages",
    icon: MessageCircleMore,
  },
];

export default function ResearcherDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isCompleteProfilePage = pathname.includes("/complete-profile");

  const { loading, getResearcherInitials, getResearcherFullName, researcher } =
    useCurrentUser();

  useEffect(() => {
    if (!loading && researcher) {
      const isComplete =
        researcher.isCompleteProfile ||
        localStorage.getItem("researcher_profile_complete") === "true";

      const skipRedirect =
        searchParams.get("skipCompleteProfileRedirect") === "true";

      if (isComplete && pathname === "/dashboard/researcher/complete-profile") {
        navigate("/dashboard/researcher");
        return;
      }

      const isDashboardRoute =
        pathname.startsWith("/dashboard/researcher") &&
        pathname !== "/dashboard/researcher/complete-profile";

      if (!isComplete && isDashboardRoute && !skipRedirect) {
        navigate("/dashboard/researcher/complete-profile");
        return;
      }
    }
  }, [researcher, loading, pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      {/* <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200"> */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 transition-all ${
          isCompleteProfilePage
            ? "opacity-80 pointer-events-none filter-[blur(1px)]"
            : ""
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">a</span>
          </div>
          <span className="text-lg font-semibold">
            ask<span className="text-yellow-500">Field</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-yellow-50 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Refer Card */}
        <div className="m-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Refer to Earn
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Refer your friends to get free credits when they launch a study
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-gray-900/50"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <span className="text-lg font-semibold">askField</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-yellow-50 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Workspace */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <span className="text-sm font-medium text-gray-900">
                {loading ? "Loading..." : getResearcherFullName()}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {loading ? "..." : getResearcherInitials()}
            </div>
          </div>
        </header>

        <main className="p-6">{<Outlet />}</main>
      </div>
    </div>
  );
}
