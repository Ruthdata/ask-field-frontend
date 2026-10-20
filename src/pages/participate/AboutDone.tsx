import { Link } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";
import { formatMoney } from "@/lib/study";
import { useGetVerificationQuery } from "@/redux/api/participantApi";

/** Participant canvas 2.4: the payoff straight away. Studies that fit them now, or an honest "none yet". */
export default function AboutDone() {
  const { data, isLoading } = useGetVerificationQuery(undefined, { refetchOnMountOrArgChange: true });
  const v = data?.data;
  if (isLoading || !v) {
    return (
      <CardPage>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} role="status"><span className="spin" aria-hidden="true" /><span>Finding studies for you…</span></div>
      </CardPage>
    );
  }
  const q = v.qualifying;
  const verified = !v.required || v.status === "verified";
  if (q.count > 0) {
    const pay = q.minPay === q.maxPay ? formatMoney(q.maxPay, q.currency) : `${formatMoney(q.minPay, q.currency)} to ${formatMoney(q.maxPay, q.currency)}`;
    return (
      <CardPage>
        <div className="icon done" aria-hidden="true" style={{ color: "#f0c93a", fontFamily: "var(--display)", fontWeight: 700, fontSize: 28 }}>{q.count}</div>
        <div style={{ display: "grid", gap: 10 }}>
          <h1>You qualify for {q.count === 1 ? "1 study" : `${q.count} studies`} right now</h1>
          <p className="lede">Paying {pay}.{verified ? "" : " One quick step first: get verified, once."}</p>
        </div>
        <Link className="btn btn-sun btn-block" to={verified ? "/dashboard/participant" : "/participate/verify"}>{verified ? "See your studies" : "Get verified and start"}</Link>
        <Link to="/dashboard/participant" style={{ textAlign: "center", fontSize: 15, color: "var(--ink-2)" }}>Later</Link>
      </CardPage>
    );
  }
  return (
    <CardPage>
      <div className="icon done" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f0c93a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <h1>You're all set</h1>
        <p className="lede">No open study fits you right now. New ones open every week; we'll email you when one does{verified ? "" : ", and you'll get verified then"}.</p>
      </div>
      <Link className="btn btn-sun btn-block" to="/dashboard/participant">Go to home</Link>
    </CardPage>
  );
}
