import { useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  openFundingDocument,
  useCancelInvoiceMutation,
  useConfirmTestPaymentMutation,
  useGetLaunchQuery,
  usePayForStudyMutation,
  useResubmitStudyMutation,
  type LaunchView,
  type PayResult,
  type Receipt,
} from "@/redux/api/launchApi";
import { useGetResearcherQuery } from "@/redux/api/slices/userSlice";
import { formatMoney, methodById, RECEIPT_COUNTRIES } from "@/lib/study";
import { useGetBillingQuery } from "@/redux/api/accountApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { readProblem } from "@/lib/session";
import { SUPPORT_EMAIL } from "@/lib/site";
import { launchPath, planPath } from "@/pages/plan/steps";
import { StripeCard } from "@/components/payments/StripeCard";
import "@/styles/app.css";

/** Stage 5: check everything once → pay (card, invoice or credit) → our check → live. */
const STEPS = ["Review", "Pay", "Our check", "Live"];

function useLaunch(poll = false) {
  const { id = "" } = useParams();
  const q = useGetLaunchQuery(id, { refetchOnMountOrArgChange: true, pollingInterval: poll ? 15000 : 0 });
  return { id, ...q, view: q.data?.data };
}

function Shell({ view, step, children, aside }: { view: LaunchView; step: number; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="jp">
      <header className="jp-top">
        <Link to={view.status === "draft" ? planPath(view.surveyId, "pay") : "/dashboard/researcher"}>{view.status === "draft" ? "← Back to plan" : "← Home"}</Link>
        <div className="name"><b>{view.plan.basics?.title || view.name}</b><span className="jp-pill">{methodById(view.method)?.label}</span></div>
      </header>
      <nav aria-label="Launch steps" style={{ padding: "18px clamp(16px,3vw,32px) 0", maxWidth: 1400, margin: "0 auto" }}>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", maxWidth: 760 }}>
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: i === step ? 600 : 400, color: i <= step ? "var(--ink)" : "#8d89a3" }}>
              <span className={`jp-rn${i < step ? " done" : ""}`} aria-hidden="true" style={i === step ? { border: "2px solid var(--ink)", color: "var(--ink)" } : undefined}>{i < step ? "✓" : i + 1}</span>
              {s}
              {i < 3 && <span aria-hidden="true" style={{ width: 40, height: 2, background: "#e7e4ef", marginLeft: 6 }} />}
            </li>
          ))}
        </ol>
      </nav>
      <div className="jp-body">
        <main className="jp-main">{children}</main>
        {aside}
      </div>
    </div>
  );
}

function Order({ view, title = "Your order", useCredit = false }: { view: LaunchView; title?: string; useCredit?: boolean }) {
  const f = view.figures;
  const cur = f.currency;
  const credit = useCredit ? Math.min(view.credit, view.due) : 0;
  return (
    <aside className="jp-aside" aria-label="Order">
      <section className="jp-cost" aria-live="polite">
        <span className="jp-mono" style={{ color: "var(--sun)" }}>{title}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="r"><span>{f.places} {f.places === 1 ? "person" : "people"} × {formatMoney(f.perPerson, cur)}</span><span>{formatMoney(f.pay, cur)}</span></span>
          <span className="r"><span>joinStudy fee · {Math.round(f.feeRate * 100)}%</span><span>{formatMoney(f.fee, cur)}</span></span>
          {view.paidIn > 0 && <span className="r"><span>Already paid</span><span>−{formatMoney(view.paidIn, cur)}</span></span>}
          {credit > 0 && <span className="r"><span>Credit from closed studies</span><span>−{formatMoney(credit, cur)}</span></span>}
        </div>
        <div className="tot">
          <span style={{ fontSize: 13.5, color: "var(--on-night-2)" }}>To pay now</span>
          <span className="big">{formatMoney(Math.max(0, view.due - credit), cur)}</span>
        </div>
      </section>
      <section className="jp-card" style={{ gap: 10, fontSize: 14.5, lineHeight: 1.5, color: "var(--ink-2)" }}>
        <b style={{ color: "var(--ink)", fontSize: 15 }}>How the money works</b>
        <span>You pay the full amount now. We hold it for this study.</span>
        <span>Each participant is paid, and the fee charged, only when you approve their work.</span>
        <span>When the study closes, anything unused comes back to you.</span>
      </section>
    </aside>
  );
}

