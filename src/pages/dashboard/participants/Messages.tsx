import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetMyInboxQuery, useGetMyThreadQuery, useReplyAsParticipantMutation } from "@/redux/api/runApi";
import { readProblem } from "@/lib/session";
import { ago } from "@/pages/run/format";
import "@/styles/app.css";
import "@/styles/run.css";

/** Stage 6: messages with researchers, one conversation per study. */
const Messages = () => {
  const [params, setParams] = useSearchParams();
  const study = params.get("study") || "";
  const { data, isLoading } = useGetMyInboxQuery(undefined, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const threads = data?.data.threads || [];
  return (
    <div className="jp" style={{ minHeight: 0, background: "transparent" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 className="jp-h1" style={{ margin: 0 }}>Messages</h1>
        <span className="jp-hint">Researchers see your study code, never your name, email or phone number.</span>
        {isLoading && <div className="ja-skeleton" style={{ height: 200 }} aria-busy="true" />}
        {!isLoading && !threads.length && !study && <div className="jr-empty">No messages yet. If a researcher writes to you about a study, it shows up here and we email you.</div>}
        {(threads.length > 0 || study) && (
          <div className="jr-inbox">
            <nav className="jr-threads" aria-label="Conversations">
              {threads.map((t) => (
                <button key={t.surveyId} type="button" className="jr-thread" aria-current={study === t.surveyId} onClick={() => setParams({ study: t.surveyId })}>
                  <span className="top"><b>{t.study}</b><span style={{ display: "flex", gap: 6, alignItems: "center", flex: "none" }}>{t.unread > 0 && <span className="unread">{t.unread}<span className="sr-only"> unread</span></span>}<span className="when">{ago(t.last.at)}</span></span></span>
                  <span className="pv">{t.last.from === "participant" ? "You: " : ""}{t.last.body}</span>
                </button>
              ))}
            </nav>
            {study ? <Conversation key={study} surveyId={study} /> : <div className="jr-empty">Choose a conversation.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

function Conversation({ surveyId }: { surveyId: string }) {
  const { data, isLoading, isError, error } = useGetMyThreadQuery(surveyId || skipToken, { pollingInterval: 15000 });
  const [reply, state] = useReplyAsParticipantMutation();
  const [body, setBody] = useState("");
  const [problem, setProblem] = useState("");
  const t = data?.data;
  if (isError) return <div className="jp-note bad" role="alert">{readProblem(error).message || "We couldn't open this conversation."}</div>;
  const send = async () => {
    setProblem("");
    try {
      await reply({ surveyId, body }).unwrap();
      setBody("");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const who = t ? [t.researcher.name, t.researcher.organization].filter(Boolean).join(", ") || "The researcher" : "";
  return (
    <section className="jr-convo" aria-label={t ? `Conversation about ${t.study}` : "Conversation"}>
      {t && <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><b style={{ fontSize: 17 }}>{t.study}</b><span className="jp-hint">With {who} · you're {t.code}</span></div>}
      <div className="jr-msgs" aria-live="polite">
        {isLoading && <div className="ja-skeleton" style={{ height: 120 }} />}
        {t && !t.messages.length && <span className="jp-hint">No messages yet. Ask the researcher anything about this study.</span>}
        {t?.messages.map((m) => (
          <div key={m.messageId} className={`jr-msg ${m.from === "participant" ? "me" : "them"}`}>
            {m.body}
            <span className="at">{m.from === "participant" ? "You" : who} · {new Date(m.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        ))}
      </div>
      <div className="jr-compose">
        <label htmlFor="jr-reply" className="sr-only">Your message</label>
        <textarea id="jr-reply" placeholder="Write a message…" value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} />
        <span className="jp-hint">Keep your phone number and email out of messages. Everything can happen here.</span>
        {problem && <div className="jp-note bad" role="alert">{problem}</div>}
        <div className="jp-actions"><button type="button" className="jp-btn" style={{ height: 46, fontSize: 15 }} onClick={send} disabled={!body.trim() || state.isLoading}>{state.isLoading ? "Sending…" : "Send"}</button></div>
      </div>
    </section>
  );
}

export default Messages;
