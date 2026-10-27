import { useEffect, useRef, useState, type ReactNode } from "react";
import { useConfirmTestPaymentMutation, useGetLaunchQuery } from "@/redux/api/launchApi";
import {
  useAddPlacesMutation,
  useAddTimesMutation,
  useCloseEarlyMutation,
  useSetCloseDateMutation,
  useSetPausedMutation,
  type AddPlacesResult,
  type LiveView,
} from "@/redux/api/runApi";
import { StripeCard } from "@/components/payments/StripeCard";
import { formatMoney } from "@/lib/study";
import { readProblem } from "@/lib/session";
import { SUPPORT_EMAIL } from "@/lib/site";

export type Change = "pause" | "places" | "date" | "close" | "times";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input,button,select,textarea")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div className="jr-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="jr-dialog" role="dialog" aria-modal="true" aria-labelledby="jr-dlg-t">
        <h2 id="jr-dlg-t">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** Pause or resume, add places (paid), change the close date, add interview times, or close early. */
export default function ChangeDialog({ kind, live, onClose }: { kind: Change; live: LiveView; onClose: () => void }) {
  if (kind === "places") return <AddPlaces live={live} onClose={onClose} />;
  if (kind === "times") return <AddTimes live={live} onClose={onClose} />;
  return <Simple kind={kind} live={live} onClose={onClose} />;
}