const Loading = () => <div className="jp" aria-busy="true"><div className="jp-body"><div className="ja-skeleton" style={{ flex: 1, height: 400 }} /></div></div>;
const Failed = ({ retry }: { retry: () => void }) => (
  <div className="jp"><div className="jp-body"><div className="jp-note bad" role="alert" style={{ flex: 1 }}>We couldn't open this study. <button type="button" className="jp-btn2 sm" onClick={retry}>Try again</button></div></div></div>
);

/** Where a study in each stage should be looked at. */
function routeFor(view: LaunchView, here: "review" | "pay" | "status") {
  const toStatus = view.status !== "draft" || ["awaiting-payment", "checking", "rejected"].includes(view.launchStage) || (view.launchStage === "changes-needed" && here === "review" && view.due === 0);
  if (here !== "status" && toStatus) return launchPath(view.surveyId, "status");
  return null;
}

// ---------------------------------------------------------------- 5.1 review
const Row = ({ k, children }: { k: string; children: ReactNode }) => <><dt>{k}</dt><dd>{children}</dd></>;
function Sec({ id, title, slug, children }: { id: string; title: string; slug: "basics" | "who" | "setup" | "pay"; children: ReactNode }) {
  return (
    <section className="jp-sec" aria-label={title}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <h2>{title}</h2>
        <Link to={planPath(id, slug)} style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>Edit<span className="sr-only"> {title}</span></Link>
      </div>
      <dl className="jl-kv">{children}</dl>
    </section>
  );
}
export function LaunchReview() {
  const { view, isLoading, isError, refetch } = useLaunch();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  if (isLoading) return <Loading />;
  if (isError || !view) return <Failed retry={refetch} />;
  const go = routeFor(view, "review");
  if (go) return <Navigate to={go} replace />;
  if (!view.ready) return <Navigate to={planPath(view.surveyId, "pay")} replace />;
  const p = view.plan;
  const a = p.audience || {};
  const s = (p.setup || {}) as Record<string, unknown>;
  const f = view.figures;
  const cur = f.currency;
  const genders = a.genders?.length ? a.genders.join(", ") : "any gender";
  return (
    <Shell view={view} step={0} aside={<Order view={view} />}>
      <h1 className="jp-h1">Check everything once</h1>
      <p className="jp-lede">This is what participants will see and what we'll check. Change anything now; after launch you can only add places or close early.</p>
      {view.launchStage === "changes-needed" && <div className="jp-note sun">Your changes add {formatMoney(view.due, cur)}. Pay the difference to send the study back to us.</div>}
      <Sec id={view.surveyId} title="Basics" slug="basics">
        <Row k="Title">{p.basics?.title}</Row>
        <Row k="What they'll do">{p.basics?.description || "—"}</Row>
        {p.basics?.sensitive && <Row k="Warning">{p.basics.warning}</Row>}
        <Row k="Consent">{p.basics?.consent?.mode === "joinstudy" ? `On a joinStudy page before they start (${p.basics.consent.text.length} characters)` : "You collect it in your study"}</Row>
        {p.basics?.ethics?.body && <Row k="Ethics approval">{p.basics.ethics.body}{p.basics.ethics.reference ? `, ${p.basics.ethics.reference}` : ""}</Row>}
      </Sec>
      <Sec id={view.surveyId} title="Who you need" slug="who">
        <Row k="Where">{(a.countries || []).join(", ")}{a.includeDiaspora ? ", and people from there living elsewhere" : ""}</Row>
        <Row k="Who">Aged {a.minAge ?? 18}–{a.maxAge ?? 100} · {genders}{a.languages?.length ? ` · speaks ${a.languages.join(" or ")}` : ""}</Row>
        {!!a.questions?.length && <Row k="Your questions">{a.questions.map((q) => `“${q.text}”`).join(", ")}</Row>}
        {a.quota && <Row k="Quotas">{a.quota.groups.map((g) => `${g.value} ${g.places}`).join(" · ")}</Row>}
      </Sec>
      <Sec id={view.surveyId} title="Setup" slug="setup">
        {typeof s.url === "string" && <Row k="Link">{s.url}</Row>}
        {typeof s.toolUrl === "string" && <Row k="Tool">{s.toolUrl}</Row>}
        {view.returnLink && <Row k="Finish link">{view.returnLink.replace(/^https?:\/\//, "")} · we check it works during our review</Row>}
        <Row k="Time">{f.minutes} minutes{Array.isArray(s.devices) ? ` · ${(s.devices as string[]).join(", ")}` : ""}</Row>
      </Sec>
      <Sec id={view.surveyId} title="Pay and timing" slug="pay">
        <Row k="Pay">{formatMoney(f.perPerson, cur)} each · {formatMoney(f.hourly, cur)} an hour</Row>
        <Row k="Places">{f.places}</Row>
        <Row k="Runs">{p.pay?.opens === "date" ? `Opens ${p.pay.opensAt}` : "Opens when approved"} · {p.pay?.closes === "date" ? `closes ${p.pay.closesAt}` : "closes when full"}</Row>
        <Row k="Reviewing">{p.pay?.review === "auto" ? "Approved automatically" : "You review each one; unreviewed work is approved after 7 days"}</Row>
      </Sec>
      <section className="jp-sec" aria-labelledby="ag">
        <h2 id="ag">Before you pay</h2>
        <button type="button" role="checkbox" aria-checked={agreed} className="jp-check" style={{ alignItems: "flex-start", padding: "14px 16px", lineHeight: 1.45 }} onClick={() => setAgreed(!agreed)}>
          <span className="jp-box" aria-hidden="true" style={{ marginTop: 1 }}>{agreed ? "✓" : ""}</span>
          <span>I confirm this study has any approvals it needs, and follows the joinStudy research terms: no collecting names or contact details unless consent says so, and fair treatment of every participant.</span>
        </button>
      </section>
      <div className="jp-actions">
        <button type="button" className="jp-btn" disabled={!agreed} onClick={() => navigate(launchPath(view.surveyId, "pay"), { state: { agreed: true } })}>Continue to payment →</button>
        <span className="jp-hint">Nothing is charged until the next step.</span>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- 5.2 pay
const COUNTRIES = RECEIPT_COUNTRIES;

export function LaunchPay() {
  const { id, view, isLoading, isError, refetch } = useLaunch();
  const navigate = useNavigate();
  const location = useLocation();
  const agreed = !!(location.state as { agreed?: boolean } | null)?.agreed;
  const { data: me } = useGetResearcherQuery();
  const r = me?.data;
  // Stage 9: the workspace's saved receipt details come first.
  const { data: billingData } = useGetBillingQuery();
  const saved = billingData?.data;
  const ws = useWorkspace();
  const [picked, setMethod] = useState<"card" | "invoice">("card");
  const [useCredit, setUseCredit] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [problem, setProblem] = useState("");
  const [started, setStarted] = useState<Extract<PayResult, { method: "card" }> | null>(null);
  const [pay, payState] = usePayForStudyMutation();
  const [confirmTest, testState] = useConfirmTestPaymentMutation();

  if (isLoading) return <Loading />;
  if (isError || !view) return <Failed retry={refetch} />;
  const go = routeFor(view, "pay");
  if (go) return <Navigate to={go} replace />;
  if (!agreed) return <Navigate to={launchPath(id)} replace />;

  const rc: Receipt = receipt ?? (saved?.saved
    ? { name: saved.name, organization: saved.organization, email: saved.email, cc: saved.cc, reference: saved.reference, country: COUNTRIES.includes(saved.country) ? saved.country : "Other" }
    : {
        name: r ? `${r.firstName} ${r.lastName || ""}`.trim() : "",
        organization: r?.organizationName || "",
        email: r?.email || "",
        cc: "",
        reference: "",
        country: r?.country && COUNTRIES.includes(r.country) ? r.country : "United States",
      });
  const set = (patch: Partial<Receipt>) => setReceipt({ ...rc, ...patch });
  const cur = view.figures.currency;
  const credit = useCredit ? Math.min(view.credit, view.due) : 0;
  const toPay = Math.max(0, view.due - credit);
  const cardsOff = view.payments.cards === "unavailable";
  // const cardsOff = view.payments.cards === "stripe";
  // Cards off (Stripe not set up): start on invoice, so the Pay button works straight away.
  const method = cardsOff && picked === "card" ? "invoice" : picked;

  const submit = async () => {
    setProblem("");
    try {
      const res = (await pay({ id, method: toPay === 0 ? "card" : method, useCredit, agree: true, receipt: rc }).unwrap()).data;
      if (res.method === "card" && res.status === "pending") setStarted(res);
      else navigate(launchPath(id, "status"));
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const confirmTestCard = async () => {
    if (!started) return;
    try {
      await confirmTest({ fundingId: started.fundingId, id }).unwrap();
      navigate(launchPath(id, "status"));
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  console.log({cardsOff, view: view.payments})

  return (
    <Shell view={view} step={1} aside={<Order view={view} useCredit={useCredit} />}>
      <h1 className="jp-h1">Pay for your study</h1>
      {!ws.canPay && <div className="jp-note sun" role="status">Only owners and admins of this workspace can pay. Ask one of them to pay for this study; everything else is ready.</div>}
      {!started && ws.canPay && (
        <>
          <section className="jp-sec" aria-labelledby="pm">
            <h2 id="pm">How you'll pay</h2>
            <div role="radiogroup" aria-labelledby="pm" className="jp-opts">
              <button type="button" role="radio" aria-checked={method === "card"} className="jp-opt" disabled={cardsOff} onClick={() => setMethod("card")}>
                <span className="jp-dot" aria-hidden="true" /><span className="jp-ot"><b>Card</b><span>{cardsOff ? `Not available yet. Choose invoice, or email ${SUPPORT_EMAIL}.` : "Paid now. Our check starts straight away."}</span></span>
              </button>
              <button type="button" role="radio" aria-checked={method === "invoice"} className="jp-opt" onClick={() => setMethod("invoice")}>
                <span className="jp-dot" aria-hidden="true" /><span className="jp-ot"><b>Invoice or bank transfer</b><span>For universities and companies paying by purchase order. We start our check when the money arrives.</span></span>
              </button>
            </div>
            {view.credit > 0 && (
              <button type="button" role="switch" aria-checked={useCredit} className="jp-tog" onClick={() => setUseCredit(!useCredit)}>
                <span className="jp-sw" aria-hidden="true" />
                <span className="jp-ot"><b>Use {formatMoney(Math.min(view.credit, view.due), cur)} credit from closed studies</b><span>Money that came back from studies you closed.</span></span>
              </button>
            )}
          </section>
          <section className="jp-sec" aria-labelledby="bd">
            <h2 id="bd">Receipt details</h2>
            <span className="jp-hint" style={{ marginTop: -8 }}>What your grant or finance office will see on the {method === "invoice" ? "invoice" : "receipt"}.</span>
            <div className="jp-row2">
              <div className="jp-fld"><label htmlFor="rc-n">Name on {method === "invoice" ? "invoice" : "receipt"}</label><input id="rc-n" type="text" value={rc.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="jp-fld"><label htmlFor="rc-o">Organisation</label><input id="rc-o" type="text" value={rc.organization} onChange={(e) => set({ organization: e.target.value })} /></div>
              <div className="jp-fld"><label htmlFor="rc-e">Send it to</label><input id="rc-e" type="email" value={rc.email} onChange={(e) => set({ email: e.target.value })} /></div>
              <div className="jp-fld"><label htmlFor="rc-c">Also copy <span className="jp-hint">(optional)</span></label><input id="rc-c" type="email" placeholder="e.g. your finance office" value={rc.cc} onChange={(e) => set({ cc: e.target.value })} /></div>
              <div className="jp-fld"><label htmlFor="rc-r">Grant or PO reference <span className="jp-hint">(optional)</span></label><input id="rc-r" type="text" value={rc.reference} onChange={(e) => set({ reference: e.target.value })} /></div>
              <div className="jp-fld"><label htmlFor="rc-cty">Country</label><select id="rc-cty" value={rc.country} onChange={(e) => set({ country: e.target.value })}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            </div>
          </section>
          {method === "invoice" && toPay > 0 && <div className="jp-note sun">We'll email an invoice with joinStudy's bank details and a reference to quote. Bank transfers usually arrive in 1 to 5 working days; we email you when it does.</div>}
          {problem && <div className="jp-note bad" role="alert">{problem}</div>}
          <div className="jp-actions">
            <button type="button" className="jp-btn" onClick={submit} disabled={payState.isLoading || (method === "card" && cardsOff && toPay > 0)}>
              {payState.isLoading ? "One moment…" : toPay === 0 ? "Pay with credit" : method === "card" ? `Continue to card · ${formatMoney(toPay, cur)}` : "Send me the invoice →"}
            </button>
            <Link className="jp-btn2" to={launchPath(id)}>Back</Link>
          </div>
          <span className="jp-hint">By paying you agree that unused money comes back when the study closes, or within 14 days if we can't approve your study.</span>
        </>
      )}

      {started && (
        <section className="jp-sec" aria-labelledby="cd">
          <h2 id="cd">Card</h2>
          {started.provider === "stripe" && started.publishableKey ? (
            <StripeCard publishableKey={started.publishableKey} clientSecret={started.clientSecret} amountLabel={formatMoney(started.amount, started.currency)} returnUrl={`${window.location.origin}${launchPath(id, "status")}`} />
          ) : (
            <>
              <div className="jp-note">
                <b>Test payments</b> · Card payments aren't connected in this environment, so no real money moves. In production this is the payment provider's secure card form.
              </div>
              {problem && <div className="jp-note bad" role="alert">{problem}</div>}
              <div className="jp-actions">
                <button type="button" className="jp-btn" onClick={confirmTestCard} disabled={testState.isLoading}>{testState.isLoading ? "Paying…" : `Pay ${formatMoney(started.amount, started.currency)} (test)`}</button>
                <button type="button" className="jp-btn2" onClick={() => setStarted(null)}>Back</button>
              </div>
            </>
          )}
        </section>
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------- 5.3 our check
export function LaunchStatus() {
  const { id, view, isLoading, isError, refetch } = useLaunch(true);
  const navigate = useNavigate();
  const [resubmit, resubmitState] = useResubmitStudyMutation();
  const [cancelInvoice, cancelState] = useCancelInvoiceMutation();
  const [problem, setProblem] = useState("");
  if (isLoading) return <Loading />;
  if (isError || !view) return <Failed retry={refetch} />;
  if (view.status === "draft" && view.launchStage === "none") return <Navigate to={launchPath(id)} replace />;

  const live = view.status === "live";
  const stage = live ? "live" : view.launchStage;
  const cur = view.figures.currency;
  const paid = view.fundings.filter((f) => f.status === "paid");
  const pending = view.fundings.find((f) => f.status === "pending" && f.method === "invoice");
  const lastPaid = paid[paid.length - 1];
  const checks = view.review.checks;
  const H: Record<string, [string, string]> = {
    "awaiting-payment": ["Your invoice is on its way", "Your study is saved. We'll check it as soon as the payment arrives."],
    checking: ["We're checking your study", "Paid, and the automatic checks have run. A person on our team is reviewing it now. We'll email you either way."],
    "changes-needed": ["One thing to change", "We can't open your study yet. It's usually a quick fix."],
    rejected: ["We can't run this study", "Everything you paid is being refunded within 14 days."],
    live: ["Your study is live", "Matching participants can see it now. We'll email you as work comes in."],
    closed: ["This study is closed", ""],
  };
  type Step = { title: string; text: string; state: "done" | "now" | "warn" | "later" };
  const paidLine = lastPaid
    ? `${lastPaid.method === "card" ? `Card${lastPaid.cardLast4 ? ` ending ${lastPaid.cardLast4}` : ""}` : lastPaid.method === "credit" ? "Credit" : "Bank transfer"} · ${new Date(lastPaid.paidAt || lastPaid.createdAt).toLocaleString()}`
    : "";
  const steps: Step[] =
    stage === "awaiting-payment"
      ? [{ title: "Waiting for payment", text: pending ? `Invoice ${pending.number} sent.` : "", state: "now" }, { title: "Automatic checks", text: "Start when the money arrives.", state: "later" }, { title: "joinStudy review", text: "", state: "later" }, { title: "Live", text: "", state: "later" }]
      : [
          { title: `Paid · ${formatMoney(view.paidIn, cur)}`, text: paidLine, state: "done" },
          { title: "Automatic checks", text: checks.length ? checks.map((c) => `${c.ok ? "✓" : "!"} ${c.label}: ${c.note}`).join("\n") : "", state: checks.some((c) => !c.ok) ? "warn" : "done" },
          { title: stage === "changes-needed" ? "Changes needed" : stage === "rejected" ? "Not approved" : "joinStudy review", text: stage === "checking" ? "A person reads your study and tries your link." : stage === "changes-needed" ? "See the note above." : live ? "Approved." : "", state: stage === "checking" ? "now" : stage === "changes-needed" || stage === "rejected" ? "warn" : "done" },
          { title: "Live", text: live ? "Open to matching participants." : "", state: live ? "done" : "later" },
        ];
  const dot = (s: Step["state"]) =>
    s === "done" ? { background: "var(--night)", color: "var(--sun)", border: 0 } : s === "now" ? { border: "2px solid var(--ink)" } : s === "warn" ? { background: "var(--sun)", color: "var(--sun-ink)", border: 0, fontWeight: 700 } : {};

  const sendBack = async () => {
    setProblem("");
    try {
      await resubmit(id).unwrap();
    } catch (err) {
      const p = readProblem(err);
      if (p.code === "top_up_needed") navigate(launchPath(id), { replace: false });
      else setProblem(p.message);
    }
  };

  return (
    <Shell
      view={view}
      step={live ? 4 : stage === "awaiting-payment" ? 1 : 2}
      aside={
        <aside className="jp-aside" aria-label="Payment">
          <section className="jp-cost">
            <span className="jp-mono" style={{ color: "var(--sun)" }}>{stage === "awaiting-payment" ? "Invoice" : "Payment"}</span>
            <span className="r"><span>Held for this study</span><span>{formatMoney(view.paidIn, cur)}</span></span>
            <span style={{ fontSize: 13.5, color: "var(--on-night-2)", lineHeight: 1.45 }}>
              {stage === "awaiting-payment" ? "Nothing is held until the transfer arrives." : "If we can't approve your study, you get all of it back within 14 days."}
            </span>
            {paid.map((f) => (
              <button key={f.fundingId} type="button" className="jp-link" style={{ color: "var(--sun)", textAlign: "left" }} onClick={() => openFundingDocument(f.fundingId)}>Receipt {f.number}</button>
            ))}
          </section>
        </aside>
      }
    >
      <h1 className="jp-h1">{H[stage]?.[0]}</h1>
      <p className="jp-lede">{H[stage]?.[1]}</p>

      {stage === "changes-needed" && (
        <section className="jp-sec" style={{ border: "2px solid var(--ink)", gap: 12 }} aria-label="Note from the joinStudy team">
          <span className="jp-mono">From the joinStudy team{view.review.decidedAt ? ` · ${new Date(view.review.decidedAt).toLocaleString()}` : ""}</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, whiteSpace: "pre-line" }}>{view.review.note}</p>
          {problem && <div className="jp-note bad" role="alert">{problem}</div>}
          <div className="jp-actions">
            <Link className="jp-btn" to={planPath(id, "basics")} style={{ height: 48, fontSize: 15 }}>Fix it</Link>
            <button type="button" className="jp-btn2" onClick={sendBack} disabled={resubmitState.isLoading}>{resubmitState.isLoading ? "Sending…" : "I've fixed it, send it back"}</button>
            <a className="jp-btn2" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`About my study: ${view.plan.basics?.title || view.name}`)}`}>Reply to us</a>
          </div>
          <span className="jp-hint">Your payment stays with this study. You only pay more if your changes raise the cost.</span>
        </section>
      )}

      {stage === "rejected" && view.review.note && <div className="jp-note bad" style={{ whiteSpace: "pre-line" }}>{view.review.note}</div>}

      {stage === "awaiting-payment" && pending && (
        <section className="jp-sec" aria-label="Invoice" style={{ gap: 12 }}>
          <b style={{ fontSize: 16 }}>Invoice {pending.number} · {formatMoney(pending.amount, cur)}</b>
          <dl className="jl-kv"><dt>Reference</dt><dd><b>{pending.providerRef}</b> (quote this, so we can match the payment)</dd><dt>Due</dt><dd>On receipt</dd></dl>
          {problem && <div className="jp-note bad" role="alert">{problem}</div>}
          <div className="jp-actions">
            <button type="button" className="jp-btn2" onClick={() => openFundingDocument(pending.fundingId)}>Open invoice</button>
            <button type="button" className="jp-btn2" disabled={cancelState.isLoading} onClick={async () => { try { await cancelInvoice(id).unwrap(); navigate(launchPath(id)); } catch (err) { setProblem(readProblem(err).message); } }}>Cancel it and pay by card</button>
          </div>
        </section>
      )}

      <section className="jp-sec" aria-labelledby="tl">
        <h2 id="tl">Where it's at</h2>
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {steps.map((s) => (
            <li key={s.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
              <span className="jp-rn" aria-hidden="true" style={{ width: 26, height: 26, ...dot(s.state) }}>{s.state === "done" ? "✓" : s.state === "warn" ? "!" : s.state === "now" ? "•" : ""}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <b style={{ fontSize: 15.5 }}>{s.title}<span className="sr-only"> ({s.state === "done" ? "done" : s.state === "now" ? "in progress" : s.state === "warn" ? "needs attention" : "not yet"})</span></b>
                {s.text && <span style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{s.text}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <div className="jp-actions">
        {live ? <Link className="jp-btn" to={`/dashboard/researcher/studies/${id}`}>Open the study</Link> : <Link className="jp-btn2" to="/dashboard/researcher">Back to home</Link>}
        {!live && stage !== "rejected" && <span className="jp-hint">We'll email you at each step.</span>}
      </div>
    </Shell>
  );
}
