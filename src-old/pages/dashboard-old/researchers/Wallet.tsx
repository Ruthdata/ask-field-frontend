import { CalendarDays, ChevronDown, Download, Eye, WalletCards } from "lucide-react";
import { useState } from "react";
import WalletModals, {
  WalletModalStep,
} from "@components/Dashboard/researcher/wallet/WalletModals";

const Wallet = () => {
  const [modalStep, setModalStep] = useState<WalletModalStep | null>(null);

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

          <button
            type="button"
            className="flex w-fit items-center gap-3 rounded-3xl bg-gray-50 px-5 py-3 text-xs text-gray-950"
          >
            <CalendarDays size={16} />
            Last 3 days
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
          <div className="border-r border-gray-100 pr-7">
            <p className="flex items-center gap-2 text-xs text-gray-400">
              Research Spend <Eye size={14} className="fill-gray-950 text-gray-950" />
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-500">NGN</span>
              <strong className="text-2xl font-medium text-gray-950">
                56,700
              </strong>
              <span className="rounded-2xl bg-yellow-50 px-3 py-1 text-[11px] font-medium text-yellow-500">
                Waiting Approval
              </span>
            </div>
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
            className="flex items-center justify-center gap-3 rounded-3xl bg-gray-100 px-6 py-3 text-xs text-gray-700"
          >
            <Download size={15} />
            Download statement
          </button>
        </div>
      </section>

      <WalletModals step={modalStep} setStep={setModalStep} />
    </div>
  );
};

export default Wallet;
