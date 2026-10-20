import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { readProblem } from "@/lib/session";
import { useGetProfileQuery, useSaveProfilePartMutation, type ParticipantProfile, type ProfilePart } from "@/redux/api/participantApi";

/**
 * Participant canvas 2.1–2.3: "About you" in three short parts, replacing the five-step popup.
 * `?part=` picks the part; `?from=profile` returns to the profile page after saving one part.
 */
const ORDER: ProfilePart[] = ["where", "languages", "work"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AboutYou() {
  const [params] = useSearchParams();
  const fromProfile = params.get("from") === "profile";
  const { data, isLoading, isError, refetch } = useGetProfileQuery(undefined, { refetchOnMountOrArgChange: true });
  const p = data?.data;
  const asked = params.get("part") as ProfilePart | null;
  const part: ProfilePart = asked && ORDER.includes(asked) ? asked : (p && ORDER.find((k) => !p.parts[k])) || "where";
  const right = <Link to={fromProfile ? "/dashboard/participant/profile" : "/dashboard/participant"}>{fromProfile ? "Back to profile" : "Save and finish later"}</Link>;

  if (isLoading) {
    return (
      <CardPage right={right}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="status"><span className="spin" aria-hidden="true" /><span>Loading…</span></div>
      </CardPage>
    );
  }
  if (isError || !p) {
    return (
      <CardPage right={right}>
        <div className="alert warn" role="alert"><span>We couldn't load your profile. <button type="button" className="linkbtn" onClick={() => refetch()}>Try again</button></span></div>
      </CardPage>
    );
  }
  return (
    <CardPage right={right}>
      <Progress part={part} />
      {part === "where" && <Where p={p} fromProfile={fromProfile} key="where" />}
      {part === "languages" && <Languages p={p} fromProfile={fromProfile} key="languages" />}
      {part === "work" && <Work p={p} fromProfile={fromProfile} key="work" />}
    </CardPage>
  );
}

function Progress({ part }: { part: ProfilePart }) {
  const i = ORDER.indexOf(part);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div className="bars" aria-hidden="true">{ORDER.map((k, j) => <span key={k} className={j <= i ? "on" : ""} />)}</div>
      <span className="label">About you · {i + 1} of 3{i === 0 ? " · about a minute" : ""}</span>
    </div>
  );
}

/** Saves the part, then goes to the next one (or the done screen, or back to the profile). */
function useSave(part: ProfilePart, fromProfile: boolean) {
  const [save, { isLoading }] = useSaveProfilePartMutation();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<{ message: string; field?: string; code?: string } | null>(null);
  const run = async (body: Record<string, unknown>) => {
    setProblem(null);
    try {
      const r = (await save({ part, body }).unwrap()).data;
      if (fromProfile) return navigate("/dashboard/participant/profile?saved=1");
      const next = ORDER.find((k) => !r.parts[k] && ORDER.indexOf(k) > ORDER.indexOf(part)) || ORDER.find((k) => !r.parts[k]);
      navigate(next ? `/participate/about?part=${next}` : "/participate/about/done");
    } catch (err) {
      const p = readProblem(err);
      setProblem({ message: p.message, field: p.data?.field as string | undefined, code: p.code });
    }
  };
  return { run, isLoading, problem };
}

function Pills({ label, hint, options, value, onChange, multi, error }: { label: string; hint?: string; options: { value: string; label: string }[]; value: string | string[]; onChange: (v: string) => void; multi?: boolean; error?: string }) {
  const on = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <fieldset style={{ margin: 0, padding: 0, border: 0, display: "grid", gap: 8 }}>
      <legend style={{ fontWeight: 600, fontSize: 15, padding: 0, marginBottom: 8 }}>{label}</legend>
      <div className="jp-pills" role={multi ? "group" : "radiogroup"} aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" role={multi ? undefined : "radio"} aria-pressed={multi ? on(o.value) : undefined} aria-checked={multi ? undefined : on(o.value)} data-on={on(o.value)} onClick={() => onChange(o.value)}>
            {multi && on(o.value) ? "✓ " : ""}
            {o.label}
          </button>
        ))}
      </div>
      {error ? <span className="err" style={{ fontSize: 14, color: "#c2410c" }}>{error}</span> : hint ? <span className="hint" style={{ fontSize: 14, color: "var(--mute)" }}>{hint}</span> : null}
    </fieldset>
  );
}

