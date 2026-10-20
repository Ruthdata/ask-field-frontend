import { Link, useParams } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { useGetPayoutQuery } from "@/redux/api/moneyApi";
import { DISPLAY } from "../studies/studyText";
import { methodName } from "./methodText";

/** Participant canvas 6.4: requested → sent by our payout partner → arrived, or returned to the balance. */
const time = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function PayoutStatus() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useGetPayoutQuery(id, { pollingInterval: 15000, refetchOnMountOrArgChange: true });
  const p = data?.data;
  const local = p && p.localAmount != null && p.localCurrency ? formatMoney(p.localAmount, p.localCurrency) : p ? formatMoney(p.amount, p.currency) : "";
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to="/dashboard/participant/earnings" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Your money
      </Link>
      {isLoading && <div className="h-72 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't find this cash-out.</div>}
      {p && (
        <div role="status" aria-live="polite" className="flex flex-col gap-4">
          <div aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full ${p.status === "failed" ? "bg-[#fff4ed]" : "bg-[#120e22]"}`}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={p.status === "failed" ? "#c2410c" : "#f0c93a"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d={p.status === "failed" ? "M12 7v6M12 16.5v.5" : p.status === "sent" ? "M5 12.5l4.5 4.5L19 7.5" : "M12 6v6l4 2"} />
            </svg>
          </div>
          <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-[1.05] tracking-tight">
            {p.status === "failed" ? "It didn't go through" : p.status === "sent" ? `${local} sent` : `${local} is on its way`}
          </h1>
          <p className="m-0 text-[15.5px] leading-relaxed text-[#4b4664]">
            {p.status === "failed"
              ? `${p.reason || "It was turned down."} ${formatMoney(p.amount, p.currency)} is back in your balance. Check your payout method, then cash out again.`
              : p.status === "sent"
                ? "It should show in your account now. If it doesn't within a day, contact us with the reference."
                : "Most cash-outs arrive in minutes; some take up to a day. We'll email you when it's sent."}
          </p>
          <ol aria-label="Progress" className="m-0 flex list-none flex-col gap-3 rounded-[18px] border border-[#ebe9f2] bg-white p-4 text-[15px]">
            <Step on label="Requested" when={time(p.requestedAt)} />
            <Step on={p.status !== "sending"} label="Sent by our payout partner" when={p.status === "sending" ? "Usually minutes" : time(p.sentAt || p.failedAt || p.requestedAt)} />
            <Step on={p.status !== "sending"} bad={p.status === "failed"} label={p.status === "failed" ? "Returned to your balance" : "Arrived"} when={p.failedAt ? time(p.failedAt) : p.sentAt ? time(p.sentAt) : ""} />
          </ol>
          <span className="text-[13.5px] text-[#646080]">Reference {p.reference} · {methodName({ method: p.to.method, institution: p.to.institution, last4: p.to.last4 })}</span>
          <Link to="/dashboard/participant/earnings" className="flex h-12 items-center justify-center rounded-full border-[1.5px] border-[#ebe9f2] bg-white text-[15px] text-[#120e22] no-underline">Back to your money</Link>
        </div>
      )}
    </div>
  );
}

function Step({ on, bad, label, when }: { on: boolean; bad?: boolean; label: string; when: string }) {
  return (
    <li className={`flex items-center gap-3 ${on ? "" : "text-[#9b97b3]"}`}>
      <span aria-hidden="true" className={`h-[22px] w-[22px] flex-none rounded-full border-[1.5px] ${bad ? "border-[#c2410c] bg-[#c2410c]" : on ? "border-[#f0c93a] bg-[#f0c93a]" : "border-[#bdb6de] bg-white"}`} />
      <span className="flex flex-col"><span>{label}{on ? "" : " (not yet)"}</span>{when && <span className="text-[13px] text-[#646080]">{when}</span>}</span>
    </li>
  );
}
