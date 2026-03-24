import React, { useState } from "react";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Wallet,
  Zap,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { useCurrentUser } from "@hooks/useCurrentUser";
import StatCard from "./StatCard";



const DashboardSection = () => {
  const {getFirstName} = useCurrentUser()
  const [selectedPeriod, setSelectedPeriod] = useState("Last 3 days");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = [
    "Last 24 hours",
    "Last 3 days",
    "Last 7 days",
    "Last 30 days",
    "All time",
  ];

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {getFirstName()}!
            </h1>

            <div className="flex items-center gap-2">
              <p className="text-gray-600">
              Here’s a summary of all activities happening on your AskField account.
              </p>
              <button className="text-gray-400 hover:text-gray-600">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50"
            >
              <span className="text-gray-900 font-medium">
                {selectedPeriod}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 ${
                      selectedPeriod === period
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Available Balance"
            value="0.00"
            change="Since last 3 days"
            showVisibility={true}
            isVisible={isBalanceVisible}
            onToggleVisibility={() =>
              setIsBalanceVisible(!isBalanceVisible)
            }
          />

          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Completed Surveys"
            value={0}
            change="Since last 3 days"
            isVisible={true}
            onToggleVisibility={()=>{}}
            showVisibility={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;