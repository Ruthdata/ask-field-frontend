import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { useContactJoinStudyMutation, type HelpTopic } from "@/redux/api/participantAccountApi";
import { DISPLAY } from "../studies/studyText";
import { BTN_DARK, Field, INPUT, Problem } from "./ui";

/** Participant canvas 7.3: short answers, searchable, and a way to reach joinStudy. */

const P = "/dashboard/participant";
type QA = { q: string; a: ReactNode; text: string };
const qa = (q: string, text: string, a?: ReactNode): QA => ({ q, text, a: a ?? text });

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "Getting paid",
    items: [
      qa("When do I get paid for a study?", "When you finish, the researcher checks your work. Once they approve it, the money is ready to cash out. If they don't decide within 7 days, it's approved automatically. You can cash out from $5.", <>When you finish, the researcher checks your work. Once they approve it, the money is ready to cash out. If they don't decide within 7 days, it's approved automatically. You can cash out from $5 in <Link to={`${P}/earnings`}>Money</Link>.</>),
      qa("Why US dollars, and what rate do I get?", "Researchers abroad pay for studies in US dollars. When you cash out, you see the exact amount in your own money and the rate before you confirm. The rate is our payout partner's, and joinStudy charges you no fee."),
      qa("My cash-out didn't arrive", "Most cash-outs arrive within minutes. Open it in Money to see where it is. If your bank or network turns it down, it says why and the money comes back to your balance. Still missing after a day? Contact us with its reference (it starts JS-PO-).", <>Most cash-outs arrive within minutes. Open it in <Link to={`${P}/earnings`}>Money</Link> to see where it is. If your bank or network turns it down, it says why and the money comes back to your balance. Still missing after a day? Contact us below with its reference (it starts JS-PO-).</>),
    ],
  },
  {
    title: "Studies",
    items: [
      qa("Why don't I see many studies?", "You only see studies that fit you: your country, age and the answers in About you. Finish About you so more studies can match. We email you when a new one fits, at most once a day.", <>You only see studies that fit you: your country, age and the answers in <Link to={`${P}/profile`}>About you</Link>. Finish it so more studies can match. We email you when a new one fits, at most once a day.</>),
      qa("My time ran out. What now?", "Your place was held for a set time so the study couldn't overfill. When the time ran out, the place opened for someone else. It isn't counted against you. If you had finished, type the study's finish code: it still counts if a place is free."),
      qa("A study wasn't approved", "The reason is in My studies. If you think it's wrong, you can ask the researcher about it within 14 days. If they don't answer within 7 days, you can ask joinStudy to look.", <>The reason is in <Link to={`${P}/my-studies`}>My studies</Link>. If you think it's wrong, you can ask the researcher about it within 14 days. If they don't answer within 7 days, you can ask joinStudy to look.</>),
    ],
  },
  {
    title: "Verification and safety",
    items: [
      qa("Why do I need to verify?", "Researchers pay for answers from real people, each taking part once. You verify once, before your first study: a code on WhatsApp and a selfie. Then you never do it again."),
      qa("What happens to my selfie?", "Our verification partner checks it is really you and that you don't already have an account. joinStudy keeps only the result, not the photo or your face data."),
      qa("A study asked for money or my bank PIN", "Stop, and don't send anything. joinStudy and real studies never ask for a PIN, password, BVN or OTP, never ask you to pay, and never move you to WhatsApp or another site to finish. Report the study from its page. If you already shared bank details, call your bank now."),
    ],
  },
  {
    title: "My account",
    items: [
      qa("Change my name", "Your name is checked against your selfie and your payout account, so it can't be changed in Settings. If it's spelled wrong, contact us below."),
      qa("Get a copy of my data", "Go to Settings, then Your data, and choose Download a copy.", <>Go to <Link to={`${P}/settings/data`}>Settings, then Your data</Link>, and choose Download a copy.</>),
      qa("Close my account", "Go to Settings, then Your data, and choose Close my account. Cash out what's ready first: closing gives it up.", <>Go to <Link to={`${P}/settings/data`}>Settings, then Your data</Link>, and choose Close my account. Cash out what's ready first: closing gives it up.</>),
    ],
  },
];

const TOPICS: { value: HelpTopic; label: string }[] = [
  { value: "account", label: "My account" },
  { value: "money", label: "Money and cash-outs" },
  { value: "verification", label: "Getting verified" },
  { value: "study", label: "A study" },
  { value: "other", label: "Something else" },
];

