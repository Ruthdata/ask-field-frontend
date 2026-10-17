import { useState } from "react";
import { useGetBookingsQuery, useMarkBookingMutation, useSaveAttendanceMutation, useSetBookingLinkMutation, type LiveView, type ResearcherBookings } from "@/redux/api/runApi";
import { readProblem } from "@/lib/session";
import { formatMoney } from "@/lib/study";
import { byDay, timeLabel } from "./format";

type B = ResearcherBookings["bookings"][number];

/** Stage 6: interview and focus-group bookings, in the researcher's time zone. Mark each one after it starts. */
export default function StudyBookings({ live, onAddTimes, onMessage }: { live: LiveView; onAddTimes: () => void; onMessage: (participantId: string) => void }) {
  const { data, isLoading, isError, refetch, fulfilledTimeStamp = 0 } = useGetBookingsQuery(live.surveyId, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const [problem, setProblem] = useState("");
  const v = data?.data;
  if (isLoading) return <div className="ja-skeleton" style={{ height: 320 }} aria-busy="true" />;
  if (isError || !v) return <div className="ja-error" role="alert">We couldn't load the bookings. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>;
  const tz = v.timeZone;
  const focus = live.method === "focus-group";
  const days = byDay(v.bookings, (b) => b.start, tz);
  const isLive = live.status === "live";

  return (
    <div className="ja-cols">
      <div className="ja-col-main">
        <section className="ja-card" aria-label={focus ? "Sessions" : "Bookings"}>
          <div className="ja-row">
            <span className="ja-muted" style={{ flex: "1 1 320px" }}>Times in your time zone, {tz}. Participants see their own. We email everyone a reminder 24 hours and 1 hour before.</span>
            {isLive && <button type="button" className="jr-btn sm" onClick={onAddTimes}>{focus ? "Add a session" : "Add more times"}</button>}
          </div>
          {problem && <div className="jr-error" role="alert">{problem}</div>}
          {days.length === 0 ? (
            <div className="jr-empty">No bookings yet. People who qualify choose one of your open times.</div>
          ) : (
            days.map((d) => (
              <div key={d.key}>
                <div className="jr-dayhead">{d.label}</div>
                {focus ? (
                  // Focus groups: one row per session with who's in it.
                  Object.entries(groupBy(d.items, (b) => b.start)).map(([start, people]) =>
                    new Date(start).getTime() <= fulfilledTimeStamp && people.some((p) => p.status === "booked") ? (
                      <Attendance key={start} live={live} start={start} end={people[0].end} tz={tz} people={people} />
                    ) : (
                    <div key={start} className="jr-booking">
                      <span className="time">{timeLabel(start, tz)}</span>
                      <span className="who"><b>{people.length} booked</b><span className="ja-small">{people.map((p) => p.code).join(", ")}</span></span>
                      <span className="acts" />
                      {people.map((b) => <BookingRow key={b.bookingId} b={b} live={live} tz={tz} videoMode={v.videoMode} onProblem={setProblem} onMessage={onMessage} now={fulfilledTimeStamp} nested />)}
                    </div>
                  ))
                ) : (
                  d.items.map((b) => <BookingRow key={b.bookingId} b={b} live={live} tz={tz} videoMode={v.videoMode} onProblem={setProblem} onMessage={onMessage} now={fulfilledTimeStamp} />)
                )}
              </div>
            ))
          )}
        </section>
      </div>
      <div className="ja-col-side">
        <section className="ja-card" aria-labelledby="bk-open">
          <h2 id="bk-open" className="ja-h3">{v.open.length ? `${v.open.length} open ${focus ? "sessions" : "times"}` : "No open times"}</h2>
          {v.open.slice(0, 6).map((o) => (
            <div key={o.start} className="jr-kv"><span>{new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(o.start))}</span><span>{timeLabel(o.start, tz)}{focus ? ` · ${o.left} left` : ""}</span></div>
          ))}
          <span className="ja-small">{v.open.length ? "People can book up to 12 hours ahead." : live.counts.left > 0 ? "Add more times so people can book." : "Every place is booked."}</span>
        </section>
        <section className="ja-card" aria-labelledby="bk-how">
          <h2 id="bk-how" className="ja-h3">After each {focus ? "session" : "call"}</h2>
          <span className="ja-muted">Mark it <b>Happened</b> to approve and pay the participant, or <b>Didn't join</b>. No-shows aren't charged, and their place opens up again. Anything you don't mark counts as attended after 7 days.</span>
        </section>
      </div>
    </div>
  );
}

