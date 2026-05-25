import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/landing/Homepage";
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
import ParticipantDashboardLayout from "./layouts/ParticipantDashboardLayout";
import ParticipantDashboardHome from "./pages/dashboard/participants/ParticipantDashboardHome";
import NotFound from "./pages/error/NotFound";
import CompleteParticipantProfile from "./pages/dashboard/participants/CompleteProfile";
import CompleteResearcherProfile from "./pages/dashboard/researchers/CompleteProfile";
import Surveys from "./pages/dashboard/participants/Surveys";
import Earnings from "./pages/dashboard/participants/Earnings";
import Support from "./pages/dashboard/participants/Support";
import Messages from "./pages/dashboard/participants/Messages";
import RecoverPassword from "./pages/auth/RecoverPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import OrganizationName from "./pages/auth/OrganizationName";
import JobTitle from "./pages/auth/JobTitle";
import VerifyResearcherEmail from "./pages/auth/VerifyResearcherEmail";
import LoginParticipant from "./pages/auth/LoginParticipant";
import LoginResearcher from "./pages/auth/LoginResearcher";
import ResearcherPending from "./pages/landing/ResearcherPending";
import ResearcherDashboardLayout from "./layouts/ResearcherDashboardLayout";
import ResearcherDashboardHome from "./pages/dashboard/researchers/ResearcherDashboardHome";
import Projects from "./pages/dashboard/researchers/Projects";
import Project from "./pages/dashboard/researchers/Project";
import CreateSurvey from "./pages/dashboard/researchers/CreateSurvey";
import AiTaskBuilder from "./pages/dashboard/researchers/AiTaskBuilder";
import PricingCalculator from "./pages/dashboard/researchers/PricingCalculator";
import Wallet from "./pages/dashboard/researchers/Wallet";
import WorkspaceTeam from "./pages/dashboard/researchers/WorkspaceTeam";
import ResearcherSupport from "./pages/dashboard/researchers/HelpSupport";
import ResearcherMessages from "./pages/dashboard/researchers/Messages";
import SurveyActions from "./pages/dashboard/researchers/SurveyActions";
import CompleteSurvey from "./pages/landing/CompleteSurvey";
import RouteSEO from "./components/SEO/RouteSEO";

export default function App() {
  return (
    <div style={{ margin: "auto", fontFamily: "Inter, system-ui, Arial" }}>
      <RouteSEO />
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Homepage />} />
          <Route path="waitlist" element={<Waitlist />} />
          <Route path="complete-survey" element={<CompleteSurvey />} />
          <Route path="researcher-pending" element={<ResearcherPending />} />
        </Route>
        {/* AuthRoutes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login/participant" element={<LoginParticipant />} />
            <Route path="login/researcher" element={<LoginResearcher />} />
            <Route path="email-sent" element={<EmailSent />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route
              path="researcher/verify-email"
              element={<VerifyResearcherEmail />}
            />
            <Route path="recover-password" element={<RecoverPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route
              path="sign-up/participant"
              element={<SignUpAsParticipant />}
            />
            <Route path="sign-up/researcher" element={<SignUpAsResearcher />} />
            <Route
              path="sign-up/researcher/country"
              element={<SignupCountry />}
            />
            <Route
              path="sign-up/researcher/organization-type"
              element={<OrganizationType />}
            />
            <Route
              path="sign-up/researcher/organization-name"
              element={<OrganizationName />}
            />
            <Route
              path="sign-up/researcher/register-name"
              element={<RegisterName />}
            />
            <Route path="sign-up/researcher/job-title" element={<JobTitle />} />
            <Route path="sign-up/researcher/password" element={<Password />} />
          </Route>
        </Route>
        {/* Dashboard Routes */}
        {/* Participant Dashboard */}
        <Route element={<ProtectedRoute requiredRole="participant" />}>
          <Route
            path="/dashboard/participant"
            element={<ParticipantDashboardLayout />}
          >
            <Route index element={<ParticipantDashboardHome />} />
            <Route
              path="complete-profile"
              element={<CompleteParticipantProfile />}
            />
            <Route path="surveys" element={<Surveys />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="support" element={<Support />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>

        {/* Researcher Dashboard */}
        <Route element={<ProtectedRoute requiredRole="researcher" />}>
          <Route
            path="/dashboard/researcher"
            element={<ResearcherDashboardLayout />}
          >
            <Route index element={<ResearcherDashboardHome />} />
            <Route
              path="complete-profile"
              element={<CompleteResearcherProfile />}
            />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<Project />} />
            <Route
              path="projects/:id/create-survey"
              element={<CreateSurvey />}
            />
            <Route path="ai-task-builder" element={<AiTaskBuilder />} />
            <Route path="pricing-calculator" element={<PricingCalculator />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="survey-actions" element={<SurveyActions />} />
            <Route path="workspace-team" element={<WorkspaceTeam />} />
            <Route path="support" element={<ResearcherSupport />} />
            <Route path="messages" element={<ResearcherMessages />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
