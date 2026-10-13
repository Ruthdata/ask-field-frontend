import { Link, Navigate } from "react-router-dom";
import { PublicPage } from "@components/marketing/PublicPage";
import { dashboardPath, ROUTES } from "@/lib/site";

export default function SignIn() {
  const dash = dashboardPath();
  if (dash) return <Navigate to={dash} replace />;
  return (
    <PublicPage label="Sign in" title="Welcome back." lede="Which account are you signing in to?">
      <div className="choose">
        <Link to="/auth/login/researcher">
          <span><b>Researcher</b><small>Run studies and review submissions</small></span>
          <span className="arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/auth/login/participant">
          <span><b>Participant</b><small>Take studies and get paid</small></span>
          <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      <p className="after">
        New here? <Link to={ROUTES.researcherSignup}>Start a study</Link> or <Link to={ROUTES.participantSignup}>start earning</Link>.
      </p>
    </PublicPage>
  );
}
