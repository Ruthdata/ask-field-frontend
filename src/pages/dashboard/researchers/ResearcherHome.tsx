import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFoundingLabMutation, useGetHomeQuery, useStartStudyMutation, type HomeSummary, type StudyMethod } from "@/redux/api/homeApi";
import { useGetPricingQuery, VERIFIABLE } from "@/redux/api/setupApi";
import { estimateCost, formatMoney, methodById, needsYouLink, PARTICIPANT_COUNTRIES, percent, rateDefaults, studyLink } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { ROUTES, SUPPORT_EMAIL } from "@/lib/site";
import MethodPicker from "@/components/researcher/MethodPicker";
import Stepper from "@/components/researcher/Stepper";
import StudiesTable from "@/components/researcher/StudiesTable";

/** 3.1 Researcher home: plan a first study, or see what needs you. Only real figures. */
export default function ResearcherHome() {
  const { data, isLoading, isError, refetch } = useGetHomeQuery();
  const h = data?.data;

  if (isLoading) return <div className="ja-page" aria-busy="true"><div className="ja-skeleton" /><div className="ja-skeleton" style={{ height: 320 }} /></div>;
  if (isError || !h) {
    return (
      <div className="ja-page">
        <div className="ja-error" role="alert">We couldn't load your home page. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>
      </div>
    );
  }
  const isNew = h.counts.total === 0;
  return (
    <div className="ja-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 className="ja-h1">{isNew ? `Welcome, ${h.firstName}` : `Welcome back, ${h.firstName}`}</h1>
        <p className="ja-lede">
          {isNew
            ? "Plan your first study. You pay once, when it launches, and money for work you don't approve comes back to you."
            : "Here's what needs you, and how your studies are doing."}
        </p>
      </div>
      {!h.account.setupComplete && <GettingStarted />}
      {isNew ? <FirstVisit h={h} /> : <Returning h={h} />}
    </div>
  );
}

function GettingStarted() {
  return (
    <section aria-labelledby="gs-h" className="ja-card">
      <div className="ja-row" style={{ alignItems: "baseline" }}>
        <h2 id="gs-h" className="ja-h2">Getting started</h2>
        <span className="ja-mono">1 of 4 done</span>
      </div>
      <ol className="ja-check">
        <li className="done"><span className="dot" aria-hidden="true">✓</span><span className="txt"><span className="t">Create your account</span><span className="ja-small">Done</span></span></li>
        <li className="now"><span className="dot" aria-hidden="true">2</span><span className="txt"><span className="t">Tell us about your work</span><span className="ja-muted">About a minute. Needed before you launch.</span><Link to="/setup" className="ja-link" style={{ fontSize: 14 }}>Finish setup →</Link></span></li>
        <li><span className="dot" aria-hidden="true">3</span><span className="txt"><span className="t">Plan your first study</span><span className="ja-small">You can start this now</span></span></li>
        <li><span className="dot" aria-hidden="true">4</span><span className="txt"><span className="t">Fund and launch</span><span className="ja-small">Pay once, when it goes live</span></span></li>
      </ol>
    </section>
  );
}

function FirstVisit({ h }: { h: HomeSummary }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ja-cols">
        <div className="ja-col-main">
          <FirstStudy fromSetup={h.account.firstMethod} />
          <HowItWorks />
        </div>
        <div className="ja-col-side">
          <QuickEstimate feeRate={h.account.feeRate} academic={h.account.verification === "verified" && VERIFIABLE.includes(h.account.organizationType)} />
          <AccountCard h={h} />
          <Countries />
        </div>
      </div>
      <FoundingCard status={h.founding} />
    </div>
  );
}

