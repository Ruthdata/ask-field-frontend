import { Link } from "react-router-dom";
import { useGetMyBookingsQuery } from "@/redux/api/runApi";
import { browserZone, dayLabel, timeLabel } from "@/pages/run/format";
import "@/styles/app.css";
import "@/styles/run.css";

/** Stage 6: upcoming interviews and sessions, at the top of the participant dashboard. Hidden when there are none. */
export default function MyBookings() {
  const { data } = useGetMyBookingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const list = data?.data || [];
  if (!list.length) return null;
  const tz = browserZone();
  return (
    <div className="jp" style={{ minHeight: 0, background: "transparent", marginBottom: 20 }}>
      <section className="jp-sec" aria-labelledby="mb-t" style={{ gap: 12 }}>
        <h2 id="mb-t">Your bookings</h2>
        {list.map((b) => (
          <div key={b.bookingId} className="jr-kv" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><b>{b.title}</b><span className="jp-hint">{dayLabel(b.start, tz)} at {timeLabel(b.start, tz)}</span></span>
            <Link to={`/dashboard/participant/studies/${b.surveyId}/book`} className="jp-btn2 sm" style={{ fontFamily: "var(--body)" }}>Details</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