const errFor = (problem: { message: string; field?: string } | null, field: string) => (problem?.field === field ? problem.message : undefined);
const Problem = ({ problem, fields }: { problem: { message: string; field?: string } | null; fields: string[] }) =>
  problem && !fields.includes(problem.field || "") ? <div className="alert warn" role="alert"><span>{problem.message}</span></div> : null;

function Where({ p, fromProfile }: { p: ParticipantProfile; fromProfile: boolean }) {
  const a = p.answers;
  const [region, setRegion] = useState(a.region);
  const [month, setMonth] = useState(a.birthMonth ? String(a.birthMonth) : "");
  const [year, setYear] = useState(a.birthYear ? String(a.birthYear) : "");
  const [gender, setGender] = useState<string>(a.gender);
  const { run, isLoading, problem } = useSave("where", fromProfile);
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => String(thisYear - 18 - i));
  const locked = p.locked;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run({ region, birthMonth: Number(month), birthYear: Number(year), gender });
  };
  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 22 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>Where you live, and a little about you</h1>
        <p className="lede" style={{ fontSize: 15.5 }}>We use this only to match you to studies. Researchers never see your profile.</p>
      </div>
      <div className="field">
        <span style={{ fontWeight: 600, fontSize: 15 }}>Country</span>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50, padding: "0 14px", borderRadius: 14, background: "var(--mist)", fontSize: 16 }}>
          {p.country}<span style={{ fontSize: 13.5, color: "var(--mute)" }}>From sign-up</span>
        </span>
      </div>
      <div className="field">
        <label htmlFor="ab-region">{p.options.regionLabel}</label>
        <select id="ab-region" value={region} onChange={(e) => setRegion(e.target.value)} aria-invalid={!!errFor(problem, "region")} aria-describedby="ab-region-h">
          <option value="">Choose…</option>
          {p.options.regions.map((r) => <option key={r}>{r}</option>)}
        </select>
        <span className={errFor(problem, "region") ? "err" : "hint"} id="ab-region-h">{errFor(problem, "region") ?? "Some studies look for people in particular places."}</span>
      </div>
      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "grid", gap: 8 }} disabled={locked}>
        <legend style={{ fontWeight: 600, fontSize: 15, padding: 0, marginBottom: 8 }}>When were you born?</legend>
        <div style={{ display: "flex", gap: 10 }} className="field">
          <select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ flex: 1.3 }} aria-invalid={!!errFor(problem, "birthMonth")}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
          </select>
          <select aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)} style={{ flex: 1 }} aria-invalid={!!errFor(problem, "birthYear")}>
            <option value="">Year</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 14, color: errFor(problem, "birthMonth") || errFor(problem, "birthYear") ? "#c2410c" : "var(--mute)" }}>
          {errFor(problem, "birthMonth") ?? errFor(problem, "birthYear") ?? "Month and year are enough: studies only ask for an age range. You need to be 18 or older."}
        </span>
      </fieldset>
      {locked ? (
        <div style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Gender</span>
          <span>{p.options.genders.find((g) => g.value === gender)?.label}</span>
          <span className="fine">Your birth date and gender are locked now that you're verified. <a href="mailto:hello@joinstudy.io">Ask us</a> if one is wrong.</span>
        </div>
      ) : (
        <Pills label="Gender" options={p.options.genders} value={gender} onChange={setGender} hint="Some studies are looking for women or men in particular." error={errFor(problem, "gender")} />
      )}
      <Problem problem={problem} fields={["region", "birthMonth", "birthYear", "gender"]} />
      <button type="submit" className="btn btn-sun btn-block" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Saving…" : fromProfile ? "Save" : "Next"}</button>
    </form>
  );
}

