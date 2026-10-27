import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetHomeQuery, useStartStudyMutation, type StudyMethod } from "@/redux/api/homeApi";
import { useGetPricingQuery, VERIFIABLE } from "@/redux/api/setupApi";
import { estimateCost, fairPay, formatMoney, METHODS, methodById, percent, rateDefaults, studyLink } from "@/lib/study";
import { readProblem } from "@/lib/session";
import Stepper from "@/components/researcher/Stepper";

/** 3.2 Cost estimate. Uses the fee this researcher will actually pay, from the server. */
export default function CostEstimate() {
  const navigate = useNavigate();
  const { data: pricingRes } = useGetPricingQuery();
  const { data: homeRes } = useGetHomeQuery();
  const pricing = pricingRes?.data;
  const account = homeRes?.data.account;
  const currency = pricing?.currency ?? "USD";
  const d = rateDefaults(currency, pricing?.recommendedHourlyPay);

  const [method, setMethod] = useState<StudyMethod>("survey");
  const [people, setPeople] = useState(100);
  const [groups, setGroups] = useState(3);
  const [perGroup, setPerGroup] = useState(6);
  const [minutes, setMinutes] = useState(15);
  const [rate, setRate] = useState<number | null>(null);
  const [start, { isLoading, error }] = useStartStudyMutation();

  const m = methodById(method)!;
  const isFocus = method === "focus-group";
  const count = isFocus ? groups * perGroup : people;
  const r = rate ?? d.rate;
  const academicEligible = !!account && VERIFIABLE.includes(account.organizationType) && account.verification !== "verified";
  const feeRate = account?.feeRate ?? pricing?.platformFeeRate ?? 0;
  const isAcademic = !!account && account.verification === "verified" && VERIFIABLE.includes(account.organizationType);
  const c = estimateCost(count, minutes, r, feeRate);
  const saving = pricing ? estimateCost(count, minutes, r, feeRate - pricing.academicFeeRate).fee : 0;
  const fair = fairPay(r, currency, pricing?.minHourlyPay, pricing?.recommendedHourlyPay);
  const lowPay = fair.level !== "ok";

  const pick = (id: StudyMethod) => {
    const next = methodById(id)!;
    setMethod(id);
    setMinutes(next.minutes);
    setPeople(next.people);
  };
  const go = async () => {
    const res = await start({ method, estimate: { participants: count, minutes, ratePerHour: r } }).unwrap().catch(() => null);
    if (res) navigate(studyLink({ ...res.data, status: "draft" }));
  };

  return (
    <div className="ja-page" style={{ maxWidth: 1040 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 className="ja-h1">What will my study cost?</h1>
        <p className="ja-lede">Participant pay plus the joinStudy fee. You pay it once, at launch, and anything you don't use comes back when you close the study.</p>
      </div>

      <div role="group" aria-label="Method" className="ja-chips">
        {METHODS.map((x) => (
          <button key={x.id} type="button" className="ja-chip" aria-pressed={x.id === method} onClick={() => pick(x.id)}>{x.label}</button>
        ))}
      </div>

      <div className="ja-cols">
        <section aria-label="Your numbers" className="ja-card" style={{ flex: "3 1 480px", gap: 4, padding: "clamp(20px, 3vw, 32px)", borderRadius: 28 }}>
          <div className="ja-est-rows">
            {isFocus ? (
              <>
                <Stepper big label="Groups" hint="Separate sessions" value={groups} onChange={setGroups} max={50} />
                <Stepper big label="People per group" hint="Most groups work best with 5 to 8" value={perGroup} onChange={setPerGroup} min={2} max={20} />
              </>
            ) : (
              <Stepper big label={method === "interview" ? "Interviews" : "Participants"} hint={method === "interview" ? "One person each" : "Completed responses you need"} value={people} onChange={setPeople} step={method === "interview" ? 1 : 10} max={100000} />
            )}
            <Stepper big label="Minutes each" hint="How long it takes one person" value={minutes} onChange={setMinutes} step={m.minStep} max={600} />
            <Stepper big label={`Pay per hour (${currency})`} hint="What a participant earns for an hour of this" value={r} onChange={setRate} step={d.step} min={0} max={1000000} />
          </div>
          <p className="ja-small" style={{ marginTop: 12, fontSize: 14 }}>{m.estimateNote}</p>
        </section>

        <section aria-label="Estimate" className="ja-card dark" style={{ flex: "2 1 320px", gap: 18 }}>
          <div className="ja-sum" aria-live="polite">
            <span className="r"><span>Each participant gets</span><span>{formatMoney(c.perPerson, currency)}</span></span>
            <span className="r"><span>Participant pay · {count} {count === 1 ? "person" : "people"}</span><span>{formatMoney(c.pay, currency)}</span></span>
            <span className="r"><span>joinStudy fee · {percent(feeRate)}{isAcademic ? " academic" : ""}</span><span>{formatMoney(c.fee, currency)}</span></span>
          </div>
          <div className="ja-grand">
            <span className="ja-on-night" style={{ fontSize: 14 }}>To fund at launch</span>
            <span className="big">{formatMoney(c.total, currency)}</span>
          </div>
          {academicEligible && pricing && saving > 0 && (
            <span className="ja-hint-sun">Verified academics pay {percent(pricing.academicFeeRate)}. On this study that's {formatMoney(saving, currency)} less. <Link to="/setup/verify" style={{ color: "var(--sun)", fontWeight: 600 }}>Verify →</Link></span>
          )}
          {error && <div className="ja-error" role="alert">{readProblem(error).message}</div>}
          <button type="button" className="ja-btn block" onClick={go} disabled={isLoading}>{isLoading ? "Starting…" : `Start a ${m.word} with these numbers`}</button>
          <span className="ja-on-night">We pay participants in their local currency.</span>
        </section>
      </div>

      <div className="ja-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
        <div className="ja-card" style={{ gap: 4, padding: "16px 18px", borderRadius: 18, ...(lowPay ? { border: "2px solid var(--ink)" } : {}) }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Fair pay</span>
          <span className="ja-muted">
            {fair.text}
          </span>
        </div>
        <div className="ja-card" style={{ gap: 4, padding: "16px 18px", borderRadius: 18 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Only pay for work you accept</span>
          <span className="ja-muted">The fee is charged only on work you approve. Rejected work and empty places come back to you when the study closes.</span>
        </div>
      </div>
    </div>
  );
}
