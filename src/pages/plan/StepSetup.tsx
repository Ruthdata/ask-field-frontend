import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PlanView } from "@/redux/api/planApi";
import { SUPPORT_EMAIL } from "@/lib/site";
import { PlanShell } from "./PlanPage copy";
import { planPath, SETUP_NAME, type Slug } from "./steps";
import { useStepDraft, statusText } from "./useStepDraft";
import { Chips, Choice, ErrorLine, Field, NumberInput, Toggle } from "./parts";
import { StepActions } from "./StepActions";

const LEDE: Record<string, string> = {
  survey: "Link your survey and tell us how it ends, so we know who finished.",
  interview: "How long, how many, and when you're free. Participants book themselves into your times.",
  "focus-group": "Group size and session times. We fill each session and remind everyone.",
  "product-test": "What they'll use, what you want them to do, and how you'll see the results.",
  "ai-evaluation": "What people should do, where they'll work, and the guidelines they follow.",
};
const DEVICES = [{ value: "phone", label: "Phone" }, { value: "computer", label: "Computer" }, { value: "tablet", label: "Tablet" }];
const localZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };

type Props = { view: PlanView; slug: Slug };

export default function StepSetup(props: Props) {
  const m = props.view.method;
  if (m === "interview") return <InterviewSetup {...props} />;
  if (m === "focus-group") return <FocusSetup {...props} />;
  if (m === "product-test") return <ProductSetup {...props} />;
  if (m === "ai-evaluation") return <AiSetup {...props} />;
  return <SurveySetup {...props} />;
}

/** Shared frame: title, lede, and save-then-continue. */
function useSetup<T extends Record<string, unknown>>(view: PlanView, initial: T) {
  const navigate = useNavigate();
  const d = useStepDraft(view.surveyId, "setup", initial);
  const next = async () => {
    const r = await d.flush(true);
    if (r.ok) navigate(planPath(view.surveyId, "pay"));
    else document.querySelector<HTMLElement>(".jp [aria-invalid='true'], .jp .jp-err")?.scrollIntoView({ block: "center" });
  };
  return { d, next };
}
const Frame = ({ view, slug, status, children, next, busy }: Props & { status: string; children: React.ReactNode; next: () => void; busy: boolean }) => (
  <PlanShell view={view} slug={slug} status={status} title={SETUP_NAME[view.method]} lede={LEDE[view.method]}>
    {children}
    <StepActions onNext={next} busy={busy} back={planPath(view.surveyId, "who")} />
  </PlanShell>
);

function ReturnLink({ link }: { link: string | null }) {
  const [copied, setCopied] = useState(false);
  const [tool, setTool] = useState("Qualtrics");
  const HOW: Record<string, string> = {
    Qualtrics: "In Survey flow, add an End of Survey element, choose “Override survey options”, then “Redirect to a URL” and paste the link.",
    "Google Forms": "Settings → Presentation → Confirmation message. Paste the link there; Google Forms can't redirect on its own, so people tap it.",
    SurveyMonkey: "Collect responses → Web link → Survey end page → “Redirect to your own webpage”, and paste the link.",
    Typeform: "Endings → “Redirect on completion”, and paste the link.",
    KoboToolbox: "Add a final note with the link, so people tap it when they finish.",
    Other: "Send people to the link when they finish, or show it as a button on your last page.",
  };
  if (!link) return null;
  return (
    <section className="jp-sec" aria-labelledby="su-back">
      <h2 id="su-back">Send them back when they finish</h2>
      <span className="jp-hint" style={{ marginTop: -8 }}>Put this link at the end of your survey. It's how we know someone finished, so you can approve and pay them.</span>
      <div className="jp-code">
        <span>{link}</span>
        <button type="button" className="jp-btn2 sm" onClick={() => { void navigator.clipboard?.writeText(link).then(() => setCopied(true)).catch(() => setCopied(false)); }}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <div role="group" aria-label="Your survey tool" className="jp-chips">
        {Object.keys(HOW).map((t) => <button key={t} type="button" className="jp-chip" style={{ height: 38, fontSize: 14 }} aria-pressed={t === tool} onClick={() => setTool(t)}>{t}</button>)}
      </div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{HOW[tool]}</p>
      {/* Participant Stage 4: people who aren't sent back can type this code on joinStudy. */}
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
        Also show the finish code <b style={{ fontFamily: "var(--mono, monospace)", letterSpacing: ".06em" }}>{link.split("/done/")[1] ?? ""}</b> on your last page. If the link doesn't send someone back, they type the code on joinStudy instead.
      </p>
    </section>
  );
}

