import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetHomeQuery, useStartStudyMutation, type StudyMethod } from "@/redux/api/homeApi";
import { methodById, studyLink } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { SUPPORT_EMAIL } from "@/lib/site";
import MethodPicker from "@/components/researcher/MethodPicker";

/** "New study" from the sidebar: pick a method and a name, then straight into the draft. No project needed. */
export default function NewStudy() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data } = useGetHomeQuery();
  const fromSetup = data?.data.account.firstMethod;
  const [method, setMethod] = useState<StudyMethod | null>(methodById(params.get("method") ?? "")?.id ?? null);
  const [name, setName] = useState("");
  const [start, { isLoading, error }] = useStartStudyMutation();
  const chosen: StudyMethod = method ?? methodById(fromSetup)?.id ?? "survey";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectId = params.get("projectId") || undefined;
    const res = await start({ method: chosen, surveyName: name.trim() || undefined, projectId }).unwrap().catch(() => null);
    if (res) navigate(studyLink({ ...res.data, status: "draft" }));
  };

  return (
    <form className="ja-page" style={{ maxWidth: 880 }} onSubmit={submit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 id="ns-h" className="ja-h1">What do you want to run?</h1>
        <p className="ja-lede">It's saved as a draft as you go. Nothing is charged until you launch.</p>
      </div>
      <MethodPicker value={chosen} onChange={setMethod} fromSetup={methodById(fromSetup)?.id} labelledBy="ns-h" light />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 520 }}>
        <label htmlFor="ns-name" style={{ fontWeight: 600, fontSize: 15 }}>Study name <span className="ja-small">(optional, you can change it later)</span></label>
        <input id="ns-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} placeholder="e.g. Lagos commuters survey"
          style={{ height: 50, boxSizing: "border-box", padding: "0 14px", border: "1.5px solid var(--line)", borderRadius: 14, font: "inherit", fontSize: 16, background: "#fff" }} />
      </div>
      {error && <div className="ja-error" role="alert">{readProblem(error).message}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
        <button type="submit" className="ja-btn" disabled={isLoading}>{isLoading ? "Starting…" : `Plan your ${methodById(chosen)!.word} →`}</button>
        <span className="ja-muted">Not sure which fits? Email <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--ink)" }}>{SUPPORT_EMAIL}</a>.</span>
      </div>
    </form>
  );
}
