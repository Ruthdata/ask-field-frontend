import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useGetPlanQuery, type PlanView } from "@/redux/api/planApi";
import { formatMoney, methodById } from "@/lib/study";
import "@/styles/app.css";
import StepBasics from "./StepBasics";
import StepWho from "./StepWho";
import StepSetup from "./StepSetup";
import StepPay from "./StepPay";
import { SLUGS, STEP_OF, launchPath, planPath, stepName, type Slug } from "./steps";


/** Stage 4: the study planner. One page per step, with the cost and participant preview alongside. */
export default function PlanPage() {
  const { id = "", step = "basics" } = useParams();
  const { data, isLoading, isError, refetch } = useGetPlanQuery(id, { refetchOnMountOrArgChange: true });
  const slug = (SLUGS as readonly string[]).includes(step) ? (step as Slug) : null;
  if (!slug) return <Navigate to={planPath(id, "basics")} replace />;

  if (isLoading) return <div className="jp" aria-busy="true"><div className="jp-body"><div className="ja-skeleton" style={{ flex: 1, height: 400 }} /></div></div>;
  if (isError || !data) {
    return (
      <div className="jp"><div className="jp-body"><div className="jp-note bad" role="alert" style={{ flex: 1 }}>
        We couldn't open this study. <button type="button" className="jp-btn2 sm" onClick={() => refetch()}>Try again</button> <Link to="/dashboard/researcher">Back to home</Link>
      </div></div></div>
    );
  }
  const view = data.data;
  if (view.status !== "draft") return <Navigate to={`/dashboard/researcher/studies/${view.surveyId}`} replace />;
  // Paid and being checked, or waiting for an invoice: the plan is locked, so show where it's at.
  if (["checking", "awaiting-payment", "rejected"].includes(view.launchStage)) return <Navigate to={launchPath(view.surveyId, "status")} replace />;
  const props = { view, slug };
  // Keyed by step so each step starts from the saved plan.
  if (slug === "basics") return <StepBasics key="b" {...props} />;
  if (slug === "who") return <StepWho key="w" {...props} />;
  if (slug === "setup") return <StepSetup key="s" {...props} />;
  return <StepPay key="p" {...props} />;
}

export function PlanShell({ view, slug, status, title, lede, children }: { view: PlanView; slug: Slug; status: string; title: string; lede: string; children: ReactNode }) {
  const idx = SLUGS.indexOf(slug);
  const m = methodById(view.method);
  return (
    <div className="jp">
      <header className="jp-top">
        <Link to="/dashboard/researcher">← Home</Link>
        <div className="name"><b>{view.plan.basics?.title || view.name}</b><span className="jp-pill">{m?.label}</span></div>
        <span className={`jp-status${/Couldn't/.test(status) ? " bad" : ""}`} role="status" aria-live="polite">{status}</span>
      </header>
      <div className="jp-body">
        <nav className="jp-rail" aria-label="Plan steps">
          <span className="jp-mono" style={{ padding: "0 12px 8px" }}>Plan your study</span>
          {SLUGS.map((s, i) => {
            const done = view.done[STEP_OF[s]];
            return (
              <Link key={s} to={planPath(view.surveyId, s)} aria-current={s === slug ? "step" : undefined}>
                <span className={`jp-rn${done && s !== slug ? " done" : ""}`} aria-hidden="true">{done && s !== slug ? "✓" : i + 1}</span>
                <span>{stepName(s, view.method)}<span className="sr-only">{done ? " (done)" : ""}</span></span>
              </Link>
            );
          })}
          <span className="later"><span className="jp-rn" aria-hidden="true">5</span>Launch</span>
        </nav>
        <main className="jp-main">
          <div className="jp-mstep">
            <span className="jp-mono">Step {idx + 1} of 4 · {stepName(slug, view.method)}</span>
            <span className="bar" aria-hidden="true"><span style={{ width: `${(idx + 1) * 25}%` }} /></span>
          </div>
          {view.launchStage === "changes-needed" && (
            <div className="jp-note sun" role="status">We asked for a change before your study goes live. When it's done, <Link to={launchPath(view.surveyId, "status")} style={{ color: "var(--ink)", fontWeight: 600 }}>send it back to us</Link>.</div>
          )}
          <h1 className="jp-h1">{title}</h1>
          <p className="jp-lede">{lede}</p>
          {children}
        </main>
        <Summary view={view} />
      </div>
    </div>
  );
}

function Summary({ view }: { view: PlanView }) {
  const f = view.figures;
  const m = methodById(view.method);
  const left = SLUGS.filter((s) => !view.done[STEP_OF[s]]);
  const academic = f.feeRate < 0.2 && view.organization.verified;
  const tags =
    view.method === "survey" ? ["Online survey"] : view.method === "interview" ? ["Video call", "Book a time"] : view.method === "focus-group" ? ["Video call", "Group session"] : view.method === "product-test" ? ["Try a product"] : ["AI task"];
  return (
    <aside className="jp-aside" aria-label="Summary">
      <section className="jp-cost" aria-live="polite">
        <span className="jp-mono" style={{ color: "var(--sun)" }}>Cost so far</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="r"><span>{f.places || "?"} {f.places === 1 ? "person" : "people"} × {formatMoney(f.perPerson, f.currency)}</span><span>{formatMoney(f.pay, f.currency)}</span></span>
          <span className="r"><span>joinStudy fee · {Math.round(f.feeRate * 100)}%{academic ? " academic" : ""}</span><span>{formatMoney(f.fee, f.currency)}</span></span>
        </div>
        <div className="tot">
          <span style={{ fontSize: 13.5, color: "var(--on-night-2)" }}>To fund at launch</span>
          <span className="big">{formatMoney(f.total, f.currency)}</span>
        </div>
        <span style={{ fontSize: 13, color: "var(--on-night-2)", lineHeight: 1.45 }}>You're only charged for work you approve. Unused money comes back when the study closes.</span>
      </section>
      <section className="jp-card" aria-label="What participants see">
        <span className="jp-mono">What participants see</span>
        <div className="jp-preview">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, letterSpacing: "-.04em" }}>{f.perPerson ? formatMoney(f.perPerson, f.currency) : "Pay not set"}</span>
            <span className="jp-mono">{f.minutes ? `${f.minutes} min` : "time not set"}</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}>{view.plan.basics?.title || view.name}</span>
          <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
            {view.organization.name || "Independent researcher"}
            {view.organization.verified && <> · <b style={{ color: "var(--ink)" }}>✓ verified</b></>}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{tags.map((t) => <span key={t} className="jp-tag">{t}</span>)}<span className="jp-tag">{m?.label}</span></div>
        </div>
        <span className="jp-hint" style={{ fontSize: 13 }}>Pay and time are shown before anyone starts.</span>
      </section>
      <section className="jp-card" aria-label="Before launch" style={{ gap: 8, padding: "18px 20px" }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Still needed before launch</span>
        {left.length ? (
          left.map((s) => (
            <Link key={s} to={planPath(view.surveyId, s)} style={{ fontSize: 14, color: "var(--ink-2)" }}>○ {stepName(s, view.method)}: {view.missing[STEP_OF[s]][0]}</Link>
          ))
        ) : (
          <span style={{ fontSize: 14, color: "var(--ink-2)" }}>✓ Nothing. You can launch.</span>
        )}
      </section>
    </aside>
  );
}