function TestLink({ url }: { url: string }) {
  const ok = /^https?:\/\/\S+\.\S+/.test(url);
  return <a className="jp-btn2" style={{ height: 50 }} href={ok ? url : undefined} target="_blank" rel="noreferrer" aria-disabled={!ok} onClick={(e) => { if (!ok) e.preventDefault(); }}>Test the link</a>;
}

// ---------------------------------------------------------------- survey
function SurveySetup({ view, slug }: Props) {
  const s = (view.plan.setup || {}) as Record<string, unknown>;
  const { d, next } = useSetup(view, { url: (s.url as string) ?? "", passParticipantId: (s.passParticipantId as boolean | undefined) ?? true, minutes: s.minutes as number | undefined, devices: (s.devices as string[]) ?? ["phone", "computer"] });
  const v = d.value; const e = d.errors;
  return (
    <Frame view={view} slug={slug} status={statusText(d.status)} next={next} busy={d.status === "saving"}>
      <section className="jp-sec" aria-labelledby="su-link">
        <h2 id="su-link">Your survey</h2>
        <Field label="Survey link" hint="Qualtrics, Google Forms, SurveyMonkey, Typeform, KoboToolbox or any link that opens in a browser." error={e.url}>
          {(id, db) => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <input id={id} type="url" style={{ flex: "1 1 260px" }} placeholder="https://" value={v.url} aria-describedby={db} aria-invalid={!!e.url || undefined} onChange={(x) => d.update({ url: x.target.value.trim() })} />
              <TestLink url={v.url} />
            </div>
          )}
        </Field>
        <Toggle on={v.passParticipantId} onChange={(passParticipantId) => d.update({ passParticipantId })} title="Add each participant's joinStudy ID to the link"
          text={<>So you can match answers to people when you review. We add <code>?jsid=…</code> to your link.</>} />
        <Field label="Minutes it takes" hint="Time it yourself. Most people take a little longer than you." error={e.minutes}>
          {(id, db) => <NumberInput id={id} style={{ maxWidth: 140 }} min={1} max={600} step={1} value={v.minutes} describedBy={db} invalid={!!e.minutes} onChange={(minutes) => d.update({ minutes })} />}
        </Field>
        <Chips label="Devices it works on" options={DEVICES} selected={v.devices} onChange={(devices) => d.update({ devices })} error={e.devices} />
      </section>
      <ReturnLink link={view.returnLink} />
    </Frame>
  );
}

