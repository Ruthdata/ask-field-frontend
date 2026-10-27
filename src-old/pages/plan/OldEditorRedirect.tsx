import { Navigate, useParams, useSearchParams } from "react-router-dom";

/** The old five-step editor is gone. Drafts open in the planner; "create a study" in a project goes to New study. */
export default function OldEditorRedirect() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const surveyId = params.get("surveyId");
  if (surveyId) return <Navigate to={`/dashboard/researcher/studies/${surveyId}/plan/basics`} replace />;
  return <Navigate to={`/dashboard/researcher/new?projectId=${encodeURIComponent(id)}`} replace />;
}
