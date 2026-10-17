import React, { useState } from "react";
import { ChevronDown, Download, Landmark, HelpCircle } from "lucide-react";
import EarningsStatChart from "./EarningStats";

interface EarningsDashboardProps {
    pendingAmount?: number;
    onWithdraw?: () => void;
    onDownloadStatement?: () => void;
  }

  type Status = "Approved" | "Pending" | "Rejected";

interface StatusBadgeProps {
  status: Status;
}

interface ActivityItem {
    id: number;
    title: string;
    time: string;
    amount: number;
    status: Status; // ✅ important
  }


// --- Mock Data ---
const activityData: ActivityItem[] = [
  { id: 1, title: "Mobile Banking Study", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 2, title: "Mobile Banking Study", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 3, title: "Mobile Banking Study", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 4, title: "Mobile Banking Study", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 5, title: "Contract Review Task", time: "5 hours ago", amount: 25000, status: "Pending" },
  { id: 6, title: "Document Drafting", time: "1 day ago", amount: 15000, status: "Rejected" },
];

const paymentData = [
  { id: 1, method: "Bank Transfer", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 2, method: "Bank Transfer", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 3, method: "Bank Transfer", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 4, method: "Bank Transfer", time: "2 hours ago", amount: 40000, status: "Approved" },
  { id: 5, method: "Bank Transfer", time: "5 hours ago", amount: 20000, status: "Pending" },
  { id: 6, method: "Bank Transfer", time: "1 day ago", amount: 10000, status: "Rejected" },
];

// --- Status Badge ---
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const styles: Record<Status, string> = {
      Approved: "text-green-600 font-semibold text-xs",
      Pending: "text-yellow-500 font-semibold text-xs",
      Rejected: "text-red-500 font-semibold text-xs",
    };
  
    return <span className={styles[status]}>{status}</span>;
  };

// --- Tab Bar ---
type TabKey = "Approved" | "Pending" | "Rejected";

interface TabBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => {
  const tabs: TabKey[] = ["Approved", "Pending", "Rejected"];

  return (
    <div className="flex items-center gap-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`text-sm font-medium pb-1 ${
            active === tab
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

// --- Sort Button ---
const SortButton = () => (
  <button className="flex items-center gap-1.5 text-xs text-gray-500 font-medium hover:text-gray-700">
    Sort by:
    <ChevronDown className="w-3.5 h-3.5" />
  </button>
);

// --- Main Component ---
export default function EarningsDashboard({
    pendingAmount = 6700,
    onWithdraw,
    onDownloadStatement,
  }: EarningsDashboardProps) {
    const [activityTab, setActivityTab] = useState<TabKey>("Approved");
    const [paymentTab, setPaymentTab] = useState<TabKey>("Approved");
    const [showEarningsStat, setShowEarningsStat] = useState(true);

  const filteredActivity = activityData.filter(
    (a) => a.status === activityTab
  );
  const filteredPayments = paymentData.filter(
    (p) => p.status === paymentTab
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Pending Card */}
        <div className="bg-white rounded-2xl px-6 py-5 border shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                <span>Pending Transactions</span>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  NGN {pendingAmount.toLocaleString()}
                </span>
                <span className="text-xs text-yellow-600 bg-yellow-50 border rounded-full px-2.5 py-0.5">
                  Waiting Approval
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onWithdraw}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-full"
              >
                <Landmark className="w-4 h-4" />
                Withdraw funds
              </button>

              <button
                onClick={onDownloadStatement}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm rounded-full border"
              >
                <Download className="w-4 h-4" />
                Download statement
              </button>
            </div>
          </div>

          {/* Accordion */}
          <div className="mt-5 pt-5 border-t">
            <button
              onClick={() => setShowEarningsStat(!showEarningsStat)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm font-semibold text-gray-800">
                Earnings Stat
              </span>
              <ChevronDown
                className={`w-4 h-4 ${
                  showEarningsStat ? "rotate-180" : ""
                }`}
              />
            </button>
            {showEarningsStat && <EarningsStatChart />}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Activity */}
          <div className="bg-white rounded-2xl px-5 py-5 border shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <SortButton />
            </div>

            <TabBar active={activityTab} onChange={setActivityTab} />

            <div className="mt-4 space-y-4">
              {filteredActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  No {activityTab.toLowerCase()} activity
                </p>
              ) : (
                filteredActivity.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        NGN {item.amount.toLocaleString()}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-2xl px-5 py-5 border shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-semibold">Payment History</h3>
              <SortButton />
            </div>

            <TabBar active={paymentTab} onChange={setPaymentTab} />

            <div className="mt-4 space-y-4">
              {filteredPayments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  No {paymentTab.toLowerCase()} payments
                </p>
              ) : (
                filteredPayments.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.method}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold">
                      NGN {item.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}