// ---------------------------------------------------------------- interviews
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
function InterviewSetup({ view, slug }: Props) {
  const s = (view.plan.setup || {}) as Record<string, unknown>;
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const { d, next } = useSetup(view, {
    count: s.count as number | undefined, minutes: (s.minutes as number | undefined) ?? 45, gapMinutes: (s.gapMinutes as number) ?? 15,
    videoMode: (s.videoMode as "one" | "each") ?? "one", videoUrl: (s.videoUrl as string) ?? "", timeZone: (s.timeZone as string) ?? localZone(),
    from: (s.from as string) ?? iso(new Date(today.getTime() + 7 * 864e5)), to: (s.to as string) ?? iso(new Date(today.getTime() + 21 * 864e5)),
    weekly: (s.weekly as string[]) ?? [], standbyBackup: (s.standbyBackup as boolean) ?? false,
  });
  const v = d.value; const e = d.errors;
  const weeks = Math.max(1, Math.round((new Date(v.to).getTime() - new Date(v.from).getTime()) / (7 * 864e5)));
  const flip = (k: string) => d.update({ weekly: v.weekly.includes(k) ? v.weekly.filter((x) => x !== k) : [...v.weekly, k] });
  return (
    <Frame view={view} slug={slug} status={statusText(d.status)} next={next} busy={d.status === "saving"}>
      <section className="jp-sec" aria-labelledby="in-a">
        <h2 id="in-a">The interviews</h2>
        <div className="jp-row2">
          <Field label="How many" error={e.count}>{(id, db) => <NumberInput id={id} min={1} max={500} step={1} value={v.count} describedBy={db} invalid={!!e.count} onChange={(count) => d.update({ count })} />}</Field>
          <Field label="Minutes each" error={e.minutes}>{(id, db) => <NumberInput id={id} min={5} max={480} step={5} value={v.minutes} describedBy={db} invalid={!!e.minutes} onChange={(minutes) => d.update({ minutes })} />}</Field>
          <Field label="Gap between them">{(id) => (
            <select id={id} value={v.gapMinutes} onChange={(x) => d.update({ gapMinutes: Number(x.target.value) })}><option value={0}>None</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option></select>
          )}</Field>
        </div>
        <Choice value={v.videoMode} onChange={(videoMode) => d.update({ videoMode })} options={[
          { value: "one", title: "Video call, one link for all", text: "Your Zoom, Google Meet or Teams room. Sent only to people who book." },
          { value: "each", title: "Video call, a new link each time", text: "You add the link after each booking. We remind you if one is missing." },
        ]} />
        {v.videoMode === "one" && (
          <Field label="Meeting link" error={e.videoUrl}>{(id, db) => <input id={id} type="url" placeholder="https://" value={v.videoUrl} aria-describedby={db} aria-invalid={!!e.videoUrl || undefined} onChange={(x) => d.update({ videoUrl: x.target.value.trim() })} />}</Field>
        )}
      </section>
      <section className="jp-sec" aria-labelledby="in-t">
        <h2 id="in-t">When you're free</h2>
        <span className="jp-hint" style={{ marginTop: -8 }}>Times in your time zone, {v.timeZone}. Participants see them in their own.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Field label="From" error={e.from}>{(id) => <input id={id} type="date" style={{ width: 190 }} value={v.from} onChange={(x) => d.update({ from: x.target.value })} />}</Field>
          <Field label="To" error={e.to}>{(id) => <input id={id} type="date" style={{ width: 190 }} value={v.to} onChange={(x) => d.update({ to: x.target.value })} />}</Field>
        </div>
        <div className="jp-grid" role="group" aria-label="Weekly times you're free">
          <span />
          {DAYS.map((day) => <span key={day} className="h">{day}</span>)}
          {HOURS.map((h) => (
            <div key={h} style={{ display: "contents" }}>
              <span className="t">{h}</span>
              {DAYS.map((day) => {
                const k = `${day} ${h}`;
                const on = v.weekly.includes(k);
                return <button key={k} type="button" className="jp-slot" aria-pressed={on} aria-label={`${day} ${h}`} onClick={() => flip(k)}>{on ? "✓" : ""}</button>;
              })}
            </div>
          ))}
        </div>
        <ErrorLine error={e.weekly} />
        <span className="jp-hint">{v.weekly.length} {v.weekly.length === 1 ? "time" : "times"} a week × {weeks} {weeks === 1 ? "week" : "weeks"} = {v.weekly.length * weeks} times{v.count ? ` for ${v.count} interviews` : ""}. Aim for about double what you need.</span>
      </section>
      <section className="jp-sec" aria-labelledby="in-r">
        <h2 id="in-r">Reminders and no-shows</h2>
        <span style={{ fontSize: 15, lineHeight: 1.5 }}>We remind participants by email 24 hours and 1 hour before, and you on the morning of each interview.</span>
        <Toggle on={v.standbyBackup} onChange={(standbyBackup) => d.update({ standbyBackup })} title="Keep a backup person on standby each day" text="If someone doesn't join within 10 minutes, we offer the slot to the backup. You only pay for interviews that happen." />
      </section>
      <div className="jp-note">Participants choose one of these times in their own time zone. We email reminders to both of you 24 hours and 1 hour before.</div>
    </Frame>
  );
}

