import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { readProblem } from "@/lib/session";
import { useGetPayoutMethodQuery, useSavePayoutMethodMutation, type MethodOption, type PayoutMethod as Method } from "@/redux/api/moneyApi";
import { DISPLAY } from "../studies/studyText";
import { methodName } from "./methodText";

/** Participant canvas 6.2: where to send their money. Checked by the payout partner; the name must be theirs. */
export default function PayoutMethod() {
  const { data, isLoading } = useGetPayoutMethodQuery(undefined, { refetchOnMountOrArgChange: true });
  const v = data?.data;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <Link to="/dashboard/participant/earnings" className="-ml-1 flex items-center gap-1 self-start py-2 text-[15px] text-[#4b4664]">
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Your money
      </Link>
      <h1 style={DISPLAY} className="m-0 text-[26px] font-bold leading-[1.05] tracking-tight">How do you want to be paid?</h1>
      {isLoading && <div className="h-72 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" />}
      {v?.current && (
        <div className="rounded-2xl border border-[#ebe9f2] bg-white px-4 py-3 text-[14.5px]">
          Now: <b>{methodName(v.current)}</b> · {v.current.accountName}. Saving a different account pauses cash-outs for 48 hours.
        </div>
      )}
      {v && v.options.length === 0 && <p className="m-0 text-[15px]">We can't pay out in {v.country} yet.</p>}
      {v && v.options.length > 0 && <Form options={v.options} />}
    </div>
  );
}

function Form({ options }: { options: MethodOption[] }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>(options[0].method);
  const opt = options.find((o) => o.method === method)!;
  const [institution, setInstitution] = useState("");
  const [account, setAccount] = useState("");
  const [problem, setProblem] = useState("");
  const [save, { isLoading }] = useSavePayoutMethodMutation();
  const pick = (m: Method) => {
    setMethod(m);
    setInstitution("");
    setAccount("");
    setProblem("");
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProblem("");
    if (opt.institutionLabel && opt.institutions.length > 1 && !institution) return setProblem(`Choose your ${opt.institutionLabel.toLowerCase()}.`);
    if (!account.trim()) return setProblem(`Enter your ${opt.accountLabel.toLowerCase().replace(/ \(.*\)/, "")}.`);
    try {
      await save({ method, institution: institution || undefined, account }).unwrap();
      navigate("/dashboard/participant/earnings", { state: { saved: true } });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">Payout method</legend>
        {options.map((o) => (
          <label key={o.method} className={`flex items-start gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3.5 ${method === o.method ? "border-[#120e22]" : "border-[#ebe9f2]"}`}>
            <input type="radio" name="method" checked={method === o.method} onChange={() => pick(o.method)} className="mt-0.5 h-5 w-5 flex-none accent-[#120e22]" />
            <span className="flex flex-col gap-0.5"><b className="text-[15.5px]">{o.label}</b><span className="text-[13.5px] leading-snug text-[#646080]">{o.note}</span></span>
          </label>
        ))}
      </fieldset>
      {opt.institutionLabel && opt.institutions.length > 1 && (
        <div className="flex flex-col gap-2 text-[15px] font-semibold">
          <label htmlFor="pm-inst">{opt.institutionLabel}</label>
          <select id="pm-inst" value={institution} onChange={(e) => setInstitution(e.target.value)} className="h-[52px] rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3 text-[15px] font-normal">
            <option value="">Choose…</option>
            {opt.institutions.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-2 text-[15px] font-semibold">
        <label htmlFor="pm-acct">{opt.accountLabel}</label>
        <input
          id="pm-acct"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          inputMode={method === "paypal" ? "email" : "numeric"}
          type={method === "paypal" ? "email" : "text"}
          autoComplete="off"
          placeholder={opt.accountHint}
          className="h-[52px] rounded-[14px] border-[1.5px] border-[#120e22] bg-white px-3.5 font-mono text-[16px] tracking-wide placeholder:text-[#bdb6de]"
        />
      </div>
      {problem && <div role="alert" className="rounded-[14px] bg-[#fff4ed] px-3.5 py-3 text-[14.5px] leading-snug text-[#7c2d12]">{problem}</div>}
      <button type="submit" disabled={isLoading} className="h-[52px] rounded-full bg-[#120e22] font-semibold text-white disabled:opacity-60">{isLoading ? "Checking with our payout partner…" : "Save"}</button>
      <p className="m-0 text-[13.5px] leading-normal text-[#646080]">
        Checked and stored by our payout partner; joinStudy keeps only the last digits. The name must match the name on your joinStudy account. One payout account per person. Changing it later pauses cash-outs for 48 hours, and we email you.
      </p>
    </form>
  );
}