export default function Help() {
  const [params] = useSearchParams();
  const asked = params.get("topic") as HelpTopic | null;
  const [query, setQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(Boolean(asked));
  const groups = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return GROUPS;
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => words.every((w) => `${i.q} ${i.text}`.toLowerCase().includes(w))) })).filter((g) => g.items.length);
  }, [query]);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">Help</h1>
      <label htmlFor="help-q" className="sr-only">Search answers</label>
      <input id="help-q" type="search" placeholder="Search answers" value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 rounded-[14px] border-[1.5px] border-[#ebe9f2] bg-white px-3.5 text-[16px] placeholder:text-[#646080]" />
      {groups.length === 0 && <p className="m-0 text-[15px] text-[#4b4664]">No answers match “{query}”. Write to us below.</p>}
      {groups.map((g) => (
        <section key={g.title} aria-label={g.title} className="flex flex-col rounded-[18px] border border-[#ebe9f2] bg-white px-4 py-1">
          <h2 className="m-0 mb-1 mt-3 font-mono text-[13px] font-normal uppercase text-[#646080]">{g.title}</h2>
          {g.items.map((i) => (
            <details key={i.q} className="group border-t border-[#ebe9f2] py-3" open={query.length > 2}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] [&::-webkit-details-marker]:hidden">
                <span>{i.q}</span>
                <span aria-hidden="true" className="flex-none text-[18px] leading-none group-open:rotate-45">+</span>
              </summary>
              <p className="m-0 mt-2 text-[14.5px] leading-relaxed text-[#4b4664] [&_a]:font-semibold [&_a]:text-[#120e22]">{i.a}</p>
            </details>
          ))}
        </section>
      ))}
      <section aria-labelledby="h-stuck" className="flex flex-col gap-2.5 rounded-[18px] bg-[#120e22] p-4 text-white">
        <h2 id="h-stuck" className="m-0 text-[17px] font-semibold">Still stuck?</h2>
        <span className="text-[14.5px] leading-snug text-[#bdb6de]">
          About a study's questions or times? <Link to={`${P}/messages`} className="text-[#f0c93a]">Message the researcher</Link>. About your account or money? Write to us; we answer within 2 working days.
        </span>
        {!contactOpen && <button type="button" onClick={() => setContactOpen(true)} className="flex h-12 items-center justify-center rounded-full bg-[#f0c93a] font-semibold text-[#251d00]">Contact joinStudy</button>}
      </section>
      {contactOpen && <Contact initial={asked && TOPICS.some((t) => t.value === asked) ? asked : null} />}
      <p className="m-0 text-center text-[14.5px] leading-snug text-[#4b4664]">
        A study asked for bank details, money or something harmful? Open it from <Link to={`${P}/my-studies`} className="font-semibold text-[#120e22]">My studies</Link> or <Link to={`${P}/studies`} className="font-semibold text-[#120e22]">Studies</Link> and choose “Report this study”.
      </p>
    </div>
  );
}

function Contact({ initial }: { initial: HelpTopic | null }) {
  const [topic, setTopic] = useState<HelpTopic | "">(initial ?? "");
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState("");
  const [sent, setSent] = useState("");
  const [send, { isLoading }] = useContactJoinStudyMutation();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (!topic) return setProblem("Choose what it's about.");
    if (message.trim().length < 20) return setProblem("Tell us a bit more (at least 20 characters).");
    try {
      setSent((await send({ topic, message: message.trim() }).unwrap()).data.reference);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-1.5 rounded-[18px] border-[1.5px] border-[#120e22] bg-white p-4">
        <b style={DISPLAY} className="text-[22px]">Thanks, we've got it</b>
        <span className="text-[15px] leading-normal text-[#4b4664]">Reference <b className="font-mono text-[#120e22]">{sent}</b>. We answer by email within 2 working days, and we've sent you a copy.</span>
      </div>
    );
  }
  return (
    <form id="contact" onSubmit={submit} noValidate className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-[#120e22] bg-white p-4">
      <b className="text-[16px]">Contact joinStudy</b>
      <Field id="ct-topic" label="What's it about?">
        <select id="ct-topic" value={topic} onChange={(e) => setTopic(e.target.value as HelpTopic)} className={INPUT}>
          <option value="">Choose one</option>
          {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field id="ct-msg" label="Your message" hint="Include any reference you have (like JS-PO-000123). Never send a PIN, password or OTP.">
        <textarea id="ct-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={`${INPUT} h-auto min-h-[120px] py-3 leading-normal`} />
      </Field>
      <Problem text={problem} />
      <button type="submit" disabled={isLoading} className={BTN_DARK}>{isLoading ? "Sending…" : "Send"}</button>
    </form>
  );
}
