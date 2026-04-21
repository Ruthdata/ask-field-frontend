import ProjectSelectTab from "@components/Dashboard/researcher/tabs/ProjectSelectTab";
import { useGetProjectByIdQuery } from "@/redux/api/projectApi";
import { Link, useParams } from "react-router-dom";

const Project = () => {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useGetProjectByIdQuery(id, {
    skip: !id,
  });

  const project = data?.data;

  return (
    <div className="bg-gray-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="mb-3 text-sm text-gray-600">
        <Link to="/dashboard/researcher/projects" className="hover:underline">
          My Projects
        </Link>
        {" / "}
        <span className="text-yellow-500">{project?.title || "Project"}</span>
      </div>

      <div className="max-w-7xl mx-auto shadow-lg px-4 sm:px-6 py-5 bg-white rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg sm:text-xl">
              {isLoading ? "Loading project..." : project?.title || "Project"}
            </h3>
            {!isLoading && project && (
              <p className="text-sm text-gray-600">
                Participant view: {project.participantView}
              </p>
            )}
          </div>

          <Link
            to={`/dashboard/researcher/projects/${id}/create-survey`}
            className="w-full sm:w-auto bg-[#3E3E3E] flex items-center justify-center py-2 px-6 rounded-3xl text-white text-sm cursor-pointer"
          >
            New Survey
          </Link>
        </div>

        <ProjectSelectTab />

        {isLoading && (
          <p className="text-sm text-gray-500 py-6">Loading project details...</p>
        )}

        {isError && (
          <p className="text-sm text-red-500 py-6">
            We couldn&apos;t load this project right now.
          </p>
        )}

        {!isLoading && !isError && project && (
          <div className="mt-2 rounded-2xl bg-gray-100 py-4 px-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Project title</span>
              <span className="text-sm text-gray-700">{project.title}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Participant view</span>
              <span className="text-sm text-gray-700 capitalize">
                {project.participantView}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Pinned</span>
              <span className="text-sm text-gray-700">
                {project.pinned ? "Yes" : "No"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