function Simple({ kind, live, onClose }: { kind: "pause" | "date" | "close"; live: LiveView; onClose: () => void }) {
  const [setPaused, pauseState] = useSetPausedMutation();
  const [setCloseDate, dateState] = useSetCloseDateMutation();
  const [closeEarly, closeState] = useCloseEarlyMutation();
  const [date, setDate] = useState(live.closes || "");
  const [problem, setProblem] = useState("");
  const busy = pauseState.isLoading || dateState.isLoading || closeState.isLoading;
  const cur = live.money.currency;
  const c = live.counts;
  const unusedPlaces = Math.max(0, live.places - c.approved - c.toReview - c.inProgress);
  const go = async () => {
    setProblem("");
    try {
      if (kind === "pause") await setPaused({ id: live.surveyId, paused: !live.paused }).unwrap();
      if (kind === "date") await setCloseDate({ id: live.surveyId, date: date || null }).unwrap();
      if (kind === "close") await closeEarly(live.surveyId).unwrap();
      onClose();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const today = new Date().toISOString().slice(0, 10);
  const title = kind === "pause" ? (live.paused ? "Resume the study?" : "Pause the study?") : kind === "date" ? "Change the close date" : "Close the study early?";
  const goLabel = kind === "pause" ? (live.paused ? "Resume" : "Pause") : kind === "date" ? "Save" : "Close it now";
  return (
    <Dialog title={title} onClose={onClose}>
      {kind === "pause" && !live.paused && (
        <ul>
          <li>New people can't start.</li>
          <li>{c.inProgress ? `The ${c.inProgress} ${c.inProgress === 1 ? "person" : "people"} taking it now can finish, and you review them as usual.` : "Nobody is taking it right now."}</li>
          {live.bookings && <li>Booked {live.method === "interview" ? "interviews" : "sessions"} still go ahead; no new bookings.</li>}
          <li>Nothing is charged while it's paused. Resume any time.</li>
        </ul>
      )}
      {kind === "pause" && live.paused && <p className="jr-muted">Matching participants will see it again straight away.</p>}
      {kind === "close" && (
        <ul>
          <li>No one new can start.</li>
          {c.inProgress > 0 && <li>The {c.inProgress} {c.inProgress === 1 ? "person" : "people"} taking it now get 2 hours to finish.</li>}
          {live.bookings && live.bookings.booked > 0 && <li>Future bookings are cancelled, and we tell those participants.</li>}
          {c.toReview > 0 && <li>Review the {c.toReview} waiting for you; anything left is approved after 7 days.</li>}
          <li>Then unused money{unusedPlaces > 0 ? ` (about ${formatMoney(unusedPlaces * live.perPerson, cur)} plus its fee, for ${unusedPlaces} places)` : ""} comes back as credit.</li>
          <li>You can't reopen a closed study. To recruit more later, start a new one.</li>
        </ul>
      )}
      {kind === "date" && (
        <div className="jr-field">
          <label htmlFor="jr-close">Close on</label>
          <input id="jr-close" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          <span className="jr-muted">It closes at the end of that day, even if places are left. Leave it empty to close when full.</span>
        </div>
      )}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <div className="jr-btns">
        <button type="button" className={`jr-btn ${kind === "close" ? "ink" : "sun"}`} onClick={go} disabled={busy}>{busy ? "One moment…" : goLabel}</button>
        <button type="button" className="jr-btn" onClick={onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}

function AddPlaces({ live, onClose }: { live: LiveView; onClose: () => void }) {
  const id = live.surveyId;
  const { data } = useGetLaunchQuery(id);
  const lv = data?.data;
  const focus = live.method === "focus-group";
  const [extra, setExtra] = useState(focus ? 0 : Math.max(1, Math.round(live.places / 5)));
  const [session, setSession] = useState("");
  const [picked, setMethod] = useState<"card" | "invoice">("card");
  const [useCredit, setUseCredit] = useState(false);
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<AddPlacesResult | null>(null);
  const [addPlaces, addState] = useAddPlacesMutation();
  const [confirmTest, testState] = useConfirmTestPaymentMutation();
  const cur = live.money.currency;
  const feeRate = lv?.figures.feeRate ?? 0;
  const perGroup = Number((lv?.plan.setup as Record<string, unknown> | undefined)?.perGroup) || 0;
  const count = focus ? perGroup : extra;
  const cost = Math.round(count * live.perPerson * (1 + feeRate) * 100) / 100;
  const credit = useCredit ? Math.min(lv?.credit ?? 0, cost) : 0;
  const cardsOff = lv?.payments.cards === "unavailable";
  // Cards off (Stripe not set up): start on invoice, so the Pay button works straight away.
  const method = cardsOff && picked === "card" ? "invoice" : picked;

  const pay = async () => {
    setProblem("");
    try {
      const body = focus ? { session: session ? new Date(session).toISOString() : "" } : { extra };
      const res = (await addPlaces({ id, ...body, method, useCredit }).unwrap()).data;
      if (res.status === "paid") onClose();
      else setResult(res);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const confirm = async () => {
    if (!result?.fundingId) return;
    try {
      await confirmTest({ fundingId: result.fundingId, id }).unwrap();
      onClose();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };

  if (result && result.status === "pending" && result.method === "card") {
    return (
      <Dialog title={`Pay ${formatMoney(result.amount, result.currency)}`} onClose={onClose}>
        {result.provider === "stripe" && result.publishableKey ? (
          <StripeCard publishableKey={result.publishableKey} clientSecret={result.clientSecret} amountLabel={formatMoney(result.amount, result.currency)} returnUrl={`${window.location.origin}/dashboard/researcher/studies/${id}?paid=1`} />
        ) : (
          <>
            <p className="jr-muted"><b>Test payments.</b> Card payments aren't connected in this environment, so no real money moves.</p>
            {problem && <div className="jr-error" role="alert">{problem}</div>}
            <div className="jr-btns">
              <button type="button" className="jr-btn sun" onClick={confirm} disabled={testState.isLoading}>{testState.isLoading ? "Paying…" : `Pay ${formatMoney(result.amount, result.currency)} (test)`}</button>
              <button type="button" className="jr-btn" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </Dialog>
    );
  }
  if (result && result.status === "pending" && result.method === "invoice") {
    return (
      <Dialog title="Invoice sent" onClose={onClose}>
        <p className="jr-muted">Invoice {result.number} for {formatMoney(result.amount, result.currency)} is in your email. Quote <b>{result.reference}</b> with the transfer. The places open when the money arrives.</p>
        <div className="jr-btns"><button type="button" className="jr-btn sun" onClick={onClose}>Done</button></div>
      </Dialog>
    );
  }

  return (
    <Dialog title={focus ? "Add a session" : "Add places"} onClose={onClose}>
      <p className="jr-muted">{focus ? `A new session for ${perGroup || "your group size of"} people. Paid now; it opens for booking once paid.` : "Paid now, the same way as before. Quotas grow evenly."}</p>
      {focus ? (
        <div className="jr-field">
          <label htmlFor="jr-sess">Date and time (your time)</label>
          <input id="jr-sess" type="datetime-local" value={session} onChange={(e) => setSession(e.target.value)} />
        </div>
      ) : (
        <div className="jr-field">
          <label htmlFor="jr-extra">Extra {live.method === "interview" ? "interviews" : "places"}</label>
          <div className="ja-step big">
            <button type="button" aria-label="One fewer" onClick={() => setExtra(Math.max(1, extra - 1))}>−</button>
            <input id="jr-extra" type="number" min={1} max={10000} value={extra} onChange={(e) => setExtra(Math.max(1, Math.min(10000, Math.floor(Number(e.target.value) || 1))))} />
            <button type="button" aria-label="One more" onClick={() => setExtra(Math.min(10000, extra + 1))}>+</button>
          </div>
        </div>
      )}
      <div className="jr-cost" aria-live="polite">
        <span>{count} × {formatMoney(live.perPerson, cur)} + {Math.round(feeRate * 100)}% fee{credit > 0 ? ` − ${formatMoney(credit, cur)} credit` : ""}</span>
        <b>{formatMoney(Math.max(0, cost - credit), cur)}</b>
      </div>
      <div role="radiogroup" aria-label="How you'll pay" className="jr-opts">
        <button type="button" role="radio" aria-checked={method === "card"} className="jr-opt" disabled={cardsOff} onClick={() => setMethod("card")}><b>Card</b><span>{cardsOff ? `Not available yet. Email ${SUPPORT_EMAIL}.` : "Places open straight away."}</span></button>
        <button type="button" role="radio" aria-checked={method === "invoice"} className="jr-opt" onClick={() => setMethod("invoice")}><b>Invoice</b><span>Places open when the money arrives.</span></button>
      </div>
      {(lv?.credit ?? 0) > 0 && (
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}>
          <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} /> Use credit from closed studies ({formatMoney(lv!.credit, cur)})
        </label>
      )}
      <span className="jr-muted" style={{ fontSize: 13.5 }}>The receipt goes to the same details as your last payment.</span>
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <div className="jr-btns">
        <button type="button" className="jr-btn sun" onClick={pay} disabled={addState.isLoading || !lv || (focus && !session) || (method === "card" && cardsOff && cost - credit > 0)}>
          {addState.isLoading ? "One moment…" : cost - credit <= 0 ? "Add with credit" : method === "card" ? `Continue · ${formatMoney(cost - credit, cur)}` : "Send me the invoice"}
        </button>
        <button type="button" className="jr-btn" onClick={onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}

function AddTimes({ live, onClose }: { live: LiveView; onClose: () => void }) {
  const { data } = useGetLaunchQuery(live.surveyId);
  const setup = (data?.data.plan.setup || {}) as { weekly?: string[]; to?: string; timeZone?: string };
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState("09:00");
  const [to, setTo] = useState("");
  const [problem, setProblem] = useState("");
  const [addTimes, state] = useAddTimesMutation();
  const go = async () => {
    setProblem("");
    try {
      await addTimes({ id: live.surveyId, weekly: days.map((d) => `${d} ${time}`), to: to || undefined }).unwrap();
      onClose();
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <Dialog title="Add more times" onClose={onClose}>
      <p className="jr-muted">Free: the number of interviews stays the same. Times are in {setup.timeZone || "your time zone"}.{setup.weekly?.length ? ` You offer ${setup.weekly.length} weekly times now.` : ""}</p>
      <div className="jr-field">
        <span style={{ fontWeight: 600 }}>On</span>
        <div className="jr-times" role="group" aria-label="Days">
          {DAYS.map((d) => (
            <button key={d} type="button" className="jr-time" aria-pressed={days.includes(d)} onClick={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d])}>{d}</button>
          ))}
        </div>
      </div>
      <div className="jr-field">
        <label htmlFor="jr-at">At</label>
        <input id="jr-at" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="jr-field">
        <label htmlFor="jr-to">Keep booking until <span className="jr-muted">(optional, now {setup.to || "—"})</span></label>
        <input id="jr-to" type="date" min={setup.to} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      <div className="jr-btns">
        <button type="button" className="jr-btn sun" onClick={go} disabled={state.isLoading || (!days.length && !to)}>{state.isLoading ? "Saving…" : "Add times"}</button>
        <button type="button" className="jr-btn" onClick={onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}
