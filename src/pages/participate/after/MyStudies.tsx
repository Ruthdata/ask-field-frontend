import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { useGetMyStudiesQuery, type MyBucket, type MyStudyRow } from "@/redux/api/participantApi";
import { DISPLAY, heldLabel } from "../studies/studyText";

/** Participant canvas 5.1: every study they started, with its status and money. */
type Show = "all" | MyBucket;
const TABS: [Show, string][] = [["all", "All"], ["in-progress", "In progress"], ["waiting", "Waiting"], ["paid", "Paid"], ["not-approved", "Not approved"], ["ended", "Ended"]];
const CHIP: Record<MyBucket, [string, string, string]> = {
  "in-progress": ["In progress", "bg-[#120e22]", "text-[#f0c93a]"],
  waiting: ["Waiting for approval", "bg-[#fff8dc]", "text-[#7a5b00]"],
  paid: ["Paid", "bg-[#dcfce7]", "text-[#166534]"],
  "not-approved": ["Not approved", "bg-[#fff4ed]", "text-[#9a3412]"],
  ended: ["Ended", "bg-[#f6f5fa]", "text-[#4b4664]"],
};
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function MyStudies() {
  const { data, isLoading, isError, refetch } = useGetMyStudiesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [show, setShow] = useState<Show>("all");
  const [now] = useState(() => Date.now());
  const rows = (data?.data.rows ?? []).filter((r) => show === "all" || r.bucket === show);
  const counts = data?.data.counts ?? {};
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">My studies</h1>
      <div role="group" aria-label="Show" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={show === k} onClick={() => setShow(k)}
            className={`h-[38px] flex-none rounded-full border-[1.5px] px-3.5 text-[14px] ${show === k ? "border-[#120e22] bg-[#120e22] text-white" : "border-[#ebe9f2] bg-white"}`}>
            {label}{counts[k] ? ` ${counts[k]}` : ""}
          </button>
        ))}
      </div>
      {isLoading && <div className="h-60 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load your studies. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {data && rows.length === 0 && (
        <p className="m-0 rounded-[18px] bg-white px-4 py-6 text-center text-[15px] text-[#4b4664]">
          {show === "all" ? <>No studies yet. <Link to="/dashboard/participant" className="font-semibold text-[#120e22]">See studies that fit you</Link></> : "Nothing here."}
        </p>
      )}
      {rows.map((r) => <Row key={r.surveyId} r={r} now={now} />)}
      {data && rows.length > 0 && <p className="m-0 text-[13.5px] leading-normal text-[#646080]">Amounts are what you're paid for each study. Studies you left or ran out of time on are under “Ended”.</p>}
    </div>
  );
}

function noteOf(r: MyStudyRow, now: number) {
  switch (r.bucket) {
    case "in-progress":
      if (r.bookedFor) return `Booked for ${new Date(r.bookedFor).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
      return r.heldUntil ? `Place held for ${heldLabel(Math.max(1, Math.ceil((new Date(r.heldUntil).getTime() - now) / 60000)))} more` : `Started ${day(r.startedAt)}`;
    case "waiting":
      return r.autoApproveAt ? `Approved automatically on ${day(r.autoApproveAt)} if the researcher doesn't decide first` : "With the researcher";
    case "paid":
      return `${r.decidedAt ? day(r.decidedAt) : ""}${r.changed ? " · approved after your question" : " · in your balance"}`;
    case "not-approved":
      if (r.appeal === "open") return "Your question is with the researcher";
      if (r.appeal === "escalated") return "joinStudy is looking at it";
      if (r.appeal === "kept") return "The researcher kept their decision";
      if (r.appeal === "upheld") return "joinStudy kept the decision";
      return r.askUntil ? `See why, and ask about it until ${day(r.askUntil)}` : "See why";
    case "ended":
      return r.status === "no-show" ? "Missed the booking" : `${r.status === "left" ? "You left" : "Time ran out"} · not counted against you`;
  }
}

function Row({ r, now }: { r: MyStudyRow; now: number }) {
  const [label, bg, fg] = CHIP[r.bucket];
  const to = r.bucket === "in-progress" ? `/dashboard/participant/studies/${r.surveyId}` : `/dashboard/participant/my-studies/${r.surveyId}`;
  const money = r.bucket === "ended" ? "—" : r.bucket === "not-approved" ? formatMoney(0, r.currency) : formatMoney(r.amount, r.currency);
  return (
    <Link to={to} className="flex flex-col gap-2 rounded-[18px] border border-[#ebe9f2] bg-white p-4 text-[#120e22] no-underline">
      <span className="flex items-start justify-between gap-3">
        <b className="text-[16px] leading-snug">{r.title}</b>
        <b style={DISPLAY} className={`flex-none text-[19px] ${r.bucket === "paid" ? "text-[#166534]" : r.bucket === "waiting" ? "" : "text-[#646080]"}`}>{money}</b>
      </span>
      <span className="flex flex-wrap items-center gap-2 text-[14px] text-[#4b4664]">
        <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${bg} ${fg}`}>{r.bucket === "ended" ? (r.status === "left" ? "Left" : r.status === "no-show" ? "Missed" : "Time ran out") : label}</span>
        {noteOf(r, now)}
      </span>
    </Link>
  );
}
