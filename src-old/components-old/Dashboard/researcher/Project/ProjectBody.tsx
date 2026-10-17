import { MoreVertical } from "lucide-react";
import React from "react";

type ProjectBodyProps = {
    i: number
}

const ProjectBody = ({i}: ProjectBodyProps) => {
  return (
    <div
      key={i}
      className="flex justify-between border border-gray-100 py-1 px-1 gap-1 hover:bg-gray-100 bg-gray-50 font-light rounded-xl mt-2"
    >
      <span className="text-xs sm:text-sm py-2 px-3 flex-2 border-r border-gray-300 whitespace-nowrap">
        Mobile Banking UX Study
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

export default ProjectBody;
