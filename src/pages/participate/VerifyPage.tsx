import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import {
  PHONE_EXAMPLE,
  useCheckPhoneCodeMutation,
  useCompleteSelfieMutation,
  useConsentToVerificationMutation,
  useGetVerificationQuery,
  useSendPhoneCodeMutation,
  useStartSelfieMutation,
  type SelfieOutcome,
  type Verification,
} from "@/redux/api/participantApi";

/**
 * Participant canvas 1.7–1.9: verified once, before the first study.
 * Intro and consent → WhatsApp (or SMS) code → selfie → result. Never asked again once verified.
 */
export default function VerifyPage() {
  const { data, isLoading, isError, refetch } = useGetVerificationQuery(undefined, { refetchOnMountOrArgChange: true });
  const v = data?.data;
  const home = <Link to="/dashboard/participant">Home</Link>;

  if (isLoading) {
    return (
      <CardPage right={home}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="status"><span className="spin" aria-hidden="true" /><span>Loading…</span></div>
      </CardPage>
    );
  }
  if (isError || !v) {
    return (
      <CardPage right={home}>
        <div className="alert warn" role="alert"><span>We couldn't load this page. <button type="button" className="linkbtn" onClick={() => refetch()}>Try again</button></span></div>
      </CardPage>
    );
  }
  return (
    <CardPage right={home}>
      <Steps v={v} />
    </CardPage>
  );
}

function Steps({ v }: { v: Verification }) {
  if (v.status === "verified") return <Done v={v} />;
  if (v.status === "duplicate") return <Duplicate />;
  if (v.status === "review" || v.status === "checking") return <Review />;
  if (v.status === "rejected") return <Rejected />;
  if (!v.consented) return <Intro v={v} />;
  if (!v.phoneVerified) return <Phone v={v} />;
  return <Selfie v={v} />;
}

function Progress({ step }: { step: 1 | 2 }) {
  return <span className="label">Verify · {step} of 2</span>;
}

