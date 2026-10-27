import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import { EMAIL_RE, readProblem } from "@/lib/session";
import { PARTICIPANT_COUNTRIES, useJoinWaitlistMutation } from "@/redux/api/participantApi";
import "@/styles/marketing.css";

/** Participant canvas 1.1: where you live comes first, so nobody makes an account we can't pay out to. */
const NOTES: Record<string, string> = {
  Nigeria: "Paid to your bank account or as airtime",
  Ghana: "Paid by mobile money, bank or airtime",
  Kenya: "Paid by M-Pesa, bank or airtime",
};
const ELSEWHERE = "Somewhere else";
const WAITLIST_COUNTRIES = ["South Africa", "Uganda", "Tanzania", "Rwanda", "Cameroon", "Zambia", "Ethiopia", "Côte d'Ivoire", "Senegal", "Another country"];

export function ParticipantSide({ step }: { step: 1 | 2 }) {
  return (
    <>
      <div className="story">
        <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--sun)" }}>Take part in studies</span>
        <h2>Get paid for your views.</h2>
        <p className="lead">Researchers around the world pay to hear from people like you. Studies take 5 to 60 minutes and pay at least $4 an hour.</p>
      </div>
      <ol className="auth-steps">
        <li><span className={`n${step === 1 ? " on" : ""}`}>1</span><span>Tell us where you live.</span></li>
        <li><span className={`n${step === 2 ? " on" : ""}`}>2</span><span>Create your account. <span className="q">Free, about a minute.</span></span></li>
        <li><span className="n">3</span><span>Tell us about you, so we can match studies.</span></li>
        <li><span className="n">4</span><span>Get verified once, when a study fits you.</span></li>
      </ol>
      <p className="foot">Every participant is verified once, so researchers trust the answers here. That's why studies keep coming.</p>
    </>
  );
}

export default function JoinCountry() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string>("Nigeria");
  const [waitlist, setWaitlist] = useState(false);
  const [country, setCountry] = useState(WAITLIST_COUNTRIES[0]);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [done, setDone] = useState(false);
  const [problem, setProblem] = useState("");
  const [join, { isLoading }] = useJoinWaitlistMutation();

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (picked === ELSEWHERE) setWaitlist(true);
    else navigate(`/participate/sign-up?country=${encodeURIComponent(picked)}`);
  };

  const submitWaitlist = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr("Enter a valid email address.");
      document.getElementById("wl-email")?.focus();
      return;
    }
    setEmailErr("");
    try {
      await join({ email: email.trim(), country }).unwrap();
      setDone(true);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };

  return (
    <AuthShell side={<ParticipantSide step={1} />}>
      {!waitlist ? (
        <form className="auth-form" onSubmit={next} noValidate>
          <div style={{ display: "grid", gap: 10 }}>
            <h1>Where do you live?</h1>
            <p className="sub">
              Already have an account? <Link to="/sign-in?intent=participant">Sign in</Link>
            </p>
          </div>
          <div role="radiogroup" aria-label="Where do you live?" style={{ display: "grid", gap: 10 }}>
            {[...PARTICIPANT_COUNTRIES, ELSEWHERE].map((c) => {
              const on = picked === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPicked(c)}
                  className="jp-country"
                  data-on={on}
                >
                  <span style={{ display: "grid", gap: 2, textAlign: "left" }}>
                    <b style={{ fontSize: 16 }}>{c}</b>
                    <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{NOTES[c] ?? "Join the waitlist for your country"}</span>
                  </span>
                  <span aria-hidden="true" className="dot" />
                </button>
              );
            })}
          </div>
          <button type="submit" className="btn btn-sun btn-block">Continue</button>
          <p className="fine">
            You need to be 18 or older. Running a study instead? <Link to="/auth/sign-up/researcher?source=participate">Sign up as a researcher</Link>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={submitWaitlist} noValidate>
          <button type="button" className="linkbtn" onClick={() => { setWaitlist(false); setDone(false); }} style={{ justifySelf: "start", height: 44, textDecoration: "none", fontWeight: 500, color: "var(--ink-2)" }}>
            ← Back
          </button>
          <div style={{ display: "grid", gap: 10 }}>
            <h1>We can't pay people there yet</h1>
            <p className="sub">joinStudy pays out in Nigeria, Ghana and Kenya for now. Leave your email and we'll write once, when your country opens.</p>
          </div>
          <div className="field">
            <label htmlFor="wl-country">Your country</label>
            <select id="wl-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              {WAITLIST_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <TextField id="wl-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="you@example.com" error={emailErr} />
          {problem && <div className="alert warn" role="alert"><span>{problem}</span></div>}
          {done ? (
            <div className="alert plain" role="status"><span>You're on the list. We'll email you when we can pay people in your country.</span></div>
          ) : (
            <button type="submit" className="btn btn-ink btn-block" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Adding…" : "Tell me when it opens"}</button>
          )}
          <p className="fine">We only use this email to tell you when your country opens.</p>
        </form>
      )}
    </AuthShell>
  );
}
