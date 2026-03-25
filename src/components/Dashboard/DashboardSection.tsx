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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import StatCard from "./StatCard";

const DashboardSection = () => {
  const { getFirstName } = useCurrentUser();
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
                Here’s a summary of all activities happening on your AskField
                account.
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
            isDisplayBalance={true}
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
          />

          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Completed Surveys"
            value={0}
            change="Since last 3 days"
            isVisible={true}
            onToggleVisibility={() => {}}
            showVisibility={true}
          />
        </div>
        <div className="flex flex-col px-4 py-5 shadow-lg bg-white rounded-2xl">
          <div className="flex mt-4 justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">Available Surveys</h3>
              <p className="text-gray-700 text-sm">
                Check out surveys tailored just for you and start earning
                rewards.
              </p>
            </div>
            <div>
              <button className="flex rounded-full border border-gray-500 px-8 py-2 gap-4 cursor-pointer">
                <span>See all</span>{" "}
                <img src="/images/shared/right-arrow.svg" alt="right arrow" />
              </button>
            </div>
          </div>
          <div className="bg-white mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-30 w-full relative rounded-2xl p-2 bg-red-300">
                <div className="absolute w-full h-8 bottom-2 bg-linear-to-r from-[#FF5BC8] to-[#A403CC] flex items-center justify-center text-white font-bold">i</div>
                  <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-24.5 w-full">
                    <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-24.5 w-full">
                    <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-24.5 w-full">
                    <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-24.5 w-full">
                    <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
                {/* Each survey */}
              <div className="p-2 flex flex-col justify-center gap-2 shadow-lg rounded-2xl">
                <div className="h-24.5 w-full">
                    <img src='/images/dashboard/survey.png' className="w-full h-full" />
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN 46,000.50 </span>
                    <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">10min</span>
                </div>
                <h2 className="text-sm font-semibold">Market Research on Mobile Banking</h2>
                <p className="text-[10px]">The continuous surge in technological innovation and breakthrough advancements refining how we...</p>
                <div className="flex gap-2">
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/users.svg" /><span>20 Participant</span> </div>
                </div>
                <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                    <div className="text-[10px] flex gap-1"><img src="/images/dashboard/survey-icon.svg" /><span>Survey</span> </div>
                </div>
                </div>
                <div className="flex gap-2 mt-2">
                    <img src="/images/dashboard/byUser.png" alt="" className="rounded-full" />
                    <div className="flex flex-col justify-center">
                        <h5 className="text-[12px]">By Orji Maxwell</h5>
                        <p className="text-[10px]">avvicv Group of companies</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
