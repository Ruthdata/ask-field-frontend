import ProjectItem from "@components/Dashboard/researcher/Project/ProjectItem";
import CreateProject from "@components/Modal/Dashboard/CreateProject";
import React, { useState } from "react";

const Projects = () => {
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);

  const handleCloseModal = () => {
    setShowCreateProfileModal(false);
  };

  return (
    <div className="bg-gray-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto shadow-lg px-4 sm:px-6 py-5 bg-white rounded-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg sm:text-xl">My Projects</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Track the progress, response quality, and cost efficiency of each
              survey.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowCreateProfileModal(true)}
              className="w-full sm:w-auto bg-[#3E3E3E] text-sm px-4 py-2.5 rounded-3xl text-white cursor-pointer"
            >
              Create new project
            </button>
          </div>
        </div>

        {/* Table / List */}
        <div className="mt-6">
          {/* Header row */}
            <ProjectItem />
            <ProjectItem />
        </div>
      </div>

      <CreateProject
        to="/dashboard/researcher"
        open={showCreateProfileModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Projects;
