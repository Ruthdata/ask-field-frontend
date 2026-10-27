import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LogoMark } from "@components/marketing/Logo";
import { readProblem } from "@/lib/session";
import { useConfirmNewParticipantEmailMutation } from "@/redux/api/participantAccountApi";

/** Participant Stage 7: pages that work without signing in. */

function Card({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f6f5fa] px-4 py-16 text-[#120e22]">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-6" aria-live="polite">
        <span className="flex items-center gap-2 text-[19px] font-bold"><span className="flex h-6 w-6 flex-none [&_svg]:h-6 [&_svg]:w-6"><LogoMark /></span>joinStudy</span>
        {children}
      </div>
    </main>
  );
}
const YELLOW = "flex h-12 items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00] no-underline";

/** The link in "Confirm your new email for joinStudy". */
export function ConfirmNewEmail() {
  const [params] = useSearchParams();
  const [confirm] = useConfirmNewParticipantEmailMutation();
  const [state, setState] = useState<{ email?: string; problem?: string }>({});
  const once = useRef(false);
  useEffect(() => {
    if (once.current) return;
    once.current = true;
    confirm(params.get("token") || "")
      .unwrap()
      .then((r) => setState({ email: r.data.email }))
      .catch((err) => setState({ problem: readProblem(err).message }));
  }, [confirm, params]);
  return (
    <Card>
      {!state.email && !state.problem && <p className="m-0" role="status">Changing your email…</p>}
      {state.email && (
        <>
          <h1 className="m-0 text-[24px] font-bold tracking-tight">Email changed</h1>
          <p className="m-0 text-[15px] leading-normal text-[#4b4664]">Sign in with <b className="text-[#120e22]">{state.email}</b> from now on.</p>
          <Link to="/dashboard/participant/settings" state={{ emailChanged: state.email }} className={YELLOW}>Go to Settings</Link>
        </>
      )}
      {state.problem && (
        <>
          <h1 className="m-0 text-[24px] font-bold tracking-tight">That link didn't work</h1>
          <p className="m-0 text-[15px] leading-normal text-[#4b4664]">{state.problem}</p>
          <Link to="/dashboard/participant/settings" className={YELLOW}>Go to Settings</Link>
        </>
      )}
    </Card>
  );
}

/** Where people land after closing their account. */
export function AccountClosed() {
  return (
    <Card>
      <h1 className="m-0 text-[24px] font-bold tracking-tight">Your account is closed</h1>
      <p className="m-0 text-[15px] leading-normal text-[#4b4664]">You've been signed out and your details are deleted. We've sent a last email to confirm it. Thanks for taking part.</p>
      <Link to="/" className={YELLOW}>Go to joinstudy.io</Link>
    </Card>
  );
}
