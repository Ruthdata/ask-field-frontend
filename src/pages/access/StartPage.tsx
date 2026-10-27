import { Link } from "react-router-dom";
import { AuthShell } from "@components/auth/AuthShell";
import { ROUTES, researcherSignup } from "@/lib/site";

/**
 * Alpha feedback: "Start" on the homepage asks how someone wants to use joinStudy before any form,
 * so participants don't land in researcher sign-up (and the reverse). Each choice leads to its own
 * sign-up, or to sign-in with the matching intent.
 */
export default function StartPage() {
  const side = (
    <>
      <div className="story">
        <h2>Two ways to use joinStudy.</h2>
        <p className="lead">Researchers reach the people their research is missing. Participants get paid for their views.</p>
      </div>
      <p className="foot">Free to join. Researchers pay only when a study launches.</p>
    </>
  );

  return (
    <AuthShell side={side}>
      <div className="auth-form start-form">
        <div style={{ display: "grid", gap: 10 }}>
          <h1>How do you want to use joinStudy?</h1>
          <p className="sub">Choose one. You can add the other kind of account later.</p>
        </div>

        <section className="role-card" aria-labelledby="role-r">
          <span className="role-label">Researchers</span>
          <h2 id="role-r">I want to run a study</h2>
          <p>Surveys, interviews, focus groups and product tests, with verified people in Nigeria, Ghana and Kenya.</p>
          <div className="role-actions">
            <Link className="btn btn-ink" to={researcherSignup("start")}>Start a study</Link>
            <Link className="btn btn-line" to="/sign-in?intent=researcher">I have an account</Link>
          </div>
        </section>

        <section className="role-card earn" aria-labelledby="role-p">
          <span className="role-label">Participants</span>
          <h2 id="role-p">I want to take part and earn</h2>
          <p>Answer studies from researchers around the world and get paid to your bank, mobile money or airtime.</p>
          <div className="role-actions">
            <Link className="btn btn-ink" to={ROUTES.participantSignup}>Start earning</Link>
            <Link className="btn btn-line" to="/sign-in?intent=participant">I have an account</Link>
          </div>
        </section>
      </div>
    </AuthShell>
  );
}
