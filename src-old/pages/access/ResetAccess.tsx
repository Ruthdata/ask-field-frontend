import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import PasswordField from "@components/auth/PasswordField";
import { useCheckResetCodeMutation, useSendResetCodeMutation, useSetNewPasswordMutation } from "@/redux/api/authApi";
import { EMAIL_RE, dashboardFor, readProblem, saveSession, type AccountType } from "@/lib/session";

const GAP = 60;

/** Canvas 1.6: email → 6-digit code → new password → signed in. Works for researchers and participants. */
export default function ResetAccess() {
  const [params] = useSearchParams();
  const intentParam = params.get("intent");
  const intent: AccountType | undefined = intentParam === "researcher" || intentParam === "participant" ? intentParam : undefined;
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const [sendCode, { isLoading: sending }] = useSendResetCodeMutation();
  const [checkCode, { isLoading: checking }] = useCheckResetCodeMutation();
  const [setNew, { isLoading: saving }] = useSetNewPasswordMutation();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (step === 2) boxes.current[0]?.focus();
    if (step === 3) document.getElementById("rp-password")?.focus();
  }, [step]);

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter the email you signed up with.");
      return;
    }
    try {
      await sendCode({ email: email.trim() }).unwrap();
      setDigits(["", "", "", "", "", ""]);
      setWait(GAP);
      setStep(2);
    } catch (err) {
      setError(readProblem(err).message);
    }
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) boxes.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (t.length < 2) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => t[i] ?? ""));
    boxes.current[Math.min(t.length, 5)]?.focus();
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      return;
    }
    try {
      const res = await checkCode({ email: email.trim(), code }).unwrap();
      setToken(res.data.token);
      setStep(3);
    } catch (err) {
      setError(readProblem(err).message);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    try {
      const res = await setNew({ email: email.trim(), token, password, intent }).unwrap();
      saveSession(res.data);
      navigate(dashboardFor(res.data.userType), { replace: true });
    } catch (err) {
      const p = readProblem(err);
      setError(p.message);
      if (p.code === "reset_expired") setStep(1);
    }
  };

  return (
    <CardPage right={<Link to={intent ? `/sign-in?intent=${intent}` : "/sign-in"}>Back to sign in</Link>}>
      <div className="bars" aria-hidden="true">
        <span className="on" />
        <span className={step >= 2 ? "on" : ""} />
        <span className={step >= 3 ? "on" : ""} />
      </div>

      {step === 1 && (
        <form onSubmit={send} noValidate style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <span className="label">Step 1 of 3</span>
            <h1>Reset your password</h1>
            <p className="lede">Enter your account email. We'll send you a 6-digit code.</p>
          </div>
          <TextField id="rp-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={error || undefined} autoFocus />
          <button type="submit" className="btn btn-ink btn-block" disabled={sending}>
            {sending ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verify} noValidate style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <span className="label">Step 2 of 3</span>
            <h1>Enter the code</h1>
            <p className="lede">If an account exists for <b>{email}</b>, the code is on its way. It works for 10 minutes.</p>
          </div>
          <fieldset className="code">
            <legend className="sr-only">6-digit code</legend>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={onPaste}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`Digit ${i + 1} of 6`}
                aria-invalid={!!error}
              />
            ))}
          </fieldset>
          {error && <span className="err" role="alert" style={{ color: "#c2410c", fontSize: 14 }}>{error}</span>}
          <button type="submit" className="btn btn-ink btn-block" disabled={checking}>
            {checking ? "Checking…" : "Continue"}
          </button>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 14.5, color: "var(--ink-2)" }}>
            <button type="button" className="linkbtn" onClick={() => send()} disabled={wait > 0 || sending} style={{ opacity: wait > 0 ? 0.6 : 1 }}>
              {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
            </button>
            <button type="button" className="linkbtn" onClick={() => { setError(""); setStep(1); }}>
              Use a different email
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={save} noValidate style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <span className="label">Step 3 of 3</span>
            <h1>Choose a new password</h1>
          </div>
          <PasswordField id="rp-password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" error={error || undefined} />
          <button type="submit" className="btn btn-sun btn-block" disabled={saving}>
            {saving ? "Saving…" : "Save and sign in"}
          </button>
          <span style={{ fontSize: 14.5, color: "var(--ink-2)" }}>You'll be signed in and taken to your dashboard.</span>
        </form>
      )}
    </CardPage>
  );
}
