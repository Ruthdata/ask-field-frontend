import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Zap, HelpCircle } from "lucide-react";
import { useGetParticipantEarningsQuery } from "@/redux/api/walletApi";
import { useGetAllSurveysQuery } from "@/redux/api/surveyApi";
import type { Survey, SurveyListPayload } from "@/types/survey";

const toList = (payload?: SurveyListPayload): Survey[] =>
  !payload ? [] : Array.isArray(payload) ? payload : payload.data || payload.items || payload.results || [];
import { useCurrentUser } from "@/hooks/useCurrentUser";
import StatCard from "../StatCard";

const DashboardSection = () => {
  const { getParticipantFirstName } = useCurrentUser();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const earnings = useGetParticipantEarningsQuery().data?.data;
  const { data: surveyRes, isLoading: surveysLoading } = useGetAllSurveysQuery({ status: "published" });
  const surveys = toList(surveyRes?.data);



  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {getParticipantFirstName()}!
            </h1>

            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Here’s a summary of all activities happening on your joinStudy
                account.
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
            title="Available Balance"
            value={earnings ? earnings.available.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "…"}
            change={earnings?.pending ? `${earnings.currency} ${earnings.pending.toLocaleString()} waiting for approval` : "Ready to withdraw"}
            showVisibility={true}
            isDisplayBalance={true}
            isVisible={isBalanceVisible}
            onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
          />

          <StatCard
            icon={<Zap className="w-6 h-6 text-yellow-600" />}
            iconBg="bg-yellow-50"
            title="Completed Studies"
            value={earnings ? earnings.completedStudies : "…"}
            change="Submitted or approved"
            isVisible={true}
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
              <Link to="/dashboard/participant/surveys" className="flex rounded-full border border-gray-500 px-8 py-2 gap-4 cursor-pointer">
                <span>See all</span>{" "}
                <img src="/images/shared/right-arrow.svg" alt="" />
              </Link>
            </div>
          </div>
          <div className="bg-white mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
              {surveysLoading && <p className="col-span-full py-8 text-center text-sm text-gray-500">Loading studies…</p>}
              {!surveysLoading && surveys.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-gray-500">
                  No studies match you right now. We&apos;ll show new ones here as soon as they open.
                </p>
              )}
              {surveys.slice(0, 6).map((survey) => (
                <Link
                  key={survey.surveyId || survey._id}
                  to="/dashboard/participant/surveys"
                  className="p-2 flex flex-col justify-start gap-2 shadow-lg rounded-2xl bg-white hover:-translate-y-0.5 transition-transform"
                >
                  <div className="h-30 w-full relative rounded-3xl overflow-hidden">
                    <img src="/images/dashboard/survey.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit">
                    <span className="text-[13px] font-semibold">NGN {Number(survey.surveyAmount || 0).toLocaleString()} </span>
                    {!!survey.surveyDuration && (
                      <span className="text-[11px] text-white bg-[#3E3E3E] p-1 rounded-3xl">{survey.surveyDuration}min</span>
                    )}
                  </div>
                  <h2 className="text-sm font-semibold">{survey.surveyName}</h2>
                  <p className="text-[10px] line-clamp-2">{survey.surveyDescription}</p>
                  <div className="flex gap-2">
                    {!!survey.numberOfParticipants && (
                      <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                        <div className="text-[10px] flex gap-1">
                          <img src="/images/dashboard/users.svg" alt="" />
                          <span>{survey.numberOfParticipants} places</span>
                        </div>
                      </div>
                    )}
                    {survey.surveyLabel && (
                      <div className="bg-[#FBC02D33] mt-3 rounded-3xl px-3 py-1 w-fit flex justify-center items-center">
                        <div className="text-[10px] flex gap-1 capitalize">
                          <img src="/images/dashboard/survey-icon.svg" alt="" />
                          <span>{survey.surveyLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
