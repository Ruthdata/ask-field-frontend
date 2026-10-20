import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { useCashOutMutation, useGetMoneyQuery, useQuotePayoutMutation, type Quote } from "@/redux/api/moneyApi";
import { DISPLAY } from "../studies/studyText";
import { methodName } from "./methodText";

/** Participant canvas 6.3: how much, then the exact local amount and rate before confirming. */
export default function CashOut() {
  const { data } = useGetMoneyQuery();
  const m = data?.data;
  const navigate = useNavigate();
  const [all, setAll] = useState(true);
  const [some, setSome] = useState("");
  const [q, setQ] = useState<Quote | null>(null);
  const [problem, setProblem] = useState("");
  const [quote, quoting] = useQuotePayoutMutation();
  const [cashOut, sending] = useCashOutMutation();
  const cap = m?.method?.method === "airtime" ? Math.min(m.ready, m.airtimeMax) : m?.ready ?? 0;

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem("");
    const amount = all ? undefined : Number(some);
    if (!all && !(amount && amount > 0)) return setProblem("Enter an amount in US dollars.");
    try {
      setQ((await quote({ amount }).unwrap()).data);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const confirm = async () => {
    if (!q) return;
    setProblem("");
    try {
      const r = (await cashOut({ quoteId: q.quoteId }).unwrap()).data;
      navigate(`/dashboard/participant/earnings/payouts/${r.id}`, { replace: true });
    } catch (err) {
      const p = readProblem(err);
      if (p.code === "quote_expired") setQ(null);
      setProblem(p.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to="/dashboard/participant/earnings" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Your money
      </Link>
      {!q ? (
        <form onSubmit={ask} noValidate className="flex flex-col gap-4">
          <h1 style={DISPLAY} className="m-0 text-[26px] font-bold leading-[1.05] tracking-tight">How much?</h1>
          <fieldset className="m-0 flex gap-2 border-0 p-0">
            <legend className="sr-only">Amount</legend>
            <label className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] bg-white font-semibold ${all ? "border-[#120e22]" : "border-[#ebe9f2]"}`}>
              <input type="radio" name="amt" checked={all} onChange={() => setAll(true)} className="sr-only" />
              {m ? `All: ${formatMoney(cap, m.currency)}` : "All"}
            </label>
            <label className={`flex h-12 flex-1 items-center justify-center rounded-[14px] border-[1.5px] bg-white ${!all ? "border-[#120e22] font-semibold" : "border-[#ebe9f2]"}`}>
              <input type="radio" name="amt" checked={!all} onChange={() => setAll(false)} className="sr-only" />
              Some of it
            </label>
          </fieldset>
          {!all && (
            <label className="flex flex-col gap-2 text-[15px] font-semibold">
              Amount in US dollars
              <input value={some} onChange={(e) => setSome(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder={m ? String(m.minPayout) : "5"} className="h-[52px] rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3.5 text-[18px]" />
              {m && <span className="text-[13.5px] font-normal text-[#646080]">From {formatMoney(m.minPayout, m.currency)} up to {formatMoney(cap, m.currency)}.</span>}
            </label>
          )}
          {problem && <div role="alert" className="rounded-[14px] bg-[#fff4ed] px-3.5 py-3 text-[14.5px] text-[#7c2d12]">{problem}</div>}
          <button type="submit" disabled={quoting.isLoading} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-60">{quoting.isLoading ? "Getting today's rate…" : "Continue"}</button>
          <span className="text-[13.5px] text-[#646080]">Today's rate from our payout partner. You see the exact amount before you confirm.</span>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <h1 style={DISPLAY} className="m-0 text-[26px] font-bold leading-[1.05] tracking-tight">Check and confirm</h1>
          <dl className="m-0 flex flex-col rounded-[20px] border border-[#ebe9f2] bg-white px-[18px] py-2">
            <Row k="From your balance" v={formatMoney(q.amount, q.currency)} />
            {q.localCurrency !== q.currency && <Row k="Rate" v={`$1 = ${formatMoney(q.rate, q.localCurrency)}`} />}
            <Row k="joinStudy fee" v="None" />
            <div className="flex items-baseline justify-between pt-3">
              <dt className="text-[15px] text-[#646080]">You receive</dt>
              <dd style={DISPLAY} className="m-0 text-[30px] font-bold">{formatMoney(q.localAmount, q.localCurrency)}</dd>
            </div>
            <span className="pb-2 text-[13px] text-[#646080]">To {methodName(q.to)} · {q.to.accountName}</span>
          </dl>
          <span className="text-[13.5px] leading-snug text-[#646080]">This rate is held for 10 minutes. Your bank or network may charge its own fee; most don't for money coming in.</span>
          {problem && <div role="alert" className="rounded-[14px] bg-[#fff4ed] px-3.5 py-3 text-[14.5px] text-[#7c2d12]">{problem}</div>}
          <button type="button" onClick={confirm} disabled={sending.isLoading} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-60">
            {sending.isLoading ? "Sending…" : `Send ${formatMoney(q.localAmount, q.localCurrency)}`}
          </button>
          <button type="button" onClick={() => setQ(null)} className="h-11 text-[15px]">Change the amount</button>
        </div>
      )}
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between border-b border-[#ebe9f2] py-2.5 text-[15px]">
    <dt className="text-[#646080]">{k}</dt>
    <dd className="m-0">{v}</dd>
  </div>
);
