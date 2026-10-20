import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { LEAVE_REASONS, useLeaveStudyMutation, type FinishOutcome, type LeaveReason, type StudyDetail } from "@/redux/api/participantApi";
import { useStudyStartLinkMutation } from "@/redux/api/planApi";
import { DISPLAY, heldLabel } from "./studyText";

/** Participant Stage 4 (canvas 4.1–4.4): taking part. */

function useMinutesLeft(until: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, [until]);
  return until ? Math.max(0, Math.ceil((new Date(until).getTime() - now) / 60000)) : null;
}

/** Canvas 4.1: "You're in". The place is held; open the survey; how finishing works; or leave. */
export function Held({ s, onExpired }: { s: StudyDetail; onExpired: () => void }) {
  const left = useMinutesLeft(s.heldUntil);
  const [startLink, { isLoading }] = useStudyStartLinkMutation();
  const [problem, setProblem] = useState("");
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();
  const nearlyUp = left !== null && left <= 10;
  useEffect(() => {
    if (left === 0) onExpired();
  }, [left, onExpired]);

  const open = async () => {
    setProblem("");
    try {
      const r = await startLink({ id: s.id, consent: true }).unwrap();
      window.location.assign(r.data.url);
    } catch (err) {
      const p = readProblem(err);
      if (p.code === "timed_out") onExpired();
      else setProblem(p.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[12.5px] text-[#646080]">
          You're in · {formatMoney(s.pay, s.currency)} · about {s.minutes} min
        </span>
        <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">{s.title}</h1>
      </div>
      {left !== null && (
        <div role="timer" aria-live="off" className={`flex flex-col gap-1.5 rounded-[20px] p-[18px] ${nearlyUp ? "bg-[#fff4ed] text-[#7c2d12]" : "bg-[#120e22] text-white"}`}>
          <span className="text-[14px] opacity-85">Your place is held for</span>
          <b style={DISPLAY} className="text-[40px] leading-none">{heldLabel(left)}</b>
          <span className="text-[14px] leading-snug opacity-85">
            {nearlyUp
              ? "Your time is nearly up. If you're still answering, finish: we'll still count it if there's a place. If you can't, leave so someone else can take it."
              : `That's plenty for a ${s.minutes}-minute study. If you don't finish by then, the place goes to someone else.`}
          </span>
        </div>
      )}
      {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2.5 text-[14.5px] text-orange-900">{problem}</div>}
      <button type="button" onClick={open} disabled={isLoading} className="h-[52px] rounded-full bg-[#f0c93a] font-semibold text-[#251d00] disabled:opacity-60">
        {isLoading ? "Opening…" : nearlyUp ? "Back to the survey" : "Open the survey"}
      </button>
      <section aria-labelledby="h-how" className="flex flex-col gap-2.5 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
        <h2 id="h-how" className="m-0 text-[16px] font-semibold">How finishing works</h2>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-[14.5px] leading-snug text-[#4b4664]">
          <li>Answer every page of the survey.</li>
          <li>On the last page, the survey sends you back to joinStudy, and we count it.</li>
          {s.hasCode ? (
            <li>
              Not sent back? The last page shows a finish code like <b className="font-mono text-[#120e22]">7KQ2-XM</b>.{" "}
              <Link to={`/dashboard/participant/studies/${s.id}/finish`} className="text-[#120e22]">Enter it here</Link>.
            </li>
          ) : (
            <li>Not sent back? <Link to="/dashboard/participant/messages" className="text-[#120e22]">Message the researcher</Link>.</li>
          )}
        </ol>
      </section>
      <button type="button" onClick={() => setLeaving(true)} className="self-center p-3 text-[15px] text-[#120e22] underline underline-offset-4">
        I can't finish this study
      </button>
      {leaving && (
        <LeaveSheet
          study={s}
          onClose={() => setLeaving(false)}
          onLeft={() => navigate("/dashboard/participant", { state: { left: { id: s.id, title: s.title } } })}
        />
      )}
    </div>
  );
}

/** Canvas 4.4: "Leave this study?" with an optional reason. */
export function LeaveSheet({ study, onClose, onLeft }: { study: { id: string; title: string; books?: boolean }; onClose: () => void; onLeft: () => void }) {
  const [reason, setReason] = useState<LeaveReason | null>(null);
  const [problem, setProblem] = useState("");
  const [leave, { isLoading }] = useLeaveStudyMutation();
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  const submit = async () => {
    setProblem("");
    try {
      await leave({ id: study.id, reason: reason ?? undefined }).unwrap();
      onLeft();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-[#120e22]/45" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="lv-title" className="relative flex w-full max-w-md flex-col gap-4 rounded-t-3xl bg-white px-5 pb-7 pt-5 sm:rounded-3xl">
        <span aria-hidden="true" className="h-1 w-10 self-center rounded bg-[#ebe9f2] sm:hidden" />
        <div className="flex flex-col gap-1.5">
          <h2 id="lv-title" style={DISPLAY} className="m-0 text-[24px] font-bold tracking-tight">Leave this study?</h2>
          <p className="m-0 text-[15px] leading-normal text-[#4b4664]">
            Your place goes to someone else{study.books ? " and your booking is cancelled" : ""}. It won't count against you, and you won't be paid for it.
          </p>
        </div>
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-[14.5px] font-semibold">
            What happened? <span className="font-normal text-[#646080]">Optional</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {LEAVE_REASONS.map((r, i) => (
              <button
                key={r.value}
                ref={i === 0 ? first : undefined}
                type="button"
                aria-pressed={reason === r.value}
                onClick={() => setReason(reason === r.value ? null : r.value)}
                className={`h-10 rounded-full border-[1.5px] px-3.5 text-[14.5px] ${reason === r.value ? "border-[#f0c93a] bg-[#f0c93a]" : "border-[#ebe9f2] bg-white"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <span className="text-[13px] text-[#646080]">“The link didn't work” goes to the researcher straight away, so they can fix it.</span>
        </fieldset>
        {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2 text-[14px] text-orange-900">{problem}</div>}
        <button type="button" onClick={submit} disabled={isLoading} className="h-[50px] rounded-full bg-[#120e22] font-semibold text-white disabled:opacity-60">
          {isLoading ? "Leaving…" : "Leave the study"}
        </button>
        <button type="button" onClick={onClose} className="h-11 text-[15px] text-[#120e22]">
          Stay in it
        </button>
      </div>
    </div>
  );
}

const THANKS: Record<FinishOutcome, { title: string; text: string; label: string; note: string }> = {
  review: {
    title: "Thank you, that's counted",
    text: "The researcher checks answers within 7 days. If they haven't by then, it's approved automatically.",
    label: "Waiting for approval",
    note: "Moves to your balance when approved.",
  },
  paid: { title: "Thank you, that's counted", text: "This researcher pays as soon as you finish.", label: "Ready to cash out", note: "In your balance now." },
  late: {
    title: "Thank you, that's counted",
    text: "You finished after your place's time ran out, but a place was still free, so it counts. The researcher checks answers within 7 days.",
    label: "Waiting for approval",
    note: "Moves to your balance when approved.",
  },
  "late-over": {
    title: "Your time ran out, and the places filled",
    text: "We're sorry. Your answers reached the researcher, but every place had gone by then. They can still choose to pay you, and we'll tell you what they decide.",
    label: "Waiting for the researcher",
    note: "We'll tell you what they decide.",
  },
};

/** Canvas 4.3: what's counted, the amount, and when it's paid. */
export function ThankYou({ outcome, amount, currency }: { outcome: FinishOutcome; amount: number; currency: string | null }) {
  const t = THANKS[outcome];
  const sad = outcome === "late-over";
  return (
    <div className="flex flex-col gap-4 text-[#120e22]" role="status" aria-live="polite">
      <div aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full ${sad ? "bg-[#fff4ed]" : "bg-[#120e22]"}`}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={sad ? "#c2410c" : "#f0c93a"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={sad ? "M12 7v6M12 16.5v.5" : "M5 12.5l4.5 4.5L19 7.5"} />
        </svg>
      </div>
      <h1 style={DISPLAY} className="m-0 text-[32px] font-bold leading-[1.05] tracking-tight">{t.title}</h1>
      <p className="m-0 text-[15.5px] leading-relaxed text-[#4b4664]">{t.text}</p>
      {amount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
          <span className="flex flex-col gap-0.5">
            <span className="text-[13px] text-[#646080]">{t.label}</span>
            <b style={DISPLAY} className="text-[28px]">{formatMoney(amount, currency || "USD")}</b>
          </span>
          <span className="max-w-[170px] text-right text-[13.5px] leading-snug text-[#646080]">{t.note}</span>
        </div>
      )}
      <Link to="/dashboard/participant" className="flex h-[52px] items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">
        Back to studies
      </Link>
      <Link to="/dashboard/participant/messages" className="self-center p-2.5 text-[14.5px] text-[#120e22]">
        Message the researcher
      </Link>
    </div>
  );
}
