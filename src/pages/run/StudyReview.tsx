import { useEffect, useRef, useState } from "react";
import { useDecideMutation, useGetReviewQuery, type Flag, type LiveView, type RejectReason, type ReviewItem, type ReviewView } from "@/redux/api/runApi";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { ago, untilLabel } from "./format";

/** Stage 7: review the work for one study. Quality checks, one or many at a time, reasons participants see. */
type Filter = "toReview" | "flagged" | "approved" | "rejected";
const FLAG: Record<Flag, [string, string]> = {
  fast: ["Very fast", "Finished in under a third of your planned time."],
  "no-link": ["No finish link", "Said they finished, but never came back through your study's finish link."],
  "rejected-before": ["Rejected before", "Two or more rejections on joinStudy in the last 90 days."],
};
const REASON_NOTES: Record<RejectReason, [string, string]> = {
  tasks: ["Skipped tasks or questions you required.", "the tasks or questions the study required weren't completed"],
  attention: ["Missed checks you described in your study.", "the attention checks in the study were missed"],
  "low-effort": ["Random, copied or contradictory answers.", "the answers didn't show real effort"],
  "not-eligible": ["Their answers show they don't match who you asked for.", "the answers show you don't match who the study is for"],
  other: ["Explain in the note.", "see the researcher's note"],
};

