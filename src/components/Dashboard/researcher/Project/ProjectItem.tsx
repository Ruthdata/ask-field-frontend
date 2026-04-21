import { MoreVertical, Pin, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";

type Props = {
  project: Project;
  onRename: (id: string, title: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
};

const ProjectItem = ({ project, onRename, onPin, onDelete }: Props) => {
  const [openMore, setOpenMore] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleAction = (action: () => void) => {
    setOpenMore(false);
    action();
  };

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
      <span className="text-sm sm:text-base font-medium">{project.title}</span>
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <button className="bg-gray-300 py-1.5 px-4 sm:px-6 rounded-2xl text-sm cursor-pointer">
          <Link to={`/dashboard/researcher/projects/${project._id}`}>Open</Link>
        </button>

        <div className="relative" ref={menuRef}>
          <MoreVertical
            size={18}
            className="cursor-pointer"
            onClick={() => setOpenMore(!openMore)}
          />
          {openMore && (
            <div className="absolute -right-3.5 mt-3 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
              <button
                onClick={() =>
                  handleAction(() => onRename(project._id, project.title))
                }
                className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                <SquarePen size={16} /> Rename
              </button>

              <button
                onClick={() => handleAction(() => onPin(project._id))}
                className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Pin size={16} className="rotate-45" />
                {project.pinned ? "Pin Again" : "Pin"}
              </button>

              <button
                onClick={() => handleAction(() => onDelete(project._id))}
                className="flex cursor-pointer items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
