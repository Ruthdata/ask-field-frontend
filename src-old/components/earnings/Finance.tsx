import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  Zap,
  TrendingUp,
} from "lucide-react";

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    value: string | number;
    change: string;
    currency?: string;
    showVisibility?: boolean;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
  }

const StatCard: React.FC<StatCardProps> = ({
    icon,
    iconBg,
    title,
    value,
    change,
    currency,
    showVisibility = false,
    isVisible = true,
    onToggleVisibility,
  }) => {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
  
          {showVisibility && (
            <button
              onClick={onToggleVisibility}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isVisible ? "Hide balance" : "Show balance"}
            >
              {isVisible ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
  
        <div>
          <p className="text-gray-500 text-sm mb-2">{title}</p>
  
          <div className="flex items-baseline gap-2">
            {currency && (
              <span className="text-gray-900 font-semibold text-lg">{currency}</span>
            )}
            <h3 className="text-gray-900 font-bold text-3xl">
              {isVisible ? value : "••••"}
            </h3>
          </div>
  
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-gray-400 text-xs">{change}</p>
          </div>
        </div>
      </div>
    );
  };

interface FinanceProps {
  currency?: string;
  available?: number;
  completedStudies?: number;
  loading?: boolean;
}

const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Finance = ({ currency = "NGN", available = 0, completedStudies = 0, loading = false }: FinanceProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Earnings</h1>
          <p className="text-gray-600">Track your study rewards and withdrawals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Available Balance"
            currency={currency}
            value={loading ? "…" : money(available)}
            change="Ready to withdraw"
            showVisibility={true}
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Completed Studies"
            value={loading ? "…" : completedStudies}
            change="Submitted or approved"
          />
        </div>
      </div>
    </div>
  );
};

export default Finance;
