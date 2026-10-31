import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PlanView } from "@/redux/api/planApi";
import { fairPay, formatMoney } from "@/lib/study";
import { PlanShell } from "./PlanPage copy";
import { launchPath, planPath, type Slug } from "./steps";
import { useStepDraft, statusText } from "./useStepDraft";
import { Choice, Field, NumberInput } from "./parts";

const AUTO: Record<string, [string, string]> = {
  survey: ["Approve when they reach the finish link", "Quickest for participants. You can still reject a response that's clearly not genuine."],
  interview: ["Approve when you mark the interview as done", "You tick “Happened” after each call."],
  "focus-group": ["Approve everyone who joined the session", "Based on who joined the call; you can untick anyone."],
  "product-test": ["Approve when they reach the finish link", "You can still reject work that's clearly not genuine."],
  "ai-evaluation": ["Approve when they reach the finish link", "You can still reject work that fails your checks."],
};

export default function StepPay({ view, slug }: { view: PlanView; slug: Slug }) {
  const p = view.plan.pay || {};
  const fixedPlaces = view.method === "interview" || view.method === "focus-group";
  const d = useStepDraft(view.surveyId, "pay", {
    perPerson: p.perPerson as number | undefined,
    ...(fixedPlaces ? {} : { places: p.places as number | undefined }),
    opens: p.opens ?? "approved",
    opensAt: p.opensAt ?? null,
    closes: p.closes ?? "full",
    closesAt: p.closesAt ?? null,
    review: p.review ?? "manual",
  });
  const v = d.value as typeof d.value & { places?: number };
  const e = d.errors;
  const f = view.figures;
  const cur = f.currency;
  const minutes = f.minutes;
  const hourly = minutes && v.perPerson ? Math.round(((v.perPerson * 60) / minutes) * 100) / 100 : 0;
  const fair = fairPay(hourly, cur, view.minHourlyPay, view.recommendedHourlyPay);
  const low = fair.level === "below-min";
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  // Save the step; if the whole plan is ready, go on to check everything and pay (Stage 5).
  const check = async () => {
    const r = await d.flush(true);
    if (!r.ok) {
      document.querySelector<HTMLElement>(".jp [aria-invalid='true'], .jp .jp-err")?.scrollIntoView({ block: "center" });
      return;
    }
    setConfirming(true);
  };

  return (
    <PlanShell view={view} slug={slug} status={statusText(d.status)} title="Pay and timing" lede="What each person earns, and when the study opens and closes.">
      <section className="jp-sec" aria-labelledby="p-pay">
        <h2 id="p-pay">Pay</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", alignItems: "flex-end" }}>
          <Field label={view.method === "interview" ? `Each interview pays (${cur})` : `Each person gets (${cur})`} error={e.perPerson}>
            {(id, db) => <NumberInput id={id} style={{ maxWidth: 200 }} min={0} step={0.5} value={v.perPerson} describedBy={db} invalid={!!e.perPerson} onChange={(perPerson) => d.update({ perPerson })} />}
          </Field>
          {hourly > 0 && <span style={{ fontSize: 16, paddingBottom: 14 }}>= <b>{formatMoney(hourly, cur)}</b> an hour for {minutes} min</span>}
        </div>
        {!minutes && <span className="jp-hint">Set how long it takes in the previous step to see the hourly rate.</span>}
        <div role="status" className={`jp-note${low ? " bad" : ""}`}>
          {fair.level === "below-suggested" ? <b>{fair.text}</b> : fair.text}
        </div>
        {!fixedPlaces && (
          <Field label="How many people you need" error={e.places}>
            {(id, db) => <NumberInput id={id} style={{ maxWidth: 200 }} min={1} step={1} value={v.places} describedBy={db} invalid={!!e.places} onChange={(places) => d.update({ places } as never)} />}
          </Field>
        )}
        {fixedPlaces && <span className="jp-hint">Places come from your {view.method === "interview" ? "interview count" : "sessions"}: {f.places}.</span>}
        <span className="jp-hint">People are paid in their own currency when you approve their work.</span>
      </section>

      <section className="jp-sec" aria-labelledby="p-when">
        <h2 id="p-when">When it runs</h2>
        <Choice label="Opens" grid value={v.opens} onChange={(opens) => d.update({ opens, opensAt: opens === "date" ? v.opensAt : null })} options={[
          { value: "approved", title: "As soon as it's approved", text: "We check every study before it opens." },
          { value: "date", title: "On a date", text: "It waits after approval until then." },
        ]} error={e.opensAt} />
        {v.opens === "date" && <Field label="Open on">{(id) => <input id={id} type="date" style={{ maxWidth: 220 }} value={v.opensAt ?? ""} onChange={(x) => d.update({ opensAt: x.target.value || null })} />}</Field>}
        <Choice label="Closes" grid value={v.closes} onChange={(closes) => d.update({ closes, closesAt: closes === "date" ? v.closesAt : null })} options={[
          { value: "full", title: "When every place is filled", text: "Or when you close it yourself." },
          { value: "date", title: "On a date, even if not full", text: "Unused money comes back to you." },
        ]} error={e.closesAt} />
        {v.closes === "date" && <Field label="Close on">{(id) => <input id={id} type="date" style={{ maxWidth: 220 }} value={v.closesAt ?? ""} onChange={(x) => d.update({ closesAt: x.target.value || null })} />}</Field>}
      </section>

      <section className="jp-sec" aria-labelledby="p-rev">
        <h2 id="p-rev">Reviewing work</h2>
        <Choice value={v.review} onChange={(review) => d.update({ review })} options={[
          { value: "manual", title: "I'll review each one", text: "Approve what you accept. Anything you haven't reviewed after 7 days is approved and paid, so participants aren't left waiting." },
          { value: "auto", title: AUTO[view.method][0], text: AUTO[view.method][1] },
        ]} />
      </section>

      {!confirming ? (
        <div className="jp-actions">
          <button type="button" className="jp-btn" onClick={check} disabled={d.status === "saving"}>Check and launch →</button>
          <Link className="jp-btn2" to={planPath(view.surveyId, "setup")}>Back</Link>
          <span className="jp-hint">Saved as you go.</span>
        </div>
      ) : (
        <section className="jp-sec" aria-labelledby="p-go" style={{ border: "2px solid var(--ink)" }}>
          <h2 id="p-go">{view.ready ? "Ready to launch" : "A few things left"}</h2>
          {!view.ready && (
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {(["basics", "audience", "setup", "pay"] as const).flatMap((k) => view.missing[k].map((m) => <li key={k + m}><Link to={planPath(view.surveyId, k === "audience" ? "who" : k)} style={{ color: "var(--ink)" }}>{m}</Link></li>))}
            </ul>
          )}
          {view.ready && (

            <div className="jp-actions">
              <button type="button" className="jp-btn" onClick={() => navigate(launchPath(view.surveyId))}>Review and pay →</button>
              <button type="button" className="jp-btn2" onClick={() => setConfirming(false)}>Keep editing</button>
            </div>
          )}
          {!view.ready && <div className="jp-actions"><Link to="/dashboard/researcher" className="jp-btn2">Back to home</Link><button type="button" className="jp-btn2" onClick={() => setConfirming(false)}>Keep editing</button></div>}
        </section>
      )}
    </PlanShell>
  );
}
