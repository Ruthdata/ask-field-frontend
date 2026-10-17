import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@components/auth/AuthShell";
import GoogleButton from "@components/auth/GoogleButton";
import AccountChoice from "@components/auth/AccountChoice";
import TextField from "@components/auth/TextField";
import PasswordField from "@components/auth/PasswordField";
import { useGoogleSignInMutation, useSignUpResearcherMutation } from "@/redux/api/authApi";
import { EMAIL_RE, METHOD_LABELS, readProblem, saveSession, dashboardFor, type NeedsChoice, type Session, type AccountType } from "@/lib/session";

type Errors = Partial<Record<"fullName" | "email" | "password", string>>;

/** Canvas 1.2: one screen instead of seven. Country, organisation and role move to setup (Stage 2). */
export default function ResearcherSignUp() {
  const [params] = useSearchParams();
  const method = params.get("method") ?? "";
  const source = params.get("source") ?? "";
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [updates, setUpdates] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState<{ message: string; code?: string } | null>(null);
  const [choice, setChoice] = useState<{ c: NeedsChoice; token: string } | null>(null);
  const [signUp, { isLoading }] = useSignUpResearcherMutation();
  const [googleSignIn, { isLoading: picking }] = useGoogleSignInMutation();
  const methodLabel = METHOD_LABELS[method];

  const finish = (s: Session) => {
    saveSession(s);
    navigate(dashboardFor(s.userType));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!fullName.trim()) er.fullName = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) er.email = "Enter a valid email address.";
    if (password.length < 8) er.password = "Use at least 8 characters.";
    setErrors(er);
    setProblem(null);
    if (Object.keys(er).length) {
      document.getElementById(`su-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        receivesUpdates: updates,
        method: methodLabel ? method : undefined,
        source: source || undefined,
      }).unwrap();
      navigate(`/auth/researcher/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      const p = readProblem(err);
      setProblem({ message: p.message, code: p.code });
    }
  };

  const pick = async (t: AccountType) => {
    if (!choice) return;
    try {
      const res = await googleSignIn({ token: choice.token, accountType: t }).unwrap();
      if (!("needsChoice" in res.data)) finish(res.data);
    } catch (err) {
      setProblem(readProblem(err));
    }
  };

  const side = (
    <>
      <div className="story">
        <span className="label" style={{ color: "var(--sun)" }}>For researchers</span>
        <h2>Reach the people your research is missing.</h2>
      </div>
      <ol className="auth-steps">
        <li><span className="n on">1</span><span>Create your account. <span className="q">Takes a minute.</span></span></li>
        <li><span className="n">2</span><span>Confirm your email and tell us about your research.</span></li>
        <li><span className="n">3</span><span>Build your study and see the full cost before you pay.</span></li>
      </ol>
      <p className="foot">Free to sign up. You pay only when you launch, and only for approved work.</p>
    </>
  );

  return (
    <AuthShell side={side}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div style={{ display: "grid", gap: 10 }}>
          {methodLabel && (
            <span className="chip">
              Starting with: <b>{methodLabel}</b>
            </span>
          )}
          <h1>Create your researcher account</h1>
          <p className="sub">
            Already have an account? <Link to={`/sign-in?intent=researcher${email ? `&email=${encodeURIComponent(email)}` : ""}`}>Sign in</Link>
          </p>
        </div>

        {/* {problem && (
          <div className="alert warn" role="alert">
            {problem.code === "email_taken" ? (
              <span>
                There's already an account with this email. <Link to={`/sign-in?intent=researcher&email=${encodeURIComponent(email)}`}>Sign in</Link> or{" "}
                <Link to={`/reset-password?intent=researcher&email=${encodeURIComponent(email)}`}>reset your password</Link>.
              </span>
            ) : (
              <span>{problem.message}</span>
            )}
          </div>
        )} */}
        {choice && <AccountChoice choices={choice.c.choices} onPick={pick} busy={picking} />}

        <GoogleButton
          intent="researcher"
          method={methodLabel ? method : undefined}
          onSession={finish}
          onChoice={(c, token) => setChoice({ c, token })}
          onError={(message, code) => setProblem({ message, code })}
        />
        <div className="or">or with your email</div>

        <TextField id="su-fullName" label="Full name" value={fullName} onChange={setFullName} autoComplete="name" placeholder="Ada Obi" error={errors.fullName} />
        <TextField
          id="su-email"
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="ada.obi@university.edu"
          hint="A university or company email helps us verify your organisation faster."
          error={errors.email}
        />
        <PasswordField id="su-password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />
        {problem && (
          <div className="alert warn" role="alert">
            {problem.code === "email_taken" ? (
              <span>
                There's already an account with this email. <Link to={`/sign-in?intent=researcher&email=${encodeURIComponent(email)}`}>Sign in</Link> or{" "}
                <Link to={`/reset-password?intent=researcher&email=${encodeURIComponent(email)}`}>reset your password</Link>.
              </span>
            ) : (
              <span>{problem.message}</span>
            )}
          </div>
        )}

        <label className="check">
          <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} />
          <span>Email me occasional product news. You can stop any time.</span>
        </label>

        <button type="submit" className="btn btn-sun btn-block" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Creating your account…" : "Create account"}
        </button>

        <p className="fine">
          By creating an account you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>
        <p className="switch">
          Want to take part in studies instead? <Link to="/auth/sign-up/participant">Join as a participant</Link>
        </p>
      </form>
    </AuthShell>
  );
}
