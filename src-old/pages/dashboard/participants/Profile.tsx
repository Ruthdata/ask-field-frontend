import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { useDisconnectLinkedinMutation, useGetParticipantHomeQuery, useGetProfileQuery, useSetStudyEmailsMutation, useStartLinkedinMutation, type ParticipantProfile } from "@/redux/api/participantApi";

/** Participant canvas 2.5: everything they told us, the trust level, and the optional LinkedIn link. */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Profile() {
  const [params] = useSearchParams();
  const { data, isLoading, isError, refetch } = useGetProfileQuery(undefined, { refetchOnMountOrArgChange: true });
  const p = data?.data;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[32px] font-bold leading-none tracking-tight text-gray-950">Your profile</h1>
        <p className="m-0 text-[15px] leading-relaxed text-gray-600">Used only to match you to studies. Researchers never see it; they see only your answers to their own questions.</p>
      </div>
      {params.get("saved") && <div role="status" className="rounded-2xl bg-gray-100 px-4 py-3 text-[15px]">Saved. Changes apply to studies you start from now on.</div>}
      {params.get("linkedin") === "connected" && <div role="status" className="rounded-2xl bg-gray-100 px-4 py-3 text-[15px]">LinkedIn connected.</div>}
      {isLoading && <div className="h-80 animate-pulse rounded-2xl bg-gray-100" aria-busy="true" />}
      {isError && (
        <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">
          We couldn't load your profile. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button>
        </div>
      )}
      {p && (
        <>
          <Trust p={p} />
          <StudyEmails />
          <Section title="Where and who" edit={p.locked ? undefined : "where"}>
            <Row k="Country" v={p.country} />
            <Row k={p.options.regionLabel} v={p.answers.region} />
            <Row k="Born" v={p.answers.birthMonth && p.answers.birthYear ? `${MONTHS[p.answers.birthMonth - 1]} ${p.answers.birthYear}` : ""} />
            <Row k="Gender" v={p.options.genders.find((g) => g.value === p.answers.gender)?.label ?? ""} />
            {p.locked && (
              <p className="col-span-2 m-0 mt-1 rounded-xl bg-gray-100 px-3 py-2.5 text-[13.5px] leading-snug text-gray-600">
                Locked now that you're verified, so answers stay true. Need to change one? <a className="font-semibold text-gray-900" href="mailto:hello@joinstudy.io">Ask us</a>. Your {p.options.regionLabel.toLowerCase()} can still change:{" "}
                <Link className="font-semibold text-gray-900" to="/participate/about?part=where&from=profile">Moved?</Link>
              </p>
            )}
          </Section>
          <Section title="Languages" edit="languages">
            <Row k="First" v={p.answers.firstLanguage} />
            <Row k="Also" v={p.answers.languages.join(", ")} />
          </Section>
          <Section title="Education, work, devices" edit="work">
            <Row k="Education" v={p.options.education.find((o) => o.value === p.answers.education)?.label ?? ""} />
            <Row k="Student" v={p.answers.student === "yes" ? "Yes" : p.answers.student === "no" ? "No" : ""} />
            <Row k="Work" v={p.options.work.find((o) => o.value === p.answers.work)?.label ?? ""} />
            <Row k="Devices" v={p.answers.devices.map((d) => p.options.devices.find((o) => o.value === d)?.label ?? d).join(", ")} />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, edit, children }: { title: string; edit?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[20px] border border-gray-200 bg-white p-[18px]" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[17px] font-semibold">{title}</h2>
        {edit && (
          <Link to={`/participate/about?part=${edit}&from=profile`} className="py-2 text-[15px] font-semibold text-gray-950 underline underline-offset-4">
            Edit<span className="sr-only"> {title.toLowerCase()}</span>
          </Link>
        )}
      </div>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">{children}</dl>
    </section>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => (
  <>
    <dt className="text-gray-500">{k}</dt>
    <dd className="m-0 break-words">{v || <span className="text-gray-400">Not answered</span>}</dd>
  </>
);

function Dot({ done, dashed }: { done: boolean; dashed?: boolean }) {
  return done ? (
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#f0c93a]" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 14 14"><path d="m3 7.2 2.6 2.6L11 4.4" fill="none" stroke="#120e22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  ) : (
    <span className={`h-6 w-6 flex-none rounded-full border-[1.5px] ${dashed ? "border-dashed" : ""} border-[#bdb6de]`} aria-hidden="true" />
  );
}

function Trust({ p }: { p: ParticipantProfile }) {
  const [start, { isLoading: starting }] = useStartLinkedinMutation();
  const [disconnect, { isLoading: leaving }] = useDisconnectLinkedinMutation();
  const [problem, setProblem] = useState("");
  const verified = p.verification === "verified";
  const connect = async () => {
    setProblem("");
    try {
      const r = (await start().unwrap()).data;
      window.location.assign(r.url);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <section aria-labelledby="pf-trust" className="flex flex-col gap-3.5 rounded-[20px] bg-[#120e22] p-[18px] text-white">
      <h2 id="pf-trust" className="m-0 text-[22px] font-bold tracking-tight">Your trust level</h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px]">
        <li className="flex items-start gap-3"><Dot done /><span>Email confirmed</span></li>
        <li className="flex items-start gap-3">
          <Dot done={verified} />
          {verified ? (
            <span>Verified, one real person</span>
          ) : (
            <span className="flex flex-col gap-0.5">
              <span>Not verified yet</span>
              <span className="text-[13.5px] text-[#bdb6de]">Happens once, when a study fits you. <Link to="/participate/verify" className="text-[#f0c93a] underline">Check now</Link></span>
            </span>
          )}
        </li>
        <li className="flex items-start gap-3">
          <Dot done={p.linkedin.connected} dashed />
          {p.linkedin.connected ? (
            <span className="flex flex-col gap-1">
              <span>LinkedIn connected</span>
              <button type="button" onClick={() => disconnect()} disabled={leaving} className="self-start py-1 text-[13.5px] text-[#bdb6de] underline">Disconnect</button>
            </span>
          ) : (
            <span className="flex flex-col gap-2">
              <span>LinkedIn <span className="text-[#bdb6de]">(optional)</span></span>
              <span className="text-[13.5px] leading-snug text-[#bdb6de]">Some studies are only open to people who've connected LinkedIn. We keep only that it's connected, not your profile.</span>
              <button type="button" onClick={connect} disabled={starting} className="h-10 self-start rounded-full bg-[#f0c93a] px-4 text-[14px] font-semibold text-[#251d00]">
                {starting ? "Opening LinkedIn…" : "Connect LinkedIn"}
              </button>
              {p.linkedin.testMode && <span className="text-[12.5px] text-[#bdb6de]">Test mode: connects without visiting LinkedIn.</span>}
            </span>
          )}
        </li>
      </ul>
      {problem && <div role="alert" className="rounded-xl bg-orange-50 px-3 py-2 text-[14px] text-orange-900">{problem}</div>}
    </section>
  );
}

/** Participant Stage 3 (canvas 3.4): the new-study email, on or off. */
function StudyEmails() {
  const on = useGetParticipantHomeQuery().data?.data.alerts.email;
  const [save, { isLoading }] = useSetStudyEmailsMutation();
  if (on === undefined) return null;
  return (
    <section aria-label="Study emails" className="flex items-center justify-between gap-3 rounded-[20px] border border-gray-200 bg-white p-[18px]">
      <span className="flex flex-col gap-0.5">
        <b className="text-[15px]" id="pf-emails">Email me when a study fits</b>
        <span className="text-[13.5px] text-gray-500">At most once a day. WhatsApp and text alerts come later.</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="pf-emails"
        disabled={isLoading}
        onClick={() => save(!on)}
        className={`relative h-7 w-[46px] flex-none rounded-full ${on ? "bg-[#120e22]" : "bg-gray-300"}`}
      >
        <span className={`absolute top-[3px] h-[22px] w-[22px] rounded-full transition-all ${on ? "right-[3px] bg-[#f0c93a]" : "left-[3px] bg-white"}`} />
      </button>
    </section>
  );
}
