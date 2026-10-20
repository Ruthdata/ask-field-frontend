import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useCloseAccountMutation,
  useGetAccountQuery,
  useGetCloseCheckQuery,
  useSetEmailPrefsMutation,
  useUpdateNameMutation,
  type AccountSettings,
  type EmailPrefs,
} from "@/redux/api/accountApi";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { readProblem } from "@/lib/session";
import { formatMoney } from "@/lib/study";
import { useGetHomeQuery } from "@/redux/api/homeApi";
import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { clearAuthStorage } from "@/utils/token";
import "@/styles/run.css";

/** Stage 9: your own account. Organisation details live on the setup page and are shared with your workspace. */
export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useGetAccountQuery(undefined, { refetchOnMountOrArgChange: true });
  const a = data?.data;
  return (
    <div className="ja-page">
      <h1 className="ja-h1">Settings</h1>
      <p className="ja-lede">Your own account. Organisation details and verification are shared with your workspace.</p>
      {isLoading && <div className="ja-skeleton" style={{ height: 320 }} aria-busy="true" />}
      {isError && <div className="ja-error" role="alert">We couldn't load your settings. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>}
      {a && (
        <div className="ja-cols">
          <div className="ja-col-main">
            <You a={a} />
            <Email a={a} />
            <Password a={a} />
            <Emails a={a} />
          </div>
          <div className="ja-col-side">
            <section className="ja-card" aria-labelledby="org-h" style={{ gap: 10 }}>
              <h2 id="org-h" className="ja-h3">Organisation</h2>
              <span>{a.organization.name || "Independent researcher"}{a.organization.country ? ` · ${a.organization.country}` : ""}</span>
              <span className="ja-small">{a.organization.verification === "verified" ? "✓ Verified" : a.organization.verification === "pending" ? "Verification in progress" : "Not verified"}</span>
              <Link to="/setup" className="ja-link">Edit organisation details</Link>
            </section>
            <Close />
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="ja-card" aria-labelledby={id}>
      <h2 id={id} className="ja-h3">{title}</h2>
      {children}
    </section>
  );
}
function Field({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="jr-field" style={{ flex: "1 1 220px" }}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="ja-small">{hint}</span>}
    </div>
  );
}
function Status({ ok, problem }: { ok: string; problem: string }) {
  return (
    <>
      {ok && <span className="ja-small" role="status">{ok}</span>}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
    </>
  );
}

function You({ a }: { a: AccountSettings }) {
  const [first, setFirst] = useState(a.firstName);
  const [last, setLast] = useState(a.lastName);
  const [save, state] = useUpdateNameMutation();
  const [ok, setOk] = useState("");
  const [problem, setProblem] = useState("");
  const go = async () => {
    setOk("");
    setProblem("");
    try {
      await save({ firstName: first, lastName: last }).unwrap();
      setOk("Saved.");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Card id="you-h" title="You">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <Field id="s-first" label="First name"><input id="s-first" type="text" value={first} onChange={(e) => setFirst(e.target.value)} /></Field>
        <Field id="s-last" label="Last name"><input id="s-last" type="text" value={last} onChange={(e) => setLast(e.target.value)} /></Field>
      </div>
      <Status ok={ok} problem={problem} />
      <div className="jr-btns"><button type="button" className="jr-btn" onClick={go} disabled={state.isLoading}>Save</button></div>
    </Card>
  );
}

function Email({ a }: { a: AccountSettings }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [change, state] = useChangeEmailMutation();
  const [ok, setOk] = useState("");
  const [problem, setProblem] = useState("");
  const go = async () => {
    setOk("");
    setProblem("");
    try {
      await change({ email, password: password || undefined }).unwrap();
      setOk(`We sent a link to ${email}. Your email changes when you click it.`);
      setEmail("");
      setPassword("");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Card id="email-h" title="Email">
      <span>You sign in with <b>{a.email}</b>.{a.pendingEmail ? ` Waiting for you to confirm ${a.pendingEmail}.` : ""}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <Field id="s-email" label="New email"><input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        {a.hasPassword && <Field id="s-email-pw" label="Your password"><input id="s-email-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>}
      </div>
      <Status ok={ok} problem={problem} />
      <div className="jr-btns"><button type="button" className="jr-btn" onClick={go} disabled={!email.trim() || state.isLoading}>Change email</button></div>
    </Card>
  );
}

function Password({ a }: { a: AccountSettings }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [change, state] = useChangePasswordMutation();
  const [ok, setOk] = useState("");
  const [problem, setProblem] = useState("");
  const go = async () => {
    setOk("");
    setProblem("");
    try {
      const t = (await change({ current: current || undefined, next }).unwrap()).data;
      // This device gets a fresh session; others are signed out.
      const remember = Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN));
      storage.set(STORAGE_KEYS.TOKEN, t.accessToken, remember);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, t.refreshToken, remember);
      setOk("Password changed. Other devices have been signed out.");
      setCurrent("");
      setNext("");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Card id="pw-h" title="Password">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {a.hasPassword && <Field id="s-cur" label="Current password"><input id="s-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>}
        <Field id="s-new" label="New password" hint="At least 8 characters. Signs you out everywhere else."><input id="s-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
      </div>
      <Status ok={ok} problem={problem} />
      <div className="jr-btns"><button type="button" className="jr-btn" onClick={go} disabled={!next || state.isLoading}>Change password</button></div>
    </Card>
  );
}

const TOGGLES: { key: keyof EmailPrefs; label: string; note: string }[] = [
  { key: "bookings", label: "Bookings", note: "Someone booked, or a session starts in an hour." },
  { key: "messages", label: "Messages", note: "A participant wrote to you (the first unread one)." },
  { key: "review", label: "Work to review", note: "Two days before work is approved automatically." },
  { key: "finish", label: "Studies closing and finishing", note: "Closed, and the money settled." },
  { key: "news", label: "joinStudy news", note: "New countries and features. About once a month." },
];
function Emails({ a }: { a: AccountSettings }) {
  const [set, state] = useSetEmailPrefsMutation();
  const [problem, setProblem] = useState("");
  const flip = async (k: keyof EmailPrefs) => {
    setProblem("");
    try {
      await set({ [k]: !a.emailPrefs[k] }).unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Card id="em-h" title="Emails">
      <div>
        {TOGGLES.map((t) => (
          <div key={t.key} className="jr-kv" style={{ alignItems: "center" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><b>{t.label}</b><span className="ja-small">{t.note}</span></span>
            <button type="button" role="switch" aria-checked={a.emailPrefs[t.key]} aria-label={t.label} className="jr-switch" disabled={state.isLoading} onClick={() => flip(t.key)} />
          </div>
        ))}
      </div>
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <span className="ja-small">Receipts, sign-in and security emails always come.</span>
    </Card>
  );
}

function Close() {
  const { data } = useGetCloseCheckQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: home } = useGetHomeQuery();
  const cur = home?.data?.money.currency || "NGN";
  const c = data?.data;
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");
  const [close, state] = useCloseAccountMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const go = async () => {
    setProblem("");
    try {
      await close({ confirm, password: password || undefined }).unwrap();
      clearAuthStorage();
      dispatch(apiSlice.util.resetApiState());
      navigate("/", { replace: true });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <section className="ja-card" aria-labelledby="close-h" style={{ gap: 10, borderColor: "#f3c4bf" }}>
      <h2 id="close-h" className="ja-h3">Close your account</h2>
      {c && !c.canClose ? (
        <span className="ja-muted">You can't close it yet: {c.reasons.join("; ")}.</span>
      ) : (
        <span className="ja-muted">Your studies and statements are kept for 7 years for finance records. Your name and email are removed.{c && c.credit > 0 ? ` Your ${formatMoney(c.credit, cur)} credit is refunded within 14 days.` : ""}</span>
      )}
      {!open ? (
        <button type="button" className="jr-btn danger" style={{ alignSelf: "flex-start" }} disabled={!c?.canClose} onClick={() => setOpen(true)}>Close account…</button>
      ) : (
        <>
          <div className="jr-field"><label htmlFor="cl-pw">Your password</label><input id="cl-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div className="jr-field"><label htmlFor="cl-c">Type CLOSE to confirm</label><input id="cl-c" type="text" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          {problem && <div className="jr-error" role="alert">{problem}</div>}
          <div className="jr-btns">
            <button type="button" className="jr-btn ink" disabled={confirm !== "CLOSE" || state.isLoading} onClick={go}>{state.isLoading ? "Closing…" : "Close my account"}</button>
            <button type="button" className="jr-btn" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </>
      )}
    </section>
  );
}
