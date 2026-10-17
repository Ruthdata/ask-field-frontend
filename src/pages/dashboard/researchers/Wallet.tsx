import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { type LedgerLine, useGetResearcherWalletQuery } from "@/redux/api/walletApi";
import { openFundingDocument } from "@/redux/api/launchApi";
import { formatMoney } from "@/lib/study";

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
  return (
    <div className="ja-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 className="ja-h1">Payments</h1>
        <p className="ja-lede">You pay for each study when you launch it. Participants are paid, and the fee charged, as you approve their work.</p>
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
      </section>

      <section className="ja-card" aria-labelledby="pay-h">
        <h2 id="pay-h" className="ja-h3">Payments for studies</h2>
        {fundings.length === 0 ? (
          <p className="ja-muted">{isLoading ? "Loading…" : <>Nothing yet. You pay when you launch a study. <Link to="/dashboard/researcher/new" style={{ color: "var(--ink)" }}>Start one</Link></>}</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {fundings.map((f) => (
              <li key={f.fundingId} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", padding: "12px 0", borderBottom: "1px solid var(--line-2)" }}>
                <span style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <b style={{ fontWeight: 600 }}>{f.title}</b>
                  <span className="ja-small">{f.number ? `${f.number} · ` : ""}{f.method === "card" ? "Card" : f.method === "invoice" ? "Invoice" : "Credit"} · {STATUS[f.status] ?? f.status} · {new Date(f.paidAt || f.createdAt).toLocaleDateString()}</span>
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
