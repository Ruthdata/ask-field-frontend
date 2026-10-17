import React from "react";

const SurveyHeader = () => {
  return (
    <div className="flex justify-between border border-gray-100 py-1 px-1 gap-1 rounded-tl-2xl rounded-tr-2xl bg-white">
      <span className="bg-gray-200 text-gray-500 text-xs sm:text-sm py-2 px-3 rounded-tl-xl rounded-tr-xl rounded-br-xl flex-2 whitespace-nowrap">
        Survey
      </span>
      <span className="bg-gray-200 text-gray-500 text-xs sm:text-sm py-2 px-3 rounded-xl flex-1 whitespace-nowrap">
        Status
      </span>
      <span className="bg-gray-200 text-gray-500 text-xs sm:text-sm py-2 px-3 rounded-xl flex-1 whitespace-nowrap">
        Responses
      </span>
      <span className="bg-gray-200 text-gray-500 text-xs sm:text-sm py-2 px-3 rounded-xl flex-1 whitespace-nowrap">
        Completion
      </span>
      <span className="bg-gray-200 text-gray-500 text-xs sm:text-sm py-2 px-3 rounded-tl-xl rounded-bl-xl rounded-tr-xl flex-[1.8] whitespace-nowrap">
        Total Spend
      </span>
    </div>
  );
};

export default SurveyHeader;
