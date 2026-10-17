import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useFinishByCodeMutation } from "@/redux/api/planApi";
import { getUserType, isAuthenticated } from "@/utils/auth";
import { readProblem } from "@/lib/session";

/**
 * The finish link researchers put at the end of their survey: joinstudy.io/done/CODE.
 * Marks the participant's attempt as finished so the researcher can approve and pay it.
 */
export default function FinishLink() {
  const { code = "" } = useParams();
  const signedIn = isAuthenticated() && getUserType() === "participant";
  const [finish] = useFinishByCodeMutation();
  const [state, setState] = useState<{ kind: "working" | "done" | "error"; message: string }>({ kind: "working", message: "" });
  const sent = useRef(false);

  useEffect(() => {
    if (!signedIn || sent.current) return;
    sent.current = true;
    finish(code)
      .unwrap()
      .then((r) => setState({ kind: "done", message: r.message ?? "Your response is with the researcher for review." }))
      .catch((e) => setState({ kind: "error", message: readProblem(e).message }));
  }, [code, finish, signedIn]);

  if (!signedIn) {
    const next = encodeURIComponent(`/done/${code}`);
    return <Navigate to={`/sign-in?next=${next}&intent=participant`} replace />;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl bg-white border border-gray-100 shadow-sm rounded-[2rem] p-10 text-center" role="status" aria-live="polite">
        {state.kind === "working" && <p className="text-lg text-gray-600">Recording that you finished…</p>}
        {state.kind === "done" && (
          <>
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl mx-auto mb-6" aria-hidden="true">✓</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank you</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{state.message}</p>
          </>
        )}
        {state.kind === "error" && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">We couldn't record that</h1>
            <p className="text-gray-600 leading-relaxed">{state.message}</p>
          </>
        )}
        {state.kind !== "working" && (
          <Link to="/dashboard/participant/surveys" className="mt-8 inline-flex rounded-full bg-[#3E3E3E] px-6 py-3 text-sm font-semibold text-white">Back to studies</Link>
        )}
      </div>
    </main>
  );
}