function Intro({ v }: { v: Verification }) {
  const [agree, setAgree] = useState(false);
  const [consent, { isLoading }] = useConsentToVerificationMutation();
  const [problem, setProblem] = useState("");
  const q = v.qualifying;
  const start = async () => {
    setProblem("");
    try {
      await consent().unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <>
      {q.count > 0 && (
        <div className="jp-qualify">
          <span className="n" aria-hidden="true">{q.count}</span>
          <span>
            <b>You qualify for {q.count === 1 ? "1 study" : `${q.count} studies`}</b>
            {q.maxPay > 0 && <>, paying {q.minPay === q.maxPay ? formatMoney(q.maxPay, q.currency) : `${formatMoney(q.minPay, q.currency)} to ${formatMoney(q.maxPay, q.currency)}`}</>}. Get verified to start.
          </span>
        </div>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        <span className="label">Once · about 2 minutes</span>
        <h1>Get verified, once</h1>
        <p className="lede">Researchers trust joinStudy because every answer comes from one real person. You do this once and never again. It's free for you.</p>
      </div>
      <ol className="jp-steps">
        <li><span className="n" aria-hidden="true">1</span><span style={{ display: "grid", gap: 3 }}><b>A code on WhatsApp</b><span style={{ fontSize: 14, color: "var(--ink-2)" }}>Or by text message if you prefer.</span></span></li>
        <li><span className="n" aria-hidden="true">2</span><span style={{ display: "grid", gap: 3 }}><b>A quick selfie</b><span style={{ fontSize: 14, color: "var(--ink-2)" }}>Shows you're a real person with one joinStudy account. No ID card needed.</span></span></li>
      </ol>
      <details className="jp-keep" open>
        <summary>What we keep, and what we don't</summary>
        <ul>
          <li><b>We keep:</b> that you're verified, and the date.</li>
          <li><b>We don't keep:</b> your selfie or face data. Our verification partner checks it and holds it under contract.</li>
          <li>Your phone number is stored scrambled, only so it can't be used on a second account.</li>
          <li>Researchers never see your face, name or number.</li>
        </ul>
      </details>
      <label className="check" style={{ color: "var(--ink)" }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I agree that joinStudy's verification partner can check my selfie to confirm I'm a real person with one account.</span>
      </label>
      {problem && <div className="alert warn" role="alert"><span>{problem}</span></div>}
      <button type="button" className="btn btn-sun btn-block" disabled={!agree || isLoading} aria-busy={isLoading} onClick={start}>
        {isLoading ? "Starting…" : "Start"}
      </button>
      <Link to="/dashboard/participant" style={{ textAlign: "center", fontSize: 15, color: "var(--ink-2)" }}>Not now</Link>
    </>
  );
}

function Phone({ v }: { v: Verification }) {
  const country = v.country || "Nigeria";
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);
  const [problem, setProblem] = useState<{ message: string; code?: string } | null>(null);
  const [send, { isLoading: sending }] = useSendPhoneCodeMutation();
  const [check, { isLoading: checking }] = useCheckPhoneCodeMutation();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async (how: "whatsapp" | "sms") => {
    setProblem(null);
    if (phone.replace(/\D/g, "").length < 7) {
      setProblem({ message: "Enter your phone number." });
      document.getElementById("vp-phone")?.focus();
      return;
    }
    try {
      const r = (await send({ phone, channel: how }).unwrap()).data;
      setChannel(how);
      setSentTo(r.sentTo);
      setWait(r.retryAfter);
      setCode("");
      setTimeout(() => document.getElementById("vp-code")?.focus(), 50);
    } catch (err) {
      const p = readProblem(err);
      const retry = Number(p.data?.retryAfter);
      if (p.code === "too_soon" && retry > 0) setWait(retry);
      setProblem({ message: p.message, code: p.code });
    }
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setProblem(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setProblem({ message: "Enter the 6-digit code." });
      return;
    }
    try {
      await check({ code: code.trim() }).unwrap();
    } catch (err) {
      const p = readProblem(err);
      setProblem({ message: p.message, code: p.code });
    }
  };

  if (problem?.code === "phone_taken") {
    return (
      <>
        <Progress step={1} />
        <div style={{ display: "grid", gap: 10 }}>
          <h1>This number already has an account</h1>
          <p className="lede">It's on another joinStudy account. Each person can have one account, so please sign in to that one instead.</p>
        </div>
        <Link className="btn btn-ink btn-block" to="/sign-in?intent=participant">Sign in to my other account</Link>
        <button type="button" className="btn btn-line btn-block" onClick={() => { setProblem(null); setSentTo(""); setPhone(""); }}>Use a different number</button>
        <p className="fine">Is this your number and you don't have another account? Email <a href="mailto:hello@joinstudy.io">hello@joinstudy.io</a> and we'll sort it out.</p>
      </>
    );
  }

  if (!sentTo) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); sendCode("whatsapp"); }} noValidate style={{ display: "grid", gap: 20 }}>
        <Progress step={1} />
        <div style={{ display: "grid", gap: 10 }}>
          <h1>Your WhatsApp number</h1>
          <p className="lede">We'll send a 6-digit code on WhatsApp. Each number can be used on one joinStudy account.</p>
        </div>
        <div className="field">
          <label htmlFor="vp-phone">Phone number</label>
          <div className="jp-phone">
            <span className="cc">+{v.callingCode}</span>
            <input id="vp-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder={PHONE_EXAMPLE[country]} value={phone} onChange={(e) => setPhone(e.target.value)} aria-describedby="vp-phone-hint" />
          </div>
          <span className="hint" id="vp-phone-hint">A {country} number. Stored scrambled, never shown to researchers.</span>
        </div>
        {problem && <div className="alert warn" role="alert"><span>{problem.message}</span></div>}
        <button type="submit" className="btn btn-sun btn-block" disabled={sending} aria-busy={sending}>{sending && channel === "whatsapp" ? "Sending…" : "Send code on WhatsApp"}</button>
        <button type="button" className="linkbtn" onClick={() => sendCode("sms")} disabled={sending} style={{ height: 44, color: "var(--ink-2)" }}>No WhatsApp? Text me instead</button>
        {v.testMode.phone && <p className="fine">Test mode: no message is sent. The code is written to the server log.</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate style={{ display: "grid", gap: 20 }}>
      <Progress step={1} />
      <div style={{ display: "grid", gap: 10 }}>
        <h1>Enter the code</h1>
        <p className="lede">
          We sent a 6-digit code {channel === "whatsapp" ? "on WhatsApp" : "by text message"} to <b>{sentTo}</b>.{" "}
          <button type="button" className="linkbtn" onClick={() => { setSentTo(""); setProblem(null); }} style={{ height: 32 }}>Change number</button>
        </p>
      </div>
      <div className="field">
        <label htmlFor="vp-code">6-digit code</label>
        <input id="vp-code" className="jp-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-describedby="vp-code-hint" />
        <span className="hint" id="vp-code-hint">The code works for 10 minutes.</span>
      </div>
      {problem && <div className="alert warn" role="alert"><span>{problem.message}</span></div>}
      <button type="submit" className="btn btn-sun btn-block" disabled={checking} aria-busy={checking}>{checking ? "Checking…" : "Verify"}</button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 15 }}>
        <button type="button" className="linkbtn" onClick={() => sendCode(channel)} disabled={wait > 0 || sending} style={{ height: 40, color: wait > 0 ? "var(--mute)" : undefined }}>
          {wait > 0 ? `Send again in ${wait}s` : "Send again"}
        </button>
        <button type="button" className="linkbtn" onClick={() => sendCode(channel === "whatsapp" ? "sms" : "whatsapp")} disabled={wait > 0 || sending} style={{ height: 40 }}>
          {channel === "whatsapp" ? "Text me instead" : "Send on WhatsApp instead"}
        </button>
      </div>
    </form>
  );
}

