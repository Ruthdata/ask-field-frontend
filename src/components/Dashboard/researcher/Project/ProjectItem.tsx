import { MoreVertical, Pin, SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ProjectItem = () => {
  const [openMore, setOpenMore] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mt-2 rounded-2xl bg-gray-100 py-4 px-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 relative">
      {/* Project name */}
      <span className="text-sm sm:text-base font-medium">Project</span>
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <button className="bg-gray-300 py-1.5 px-4 sm:px-6 rounded-2xl text-sm cursor-pointer">
          <Link to='/dashboard/researcher/projects/123'>Open</Link>
        </button>

        {/* More button */}
        <div className="relative" ref={menuRef}>
          <MoreVertical
            size={18}
            className="cursor-pointer"
            onClick={() => setOpenMore(!openMore)}
          />

          {/* Modal / Dropdown */}
          {openMore && (
            <div className="absolute -right-3.5 mt-3 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
              <button className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-100">
                <SquarePen cursor="pointer" size={16} />
                Rename
              </button>

              <button className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-100">
                <Pin cursor="pointer" size={16} className="rotate-45" />
                Pin
              </button>

              <button className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                <Trash2 cursor="pointer" size={16} />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
