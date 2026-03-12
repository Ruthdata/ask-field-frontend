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

export default function App() {
  return (
    <div style={{ margin: "auto", fontFamily: "Inter, system-ui, Arial" }}>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Homepage />} />
          <Route path="waitlist" element={<Waitlist />} />
        </Route>
        <Route path="/auth" element={<Outlet />}>
          <Route path="login" element={<Login />} />
          <Route path="email-sent" element={<EmailSent />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="sign-up/participant" element={<SignUpAsParticipant />} />
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
      </Routes>
    </div>
  );
}
