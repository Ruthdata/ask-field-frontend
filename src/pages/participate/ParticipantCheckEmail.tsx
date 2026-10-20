import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import PasswordField from "@components/auth/PasswordField";
import { useResendVerificationMutation } from "@/redux/api/authApi";
import { useChangeUnconfirmedEmailMutation } from "@/redux/api/participantApi";
import { EMAIL_RE, readProblem } from "@/lib/session";

const GAP = 60;

/** Participant canvas 1.3: resend that works, and a way to fix a mistyped address. */
export default function ParticipantCheckEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") ?? "";
  const [wait, setWait] = useState(GAP); // we just sent one
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [fixErr, setFixErr] = useState("");
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [change, { isLoading: changing }] = useChangeUnconfirmedEmailMutation();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const again = async () => {
    setNote("");
    try {
      await resend({ email, accountType: "participant" }).unwrap();
      setNote("Sent again. It can take a minute; check spam and promotions too.");
      setWait(GAP);
    } catch (err) {
      const p = readProblem(err);
      const retry = Number(p.data?.retryAfter);
      if (p.code === "too_soon" && retry > 0) setWait(retry);
      setNote(p.message);
    }
  };

  const fix = async (e: FormEvent) => {
    e.preventDefault();
    setFixErr("");
    if (!EMAIL_RE.test(newEmail.trim())) return setFixErr("Enter a valid email address.");
    if (!password) return setFixErr("Enter the password you just chose.");
    try {
      const r = await change({ email, password, newEmail: newEmail.trim() }).unwrap();
      setEditing(false);
      setPassword("");
      setWait(GAP);
      setNote(`We sent a new link to ${r.data.email}.`);
      navigate(`/participate/check-email?email=${encodeURIComponent(r.data.email)}`, { replace: true });
    } catch (err) {
      setFixErr(readProblem(err).message);
    }
  };

  return (
    <CardPage>
      <div className="icon" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#251d00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
        </svg>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>Check your email</h1>
        <p className="lede">
          We sent a link to {email ? <b>{email}</b> : "your email"}. Tap it to confirm your email and sign in. It works for 24 hours.
        </p>
      </div>
      <div className="two">
        <a className="btn btn-ink" href="https://mail.google.com/mail/u/0/#search/from%3Ajoinstudy.io" target="_blank" rel="noopener noreferrer">Open Gmail</a>
        <a className="btn btn-outline" href="https://outlook.live.com/mail/0/" target="_blank" rel="noopener noreferrer">Open Outlook</a>
      </div>

      {editing && (
        <form onSubmit={fix} noValidate style={{ display: "grid", gap: 14, padding: 16, borderRadius: 16, background: "var(--mist)" }}>
          <TextField id="ce-new" label="Correct email" type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" />
          <PasswordField id="ce-pass" label="The password you just chose" value={password} onChange={setPassword} autoComplete="current-password" />
          {fixErr && <div className="alert warn" role="alert"><span>{fixErr}</span></div>}
          <div className="two">
            <button type="submit" className="btn btn-ink" disabled={changing} aria-busy={changing}>{changing ? "Sending…" : "Send the link here"}</button>
            <button type="button" className="btn btn-line" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="more">
        <div className="row">
          <span>Didn't get it? Look in spam or promotions.</span>
          {email && (
            <button type="button" className="btn btn-line" style={{ height: 44 }} onClick={again} disabled={wait > 0 || isLoading}>
              {wait > 0 ? `Send again in ${wait}s` : isLoading ? "Sending…" : "Send the link again"}
            </button>
          )}
        </div>
        <span role="status" aria-live="polite">{note}</span>
        {!editing && email && (
          <span>
            Wrong email?{" "}
            <button type="button" className="linkbtn" onClick={() => setEditing(true)} style={{ height: 32 }}>
              Change it
            </button>
          </span>
        )}
        <span>
          Already confirmed? <Link className="text" to="/sign-in?intent=participant">Sign in</Link>
        </span>
      </div>
    </CardPage>
  );
}
