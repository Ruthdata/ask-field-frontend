import React, { useState } from "react";
import { Wallet, Zap, HelpCircle } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import StatCard from "../StatCard";
import SurveyHeader from "./survey/SurveyHeader";
import SurveyBody from "./survey/SurveyBody";
import { useGetDashboardStatsQuery } from "@/redux/api/researcherApi";

const DashboardSection = () => {
  const { getResearcherFirstName } = useCurrentUser();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const { data, isLoading } = useGetDashboardStatsQuery();
  const stats = data?.data;

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hi {getResearcherFirstName()}
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
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Active Surveys"
            value={isLoading ? "..." : (stats?.activeSurveys ?? 0)}
            change={
              isLoading
                ? ""
                : `${stats?.liveSurveys ?? 0} Live  •  ${stats?.draftSurveys ?? 0} Draft  •  ${stats?.closedSurveys ?? 0} Closed`
            }
            showVisibility={false}
            isDisplayBalance={false}
            isVisible={true}
            onToggleVisibility={() => {}}
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
            title="Research Spend"
            value={
              isLoading
                ? "..."
                : (stats?.researchSpent?.toLocaleString() ?? "0.00")
            }
            change="30%"
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
            showVisibility={true}
            isDisplayBalance={true}
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
            <p className="text-sm mt-3 text-gray-500">
              Track the progress, response quality, and cost efficiency of each
              survey.
            </p>
          </div>
          {/* List Survey */}
          <div className="mt-8">
            <div className="overflow-x-auto">
              <div className="min-w-175">
                {/* Header */}
                <SurveyHeader />

                {/* Row */}
                {[1, 2, 3].map((_, i) => (
                  <SurveyBody key={i} i={i} />
                ))}
              </div>
            </div>
          </div>
          {/* No Survey */}
          <div className="flex flex-col py-15 gap-4 items-center">
            <img
              src="/images/no-survey.png"
              className="h-30 w-50"
              alt="no-survey"
            />
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
