import { Link } from "react-router-dom";
import { useGetInboxQuery } from "@/redux/api/runApi";
import { ago } from "@/pages/run/format";
import "@/styles/run.css";

/** Stage 6: every conversation across your studies. Each one opens inside its study. */
export default function ResearcherMessages() {
  const { data, isLoading, isError, refetch } = useGetInboxQuery(undefined, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const inbox = data?.data;
  return (
    <div className="ja-page">
      <h1 className="ja-h1">Messages</h1>
      <p className="ja-lede">Conversations with participants, newest first. People appear by their study code; nobody sees anyone's email.</p>
      {isLoading && <div className="ja-skeleton" style={{ height: 260 }} aria-busy="true" />}
      {isError && <div className="ja-error" role="alert">We couldn't load your messages. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>}
      {inbox && (inbox.threads.length === 0 ? (
        <div className="jr-empty">No messages yet. Open a live study to write to the people taking part, or to everyone at once.</div>
      ) : (
        <nav className="jr-threads" aria-label="Conversations" style={{ maxWidth: 760 }}>
          {inbox.threads.map((t) => (
            <Link key={`${t.surveyId}:${t.participantId}`} className="jr-thread" to={`/dashboard/researcher/studies/${t.surveyId}?tab=messages&p=${t.participantId}`}>
              <span className="top">
                <b>{t.code} · {t.study}</b>
                <span style={{ display: "flex", gap: 6, alignItems: "center", flex: "none" }}>{t.unread > 0 && <span className="unread">{t.unread}<span className="sr-only"> unread</span></span>}<span className="when">{ago(t.last.at)}</span></span>
              </span>
              <span className="pv">{t.last.from === "researcher" ? "You: " : ""}{t.last.body}</span>
            </Link>
          ))}
        </nav>
      ))}
    </div>
  );
}
