import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetParticipantHomeQuery, useUnhideStudyMutation, type StudyCard } from "@/redux/api/participantApi";
import { DeclineSheet, HiddenToast, StudyCardView } from "./parts";

/** Participant canvas 3.1: every study that fits them, and nothing that doesn't. */
export default function StudiesList() {
  const { data, isLoading, isError, refetch } = useGetParticipantHomeQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const h = data?.data;
  const [declining, setDeclining] = useState<StudyCard | null>(null);
  const [toast, setToast] = useState<{ id: string; title: string } | null>(null);
  const [unhide] = useUnhideStudyMutation();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 text-[#120e22]">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="m-0 text-[26px] font-bold tracking-tight">Studies for you</h1>
        {!!h?.hiddenCount && <Link to="/dashboard/participant/studies/hidden" className="text-[14px] text-[#4b4664]">Hidden ({h.hiddenCount})</Link>}
      </div>
      <p className="m-0 text-[15px] text-[#4b4664]">Only studies that fit your profile.</p>
      {toast && <HiddenToast title={toast.title} onDone={() => setToast(null)} onUndo={() => { unhide(toast.id); setToast(null); }} />}
      {isLoading && <div className="h-60 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load studies. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {h?.situation === "profile" && (
        <p className="m-0 rounded-[18px] bg-white px-4 py-6 text-[15px]">
          Tell us about you first, so we can show studies that fit. <Link to="/participate/about" className="font-semibold text-[#120e22]">Tell us about you</Link>
        </p>
      )}
      {h && h.situation !== "profile" && h.studies.length === 0 && (
        <p className="m-0 rounded-[18px] bg-white px-4 py-6 text-[15px] text-[#4b4664]">No study fits you right now. New ones open every week{h.alerts.email ? ", and we'll email you" : ""}.</p>
      )}
      {h?.studies.map((s) => <StudyCardView key={s.id} s={s} ready={h.situation === "ready"} onDecline={setDeclining} />)}
      {declining && (
        <DeclineSheet study={declining} onClose={() => setDeclining(null)} onHidden={(id, title) => { setDeclining(null); setToast({ id, title }); }} />
      )}
    </div>
  );
}
