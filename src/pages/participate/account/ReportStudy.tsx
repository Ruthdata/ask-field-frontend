import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { useGetReportFormQuery, useReportStudyMutation, type ReportReason } from "@/redux/api/participantAccountApi";
import { DISPLAY, studyPath } from "../studies/studyText";
import { Back, BTN_DARK, BTN_LINE, Problem } from "./ui";

/** Participant canvas 7.4: report a study. The researcher isn't told who. */
export default function ReportStudy() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useGetReportFormQuery(id, { refetchOnMountOrArgChange: true });
  const f = data?.data;
  const [reason, setReason] = useState<ReportReason | "">("");
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState("");
  const [sent, setSent] = useState<{ reference: string; safety: boolean } | null>(null);
  const [send, { isLoading: sending }] = useReportStudyMutation();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!reason) return setProblem("Choose what's wrong.");
    if (reason === "other" && message.trim().length < 10) return setProblem("Tell us what's wrong, in a sentence or two.");
    try {
      const r = (await send({ id, reason, message: message.trim() || undefined }).unwrap()).data;
      setSent({ reference: r.reference, safety: r.safety });
      window.scrollTo(0, 0);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-[#120e22]">
      <Back to={studyPath(id)}>Back to the study</Back>
      {isLoading && <div className="h-80 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't find this study. <Link to="/dashboard/participant/help" className="font-semibold">Contact us instead</Link></div>}
      {f && sent && (
        <div role="status" className="flex flex-col gap-3.5">
          <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">Thanks, we've got it</h1>
          <p className="m-0 text-[15.5px] leading-relaxed text-[#4b4664]">
            Reference <b className="font-mono text-[#120e22]">{sent.reference}</b>. Someone at joinStudy looks at every report within 1 working day. When several people report the same study, it's paused straight away while we check.
          </p>
          {sent.safety && (
            <div className="rounded-2xl bg-[#fff4ed] px-4 py-3.5 text-[14.5px] leading-normal text-[#7c2d12]">
              <b>If you shared bank details:</b> call your bank now and ask them to watch your account. joinStudy will never ask for a PIN, password, BVN or OTP.
            </div>
          )}
          <Link to="/dashboard/participant" className={BTN_LINE}>Back to studies</Link>
        </div>
      )}
      {f && !sent && (
        <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
          <h1 style={DISPLAY} className="m-0 text-[26px] font-bold leading-[1.05] tracking-tight">What's wrong with “{f.title}”?</h1>
          {f.already && <div className="rounded-[14px] bg-[#f6f5fa] px-3.5 py-3 text-[14px] text-[#4b4664]">You reported this study already ({f.already.reference}). Sending again updates your report.</div>}
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="sr-only">What's wrong</legend>
            {f.reasons.map((r) => (
              <label key={r.value} className={`flex min-h-12 items-center gap-3 rounded-[14px] border-[1.5px] bg-white px-3.5 py-2.5 text-[15px] ${reason === r.value ? "border-[#120e22]" : "border-[#ebe9f2]"}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => { setReason(r.value); setProblem(""); }} className="h-5 w-5 flex-none accent-[#120e22]" />
                {r.label}
              </label>
            ))}
          </fieldset>
          <label htmlFor="rp-msg" className="text-[14.5px] font-semibold">What happened {reason === "other" ? "" : <span className="font-normal text-[#646080]">(optional)</span>}</label>
          <textarea id="rp-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="For example: page 3 asked for my bank account number." className="min-h-[96px] rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3.5 py-3 text-[16px] leading-normal placeholder:text-[#9a94b5]" />
          <Problem text={problem} />
          <button type="submit" disabled={sending} className={BTN_DARK}>{sending ? "Sending…" : "Send report"}</button>
          <span className="text-[13.5px] leading-snug text-[#646080]">The researcher isn't told who reported it. Never share a PIN, password or OTP in any study.</span>
        </form>
      )}
    </div>
  );
}
