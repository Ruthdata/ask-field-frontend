import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetMatchCountQuery, useGetParticipantOptionsQuery, type PlanView, type Question } from "@/redux/api/planApi";
import { ROUTES } from "@/lib/site";
import { PlanShell } from "./PlanPage";
import { planPath, type Slug } from "./steps";
import { useStepDraft, statusText } from "./useStepDraft";
import { Chips, ErrorLine, Field, NumberInput, Toggle } from "./parts";
import { StepActions } from "./StepActions";

/** Participant Stage 2: participants answer Female or Male. Older plans may still say woman/man. */
const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];
const toSex = (g: string) => (g === "woman" ? "female" : g === "man" ? "male" : g);
type Quota = { by: "gender" | "language"; groups: { value: string; places: number }[] } | null;

export default function StepWho({ view, slug }: { view: PlanView; slug: Slug }) {
  const navigate = useNavigate();
  const a = view.plan.audience || {};
  const d = useStepDraft(view.surveyId, "audience", {
    countries: a.countries ?? ["Nigeria"],
    regions: (a.regions ?? []) as string[],
    linkedinOnly: (a.linkedinOnly ?? false) as boolean,
    includeDiaspora: a.includeDiaspora ?? false,
    minAge: a.minAge as number | undefined,
    maxAge: a.maxAge as number | undefined,
    genders: ((a.genders ?? []) as string[]).map(toSex).filter((g) => g === "female" || g === "male") as string[],
    languages: a.languages ?? [],
    education: a.education ?? "any",
    employment: a.employment ?? "any",
    students: a.students ?? "include",
    questions: (a.questions ?? []) as Question[],
    quota: (a.quota ?? null) as Quota,
  });
  const v = d.value;
  const e = d.errors;
  const [pickGender, setPickGender] = useState(v.genders.length > 0);
  const [pickRegions, setPickRegions] = useState(v.regions.length > 0);
  const { data: optsData } = useGetParticipantOptionsQuery();
  const opts = optsData?.data;
  const countryOptions = (opts?.countries ?? ["Nigeria", "Ghana", "Kenya"]).map((c) => ({ value: c, label: c }));
  const LANGS = [...new Set(v.countries.flatMap((c) => opts?.languages[c] ?? []))];
  const [saves, setSaves] = useState(0);
  const [lastStatus, setLastStatus] = useState(d.status);
  if (lastStatus !== d.status) {
    setLastStatus(d.status);
    if (d.status === "saved") setSaves((n) => n + 1);
  }
  const { data: match, isFetching } = useGetMatchCountQuery({ id: view.surveyId, v: saves }, { refetchOnMountOrArgChange: true });
  const need = view.figures.places;
  const count = match?.data.count;

  const setQ = (i: number, q: Question | null) => d.update({ questions: q ? v.questions.map((x, j) => (j === i ? q : x)) : v.questions.filter((_, j) => j !== i) });
  const evenly = (values: string[]) => {
    const total = need || values.length * 10;
    return values.map((value, i) => ({ value, places: Math.floor(total / values.length) + (i < total % values.length ? 1 : 0) }));
  };
  const quotaValues = (by: "gender" | "language") => (by === "gender" ? ["female", "male"] : v.languages.length >= 2 ? v.languages : LANGS.slice(1, 3));
  const quotaLabel = (by: string, value: string) => (by === "gender" ? GENDERS.find((g) => g.value === value)?.label ?? value : value);
  const quotaTotal = v.quota ? v.quota.groups.reduce((t, g) => t + (g.places || 0), 0) : 0;

  const next = async () => {
    const r = await d.flush(true);
    if (r.ok) navigate(planPath(view.surveyId, "setup"));
    else document.querySelector<HTMLElement>(".jp [aria-invalid='true'], .jp .jp-err")?.scrollIntoView({ block: "center" });
  };

  return (
    <PlanShell view={view} slug={slug} status={statusText(d.status)} title="Who you need" lede="Only people who match can see your study. You aren't charged for anyone who doesn't qualify.">
      <div role="status" aria-live="polite" className="jp-note sun" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px 20px" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <b style={{ fontSize: 17 }}>{count === undefined || isFetching ? "Counting people who match…" : `${count.toLocaleString("en-US")} ${count === 1 ? "person matches" : "people match"} right now`}</b>
          <span className="jp-hint">Counted from verified participant profiles. Your own questions narrow it further.</span>
        </span>
        {need > 0 && count !== undefined && <span className="jp-mono">You need {need} · {count >= need * 5 ? "plenty" : count >= need * 2 ? "should fill" : count >= need ? "may be slow" : "not enough yet"}</span>}
      </div>

      <section className="jp-sec" aria-labelledby="w-where">
        <h2 id="w-where">Where they live</h2>
        <Chips
          label="Countries"
          options={countryOptions}
          selected={v.countries}
          onChange={(countries) => d.update({ countries, regions: v.regions.filter((r) => countries.some((c) => opts?.regions[c]?.list.includes(r))), languages: v.languages.filter((l) => countries.some((c) => opts?.languages[c]?.includes(l))) })}
          error={e.countries}
        />
        <div className="jp-fld" role="group" aria-labelledby="w-r">
          <span id="w-r" className="jp-lbl">Where in {v.countries.length === 1 ? v.countries[0] : "those countries"}</span>
          <div className="jp-chips">
            <button type="button" className="jp-chip" aria-pressed={!pickRegions} onClick={() => { setPickRegions(false); d.update({ regions: [] }); }}>Anywhere</button>
            <button type="button" className="jp-chip" aria-pressed={pickRegions} onClick={() => setPickRegions(true)}>Only certain places…</button>
          </div>
          {pickRegions &&
            v.countries.map((c) =>
              opts?.regions[c] ? (
                <Chips key={c} label={`${opts.regions[c].label === "State" ? "States" : opts.regions[c].label === "County" ? "Counties" : "Regions"} in ${c}`} options={opts.regions[c].list.map((r) => ({ value: r, label: r }))} selected={v.regions} onChange={(regions) => d.update({ regions })} />
              ) : null
            )}
          {e.regions && <ErrorLine error={e.regions} />}
        </div>
        <Link to={ROUTES.requestCountry} style={{ fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>Need another country? Tell us →</Link>
      </section>

      <section className="jp-sec" aria-labelledby="w-who">
        <h2 id="w-who">Who they are</h2>
        <div className="jp-row2">
          <Field label="Youngest" error={e.minAge}>
            {(id, db) => <NumberInput id={id} min={18} max={100} step={1} value={v.minAge} describedBy={db} invalid={!!e.minAge} onChange={(minAge) => d.update({ minAge })} />}
          </Field>
          <Field label="Oldest" error={e.maxAge}>
            {(id, db) => <NumberInput id={id} min={18} max={100} step={1} value={v.maxAge} describedBy={db} invalid={!!e.maxAge} onChange={(maxAge) => d.update({ maxAge })} />}
          </Field>
        </div>
        <div className="jp-fld" role="group" aria-labelledby="w-g">
          <span id="w-g" className="jp-lbl">Gender</span>
          <div className="jp-chips">
            <button type="button" className="jp-chip" aria-pressed={!pickGender} onClick={() => { setPickGender(false); d.update({ genders: [] }); }}>Anyone</button>
            <button type="button" className="jp-chip" aria-pressed={pickGender} onClick={() => setPickGender(true)}>Choose…</button>
          </div>
          {pickGender && (
            <Chips label="Include" options={GENDERS} selected={v.genders} onChange={(genders) => d.update({ genders })} error={e.genders} />
          )}
        </div>
        <Chips label="Languages they speak well (optional)" hint="Pick several to include anyone who speaks any of them." options={LANGS.map((l) => ({ value: l, label: l }))} selected={v.languages} onChange={(languages) => d.update({ languages })} error={e.languages} />
        <Toggle
          on={v.linkedinOnly}
          onChange={(linkedinOnly) => d.update({ linkedinOnly })}
          title="Only people who've connected LinkedIn"
          text="Useful for studies of professionals. It narrows your sample towards city-based, more educated people, so leave it off unless you need it."
        />
        <details style={{ borderTop: "1px solid var(--line-2)", paddingTop: 14 }} open={v.education !== "any" || v.employment !== "any" || v.students !== "include"}>
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15.5 }}>More filters: education, work, students</summary>
          <div className="jp-row2" style={{ marginTop: 14 }}>
            <Field label="Highest education">
              {(id) => (
                <select id={id} value={v.education} onChange={(x) => d.update({ education: x.target.value })}>
                  <option value="any">Any</option><option value="secondary">Secondary school or more</option><option value="degree">University degree or more</option><option value="postgraduate">Postgraduate degree</option>
                </select>
              )}
            </Field>
            <Field label="Work">
              {(id) => (
                <select id={id} value={v.employment} onChange={(x) => d.update({ employment: x.target.value })}>
                  <option value="any">Any</option><option value="employed">Employed</option><option value="self-employed">Self-employed</option><option value="not-working">Not working</option>
                </select>
              )}
            </Field>
            <Field label="Students">
              {(id) => (
                <select id={id} value={v.students} onChange={(x) => d.update({ students: x.target.value })}>
                  <option value="include">Include students</option><option value="only">Students only</option><option value="exclude">No students</option>
                </select>
              )}
            </Field>
          </div>
          <span className="jp-hint" style={{ display: "block", marginTop: 10 }}>A filter only lets in people whose profile answers it.</span>
        </details>
      </section>

      <section className="jp-sec" aria-labelledby="w-q">
        <h2 id="w-q">Your own questions <small>(optional, up to 3)</small></h2>
        <span className="jp-hint" style={{ marginTop: -8 }}>Asked before the study. Only the answers you tick get in. People who don't qualify aren't paid and don't count towards your places.</span>
        {v.questions.map((q, i) => (
          <div key={i} className="jp-q">
            <div className="jp-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span className="jp-lbl">Question {i + 1}</span>
              <button type="button" className="jp-btn2 sm" onClick={() => setQ(i, null)}>Remove</button>
            </div>
            <input type="text" aria-label={`Question ${i + 1}`} value={q.text} maxLength={300} placeholder="e.g. Do you teach in a school right now?" onChange={(x) => setQ(i, { ...q, text: x.target.value })} />
            <span className="jp-lbl" style={{ fontSize: 14.5 }}>Answers · tick the ones that qualify</span>
            {q.answers.map((ans, j) => (
              <div key={j} className="jp-ans">
                <button type="button" role="checkbox" aria-checked={ans.qualifies} aria-label={`Answer ${j + 1} qualifies`} className="jp-check" style={{ width: "auto", padding: 10 }}
                  onClick={() => setQ(i, { ...q, answers: q.answers.map((x, k) => (k === j ? { ...x, qualifies: !x.qualifies } : x)) })}>
                  <span className="jp-box" aria-hidden="true">{ans.qualifies ? "✓" : ""}</span>
                </button>
                <input type="text" aria-label={`Question ${i + 1}, answer ${j + 1}`} value={ans.text} maxLength={200} onChange={(x) => setQ(i, { ...q, answers: q.answers.map((y, k) => (k === j ? { ...y, text: x.target.value } : y)) })} />
                {q.answers.length > 2 && <button type="button" className="jp-btn2 sm" aria-label={`Remove answer ${j + 1}`} onClick={() => setQ(i, { ...q, answers: q.answers.filter((_, k) => k !== j) })}>×</button>}
              </div>
            ))}
            {q.answers.length < 8 && <button type="button" className="jp-btn2 sm" style={{ alignSelf: "flex-start" }} onClick={() => setQ(i, { ...q, answers: [...q.answers, { text: "", qualifies: false }] })}>+ Add an answer</button>}
          </div>
        ))}
        <ErrorLine error={e.questions || Object.entries(e).find(([k]) => k.startsWith("questions."))?.[1]} />
        {v.questions.length < 3 && (
          <button type="button" className="jp-btn2" style={{ alignSelf: "flex-start" }}
            onClick={() => d.update({ questions: [...v.questions, { text: "", answers: [{ text: "", qualifies: true }, { text: "", qualifies: false }] }] })}>
            + Add a question
          </button>
        )}
      </section>

      <section className="jp-sec" aria-labelledby="w-quota">
        <h2 id="w-quota">Quotas <small>(optional)</small></h2>
        <Toggle on={!!v.quota} onChange={(on) => d.update({ quota: on ? { by: "gender", groups: evenly(quotaValues("gender")) } : null })}
          title="Split the places between groups" text="For example half women, half men. Each group closes when it is full." />
        {v.quota && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Split by">
              {(id) => (
                <select id={id} style={{ maxWidth: 280 }} value={v.quota!.by} onChange={(x) => { const by = x.target.value as "gender" | "language"; d.update({ quota: { by, groups: evenly(quotaValues(by)) } }); }}>
                  <option value="gender">Gender</option><option value="language">Language</option>
                </select>
              )}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px", gap: 10, alignItems: "center", maxWidth: 440 }}>
              {v.quota.groups.map((g, i) => (
                <div key={g.value} style={{ display: "contents" }}>
                  <label htmlFor={`qg-${i}`}>{quotaLabel(v.quota!.by, g.value)}</label>
                  <NumberInput id={`qg-${i}`} min={1} step={1} value={g.places} onChange={(places) => d.update({ quota: { ...v.quota!, groups: v.quota!.groups.map((x, j) => (j === i ? { ...x, places: places ?? 0 } : x)) } })} />
                </div>
              ))}
            </div>
            <span className="jp-hint">
              {v.quota.by === "gender" ? "Groups come from the genders you chose above." : "Groups come from the languages you chose above."} Adds up to {quotaTotal}
              {need ? `; you need ${need}.` : "."}
            </span>
            <ErrorLine error={e.quota || Object.entries(e).find(([k]) => k.startsWith("quota."))?.[1]} />
          </div>
        )}
      </section>

      <StepActions onNext={next} busy={d.status === "saving"} back={planPath(view.surveyId, "basics")} />
    </PlanShell>
  );
}
