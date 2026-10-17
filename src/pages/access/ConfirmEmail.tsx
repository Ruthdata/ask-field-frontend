import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import { useConfirmResearcherEmailMutation, useResendVerificationMutation } from "@/redux/api/authApi";
import { EMAIL_RE, readProblem, saveSession } from "@/lib/session";

type View = "checking" | "done" | "already" | "expired" | "invalid" | "error";

/** Canvas 1.4. Opening the email link confirms the address and signs the researcher in, in one step. */
export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const email0 = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [view, setView] = useState<View>(email0 && token ? "checking" : "invalid");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(email0);
  const [note, setNote] = useState("");
  const [confirm] = useConfirmResearcherEmailMutation();
  const [resend, { isLoading: sending }] = useResendVerificationMutation();
  const started = useRef(false);
  const navigate = useNavigate();

  const run = async () => {
    setView("checking");
    try {
      const res = await confirm({ email: email0, token }).unwrap();
      const d = res.data;
      if (d.alreadyVerified) setView("already");
      else {
        saveSession(d);
        setName(String(d.user.firstName ?? ""));
        setView("done");
      }
    } catch (err) {
      const p = readProblem(err);
      setView(p.code === "link_expired" ? "expired" : p.code === "invalid_link" ? "invalid" : "error");
      setNote(p.code ? "" : p.message);
    }
  };

  useEffect(() => {
    // Strict mode runs effects twice in development; the link must only be used once.
    if (started.current || !email0 || !token) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendNew = async () => {
    setNote("");
    if (!EMAIL_RE.test(email.trim())) {
      setNote("Enter a valid email address.");
      return;
    }
    try {
      await resend({ email: email.trim(), accountType: "researcher" }).unwrap();
      navigate(`/auth/researcher/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      setNote(readProblem(err).message);
    }
  };

  if (view === "checking") {
    return (
      <CardPage>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="status">
          <span className="spin" aria-hidden="true" />
          <span>Confirming your email…</span>
        </div>
      </CardPage>
    );
  }

  if (view === "done") {
    return (
      <CardPage>
        <div className="icon done" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f0c93a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <h1>{name ? `You're in, ${name}` : "You're in"}</h1>
          <p className="lede">Your email is confirmed and you're signed in. Next, a few quick questions about you and your research, about a minute.</p>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <div className="meter" aria-hidden="true"><i style={{ width: "33%" }} /></div>
          <span className="label">Step 1 of 3 done: account created</span>
        </div>
        <Link className="btn btn-sun btn-block" to="/setup">
          Continue to setup
        </Link>
      </CardPage>
    );
  }

  if (view === "already") {
    return (
      <CardPage>
        <div style={{ display: "grid", gap: 10 }}>
          <h1>Your email is already confirmed</h1>
          <p className="lede">This link has been used. Sign in to carry on.</p>
        </div>
        <Link className="btn btn-ink btn-block" to={`/sign-in?intent=researcher&email=${encodeURIComponent(email0)}`}>
          Sign in
        </Link>
      </CardPage>
    );
  }

  return (
    <CardPage>
      <div className="icon late" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>{view === "expired" ? "This link has expired" : view === "error" ? "We couldn't confirm your email" : "This link doesn't work"}</h1>
        <p className="lede">
          {view === "expired"
            ? "Links last 24 hours. We'll send you a new one."
            : view === "error"
              ? "Something went wrong on our side. Try again, or ask for a new link."
              : "It may be incomplete, or a newer link replaced it. We'll send you a new one."}
        </p>
      </div>
      {view === "error" && (
        <button type="button" className="btn btn-ink btn-block" onClick={run}>
          Try again
        </button>
      )}
      <TextField id="cf-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <button type="button" className="btn btn-sun btn-block" onClick={sendNew} disabled={sending}>
        {sending ? "Sending…" : "Send a new link"}
      </button>
      <span role="status" aria-live="polite" style={{ fontSize: 15 }}>{note}</span>
      <span style={{ fontSize: 15, color: "var(--ink-2)" }}>
        Already confirmed? <Link className="text" to="/sign-in?intent=researcher">Sign in</Link>
      </span>
    </CardPage>
  );
}
