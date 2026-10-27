import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@components/auth/AuthShell";
import GoogleButton from "@components/auth/GoogleButton";
import TextField from "@components/auth/TextField";
import PasswordField from "@components/auth/PasswordField";
import Turnstile from "@components/auth/Turnstile";
import { EMAIL_RE, readProblem, saveSession, type Session } from "@/lib/session";
import { PARTICIPANT_COUNTRIES, useSignUpParticipantMutation } from "@/redux/api/participantApi";
import { ParticipantSide } from "./JoinCountry";

type Field = "firstName" | "lastName" | "email" | "password" | "agree";
type Errors = Partial<Record<Field, string>>;

/** Participant canvas 1.2: one screen, free. No phone or ID here; verification comes once, when a study fits them. */
export default function ParticipantSignUp() {
  const [params] = useSearchParams();
  const country = params.get("country") ?? "";
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [bot, setBot] = useState<string | undefined>();
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState<{ message: string; code?: string } | null>(null);
  const [signUp, { isLoading }] = useSignUpParticipantMutation();

  if (!(PARTICIPANT_COUNTRIES as readonly string[]).includes(country)) return <Navigate to="/participate" replace />;

  const finish = (s: Session) => {
    saveSession(s);
    navigate(s.userType === "participant" ? "/participate/welcome" : "/dashboard/researcher");
  };

  const needAgree = () => {
    if (agree) return true;
    setErrors((e) => ({ ...e, agree: "Tick this box first." }));
    document.getElementById("ps-agree")?.focus();
    return false;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!firstName.trim()) er.firstName = "Enter your first name.";
    if (!lastName.trim()) er.lastName = "Enter your last name.";
    if (!EMAIL_RE.test(email.trim())) er.email = "Enter a valid email address.";
    if (password.length < 8) er.password = "Use at least 8 characters.";
    if (!agree) er.agree = "Tick this box to continue.";
    setErrors(er);
    setProblem(null);
    if (Object.keys(er).length) {
      document.getElementById(`ps-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    try {
      await signUp({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, country, agree, receivesUpdates: updates, turnstileToken: bot }).unwrap();
      navigate(`/participate/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      const p = readProblem(err);
      setProblem({ message: p.message, code: p.code });
    }
  };

  const enc = encodeURIComponent(email.trim());
  return (
    <AuthShell side={<ParticipantSide step={2} />}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div style={{ display: "grid", gap: 10 }}>
          <h1>Create your account</h1>
          <p className="sub" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span className="chip">Living in <b>{country}</b></span>
            <Link to="/participate">Change</Link>
          </p>
        </div>

        {problem && (
          <div className={`alert ${problem.code === "email_taken" ? "plain" : "warn"}`} role="alert">
            <span>
              {problem.message}
              {problem.code === "email_taken" && (
                <> <Link to={`/sign-in?intent=participant&email=${enc}`}>Sign in</Link></>
              )}
            </span>
          </div>
        )}

        <GoogleButton
          intent="participant"
          accountType="participant"
          extra={{ country, agree }}
          beforeOpen={needAgree}
          onSession={finish}
          onChoice={() => setProblem({ message: "This Google email already has accounts. Sign in instead." })}
          onError={(message, code) => setProblem({ message, code })}
        />
        <div className="or">or with your email</div>

        <TextField id="ps-firstName" label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" error={errors.firstName} />
        <TextField
          id="ps-lastName"
          label="Last name"
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
          error={errors.lastName}
          hint="Use your names as they appear on your bank or mobile money account, so your payments reach you. Researchers never see them."
        />
        <TextField id="ps-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="amaka@example.com" error={errors.email} />
        <PasswordField id="ps-password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />

        <div style={{ display: "grid", gap: 6 }}>
          <label className="check" style={{ color: "var(--ink)" }}>
            <input id="ps-agree" type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((x) => ({ ...x, agree: undefined })); }} aria-invalid={!!errors.agree} aria-describedby={errors.agree ? "ps-agree-err" : undefined} />
            <span>
              I'm 18 or older, and I agree to the <Link to="/terms" target="_blank">Participant Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.
            </span>
          </label>
          {errors.agree && <span className="err" id="ps-agree-err" style={{ fontSize: 14, color: "#c2410c" }}>{errors.agree}</span>}
        </div>
        <label className="check">
          <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} />
          <span>Email me about new studies that fit me. You can change this any time.</span>
        </label>

        <Turnstile onToken={setBot} />

        <button type="submit" className="btn btn-sun btn-block" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Creating your account…" : "Create account"}
        </button>
        <p className="switch">
          Already have an account? <Link to="/sign-in?intent=participant">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
