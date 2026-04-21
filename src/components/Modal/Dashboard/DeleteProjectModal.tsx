import { X } from "lucide-react";

type Props = {
  open: boolean;
  projectTitle?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteProjectModal = ({
  open,
  projectTitle,
  isLoading = false,
  onClose,
  onConfirm,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4">
      <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-xl p-5 sm:p-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Delete Project
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
          This will permanently delete
          {projectTitle ? ` "${projectTitle}"` : " this project"}.
          You can&apos;t undo this action.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border border-gray-300 px-4 py-2.5 rounded-2xl text-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-red-500 text-white px-4 py-2.5 rounded-2xl text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