/** Stage 7: a session that has started — tick who joined (everyone booked starts ticked) and save in one go. */
function Attendance({ live, start, end, tz, people }: { live: LiveView; start: string; end: string; tz: string; people: B[] }) {
  const [off, setOff] = useState<string[]>(people.filter((p) => p.status === "noshow").map((p) => p.bookingId));
  const [save, state] = useSaveAttendanceMutation();
  const [problem, setProblem] = useState("");
  const joined = people.filter((p) => !off.includes(p.bookingId));
  const go = async () => {
    setProblem("");
    try {
      await save({ id: live.surveyId, joined: joined.map((p) => p.bookingId), missed: off }).unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <section className="jr-session" aria-label={`Session at ${timeLabel(start, tz)}`}>
      <span className="ja-mono">{timeLabel(start, tz)}–{timeLabel(end, tz)} · started</span>
      <b style={{ fontFamily: "var(--display)", fontSize: 22, letterSpacing: "-.04em" }}>Who joined?</b>
      <span className="ja-muted">Everyone booked is ticked. Untick anyone who didn't come.</span>
      {people.map((p) => {
        const on = !off.includes(p.bookingId);
        return (
          <div key={p.bookingId} className="jr-who">
            <button type="button" className="jr-cb" role="checkbox" aria-checked={on} aria-label={`${p.code} joined`} disabled={p.status === "happened"} onClick={() => setOff(on ? [...off, p.bookingId] : off.filter((x) => x !== p.bookingId))}>{on ? "✓" : ""}</button>
            <b>{p.code}</b>
            <span style={{ flex: 1 }} className="ja-small">{p.country || "Booked"}</span>
            <span className={`jr-status${p.status === "happened" ? " ok" : ""}`}>{p.status === "happened" ? "paid" : on ? "joined" : "didn't join"}</span>
          </div>
        );
      })}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <div className="ja-row">
        <button type="button" className="jr-btn sun" disabled={state.isLoading} onClick={go}>{state.isLoading ? "Saving…" : `Save: ${joined.length} joined, ${off.length} didn't`}</button>
        <span className="ja-small" style={{ flex: "1 1 240px" }}>Those who joined are paid {formatMoney(live.perPerson, live.money.currency)} each. Those who didn't aren't charged. Unsaved sessions count as attended after 7 days.</span>
      </div>
    </section>
  );
}

function groupBy<T>(items: T[], key: (x: T) => string) {
  const out: Record<string, T[]> = {};
  for (const x of items) (out[key(x)] ||= []).push(x);
  return out;
}

/** `now` is when the bookings were last fetched (every 30 seconds), so "started" stays in step with the list. */
function BookingRow({ b, live, tz, videoMode, onProblem, onMessage, now, nested }: { b: B; live: LiveView; tz: string; videoMode: "one" | "each"; onProblem: (m: string) => void; onMessage: (participantId: string) => void; now: number; nested?: boolean }) {
  const [mark, markState] = useMarkBookingMutation();
  const [setLink, linkState] = useSetBookingLinkMutation();
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(b.videoUrl || "");
  const started = new Date(b.start).getTime() <= now;
  const act = async (as: "happened" | "noshow") => {
    onProblem("");
    try {
      await mark({ id: live.surveyId, bookingId: b.bookingId, as }).unwrap();
    } catch (err) {
      onProblem(readProblem(err).message);
    }
  };
  const saveLink = async () => {
    onProblem("");
    try {
      await setLink({ id: live.surveyId, bookingId: b.bookingId, url }).unwrap();
      setEditing(false);
    } catch (err) {
      onProblem(readProblem(err).message);
    }
  };
  const status = b.status === "happened" ? ["happened", " ok"] : b.status === "noshow" ? ["didn't join", " bad"] : started ? ["to mark", ""] : ["booked", ""];
  const note = videoMode === "each" ? (b.videoUrl ? "Link sent" : b.status === "booked" ? "Needs a meeting link" : "") : "";
  return (
    <div className="jr-booking" style={nested ? { gridColumn: "1 / -1", paddingLeft: 0 } : undefined}>
      <span className="time">{nested ? "" : timeLabel(b.start, tz)}</span>
      <span className="who">
        <b>{b.code}{b.country ? ` · ${b.country}` : ""}</b>
        {note && <span className="ja-small" style={!b.videoUrl ? { color: "#7a1d12" } : undefined}>{note}</span>}
        {editing && (
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }} className="jr-field">
            <label htmlFor={`lk-${b.bookingId}`} className="sr-only">Meeting link for {b.code}</label>
            <input id={`lk-${b.bookingId}`} type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: "1 1 220px", width: "auto" }} />
            <button type="button" className="jr-btn sm ink" onClick={saveLink} disabled={linkState.isLoading}>Send link</button>
          </span>
        )}
      </span>
      <span className="acts">
        <span className={`jr-status${status[1]}`}>{status[0]}</span>
        {b.status === "booked" && !started && videoMode === "each" && !editing && <button type="button" className="jr-btn sm" onClick={() => setEditing(true)}>{b.videoUrl ? "Change link" : "Add link"}</button>}
        {(b.status === "booked" && started) || b.status === "noshow" ? (
          <>
            <button type="button" className="jr-btn sm ink" disabled={markState.isLoading} onClick={() => act("happened")}>{b.status === "noshow" ? "Happened after all" : "Happened"}</button>
            {b.status === "booked" && <button type="button" className="jr-btn sm" disabled={markState.isLoading} onClick={() => act("noshow")}>Didn't join</button>}
          </>
        ) : null}
        <button type="button" className="jr-btn sm" onClick={() => onMessage(b.participantId)}>Message<span className="sr-only"> {b.code}</span></button>
      </span>
    </div>
  );
}
