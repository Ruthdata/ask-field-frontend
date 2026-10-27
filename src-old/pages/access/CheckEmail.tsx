import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { useResendVerificationMutation } from "@/redux/api/authApi";
import { readProblem } from "@/lib/session";

const GAP = 60;

/** Canvas 1.3. Replaces the old "Welcome! You can now start creating surveys" popup. */
export default function CheckEmail() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [wait, setWait] = useState(GAP); // we just sent one
  const [note, setNote] = useState("");
  const [resend, { isLoading }] = useResendVerificationMutation();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const again = async () => {
    setNote("");
    try {
      await resend({ email, accountType: "researcher" }).unwrap();
      setNote("Sent again. Check your inbox.");
      setWait(GAP);
    } catch (err) {
      const p = readProblem(err);
      const retry = Number(p.data?.retryAfter);
      if (p.code === "too_soon" && retry > 0) setWait(retry);
      setNote(p.message);
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
        {email ? (
          <p className="lede">
            We sent a confirmation link to <b>{email}</b>. Open it to finish creating your account.
          </p>
        ) : (
          <p className="lede">We sent you a confirmation link. Open it to finish creating your account.</p>
        )}
      </div>
      <div className="two">
        <a className="btn btn-ink" href="https://mail.google.com/mail/u/0/#search/from%3Ajoinstudy.io" target="_blank" rel="noopener noreferrer">
          Open Gmail
        </a>
        <a className="btn btn-outline" href="https://outlook.live.com/mail/0/" target="_blank" rel="noopener noreferrer">
          Open Outlook
        </a>
      </div>
      <div className="more">
        <div className="row">
          <span>Didn't get it? Look in spam or promotions.</span>
          {email && (
            <button type="button" className="btn btn-line" style={{ height: 44 }} onClick={again} disabled={wait > 0 || isLoading}>
              {wait > 0 ? `Resend in ${wait}s` : isLoading ? "Sending…" : "Resend email"}
            </button>
          )}
        </div>
        <span role="status" aria-live="polite">{note}</span>
        <span>
          Wrong address? <Link className="text" to="/auth/sign-up/researcher">Sign up with a different email</Link>
        </span>
      </div>
    </CardPage>
  );
}
