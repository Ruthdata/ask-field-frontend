import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@components/auth/AuthShell";
import GoogleButton from "@components/auth/GoogleButton";
import AccountChoice from "@components/auth/AccountChoice";
import TextField from "@components/auth/TextField";
import PasswordField from "@components/auth/PasswordField";
import { useGoogleSignInMutation, useSignInMutation } from "@/redux/api/authApi";
import { IDLE_MINUTES } from "@/lib/idle";
import { EMAIL_RE, readProblem, safeNext, saveSession, type AccountType, type ApiProblem, type NeedsChoice, type Session } from "@/lib/session";

/**
 * Canvas 1.5: one sign-in page for researchers and participants. The API finds the account type.
 * `?intent=researcher` (they came from Start a study) lets us say "this is a participant account" instead of
 * quietly opening the wrong dashboard. `?next=` returns them to the page they were trying to open.
 */
export default function SignIn() {
  const [params] = useSearchParams();
  const intentParam = params.get("intent");
  const intent: AccountType | undefined = intentParam === "researcher" || intentParam === "participant" ? intentParam : undefined;
  const next = params.get("next");
  const reason = params.get("reason") === "idle" ? "idle" : params.get("reason") === "expired" ? "expired" : null;
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [choice, setChoice] = useState<{ c: NeedsChoice; googleToken?: string } | null>(null);
  const [signIn, { isLoading }] = useSignInMutation();
  const [googleSignIn, { isLoading: googleBusy }] = useGoogleSignInMutation();

  const finish = (s: Session) => {
    saveSession(s);
    navigate(safeNext(next, s.userType), { replace: true });
  };

  const attempt = async (accountType?: AccountType) => {
    setProblem(null);
    try {
      const res = await signIn({ email: email.trim(), password, intent: accountType ? undefined : intent, accountType }).unwrap();
      if ("needsChoice" in res.data) setChoice({ c: res.data });
      else finish(res.data);
    } catch (err) {
      setChoice(null);
      setProblem(readProblem(err));
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) er.email = "Enter the email you signed up with.";
    if (!password) er.password = "Enter your password.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(er.email ? "si-email" : "si-password")?.focus();
      return;
    }
    attempt();
  };

  const pick = async (t: AccountType) => {
    if (choice?.googleToken) {
      try {
        const res = await googleSignIn({ token: choice.googleToken, accountType: t }).unwrap();
        if (!("needsChoice" in res.data)) finish(res.data);
      } catch (err) {
        setProblem(readProblem(err));
      }
    } else attempt(t);
  };

  const enc = encodeURIComponent(email.trim());
  const problemView = () => {
    if (!problem) return null;
    switch (problem.code) {
      case "wrong_credentials":
        return (
          <div className="alert warn" role="alert">
            <span>
              That email and password don't match. Try again, or <Link to={`/reset-password?email=${enc}${intent ? `&intent=${intent}` : ""}`}>reset your password</Link>.
            </span>
          </div>
        );
      case "email_not_confirmed":
        return (
          <div className="alert info" role="alert">
            <span>
              Confirm your email first. We've sent a new link to {String(problem.data?.email ?? email)}.{" "}
              <Link to={problem.data?.accountType === "participant" ? `/participate/check-email?email=${enc}` : `/auth/researcher/check-email?email=${enc}`}>Didn't get it?</Link>
            </span>
          </div>
        );
      case "participant_only":
      case "researcher_only": {
        const has = problem.code === "participant_only" ? "participant" : "researcher";
        return (
          <div className="alert plain" role="alert">
            <span>
              This email has a <b>{has}</b> account, not a {has === "participant" ? "researcher" : "participant"} account.
            </span>
            <div className="row">
              <button type="button" className="btn btn-ink" onClick={() => attempt(has)}>
                Go to my {has} account
              </button>
              {has === "participant" && (
                <Link className="btn btn-outline" to={`/auth/sign-up/researcher?email=${enc}`} style={{ textDecoration: "none" }}>
                  Add a researcher account
                </Link>
              )}
            </div>
          </div>
        );
      }
      case "no_account":
        return (
          <div className="alert plain" role="alert">
            <span>{problem.message}</span>
            <div className="row">
              <Link className="btn btn-ink" to="/auth/sign-up/researcher" style={{ textDecoration: "none" }}>Start a study</Link>
              <Link className="btn btn-outline" to="/participate" style={{ textDecoration: "none" }}>Start earning</Link>
            </div>
          </div>
        );
      default:
        return (
          <div className={`alert ${problem.code === "use_google" ? "info" : "warn"}`} role="alert">
            <span>{problem.message}</span>
          </div>
        );
    }
  };

  const side = (
    <>
      <div className="story">
        <h2>Welcome back.</h2>
        <p className="lead">Your studies, submissions and payments, right where you left them.</p>
      </div>
      <p className="foot">One sign-in for researchers and participants. We take you to the right dashboard.</p>
    </>
  );

  return (
    <AuthShell side={side}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div style={{ display: "grid", gap: 10 }}>
          <h1>Sign in</h1>
          <p className="sub">
            New to joinStudy? <Link to="/auth/sign-up/researcher">Start a study</Link> or <Link to="/participate">start earning</Link>
          </p>
        </div>

        {!problem && reason && (
          <div className="alert info" role="status">
            <span>
              {reason === "idle"
                ? `You were signed out after ${IDLE_MINUTES} minutes without activity. Sign in to carry on where you were.`
                : "Your sign-in ended. Sign in again to carry on."}
            </span>
          </div>
        )}
        {problemView()}
        {choice && <AccountChoice choices={choice.c.choices} onPick={pick} busy={isLoading || googleBusy} />}

        <GoogleButton
          intent={intent}
          onSession={finish}
          onChoice={(c, googleToken) => setChoice({ c, googleToken })}
          onError={(message, code) => setProblem({ message, code })}
        />
        <div className="or">or with your email</div>

        <TextField id="si-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder={intent === "participant" ? "amaka@example.com" : "ada.obi@university.edu"} error={errors.email} />
        <PasswordField
          id="si-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={errors.password}
          aside={<Link to={`/reset-password?email=${enc}${intent ? `&intent=${intent}` : ""}`} style={{ fontSize: 14.5, fontWeight: 500 }}>Forgot password?</Link>}
        />

        <p className="sub" style={{ fontSize: 14 }}>For your security, we sign you out after {IDLE_MINUTES} minutes without activity.</p>

        <button type="submit" className="btn btn-sun btn-block" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
