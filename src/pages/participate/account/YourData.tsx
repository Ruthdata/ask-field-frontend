import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { clearAuthStorage } from "@/utils/token";
import { apiSlice } from "@/redux/api/slices/appSlice";
import {
  downloadMyData,
  useCloseParticipantAccountMutation,
  useGetParticipantCloseCheckQuery,
  useGetParticipantSettingsQuery,
  type CloseCheck,
} from "@/redux/api/participantAccountApi";
import { DISPLAY } from "../studies/studyText";
import { Back, BTN_LINE, Field, INPUT, Problem } from "./ui";

/** Participant canvas 7.2: what we keep, download a copy, and close your account. */
export default function YourData() {
  const { data, isLoading, isError, refetch } = useGetParticipantCloseCheckQuery(undefined, { refetchOnMountOrArgChange: true });
  const settings = useGetParticipantSettingsQuery();
  const [confirming, setConfirming] = useState(false);
  const c = data?.data;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-[#120e22]">
      <Back to="/dashboard/participant/settings">Settings</Back>
      {isLoading && <div className="h-80 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load this page. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {c && !confirming && <Main c={c} onClose={() => setConfirming(true)} />}
      {c && confirming && <Confirm c={c} hasPassword={settings.data?.data.hasPassword ?? true} onKeep={() => setConfirming(false)} />}
    </div>
  );
}

function Main({ c, onClose }: { c: CloseCheck; onClose: () => void }) {
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setProblem("");
    setBusy(true);
    try {
      await downloadMyData();
    } catch (err) {
      setProblem((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const cashOutFirst = c.canClose && c.canCashOut;
  return (
    <>
      <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">Your data</h1>
      <section aria-labelledby="h-keep" className="flex flex-col gap-2.5 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
        <h2 id="h-keep" className="m-0 text-[16px] font-semibold">What we keep</h2>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[14.5px] leading-normal text-[#4b4664]">
          <li>Your account and “About you” answers</li>
          <li>The studies you took, decisions and messages</li>
          <li>Your balance, cash-outs, and the last digits of your payout account</li>
          <li>That you're verified, not your selfie or phone number (our partners keep those)</li>
        </ul>
        <Problem text={problem} />
        <button type="button" onClick={download} disabled={busy} className={BTN_LINE}>{busy ? "Making your file…" : "Download a copy (JSON)"}</button>
        <span className="text-[13px] leading-snug text-[#646080]">Researchers already have your answers to their own studies; ask them for a copy of those.</span>
      </section>
      <section aria-labelledby="h-close" className="flex flex-col gap-2.5 rounded-[18px] border border-[#ebe9f2] bg-white p-4">
        <h2 id="h-close" className="m-0 text-[16px] font-semibold">Close your account</h2>
        {!c.canClose ? (
          <span className="text-[14.5px] leading-normal text-[#4b4664]">You can't close it yet: {c.reasons.join("; ")}.</span>
        ) : cashOutFirst ? (
          <span className="text-[14.5px] leading-normal text-[#4b4664]">You have {formatMoney(c.ready, c.currency)} ready. Cash it out first: closing gives it up.</span>
        ) : (
          <span className="text-[14.5px] leading-normal text-[#4b4664]">Deletes your details. Anything waiting for approval is given up; cash out what's ready first.</span>
        )}
        {cashOutFirst ? (
          <>
            <Link to="/dashboard/participant/earnings/cash-out" className={BTN_LINE}>Cash out first</Link>
            <button type="button" onClick={onClose} className="self-center py-1.5 text-[14px] text-[#9a3412] underline">Close and give it up</button>
          </>
        ) : (
          <button type="button" onClick={onClose} disabled={!c.canClose} className="flex h-[50px] w-full items-center justify-center rounded-full border-[1.5px] border-[#fed7aa] bg-white px-5 font-semibold text-[#9a3412] disabled:border-[#ebe9f2] disabled:text-[#9a94b5]">Close my account</button>
        )}
      </section>
    </>
  );
}

function Confirm({ c, hasPassword, onKeep }: { c: CloseCheck; hasPassword: boolean; onKeep: () => void }) {
  const lost = Math.round((c.ready + c.waiting) * 100) / 100;
  const [agree, setAgree] = useState(false);
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");
  const [close, { isLoading }] = useCloseParticipantAccountMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (lost > 0 && !agree) return setProblem("Tick the box to confirm you'll lose this money.");
    if (hasPassword && !password) return setProblem("Enter your password.");
    try {
      await close({ password: password || undefined, giveUp: lost > 0 ? agree : undefined }).unwrap();
      clearAuthStorage();
      dispatch(apiSlice.util.resetApiState());
      navigate("/participate/closed", { replace: true });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const lines = [
    c.waiting > 0 && `${formatMoney(c.waiting, c.currency)} waiting for approval`,
    c.ready > 0 && `${formatMoney(c.ready, c.currency)} ready to cash out`,
  ].filter(Boolean) as string[];
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
      <h1 style={DISPLAY} className="m-0 text-[28px] font-bold leading-[1.05] tracking-tight">Close your account?</h1>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-[#4b4664]">
        <li>You're signed out, and your name, email, profile and messages are deleted.</li>
        {lost > 0 ? <li><b className="text-[#120e22]">You'll lose {lines.join(" and ")}.</b></li> : <li>You have no money waiting or ready.</li>}
        <li>Records of payments are kept for 7 years, as the law requires, without your name.</li>
        <li>To stop the same person making many accounts, we keep a one-way code of your phone number and payout account for 12 months. It can't be turned back into the real details.</li>
      </ul>
      {lost > 0 && (
        <label className="flex items-start gap-2.5 text-[14.5px] leading-snug">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#120e22]" />
          I understand I'll lose {formatMoney(lost, c.currency)}.
        </label>
      )}
      {hasPassword && <Field id="cl-pw" label="Your password"><input id="cl-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} /></Field>}
      <Problem text={problem} />
      <button type="submit" disabled={isLoading} className="flex h-[50px] w-full items-center justify-center rounded-full bg-[#9a3412] px-5 font-semibold text-white disabled:opacity-60">{isLoading ? "Closing…" : "Close my account"}</button>
      <button type="button" onClick={onKeep} className="self-center p-2.5 text-[15px]">Keep my account</button>
    </form>
  );
}
