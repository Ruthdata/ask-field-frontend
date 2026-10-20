import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useFinishByCodeMutation } from "@/redux/api/planApi";
import { getUserType, isAuthenticated } from "@/utils/auth";
import { readProblem } from "@/lib/session";
import { ThankYou } from "@/pages/participate/studies/takePart";
import type { FinishOutcome } from "@/redux/api/participantApi";

/**
 * The finish link researchers put at the end of their survey: joinstudy.io/done/CODE.
 * Marks the participant's attempt as finished so the researcher can approve and pay it.
 */
export default function FinishLink() {
  const { code = "" } = useParams();
  const signedIn = isAuthenticated() && getUserType() === "participant";
  const [finish] = useFinishByCodeMutation();
  const [state, setState] = useState<{ kind: "working" | "done" | "error"; message: string; outcome?: FinishOutcome; amount?: number; currency?: string }>({ kind: "working", message: "" });
  const sent = useRef(false);

  useEffect(() => {
    if (!signedIn || sent.current) return;
    sent.current = true;
    finish(code)
      .unwrap()
      .then((r) => setState({ kind: "done", message: r.message ?? "", outcome: r.data?.outcome ?? "review", amount: r.data?.amount ?? 0, currency: r.data?.currency }))
      .catch((e) => setState({ kind: "error", message: readProblem(e).message }));
  }, [code, finish, signedIn]);

  if (!signedIn) {
    const next = encodeURIComponent(`/done/${code}`);
    return <Navigate to={`/sign-in?next=${next}&intent=participant`} replace />;
  }

  // Participant Stage 4 (canvas 4.3): what's counted, the amount, and when it's paid.
  // The site bar above already shows the logo; pt-28 keeps the content clear of it.
  return (
    <main className="flex min-h-screen justify-center bg-[#f6f5fa] px-4 pb-8 pt-28 text-[#120e22]">
      <div className="flex w-full max-w-md flex-col gap-6">
        {state.kind === "working" && <p role="status" className="text-center text-[16px] text-[#4b4664]">Counting your answers…</p>}
        {state.kind === "done" && <ThankYou outcome={state.outcome ?? "review"} amount={state.amount ?? 0} currency={state.currency ?? null} />}
        {state.kind === "error" && (
          <div role="alert" className="flex flex-col gap-4">
            <h1 className="m-0 text-[28px] font-bold tracking-tight">We couldn't count that yet</h1>
            <p className="m-0 text-[15.5px] leading-relaxed text-[#4b4664]">{state.message}</p>
            <Link to="/dashboard/participant" className="flex h-[52px] items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">Back to studies</Link>
          </div>
        )}
      </div>
    </main>
  );
}
