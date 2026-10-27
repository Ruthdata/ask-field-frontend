import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import SetupHeader from "./SetupHeader";
import { useGetResearcherQuery } from "@/redux/api/slices/userSlice";
import { VERIFIABLE, useConfirmWorkEmailMutation, useGetPricingQuery, useSendWorkEmailCodeMutation, useSubmitStaffLinkMutation } from "@/redux/api/setupApi";
import { EMAIL_RE, readProblem } from "@/lib/session";

const GAP = 60;
const pct = (n?: number) => (typeof n === "number" ? `${Math.round(n * 1000) / 10}%` : "");

const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0c93a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** Canvas 2.2: optional. A recognised university email is verified already; otherwise a work-email code or a staff page. */
export default function SetupVerify() {
  const { data, isLoading, isFetching } = useGetResearcherQuery();
  const me = data?.data;
  const pricing = useGetPricingQuery().data?.data;
  const [way, setWay] = useState<"email" | "link">("email");
  const [workEmail, setWorkEmail] = useState("");
  const [codeSentTo, setCodeSentTo] = useState("");
  const [code, setCode] = useState("");
  const [url, setUrl] = useState("");
  const [wait, setWait] = useState(0);
  const [error, setError] = useState("");
  const [send, { isLoading: sending }] = useSendWorkEmailCodeMutation();
  const [confirm, { isLoading: confirming }] = useConfirmWorkEmailMutation();
  const [submitLink, { isLoading: linking }] = useSubmitStaffLinkMutation();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // Wait for fresh data: the copy cached before setup was saved still says setup isn't done.
  if (isLoading || isFetching || !me) {
    return (
      <CardPage>
        <div role="status" style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="spin" aria-hidden="true" />Loading…</div>
      </CardPage>
    );
  }
  if (!me.isCompleteProfile) return <Navigate to="/setup" replace />;
  if (!VERIFIABLE.includes(me.organizationType)) return <Navigate to="/dashboard/researcher" replace />;

  const status = me.institutionVerification?.status ?? "none";

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!EMAIL_RE.test(workEmail.trim())) return setError("Enter your work email.");
    try {
      const res = await send({ email: workEmail.trim() }).unwrap();
      if (!res.data.alreadyVerified) {
        setCodeSentTo(res.data.email ?? workEmail.trim());
        setCode("");
        setWait(GAP);
      }
    } catch (err) {
      const p = readProblem(err);
      if (p.code === "too_soon") setWait(Number(p.data?.retryAfter) || GAP);
      setError(p.message);
    }
  };

  const confirmCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code.trim())) return setError("Enter the 6-digit code.");
    try {
      await confirm({ code: code.trim() }).unwrap();
    } catch (err) {
      setError(readProblem(err).message);
    }
  };

  const sendLink = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^https?:\/\/\S+\.\S+/i.test(url.trim())) return setError("Enter the full link, starting with https://");
    try {
      await submitLink({ url: url.trim() }).unwrap();
    } catch (err) {
      setError(readProblem(err).message);
    }
  };

  const header = <SetupHeader name={`${me.firstName} ${me.lastName}`.trim()} email={me.email} />;
  const dashboard = (
    <Link className="btn btn-sun btn-block" to="/dashboard/researcher">Go to my dashboard</Link>
  );

  return (
    <CardPage right={header}>
      <div style={{ display: "grid", gap: 10 }}>
        <div className="bars" aria-hidden="true"><span className="on" /><span className="on" /><span className="on" /></div>
        <span className="label">Step 3 of 3 · optional</span>
        <h1>Verify your institution</h1>
      </div>

      <ul className="perks">
        <li><i><Tick /></i><span>A verified badge on your studies, so participants know the research is real.</span></li>
        <li>
          <i><Tick /></i>
          <span>
            The academic fee{pricing ? `: ${pct(pricing.academicFeeRate)} instead of ${pct(pricing.platformFeeRate)}` : ""}, added to what you pay participants.
          </span>
        </li>
      </ul>

      {status === "verified" && (
        <>
          <div className="done-box" role="status">
            <span className="tick"><Tick /></span>
            <div>
              <b>You're verified</b>
              <span>
                {me.institutionVerification?.method === "sign-in-email"
                  ? `${me.email} is a recognised university email, so there's nothing more to do.`
                  : "Thanks. Your badge and the academic fee are on."}
              </span>
            </div>
          </div>
          {dashboard}
        </>
      )}

      {status === "pending" && (
        <>
          <div className="alert plain" role="status">
            <b>Sent for review</b>
            <span>We'll check it and email you within 2 working days. You can build and launch studies in the meantime.</span>
          </div>
          {dashboard}
        </>
      )}

      {(status === "none" || status === "rejected") && (
        <>
          {status === "rejected" && (
            <div className="alert warn" role="alert">
              <span>We couldn't verify your last request{me.institutionVerification?.note ? `: ${me.institutionVerification.note}` : "."} Try another way.</span>
            </div>
          )}
          <p className="lede" style={{ fontSize: 16 }}>We couldn't tell from your sign-in email. Choose one way to show where you work:</p>

          <div style={{ display: "grid", gap: 10 }} role="radiogroup" aria-label="How to verify">
            <button type="button" role="radio" aria-checked={way === "email"} className="opt-card" onClick={() => { setWay("email"); setError(""); }}>
              <b>Confirm your work email</b>
              <span>We'll send a 6-digit code to your university or organisation address.</span>
            </button>
            {way === "email" &&
              (codeSentTo ? (
                <form className="inline-form" onSubmit={confirmCode} noValidate>
                  <div className="field">
                    <label htmlFor="vf-code">Code sent to {codeSentTo}</label>
                    <input id="vf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-invalid={!!error} />
                  </div>
                  <button type="submit" className="btn btn-ink" disabled={confirming}>{confirming ? "Checking…" : "Confirm"}</button>
                  <button type="button" className="linkbtn" style={{ fontSize: 14.5, flexBasis: "100%" }} onClick={() => sendCode()} disabled={wait > 0 || sending}>
                    {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
                  </button>
                </form>
              ) : (
                <form className="inline-form" onSubmit={sendCode} noValidate>
                  <TextField id="vf-email" label="Work email" type="email" value={workEmail} onChange={setWorkEmail} autoComplete="email" placeholder="you@institution.ac.ng" />
                  <button type="submit" className="btn btn-ink" disabled={sending || wait > 0}>{sending ? "Sending…" : wait > 0 ? `Wait ${wait}s` : "Send code"}</button>
                </form>
              ))}

            <button type="button" role="radio" aria-checked={way === "link"} className="opt-card" onClick={() => { setWay("link"); setError(""); }}>
              <b>Share a staff or student page</b>
              <span>A page on your institution's website that shows your name. We check it within 2 working days.</span>
            </button>
            {way === "link" && (
              <form className="inline-form" onSubmit={sendLink} noValidate>
                <TextField id="vf-link" label="Page link" value={url} onChange={setUrl} placeholder="https://" />
                <button type="submit" className="btn btn-ink" disabled={linking}>{linking ? "Sending…" : "Send for review"}</button>
              </form>
            )}
          </div>

          {error && <div className="alert warn" role="alert"><span>{error}</span></div>}

          <div className="actions">
            <Link to="/dashboard/researcher" style={{ fontWeight: 600 }}>Skip for now</Link>
            <span style={{ fontSize: 14, color: "var(--mute)" }}>You can come back to this any time. Until then you pay the standard fee.</span>
          </div>
        </>
      )}
    </CardPage>
  );
}