const OUTCOMES: { value: SelfieOutcome; label: string }[] = [
  { value: "verified", label: "Pass" },
  { value: "retry", label: "Couldn't see the face" },
  { value: "review", label: "Not sure: a person looks" },
  { value: "duplicate", label: "Matches another account" },
];

function Selfie({ v }: { v: Verification }) {
  const [start, { isLoading: starting }] = useStartSelfieMutation();
  const [complete, { isLoading: finishing }] = useCompleteSelfieMutation();
  const [session, setSession] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SelfieOutcome>("verified");
  const [problem, setProblem] = useState("");
  const [retried, setRetried] = useState(false);
  const tries = v.selfieTriesLeft;

  const begin = async () => {
    setProblem("");
    try {
      const r = (await start().unwrap()).data;
      if (r.mode === "sdk") {
        setProblem("The selfie check isn't available in this browser yet. Please try again later.");
        return;
      }
      if (r.session) setSession(r.session);
      if (!v.testMode.selfie && r.session) await finish(r.session);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const finish = async (s = session) => {
    if (!s) return;
    try {
      const r = (await complete({ session: s, testOutcome: v.testMode.selfie ? outcome : undefined }).unwrap()).data;
      setSession(null);
      setRetried(r.status === "phone" || r.status === "none");
    } catch (err) {
      setProblem(readProblem(err).message);
      setSession(null);
    }
  };

  return (
    <>
      <Progress step={2} />
      {retried ? (
        <div style={{ display: "grid", gap: 10 }}>
          <h1>We couldn't see your face clearly</h1>
          <p className="lede">It's usually the light. Face a window or a lamp, hold the phone at eye level, and keep still.</p>
          <span className="label">{tries} {tries === 1 ? "try" : "tries"} left. After that, a person on our team looks at it instead.</span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <h1>Take a quick selfie</h1>
          <p className="lede">About 10 seconds. You'll be asked to turn your head slightly.</p>
        </div>
      )}
      <div className="jp-camera" role="img" aria-label="Camera preview with an oval to fit your face in"><span /></div>
      <ul className="jp-tips">
        <li>Face a light, like a window. Avoid light behind you.</li>
        <li>Take off sunglasses or a cap. Glasses and head coverings are fine.</li>
      </ul>
      {v.testMode.selfie && session && (
        <div className="jp-test">
          <span><b>Test mode:</b> no camera is used. Choose what the check returns.</span>
          <div className="row" role="group" aria-label="Test result">
            {OUTCOMES.map((o) => (
              <button key={o.value} type="button" aria-pressed={outcome === o.value} onClick={() => setOutcome(o.value)}>{o.label}</button>
            ))}
          </div>
        </div>
      )}
      {problem && <div className="alert warn" role="alert"><span>{problem}</span></div>}
      {session ? (
        <button type="button" className="btn btn-sun btn-block" onClick={() => finish()} disabled={finishing} aria-busy={finishing}>{finishing ? "Checking…" : "Finish the selfie"}</button>
      ) : (
        <button type="button" className="btn btn-sun btn-block" onClick={begin} disabled={starting} aria-busy={starting}>{starting ? "Opening the camera…" : retried ? "Try again" : "Start the selfie"}</button>
      )}
    </>
  );
}

function Done({ v }: { v: Verification }) {
  const navigate = useNavigate();
  const n = v.qualifying.count;
  return (
    <>
      <div className="icon done" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f0c93a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>You're verified</h1>
        <p className="lede">That's done for good. Your selfie stays with our verification partner; we kept only the result.</p>
      </div>
      <button type="button" className="btn btn-sun btn-block" onClick={() => navigate("/dashboard/participant")}>
        {n > 0 ? `See your ${n === 1 ? "study" : `${n} studies`}` : "See studies"}
      </button>
    </>
  );
}

function Review() {
  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>A person will take a look</h1>
        <p className="lede">The automatic check wasn't sure, so someone on our team will check it within 24 hours. We'll email you either way.</p>
      </div>
      <Link className="btn btn-ink btn-block" to="/dashboard/participant">Back to home</Link>
    </>
  );
}

function Duplicate() {
  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>You already have a joinStudy account</h1>
        <p className="lede">This selfie matches another account. Everyone can have one account, so please use that one. This account can't take studies.</p>
      </div>
      <Link className="btn btn-ink btn-block" to="/sign-in?intent=participant">Sign in to my other account</Link>
      <p className="fine">Don't have another account? Email <a href="mailto:hello@joinstudy.io">hello@joinstudy.io</a> and a person will look into it.</p>
    </>
  );
}

function Rejected() {
  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>We couldn't verify this account</h1>
        <p className="lede">This account can't take studies. If you think that's a mistake, email <a href="mailto:hello@joinstudy.io">hello@joinstudy.io</a>.</p>
      </div>
      <Link className="btn btn-ink btn-block" to="/dashboard/participant">Back to home</Link>
    </>
  );
}
