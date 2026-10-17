import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBookMutation, useCancelBookingMutation, useGetSlotsQuery, type MyBooking } from "@/redux/api/runApi";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { browserZone, byDay, dayLabel, timeLabel } from "@/pages/run/format";
import "@/styles/app.css";
import "@/styles/run.css";

/** Stage 6, participant side: choose an interview time or a focus-group session, in your own time zone. */
export default function BookPage() {
  const { id = "" } = useParams();
  const tz = browserZone();
  const { data, isLoading, isError, error, refetch } = useGetSlotsQuery(id, { refetchOnMountOrArgChange: true });
  const [book, bookState] = useBookMutation();
  const [picked, setPicked] = useState("");
  const [problem, setProblem] = useState("");
  const v = data?.data;
  const word = v?.method === "focus-group" ? "session" : "interview";

  if (isLoading) return <div className="jp" style={{ minHeight: 0, background: "transparent" }}><div className="jr-book"><div className="ja-skeleton" style={{ height: 360 }} aria-busy="true" /></div></div>;
  if (isError || !v) {
    const p = readProblem(error);
    return (
      <div className="jp" style={{ minHeight: 0, background: "transparent" }}>
        <div className="jr-book">
          <Link to="/dashboard/participant/surveys" className="jr-back">← Studies</Link>
          <div className="jp-note bad" role="alert">{p.message || "We couldn't open this study."}</div>
          <div className="jp-actions"><Link to="/dashboard/participant/surveys" className="jp-btn2">Back to studies</Link><button type="button" className="jp-btn2" onClick={() => refetch()}>Try again</button></div>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setProblem("");
    try {
      await book({ id, start: picked, timeZone: tz }).unwrap();
      setPicked("");
    } catch (err) {
      setProblem(readProblem(err).message);
      refetch();
    }
  };
  const days = byDay(v.slots, (s) => s.start, tz);

  return (
    <div className="jp" style={{ minHeight: 0, background: "transparent" }}>
      <div className="jr-book">
        <Link to="/dashboard/participant/surveys" className="jr-back">← Studies</Link>
        <h1 className="jp-h1" style={{ margin: 0 }}>{v.booking ? `Your ${word} is booked` : `Book your ${word}`}</h1>
        <div className="jr-pay">
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontWeight: 600 }}>{v.title}</span>
            <span style={{ fontSize: 14, color: "var(--on-night-2)" }}>{v.minutes} min · video call{v.organization ? ` · ${v.organization}` : ""}{v.verified ? " · ✓ verified" : ""}</span>
          </span>
          <b>{formatMoney(v.perPerson, v.currency)}</b>
        </div>

        {v.booking ? (
          <Booked b={v.booking} tz={tz} studyId={id} />
        ) : (
          <>
            <span className="jp-hint">Times shown in your time zone, {tz.replace(/_/g, " ")}.</span>
            {days.length === 0 ? (
              <div className="jp-note">No times are free right now. The researcher may add more; check back soon.</div>
            ) : (
              <section className="jp-sec" aria-label="Times">
                {days.map((d) => (
                  <div key={d.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <b style={{ fontSize: 15 }}>{d.label}</b>
                    <div className="jr-times" role="group" aria-label={d.label}>
                      {d.items.map((s) => (
                        <button key={s.start} type="button" className="jr-time" aria-pressed={picked === s.start} onClick={() => setPicked(s.start)}>
                          {timeLabel(s.start, tz)}{v.method === "focus-group" ? <span className="sr-only">, {s.left} places left</span> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
            {picked && <p style={{ margin: 0, fontSize: 16 }} aria-live="polite"><b>{dayLabel(picked, tz)} at {timeLabel(picked, tz)}</b></p>}
            <span className="jp-hint">We'll email you the link the day before and an hour before. You can cancel up to 12 hours before.</span>
            {problem && <div className="jp-note bad" role="alert">{problem}</div>}
            <div className="jp-actions"><button type="button" className="jp-btn" disabled={!picked || bookState.isLoading} onClick={submit}>{bookState.isLoading ? "Booking…" : "Book this time"}</button></div>
            <span className="jp-hint">If you can't come, cancel so someone else can take the time. Missing 2 bookings without cancelling pauses bookings for you for a month.</span>
          </>
        )}
      </div>
    </div>
  );
}

function Booked({ b, tz, studyId }: { b: MyBooking; tz: string; studyId: string }) {
  const [cancel, state] = useCancelBookingMutation();
  const [problem, setProblem] = useState("");
  const [sure, setSure] = useState(false);
  const go = async () => {
    setProblem("");
    try {
      await cancel(b.bookingId).unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <section className="jp-sec" aria-label="Your booking" style={{ gap: 12 }}>
      <b style={{ fontSize: 20 }}>{dayLabel(b.start, tz)} at {timeLabel(b.start, tz)}</b>
      <span className="jp-hint" style={{ fontSize: 15 }}>{b.videoUrl ? <>Join here: <a href={b.videoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--ink)", overflowWrap: "anywhere" }}>{b.videoUrl}</a></> : "The researcher will send the meeting link before it starts. We'll email it to you."}</span>
      <span className="jp-hint">We'll remind you by email the day before and an hour before.</span>
      {problem && <div className="jp-note bad" role="alert">{problem}</div>}
      <div className="jp-actions">
        <Link className="jp-btn2" to={`/dashboard/participant/messages?study=${studyId}`}>Message the researcher</Link>
        {b.canChange && !sure && <button type="button" className="jp-btn2" onClick={() => setSure(true)}>Cancel booking</button>}
        {b.canChange && sure && <button type="button" className="jp-btn2" style={{ borderColor: "#7a1d12", color: "#7a1d12" }} disabled={state.isLoading} onClick={go}>{state.isLoading ? "Cancelling…" : "Yes, cancel it"}</button>}
      </div>
      {!b.canChange && <span className="jp-hint">It's less than 12 hours away, so it can't be changed now. If something came up, message the researcher.</span>}
    </section>
  );
}
