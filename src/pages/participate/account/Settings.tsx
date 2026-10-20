import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { readProblem } from "@/lib/session";
import {
  keepThisDevice,
  useCancelParticipantEmailMutation,
  useChangeParticipantPasswordMutation,
  useGetParticipantSettingsQuery,
  useRequestParticipantEmailMutation,
  useSendPhoneChangeMutation,
  useSetParticipantEmailPrefsMutation,
  useSignOutOthersMutation,
  useVerifyPhoneChangeMutation,
  type ParticipantEmailPrefs,
  type ParticipantSettings,
} from "@/redux/api/participantAccountApi";
import { DISPLAY } from "../studies/studyText";
import { BTN_DARK, Done, Field, INPUT, Problem, Section, Toggle } from "./ui";

/** Participant canvas 7.1: Settings. */
type Open = "email" | "password" | "phone" | null;

const PHONE_HINT: Record<string, string> = { Nigeria: "0803 123 4567", Ghana: "024 123 4567", Kenya: "0712 345 678" };
const ago = (iso: string | null) => {
  if (!iso) return "Not changed since you joined";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "Changed today";
  if (days < 30) return `Changed ${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.floor(days / 30);
  return `Changed ${months} ${months === 1 ? "month" : "months"} ago`;
};

export default function Settings() {
  const { data, isLoading, isError, refetch } = useGetParticipantSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  const s = data?.data;
  const changed = (useLocation().state as { emailChanged?: string } | null)?.emailChanged;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">Settings</h1>
      {changed && <Done text={`Your email is now ${changed}.`} />}
      {isLoading && <div className="h-80 animate-pulse rounded-[18px] bg-gray-100" aria-busy="true" />}
      {isError && <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">We couldn't load your settings. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
      {s && <Body s={s} />}
    </div>
  );
}

function Row({ k, v, cta, onClick, open }: { k: string; v: string; cta?: string; onClick?: () => void; open?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] text-[#646080]">{k}</span>
        <span className="break-all">{v}</span>
      </span>
      {cta && <button type="button" onClick={onClick} aria-expanded={open} className="flex-none py-2 text-[14px] font-semibold text-[#120e22] underline-offset-2 hover:underline">{open ? "Cancel" : cta}</button>}
    </div>
  );
}

function Body({ s }: { s: ParticipantSettings }) {
  const [open, setOpen] = useState<Open>(null);
  const toggle = (o: Open) => setOpen((cur) => (cur === o ? null : o));
  return (
    <>
      <Section id="h-signin" title="Sign-in">
        <Row k="Email" v={s.email} cta="Change" open={open === "email"} onClick={() => toggle("email")} />
        {s.pendingEmail && open !== "email" && <PendingEmail s={s} />}
        {open === "email" && <EmailForm s={s} onDone={() => setOpen(null)} />}
        <Row k="Password" v={s.hasPassword ? ago(s.passwordChangedAt) : "You sign in with Google"} cta={s.hasPassword ? "Change" : "Set one"} open={open === "password"} onClick={() => toggle("password")} />
        {open === "password" && <PasswordForm s={s} onDone={() => setOpen(null)} />}
        <Row
          k="WhatsApp number"
          v={s.phone ? `•••• •••• ••${s.phone.last2} · confirmed` : "Added when you get verified"}
          cta={s.phone ? "Change" : undefined}
          open={open === "phone"}
          onClick={() => toggle("phone")}
        />
        {open === "phone" && <PhoneForm s={s} onDone={() => setOpen(null)} />}
      </Section>

      <Section id="h-name" title="Name">
        <span className="text-[15px]">{s.name}</span>
        <span className="text-[13.5px] leading-snug text-[#646080]">
          {s.nameLocked ? (
            <>Your name is checked against your selfie and your payout account, so it can't be changed here. Spelling wrong? <Link to="/dashboard/participant/help?topic=account" className="font-semibold text-[#120e22]">Ask us</Link>.</>
          ) : (
            <>Use your name as it is on your bank or mobile money account: payouts only go to an account in your name. To fix it, <Link to="/dashboard/participant/help?topic=account" className="font-semibold text-[#120e22]">ask us</Link>.</>
          )}
        </span>
      </Section>

      <EmailPrefs prefs={s.emailPrefs} />
      <Devices />

      <Link to="/dashboard/participant/settings/data" className="flex items-center justify-between gap-3 rounded-2xl border border-[#ebe9f2] bg-white px-4 py-3.5 text-[#120e22] no-underline">
        <b className="text-[15px] font-medium">Your data: download it, or close your account</b>
        <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function PendingEmail({ s }: { s: ParticipantSettings }) {
  const [cancel, { isLoading }] = useCancelParticipantEmailMutation();
  return (
    <div className="rounded-[14px] bg-[#f6f5fa] px-3.5 py-3 text-[14px] leading-snug text-[#4b4664]">
      We sent a link to <b className="break-all text-[#120e22]">{s.pendingEmail}</b>. Your email changes when you click it.{" "}
      <button type="button" disabled={isLoading} onClick={() => cancel()} className="font-semibold text-[#120e22] underline">Cancel the change</button>
    </div>
  );
}

function FormCard({ title, onSubmit, children }: { title: string; onSubmit: (e: FormEvent) => void; children: React.ReactNode }) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 rounded-[16px] border-[1.5px] border-[#120e22] bg-white p-3.5">
      <b className="text-[15px]">{title}</b>
      {children}
    </form>
  );
}

function EmailForm({ s, onDone }: { s: ParticipantSettings; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");
  const [send, { isLoading }] = useRequestParticipantEmailMutation();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setProblem("Enter a valid email.");
    if (s.hasPassword && !password) return setProblem("Enter your password.");
    try {
      await send({ email: email.trim(), password: password || undefined }).unwrap();
      onDone();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <FormCard title="Change your email" onSubmit={submit}>
      <Field id="st-email" label="New email"><input id="st-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} /></Field>
      {s.hasPassword && <Field id="st-email-pw" label="Your password"><input id="st-email-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} /></Field>}
      <Problem text={problem} />
      <button type="submit" disabled={isLoading} className={BTN_DARK}>{isLoading ? "Sending…" : "Send a link to the new email"}</button>
      <span className="text-[13px] text-[#646080]">It changes when you click the link. We tell your old email too.</span>
    </FormCard>
  );
}

function PasswordForm({ s, onDone }: { s: ParticipantSettings; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [problem, setProblem] = useState("");
  const [done, setDone] = useState("");
  const [change, { isLoading }] = useChangeParticipantPasswordMutation();
  const dispatch = useDispatch();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (s.hasPassword && !current) return setProblem("Enter your current password.");
    if (next.length < 8) return setProblem("Use at least 8 characters for the new password.");
    try {
      dispatch(keepThisDevice((await change({ current: current || undefined, next }).unwrap()).data));
      setDone("Password changed. Your other devices are signed out.");
      setTimeout(onDone, 2500);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <FormCard title={s.hasPassword ? "Change your password" : "Set a password"} onSubmit={submit}>
      {s.hasPassword && <Field id="st-cur" label="Current password"><input id="st-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={INPUT} /></Field>}
      <Field id="st-new" label="New password" hint="At least 8 characters. Signs you out on your other devices."><input id="st-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={INPUT} /></Field>
      <Problem text={problem} />
      <Done text={done} />
      <button type="submit" disabled={isLoading || !!done} className={BTN_DARK}>{isLoading ? "Changing…" : "Change password"}</button>
    </FormCard>
  );
}

function PhoneForm({ s, onDone }: { s: ParticipantSettings; onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [problem, setProblem] = useState("");
  const [send, sending] = useSendPhoneChangeMutation();
  const [verify, verifying] = useVerifyPhoneChangeMutation();
  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (phone.replace(/\D/g, "").length < 6) return setProblem("Enter your new number.");
    try {
      setSentTo((await send({ phone, channel: "whatsapp" }).unwrap()).data.sentTo);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!/^\d{6}$/.test(code.trim())) return setProblem("Enter the 6-digit code.");
    try {
      await verify({ code: code.trim() }).unwrap();
      onDone();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  if (sentTo) {
    return (
      <FormCard title="Enter the code" onSubmit={confirm}>
        <span className="text-[14px] text-[#4b4664]">We sent a 6-digit code on WhatsApp to {sentTo}.</span>
        <Field id="st-code" label="Code"><input id="st-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={`${INPUT} font-mono tracking-[0.3em]`} /></Field>
        <Problem text={problem} />
        <button type="submit" disabled={verifying.isLoading} className={BTN_DARK}>{verifying.isLoading ? "Checking…" : "Change my number"}</button>
        <button type="button" onClick={() => { setSentTo(""); setCode(""); }} className="self-start py-1 text-[14px] font-semibold underline">Use a different number</button>
      </FormCard>
    );
  }
  return (
    <FormCard title="Change your WhatsApp number" onSubmit={sendCode}>
      <Field id="st-phone" label={`New number${s.country ? ` in ${s.country}` : ""}`} hint="Each number can be on one joinStudy account only.">
        <input id="st-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={PHONE_HINT[s.country || ""] ?? ""} value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
      </Field>
      <Problem text={problem} />
      <button type="submit" disabled={sending.isLoading} className={BTN_DARK}>{sending.isLoading ? "Sending…" : "Send a code on WhatsApp"}</button>
    </FormCard>
  );
}

function EmailPrefs({ prefs }: { prefs: ParticipantEmailPrefs }) {
  const [save, { isLoading }] = useSetParticipantEmailPrefsMutation();
  const [problem, setProblem] = useState("");
  const set = async (k: keyof ParticipantEmailPrefs, v: boolean) => {
    setProblem("");
    try {
      await save({ [k]: v }).unwrap();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Section id="h-emails" title="Emails">
      <Toggle id="ep-studies" label="A study fits you" note="At most once a day" on={prefs.studies} onChange={(v) => set("studies", v)} disabled={isLoading} />
      <div className="flex items-center justify-between gap-3">
        <span className="flex flex-col gap-0.5"><b className="text-[15px] font-medium">Decisions and payments</b><span className="text-[13px] text-[#646080]">Approved, not approved, cash-outs</span></span>
        <span className="flex-none text-[13px] text-[#646080]">Always on</span>
      </div>
      <Toggle id="ep-messages" label="Messages from researchers" note="When a researcher writes to you" on={prefs.messages} onChange={(v) => set("messages", v)} disabled={isLoading} />
      <Toggle id="ep-news" label="joinStudy news" note="A few times a year" on={prefs.news} onChange={(v) => set("news", v)} disabled={isLoading} />
      <Problem text={problem} />
    </Section>
  );
}

function Devices() {
  const [signOut, { isLoading }] = useSignOutOthersMutation();
  const dispatch = useDispatch();
  const [done, setDone] = useState("");
  const [problem, setProblem] = useState("");
  const go = async () => {
    setProblem("");
    try {
      dispatch(keepThisDevice((await signOut().unwrap()).data));
      setDone("Done. You're still signed in here; everywhere else is signed out.");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Section id="h-devices" title="Devices">
      <span className="text-[14.5px] leading-snug text-[#4b4664]">Lost a phone, or signed in on a shared computer? Sign out of joinStudy everywhere except here.</span>
      <Done text={done} />
      <Problem text={problem} />
      {!done && <button type="button" onClick={go} disabled={isLoading} className="self-start py-1 text-[14.5px] font-semibold underline disabled:opacity-60">{isLoading ? "Signing out…" : "Sign out everywhere else"}</button>}
    </Section>
  );
}