export default function StudyReview({ live, onMessage }: { live: LiveView; onMessage: (participantId: string) => void }) {
  const { data, isLoading, isError, refetch, fulfilledTimeStamp = 0 } = useGetReviewQuery(live.surveyId, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const [decide, decideState] = useDecideMutation();
  const [filter, setFilter] = useState<Filter>("toReview");
  const [selected, setSelected] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState<ReviewItem[] | null>(null);
  const [said, setSaid] = useState("");
  const [problem, setProblem] = useState("");
  const v = data?.data;
  if (isLoading) return <div className="ja-skeleton" style={{ height: 360 }} aria-busy="true" />;
  if (isError || !v) return <div className="ja-error" role="alert">We couldn't load the work to review. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>;

  const now = fulfilledTimeStamp;
  const waiting = v.items.filter((i) => i.status === "submitted");
  const shown = v.items.filter((i) => (filter === "toReview" ? i.status === "submitted" : filter === "flagged" ? i.status === "submitted" && i.flags.length > 0 : i.status === filter));
  const open = filter === "toReview" || filter === "flagged";
  const clean = waiting.filter((i) => !i.flags.length);
  const soon = waiting.filter((i) => i.autoApproveAt && new Date(i.autoApproveAt).getTime() - now < 2 * 864e5);
  const cur = v.currency;
  const pick = (f: Filter) => {
    setFilter(f);
    setSelected([]);
  };
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const approve = async (ids: string[]) => {
    setProblem("");
    setSaid("");
    try {
      const r = (await decide({ id: live.surveyId, ids, decision: "approve" }).unwrap()).data;
      setSaid(`Approved ${r.done}${r.skipped ? ` (${r.skipped} already decided)` : ""}. ${r.done === 1 ? "They've" : "They've all"} been paid.`);
      setSelected([]);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const counts: [Filter, string, number][] = [["toReview", "To review", v.counts.toReview], ["flagged", "Flagged", v.counts.flagged], ["approved", "Approved", v.counts.approved], ["rejected", "Rejected", v.counts.rejected]];

  return (
    <div className="ja-cols">
      <div className="ja-col-main">
        {v.reviewMode === "auto" ? (
          <div className="jr-alert" role="status"><span className="txt"><b>This study approves work automatically</b><span className="jr-muted">People are paid as soon as they finish. You chose this in the plan.</span></span></div>
        ) : soon.length > 0 ? (
          <div className="jr-alert" role="status"><span className="txt"><b>{soon.length} {soon.length === 1 ? "is" : "are"} approved automatically {untilLabel(soon[0].autoApproveAt!, now)}</b><span className="jr-muted">if you don't decide. That pays them, the same as approving.</span></span></div>
        ) : null}
        <div role="group" aria-label="Show" className="ja-chips">
          {counts.map(([k, label, n]) => <button key={k} type="button" className="ja-chip" aria-pressed={filter === k} onClick={() => pick(k)}>{label} {n}</button>)}
        </div>
        {said && <div className="jr-alert" role="status" style={{ background: "var(--paper)", borderColor: "var(--line)" }}><span className="txt">{said}</span></div>}
        {problem && <div className="jr-error" role="alert">{problem}</div>}
        <section className="ja-card jr-review" aria-label="Submissions">
          {open && shown.length > 0 && (
            <div className="ja-row">
              <button type="button" className="jr-btn sm" onClick={() => setSelected(clean.map((i) => i.surveyActionId))} disabled={!clean.length}>Select all without flags ({clean.length})</button>
              <span className="ja-small" style={{ flex: 1 }}>{selected.length ? `${selected.length} selected` : "Select to approve or reject several at once"}</span>
              {selected.length > 0 && (
                <span className="jr-btns">
                  <button type="button" className="jr-btn sun" disabled={decideState.isLoading} onClick={() => approve(selected)}>Approve {selected.length}</button>
                  <button type="button" className="jr-btn" onClick={() => setRejecting(waiting.filter((i) => selected.includes(i.surveyActionId)))}>Reject…</button>
                </span>
              )}
            </div>
          )}
          {shown.length === 0 ? (
            <div className="jr-empty">{filter === "toReview" ? (v.counts.approved + v.counts.rejected ? "All caught up. New work shows up here as people finish." : "Nothing to review yet. Work shows up here as people finish.") : filter === "flagged" ? "Nothing flagged." : `Nothing ${filter} yet.`}</div>
          ) : (
            <div className="jr-rows" role="table" aria-label="Work">
              <div className="jr-rv head" role="row"><span role="columnheader"><span className="sr-only">Select</span></span><span role="columnheader">Code</span><span role="columnheader">Time</span><span role="columnheader">Checks</span><span role="columnheader">Finished</span><span role="columnheader"><span className="sr-only">Actions</span></span></div>
              {shown.map((i) => (
                <Row key={i.surveyActionId} i={i} v={v} now={now} open={open} on={selected.includes(i.surveyActionId)} onToggle={() => toggle(i.surveyActionId)}
                  onApprove={() => approve([i.surveyActionId])} onReject={() => setRejecting([i])} onMessage={() => onMessage(i.participantId)} busy={decideState.isLoading} />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="ja-col-side">
        <section className="ja-card dark" style={{ gap: 10 }}>
          <span className="ja-mono" style={{ color: "var(--sun)" }}>When you approve</span>
          <span style={{ fontSize: 15, lineHeight: 1.5 }}>The participant is paid {formatMoney(v.perPerson, cur)} and the {Math.round(v.feeRate * 100)}% fee is taken from the money held for this study.</span>
          <span style={{ fontSize: 14, color: "var(--on-night-2)", lineHeight: 1.5 }}>Anything you don't decide is approved {v.autoApproveDays} days after it's finished. Rejecting needs a reason, and the participant sees it.</span>
        </section>
        <section className="ja-card" style={{ gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
          <b style={{ fontSize: 16 }}>What the checks mean</b>
          {(Object.keys(FLAG) as Flag[]).map((f) => <span key={f}><span className="jr-flag">{FLAG[f][0]}</span> {FLAG[f][1]}</span>)}
          <span className="ja-muted">Flags are a reason to look, not to reject. Check their answers in your own tool first.</span>
        </section>
      </div>
      {rejecting && <RejectDialog items={rejecting} v={v} onClose={(done) => { setRejecting(null); if (done) { setSelected([]); setSaid(done); } }} />}
    </div>
  );
}

function Row({ i, v, now, open, on, onToggle, onApprove, onReject, onMessage, busy }: { i: ReviewItem; v: ReviewView; now: number; open: boolean; on: boolean; onToggle: () => void; onApprove: () => void; onReject: () => void; onMessage: () => void; busy: boolean }) {
  const decided = i.review
    ? i.status === "approved"
      ? i.review.by === "auto" ? "Approved automatically" : i.review.by === "attendance" ? "Joined the session" : "Approved · paid"
      : `Rejected · ${v.reasons.find((r) => r.key === i.review?.reason)?.label || "no reason recorded"}`
    : i.status === "approved" ? "Approved · paid" : i.status === "rejected" ? "Rejected" : "";
  return (
    <div className="jr-rv" role="row" style={on ? { background: "var(--sun-soft)" } : undefined}>
      <span role="cell">{open && <button type="button" className="jr-cb" role="checkbox" aria-checked={on} aria-label={`Select ${i.code}`} onClick={onToggle}>{on ? "✓" : ""}</button>}</span>
      <b role="cell" className="code">{i.code}</b>
      <span role="cell">{i.minutes != null ? `${i.minutes} min` : "—"}<br /><span className="ja-small">planned {v.plannedMinutes}</span></span>
      <span role="cell" className="flags">
        {i.flags.length ? i.flags.map((f) => <span key={f} className="jr-flag" title={FLAG[f][1]}>{FLAG[f][0]}</span>) : <span className="jr-status">{open ? "no flags" : i.finishedBy === "booking" ? "booking" : "—"}</span>}
      </span>
      <span role="cell">{i.submittedAt ? ago(i.submittedAt, now) : "—"}<br /><span className="ja-small">{open && i.autoApproveAt ? `auto-approves ${untilLabel(i.autoApproveAt, now)}` : decided}</span>{!open && i.review?.note ? <><br /><span className="ja-small">“{i.review.note}”</span></> : null}</span>
      <span role="cell" className="acts">
        {open && <button type="button" className="jr-btn sm ink" disabled={busy} onClick={onApprove}>Approve<span className="sr-only"> {i.code}</span></button>}
        {open && <button type="button" className="jr-btn sm" onClick={onReject}>Reject<span className="sr-only"> {i.code}</span></button>}
        <button type="button" className="jr-btn sm" onClick={onMessage} aria-label={`Message ${i.code}`}>Message</button>
      </span>
    </div>
  );
}

function RejectDialog({ items, v, onClose }: { items: ReviewItem[]; v: ReviewView; onClose: (done?: string) => void }) {
  const [reason, setReason] = useState<RejectReason | null>(null);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const [decide, state] = useDecideMutation();
  const ref = useRef<HTMLDivElement>(null);
  const many = items.length > 1;
  const who = many ? `${items.length} submissions` : items[0].code;
  const them = many ? "them" : items[0].code;
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const go = async () => {
    if (!reason) return;
    setProblem("");
    try {
      const r = (await decide({ id: v.surveyId, ids: items.map((i) => i.surveyActionId), decision: "reject", reason, note: note.trim() || undefined }).unwrap()).data;
      onClose(`Rejected ${r.done}. ${r.done === 1 ? "They've" : "Each one has"} been told why.`);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="jr-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="jr-dialog" role="dialog" aria-modal="true" aria-labelledby="rj-t">
        <h2 id="rj-t">Reject {who}?</h2>
        <p className="jr-muted">They won't be paid, and the money stays held for this study. Reject only when the work clearly doesn't meet what you asked for.</p>
        <div role="radiogroup" aria-label="Reason" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {v.reasons.map((r) => (
            <button key={r.key} type="button" role="radio" aria-checked={reason === r.key} className="jr-opt" style={{ flex: "none" }} onClick={() => setReason(r.key)}>
              <b>{r.label}</b><span>{REASON_NOTES[r.key][0]}</span>
            </button>
          ))}
        </div>
        <div className="jr-field">
          <label htmlFor="rj-note">Note to {them} <span className="ja-small">({reason === "other" ? "needed" : "optional"}, they see it)</span></label>
          <textarea id="rj-note" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 80, width: "100%", boxSizing: "border-box", border: "1.5px solid var(--line)", borderRadius: 14, padding: "12px 14px", font: "inherit", fontSize: 15 }} />
        </div>
        {reason && (
          <div className="jr-cost" style={{ display: "block", lineHeight: 1.5 }}>
            <span className="ja-mono">What {many ? "they'll each" : "they'll"} see</span><br />
            “Your response to <b>{v.name}</b> wasn't approved: {REASON_NOTES[reason][1]}.”{note.trim() ? ` The researcher's note: ${note.trim()}` : ""} They can reply to you in Messages.
          </div>
        )}
        {problem && <div className="jr-error" role="alert">{problem}</div>}
        <div className="jr-btns">
          <button type="button" className="jr-btn ink" disabled={!reason || (reason === "other" && !note.trim()) || state.isLoading} onClick={go}>{state.isLoading ? "Rejecting…" : `Reject ${them}`}</button>
          <button type="button" className="jr-btn" onClick={() => onClose()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
