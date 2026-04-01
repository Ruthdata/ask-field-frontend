import ProjectBody from "@components/Dashboard/researcher/Project/ProjectBody";
import ProjectItem from "@components/Dashboard/researcher/Project/ProjectItem";
import ProjectSelectTab from "@components/Dashboard/researcher/tabs/ProjectSelectTab";
import CreateProject from "@components/Modal/Dashboard/CreateProject";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Project = () => {
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);

  const handleCloseModal = () => {
    setShowCreateProfileModal(false);
  };

  return (
    <div className="bg-gray-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="mb-3">
            <span><Link to='/dashboard/researcher/projects'>My Projects</Link> / <span className="text-yellow-400"><Link to='/dashboard/researcher/projects/123'>Project</Link></span></span>
        </div>
      <div className="max-w-7xl mx-auto shadow-lg px-4 sm:px-6 py-5 bg-white rounded-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg sm:text-xl">Project</h3>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-5">
            <button className="bg-[#3E3E3E] flex items-center justify-center py-2 px-6 gap-3 rounded-3xl cursor-pointer">
              <img src="/images/add-fund.svg" alt="add-fund" />
              <span className="text-white text-[12px]"><Link to='/dashboard/researcher/projects/123/create-survey'>New Survey</Link></span>
            </button>
            <MoreVertical size={17} cursor={'pointer'} />
          </div>
        </div>
       {/* Tabs */}
       <ProjectSelectTab />

        {/* Table / List */}
        {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
        <ProjectBody i={i}  />
        ))}
      </div>

      <CreateProject
        to="/dashboard/researcher"
        open={showCreateProfileModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Project;
