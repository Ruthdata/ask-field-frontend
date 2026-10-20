import { useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { downloadResults, useGetLiveParticipantsQuery, useGetLiveQuery, useGetStudyThreadsQuery, useRunAgainMutation, type LiveView } from "@/redux/api/runApi";
import { formatMoney, methodById } from "@/lib/study";
import { readProblem } from "@/lib/session";
import ChangeDialog, { type Change } from "./ChangeDialog";
import StudyBookings from "./StudyBookings";
import StudyMessages from "./StudyMessages";
import StudyReview from "./StudyReview";
import StudyFinish from "./StudyFinish";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ago, shortDate, STATUS_WORDS } from "./format";
import "@/styles/run.css";

/** Stage 6: one live (or closed) study. Overview, the people taking part (or bookings), and messages. */
type Tab = "overview" | "people" | "messages" | "review";

export default function StudyPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (["overview", "people", "messages", "review"].includes(params.get("tab") || "") ? params.get("tab") : "overview") as Tab;
  const { data, isLoading, isError, error, refetch } = useGetLiveQuery(id, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const { data: threads } = useGetStudyThreadsQuery(id, { pollingInterval: 30000 });
  const [change, setChange] = useState<Change | null>(null);
  const [runAgain, againState] = useRunAgainMutation();
  const [problem, setProblem] = useState("");
  const navigate = useNavigate();
  const ws = useWorkspace(); // Stage 9: viewers only look; researchers can't pay
  const live = data?.data;

  if (isLoading) return <div className="ja-page"><div className="ja-skeleton" style={{ height: 420 }} aria-busy="true" /></div>;
  if (isError || !live) {
    const p = readProblem(error);
    return <div className="ja-page"><div className="ja-error" role="alert">{p.message || "We couldn't open this study."} <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div></div>;
  }
  if (live.status === "draft") return <Navigate to={`/dashboard/researcher/studies/${id}/plan`} replace />;

  const go = (t: Tab, extra: Record<string, string> = {}) => setParams({ ...(t === "overview" ? {} : { tab: t }), ...extra }, { replace: true });
  const booking = live.method === "interview" || live.method === "focus-group";
  const peopleLabel = live.method === "interview" ? "Bookings" : live.method === "focus-group" ? "Sessions" : "Participants";
  const unread = (threads?.data || []).reduce((t, x) => t + x.unread, 0);
  const isLive = live.status === "live";
  const closesLine = live.status === "closed" ? `closed ${live.closedAt ? shortDate(live.closedAt) : ""}` : live.closes ? `closes ${shortDate(live.closes)}` : "closes when full";

  return (
    <div className="ja-page">
      <header className="jr-head">
        <Link to="/dashboard/researcher/studies" className="jr-back">← Studies</Link>
        <div className="jr-titlerow">
          <div className="jr-title">
            <h1 className="ja-h1">{live.name}</h1>
            <div className="jr-meta">
              <span className={`ja-pill ${isLive && !live.paused ? "live" : "closed"}`}>{live.status === "closed" ? "Closed" : live.paused ? "Paused" : "Live"}</span>
              <span>
                {methodById(live.method)?.label} · {live.publishedAt ? `opened ${shortDate(live.publishedAt)} · ` : ""}
                {closesLine}
              </span>
              {isLive && <button type="button" className="ja-link" style={{ fontSize: 14.5 }} onClick={() => setChange("date")}>Change<span className="sr-only"> close date</span></button>}
            </div>
          </div>
          {!isLive && (
            <div className="jr-btns">
              <button type="button" className="jr-btn" onClick={() => downloadResults(id).catch((e) => setProblem(e.message))}>Download results</button>
              {ws.canEdit && <button type="button" className="jr-btn" disabled={againState.isLoading} onClick={async () => {
                try {
                  const r = (await runAgain(id).unwrap()).data;
                  navigate(`/dashboard/researcher/studies/${r.surveyId}/plan/basics`);
                } catch (err) {
                  setProblem(readProblem(err).message);
                }
              }}>{againState.isLoading ? "Copying…" : "Run it again"}</button>}
            </div>
          )}
          {isLive && ws.canEdit && (
            <div className="jr-btns">
              {!live.reportHold && <button type="button" className="jr-btn" onClick={() => setChange("pause")}>{live.paused ? "Resume" : "Pause"}</button>}
              {ws.canPay && <button type="button" className="jr-btn" onClick={() => setChange("places")}>{live.method === "focus-group" ? "Add a session" : "Add places"}</button>}
              <button type="button" className="jr-btn danger" onClick={() => setChange("close")}>Close early</button>
            </div>
          )}
        </div>
        <div className="jr-tabs" role="tablist" aria-label="Study">
          <button type="button" role="tab" className="jr-tab" aria-selected={tab === "overview"} onClick={() => go("overview")}>Overview</button>
          <button type="button" role="tab" className="jr-tab" aria-selected={tab === "people"} onClick={() => go("people")}>{peopleLabel}</button>
          <button type="button" role="tab" className="jr-tab" aria-selected={tab === "messages"} onClick={() => go("messages")}>
            Messages{unread > 0 && <span className="n">{unread}<span className="sr-only"> unread</span></span>}
          </button>
          {!booking && (
            <button type="button" role="tab" className="jr-tab" aria-selected={tab === "review"} onClick={() => go("review")}>
              Review{live.counts.toReview > 0 && <span className="n">{live.counts.toReview}<span className="sr-only"> to review</span></span>}
            </button>
          )}
        </div>
      </header>

      {params.get("paid") && <div className="jr-alert" role="status"><span className="txt"><b>Payment received.</b><span className="jr-muted">The new places open as soon as your bank confirms the card payment, usually within a minute.</span></span></div>}
      {live.paused && isLive && live.reportHold && (
        <div className="jr-alert" role="status">
          <span className="txt"><b>Paused by joinStudy while we check it.</b><span className="jr-muted">Several participants reported this study. New people can't start; anyone already taking part can finish. We'll email you within 1 working day. Studies must never ask for bank, card or ID details, ask people to pay, or move them off joinStudy.</span></span>
        </div>
      )}
      {live.paused && isLive && !live.reportHold && (
        <div className="jr-alert dark" role="status">
          <span className="txt"><b>Paused.</b><span className="jr-muted">New people can't start; anyone already taking part can finish.</span></span>
          <button type="button" className="jr-btn sun" onClick={() => setChange("pause")}>Resume</button>
        </div>
      )}

      {problem && <div className="ja-error" role="alert">{problem}</div>}
      {tab === "overview" && !isLive && <StudyFinish id={id} onReview={() => go(booking ? "people" : "review")} />}
      {tab === "overview" && isLive && <Overview live={live} onMessage={() => go("messages")} onReview={() => go(booking ? "people" : "review")} />}
      {tab === "people" && (booking ? <StudyBookings live={live} onAddTimes={() => setChange(live.method === "interview" ? "times" : "places")} onMessage={(p) => go("messages", { p })} /> : <Participants live={live} onMessage={(p) => go("messages", { p })} />)}
      {tab === "review" && !booking && <StudyReview live={live} onMessage={(p) => go("messages", { p })} />}
      {tab === "messages" && <StudyMessages live={live} participantId={params.get("p") || ""} onPick={(p) => go("messages", p ? { p } : {})} />}

      {change && <ChangeDialog kind={change} live={live} onClose={() => setChange(null)} />}
    </div>
  );
}

