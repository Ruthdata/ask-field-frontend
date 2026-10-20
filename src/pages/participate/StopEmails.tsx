import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LogoMark } from "@components/marketing/Logo";
import { readProblem } from "@/lib/session";
import { useStopStudyEmailsMutation } from "@/redux/api/participantApi";

/** Participant canvas 3.4: "Stop these emails" from a study email. One click, no sign-in. */
export default function StopEmails() {
  const [params] = useSearchParams();
  const [stop, { isLoading, isSuccess, error }] = useStopStudyEmailsMutation();
  const sent = useRef(false);
  const u = params.get("u") || "";
  const t = params.get("t") || "";
  useEffect(() => {
    if (sent.current || !u || !t) return;
    sent.current = true;
    stop({ u, t });
  }, [u, t, stop]);
  const bad = !u || !t || !!error;
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f6f5fa] px-4 py-16 text-[#120e22]">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-6">
        <span className="flex items-center gap-2 text-[19px] font-bold"><span className="flex h-6 w-6 flex-none [&_svg]:h-6 [&_svg]:w-6"><LogoMark /></span>joinStudy</span>
        {isLoading && <p className="m-0" role="status">Turning off study emails…</p>}
        {isSuccess && (
          <>
            <h1 className="m-0 text-[24px] font-bold tracking-tight">Study emails are off</h1>
            <p className="m-0 text-[15px] leading-normal text-[#4b4664]">We won't email you about new studies. Studies that fit you still show on your home page, and you can turn emails back on there.</p>
          </>
        )}
        {bad && !isLoading && (
          <>
            <h1 className="m-0 text-[24px] font-bold tracking-tight">That link didn't work</h1>
            <p className="m-0 text-[15px] leading-normal text-[#4b4664]">{error ? readProblem(error).message : "The link is incomplete."} Sign in and turn study emails off from your home page.</p>
          </>
        )}
        <Link to="/dashboard/participant" className="flex h-12 items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline">Go to joinStudy</Link>
      </div>
    </main>
  );
}
