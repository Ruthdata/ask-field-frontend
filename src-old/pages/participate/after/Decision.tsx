import { Link, useParams } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { useEscalateDecisionMutation, useGetMyDecisionQuery, type MyDecision } from "@/redux/api/participantApi";
import { DISPLAY, METHOD_LABEL } from "../studies/studyText";
import { ReportLink } from "../account/ui";

/** Participant canvas 5.2: a decision, its reason, the question and answer, and what happens next. */
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Decision() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetMyDecisionQuery(id, { refetchOnMountOrArgChange: true });
  const d = data?.data;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to="/dashboard/participant/my-studies" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        My studies
      </Link>
      {isLoading && <div className="h-80 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" />}
      {isError && (
        <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">
          {(error as { status?: number })?.status === 404 ? "This study isn't in your list." : <>We couldn't load this. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></>}
        </div>
      )}
      {d && <Body d={d} />}
      {d && <ReportLink id={id} />}
    </div>
  );
}

function Body({ d }: { d: MyDecision }) {
  const [escalate, esc] = useEscalateDecisionMutation();
  const ap = d.appeal;
  const changed = d.status === "approved" && (ap?.status === "approved" || ap?.status === "overturned");
  const rejected = d.status === "rejected";
  const who = [d.researcher.name, d.researcher.organization].filter(Boolean).join(", ");
  const headline = changed
    ? `Approved after all: ${formatMoney(d.amount, d.currency)} is in your balance`
    : d.status === "approved"
      ? `Approved: ${formatMoney(d.amount, d.currency)} is in your balance`
      : d.status === "submitted"
        ? `Waiting for approval: ${formatMoney(d.amount, d.currency)}`
        : !rejected
          ? "This study has ended"
          : ap?.status === "open"
            ? "Not approved · your question is with the researcher"
            : ap?.status === "escalated"
              ? "Not approved · joinStudy is looking at it"
              : ap?.status === "upheld"
                ? "Not approved · joinStudy kept the decision"
                : ap?.status === "kept"
                  ? "Not approved · the researcher kept their decision"
                  : "Not approved, so this study isn't paid";
  const body = changed
    ? ap?.status === "overturned"
      ? "joinStudy looked at it and found the work was done as the study asked. It no longer counts as not approved."
      : "The researcher changed their decision after your question. It no longer counts as not approved."
    : d.status === "submitted"
      ? d.autoApproveAt ? `The researcher checks it first. If they haven't decided by ${day(d.autoApproveAt)}, it's approved automatically.` : "The researcher checks it first."
      : !rejected
        ? d.status === "approved" ? "Thanks for taking part." : "You weren't paid for it, and it doesn't count against you."
        : ap?.status === "open"
          ? `They have until ${ap.answerBy ? day(ap.answerBy) : "7 days after you asked"} to answer: change the decision, or explain why it stands. We'll email you either way.`
          : ap?.status === "escalated"
            ? "Someone at joinStudy reads your question, the researcher's reason and the study's rules, and decides within 5 working days. We'll email you."
            : ap?.status === "upheld"
              ? "This is final. It doesn't stop you taking other studies."
              : d.canEscalate
                ? ap?.status === "kept" ? "If you still think it's wrong, you can ask joinStudy to look at it." : "It's been 7 days since you asked and they haven't answered. You can ask joinStudy to look at it."
                : d.canAsk ? "If you think this is a mistake, ask about it. The researcher can change their decision." : "It's more than 14 days since the decision, so it can't be asked about now.";
  const ok = d.status === "approved";
  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[12.5px] text-[#646080]">{METHOD_LABEL[d.method] ?? "Study"}{who ? ` · ${who}` : ""} · you were {d.code}</span>
        <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">{d.title}</h1>
      </div>
      <section className={`flex flex-col gap-2.5 rounded-[20px] border-[1.5px] p-[18px] ${ok ? "border-[#86efac] bg-[#f0fdf4]" : "border-[#bdb6de] bg-white"}`}>
        <h2 className="m-0 text-[18px] font-semibold">{headline}</h2>
        {d.reason && (rejected || changed) && (
          <span className="text-[15px] leading-normal text-[#4b4664]">The researcher's reason: <b className="text-[#120e22]">{d.reason.text}.</b></span>
        )}
        {d.note && (rejected || changed) && (
          <blockquote className="m-0 rounded-r-[10px] border-l-[3px] border-[#bdb6de] bg-[#f6f5fa] px-3.5 py-2.5 text-[14.5px] leading-normal text-[#4b4664]">“{d.note}”{d.decidedAt ? ` · ${day(d.decidedAt)}` : ""}</blockquote>
        )}
        <span className="text-[14.5px] leading-normal text-[#4b4664]">{body}</span>
      </section>
      {ap && (
        <section aria-label="Your question" className="flex flex-col gap-2.5">
          <div className="max-w-[85%] self-end rounded-[16px_16px_4px_16px] bg-[#120e22] px-3.5 py-3 text-[14.5px] leading-snug text-white">
            <b className="mb-1 block text-[12.5px] text-[#f0c93a]">Question about the decision · {ap.whyLabel}</b>
            {ap.message}
            <span className="mt-1.5 block text-[12px] text-[#bdb6de]">You · {day(ap.askedAt)}</span>
          </div>
          {ap.answer && (
            <div className="max-w-[85%] self-start rounded-[16px_16px_16px_4px] border border-[#ebe9f2] bg-white px-3.5 py-3 text-[14.5px] leading-snug">
              {ap.answer}
              <span className="mt-1.5 block text-[12px] text-[#646080]">{d.researcher.name || "The researcher"}{ap.answeredAt ? ` · ${day(ap.answeredAt)}` : ""}</span>
            </div>
          )}
          {ap.resolution && (
            <div className="max-w-[85%] self-start rounded-[16px_16px_16px_4px] border-[1.5px] border-[#120e22] bg-white px-3.5 py-3 text-[14.5px] leading-snug">
              {ap.resolution}
              <span className="mt-1.5 block text-[12px] text-[#646080]">joinStudy{ap.resolvedAt ? ` · ${day(ap.resolvedAt)}` : ""}</span>
            </div>
          )}
        </section>
      )}
      {d.canAsk && (
        <>
          <Link to={`/dashboard/participant/my-studies/${d.surveyId}/ask`} className="flex h-[52px] items-center justify-center rounded-full bg-[#120e22] font-semibold text-white no-underline">Ask about this decision</Link>
          {d.askUntil && <span className="text-center text-[13.5px] text-[#646080]">You can ask until {day(d.askUntil)} (14 days after the decision).</span>}
        </>
      )}
      {d.canEscalate && (
        <>
          {esc.error && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2.5 text-[14.5px] text-orange-900">{readProblem(esc.error).message}</div>}
          <button type="button" onClick={() => escalate(d.surveyId)} disabled={esc.isLoading} className="h-[52px] rounded-full bg-[#120e22] font-semibold text-white disabled:opacity-60">
            {esc.isLoading ? "Sending…" : "Ask joinStudy to look at it"}
          </button>
          <span className="text-center text-[13.5px] leading-snug text-[#646080]">Someone at joinStudy reads your question, the researcher's reason and the study's rules, and decides within 5 working days. Their decision is final.</span>
        </>
      )}
      {rejected && (
        <section aria-labelledby="h-means" className="flex flex-col gap-2 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
          <h2 id="h-means" className="m-0 text-[16px] font-semibold">What this means for you</h2>
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[14.5px] leading-snug text-[#4b4664]">
            <li>This study isn't paid{ap?.status === "upheld" ? "" : ", unless the decision changes"}.</li>
            <li>You can keep taking other studies. One “not approved” doesn't stop you.</li>
            <li>Researchers see if someone has had 2 or more not approved in the last 90 days, as a reason to look closely. Decisions that are changed don't count.</li>
          </ul>
        </section>
      )}
      <Link to={`/dashboard/participant/messages?study=${d.surveyId}`} className="self-center p-2.5 text-[14.5px] text-[#120e22]">See the whole conversation</Link>
    </>
  );
}
