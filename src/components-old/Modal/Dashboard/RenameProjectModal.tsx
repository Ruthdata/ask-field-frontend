import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
};

const RenameProjectModal = ({
  open,
  title,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) => {
  const [value, setValue] = useState(title);

  useEffect(() => {
    if (open) {
      setValue(title);
    }
  }, [open, title]);

  if (!open) return null;

  const trimmedValue = value.trim();

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

        <h2 className="text-xl sm:text-2xl font-semibold">Rename Project</h2>
        <p className="mt-2 text-sm text-gray-600">
          Give your project a clear name that is easy to recognize later.
        </p>

        <label className="block mt-5 text-sm sm:text-base">
          Project Title<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter project name"
          className="w-full border border-gray-300 rounded-lg px-4 mt-2 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto border border-gray-300 px-4 py-2.5 rounded-2xl text-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(trimmedValue)}
            disabled={isLoading || !trimmedValue}
            className="w-full sm:w-auto bg-[#3E3E3E] text-white px-4 py-2.5 rounded-2xl text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameProjectModal;
