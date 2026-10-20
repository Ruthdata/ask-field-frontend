import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { readProblem } from "@/lib/session";
import { useCompleteLinkedinMutation } from "@/redux/api/participantApi";

/** Participant Stage 2: LinkedIn sends people back here after they agree to connect. */
export default function LinkedinReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [complete] = useCompleteLinkedinMutation();
  const declined = Boolean(params.get("error") || !params.get("code") || !params.get("state"));
  const [problem, setProblem] = useState(declined ? "LinkedIn wasn't connected. You can try again from your profile." : "");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = params.get("code");
    const state = params.get("state");
    if (declined || !code || !state) return;
    complete({ code, state })
      .unwrap()
      .then(() => navigate("/dashboard/participant/profile?linkedin=connected", { replace: true }))
      .catch((err) => setProblem(readProblem(err).message));
  }, [params, complete, navigate, declined]);
  return (
    <CardPage>
      {problem ? (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            <h1>LinkedIn isn't connected</h1>
            <p className="lede">{problem}</p>
          </div>
          <Link className="btn btn-ink btn-block" to="/dashboard/participant/profile">Back to my profile</Link>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="status"><span className="spin" aria-hidden="true" /><span>Connecting LinkedIn…</span></div>
      )}
    </CardPage>
  );
}
