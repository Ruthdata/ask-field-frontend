import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useConfirmEmailMutation } from "@/redux/api/accountApi";
import { readProblem } from "@/lib/session";
import "@/styles/app.css";

/** Stage 9: the link sent to a new email address. */
export default function ConfirmEmailChange() {
  const [params] = useSearchParams();
  const [confirm] = useConfirmEmailMutation();
  const [state, setState] = useState<{ done?: string; problem?: string }>({});
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    once.current = true;
    confirm(params.get("token") || "")
      .unwrap()
      .then((r) => setState({ done: r.data.email }))
      .catch((err) => setState({ problem: readProblem(err).message }));
  }, [confirm, params]);
  return (
    <div className="jp" style={{ display: "flex", justifyContent: "center", padding: "64px 16px" }}>
      <main className="jp-sec" style={{ width: "min(520px, 100%)", gap: 16 }} aria-live="polite">
        {!state.done && !state.problem && <div className="ja-skeleton" style={{ height: 120 }} aria-busy="true" />}
        {state.done && (
          <>
            <h1 className="jp-h1" style={{ margin: 0 }}>Email changed</h1>
            <p className="jp-lede" style={{ margin: 0 }}>Sign in with <b>{state.done}</b> from now on.</p>
            <Link className="jp-btn" to="/dashboard/researcher/settings">Back to settings</Link>
          </>
        )}
        {state.problem && (
          <>
            <h1 className="jp-h1" style={{ margin: 0 }}>That link didn't work</h1>
            <p className="jp-lede" style={{ margin: 0 }}>{state.problem}</p>
            <Link className="jp-btn2" to="/dashboard/researcher/settings">Go to settings</Link>
          </>
        )}
      </main>
    </div>
  );
}
