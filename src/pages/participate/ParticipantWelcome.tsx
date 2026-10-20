import { Link } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { useGetParticipantQuery } from "@/redux/api/slices/userSlice";

/** Participant canvas 1.5: signed in, with the one next step. Verification is explained, not asked for yet. */
export default function ParticipantWelcome() {
  const { data } = useGetParticipantQuery(undefined);
  const me = (data as { data?: { firstName?: string; isCompleteProfile?: boolean } } | undefined)?.data;
  const tick = (
    <span className="n done" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="m3 7.2 2.6 2.6L11 4.4" fill="none" stroke="#120e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  return (
    <CardPage right={<Link to="/dashboard/participant">Skip to home</Link>}>
      <div style={{ display: "grid", gap: 10 }}>
        <span className="label">{me?.firstName ? `Welcome, ${me.firstName}` : "Welcome"}</span>
        <h1>You're in. Now tell us a little about you.</h1>
      </div>
      <ol className="jp-steps">
        <li>{tick}<span>Account created</span></li>
        <li>{tick}<span>Email confirmed</span></li>
        <li>
          <span className="n" aria-hidden="true">3</span>
          <span style={{ display: "grid", gap: 3 }}><b>Tell us about you</b><span style={{ fontSize: 14, color: "var(--ink-2)" }}>About 3 minutes. It's how we find studies you qualify for.</span></span>
        </li>
        <li>
          <span className="n" aria-hidden="true">4</span>
          <span style={{ display: "grid", gap: 3 }}><b>Get verified, once</b><span style={{ fontSize: 14, color: "var(--ink-2)" }}>When a study you qualify for opens: a WhatsApp code and a quick selfie. Free for you.</span></span>
        </li>
      </ol>
      <p className="lede" style={{ fontSize: 15 }}>Every person on joinStudy is verified once, so researchers trust the answers they get here. That's why studies keep coming.</p>
      <Link className="btn btn-sun btn-block" to={me?.isCompleteProfile ? "/dashboard/participant" : "/participate/about"}>
        {me?.isCompleteProfile ? "Go to my studies" : "Tell us about you"}
      </Link>
    </CardPage>
  );
}
