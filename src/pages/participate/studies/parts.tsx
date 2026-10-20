import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { HIDE_REASONS, useHideStudyMutation, type HideReason, type StudyCard } from "@/redux/api/participantApi";
import { DISPLAY, metaLine, startLabel, studyPath } from "./studyText";
import { formatMoney } from "@/lib/study";

/** Participant Stage 3 (canvas 3.1–3.3): pieces shared by home, the study list and the study page. */

/** A study on home or the list. Verified people go straight to "Start"; others see the details first. */
export function StudyCardView({ s, ready, onDecline }: { s: StudyCard; ready: boolean; onDecline: (s: StudyCard) => void }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-[18px] border border-[#ebe9f2] bg-white p-4" aria-labelledby={`st-${s.id}`}>
      <div className="flex items-start justify-between gap-3">
        <Link id={`st-${s.id}`} to={studyPath(s.id)} className="text-[16px] font-semibold leading-snug text-[#120e22] no-underline hover:underline">
          {s.title}
        </Link>
        <span style={DISPLAY} className="flex-none text-[20px] font-bold tracking-tight">{formatMoney(s.pay, s.currency)}</span>
      </div>
      <span className="text-[14px] text-[#4b4664]">{metaLine(s)}</span>
      {s.researcher && (
        <span className="text-[13.5px] text-[#646080]">
          By {s.researcher.name}
          {s.researcher.organization ? `, ${s.researcher.organization}` : ""}
        </span>
      )}
      <div className="flex gap-2">
        <Link
          to={studyPath(s.id)}
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#f0c93a] text-[15px] font-semibold text-[#251d00] no-underline"
          aria-label={`${ready ? startLabel(s) : "See details"}: ${s.title}`}
        >
          {ready ? startLabel(s) : "See details"}
        </Link>
        <button
          type="button"
          onClick={() => onDecline(s)}
          className="flex h-11 items-center justify-center rounded-full border-[1.5px] border-[#ebe9f2] bg-white px-3.5 text-[14.5px] text-[#120e22]"
          aria-label={`Not interested: ${s.title}`}
        >
          Not interested
        </button>
      </div>
    </article>
  );
}

/** Canvas 3.3: "Hide this study?" with an optional reason. */
export function DeclineSheet({ study, onClose, onHidden }: { study: { id: string; title: string }; onClose: () => void; onHidden: (id: string, title: string) => void }) {
  const [reason, setReason] = useState<HideReason | null>(null);
  const [problem, setProblem] = useState("");
  const [hide, { isLoading }] = useHideStudyMutation();
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
      await hide({ id: study.id, reason: reason ?? undefined }).unwrap();
      onHidden(study.id, study.title);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-[#120e22]/45" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="ds-title" className="relative flex w-full max-w-md flex-col gap-4 rounded-t-3xl bg-white px-5 pb-7 pt-5 sm:rounded-3xl">
        <span aria-hidden="true" className="h-1 w-10 self-center rounded bg-[#ebe9f2] sm:hidden" />
        <div className="flex flex-col gap-1.5">
          <h2 id="ds-title" style={DISPLAY} className="m-0 text-[24px] font-bold tracking-tight">Hide this study?</h2>
          <p className="m-0 text-[15px] leading-normal text-[#4b4664]">
            “{study.title}” won't count against you, and you'll still see other studies. You can bring it back while it's open.
          </p>
        </div>
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-[14.5px] font-semibold">
            Why? <span className="font-normal text-[#646080]">Optional</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {HIDE_REASONS.map((r, i) => (
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
          <span className="text-[13px] text-[#646080]">The researcher only sees totals, like “6 said the pay is too low”, never who.</span>
        </fieldset>
        {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2 text-[14px] text-orange-900">{problem}</div>}
        <button type="button" onClick={submit} disabled={isLoading} className="h-[50px] rounded-full bg-[#120e22] font-semibold text-white disabled:opacity-60">
          {isLoading ? "Hiding…" : "Hide it"}
        </button>
        <button type="button" onClick={onClose} className="h-11 text-[15px] text-[#120e22]">
          Keep it
        </button>
      </div>
    </div>
  );
}

/** "Hidden. Thanks for telling us. Undo" */
export function HiddenToast({ title, onUndo, onDone }: { title: string; onUndo: () => void; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 10000);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-[14px] bg-[#120e22] px-3.5 py-3 text-[14.5px] text-white">
      <span>
        Hidden “{title}”. Thanks for telling us.
      </span>
      <button type="button" onClick={onUndo} className="flex-none font-semibold text-[#f0c93a]">
        Undo
      </button>
    </div>
  );
}
