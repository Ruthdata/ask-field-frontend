import { Link } from "react-router-dom";
import { useGetVerificationQuery } from "@/redux/api/participantApi";
import { formatMoney } from "@/lib/study";

/**
 * Participant Stage 1: the prompt to verify, shown only once a study they qualify for is open
 * (so we never ask, or pay, before there's a study for them). Also explains a review or a block.
 */
export default function VerifyBanner() {
  const { data } = useGetVerificationQuery(undefined, { refetchOnMountOrArgChange: 60 });
  const v = data?.data;
  if (!v || !v.required || v.status === "verified") return null;
  const box = "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-4 text-[15px] leading-snug";

  if (v.status === "review" || v.status === "checking") {
    return (
      <div role="status" className={`${box} bg-gray-100 text-gray-900`}>
        <span>We're checking your selfie. You can take studies once that's done, usually within 24 hours.</span>
      </div>
    );
  }
  if (v.status === "duplicate" || v.status === "rejected") {
    return (
      <div role="alert" className={`${box} bg-orange-50 text-orange-900`}>
        <span>{v.status === "duplicate" ? "This account matches another joinStudy account, so it can't take studies. Please sign in to that one." : "This account can't take studies. Email hello@joinstudy.io if you think that's a mistake."}</span>
      </div>
    );
  }
  const q = v.qualifying;
  if (q.count < 1) return null;
  const pay = q.maxPay > 0 ? (q.minPay === q.maxPay ? ` paying ${formatMoney(q.maxPay, q.currency)}` : `, paying ${formatMoney(q.minPay, q.currency)} to ${formatMoney(q.maxPay, q.currency)}`) : "";
  return (
    <div className={`${box} bg-yellow-50 border border-yellow-300 text-gray-900`}>
      <span>
        <b>You qualify for {q.count === 1 ? "1 study" : `${q.count} studies`}</b>
        {pay}. Get verified once to start: a WhatsApp code and a quick selfie.
      </span>
      <Link to="/participate/verify" className="inline-flex h-11 items-center rounded-full bg-gray-900 px-5 font-semibold text-white no-underline">
        Get verified
      </Link>
    </div>
  );
}