// ---------------------------------------------------------------- focus groups
function FocusSetup({ view, slug }: Props) {
  const s = (view.plan.setup || {}) as Record<string, unknown>;
  const { d, next } = useSetup(view, {
    perGroup: (s.perGroup as number | undefined) ?? 6, extras: (s.extras as number) ?? 1, minutes: (s.minutes as number | undefined) ?? 60,
    videoUrl: (s.videoUrl as string) ?? "", timeZone: (s.timeZone as string) ?? localZone(), sessions: (s.sessions as string[]) ?? [],
  });
  const v = d.value; const e = d.errors;
  const [draft, setDraft] = useState("");
  const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const add = () => { if (!draft) return; const iso = new Date(draft).toISOString(); if (!v.sessions.includes(iso)) d.update({ sessions: [...v.sessions, iso].sort() }); setDraft(""); };
  return (
    <Frame view={view} slug={slug} status={statusText(d.status)} next={next} busy={d.status === "saving"}>
      <section className="jp-sec" aria-labelledby="fg-a">
        <h2 id="fg-a">The groups</h2>
        <div className="jp-row2">
          <Field label="People per group" error={e.perGroup}>{(id, db) => <NumberInput id={id} min={2} max={20} step={1} value={v.perGroup} describedBy={db} invalid={!!e.perGroup} onChange={(perGroup) => d.update({ perGroup })} />}</Field>
          <Field label="Extra to cover no-shows">{(id) => (
            <select id={id} value={v.extras} onChange={(x) => d.update({ extras: Number(x.target.value) })}><option value={0}>None</option><option value={1}>1 per group</option><option value={2}>2 per group</option></select>
          )}</Field>
          <Field label="Minutes" error={e.minutes}>{(id, db) => <NumberInput id={id} min={15} max={240} step={15} value={v.minutes} describedBy={db} invalid={!!e.minutes} onChange={(minutes) => d.update({ minutes })} />}</Field>
        </div>
        <span className="jp-hint">Extras are paid if they join, even if everyone else comes.</span>
        <Field label="Meeting link" error={e.videoUrl}>{(id, db) => <input id={id} type="url" placeholder="https://" value={v.videoUrl} aria-describedby={db} aria-invalid={!!e.videoUrl || undefined} onChange={(x) => d.update({ videoUrl: x.target.value.trim() })} />}</Field>
      </section>
      <section className="jp-sec" aria-labelledby="fg-s">
        <h2 id="fg-s">Sessions</h2>
        <span className="jp-hint" style={{ marginTop: -8 }}>Your time zone, {v.timeZone}. Participants see their own.</span>
        {v.sessions.map((iso) => (
          <div key={iso} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "1.5px solid var(--line)" }}>
            <span style={{ flex: "1 1 200px", fontWeight: 600 }}>{fmt(iso)}</span>
            <button type="button" className="jp-btn2 sm" onClick={() => d.update({ sessions: v.sessions.filter((x) => x !== iso) })}>Remove</button>
          </div>
        ))}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <Field label="Add a session">{(id) => <input id={id} type="datetime-local" style={{ width: 240 }} value={draft} onChange={(x) => setDraft(x.target.value)} />}</Field>
          <button type="button" className="jp-btn2" style={{ height: 50 }} onClick={add} disabled={!draft}>+ Add</button>
        </div>
        <ErrorLine error={e.sessions} />
        <span className="jp-hint">{v.sessions.length} {v.sessions.length === 1 ? "session" : "sessions"} × {v.perGroup ?? 0} people = {(v.perGroup ?? 0) * v.sessions.length} places. If fewer than half confirm a day before, we'll offer them another session or cancel it and refund you.</span>
      </section>
      <div className="jp-note">Participants book a place in a session, up to the group size plus extras. We email reminders 24 hours and 1 hour before.</div>
    </Frame>
  );
}

