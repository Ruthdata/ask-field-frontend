import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLiveParticipantsQuery, useGetStudyThreadsQuery, useGetThreadQuery, useSendMessageMutation, type LiveView } from "@/redux/api/runApi";
import { readProblem } from "@/lib/session";
import { ago, STATUS_WORDS } from "./format";

/** Stage 6: conversations with the people in one study, by their code. "everyone" writes to all taking part. */
export default function StudyMessages({ live, participantId, onPick }: { live: LiveView; participantId: string; onPick: (p: string) => void }) {
  const id = live.surveyId;
  const { data: threadsData } = useGetStudyThreadsQuery(id, { pollingInterval: 20000 });
  const { data: peopleData } = useGetLiveParticipantsQuery(id);
  const threads = threadsData?.data || [];
  const people = (peopleData?.data || []).filter((p) => ["in-progress", "submitted", "approved", "no-show"].includes(p.status));
  const withThread = new Set(threads.map((t) => t.participantId));
  const others = people.filter((p) => !withThread.has(p.participantId));
  const everyone = participantId === "everyone";
  const taking = people.filter((p) => p.status !== "no-show").length;

  return (
    <div className="jr-inbox">
      <nav className="jr-threads" aria-label="Conversations">
        {live.status === "live" && (
          <button type="button" className="jr-thread" aria-current={everyone} onClick={() => onPick("everyone")}>
            <span className="top"><b>Message everyone taking part</b></span>
            <span className="pv">{taking} {taking === 1 ? "person" : "people"}</span>
          </button>
        )}
        {threads.map((t) => (
          <button key={t.participantId} type="button" className="jr-thread" aria-current={participantId === t.participantId} onClick={() => onPick(t.participantId)}>
            <span className="top"><b>{t.code}</b><span style={{ display: "flex", gap: 6, alignItems: "center" }}>{t.unread > 0 && <span className="unread">{t.unread}<span className="sr-only"> unread</span></span>}<span className="when">{ago(t.last.at)}</span></span></span>
            <span className="pv">{t.last.from === "researcher" ? "You: " : ""}{t.last.body}</span>
          </button>
        ))}
        {others.length > 0 && (
          <div className="jr-field" style={{ marginTop: 8 }}>
            <label htmlFor="jr-new">Start a conversation</label>
            <select id="jr-new" value="" onChange={(e) => e.target.value && onPick(e.target.value)}>
              <option value="">Choose a participant…</option>
              {others.map((p) => <option key={p.participantId} value={p.participantId}>{p.code} · {STATUS_WORDS[p.status] || p.status}</option>)}
            </select>
          </div>
        )}
        {!threads.length && !others.length && live.status !== "live" && <div className="jr-empty">No conversations.</div>}
      </nav>
      {participantId ? (
        <Conversation key={participantId} live={live} participantId={participantId} everyone={everyone} count={taking} code={people.find((p) => p.participantId === participantId)?.code} />
      ) : (
        <div className="jr-empty">{threads.length ? "Choose a conversation." : "No messages yet. Participants can write to you from their study, and you can write to anyone taking part."}</div>
      )}
    </div>
  );
}

function Conversation({ live, participantId, everyone, count, code }: { live: LiveView; participantId: string; everyone: boolean; count: number; code?: string }) {
  const { data, isLoading } = useGetThreadQuery(everyone ? skipToken : { id: live.surveyId, participantId }, { pollingInterval: 15000 });
  const [send, sendState] = useSendMessageMutation();
  const [body, setBody] = useState("");
  const [problem, setProblem] = useState("");
  const [sent, setSent] = useState("");
  const t = data?.data;
  const who = everyone ? "everyone taking part" : t?.code || code || "this participant";
  const submit = async () => {
    setProblem("");
    setSent("");
    try {
      const r = (await send({ id: live.surveyId, to: everyone ? "everyone" : participantId, body }).unwrap()).data;
      setBody("");
      if (everyone) setSent(`Sent to ${r.sent} ${r.sent === 1 ? "person" : "people"}.`);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <section className="jr-convo" aria-label={`Conversation with ${who}`}>
      <div className="ja-row">
        <b style={{ fontSize: 17 }}>{everyone ? "Everyone taking part" : who}</b>
        <span className="ja-small">{everyone ? `${count} ${count === 1 ? "person" : "people"}; each gets it in their own conversation` : t ? STATUS_WORDS[t.status] || t.status : ""}</span>
      </div>
      {!everyone && (
        <div className="jr-msgs" aria-live="polite">
          {isLoading && <div className="ja-skeleton" style={{ height: 120 }} />}
          {t && !t.messages.length && <span className="ja-muted">No messages yet.</span>}
          {t?.messages.map((m) => (
            <div key={m.messageId} className={`jr-msg ${m.from === "researcher" ? "me" : "them"}`}>
              {m.body}
              <span className="at">{m.from === "researcher" ? (m.broadcast ? "To everyone · " : "You · ") : `${t.code} · `}{new Date(m.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{m.from === "researcher" && m.readAt ? " · read" : ""}</span>
            </div>
          ))}
        </div>
      )}
      {live.status === "live" || !everyone ? (
        <div className="jr-compose">
          <label htmlFor="jr-body" className="sr-only">{everyone ? "Message to everyone taking part" : `Reply to ${who}`}</label>
          <textarea id="jr-body" placeholder={everyone ? "Write to everyone taking part…" : `Reply to ${who}`} value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} />
          <span className="ja-small">Participants see your name and organisation, never your email. Don't ask for their contact details.</span>
          {problem && <div className="jr-error" role="alert">{problem}</div>}
          {sent && <span className="ja-small" role="status">{sent}</span>}
          <div className="jr-btns"><button type="button" className="jr-btn ink" onClick={submit} disabled={!body.trim() || sendState.isLoading}>{sendState.isLoading ? "Sending…" : "Send"}</button></div>
        </div>
      ) : null}
    </section>
  );
}
