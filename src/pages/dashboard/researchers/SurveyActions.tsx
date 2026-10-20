import { Link } from "react-router-dom";
import { useGetToReviewQuery } from "@/redux/api/runApi";
import { methodById } from "@/lib/study";
import { untilLabel } from "@/pages/run/format";
import "@/styles/run.css";

/** Stage 7: everything waiting for you, by study, soonest automatic approval first. (Was "Survey Actions".) */
export default function ToReview() {
  const { data, isLoading, isError, refetch, fulfilledTimeStamp = 0 } = useGetToReviewQuery(undefined, { pollingInterval: 60000, refetchOnMountOrArgChange: true });
  const rows = data?.data;
  return (
    <div className="ja-page">
      <h1 className="ja-h1">To review</h1>
      <p className="ja-lede">Work waiting for you, by study. Soonest first, because that's what gets approved automatically first.</p>
      {isLoading && <div className="ja-skeleton" style={{ height: 220 }} aria-busy="true" />}
      {isError && <div className="ja-error" role="alert">We couldn't load this. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>}
      {rows && (rows.length === 0 ? (
        <div className="jr-empty">All caught up. Work shows up here as people finish your studies.</div>
      ) : (
        <nav className="jr-threads" aria-label="Studies with work to review" style={{ maxWidth: 900 }}>
          {rows.map((r) => {
            const booking = r.method === "interview" || r.method === "focus-group";
            return (
              <Link key={r.surveyId} className="jr-thread" to={`/dashboard/researcher/studies/${r.surveyId}?tab=${booking && !r.questions ? "people" : "review"}`}>
                <span className="top" style={{ flexWrap: "wrap" }}>
                  <b style={{ fontSize: 16 }}>{r.name}</b>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {r.count > 0 && <span className="unread">{r.count} to review</span>}
                    {r.toMark > 0 && <span className="unread">{r.toMark} {r.toMark === 1 ? "session" : "sessions"} to mark</span>}
                    {r.flagged > 0 && <span className="jr-flag">{r.flagged} flagged</span>}
                    {!!r.questions && <span className="unread">{r.questions} {r.questions === 1 ? "question" : "questions"} about a decision</span>}
                  </span>
                </span>
                <span className="pv">{methodById(r.method)?.label}{r.autoApproveAt ? ` · approved automatically ${untilLabel(r.autoApproveAt, fulfilledTimeStamp)} if you don't decide` : ""}</span>
              </Link>
            );
          })}
        </nav>
      ))}
      <p className="ja-small">Interviews are approved when you mark them “Happened”, and focus groups when you save who joined.</p>
    </div>
  );
}
