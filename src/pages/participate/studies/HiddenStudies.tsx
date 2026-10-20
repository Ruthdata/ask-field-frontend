import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { useGetHiddenStudiesQuery, useUnhideStudyMutation } from "@/redux/api/participantApi";
import { METHOD_LABEL, closesLabel, studyPath } from "./studyText";

/** Participant canvas 3.3: studies they hid, while they're still open, with "Bring back". */
export default function HiddenStudies() {
  const { data, isLoading, isError, refetch } = useGetHiddenStudiesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [unhide, { isLoading: bringing, originalArgs }] = useUnhideStudyMutation();
  const list = data?.data ?? [];
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 text-[#120e22]">
      <Link to="/dashboard/participant" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Home
      </Link>
      <h1 className="m-0 text-[26px] font-bold tracking-tight">Hidden studies</h1>
      <p className="m-0 text-[15px] leading-normal text-[#4b4664]">Studies you hid stay here until they close. Hiding one never counts against you.</p>
      {isLoading && <div className="h-40 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load these. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {!isLoading && !isError && list.length === 0 && <p className="m-0 rounded-[18px] bg-white px-4 py-6 text-center text-[15px] text-[#646080]">Nothing hidden that's still open.</p>}
      {list.map((s) => (
        <article key={s.id} className="flex flex-col gap-2 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
          <div className="flex justify-between gap-3">
            <Link to={studyPath(s.id)} className="text-[16px] font-semibold text-[#120e22]">{s.title}</Link>
            <b className="text-[18px]">{formatMoney(s.pay, s.currency)}</b>
          </div>
          <span className="text-[14px] text-[#646080]">
            {[METHOD_LABEL[s.method], `${s.minutes} min`, s.closesAt ? closesLabel(s.closesAt) : "", s.reasonLabel ? `you said: ${s.reasonLabel.toLowerCase()}` : ""].filter(Boolean).join(" · ")}
          </span>
          <button
            type="button"
            disabled={bringing && originalArgs === s.id}
            onClick={() => unhide(s.id)}
            aria-label={`Bring back: ${s.title}`}
            className="flex h-10 items-center self-start rounded-full border-[1.5px] border-[#120e22] px-4 text-[14.5px] font-semibold"
          >
            Bring back
          </button>
        </article>
      ))}
    </div>
  );
}
