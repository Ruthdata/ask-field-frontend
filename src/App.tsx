import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/landing/Homepage";
import SignUpAsParticipant from "./pages/auth/SignUpAsParticipant";
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
import Surveys from "./pages/dashboard/participants/Surveys";
import Earnings from "./pages/dashboard/participants/Earnings";
import Support from "./pages/dashboard/participants/Support";
import Messages from "./pages/dashboard/participants/Messages";
import ResearcherPending from "./pages/landing/ResearcherPending";
import ResearcherDashboardLayout from "./layouts/ResearcherDashboardLayout";
import ResearcherHome from "./pages/dashboard/researchers/ResearcherHome";
import Studies from "./pages/dashboard/researchers/Studies";
import NewStudy from "./pages/dashboard/researchers/NewStudy";
import CostEstimate from "./pages/dashboard/researchers/CostEstimate";
import PlanPage from "./pages/plan/PlanPage";
import { LaunchPay, LaunchReview, LaunchStatus } from "./pages/launch/LaunchPages";
import OldEditorRedirect from "./pages/plan/OldEditorRedirect";
import FinishLink from "./pages/landing/FinishLink";
import Projects from "./pages/dashboard/researchers/Projects";
import Project from "./pages/dashboard/researchers/Project";
import Wallet from "./pages/dashboard/researchers/Wallet";
import WorkspaceTeam from "./pages/dashboard/researchers/WorkspaceTeam";
import ResearcherSupport from "./pages/dashboard/researchers/HelpSupport";
import ResearcherMessages from "./pages/dashboard/researchers/Messages";
import StudyPage from "./pages/run/StudyPage";
import BookPage from "./pages/participant/BookPage";
import SurveyActions from "./pages/dashboard/researchers/SurveyActions";
import CompleteSurvey from "./pages/landing/CompleteSurvey";
import RouteSEO from "./components/SEO/RouteSEO";
import ScrollToTop from "./components/ScrollToTop";
import FoundingLabs from "./pages/landing/FoundingLabs";
import RequestCountry from "./pages/landing/RequestCountry";
import AiPilot from "./pages/landing/AiPilot";
import ResearcherSignUp from "./pages/access/ResearcherSignUp";
import CheckEmail from "./pages/access/CheckEmail";
import ConfirmEmail from "./pages/access/ConfirmEmail";
import SignIn from "./pages/access/SignIn";
import ResetAccess from "./pages/access/ResetAccess";
import LegalPending from "./pages/access/LegalPending";
import RedirectWithQuery from "./routes/RedirectWithQuery";
import SetupAbout from "./pages/setup/SetupAbout";
import SetupVerify from "./pages/setup/SetupVerify";

export default function App() {
  return (
    <div style={{ margin: "auto", fontFamily: "Inter, system-ui, Arial" }}>
      <RouteSEO />
      <ScrollToTop />
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Homepage />} />
          <Route path="waitlist" element={<Waitlist />} />
          <Route path="complete-survey" element={<CompleteSurvey />} />
          <Route path="done/:code" element={<FinishLink />} />
          <Route path="researcher-pending" element={<ResearcherPending />} />
          <Route path="founding-labs" element={<FoundingLabs />} />
          <Route path="request-a-country" element={<RequestCountry />} />
          <Route path="ai-pilot" element={<AiPilot />} />
        </Route>
        {/* Stage 1: arrive, sign up, sign in (see the "joinStudy Researcher Flow" canvas) */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/sign-up/researcher" element={<ResearcherSignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/reset-password" element={<ResetAccess />} />
        </Route>
        <Route path="/auth/researcher/check-email" element={<CheckEmail />} />
        <Route path="/auth/researcher/verify-email" element={<ConfirmEmail />} />
        <Route path="/terms" element={<LegalPending title="Terms of Service" />} />
        <Route path="/privacy" element={<LegalPending title="Privacy Policy" />} />
        {/* Old addresses → their Stage 1 replacements */}
        <Route path="/auth/sign-up/researcher/*" element={<RedirectWithQuery to="/auth/sign-up/researcher" />} />
        <Route path="/auth/login/researcher" element={<RedirectWithQuery to="/sign-in" add={{ intent: "researcher" }} />} />
        <Route path="/auth/login/participant" element={<RedirectWithQuery to="/sign-in" />} />
        <Route path="/auth/recover-password" element={<RedirectWithQuery to="/reset-password" />} />
        <Route path="/auth/reset-password" element={<RedirectWithQuery to="/reset-password" />} />
        <Route path="/auth/change-password" element={<RedirectWithQuery to="/reset-password" />} />

        {/* Participant sign-up (participant flow is redesigned separately) */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="email-sent" element={<EmailSent />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route
              path="sign-up/participant"
              element={<SignUpAsParticipant />}
            />
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
            <Route path="studies/:id/book" element={<BookPage />} />
          </Route>
        </Route>

        {/* Stage 2: account setup (outside the dashboard, its own pages) */}
        <Route element={<ProtectedRoute requiredRole="researcher" />}>
          <Route path="/setup" element={<SetupAbout />} />
          <Route path="/setup/verify" element={<SetupVerify />} />
          <Route path="/dashboard/researcher/complete-profile" element={<Navigate to="/setup" replace />} />
          {/* Stage 4: the study planner (full page, no sidebar) */}
          <Route path="/dashboard/researcher/studies/:id/plan/:step" element={<PlanPage />} />
          <Route path="/dashboard/researcher/studies/:id/plan" element={<PlanPage />} />
          {/* Stage 5: fund and launch */}
          <Route path="/dashboard/researcher/studies/:id/launch" element={<LaunchReview />} />
          <Route path="/dashboard/researcher/studies/:id/launch/pay" element={<LaunchPay />} />
          <Route path="/dashboard/researcher/studies/:id/launch/status" element={<LaunchStatus />} />
        </Route>

        {/* Researcher Dashboard */}
        <Route element={<ProtectedRoute requiredRole="researcher" />}>
          <Route
            path="/dashboard/researcher"
            element={<ResearcherDashboardLayout />}
          >
            <Route index element={<ResearcherHome />} />
            <Route path="studies" element={<Studies />} />
            <Route path="new" element={<NewStudy />} />
            <Route path="estimate" element={<CostEstimate />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<Project />} />
            <Route path="projects/:id/create-survey" element={<OldEditorRedirect />} />
            <Route path="ai-task-builder" element={<Navigate to="/dashboard/researcher/new?method=ai-evaluation" replace />} />
            <Route path="pricing-calculator" element={<Navigate to="/dashboard/researcher/estimate" replace />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="survey-actions" element={<SurveyActions />} />
            <Route path="workspace-team" element={<WorkspaceTeam />} />
            <Route path="support" element={<ResearcherSupport />} />
            <Route path="messages" element={<ResearcherMessages />} />
            <Route path="studies/:id" element={<StudyPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
