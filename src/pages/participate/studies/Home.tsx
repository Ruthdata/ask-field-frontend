import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatMoney } from "@/lib/study";
import MyBookings from "@/pages/participant/MyBookings";
import { useGetParticipantHomeQuery, useSetStudyEmailsMutation, useUnhideStudyMutation, type ParticipantHome, type StudyCard } from "@/redux/api/participantApi";
import { DeclineSheet, HiddenToast, StudyCardView } from "./parts";
import { DISPLAY, heldLabel, studyPath } from "./studyText";

/** Participant canvas 3.1: one home that knows where each person is. */
export default function Home() {
  const { data, isLoading, isError, refetch } = useGetParticipantHomeQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const h = data?.data;
  const location = useLocation();
  const navigate = useNavigate();
  const nav = location.state as { hidden?: { id: string; title: string }; left?: { id: string; title: string } } | null;
  const fromStudy = nav?.hidden ?? null;
  const [leftNote, setLeftNote] = useState(nav?.left?.title ?? null);
  const [declining, setDeclining] = useState<StudyCard | null>(null);
  const [toast, setToast] = useState<{ id: string; title: string } | null>(fromStudy);
  const [unhide] = useUnhideStudyMutation();
  const clearToast = useCallback(() => {
    setToast(null);
    if (fromStudy) navigate(location.pathname, { replace: true, state: null });
  }, [fromStudy, navigate, location.pathname]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">
        {h ? `Hi, ${h.firstName}` : "Hi"}
      </h1>
      {leftNote && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-[14px] bg-[#120e22] px-3.5 py-3 text-[14.5px] leading-snug text-white">
          <span>You've left “{leftNote}”. Thanks for letting us know; your place has gone to someone else.</span>
          <button type="button" aria-label="Dismiss" onClick={() => { setLeftNote(null); navigate(location.pathname, { replace: true, state: null }); }} className="flex-none px-1 text-[#f0c93a]">✕</button>
        </div>
      )}
      {toast && <HiddenToast title={toast.title} onDone={clearToast} onUndo={() => { unhide(toast.id); clearToast(); }} />}
      {isLoading && <div className="h-72 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" aria-label="Loading" />}
      {isError && (
        <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">
          We couldn't load your home. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button>
        </div>
      )}
      {h && (
        <>
          {h.situation === "profile" && <GetReady h={h} />}
          {h.verification.message && (
            <div role="status" className="rounded-[20px] bg-gray-100 px-4 py-4 text-[15px] leading-snug">{h.verification.message}</div>
          )}
          {h.inProgress.map((a) => a.expired ? (
            <Link key={a.id} to={studyPath(a.id)} className="flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] border-[#bdb6de] bg-white px-[18px] py-4 text-[#120e22] no-underline">
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-[12px] text-[#646080]">Your time ran out</span>
                <b className="text-[16px]">{a.title}</b>
                <span className="text-[14px] text-[#4b4664]">Start again while there's a place, or enter the finish code if you did finish.</span>
              </span>
              <span className="whitespace-nowrap font-semibold">Open →</span>
            </Link>
          ) : (
            <Link key={a.id} to={studyPath(a.id)} className="flex items-center justify-between gap-3 rounded-[20px] bg-[#120e22] px-[18px] py-4 text-white no-underline">
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-[12px] text-[#f0c93a]"><HeldFor until={a.heldUntil} started={a.startedAt} /></span>
                <b className="text-[16px]">{a.title}</b>
                <span className="text-[14px] text-[#bdb6de]">Finish it to get paid {formatMoney(a.pay, a.currency)}</span>
              </span>
              <span className="whitespace-nowrap font-semibold text-[#f0c93a]">Continue →</span>
            </Link>
          ))}
          <MyBookings />
          {(h.situation === "waiting" || h.situation === "all-set") && <Waiting h={h} />}
          {h.situation === "verify" && !h.verification.message && <VerifyCta h={h} />}
          {h.studies.length > 0 && (
            <section aria-labelledby="h-studies" className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <h2 id="h-studies" className="m-0 text-[18px] font-semibold">Studies for you</h2>
                {h.hiddenCount > 0 && <Link to="/dashboard/participant/studies/hidden" className="text-[14px] text-[#4b4664]">Hidden ({h.hiddenCount})</Link>}
              </div>
              {h.studies.map((s) => (
                <StudyCardView key={s.id} s={s} ready={h.situation === "ready"} onDecline={setDeclining} />
              ))}
            </section>
          )}
          {h.studies.length === 0 && h.hiddenCount > 0 && (
            <Link to="/dashboard/participant/studies/hidden" className="text-[14px] text-[#4b4664]">Studies you hid ({h.hiddenCount})</Link>
          )}
          {h.situation !== "profile" && <Money h={h} />}
        </>
      )}
      {declining && (
        <DeclineSheet
          study={declining}
          onClose={() => setDeclining(null)}
          onHidden={(id, title) => {
            setDeclining(null);
            setToast({ id, title });
          }}
        />
      )}
    </div>
  );
}

function ago(iso: string) {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const hrs = Math.round(m / 60);
  if (hrs < 48) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

function Tick() {
  return (
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#f0c93a]" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 14 14"><path d="m3 7.2 2.6 2.6L11 4.4" fill="none" stroke="#120e22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

/** Situation 1: just signed up. A checklist, not a forced redirect. */
function GetReady({ h }: { h: ParticipantHome }) {
  const done = Object.values(h.profile.parts).filter(Boolean).length;
  const next = !h.profile.parts.where ? "where" : !h.profile.parts.languages ? "languages" : "work";
  return (
    <section aria-labelledby="h-start" className="flex flex-col gap-3.5 rounded-[20px] border-[1.5px] border-[#120e22] bg-white p-[18px]">
      <h2 id="h-start" className="m-0 text-[18px] font-semibold">Get ready for your first study</h2>
      <ol className="m-0 flex list-none flex-col gap-3 p-0 text-[15px]">
        <li className="flex items-center gap-3"><Tick /><span>Account and email<span className="sr-only">: done</span></span></li>
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#120e22] text-[13px] font-semibold text-white" aria-hidden="true">2</span>
          <span className="flex flex-col gap-0.5">
            <b>Tell us about you</b>
            <span className="text-[14px] text-[#4b4664]">{done ? `${done} of 3 parts done. ` : "About 3 minutes. "}Then we can show you studies that fit.</span>
          </span>
        </li>
        <li className="flex items-start gap-3 text-[#646080]">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border-[1.5px] border-[#bdb6de] text-[13px]" aria-hidden="true">3</span>
          <span>Get verified, once, when a study fits you</span>
        </li>
      </ol>
      <Link to={done ? `/participate/about?part=${next}` : "/participate/about"} className="flex h-[50px] items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">
        {done ? "Carry on" : "Tell us about you"}
      </Link>
    </section>
  );
}

/** Situations 2 and 5: nothing to do right now, and that's fine. */
function Waiting({ h }: { h: ParticipantHome }) {
  const [setEmails, { isLoading }] = useSetStudyEmailsMutation();
  const allSet = h.situation === "all-set";
  return (
    <section aria-labelledby="h-wait" className="flex flex-col gap-2.5 rounded-[20px] border border-[#ebe9f2] bg-white p-[18px]">
      <h2 id="h-wait" className="m-0 text-[18px] font-semibold">{allSet ? "You're all set" : "No study fits you yet"}</h2>
      <p className="m-0 text-[15px] leading-normal text-[#4b4664]">
        {allSet
          ? "You've done every study that fits you. New ones open every week."
          : "New studies open every week. You'll get verified when one fits you, not before."}{" "}
        {h.alerts.email ? "We'll email you when one does." : "Check back here, or turn on emails."}
      </p>
      <span className="flex flex-wrap items-center gap-x-2 text-[14px] text-[#646080]">
        Emails about new studies: <b className="text-[#120e22]">{h.alerts.email ? "On" : "Off"}</b> ·
        <button type="button" disabled={isLoading} onClick={() => setEmails(!h.alerts.email)} className="py-2 text-[#120e22] underline underline-offset-2">
          {h.alerts.email ? "Turn off" : "Turn on"}
        </button>
      </span>
      <span className="text-[14px] text-[#646080]">
        More answers can mean more studies: <Link to="/dashboard/participant/profile" className="text-[#120e22]">check your profile</Link>
      </span>
    </section>
  );
}

/** Situation 3: studies fit, but they haven't verified. Looking is free; starting needs verifying once. */
function VerifyCta({ h }: { h: ParticipantHome }) {
  const n = h.studies.length;
  const r = h.payRange;
  const cur = h.studies[0]?.currency ?? "USD";
  const pay = r ? (r.min === r.max ? `, paying ${formatMoney(r.max, cur)}` : `, paying ${formatMoney(r.min, cur)} to ${formatMoney(r.max, cur)}`) : "";
  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] border-[1.5px] border-[#f0c93a] bg-[#fff8dc] px-[18px] py-4">
      <b className="text-[16px]">{n === 1 ? "1 study fits you" : `${n} studies fit you`}{pay}</b>
      <span className="text-[14.5px] leading-snug text-[#4b4664]">
        Look through {n === 1 ? "it" : "them"} below. To start one, get verified once: a WhatsApp code and a quick selfie. It doesn't commit you to anything.
      </span>
      <Link to="/participate/verify" className="flex h-11 items-center self-start rounded-full bg-[#120e22] px-[18px] font-semibold text-white no-underline">
        Get verified
      </Link>
    </div>
  );
}

function Money({ h }: { h: ParticipantHome }) {
  const m = h.money;
  return (
    <section aria-labelledby="h-money" className="flex flex-col gap-2.5 rounded-[20px] border border-[#ebe9f2] bg-white p-[18px]">
      <div className="flex items-baseline justify-between">
        <h2 id="h-money" className="m-0 text-[18px] font-semibold">Your money</h2>
        <Link to="/dashboard/participant/earnings" className="text-[14px] text-[#120e22]">See all</Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1 rounded-[14px] bg-[#f6f5fa] p-3">
          <span className="text-[13px] text-[#646080]">Waiting for approval</span>
          <b style={DISPLAY} className="text-[24px]">{formatMoney(m.waiting, m.currency)}</b>
        </div>
        <div className="flex flex-col gap-1 rounded-[14px] bg-[#f6f5fa] p-3">
          <span className="text-[13px] text-[#646080]">Ready to cash out</span>
          <b style={DISPLAY} className="text-[24px]">{formatMoney(m.ready, m.currency)}</b>
        </div>
      </div>
      <span className="text-[13.5px] text-[#646080]">
        {m.currency === "USD" ? "Paid in US dollars. " : ""}You cash out in your own currency from {formatMoney(m.minPayout, m.currency)}.
      </span>
    </section>
  );
}

/** "Place held for 42 min more" (Participant Stage 4). */
function HeldFor({ until, started }: { until: string | null; started: string }) {
  const [now] = useState(() => Date.now());
  if (!until) return <>Started {ago(started)}</>;
  return <>Place held for {heldLabel(Math.max(1, Math.ceil((new Date(until).getTime() - now) / 60000)))} more</>;
}
