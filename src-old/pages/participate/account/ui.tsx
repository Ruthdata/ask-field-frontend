import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Participant Stage 7: small pieces shared by Settings, Your data, Help and Report a study. */

export const INPUT = "h-[50px] w-full rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3.5 text-[16px] placeholder:text-[#9a94b5]";
export const BTN_DARK = "flex h-[50px] w-full items-center justify-center rounded-full bg-[#120e22] px-5 font-semibold text-white no-underline disabled:opacity-60";
export const BTN_LINE = "flex h-[50px] w-full items-center justify-center rounded-full border-[1.5px] border-[#120e22] bg-white px-5 font-semibold text-[#120e22] no-underline disabled:opacity-60";

export function Back({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {children}
    </Link>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
      <h2 id={id} className="m-0 text-[16px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14.5px] font-semibold">{label}</label>
      {children}
      {hint && <span className="text-[13px] leading-snug text-[#646080]">{hint}</span>}
    </div>
  );
}

export function Problem({ text }: { text: string }) {
  return text ? <div role="alert" className="rounded-[14px] bg-[#fff4ed] px-3.5 py-3 text-[14.5px] leading-snug text-[#7c2d12]">{text}</div> : null;
}

export function Done({ text }: { text: string }) {
  return text ? <div role="status" className="rounded-[14px] bg-[#f0fdf4] px-3.5 py-3 text-[14.5px] leading-snug text-[#166534]">{text}</div> : null;
}

export function Toggle({ id, label, note, on, onChange, disabled }: { id: string; label: string; note: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex flex-col gap-0.5">
        <b id={`${id}-l`} className="text-[15px] font-medium">{label}</b>
        <span id={`${id}-n`} className="text-[13px] text-[#646080]">{note}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-l`}
        aria-describedby={`${id}-n`}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-[46px] flex-none rounded-full transition-colors disabled:opacity-60 ${on ? "bg-[#120e22]" : "bg-[#d6d3e3]"}`}
      >
        <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full transition-all ${on ? "right-[3px] bg-[#f0c93a]" : "left-[3px] bg-white"}`} />
      </button>
    </div>
  );
}

/** "Report this study", at the bottom of a study page and a decision page (canvas 7.4). */
export function ReportLink({ id }: { id: string }) {
  return (
    <Link to={`/dashboard/participant/studies/${id}/report`} className="flex items-center justify-center gap-1.5 self-center py-2.5 text-[14px] text-[#646080]">
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 14V2.5m0 0h8.5l-1.6 3 1.6 3H3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      Report this study
    </Link>
  );
}
