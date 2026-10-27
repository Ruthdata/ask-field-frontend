import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/landing/Homepage";
import HomeLayout from "./layouts/HomeLayout";
import Waitlist from "./pages/landing/Waitlist";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import ParticipantDashboardLayout from "./layouts/ParticipantDashboardLayout";
import ParticipantHome from "./pages/participate/studies/Home";
import StudiesList from "./pages/participate/studies/StudiesList";
import ParticipantStudyPage from "./pages/participate/studies/StudyPage";
import HiddenStudies from "./pages/participate/studies/HiddenStudies";
import FinishCode from "./pages/participate/studies/FinishCode";
import MyStudies from "./pages/participate/after/MyStudies";
import MyDecision from "./pages/participate/after/Decision";
import AskDecision from "./pages/participate/after/Ask";
import StopEmails from "./pages/participate/StopEmails";
import NotFound from "./pages/error/NotFound";
import ParticipantProfile from "./pages/dashboard/participants/Profile";
import Money from "./pages/participate/money/Money";
import PayoutMethodPage from "./pages/participate/money/PayoutMethod";
import CashOut from "./pages/participate/money/CashOut";
import PayoutStatus from "./pages/participate/money/PayoutStatus";
import ParticipantSettings from "./pages/participate/account/Settings";
import YourData from "./pages/participate/account/YourData";
import ParticipantHelp from "./pages/participate/account/Help";
import ReportStudy from "./pages/participate/account/ReportStudy";
import { AccountClosed, ConfirmNewEmail } from "./pages/participate/account/PublicPages";
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
import JoinPage from "./pages/team/JoinPage";
import SettingsPage from "./pages/team/SettingsPage";
import ConfirmEmailChange from "./pages/team/ConfirmEmailChange";
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
import StartPage from "./pages/access/StartPage";
import IdleSignOut from "./components/IdleSignOut";
import ResetAccess from "./pages/access/ResetAccess";
import LegalPending from "./pages/access/LegalPending";
import RedirectWithQuery from "./routes/RedirectWithQuery";
import SetupAbout from "./pages/setup/SetupAbout";
import SetupVerify from "./pages/setup/SetupVerify";
import JoinCountry from "./pages/participate/JoinCountry";
import ParticipantSignUp from "./pages/participate/ParticipantSignUp";
import ParticipantCheckEmail from "./pages/participate/ParticipantCheckEmail";
import ParticipantEmailLink from "./pages/participate/ParticipantEmailLink";
import ParticipantWelcome from "./pages/participate/ParticipantWelcome";
import VerifyPage from "./pages/participate/VerifyPage";
import AboutYou from "./pages/participate/AboutYou";
import AboutDone from "./pages/participate/AboutDone";
import LinkedinReturn from "./pages/participate/LinkedinReturn";

export default function App() {
  return (
    <div style={{ margin: "auto", fontFamily: "Inter, system-ui, Arial" }}>
      <RouteSEO />
      <ScrollToTop />
      <Toaster />
      <IdleSignOut />
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
          {/* Alpha feedback: choose researcher or participant before any form */}
          <Route path="/start" element={<StartPage />} />
          <Route path="/reset-password" element={<ResetAccess />} />
        </Route>
        <Route path="/auth/researcher/check-email" element={<CheckEmail />} />
        <Route path="/auth/researcher/verify-email" element={<ConfirmEmail />} />
        <Route path="/join/:token" element={<JoinPage />} />
        <Route path="/settings/confirm-email" element={<ConfirmEmailChange />} />
        <Route path="/terms" element={<LegalPending title="Terms of Service" />} />
        <Route path="/privacy" element={<LegalPending title="Privacy Policy" />} />
        {/* Old addresses → their Stage 1 replacements */}
        <Route path="/auth/sign-up/researcher/*" element={<RedirectWithQuery to="/auth/sign-up/researcher" />} />
        <Route path="/auth/login/researcher" element={<RedirectWithQuery to="/sign-in" add={{ intent: "researcher" }} />} />
        <Route path="/auth/login/participant" element={<RedirectWithQuery to="/sign-in" add={{ intent: "participant" }} />} />
        <Route path="/auth/recover-password" element={<RedirectWithQuery to="/reset-password" />} />
        <Route path="/auth/reset-password" element={<RedirectWithQuery to="/reset-password" />} />
        <Route path="/auth/change-password" element={<RedirectWithQuery to="/reset-password" />} />

        {/* Participant Stage 1 (see the "joinStudy Participant Flow" canvas) */}
        <Route element={<PublicRoute />}>
          <Route path="/participate" element={<JoinCountry />} />
          <Route path="/participate/sign-up" element={<ParticipantSignUp />} />
        </Route>
        <Route path="/participate/check-email" element={<ParticipantCheckEmail />} />
        <Route path="/auth/verify-email" element={<ParticipantEmailLink />} />
        <Route path="/participate/stop-emails" element={<StopEmails />} />
        {/* Participant Stage 7: confirm a new email (no sign-in needed), and after closing */}
        <Route path="/participate/confirm-email" element={<ConfirmNewEmail />} />
        <Route path="/participate/closed" element={<AccountClosed />} />
        <Route element={<ProtectedRoute requiredRole="participant" />}>
          <Route path="/participate/welcome" element={<ParticipantWelcome />} />
          <Route path="/participate/verify" element={<VerifyPage />} />
          {/* Participant Stage 2: about you */}
          <Route path="/participate/about" element={<AboutYou />} />
          <Route path="/participate/about/done" element={<AboutDone />} />
          <Route path="/participate/linkedin" element={<LinkedinReturn />} />
          <Route path="/dashboard/participant/complete-profile" element={<Navigate to="/participate/about" replace />} />
        </Route>
        {/* Old participant addresses */}
        <Route path="/auth/sign-up/participant" element={<Navigate to="/participate" replace />} />
        <Route path="/auth/email-sent" element={<RedirectWithQuery to="/participate/check-email" />} />
        {/* Dashboard Routes */}
        {/* Participant Dashboard */}
        <Route element={<ProtectedRoute requiredRole="participant" />}>
          <Route
            path="/dashboard/participant"
            element={<ParticipantDashboardLayout />}
          >
            <Route index element={<ParticipantHome />} />
            <Route path="profile" element={<ParticipantProfile />} />
            {/* Participant Stage 3: finding studies */}
            <Route path="studies" element={<StudiesList />} />
            <Route path="studies/hidden" element={<HiddenStudies />} />
            <Route path="studies/:id" element={<ParticipantStudyPage />} />
            <Route path="studies/:id/finish" element={<FinishCode />} />
            {/* Participant Stage 5: after a study */}
            <Route path="my-studies" element={<MyStudies />} />
            <Route path="my-studies/:id" element={<MyDecision />} />
            <Route path="my-studies/:id/ask" element={<AskDecision />} />
            <Route path="surveys" element={<Navigate to="/dashboard/participant/studies" replace />} />
            {/* Participant Stage 6: get paid */}
            <Route path="earnings" element={<Money />} />
            <Route path="earnings/method" element={<PayoutMethodPage />} />
            <Route path="earnings/cash-out" element={<CashOut />} />
            <Route path="earnings/payouts/:id" element={<PayoutStatus />} />
            {/* Participant Stage 7: account and help */}
            <Route path="settings" element={<ParticipantSettings />} />
            <Route path="settings/data" element={<YourData />} />
            <Route path="help" element={<ParticipantHelp />} />
            <Route path="studies/:id/report" element={<ReportStudy />} />
            <Route path="support" element={<Navigate to="/dashboard/participant/help" replace />} />
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
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
