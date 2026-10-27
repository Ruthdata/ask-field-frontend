import { useNavigate } from "react-router-dom";
import type { PlanView } from "@/redux/api/planApi";
import { PlanShell } from "./PlanPage";
import { planPath, type Slug } from "./steps";
import { useStepDraft, statusText } from "./useStepDraft";
import { Choice, Field } from "./parts";
import { StepActions } from "./StepActions";

const EXAMPLE: Record<string, string> = {
  survey: "e.g. A 15-minute survey about how you get to work, what it costs and how long it takes. No right or wrong answers.",
  interview: "e.g. A 45-minute video interview about how you use AI tools to plan lessons. We'll record the audio, with your permission.",
  "focus-group": "e.g. A 60-minute video discussion with 5 other people about how your family sends and saves money.",
  "product-test": "e.g. Try a new health app on your phone, complete 4 short tasks, then tell us what was easy or confusing.",
  "ai-evaluation": "e.g. Read answers a chat model wrote in Yoruba and rate how correct and natural each one is.",
};

export default function StepBasics({ view, slug }: { view: PlanView; slug: Slug }) {
  const navigate = useNavigate();
  const b = view.plan.basics || {};
  const d = useStepDraft(view.surveyId, "basics", {
    title: b.title ?? view.name,
    internalName: b.internalName ?? "",
    description: b.description ?? "",
    sensitive: b.sensitive ?? false,
    warning: b.warning ?? "",
    consent: b.consent ?? { mode: "joinstudy" as const, text: "" },
    ethics: b.ethics ?? { body: "", reference: "" },
  });
  const v = d.value;
  const e = d.errors;
  const next = async () => {
    const r = await d.flush(true);
    if (r.ok) navigate(planPath(view.surveyId, "who"));
    else document.querySelector<HTMLElement>(".jp [aria-invalid='true']")?.focus();
  };

  return (
    <PlanShell view={view} slug={slug} status={statusText(d.status)} title="Basics" lede="What participants read before they decide to take part. Write it for them, not for a review board.">
      <section className="jp-sec" aria-labelledby="b-about">
        <h2 id="b-about">About the study</h2>
        <Field label="Title participants see" hint="Plain words, under 80 characters." error={e.title}>
          {(id, db) => <input id={id} type="text" maxLength={160} value={v.title} aria-describedby={db} aria-invalid={!!e.title || undefined} onChange={(x) => d.update({ title: x.target.value })} />}
        </Field>
        <Field label={<>Name for your team <span className="jp-hint">(optional, only you see it)</span></>} error={e.internalName}>
          {(id) => <input id={id} type="text" maxLength={160} value={v.internalName} onChange={(x) => d.update({ internalName: x.target.value })} />}
        </Field>
        <Field label="What will participants do?" hint="Say what happens, how long it takes and what you'll ask about. 2 to 4 sentences is plenty." error={e.description}>
          {(id, db) => <textarea id={id} maxLength={4000} placeholder={EXAMPLE[view.method]} value={v.description} aria-describedby={db} onChange={(x) => d.update({ description: x.target.value })} />}
        </Field>
        <Choice
          label="Does it cover anything sensitive or upsetting?"
          grid
          value={v.sensitive ? "yes" : "no"}
          onChange={(x) => d.update({ sensitive: x === "yes" })}
          options={[
            { value: "no", title: "No", text: "Nothing participants need a warning about" },
            { value: "yes", title: "Yes", text: "Health, money, violence, religion, politics or similar" },
          ]}
        />
        {v.sensitive && (
          <Field label="What should they know first?" hint="Shown before they start. They can stop at any time." error={e.warning}>
            {(id, db) => <textarea id={id} style={{ minHeight: 80 }} maxLength={1000} value={v.warning} aria-describedby={db} onChange={(x) => d.update({ warning: x.target.value })} />}
          </Field>
        )}
      </section>

      <section className="jp-sec" aria-labelledby="b-consent">
        <h2 id="b-consent">Consent</h2>
        <Choice
          value={v.consent.mode}
          onChange={(mode) => d.update({ consent: { ...v.consent, mode } })}
          options={[
            { value: "joinstudy", title: "On a joinStudy page, before they start", text: "Paste your consent information. They must agree before they can begin, and we keep a record of when they did." },
            { value: "own", title: "I collect it myself", text: "At the start of your survey or session." },
          ]}
        />
        {v.consent.mode === "joinstudy" && (
          <Field label="Consent information" hint="Paste the text from your approved consent form." error={e["consent.text"] || e.consent}>
            {(id, db) => <textarea id={id} style={{ minHeight: 140 }} value={v.consent.text} aria-describedby={db} onChange={(x) => d.update({ consent: { ...v.consent, text: x.target.value } })} />}
          </Field>
        )}
        <div className="jp-row2">
          <Field label={<>Ethics approval <span className="jp-hint">(optional)</span></>} error={e["ethics.body"]}>
            {(id) => <input id={id} type="text" maxLength={200} placeholder="e.g. University of Florida IRB" value={v.ethics.body} onChange={(x) => d.update({ ethics: { ...v.ethics, body: x.target.value } })} />}
          </Field>
          <Field label="Reference number" error={e["ethics.reference"]}>
            {(id) => <input id={id} type="text" maxLength={120} value={v.ethics.reference} onChange={(x) => d.update({ ethics: { ...v.ethics, reference: x.target.value } })} />}
          </Field>
        </div>
        {v.ethics.body && <span className="jp-hint">Shown to participants as “Ethics approval: {v.ethics.body}{v.ethics.reference ? `, ${v.ethics.reference}` : ""}”.</span>}
      </section>

      <StepActions onNext={next} busy={d.status === "saving"} />
    </PlanShell>
  );
}