function FirstStudy({ fromSetup }: { fromSetup: string }) {
  const navigate = useNavigate();
  const known = methodById(fromSetup);
  const [method, setMethod] = useState<StudyMethod>(known?.id ?? "survey");
  const [start, { isLoading, error }] = useStartStudyMutation();
  const go = async () => {
    const res = await start({ method }).unwrap().catch(() => null);
    if (res) navigate(studyLink({ ...res.data, status: "draft" }));
  };
  const m = methodById(method)!;
  return (
    <section aria-labelledby="first-h" className="ja-card dark">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="ja-mono" style={{ color: "var(--sun)" }}>Your first study</span>
        <h2 id="first-h" style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: "-.05em" }}>What do you want to run?</h2>
      </div>
      <MethodPicker value={method} onChange={setMethod} fromSetup={known?.id} labelledBy="first-h" />
      {error && <div className="ja-error" role="alert">{readProblem(error).message}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
        <button type="button" className="ja-btn" onClick={go} disabled={isLoading}>{isLoading ? "Starting…" : `Plan your ${m.word} →`}</button>
        <span style={{ fontSize: 14.5, color: "var(--on-night-2)" }}>Saved as a draft as you go. Nothing is charged until you launch.</span>
      </div>
      <div className="ja-divider">Not sure which fits? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and a person will help you plan it.</div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["1 · Plan", "Who you need, consent, what they'll do and what you'll pay them."],
    ["2 · Fund and launch", "Pay once. We hold it, check the study, and open it to participants."],
    ["3 · Review and finish", "Approve the work you accept. What you don't use comes back to you."],
  ];
  return (
    <section aria-labelledby="hw-h" className="ja-card">
      <h2 id="hw-h" className="ja-h3">How a study works</h2>
      <ol className="ja-grid" style={{ margin: 0, padding: 0, listStyle: "none", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16 }}>
        {steps.map(([k, t]) => (
          <li key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="ja-mono">{k}</span>
            <span style={{ fontSize: 15, lineHeight: 1.45 }}>{t}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuickEstimate({ feeRate, academic }: { feeRate: number; academic: boolean }) {
  const { data } = useGetPricingQuery();
  const currency = data?.data.currency ?? "USD";
  const d = rateDefaults(currency, data?.data.recommendedHourlyPay);
  const [people, setPeople] = useState(50);
  const [minutes, setMinutes] = useState(15);
  const [rate, setRate] = useState<number | null>(null);
  const r = rate ?? d.rate;
  const c = estimateCost(people, minutes, r, feeRate);
  return (
    <section aria-labelledby="qe-h" className="ja-card">
      <h2 id="qe-h" className="ja-h3">Quick cost estimate</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Stepper label="People" value={people} onChange={setPeople} step={10} max={10000} />
        <Stepper label="Minutes each" value={minutes} onChange={setMinutes} step={5} max={600} />
        <Stepper label="Pay per hour" value={r} onChange={setRate} step={d.step} min={0} max={1000000} />
      </div>
      <div className="ja-total" aria-live="polite">
        <span className="ja-muted">About this much to launch</span>
        <span className="big">{formatMoney(c.total, currency)}</span>
        <span className="ja-small">{formatMoney(c.perPerson, currency)} each to participants · {percent(feeRate)} joinStudy fee{academic ? " (academic)" : ""}</span>
      </div>
      <Link to="/dashboard/researcher/estimate" className="ja-link">Open the full estimate →</Link>
    </section>
  );
}

function AccountCard({ h }: { h: HomeSummary }) {
  const a = h.account;
  let card: { title: string; text: string; link?: [string, string]; tone: "" | "sun" | "strong" };
  if (!a.setupComplete) card = { title: "Setup not finished", text: "You can plan a study now. Finish setup before you launch it.", link: ["/setup", "Finish setup"], tone: "strong" };
  else if (a.verification === "verified") card = { title: `${a.organizationName || "Your institution"} · verified`, text: `Your studies show a verified badge, and you pay the academic fee (${percent(a.feeRate)}).`, tone: "sun" };
  else if (a.verification === "pending") card = { title: "Verification in review", text: "We'll email you within 2 working days. You can build and launch meanwhile, at the standard fee.", tone: "" };
  else if (VERIFIABLE.includes(a.organizationType)) card = { title: "Not verified yet", text: "Verify your institution for a badge on your studies and the lower academic fee.", link: ["/setup/verify", "Verify now"], tone: "" };
  else card = { title: a.organizationName || "Independent researcher", text: `You pay the standard fee (${percent(a.feeRate)}) on work you approve.`, tone: "" };
  return (
    <section aria-label="Your account" className={`ja-card ${card.tone}`} style={{ gap: 6 }}>
      <span style={{ fontWeight: 600, fontSize: 15.5 }}>{card.title}</span>
      <span className="ja-muted">{card.text}</span>
      {card.link && <Link to={card.link[0]} className="ja-link" style={{ fontSize: 14.5 }}>{card.link[1]} →</Link>}
    </section>
  );
}

function Countries() {
  return (
    <section aria-labelledby="reach-h" className="ja-card" style={{ gap: 12 }}>
      <h2 id="reach-h" className="ja-h3">Where participants are</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 15 }}>
        {PARTICIPANT_COUNTRIES.map((c) => (
          <li key={c.name} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{c.name}</span>
            {c.open ? <span className="ja-pill live">open</span> : <span className="ja-mono">opening next</span>}
          </li>
        ))}
      </ul>
      <Link to={ROUTES.requestCountry} className="ja-link" style={{ fontSize: 14.5 }}>Need another country? Tell us →</Link>
    </section>
  );
}

function FoundingCard({ status }: { status: HomeSummary["founding"] }) {
  const [send, { isLoading, data, error }] = useFoundingLabMutation();
  const [hidden, setHidden] = useState(false);
  if (data?.data.status === "applied") {
    return (
      <section role="status" className="ja-card" style={{ gap: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Founding-lab request sent</span>
        <span className="ja-muted" style={{ fontSize: 15 }}>We'll reply by email within 2 working days. You can keep planning in the meantime.</span>
      </section>
    );
  }
  if (status !== "none" || hidden) return null;
  return (
    <section aria-labelledby="fl-h" className="ja-card sun" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "16px 24px" }}>
      <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 id="fl-h" style={{ fontFamily: "var(--body)", fontWeight: 600, fontSize: 17, letterSpacing: 0 }}>Now onboarding founding labs</h2>
        <span className="ja-muted" style={{ fontSize: 15 }}>The first research teams get priority recruiting, founding pricing and a direct line to us. We already have your details, so it's one click.</span>
        {error && <span className="ja-error" role="alert" style={{ marginTop: 8 }}>{readProblem(error).message}</span>}
      </div>
      <button type="button" className="ja-btn ink" disabled={isLoading} onClick={() => send({ action: "apply" })}>{isLoading ? "Sending…" : "Apply as a founding lab"}</button>
      <button type="button" className="ja-link" style={{ fontWeight: 400, alignSelf: "center" }} onClick={() => { setHidden(true); send({ action: "dismiss" }); }}>Not now</button>
    </section>
  );
}

function Returning({ h }: { h: HomeSummary }) {
  const [notice, setNotice] = useState("");
  const cur = h.money.currency;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {h.needsYou.length > 0 && (
        <section aria-labelledby="att-h" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="att-h" className="ja-h2">Needs you</h2>
          <div className="ja-grid">
            {h.needsYou.map((n) => (
              <Link key={`${n.kind}-${n.surveyId}`} to={needsYouLink(n)} className={`ja-need${n.kind === "draft" ? "" : " hot"}`}>
                <span className="k">{n.kind === "review" ? "Review" : n.kind === "changes" ? "Before launch" : "Draft"} · {n.name}</span>
                {n.kind === "changes" ? (
                  <>
                    <span className="t">We asked for a change</span>
                    <span className="d">{n.note.length > 120 ? `${n.note.slice(0, 117)}…` : n.note}</span>
                  </>
                ) : n.kind === "review" ? (
                  <>
                    <span className="t">{n.count} submission{n.count === 1 ? "" : "s"} to review</span>
                    <span className="d">Approve or reject it. Anything you leave is approved automatically after 7 days.</span>
                  </>
                ) : (
                  <>
                    <span className="t">{n.count ? `${n.count} thing${n.count === 1 ? "" : "s"} left before launch` : "Ready to launch"}</span>
                    <span className="d">{n.missing.length ? capitalise(n.missing.slice(0, 3).join(", ")) + (n.missing.length > 3 ? "…" : "") : "Open it to launch"}</span>
                  </>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="st-h" className="ja-card" style={{ gap: 12 }}>
        <div className="ja-row">
          <h2 id="st-h" className="ja-h2">Your studies</h2>
          {h.counts.total > 5 && <Link to="/dashboard/researcher/studies" className="ja-link">See all {h.counts.total} →</Link>}
        </div>
        {notice && <div role="status" style={{ padding: "12px 16px", borderRadius: 14, background: "#f0faf3", border: "1px solid #cfe9d6", fontSize: 15 }}>{notice}</div>}
        <StudiesTable studies={h.studies.slice(0, 5)} currency={cur} onNotice={setNotice} />
      </section>

      <section aria-label="Money" className="ja-grid">
        {h.money.held > 0 && (
          <div className="ja-card ja-stat" style={{ gap: 6 }}>
            <span className="ja-muted">Held for your studies</span>
            <span className="big">{formatMoney(h.money.held, cur)}</span>
            <span className="ja-small">Paid out only for work you approve</span>
          </div>
        )}
        <div className="ja-card ja-stat" style={{ gap: 6 }}>
          <span className="ja-muted">Paid for approved work</span>
          <span className="big">{formatMoney(h.money.paid, cur)}</span>
          <span className="ja-small">Across all studies · <Link to="/dashboard/researcher/wallet" style={{ color: "var(--ink)" }}>Payments</Link></span>
        </div>
        <div className="ja-card ja-stat" style={{ gap: 6 }}>
          <span className="ja-muted">Live studies</span>
          <span className="big">{h.counts.live}</span>
          <span className="ja-small">{h.counts.draft} draft · {h.counts.closed} closed</span>
        </div>
        {h.money.credit > 0 && (
          <div className="ja-card ja-stat" style={{ gap: 6 }}>
            <span className="ja-muted">Credit</span>
            <span className="big">{formatMoney(h.money.credit, cur)}</span>
            <span className="ja-small">Money back from closed studies, ready for your next one</span>
          </div>
        )}
      </section>
    </div>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
