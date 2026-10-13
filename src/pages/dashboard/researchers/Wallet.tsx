import { Download, Eye, WalletCards } from "lucide-react";
import { useState } from "react";
import { type LedgerLine, useGetResearcherWalletQuery } from "@/redux/api/walletApi";
import WalletModals, {
  WalletModalStep,
} from "@components/Dashboard/researcher/wallet/WalletModals";

const downloadStatement = (lines: LedgerLine[]) => {
  const rows = [["Date", "Study", "Amount", "Platform fee", "Currency"], ...lines.map((t) => [t.createdAt.slice(0, 10), t.title, String(t.amount), String(t.fee ?? 0), t.currency])];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: "joinstudy-research-spend.csv" }).click();
  URL.revokeObjectURL(url);
};

const Wallet = () => {
  const [modalStep, setModalStep] = useState<WalletModalStep | null>(null);
  const [visible, setVisible] = useState(true);
  const { data, isLoading } = useGetResearcherWalletQuery();
  const wallet = data?.data;
  const charges = (wallet?.transactions ?? []).filter((t) => t.kind === "charge");

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <section className="max-w-5xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-950">Wallet</h1>
            <p className="mt-3 text-xs text-gray-950">
              Track your survey spends
            </p>
          </div>


        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
          <div className="border-r border-gray-100 pr-7">
            <button type="button" onClick={() => setVisible(!visible)} className="flex items-center gap-2 text-xs text-gray-400" aria-pressed={!visible}>
              Research Spend <Eye size={14} className="fill-gray-950 text-gray-950" />
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">{wallet?.currency ?? "NGN"}</span>
              <strong className="text-2xl font-medium text-gray-950">
                {isLoading ? "…" : visible ? (wallet?.spent ?? 0).toLocaleString() : "••••"}
              </strong>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">Approved rewards plus platform fee</p>
          </div>

          <button
            type="button"
            onClick={() => setModalStep("select")}
            className="flex items-center justify-center gap-3 rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white"
          >
            <WalletCards size={15} />
            Add funds
          </button>

          <button
            type="button"
            onClick={() => downloadStatement(charges)}
            disabled={!charges.length}
            className="flex items-center justify-center gap-3 rounded-3xl bg-gray-100 px-6 py-3 text-xs text-gray-700 disabled:opacity-50"
          >
            <Download size={15} />
            Download statement
          </button>
        </div>
      </section>

      <section className="mt-4 max-w-5xl rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-950">Recent charges</h2>
        {charges.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            {isLoading ? "Loading…" : "You're charged when you approve a submission. Approved work will show here."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {charges.map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-950">{t.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString()} · includes {t.currency} {(t.fee ?? 0).toLocaleString()} fee
                  </p>
                </div>
                <span className="font-semibold text-gray-950">
                  {t.currency} {t.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WalletModals step={modalStep} setStep={setModalStep} />
    </div>
  );
};

export default Wallet;
