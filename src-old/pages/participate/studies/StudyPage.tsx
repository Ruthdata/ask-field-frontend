import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { useGetParticipantStudyQuery, useUnhideStudyMutation, type StudyDetail } from "@/redux/api/participantApi";
import { useLazyCheckSurveyEligibilityQuery } from "@/redux/api/slices/userSlice";
import { useScreenForStudyMutation, useStudyStartLinkMutation } from "@/redux/api/planApi";
import { DeclineSheet } from "./parts";
import { ReportLink } from "../account/ui";
import { Held, LeaveSheet } from "./takePart";
import { DEVICE_LABEL, DISPLAY, METHOD_LABEL, closesLabel } from "./studyText";

type ScreenQuestion = { text: string; answers: string[] };

/** Participant canvas 3.2: a page per study, with one clear next step. */
export default function StudyPage() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetParticipantStudyQuery(id, { refetchOnMountOrArgChange: true });
  const s = data?.data;
  const navigate = useNavigate();
  const [declining, setDeclining] = useState(false);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-[18px] text-[#120e22]">
      <Link to="/dashboard/participant" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Home
      </Link>
      {isLoading && <div className="h-96 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" aria-label="Loading" />}
      {isError && (
        <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">
          {(error as { status?: number })?.status === 404 ? (
            <>This study isn't available. <Link to="/dashboard/participant" className="font-semibold">See studies that fit you</Link></>
          ) : (
            <>We couldn't load this study. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></>
          )}
        </div>
      )}
      {s && s.state === "in-progress" && s.holds && <Held s={s} onExpired={refetch} />}
      {s && !(s.state === "in-progress" && s.holds) && (
        <>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[12.5px] text-[#646080]">
              {METHOD_LABEL[s.method] ?? "Study"}
              {s.researcher ? ` · by ${s.researcher.name}${s.researcher.organization ? `, ${s.researcher.organization}` : ""}` : ""}
            </span>
            <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">{s.title}</h1>
          </div>
          <StatusNote s={s} />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1 rounded-2xl bg-[#120e22] p-3.5 text-white">
              <span className="text-[13px] text-[#bdb6de]">You get</span>
              <b style={DISPLAY} className="text-[28px] tracking-tight text-[#f0c93a]">{formatMoney(s.pay, s.currency)}</b>
              <span className="text-[13px] text-[#bdb6de]">{formatMoney(s.hourly, s.currency)} an hour</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-[#ebe9f2] bg-white p-3.5">
              <span className="text-[13px] text-[#646080]">Takes about</span>
              <b style={DISPLAY} className="text-[28px] tracking-tight">{s.minutes} min</b>
              <span className="text-[13px] text-[#646080]">{s.books ? "at a time you choose" : "in one sitting"}</span>
            </div>
          </div>
          <dl className="m-0 rounded-2xl border border-[#ebe9f2] bg-white px-4 py-1 text-[15px]">
            <Fact k="How" v={howText(s)} />
            {s.devices.length > 0 && <Fact k="Works on" v={s.devices.map((d) => DEVICE_LABEL[d] ?? d).join(" or ")} />}
            {s.places > 0 && <Fact k="Places left" v={`${s.placesLeft} of ${s.places}`} />}
            <Fact k="Closes" v={s.closesAt ? `${closesLabel(s.closesAt).replace("closes ", "")}, or when full` : "When it's full"} />
            <Fact k="Paid" v={s.paidWithin === "right away" ? "As soon as you finish" : "Within 7 days of finishing"} last />
          </dl>
          {s.warning && (
            <div className="rounded-2xl border-[1.5px] border-orange-200 bg-orange-50 px-4 py-3 text-[15px] leading-normal text-orange-950">
              <b>Before you start:</b> {s.warning}
            </div>
          )}
          {s.description && (
            <Block title="What you'll do">
              <p className="m-0 whitespace-pre-line">{s.description}</p>
              {s.tasks.length > 0 && <ul className="m-0 mt-2 pl-5">{s.tasks.map((t) => <li key={t}>{t}</li>)}</ul>}
              {s.equipment && <p className="m-0 mt-2">You'll need: {s.equipment}</p>}
              {s.hasQuestions && <p className="m-0 mt-2">First, a few quick questions to check it's for you.</p>}
            </Block>
          )}
          {s.researcher && (
            <Block title="Who's asking">
              <p className="m-0">{s.researcher.name}{s.researcher.organization ? `, ${s.researcher.organization}` : ""}.</p>
              {s.ethics && (
                <span className="mt-2 flex items-center gap-2 text-[14px] text-green-800">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#dcfce7" /><path d="m4.8 8.2 2 2 4.4-4.4" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Ethics approval: {s.ethics}
                </span>
              )}
            </Block>
          )}
          <Block title="Your answers">
            <p className="m-0">The researcher sees your answers and your joinStudy ID, never your name, email or phone.</p>
          </Block>
          <NextStep s={s} onDecline={() => setDeclining(true)} onStarted={refetch} />
        </>
      )}
      {s && <ReportLink id={s.id} />}
      {declining && s && (
        <DeclineSheet
          study={s}
          onClose={() => setDeclining(false)}
          onHidden={(sid, title) => navigate("/dashboard/participant", { state: { hidden: { id: sid, title } } })}
        />
      )}
    </div>
  );
}

const howText = (s: StudyDetail) =>
  s.books ? (s.method === "focus-group" ? "A group video call. You choose a session." : "A video call. You choose a time.") : "Online, by link";

function Fact({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 py-[11px] ${last ? "" : "border-b border-[#ebe9f2]"}`}>
      <dt className="text-[#646080]">{k}</dt>
      <dd className="m-0 text-right">{v}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <h2 className="m-0 text-[17px] font-semibold">{title}</h2>
      <div className="text-[15px] leading-relaxed text-[#4b4664]">{children}</div>
    </section>
  );
}

/** Why they can't start, said kindly, or that they've hidden it. */
function StatusNote({ s }: { s: StudyDetail }) {
  const [unhide, { isLoading }] = useUnhideStudyMutation();
  const box = "rounded-2xl border-[1.5px] border-[#bdb6de] bg-white px-4 py-3.5 text-[14.5px] leading-normal text-[#4b4664]";
  if (s.state === "not-for-you")
    return (
      <div role="note" className={box}>
        <b className="text-[#120e22]">This one isn't for you.</b> {s.fit.reason} That's about who the researcher needs, not about you.{" "}
        <Link to="/dashboard/participant" className="text-[#120e22]">See studies that fit you</Link>
      </div>
    );
  if (s.state === "closed") return <div role="note" className={box}><b className="text-[#120e22]">This study isn't taking anyone new.</b> It has closed.</div>;
  if (s.state === "full")
    return (
      <div role="status" className={box}>
        <b className="text-[#120e22]">{s.places === 1 ? "The only place is taken right now." : `All ${s.places} places are taken right now.`}</b> Some people are still taking part. If one of them leaves or runs out of time, a place opens up again, and you'll see it on your home page.
      </div>
    );
  if (s.state === "done")
    return (
      <div role="note" className={box}>
        <b className="text-[#120e22]">You've taken part in this study.</b>{" "}
        {s.outcome === "paid" ? "It's paid: the money is in your balance." : s.outcome === "late-over" ? "Your answers reached the researcher after the places filled; they can still choose to pay you." : "The researcher checks answers within 7 days, then it's paid."}
      </div>
    );
  if (s.state === "blocked") return <div role="status" className={box}>{s.verification.message}</div>;
  if (s.myStatus === "timed-out" || s.myStatus === "left")
    return (
      <div role="note" className={box}>
        {s.myStatus === "left" ? "You left this study earlier." : "Your time for this study ran out, so the place went back."}{" "}
        {s.state === "start" ? "You can start again while there's a place." : ""}
        {s.myStatus === "timed-out" && s.hasCode ? (
          <> Already finished the survey? <Link to={`/dashboard/participant/studies/${s.id}/finish`} className="text-[#120e22]">Enter the finish code</Link>.</>
        ) : null}
      </div>
    );
  if (s.hidden)
    return (
      <div role="note" className={`${box} flex flex-wrap items-center justify-between gap-2`}>
        <span>You hid this study. It's not on your list.</span>
        <button type="button" disabled={isLoading} onClick={() => unhide(s.id)} className="h-10 rounded-full border-[1.5px] border-[#120e22] px-4 font-semibold text-[#120e22]">
          Bring back
        </button>
      </div>
    );
  return null;
}

/** The button at the bottom: start (with consent and any screening questions), verify, or nothing. */
function NextStep({ s, onDecline, onStarted }: { s: StudyDetail; onDecline: () => void; onStarted: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);
  const [problem, setProblem] = useState("");
  const [questions, setQuestions] = useState<ScreenQuestion[] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [check, checkState] = useLazyCheckSurveyEligibilityQuery();
  const [screen, screenState] = useScreenForStudyMutation();
  const [startLink, linkState] = useStudyStartLinkMutation();
  const busy = checkState.isFetching || screenState.isLoading || linkState.isLoading;
  const canStart = s.state === "start" || s.state === "in-progress";
  const needsConsent = s.consent.required && s.state !== "in-progress";

  const open = async () => {
    const r = await startLink({ id: s.id, consent: !s.consent.required || consent || s.state === "in-progress" }).unwrap();
    if (r.data.book) navigate(`/dashboard/participant/studies/${s.id}/book`);
    // Participant Stage 4: a held place shows "You're in" first, with the time and how finishing works.
    else if (s.holds) onStarted();
    else window.location.assign(r.data.url);
  };
  const start = async () => {
    setProblem("");
    try {
      await check(s.id).unwrap();
      await open();
    } catch (err) {
      const p = readProblem(err);
      if (p.code === "screener_required") {
        const qs = (p.data?.questions as ScreenQuestion[]) || [];
        setQuestions(qs);
        setAnswers(qs.map(() => -1));
        return;
      }
      if (p.code === "verify_first" && !["duplicate", "rejected", "review", "checking"].includes(String(p.data?.status))) {
        navigate("/participate/verify");
        return;
      }
      setProblem(p.message);
    }
  };
  const sendAnswers = async () => {
    setProblem("");
    try {
      await screen({ id: s.id, answers }).unwrap();
      setQuestions(null);
      await open();
    } catch (err) {
      setQuestions(null);
      setProblem(readProblem(err).message);
    }
  };

  if (questions)
    return (
      <section aria-labelledby="sq-t" className="flex flex-col gap-4 rounded-[20px] border-[1.5px] border-[#120e22] bg-white p-[18px]">
        <div className="flex flex-col gap-1">
          <h2 id="sq-t" className="m-0 text-[18px] font-semibold">A few quick questions</h2>
          <p className="m-0 text-[14.5px] text-[#4b4664]">The researcher is looking for particular people. Answer honestly; there's no wrong answer.</p>
        </div>
        {questions.map((q, i) => (
          <fieldset key={i} className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 font-semibold">{q.text}</legend>
            {q.answers.map((a, j) => (
              <label key={j} className={`flex min-h-12 items-center gap-3 rounded-xl border-[1.5px] px-4 text-[15px] ${answers[i] === j ? "border-[#120e22]" : "border-[#ebe9f2]"}`}>
                <input type="radio" name={`sq-${i}`} checked={answers[i] === j} onChange={() => setAnswers(answers.map((x, k) => (k === i ? j : x)))} className="h-5 w-5 accent-[#120e22]" />
                {a}
              </label>
            ))}
          </fieldset>
        ))}
        <button type="button" onClick={sendAnswers} disabled={busy || answers.some((a) => a < 0)} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-60">
          {busy ? "Checking…" : "Continue"}
        </button>
      </section>
    );

  return (
    <div className="flex flex-col gap-2.5 pt-1.5">
      {canStart && (
        <>
          {needsConsent && (
            <>
              {s.consent.text && (
                <div className="max-h-48 overflow-y-auto whitespace-pre-line rounded-xl border border-[#ebe9f2] bg-white p-4 text-[14.5px] leading-relaxed text-[#4b4664]" tabIndex={0} aria-label="Consent information">
                  {s.consent.text}
                </div>
              )}
              <label className="flex items-start gap-2.5 text-[14.5px] leading-snug">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#120e22]" />
                <span>I've read this and agree to take part. I can stop at any time.</span>
              </label>
            </>
          )}
          {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2.5 text-[14.5px] text-orange-900">{problem}</div>}
          <button type="button" onClick={start} disabled={busy || (needsConsent && !consent)} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-50">
            {busy ? "Opening…" : s.state === "in-progress" ? "Continue the study" : s.books ? "Choose a time" : "Start the study"}
          </button>
          {!s.books && s.state === "start" && <span className="text-center text-[13.5px] text-[#646080]">It opens in this window. Come back to joinStudy when you've finished.</span>}
        </>
      )}
      {s.state === "verify" && (
        <>
          <Link to="/participate/verify" className="flex h-[52px] items-center justify-center rounded-full bg-[#120e22] font-semibold text-white no-underline">
            Get verified to start
          </Link>
          <span className="text-center text-[13.5px] leading-snug text-[#646080]">Once only: a WhatsApp code and a quick selfie, about 2 minutes. Then this study and every one after it.</span>
        </>
      )}
      {!s.hidden && ["start", "verify", "blocked"].includes(s.state) && (
        <button type="button" onClick={onDecline} className="h-12 rounded-full border-[1.5px] border-[#ebe9f2] bg-white text-[15px]">
          Not interested
        </button>
      )}
      {s.state === "in-progress" && (
        <button type="button" onClick={() => setLeaving(true)} className="self-center p-3 text-[15px] text-[#120e22] underline underline-offset-4">
          I can't take part after all
        </button>
      )}
      {leaving && <LeaveSheet study={s} onClose={() => setLeaving(false)} onLeft={() => navigate("/dashboard/participant", { state: { left: { id: s.id, title: s.title } } })} />}
    </div>
  );
}
