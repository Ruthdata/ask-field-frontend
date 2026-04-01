import { MoreVertical } from "lucide-react";
import React from "react";

type SurveyBodyProps = {
    i: number
}

const SurveyBody = ({i}: SurveyBodyProps) => {
  return (
    <div
      key={i}
      className="flex justify-between border border-gray-100 py-1 px-1 gap-1 hover:bg-gray-100 bg-gray-50 font-light rounded-xl mt-2"
    >
      <span className="text-xs sm:text-sm py-2 px-3 flex-2 border-r border-gray-300 whitespace-nowrap">
        Mobile Banking UX Study
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        <div
          className={`w-fit py-1 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold
              ${
                i === 0
                  ? "text-green-500 bg-green-100"
                  : i === 1
                  ? "text-orange-500 bg-orange-100"
                  : "text-red-500 bg-red-100"
              }`}
        >
          <div
            className={`h-2 w-2 rounded-full
                ${
                  i === 0
                    ? "bg-green-500"
                    : i === 1
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
          />
          {i === 0 ? "Live" : i === 1 ? "Draft" : "Closed"}
        </div>
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        78 / 100
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        92%
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-[1.8] flex items-center justify-between whitespace-nowrap">
        <span className="text-[11px] sm:text-xs">NGN 35,100</span>
        <MoreVertical size={16} className="cursor-pointer" />
      </span>
    </div>
  );
};

export default SurveyBody;
