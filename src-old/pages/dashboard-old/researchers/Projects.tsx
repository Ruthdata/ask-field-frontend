import ProjectItem from "@components/Dashboard/researcher/Project/ProjectItem";
import CreateProject from "@components/Modal/Dashboard/CreateProject";
import DeleteProjectModal from "@components/Modal/Dashboard/DeleteProjectModal";
import RenameProjectModal from "@components/Modal/Dashboard/RenameProjectModal";
import React, { useState } from "react";
import {
  useListUserProjectsQuery,
  useRenameProjectMutation,
  usePinProjectMutation,
  useDeleteProjectMutation,
} from "@/redux/api/projectApi";
import { Project } from "@/types/project";
import toast from "react-hot-toast";
import { formatApiError } from "@/utils/helper";

type SelectedProjectState = {
  id: string;
  title: string;
};

const Projects = () => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [renameModal, setRenameModal] = useState<SelectedProjectState | null>(
    null
  );
  const [deleteModal, setDeleteModal] = useState<SelectedProjectState | null>(
    null
  );
  const [pinningProjectId, setPinningProjectId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useListUserProjectsQuery({
    page: 1,
    limit: 10,
  });
  const projects: Project[] = data?.data?.data ?? [];

  const [renameProject, { isLoading: isRenaming }] = useRenameProjectMutation();
  const [pinProject] = usePinProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const openRenameModal = (id: string, title: string) => {
    setRenameModal({ id, title });
  };

  const closeRenameModal = () => {
    if (!isRenaming) {
      setRenameModal(null);
    }
  };

  const openDeleteModal = (id: string) => {
    const selectedProject = projects.find((project) => project._id === id);
    setDeleteModal({
      id,
      title: selectedProject?.title || "this project",
    });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal(null);
    }
  };

  const handleRename = async (title: string) => {
    if (!renameModal) return;

    if (title === renameModal.title.trim()) {
      toast("Project name is unchanged.");
      closeRenameModal();
      return;
    }

    try {
      const response = await renameProject({
        id: renameModal.id,
        title,
      }).unwrap();

      toast.success(response.message || "Project renamed successfully.");
      setRenameModal(null);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const handlePin = async (id: string) => {
    try {
      setPinningProjectId(id);
      const response = await pinProject(id).unwrap();
      toast.success(response.message || "Project pinned successfully.");
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setPinningProjectId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      const response = await deleteProject(deleteModal.id).unwrap();
      toast.success(response.message || "Project deleted successfully.");
      setDeleteModal(null);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  return (
    <div className="bg-gray-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto shadow-lg px-4 sm:px-6 py-5 bg-white rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg sm:text-xl">My Projects</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Track the progress, response quality, and cost efficiency of each
              survey.
            </p>
          </div>
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="w-full sm:w-auto bg-[#3E3E3E] text-sm px-4 py-2.5 rounded-3xl text-white cursor-pointer"
          >
            Create new project
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading projects...</p>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-red-500">
                We couldn&apos;t load your projects right now.
              </p>
              <button
                onClick={() => refetch()}
                className="border border-gray-300 px-4 py-2 rounded-2xl text-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-gray-500">
              No projects yet. Create one!
            </p>
          ) : (
            projects.map((project) => (
              <ProjectItem
                key={project._id}
                project={project}
                onRename={openRenameModal}
                onPin={handlePin}
                onDelete={openDeleteModal}
              />
            ))
          )}
        </div>

        {pinningProjectId && (
          <p className="mt-4 text-sm text-gray-500">Updating project...</p>
        )}
      </div>

      <CreateProject
        open={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
      />
      <RenameProjectModal
        open={!!renameModal}
        title={renameModal?.title || ""}
        isLoading={isRenaming}
        onClose={closeRenameModal}
        onSubmit={handleRename}
      />
      <DeleteProjectModal
        open={!!deleteModal}
        projectTitle={deleteModal?.title}
        isLoading={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Projects;
