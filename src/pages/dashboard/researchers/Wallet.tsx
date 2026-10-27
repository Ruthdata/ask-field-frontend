import { Download } from "lucide-react";
import "@/styles/run.css";
import { Link } from "react-router-dom";
import { type LedgerLine, useGetResearcherWalletQuery } from "@/redux/api/walletApi";
import { openFundingDocument } from "@/redux/api/launchApi";
import { openStatement, useGetClosedStudiesQuery } from "@/redux/api/runApi";
import { formatMoney, RECEIPT_COUNTRIES } from "@/lib/study";
import { useState } from "react";
import { downloadPayments, useGetBillingQuery, useSaveBillingMutation, type BillingDetails } from "@/redux/api/accountApi";
import type { Receipt } from "@/redux/api/launchApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { readProblem } from "@/lib/session";

const downloadStatement = (lines: LedgerLine[]) => {
  const rows = [["Date", "Study", "Amount", "Platform fee", "Currency"], ...lines.map((t) => [t.createdAt.slice(0, 10), t.title, String(t.amount), String(t.fee ?? 0), t.currency])];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: "joinstudy-research-spend.csv" }).click();
  URL.revokeObjectURL(url);
};

const STATUS: Record<string, string> = { pending: "Waiting for payment", paid: "Paid", refunded: "Refunded" };

