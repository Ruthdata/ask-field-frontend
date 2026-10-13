import React, { useMemo, useState } from "react";
import { ChevronDown, Download, Landmark, HelpCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import EarningsStatChart from "./EarningStats";
import { formatApiError } from "@/utils/helper";
import {
  type LedgerLine,
  type ParticipantEarnings,
  type PayoutDetails,
  useRequestPayoutMutation,
  useSavePayoutDetailsMutation,
} from "@/redux/api/walletApi";

type TabKey = "Approved" | "Pending" | "Rejected";

/** Ledger status → the tab it belongs in. */
const tabOf = (t: LedgerLine): TabKey =>
  t.status === "available" || t.status === "paid" ? "Approved" : t.status === "cancelled" || t.status === "failed" ? "Rejected" : "Pending";

const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
};

const StatusBadge = ({ status }: { status: TabKey }) => {
  const styles: Record<TabKey, string> = {
    Approved: "text-green-600 font-semibold text-xs",
    Pending: "text-yellow-500 font-semibold text-xs",
    Rejected: "text-red-500 font-semibold text-xs",
  };
  return <span className={styles[status]}>{status}</span>;
};

const TabBar = ({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) => (
  <div className="flex items-center gap-4" role="tablist">
    {(["Approved", "Pending", "Rejected"] as TabKey[]).map((tab) => (
      <button
        key={tab}
        role="tab"
        aria-selected={active === tab}
        onClick={() => onChange(tab)}
        className={`text-sm font-medium pb-1 ${active === tab ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"}`}
      >
        {tab}
      </button>
    ))}
  </div>
);

/** Daily running total of approved earnings, for the chart. */
const chartData = (lines: LedgerLine[]) => {
  const days = new Map<string, number>();
  [...lines]
    .filter((t) => t.kind === "earning" && t.status === "available")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((t) => {
      const d = new Date(t.updatedAt || t.createdAt);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      days.set(key, (days.get(key) || 0) + t.amount);
    });
  let total = 0;
  return [...days].map(([date, amount]) => ({ date, amount: (total += amount) }));
};

function PayoutDetailsModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<PayoutDetails>({ method: "bank_transfer", bankName: "", accountName: "", accountNumber: "" });
  const [save, { isLoading }] = useSavePayoutDetailsMutation();
  const field = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save(form).unwrap();
      toast.success("Payout details saved.");
      onSaved();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="payout-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="payout-title" className="text-lg font-semibold text-gray-900">Where should we send your money?</h2>
            <p className="mt-1 text-xs text-gray-500">The account name should match your name on joinStudy.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="block space-y-1 text-sm">
          <span>Method</span>
          <select className={field} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PayoutDetails["method"] })}>
            <option value="bank_transfer">Bank transfer</option>
            <option value="mobile_money">Mobile money</option>
            <option value="paypal">PayPal</option>
          </select>
        </label>
        {form.method !== "paypal" && (
          <label className="block space-y-1 text-sm">
            <span>{form.method === "mobile_money" ? "Provider" : "Bank"}</span>
            <input className={field} value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} required />
          </label>
        )}
        <label className="block space-y-1 text-sm">
          <span>Account name</span>
          <input className={field} value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required minLength={2} />
        </label>
        <label className="block space-y-1 text-sm">
          <span>{form.method === "paypal" ? "PayPal email" : form.method === "mobile_money" ? "Phone number" : "Account number"}</span>
          <input className={field} value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required minLength={4} />
        </label>
        <button type="submit" disabled={isLoading} className="w-full rounded-full bg-gray-900 px-5 py-3 text-sm text-white disabled:opacity-60">
          {isLoading ? "Saving…" : "Save and withdraw"}
        </button>
      </form>
    </div>
  );
}

interface EarningsDashboardProps {
  earnings?: ParticipantEarnings;
  loading?: boolean;
  pendingAmount?: number;
  onWithdraw?: () => void;
  onDownloadStatement?: () => void;
}

