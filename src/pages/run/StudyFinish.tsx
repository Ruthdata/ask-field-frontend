import { useState } from "react";
import { downloadResults, openStatement, useGetFinishQuery, useSetReturnToMutation, type FinishView } from "@/redux/api/runApi";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { shortDate } from "./format";

/** Stage 8: a closed study. What's left before the money settles, where unused money goes, results and statement. */
const WHY: Record<string, string> = { early: "you closed it early", full: "every place was done", date: "it reached its close date" };

export default function StudyFinish({ id, onReview }: { id: string; onReview: () => void }) {
  const { data, isLoading, isError, refetch } = useGetFinishQuery(id, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const v = data?.data;
  if (isLoading) return <div className="ja-skeleton" style={{ height: 360 }} aria-busy="true" />;
  if (isError || !v) return <div className="ja-error" role="alert">We couldn't load this. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>;
  const st = v.settlement;
  const cur = v.money.currency;
  const steps: { state: "done" | "now" | "later"; title: string; text: string }[] = [
    { state: "done", title: `Closed on ${v.closedAt ? shortDate(v.closedAt) : ""}`, text: v.stillFinishing ? `${v.stillFinishing} ${v.stillFinishing === 1 ? "person is" : "people are"} still finishing (they have 2 hours).` : "Nobody new can start." },
    st || (!v.toReview && !v.unmarked)
      ? { state: "done", title: "All work reviewed", text: `${v.counts.approved} approved, ${v.counts.rejected} rejected.` }
      : { state: "now", title: "Review the last work", text: `${v.toReview ? `${v.toReview} still waiting` : ""}${v.toReview && v.unmarked ? " and " : ""}${v.unmarked ? `${v.unmarked} ${v.unmarked === 1 ? "booking" : "bookings"} to mark` : ""}. Anything you leave is approved ${v.settlesBy ? `on ${shortDate(v.settlesBy)}` : "automatically"}.` },
    st
      ? { state: "done", title: `Money settled on ${shortDate(st.at)}`, text: st.unused > 0 ? returnedLine(st, cur) : "Nothing was left over." }
      : { state: "later", title: "Money settles", text: "Then the unused money goes where you choose." },
  ];
  return (
    <div className="ja-cols">
      <div className="ja-col-main">
        <section className="ja-card strong" aria-labelledby="fin-h">
          <span className="ja-mono">{st ? `Finished on ${shortDate(st.at)}` : `Closed on ${v.closedAt ? shortDate(v.closedAt) : ""} · ${WHY[v.closedReason || "early"]}`}</span>
          <h2 id="fin-h" className="ja-h2">{st ? "Finished" : "Almost finished"}</h2>
          <p className="ja-muted">{st ? "Everything is reviewed and paid. The final statement is ready." : "Once the last work is reviewed, we settle the money and send you the final statement."}</p>
          <ol className="ja-check" style={{ gridTemplateColumns: "1fr" }}>
            {steps.map((s) => (
              <li key={s.title} className={s.state === "later" ? "" : s.state}>
                <span className="dot" aria-hidden="true">{s.state === "done" ? "✓" : s.state === "now" ? "•" : ""}</span>
                <span className="txt"><span className="t">{s.title}<span className="sr-only"> ({s.state === "done" ? "done" : s.state === "now" ? "to do" : "not yet"})</span></span><span className="ja-small">{s.text}</span></span>
              </li>
            ))}
          </ol>
          {!st && (v.toReview > 0 || v.unmarked > 0) && (
            <div className="ja-row" style={{ justifyContent: "flex-start" }}>
              <button type="button" className="ja-btn" onClick={onReview}>{v.toReview ? `Review the ${v.toReview} waiting` : "Mark who joined"}</button>
              <span className="ja-small">Settles on its own{v.settlesBy ? ` on ${shortDate(v.settlesBy)}` : ""} if you don't.</span>
            </div>
          )}
        </section>
        <section className="ja-card" aria-labelledby="what-h">
          <h2 id="what-h" className="ja-h3">What happened</h2>
          <div className="jr-stats">
            <div className="jr-stat"><span className="v">{v.counts.approved}</span><span className="l">Approved</span><span className="n">paid</span></div>
            <div className="jr-stat"><span className="v">{v.counts.rejected}</span><span className="l">Rejected</span><span className="n">with a reason</span></div>
            <div className="jr-stat"><span className="v">{v.counts.didntFinish}</span><span className="l">Didn't finish</span><span className="n">not charged</span></div>
            <div className="jr-stat"><span className="v">{v.counts.unusedPlaces}</span><span className="l">Places unused</span><span className="n">of {v.counts.places}</span></div>
          </div>
          {v.medianMinutes != null && <span className="ja-small">Median {v.medianMinutes} minutes (planned {v.plannedMinutes})</span>}
        </section>
      </div>
      <div className="ja-col-side">
        <Money v={v} />
        <section className="ja-card" aria-labelledby="res-h">
          <h2 id="res-h" className="ja-h3">Results</h2>
          <span className="ja-muted">One row per person: code, dates, minutes, the checks, your decision, and the joinStudy ID that's in your survey's responses (as <span className="ja-mono">jsid</span>). No names or contact details.</span>
          <Downloads id={id} />
        </section>
      </div>
    </div>
  );
}

const returnedLine = (st: NonNullable<FinishView["settlement"]>, cur: string) =>
  [st.credit > 0 && `${formatMoney(st.credit, cur)} returned as credit`, st.refunded > 0 && `${formatMoney(st.refunded, cur)} refunded to your card`].filter(Boolean).join(" and ") + ".";

function Money({ v }: { v: FinishView }) {
  const [setTo, state] = useSetReturnToMutation();
  const [problem, setProblem] = useState("");
  const st = v.settlement;
  const cur = v.money.currency;
  const pick = async (to: "credit" | "card") => {
    setProblem("");
    try {
      await setTo({ id: v.surveyId, to }).unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const opts: { to: "credit" | "card"; label: string; note: string }[] = [
    { to: "credit", label: "Credit for your next study", note: "Straight away. Used first when you next pay." },
    ...(v.card ? [{ to: "card" as const, label: `Back to your card${v.card.last4 ? ` ending ${v.card.last4}` : ""}`, note: "Refunded to the card you paid with. Banks take 5 to 10 days." }] : []),
  ];
  return (
    <section className="ja-card" aria-labelledby="money-h">
      <h2 id="money-h" className="ja-h3">Money</h2>
      <div>
        <div className="jr-kv"><span>Paid in</span><span>{formatMoney(v.money.paidIn, cur)}</span></div>
        <div className="jr-kv"><span>Paid to {v.counts.approved} participant{v.counts.approved === 1 ? "" : "s"}</span><span>{formatMoney(v.money.participants, cur)}</span></div>
        <div className="jr-kv"><span>joinStudy fee</span><span>{formatMoney(v.money.fees, cur)}</span></div>
        {!st && v.money.waitingIfApproved > 0 && <div className="jr-kv"><span>{v.toReview} waiting, if approved</span><span>{formatMoney(v.money.waitingIfApproved, cur)}</span></div>}
        <div className="jr-kv"><span><b>{st ? "Returned" : "Unused, comes back to you"}</b></span><span><b>{formatMoney(st ? st.unused : v.money.unused, cur)}</b></span></div>
      </div>
      {st ? (
        st.unused > 0 && <div className="jr-cost" style={{ display: "block", lineHeight: 1.5 }}>{returnedLine(st, cur)} {st.credit > 0 ? "Credit is used first when you next pay." : ""}</div>
      ) : (
        <>
          <div role="radiogroup" aria-label="Where unused money goes" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opts.map((o) => (
              <button key={o.to} type="button" role="radio" aria-checked={v.returnTo === o.to} className="jr-opt" style={{ flex: "none" }} disabled={state.isLoading} onClick={() => pick(o.to)}>
                <b>{o.label}</b><span>{o.note}</span>
              </button>
            ))}
          </div>
          <span className="ja-small">{v.card ? "You can change this until the money settles." : "This study wasn't paid by card, so unused money comes back as credit."}</span>
        </>
      )}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <button type="button" className="ja-link" onClick={() => openStatement(v.surveyId)}>{st ? "Final statement" : "Statement so far"} →</button>
    </section>
  );
}

export function Downloads({ id }: { id: string }) {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const get = async (show: "all" | "approved") => {
    setProblem("");
    setBusy(true);
    try {
      await downloadResults(id, show);
    } catch (err) {
      setProblem((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="jr-btns">
        <button type="button" className="jr-btn" disabled={busy} onClick={() => get("all")}>Download CSV</button>
        <button type="button" className="jr-btn" disabled={busy} onClick={() => get("approved")}>Approved only</button>
      </div>
      {problem && <div className="jr-error" role="alert">{problem}</div>}
    </>
  );
}