// ---------------------------------------------------------------- product tests
function ProductSetup({ view, slug }: Props) {
  const s = (view.plan.setup || {}) as Record<string, unknown>;
  const { d, next } = useSetup(view, {
    kind: (s.kind as "web" | "app") ?? "web", url: (s.url as string) ?? "", tasks: (s.tasks as string[]) ?? [""], feedback: (s.feedback as "survey" | "recording") ?? "survey",
    feedbackUrl: (s.feedbackUrl as string) ?? "", minutes: s.minutes as number | undefined, devices: (s.devices as string[]) ?? ["phone"],
  });
  const v = d.value; const e = d.errors;
  return (
    <Frame view={view} slug={slug} status={statusText(d.status)} next={next} busy={d.status === "saving"}>
      <section className="jp-sec" aria-labelledby="pt-a">
        <h2 id="pt-a">What they'll test</h2>
        <Choice grid value={v.kind} onChange={(kind) => d.update({ kind })} options={[
          { value: "web", title: "A website or prototype", text: "Figma, Framer, a staging site…" },
          { value: "app", title: "A phone app", text: "Play Store, App Store or TestFlight link" },
        ]} />
        <Field label={v.kind === "app" ? "App link" : "Prototype or site link"} error={e.url}>
          {(id, db) => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <input id={id} type="url" style={{ flex: "1 1 260px" }} placeholder="https://" value={v.url} aria-describedby={db} aria-invalid={!!e.url || undefined} onChange={(x) => d.update({ url: x.target.value.trim() })} />
              <TestLink url={v.url} />
            </div>
          )}
        </Field>
        <div className="jp-row2">
          <Field label="Minutes it takes" error={e.minutes}>{(id, db) => <NumberInput id={id} min={1} max={600} step={1} value={v.minutes} describedBy={db} invalid={!!e.minutes} onChange={(minutes) => d.update({ minutes })} />}</Field>
        </div>
        <Chips label="Devices" options={DEVICES} selected={v.devices} onChange={(devices) => d.update({ devices })} error={e.devices} />
        <span className="jp-hint">Physical products shipped to people's homes aren't available yet. Email {SUPPORT_EMAIL} if you need one.</span>
      </section>
      <section className="jp-sec" aria-labelledby="pt-t">
        <h2 id="pt-t">Tasks</h2>
        <span className="jp-hint" style={{ marginTop: -8 }}>Short steps people follow in order. Say what to do, not where to click.</span>
        {v.tasks.map((t, i) => (
          <div key={i} className="jp-ans">
            <span className="jp-mono" style={{ flex: "none", width: 22 }}>{i + 1}</span>
            <input type="text" aria-label={`Task ${i + 1}`} maxLength={300} value={t} placeholder="e.g. Sign up with your phone number" onChange={(x) => d.update({ tasks: v.tasks.map((y, j) => (j === i ? x.target.value : y)) })} />
            {v.tasks.length > 1 && <button type="button" className="jp-btn2 sm" aria-label={`Remove task ${i + 1}`} onClick={() => d.update({ tasks: v.tasks.filter((_, j) => j !== i) })}>×</button>}
          </div>
        ))}
        <ErrorLine error={e.tasks || Object.entries(e).find(([k]) => k.startsWith("tasks."))?.[1]} />
        {v.tasks.length < 20 && <button type="button" className="jp-btn2" style={{ alignSelf: "flex-start" }} onClick={() => d.update({ tasks: [...v.tasks, ""] })}>+ Add a task</button>}
      </section>
      <section className="jp-sec" aria-labelledby="pt-h">
        <h2 id="pt-h">How you'll hear from them</h2>
        <Choice value={v.feedback} onChange={(feedback) => d.update({ feedback })} options={[
          { value: "survey", title: "Questions after the tasks", text: "Your survey link. Put the finish link below at its end." },
          { value: "recording", title: "A recording of their screen", text: "Through your testing tool (Maze, Lookback, UserTesting or similar)." },
        ]} />
        <Field label="Link" error={e.feedbackUrl}>{(id, db) => <input id={id} type="url" placeholder="https://" value={v.feedbackUrl} aria-describedby={db} onChange={(x) => d.update({ feedbackUrl: x.target.value.trim() })} />}</Field>
      </section>
      <ReturnLink link={view.returnLink} />
    </Frame>
  );
}