/** Payments: what was paid for each study (with receipts), and what's been paid out for approved work. */
export default function Wallet() {
  const { data, isLoading, isError } = useGetResearcherWalletQuery();
  const w = data?.data;
  const cur = w?.currency ?? "USD";
  const charges = (w?.transactions ?? []).filter((t) => t.kind === "charge");
  const fundings = w?.fundings ?? [];
  const { data: closedData } = useGetClosedStudiesQuery(undefined, { refetchOnMountOrArgChange: true });
  const closed = closedData?.data;
  return (
    <div className="ja-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 className="ja-h1">Payments</h1>
        <p className="ja-lede">You pay for each study when you launch it. Participants are paid, and the fee charged, as you approve their work. Only owners and admins can pay.</p>
      </div>
      {isError && <div className="ja-error" role="alert">We couldn't load your payments.</div>}

      <section className="ja-grid" aria-label="Totals">
        <div className="ja-card ja-stat" style={{ gap: 6 }}>
          <span className="ja-muted">Paid for approved work</span>
          <span className="big">{isLoading ? "…" : formatMoney(w?.spent ?? 0, cur)}</span>
          <span className="ja-small">Participant pay plus the fee</span>
        </div>
        <div className="ja-card ja-stat" style={{ gap: 6 }}>
          <span className="ja-muted">Credit</span>
          <span className="big">{isLoading ? "…" : formatMoney(w?.credit ?? 0, cur)}</span>
          <span className="ja-small">Money back from closed studies; used when you pay for the next one</span>
        </div>
        {(closed?.refundsOnTheWay ?? 0) > 0 && (
          <div className="ja-card ja-stat" style={{ gap: 6 }}>
            <span className="ja-muted">Refunds on the way</span>
            <span className="big">{formatMoney(closed!.refundsOnTheWay, cur)}</span>
            <span className="ja-small">Back to your card; banks take 5 to 10 days</span>
          </div>
        )}
      </section>

      {closed && closed.studies.length > 0 && (
        <section className="ja-card" aria-labelledby="closed-h">
          <h2 id="closed-h" className="ja-h3">Closed studies</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {closed.studies.map((c) => {
              const st = c.settlement;
              const back = st ? [st.credit > 0 && `${formatMoney(st.credit, cur)} returned as credit`, st.refunded > 0 && `${formatMoney(st.refunded, cur)} refunded to card`].filter(Boolean).join(" · ") || "nothing left over" : "";
              return (
                <li key={c.surveyId} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                  <span style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <b style={{ fontWeight: 600 }}>{c.name}</b>
                    <span className="ja-small">{st ? `Finished ${new Date(st.at).toLocaleDateString()} · ${st.approved} approved · ${back}` : `Closed ${new Date(c.closedAt).toLocaleDateString()} · settling${c.toReview ? ` · ${c.toReview} to review` : ""}`}</span>
                  </span>
                  {st ? <button type="button" className="ja-link" onClick={() => openStatement(c.surveyId)}>Statement</button> : <Link className="ja-link" to={`/dashboard/researcher/studies/${c.surveyId}`}>Open</Link>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ReceiptDetails />

      <section className="ja-card" aria-labelledby="pay-h">
        <div className="ja-row">
          <h2 id="pay-h" className="ja-h3">Payments for studies</h2>
          <YearDownload />
        </div>
        {fundings.length === 0 ? (
          <p className="ja-muted">{isLoading ? "Loading…" : <>Nothing yet. You pay when you launch a study. <Link to="/dashboard/researcher/new" style={{ color: "var(--ink)" }}>Start one</Link></>}</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {fundings.map((f) => (
              <li key={f.fundingId} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ fontWeight: 600 }}>{f.title}</b>
                  <span className="ja-small">{f.number ? `${f.number} · ` : ""}{f.method === "card" ? "Card" : f.method === "invoice" ? "Invoice" : "Credit"} · {STATUS[f.status] ?? f.status} · {new Date(f.paidAt || f.createdAt).toLocaleDateString()}{f.paidByName ? ` · ${f.paidByName}` : ""}</span>
                </span>
                <span style={{ fontFamily: "var(--mono)" }}>{formatMoney(f.amount + (f.creditUsed || 0), f.currency)}</span>
                <button type="button" className="ja-link" onClick={() => openFundingDocument(f.fundingId)}>{f.status === "pending" ? "Invoice" : "Receipt"}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ja-card" aria-labelledby="ch-h">
        <div className="ja-row">
          <h2 id="ch-h" className="ja-h3">Approved work</h2>
          <button type="button" className="ja-link" onClick={() => downloadStatement(charges)} disabled={!charges.length} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Download size={15} aria-hidden="true" />Download statement</button>
        </div>
        {charges.length === 0 ? (
          <p className="ja-muted">{isLoading ? "Loading…" : "When you approve a participant's work, it shows here."}</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {charges.map((t) => (
              <li key={t._id} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ fontWeight: 600 }}>{t.title}</b>
                  <span className="ja-small">{new Date(t.createdAt).toLocaleDateString()} · includes {formatMoney(t.fee ?? 0, t.currency)} fee</span>
                </span>
                <span style={{ fontFamily: "var(--mono)" }}>{formatMoney(t.amount, t.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Stage 9: a year's payments as CSV, for a finance office. */
function YearDownload() {
  const year = new Date().getFullYear();
  const [problem, setProblem] = useState("");
  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button type="button" className="ja-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => downloadPayments(year).catch((e) => setProblem(e.message))}><Download size={15} aria-hidden="true" />Download {year} as CSV</button>
      {problem && <span className="ja-small" role="alert">{problem}</span>}
    </span>
  );
}

/** Stage 9: the workspace's receipt details, filled in whenever anyone in it pays. */
function ReceiptDetails() {
  const { data } = useGetBillingQuery();
  const b = data?.data;
  // The form starts again from the saved details after each save (the key), so "Saved" lives here and survives that.
  const [ok, setOk] = useState("");
  return b ? <ReceiptForm key={JSON.stringify(b)} b={b} ok={ok} setOk={setOk} /> : null;
}
function ReceiptForm({ b, ok, setOk }: { b: BillingDetails; ok: string; setOk: (m: string) => void }) {
  const ws = useWorkspace();
  const [v, setV] = useState<Receipt>({ name: b.name, organization: b.organization, email: b.email, cc: b.cc, reference: b.reference, country: RECEIPT_COUNTRIES.includes(b.country) ? b.country : "Other" });
  const [save, state] = useSaveBillingMutation();
  const [problem, setProblem] = useState("");
  const set = (patch: Partial<Receipt>) => {
    setOk("");
    setV({ ...v, ...patch });
  };
  const go = async () => {
    setOk("");
    setProblem("");
    try {
      await save(v).unwrap();
      setOk("Saved. These fill in the next payment.");
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const field = (id: string, label: string, k: keyof Receipt, type = "text") => (
    <div className="jr-field" style={{ flex: "1 1 220px" }}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={v[k]} disabled={!ws.canPay} onChange={(e) => set({ [k]: e.target.value })} />
    </div>
  );
  return (
    <section className="ja-card" aria-labelledby="rd-h">
      <h2 id="rd-h" className="ja-h3">Receipt details</h2>
      <span className="ja-small">Filled in when anyone in the workspace pays. They can still change them for one payment.{b.saved ? "" : " Not saved yet: these come from your profile."}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {field("rd-n", "Name on receipts", "name")}
        {field("rd-o", "Organisation", "organization")}
        {field("rd-e", "Send receipts to", "email", "email")}
        {field("rd-c", "Also copy (optional)", "cc", "email")}
        {field("rd-r", "Grant or PO reference (optional)", "reference")}
        <div className="jr-field" style={{ flex: "1 1 220px" }}>
          <label htmlFor="rd-k">Country</label>
          <select id="rd-k" value={v.country} disabled={!ws.canPay} onChange={(e) => set({ country: e.target.value })}>{RECEIPT_COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      </div>
      {ok && <span className="ja-small" role="status">{ok}</span>}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      {ws.canPay && <div className="jr-btns"><button type="button" className="jr-btn" onClick={go} disabled={state.isLoading}>Save receipt details</button></div>}
    </section>
  );
}