function Languages({ p, fromProfile }: { p: ParticipantProfile; fromProfile: boolean }) {
  const a = p.answers;
  const list = p.options.languages;
  const [first, setFirst] = useState(a.firstLanguage && !list.includes(a.firstLanguage) ? "Other" : a.firstLanguage);
  const [otherFirst, setOtherFirst] = useState(a.firstLanguage && !list.includes(a.firstLanguage) ? a.firstLanguage : "");
  const [langs, setLangs] = useState<string[]>(a.languages.length ? a.languages : ["English"]);
  const { run, isLoading, problem } = useSave("languages", fromProfile);
  const navigate = useNavigate();
  const toggle = (l: string) => setLangs((xs) => (xs.includes(l) ? xs.filter((x) => x !== l) : [...xs, l]));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const firstLanguage = first === "Other" ? otherFirst.trim() : first;
    run({ firstLanguage, languages: langs.filter((l) => l !== firstLanguage) });
  };
  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 22 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>The languages you speak</h1>
        <p className="lede" style={{ fontSize: 15.5 }}>Many studies are run in a particular language, or are looking for speakers of one.</p>
      </div>
      <div className="field">
        <label htmlFor="ab-first">Your first language</label>
        <select id="ab-first" value={first} onChange={(e) => setFirst(e.target.value)} aria-invalid={!!errFor(problem, "firstLanguage")}>
          <option value="">Choose…</option>
          {list.map((l) => <option key={l}>{l}</option>)}
          <option>Other</option>
        </select>
        {first === "Other" && (
          <input aria-label="Your first language" placeholder="Type your first language" value={otherFirst} onChange={(e) => setOtherFirst(e.target.value)} maxLength={60} />
        )}
        {errFor(problem, "firstLanguage") && <span className="err">{errFor(problem, "firstLanguage")}</span>}
      </div>
      <Pills label="Other languages you speak well" options={list.filter((l) => l !== first).map((l) => ({ value: l, label: l }))} value={langs} onChange={toggle} multi hint="Choose any you could take a study in." error={errFor(problem, "languages")} />
      <Problem problem={problem} fields={["firstLanguage", "languages"]} />
      <div className="two">
        {!fromProfile && <button type="button" className="btn btn-line" onClick={() => navigate("/participate/about?part=where")}>Back</button>}
        <button type="submit" className="btn btn-sun" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Saving…" : fromProfile ? "Save" : "Next"}</button>
      </div>
    </form>
  );
}

function Work({ p, fromProfile }: { p: ParticipantProfile; fromProfile: boolean }) {
  const a = p.answers;
  const [education, setEducation] = useState(a.education);
  const [student, setStudent] = useState<string>(a.student);
  const [work, setWork] = useState(a.work);
  const [devices, setDevices] = useState<string[]>(a.devices.length ? a.devices : []);
  const { run, isLoading, problem } = useSave("work", fromProfile);
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run({ education, student, work, devices });
  };
  return (
    <form onSubmit={submit} noValidate style={{ display: "grid", gap: 22 }}>
      <h1>Education, work, and how you'll take part</h1>
      <div className="field">
        <label htmlFor="ab-edu">Highest education you've finished</label>
        <select id="ab-edu" value={education} onChange={(e) => setEducation(e.target.value)} aria-invalid={!!errFor(problem, "education")}>
          <option value="">Choose…</option>
          {p.options.education.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {errFor(problem, "education") && <span className="err">{errFor(problem, "education")}</span>}
      </div>
      <Pills label="Are you a student right now?" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} value={student} onChange={setStudent} error={errFor(problem, "student")} />
      <Pills label="Your work" options={p.options.work} value={work} onChange={setWork} error={errFor(problem, "work")} />
      <Pills label="Devices you can use for studies" options={p.options.devices} value={devices} multi onChange={(d) => setDevices((xs) => (xs.includes(d) ? xs.filter((x) => x !== d) : [...xs, d]))} hint="Some studies need a computer, or a camera for interviews." error={errFor(problem, "devices")} />
      <Problem problem={problem} fields={["education", "student", "work", "devices"]} />
      <div className="two">
        {!fromProfile && <button type="button" className="btn btn-line" onClick={() => navigate("/participate/about?part=languages")}>Back</button>}
        <button type="submit" className="btn btn-sun" disabled={isLoading} aria-busy={isLoading}>{isLoading ? "Saving…" : fromProfile ? "Save" : "Finish"}</button>
      </div>
    </form>
  );
}