// ---------------------------------------------------------------- AI evaluation
function AiSetup({ view, slug }: Props) {
  const s = (view.plan.setup || {}) as Record<string, unknown>;
  const { d, next } = useSetup(view, { kind: (s.kind as string) ?? "rate", where: "own", toolUrl: (s.toolUrl as string) ?? "", guidelines: (s.guidelines as string) ?? "", minutes: (s.minutes as number | undefined) ?? 60 });
  const v = d.value; const e = d.errors;
  const langs = view.plan.audience?.languages ?? [];
  return (
    <Frame view={view} slug={slug} status={statusText(d.status)} next={next} busy={d.status === "saving"}>
      <section className="jp-sec" aria-labelledby="ai-a">
        <h2 id="ai-a">The task</h2>
        <div className="jp-fld" role="group" aria-labelledby="ai-k">
          <span id="ai-k" className="jp-lbl">What should people do?</span>
          <div className="jp-chips">
            {[["rate", "Rate answers"], ["compare", "Compare two answers"], ["correct", "Correct or rewrite"], ["write", "Write new examples"]].map(([k, l]) => (
              <button key={k} type="button" className="jp-chip" aria-pressed={v.kind === k} onClick={() => d.update({ kind: k })}>{l}</button>
            ))}
          </div>
        </div>
        <span className="jp-hint">{langs.length ? `Language: ${langs.join(", ")} (from Who you need).` : "Choose the language in Who you need, so only fluent speakers take part."}</span>
        <Field label="Minutes of work per person" error={e.minutes}>{(id, db) => <NumberInput id={id} style={{ maxWidth: 140 }} min={1} max={600} step={5} value={v.minutes} describedBy={db} invalid={!!e.minutes} onChange={(minutes) => d.update({ minutes })} />}</Field>
      </section>
      <section className="jp-sec" aria-labelledby="ai-w">
        <h2 id="ai-w">Where they'll work</h2>
        <Choice value="own" onChange={() => undefined} options={[
          { value: "own", title: "In your own tool", text: "Label Studio, Argilla or your own app. Works like a survey link." },
          { value: "upload", title: "Upload items, we host the task", text: `Coming soon. Email ${SUPPORT_EMAIL} to be one of the first.`, disabled: true },
        ]} />
        <Field label="Tool link" error={e.toolUrl}>{(id, db) => <input id={id} type="url" placeholder="https://" value={v.toolUrl} aria-describedby={db} aria-invalid={!!e.toolUrl || undefined} onChange={(x) => d.update({ toolUrl: x.target.value.trim() })} />}</Field>
      </section>
      <section className="jp-sec" aria-labelledby="ai-g">
        <h2 id="ai-g">Guidelines</h2>
        <textarea aria-labelledby="ai-g" style={{ minHeight: 140 }} value={v.guidelines} placeholder="e.g. Rate each answer from 1 to 5 for: is it correct, and does it sound like natural Yoruba?" onChange={(x) => d.update({ guidelines: x.target.value })} />
        <span className="jp-hint">People read these first and can open them while they work. Add 2 or 3 worked examples if you can.</span>
      </section>
      <ReturnLink link={view.returnLink} />
    </Frame>
  );
}
