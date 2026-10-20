import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { useFinishStudyMutation, useGetParticipantStudyQuery, type FinishResult } from "@/redux/api/participantApi";
import { ThankYou } from "./takePart";
import { DISPLAY } from "./studyText";

/** Participant canvas 4.2: finished, but the survey didn't send them back. Type the code from its last page. */
export default function FinishCode() {
  const { id = "" } = useParams();
  const { data } = useGetParticipantStudyQuery(id);
  const s = data?.data;
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState("");
  const [done, setDone] = useState<FinishResult | null>(null);
  const [finish, { isLoading }] = useFinishStudyMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!code.trim()) return setProblem("Type the code from the last page of the survey.");
    try {
      setDone((await finish({ id, code }).unwrap()).data);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };

  if (done) return <div className="mx-auto max-w-2xl"><ThankYou outcome={done.outcome} amount={done.amount} currency={done.currency} /></div>;

  return (
    <form onSubmit={submit} noValidate className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to={`/dashboard/participant/studies/${id}`} className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to the study
      </Link>
      <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">Finished, but not sent back?</h1>
      <p className="m-0 text-[15px] leading-normal text-[#4b4664]">
        The last page of {s ? `“${s.title}”` : "the survey"} shows a finish code. Type it here and we'll count your answers.
      </p>
      <label className="flex flex-col gap-2 text-[15px] font-semibold">
        Finish code
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          aria-invalid={!!problem}
          aria-describedby={problem ? "fc-err" : undefined}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          placeholder="7KQ2-XM"
          className={`h-14 rounded-[14px] border-[1.5px] bg-white px-4 font-mono text-[22px] uppercase tracking-[0.12em] text-[#120e22] placeholder:text-[#bdb6de] ${problem ? "border-[#c2410c]" : "border-[#120e22]"}`}
        />
      </label>
      {problem && <div id="fc-err" role="alert" className="rounded-xl bg-[#fff4ed] px-3.5 py-3 text-[14.5px] leading-snug text-[#7c2d12]">{problem}</div>}
      <button type="submit" disabled={isLoading} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-60">
        {isLoading ? "Checking…" : "Count my answers"}
      </button>
      <p className="m-0 text-[14px] leading-normal text-[#646080]">
        No code on the last page? <Link to="/dashboard/participant/messages" className="text-[#120e22]">Message the researcher</Link>. They can see you took part and count it.
      </p>
    </form>
  );
}