function Overview({ live, onMessage, onReview }: { live: LiveView; onMessage: () => void; onReview: () => void }) {
  const c = live.counts;
  const cur = live.money.currency;
  const done = c.approved + c.toReview;
  const pct = (n: number) => `${live.places ? Math.min(100, (n / live.places) * 100) : 0}%`;
  const max = Math.max(1, ...live.perDay.map((d) => d.count));
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!live.returnLink) return;
    try {
      await navigator.clipboard.writeText(live.returnLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <>
      {live.stuck.length > 0 && (
        <div className="jr-alert" role="status">
          <span className="txt">
            <b>{live.stuck.length} {live.stuck.length === 1 ? "person looks" : "people look"} stuck: {live.stuck.slice(0, 4).map((s) => s.code).join(", ")}{live.stuck.length > 4 ? "…" : ""}</b>
            <span className="jr-muted">They started a while ago and never reached your finish link. Check the end of your survey sends people to {live.returnLink?.replace(/^https?:\/\//, "")}.</span>
          </span>
          <span className="jr-btns">
            {live.returnLink && <button type="button" className="jr-btn sm" onClick={copy}>{copied ? "Copied" : "Copy finish link"}</button>}
            <button type="button" className="jr-btn sm ink" onClick={onMessage}>Message them</button>
          </span>
        </div>
      )}
      <div className="ja-cols">
        <div className="ja-col-main">
          <section className="ja-card" aria-labelledby="ov-p">
            <div className="ja-row">
              <h2 id="ov-p" className="ja-h2">{done} of {live.places} done</h2>
              <span className="ja-small">{live.medianMinutes != null ? `Median ${live.medianMinutes} min (planned ${live.minutes})` : `Planned ${live.minutes} min each`}</span>
            </div>
            <div className="jr-stack" role="img" aria-label={`${c.approved} approved, ${c.toReview} to review, ${c.inProgress} taking it now, ${c.left} places left`}>
              <span style={{ width: pct(c.approved), background: "var(--night)" }} />
              <span style={{ width: pct(c.toReview), background: "var(--sun)" }} />
              <span style={{ width: pct(c.inProgress), background: "#bdb6de" }} />
            </div>
            <div className="jr-stats">
              <div className="jr-stat"><span className="v">{c.approved}</span><span className="l">Approved</span><span className="n">paid</span></div>
              <div className="jr-stat"><span className="v">{c.toReview}</span><span className="l">To review</span><span className="n">{c.toReview ? <button type="button" className="ja-link" style={{ fontSize: 13 }} onClick={onReview}>Review now</button> : "all caught up"}</span></div>
              <div className="jr-stat"><span className="v">{c.inProgress}</span><span className="l">{live.bookings ? "Booked or taking part" : "Taking it now"}</span><span className="n">{live.stuck.length ? `${live.stuck.length} stuck` : " "}</span></div>
              <div className="jr-stat"><span className="v">{c.left}</span><span className="l">Places left</span><span className="n">of {live.places}</span></div>
            </div>
            <span className="ja-small">
              {[c.screenedOut && `${c.screenedOut} screened out by your questions`, c.noShow && `${c.noShow} didn't join`, c.rejected && `${c.rejected} rejected`].filter(Boolean).join(" · ") || "Nobody screened out or rejected yet."}
            </span>
            {!!live.declines?.total && <Declines d={live.declines} />}
            {!!live.leaves && live.leaves.left + live.leaves.timedOut > 0 && <Leaves l={live.leaves} />}
          </section>
          <section className="ja-card" aria-labelledby="ov-d">
            <h2 id="ov-d" className="ja-h3">Finished per day, last 7 days</h2>
            <div className="jr-days">
              {live.perDay.map((d) => (
                <div key={d.day} className="jr-day">
                  <b>{d.count}</b>
                  <span className={`bar${d.count ? "" : " zero"}`} style={{ height: `${(d.count / max) * 100}%` }} />
                  <span>{new Date(`${d.day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short" })}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="ja-col-side">
          {live.quotas.length > 0 && (
            <section className="ja-card" aria-labelledby="ov-q">
              <h2 id="ov-q" className="ja-h3">Quotas</h2>
              {live.quotas.map((q) => (
                <div key={q.value} className="jr-quota">
                  <span className="top"><span>{q.value}</span><span className="ja-mono">{q.done} / {q.places}</span></span>
                  <span className="ja-bar"><span style={{ width: `${Math.min(100, (q.done / Math.max(1, q.places)) * 100)}%` }} /></span>
                  {q.done >= q.places && <span className="ja-small">Full: new people in this group are turned away.</span>}
                </div>
              ))}
            </section>
          )}
          {live.bookings && (
            <section className="ja-card" aria-labelledby="ov-b">
              <h2 id="ov-b" className="ja-h3">Coming up</h2>
              {live.bookings.next.length ? live.bookings.next.map((b) => (
                <div key={b.start + b.code} className="jr-kv"><span>{b.code}</span><span>{new Date(b.start).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
              )) : <span className="ja-muted">Nothing booked yet.</span>}
              <span className="ja-small">{live.bookings.booked} booked · {live.bookings.happened} happened · {live.bookings.noshow} didn't join</span>
            </section>
          )}
          <section className="ja-card" aria-labelledby="ov-m">
            <h2 id="ov-m" className="ja-h3">Money for this study</h2>
            <div>
              <div className="jr-kv"><span>Paid in</span><span>{formatMoney(live.money.paidIn, cur)}</span></div>
              <div className="jr-kv"><span>Paid out for approved work</span><span>{formatMoney(live.money.paidOut, cur)}</span></div>
              <div className="jr-kv"><span><b>Still held</b></span><span><b>{formatMoney(live.money.held, cur)}</b></span></div>
            </div>
            <span className="ja-small">What isn't used comes back when the study closes.</span>
          </section>
          {live.returnLink && !live.stuck.length && (
            <section className="ja-card" aria-labelledby="ov-l">
              <h2 id="ov-l" className="ja-h3">Finish link</h2>
              <span className="ja-muted" style={{ overflowWrap: "anywhere" }}>{live.returnLink}</span>
              <span className="ja-small">Your survey's last page sends people here, which marks them finished.</span>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Participants({ live, onMessage }: { live: LiveView; onMessage: (participantId: string) => void }) {
  const { data, isLoading } = useGetLiveParticipantsQuery(live.surveyId, { pollingInterval: 30000 });
  const list = data?.data || [];
  const stuck = new Set(live.stuck.map((s) => s.code));
  return (
    <section className="ja-card" aria-label="Participants">
      <span className="ja-muted">People appear by their study code. You never see names or contact details; message them here instead.</span>
      {isLoading ? <div className="ja-skeleton" style={{ height: 200 }} /> : list.length === 0 ? (
        <div className="jr-empty">Nobody has started yet. Matching participants can see your study now.</div>
      ) : (
        <div className="jr-rows" role="table" aria-label="Participants">
          <div className="jr-row head" role="row"><span role="columnheader">Code</span><span role="columnheader">Status</span><span role="columnheader" className="hide-sm">Started</span><span role="columnheader" className="hide-sm">Minutes</span><span role="columnheader"><span className="sr-only">Actions</span></span></div>
          {list.map((p) => (
            <div key={p.surveyActionId} className="jr-row" role="row">
              <span role="cell" className="code">{p.code}</span>
              <span role="cell"><span className={`jr-status${p.status === "approved" ? " ok" : stuck.has(p.code) || p.status === "rejected" ? " bad" : ""}`}>{stuck.has(p.code) ? "stuck" : STATUS_WORDS[p.status] || p.status}</span></span>
              <span role="cell" className="hide-sm">{ago(p.startedAt)}</span>
              <span role="cell" className="hide-sm">{p.minutes ?? "—"}</span>
              <span role="cell"><button type="button" className="jr-btn sm" onClick={() => onMessage(p.participantId)}>Message<span className="sr-only"> {p.code}</span></button></span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const DECLINE_LABELS: Record<string, string> = { "too-long": "too long", "pay-low": "pay too low", topic: "not their topic", timing: "bad timing", other: "something else" };
/** Participant Stage 3: "Not interested" totals. Never who. */
function Declines({ d }: { d: NonNullable<LiveView["declines"]> }) {
  const why = Object.entries(d.reasons).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${DECLINE_LABELS[k] ?? k}`);
  return (
    <span className="ja-small">
      {d.total === 1 ? "1 person" : `${d.total} people`} who fit said “Not interested”{why.length ? `: ${why.join(", ")}` : ""}.
      {d.reasons["pay-low"] >= Math.max(3, d.total / 3) && " Better pay usually fills faster."}
    </span>
  );
}

const LEAVE_LABELS: Record<string, string> = { longer: "longer than it said", "link-broken": "the link didn't work", "came-up": "something came up", uncomfortable: "not comfortable", other: "something else" };
/** Participant Stage 4: people who left or ran out of time. Totals only. */
function Leaves({ l }: { l: NonNullable<LiveView["leaves"]> }) {
  const why = Object.entries(l.reasons).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${LEAVE_LABELS[k] ?? k}`);
  const parts = [l.left ? `${l.left} left${why.length ? ` (${why.join(", ")})` : ""}` : "", l.timedOut ? `${l.timedOut} ran out of time` : ""].filter(Boolean);
  return (
    <span className="ja-small">
      {parts.join(" · ")}. Their places went back to the study.
      {l.reasons["link-broken"] > 0 && " Check your study link opens on a phone."}
    </span>
  );
}
