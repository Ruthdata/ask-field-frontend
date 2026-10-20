import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  FileText,
  DollarSign,
  HelpCircle,
  MessageCircleMore,
  LogOut,
  UserRound,
  ClipboardList,
  Settings,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { LogoMark } from "@components/marketing/Logo";
import VerifyBanner from "@/pages/participate/VerifyBanner";
import { clearAuthStorage } from "@/utils/token";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@hooks/useCurrentUser";

const navigation = [
  { name: "Dashboard", href: "/dashboard/participant", icon: Home },
  { name: "Studies", href: "/dashboard/participant/studies", icon: FileText },
  { name: "My studies", href: "/dashboard/participant/my-studies", icon: ClipboardList },
  {
    name: "Money",
    href: "/dashboard/participant/earnings",
    icon: DollarSign,
  },
  { name: "Profile", href: "/dashboard/participant/profile", icon: UserRound },
  {
    name: "Messages",
    href: "/dashboard/participant/messages",
    icon: MessageCircleMore,
  },
  { name: "Settings", href: "/dashboard/participant/settings", icon: Settings },
  { name: "Help", href: "/dashboard/participant/help", icon: HelpCircle },
];

// Pages that show their own verify prompt (Stage 3), or don't need one.
const OWN_PROMPT = /^\/dashboard\/participant(\/(studies.*|my-studies.*|earnings.*|profile|settings.*|help))?\/?$/;

export default function ParticipantDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;


  const { loading, getParticipantInitials, participant } = useCurrentUser();
  const dispatch = useDispatch();
  // Participant Stage 1: there was no way to sign out.
  const signOut = () => {
    clearAuthStorage();
    dispatch(apiSlice.util.resetApiState());
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (loading) return;

    if (!participant) {
      navigate("/sign-in?intent=participant");
      return;
    }

    if (participant.userType === "researcher") {
      navigate("/dashboard/researcher");
      return;
    }
    // Participant Stage 3: no forced redirect for an unfinished profile; home shows a checklist instead.
  }, [participant, loading, pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      {/* <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200"> */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <LogoMark />
          <span className="text-lg font-semibold">joinStudy</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dashboard/participant" ? pathname === item.href : pathname.startsWith(item.href);

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
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="m-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Sign out
        </button>
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
              <span className="text-lg font-semibold">joinStudy</span>
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="p-2 -mr-2">
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/dashboard/participant" ? pathname === item.href : pathname.startsWith(item.href);

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
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                Sign out
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>

            {/* Avatar: opens the profile */}
            <Link to="/dashboard/participant/profile" aria-label="Your profile" className="ml-auto w-10 h-10 rounded-full bg-[#120e22] flex items-center justify-center text-[#f0c93a] font-semibold no-underline">
              {loading ? "…" : getParticipantInitials()}
            </Link>
          </div>
        </header>

        <main className="p-6">
          {participant?.isCompleteProfile && !OWN_PROMPT.test(pathname) && <VerifyBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
