import React, { useState } from "react";
import { Wallet, Zap, HelpCircle, MoreVertical } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import StatCard from "../StatCard";

const DashboardSection = () => {
  const { getResearcherFirstName } = useCurrentUser();
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
              Welcome, {getResearcherFirstName()}!
            </h1>

            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Monitor your surveys and manage your research spend from one
                place.
              </p>
              <button className="text-gray-400 hover:text-gray-600">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dropdown */}
          {/* <div className="relative">
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
          </div> */}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Active Surveys"
            value="0"
            change="Since last 3 days"
            showVisibility={false}
            isDisplayBalance={true}
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
          >
            <div className="border-t border-t-olive-200 pt-4">
              <button className="bg-[#3E3E3E] flex items-center justify-center py-2 px-6 gap-3 rounded-3xl cursor-pointer">
                <img src="/images/create-survey.svg" alt="create-survey" />
                <span className="text-white text-[12px]">Create Survey</span>
              </button>
            </div>
          </StatCard>

          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Research spend"
            value="0.00"
            change="Since last 3 days"
            isVisible={true}
            onToggleVisibility={() => {}}
            showVisibility={true}
          >
            <div className="border-t border-t-olive-200 pt-4">
              <button className="bg-[#3E3E3E] flex items-center justify-center py-2 px-6 gap-3 rounded-3xl cursor-pointer">
                <img src="/images/add-fund.svg" alt="add-fund" />
                <span className="text-white text-[12px]">Add Funds</span>
              </button>
            </div>
          </StatCard>
        </div>
        <div className="flex flex-col px-4 py-5 shadow-lg bg-white rounded-2xl mt-3">
          <div className="flex mt-4 justify-between">
            <h3 className="">Explore what you can do with Ask Field</h3>
          </div>
          <div className="bg-white mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
              {/* Each exploration */}
              <div className="py-4 flex flex-col justify-center gap-2 shadow-lg rounded-2xl cursor-pointer px-4">
                <div className="h-30 w-full relative rounded-3xl overflow-hidden">
                  <img
                    src="/images/ai-taskbuilder.png"
                    alt="ai-taskbuildier"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="my-2">AI Task Builder</h5>
                  <p className="text-[11px] text-gray-500">
                    Launch text annotation tasks on Prolific in one integrated
                    workflow.
                  </p>
                </div>
              </div>
              {/* Each exploration */}
              <div className="py-4 flex flex-col justify-center gap-2 shadow-lg rounded-2xl cursor-pointer px-4">
                <div className="h-30 w-full relative rounded-3xl overflow-hidden">
                  <img
                    src="/images/find-participants.png"
                    alt="ai-taskbuildier"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="my-2">Find Your Participants</h5>
                  <p className="text-[11px] text-gray-500">
                    Screen 200,000+ participants to find the perfect people to
                    complete your study.
                  </p>
                </div>
              </div>
              {/* Each exploration */}
              <div className="py-4 flex flex-col justify-center gap-2 shadow-lg rounded-2xl cursor-pointer px-4">
                <div className="h-30 w-full relative rounded-3xl overflow-hidden">
                  <img
                    src="/images/pricing-calculator.png"
                    alt="ai-taskbuildier"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="my-2">Pricing Calculator</h5>
                  <p className="text-[11px] text-gray-500">
                    Estimate the cost of your study before starting research.
                  </p>
                </div>
              </div>
              {/* Each exploration */}
              <div className="py-4 flex flex-col justify-center gap-2 shadow-lg rounded-2xl cursor-pointer px-4">
                <div className="h-30 w-full relative rounded-3xl overflow-hidden">
                  <img
                    src="/images/start-a-study.png"
                    alt="ai-taskbuildier"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="my-2">Create A Study</h5>
                  <p className="text-[11px] text-gray-500">
                    Complete the form, link your tools, and start your research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col px-4 py-5 shadow-lg bg-white rounded-2xl mt-3">
          <div className="">
            <h3 className="">Your Surveys</h3>
            <p className="text-sm mt-3 text-gray-500">Track the progress, response quality, and cost efficiency of each survey.</p>
          </div>
          {/* List Survey */}
          <div className="mt-8">
            {/* Survey Header */}
            <div className="flex justify-between border border-gray-100 py-1 px-1 gap-1 rounded-tl-2xl rounded-tr-2xl">
                <span className="bg-gray-200 text-gray-500 text-sm py-2 px-3 rounded-tl-xl rounded-tr-xl rounded-br-xl flex-2">Survey</span>
                <span className="bg-gray-200 text-gray-500 text-sm py-2 px-3 rounded-xl flex-1">Status</span>
                <span className="bg-gray-200 text-gray-500 text-sm py-2 px-3 rounded-xl flex-1">Responses</span>
                <span className="bg-gray-200 text-gray-500 text-sm py-2 px-3 rounded-xl flex-1">Completion</span>
                <span className="bg-gray-200 text-gray-500 text-sm py-2 px-3 rounded-tl-xl rounded-bl-xl rounded-tr-xl flex-[1.8]">Total Spend</span>
            </div>
            {/* Survey Body */}
            <div className="flex justify-between border border-gray-100 py-1 px-1 gap-1  text-graye-500 hover:bg-gray-100 bg-graye-200 font-light rounded-xl mt-2">
                <span className="text-sm py-2 px-3 rounded-tl-xl rounded-bl-xl flex-2 border-r border-gray-300">Mobile Banking UX Study </span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300"><div className="text-green-400 font-bold bg-green-100 w-fit py-1 px-5 rounded-2xl flex items-center gap-2"><div className="h-2 w-2 bg-green-500 rounded-full"></div> Live</div></span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">78 / 100</span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">92%</span>
                <span className="text-sm py-2 px-3 rounded-tr-xl rounded-br-xl flex-[1.8] flex items-center justify-between"><span className="text-[11px]">NGN 35,100</span> <MoreVertical size={17} cursor='pointer' /></span>
            </div>
            <div className="flex justify-between border border-gray-100 py-1 px-1 gap-1  text-graye-500 hover:bg-gray-100 bg-gray-100 font-light rounded-xl mt-2">
                <span className="text-sm py-2 px-3 rounded-tl-xl rounded-bl-xl flex-2 border-r border-gray-300">Mobile Banking UX Study </span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300"><div className="text-orange-500 font-bold bg-orange-100 w-fit py-1 px-5 rounded-2xl flex items-center gap-2"><div className="h-2 w-2 bg-orange-500 rounded-full"></div> Draft</div></span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">78 / 100</span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">92%</span>
                <span className="text-sm py-2 px-3 rounded-tr-xl rounded-br-xl flex-[1.8] flex items-center justify-between"><span className="text-[11px]">NGN 35,100</span> <MoreVertical size={17} cursor='pointer' /></span>
            </div>
            <div className="flex justify-between border border-gray-100 py-1 px-1 gap-1  text-graye-500 hover:bg-gray-100 bg-gray-100 font-light rounded-xl mt-2">
                <span className="text-sm py-2 px-3 rounded-tl-xl rounded-bl-xl flex-2 border-r border-gray-300">Mobile Banking UX Study </span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300"><div className="text-red-500 font-bold bg-red-100 w-fit py-1 px-5 rounded-2xl flex items-center gap-2"><div className="h-2 w-2 bg-red-500 rounded-full"></div> Closed</div></span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">78 / 100</span>
                <span className="text-sm py-2 px-3 flex-1 border-r border-gray-300">92%</span>
                <span className="text-sm py-2 px-3 rounded-tr-xl rounded-br-xl flex-[1.8] flex items-center justify-between"><span className="text-[11px]">NGN 35,100</span> <MoreVertical size={17} cursor='pointer' /></span>
            </div>
          </div>
          {/* No Survey */}
          <div className="flex flex-col py-15 gap-4 items-center">
            <img src="/images/no-survey.png" className="h-30 w-50" alt="no-survey" />
            <p>No surveys found :)</p>
            <button className="bg-[#3E3E3E] flex items-center justify-center py-2 px-6 gap-3 rounded-3xl cursor-pointer">
                <img src="/images/create-survey.svg" alt="create-survey" />
                <span className="text-white text-[12px]">Create Survey</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
