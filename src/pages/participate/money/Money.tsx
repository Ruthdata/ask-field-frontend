import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { downloadStatement, useGetMoneyQuery, type MoneyView } from "@/redux/api/moneyApi";
import { DISPLAY } from "../studies/studyText";
import { methodName } from "./methodText";

/** Participant canvas 6.1: the balance in US dollars, where it goes, and the statement. */
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Money() {
  const { data, isLoading, isError, refetch } = useGetMoneyQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: 30000 });
  const m = data?.data;
  const saved = (useLocation().state as { saved?: boolean } | null)?.saved;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">Your money</h1>
      {saved && <div role="status" className="rounded-2xl bg-[#f0fdf4] px-4 py-3 text-[15px] text-[#166534]">Saved. Your cash-outs go there now.</div>}
      {isLoading && <div className="h-72 animate-pulse rounded-[22px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load your money. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {m && <Body m={m} />}
    </div>
  );
}

function Body({ m }: { m: MoneyView }) {
  const [problem, setProblem] = useState("");
  const cur = m.currency;
  const below = m.ready > 0 && m.ready < m.minPayout;
  const can = !!m.method && !m.holdUntil && m.onWay === 0 && m.ready >= m.minPayout;
  const note = !m.method
    ? "Add where to send it first."
    : m.onWay > 0
      ? "Your last cash-out is on its way."
      : m.holdUntil
        ? `Cash-outs are paused until ${new Date(m.holdUntil).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} because your payout method changed.`
        : below
          ? `You can cash out from ${formatMoney(m.minPayout, cur)}. ${formatMoney(m.minPayout - m.ready, cur)} to go.`
          : m.ready > 0
            ? `To your ${methodName(m.method)}`
            : "Nothing ready yet. Approved studies land here.";
  const download = async () => {
    setProblem("");
    try {
      await downloadStatement();
    } catch (err) {
      setProblem((err as Error).message);
    }
  };
  return (
    <>
      <section aria-labelledby="h-ready" className="flex flex-col gap-1.5 rounded-[22px] bg-[#120e22] p-5 text-white">
        <h2 id="h-ready" className="m-0 text-[14px] font-normal text-[#bdb6de]">Ready to cash out</h2>
        <b style={DISPLAY} className="text-[44px] leading-none text-[#f0c93a]">{formatMoney(m.ready, cur)}</b>
        <span className="text-[14px] text-[#bdb6de]">{note}</span>
        {!m.method ? (
          <Link to="/dashboard/participant/earnings/method" className="mt-2.5 flex h-[50px] items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">Add a payout method</Link>
        ) : can ? (
          <Link to="/dashboard/participant/earnings/cash-out" className="mt-2.5 flex h-[50px] items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">Cash out</Link>
        ) : (
          <span aria-disabled="true" className="mt-2.5 flex h-[50px] items-center justify-center rounded-full bg-[#3a3352] font-semibold text-[#8f89aa]">Cash out</span>
        )}
      </section>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1 rounded-2xl border border-[#ebe9f2] bg-white p-3.5">
          <span className="text-[13px] text-[#646080]">Waiting for approval</span>
          <b style={DISPLAY} className="text-[24px]">{formatMoney(m.waiting, cur)}</b>
          {m.waitingCount > 0 ? <Link to="/dashboard/participant/my-studies" className="text-[13px] text-[#120e22]">{m.waitingCount === 1 ? "1 study" : `${m.waitingCount} studies`}</Link> : <span className="text-[13px] text-[#646080]">Nothing waiting</span>}
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-[#ebe9f2] bg-white p-3.5">
          <span className="text-[13px] text-[#646080]">On its way</span>
          <b style={DISPLAY} className="text-[24px]">{formatMoney(m.onWay, cur)}</b>
          <span className="text-[13px] text-[#646080]">{m.onWay > 0 ? "Usually minutes" : "Nothing sending"}</span>
        </div>
      </div>
      <Link to="/dashboard/participant/earnings/method" className="flex items-center justify-between gap-3 rounded-2xl border border-[#ebe9f2] bg-white px-4 py-3.5 text-[#120e22] no-underline">
        <span className="flex flex-col gap-0.5">
          <span className="text-[13px] text-[#646080]">Paid to</span>
          <b className="text-[15px]">{m.method ? `${methodName(m.method)} · ${m.method.accountName}` : "Not set yet"}</b>
        </span>
        <span className="text-[14px] font-semibold">{m.method ? "Change" : "Add"}</span>
      </Link>
      <section aria-labelledby="h-st" className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <h2 id="h-st" className="m-0 text-[17px] font-semibold">Statement</h2>
          {m.lines.length > 0 && <button type="button" onClick={download} className="py-2 text-[14px] text-[#120e22] underline underline-offset-2">Download</button>}
        </div>
        {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2 text-[14px] text-orange-900">{problem}</div>}
        {m.lines.length === 0 && <p className="m-0 py-3 text-[14.5px] text-[#646080]">Nothing yet. Studies you're paid for and your cash-outs show here.</p>}
        {m.lines.map((l) =>
          l.kind === "earning" ? (
            <div key={l.id} className="flex justify-between gap-3 border-b border-[#ebe9f2] py-3">
              <span className="flex flex-col gap-0.5"><span className="text-[15px]">{l.title}</span><span className="text-[13px] text-[#646080]">{day(l.at)} · approved</span></span>
              <b className="whitespace-nowrap text-[15px] text-[#166534]">+{formatMoney(l.amount, l.currency)}</b>
            </div>
          ) : (
            <Link key={l.id} to={`/dashboard/participant/earnings/payouts/${l.id}`} className="flex justify-between gap-3 border-b border-[#ebe9f2] py-3 text-[#120e22] no-underline">
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px]">{l.title}</span>
                <span className={`text-[13px] ${l.status === "failed" ? "text-[#9a3412]" : "text-[#646080]"}`}>
                  {day(l.at)} · {l.status === "failed" ? "returned to your balance" : l.status}{l.localAmount != null && l.localCurrency ? ` · ${formatMoney(l.localAmount, l.localCurrency)}` : ""}
                </span>
              </span>
              <b className={`whitespace-nowrap text-[15px] ${l.status === "failed" ? "text-[#9b97b3] line-through" : ""}`}>−{formatMoney(l.amount, l.currency)}</b>
            </Link>
          )
        )}
      </section>
      <p className="m-0 text-[13.5px] leading-normal text-[#646080]">
        Studies pay in US dollars. You cash out in your own currency, from {formatMoney(m.minPayout, cur)}. joinStudy doesn't charge you to cash out.
      </p>
    </>
  );
}