export default function EarningsDashboard({ earnings, loading }: EarningsDashboardProps) {
  const [activityTab, setActivityTab] = useState<TabKey>("Approved");
  const [paymentTab, setPaymentTab] = useState<TabKey>("Approved");
  const [showEarningsStat, setShowEarningsStat] = useState(true);
  const [askDetails, setAskDetails] = useState(false);
  const [requestPayout, { isLoading: withdrawing }] = useRequestPayoutMutation();

  const currency = earnings?.currency ?? "NGN";
  const lines = useMemo(() => earnings?.transactions ?? [], [earnings]);
  const activity = lines.filter((t) => t.kind === "earning" && tabOf(t) === activityTab);
  const payments = lines.filter((t) => t.kind === "payout" && tabOf(t) === paymentTab);
  const data = useMemo(() => chartData(lines), [lines]);
  const approvedTotal = lines.filter((t) => t.kind === "earning" && t.status === "available").reduce((n, t) => n + t.amount, 0);

  const withdraw = async () => {
    if (!earnings) return;
    if (earnings.available < earnings.minPayout) {
      toast.error(`You can withdraw once your balance reaches ${currency} ${earnings.minPayout.toLocaleString()}.`);
      return;
    }
    try {
      const res = await requestPayout({}).unwrap();
      toast.success(res.message || "Withdrawal requested.");
    } catch (err) {
      const message = formatApiError(err);
      if (/payout details/i.test(message)) setAskDetails(true);
      else toast.error(message);
    }
  };

  const downloadStatement = () => {
    const rows = [["Date", "Type", "Description", "Status", "Amount", "Currency"], ...lines.map((t) => [t.createdAt.slice(0, 10), t.kind, t.title, t.status, String(t.amount), t.currency])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "joinstudy-statement.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl px-6 py-5 border shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                <span>Pending Transactions</span>
                <span title="Rewards for studies you've submitted. They move to your balance once the researcher approves.">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {currency} {loading ? "…" : (earnings?.pending ?? 0).toLocaleString()}
                </span>
                {!!earnings?.pending && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 border rounded-full px-2.5 py-0.5">Waiting Approval</span>
                )}
              </div>
              {!!earnings?.processing && (
                <p className="mt-1 text-xs text-gray-500">
                  {currency} {earnings.processing.toLocaleString()} on its way to you
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={withdraw}
                disabled={withdrawing || loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-full disabled:opacity-60"
              >
                <Landmark className="w-4 h-4" />
                {withdrawing ? "Requesting…" : "Withdraw funds"}
              </button>
              <button
                onClick={downloadStatement}
                disabled={!lines.length}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm rounded-full border disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download statement
              </button>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t">
            <button onClick={() => setShowEarningsStat(!showEarningsStat)} className="flex items-center justify-between w-full" aria-expanded={showEarningsStat}>
              <span className="text-sm font-semibold text-gray-800">Earnings Stat</span>
              <ChevronDown className={`w-4 h-4 ${showEarningsStat ? "rotate-180" : ""}`} />
            </button>
            {showEarningsStat &&
              (data.length ? (
                <EarningsStatChart totalEarnings={approvedTotal} data={data} />
              ) : (
                <p className="py-8 text-center text-xs text-gray-400">Your approved earnings will show here.</p>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl px-5 py-5 border shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
            <TabBar active={activityTab} onChange={setActivityTab} />
            <div className="mt-4 space-y-4">
              {activity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No {activityTab.toLowerCase()} activity</p>
              ) : (
                activity.map((item) => (
                  <div key={item._id} className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{ago(item.updatedAt || item.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {item.currency} {item.amount.toLocaleString()}
                      </p>
                      <StatusBadge status={tabOf(item)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl px-5 py-5 border shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Payment History</h3>
            <TabBar active={paymentTab} onChange={setPaymentTab} />
            <div className="mt-4 space-y-4">
              {payments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No {paymentTab.toLowerCase()} payments</p>
              ) : (
                payments.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-400">{ago(item.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {item.currency} {item.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {askDetails && (
        <PayoutDetailsModal
          onClose={() => setAskDetails(false)}
          onSaved={() => {
            setAskDetails(false);
            withdraw();
          }}
        />
      )}
    </div>
  );
}
