import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/landing/Homepage";
import Login from "./pages/auth/Login";
import SignUpAsResearcher from "./pages/auth/SignUpAsResearcher";
import SignUpAsParticipant from "./pages/auth/SignUpAsParticipant";
import SignupCountry from "./pages/auth/SignupCountry";
import OrganizationType from "./pages/auth/OrganizationType";
import RegisterName from "./pages/auth/RegisterName";
import Password from "./pages/auth/Password";
import HomeLayout from "./layouts/HomeLayout";
import EmailSent from "./pages/auth/EmailSent";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Waitlist from "./pages/landing/Waitlist";
import PublicRoute from "./routes/PublicRoute";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ParticipantDashboardHome from "./pages/dashboard/participants/ParticipantDashboardHome";
import NotFound from "./pages/error/NotFound";
import CompleteProfile from "./pages/dashboard/participants/CompleteProfile";
import Surveys from "./pages/dashboard/participants/Surveys";
import Earnings from "./pages/dashboard/participants/Earnings";
import Support from "./pages/dashboard/participants/Support";
import Messages from "./pages/dashboard/participants/Messages";
import RecoverPassword from "./pages/auth/RecoverPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";

export default function App() {
  return (
    <div style={{ margin: "auto", fontFamily: "Inter, system-ui, Arial" }}>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Homepage />} />
          <Route path="waitlist" element={<Waitlist />} />
        </Route>
        {/* AuthRoutes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="email-sent" element={<EmailSent />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="recover-password" element={<RecoverPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route
              path="sign-up/participant"
              element={<SignUpAsParticipant />}
            />
            <Route path="sign-up/researcher" element={<SignUpAsResearcher />} />
            <Route
              path="sign-up/participant/country"
              element={<SignupCountry />}
            />
            <Route
              path="sign-up/participant/organization-name"
              element={<OrganizationType />}
            />
            <Route
              path="sign-up/participant/register-name"
              element={<RegisterName />}
            />
            <Route path="sign-up/participant/password" element={<Password />} />
          </Route>
        </Route>
        {/* Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/participant" element={<DashboardLayout />}>
            <Route index element={<ParticipantDashboardHome />} />
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="support" element={<Support />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
