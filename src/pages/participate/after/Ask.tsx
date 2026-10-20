import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { APPEAL_WHYS, useAskAboutDecisionMutation, type AppealWhy } from "@/redux/api/participantApi";
import { DISPLAY } from "../studies/studyText";

/** Participant canvas 5.3: one question about a decision. */
export default function Ask() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [why, setWhy] = useState<AppealWhy | null>(null);
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState("");
  const [ask, { isLoading }] = useAskAboutDecisionMutation();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!why) return setProblem("Choose why you think it should be approved.");
    if (message.trim().length < 20) return setProblem("Say a little more (at least 20 characters), so the researcher can check.");
    try {
      await ask({ id, why, message: message.trim() }).unwrap();
      navigate(`/dashboard/participant/my-studies/${id}`, { replace: true });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <form onSubmit={submit} noValidate className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to={`/dashboard/participant/my-studies/${id}`} className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back
      </Link>
      <h1 style={DISPLAY} className="m-0 text-[26px] font-bold leading-[1.05] tracking-tight">Why do you think it should be approved?</h1>
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 text-[15px] font-semibold">Choose one</legend>
        {APPEAL_WHYS.map((w) => (
          <label key={w.value} className={`flex min-h-[50px] items-center gap-3 rounded-[14px] border-[1.5px] bg-white px-3.5 text-[15px] ${why === w.value ? "border-[#120e22]" : "border-[#ebe9f2]"}`}>
            <input type="radio" name="why" checked={why === w.value} onChange={() => setWhy(w.value)} className="h-5 w-5 accent-[#120e22]" />
            {w.label}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-2 text-[15px] font-semibold">
        Tell the researcher what happened
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} className="min-h-[120px] rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3.5 py-3 text-[15px] font-normal leading-normal" />
        <span className="text-[13.5px] font-normal text-[#646080]">Be specific; it helps them check. Keep your phone number and email out of it.</span>
      </label>
      {problem && <div role="alert" className="rounded-xl bg-[#fff4ed] px-3.5 py-3 text-[14.5px] text-[#7c2d12]">{problem}</div>}
      <button type="submit" disabled={isLoading} className="h-[52px] rounded-full bg-[#120e22] font-semibold text-white disabled:opacity-60">{isLoading ? "Sending…" : "Send to the researcher"}</button>
      <span className="text-center text-[13.5px] leading-snug text-[#646080]">One question per study. They have 7 days to answer. If they don't, you can ask joinStudy to look.</span>
    </form>
  );
}
