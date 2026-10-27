import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CardPage } from "@components/auth/AuthShell";
import TextField from "@components/auth/TextField";
import SetupHeader from "./SetupHeader";
import { useGetResearcherQuery } from "@/redux/api/slices/userSlice";
import { FIRST_METHODS, HEARD_FROM, ORG_TYPES, RESEARCH_AREAS, ROLES, useSaveProfileMutation } from "@/redux/api/setupApi";
import { COUNTRIES } from "@/lib/countries";
import { readProblem } from "@/lib/session";

/** Best guess at the country from the browser's language setting (e.g. en-NG → Nigeria). */
function guessCountry() {
  const region = (navigator.language || "").split("-")[1]?.toUpperCase();
  return COUNTRIES.find((c) => c.code === region)?.name ?? "";
}

/** Canvas 2.1: one page instead of the five-part popup. Organisation type and country are required. */
export default function SetupAbout() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetResearcherQuery();
  const me = data?.data;
  const [saveProfile, { isLoading: saving }] = useSaveProfileMutation();
  const [ready, setReady] = useState(false);
  const [orgType, setOrgType] = useState("");
  const [orgName, setOrgName] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [method, setMethod] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [heard, setHeard] = useState("");
  const [errors, setErrors] = useState<{ orgType?: string; orgName?: string; country?: string }>({});
  const [problem, setProblem] = useState("");

  // Fill in what we already know, once (state set during render, not in an effect).
  if (me && !ready) {
    setOrgType(ORG_TYPES.some((o) => o.id === me.organizationType) ? me.organizationType : "");
    setOrgName(me.organizationName ?? "");
    setCountry(me.country || guessCountry());
    setRole(me.role ?? "");
    setMethod(me.firstMethod || me.signupIntent?.method || "");
    setAreas(me.researchAreas ?? []);
    setHeard(me.heardFrom ?? "");
    setReady(true);
  }

  const orgLabel = useMemo(
    () => (orgType === "university" ? "University or college name" : orgType === "company" ? "Company name" : "Organisation name"),
    [orgType],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    const er: typeof errors = {};
    if (!orgType) er.orgType = "Choose where you work.";
    if (orgType && orgType !== "independent" && !orgName.trim()) er.orgName = `Enter the ${orgLabel.toLowerCase()}.`;
    if (!country) er.country = "Choose the country you're based in.";
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(er.orgType ? "org-types" : er.orgName ? "ab-org" : "ab-country")?.focus();
      return;
    }
    try {
      const res = await saveProfile({
        organizationType: orgType,
        organizationName: orgType === "independent" ? "" : orgName.trim(),
        country,
        role: role || undefined,
        researchAreas: areas,
        firstMethod: method || undefined,
        heardFrom: heard || undefined,
      }).unwrap();
      if (res.data.next === "verify") navigate("/setup/verify");
      else {
        toast.success("You're all set.");
        navigate("/dashboard/researcher");
      }
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };

  const header = <SetupHeader name={me ? `${me.firstName} ${me.lastName}`.trim() : undefined} email={me?.email} />;

  if (isLoading || (!ready && !isError)) {
    return (
      <CardPage wide right={header}>
        <div role="status" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="spin" aria-hidden="true" />
          Loading your account…
        </div>
      </CardPage>
    );
  }
  if (isError) {
    return (
      <CardPage wide right={header}>
        <h1>We couldn't load your account</h1>
        <button type="button" className="btn btn-ink" onClick={() => refetch()}>Try again</button>
      </CardPage>
    );
  }

  return (
    <CardPage wide right={header}>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 28 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div className="bars" aria-hidden="true"><span className="on" /><span className="on" /><span /></div>
          <span className="label">Step 2 of 3 · about a minute</span>
          <h1>Tell us about your work</h1>
          <p className="lede" style={{ fontSize: 16.5 }}>This sets your pricing and helps us find the right participants. You can change it later.</p>
        </div>

        {problem && <div className="alert warn" role="alert"><span>{problem}</span></div>}

        <fieldset>
          <legend id="org-legend">Where do you work?</legend>
          <div className="opts" role="radiogroup" aria-labelledby="org-legend" id="org-types" tabIndex={-1} aria-describedby={errors.orgType ? "org-err" : undefined}>
            {ORG_TYPES.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={orgType === o.id} className="opt-card" onClick={() => setOrgType(o.id)}>
                <b>{o.label}</b>
                <span>{o.note}</span>
              </button>
            ))}
          </div>
          {errors.orgType && <span className="err" id="org-err" style={{ color: "#c2410c", fontSize: 14 }}>{errors.orgType}</span>}
        </fieldset>

        {orgType && orgType !== "independent" && (
          <TextField
            id="ab-org"
            label={orgLabel}
            value={orgName}
            onChange={setOrgName}
            autoComplete="organization"
            placeholder={orgType === "university" ? "e.g. University of Lagos" : "Organisation name"}
            error={errors.orgName}
          />
        )}

        <div className="two-col">
          <div className="field">
            <label htmlFor="ab-role">Your role <span className="opt">(optional)</span></label>
            <select id="ab-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Choose one</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ab-country">Country you're based in</label>
            <select id="ab-country" value={country} onChange={(e) => setCountry(e.target.value)} aria-invalid={!!errors.country} aria-describedby={errors.country ? "country-err" : undefined}>
              <option value="">Choose a country</option>
              {COUNTRIES.map((c) => <option key={c.code}>{c.name}</option>)}
            </select>
            {errors.country && <span className="err" id="country-err">{errors.country}</span>}
          </div>
        </div>

        <fieldset>
          <legend id="method-legend">What do you want to run first? <span className="opt">(optional)</span></legend>
          {me?.signupIntent?.method && <span className="hint" style={{ fontSize: 13.5, color: "var(--mute)" }}>Picked from the homepage card you clicked. Change it if you like.</span>}
          <div className="chips" role="radiogroup" aria-labelledby="method-legend">
            {FIRST_METHODS.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={method === m.id} onClick={() => setMethod(method === m.id ? "" : m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Your research areas <span className="opt">(optional, pick any)</span></legend>
          <div className="chips">
            {RESEARCH_AREAS.map((a) => {
              const on = areas.includes(a);
              return (
                <button key={a} type="button" aria-pressed={on} onClick={() => setAreas(on ? areas.filter((x) => x !== a) : [...areas, a])}>
                  {a}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="field" style={{ maxWidth: 360 }}>
          <label htmlFor="ab-heard">How did you hear about us? <span className="opt">(optional)</span></label>
          <select id="ab-heard" value={heard} onChange={(e) => setHeard(e.target.value)}>
            <option value="">Choose one</option>
            {HEARD_FROM.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-sun" disabled={saving} aria-busy={saving}>
            {saving ? "Saving…" : "Save and continue"}
          </button>
          <Link to="/dashboard/researcher" style={{ fontSize: 15, color: "var(--ink-2)" }}>Skip for now</Link>
          <span className="later">You'll need to finish this before you launch a study.</span>
        </div>
      </form>
    </CardPage>
  );
}
