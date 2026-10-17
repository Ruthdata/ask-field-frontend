import { X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useCreateProjectMutation } from "@/redux/api/projectApi";
import { formatApiError } from "@/utils/helper";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CreateProject = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [selected, setSelected] = useState<"individual" | "collection" | null>(
    null
  );
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelected(null);
    setTitle("");
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Please enter a project title.");
      return;
    }

    if (!selected) {
      toast.error("Please choose how participants should see the project.");
      return;
    }

    try {
      const response = await createProject({
        title: trimmedTitle,
        participantView: selected,
      }).unwrap();

      toast.success(response.message || "Project created successfully.");
      resetForm();
      onClose();
      navigate(`/dashboard/researcher/projects/${response.data._id}`);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const optionStyles = (type: "individual" | "collection") =>
    `border rounded-2xl p-4 sm:p-5 pt-10 sm:pt-12 ps-10 sm:ps-12 flex-1 flex flex-col gap-3 relative cursor-pointer transition
     ${
       selected === type
         ? "border-yellow-400 ring-2 ring-yellow-400 shadow-lg bg-yellow-50"
         : "border-gray-200 hover:shadow-lg"
     }`;

  const radioStyles = (type: "individual" | "collection") =>
    `h-5 w-5 rounded-full absolute top-3 left-3 flex items-center justify-center
     ${
       selected === type
         ? "border-yellow-400 border-2"
         : "border-gray-300 border"
     }`;

  const innerDot = (type: "individual" | "collection") =>
    selected === type ? "h-2.5 w-2.5 bg-yellow-400 rounded-full" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4">
      <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn p-4 sm:p-6">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} cursor={"pointer"} />
        </button>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
          New Project
        </h1>

        <p className="mt-4 text-sm sm:text-base">
          Project Title<span className="text-red-500">*</span>
        </p>

        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter project name"
          className="w-full border border-gray-300 rounded-lg px-4 mt-2 sm:mt-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <p className="my-4 text-sm sm:text-base">
          Choose How Participants See Your Project
          <span className="text-red-500">*</span>
        </p>

        {/* Responsive layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* Individual */}
          <div
            onClick={() => setSelected("individual")}
            className={optionStyles("individual")}
          >
            <div className={radioStyles("individual")}>
              <div className={innerDot("individual")} />
            </div>

            <h1 className="font-bold text-sm sm:text-base">
              As Individual Studies
            </h1>
            <p className="text-xs sm:text-sm">
              Participants view each study separately and won’t see it as part
              of a project.
            </p>
          </div>

          {/* Collection */}
          <div
            onClick={() => setSelected("collection")}
            className={optionStyles("collection")}
          >
            <div className={radioStyles("collection")}>
              <div className={innerDot("collection")} />
            </div>

            <h1 className="font-bold text-sm sm:text-base">As A Collection</h1>
            <p className="text-xs sm:text-sm">
              Participants see all eligible studies grouped within your project.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selected || !title.trim()}
            className="w-full sm:w-1/2 bg-[#3E3E3E] disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-3 rounded-2xl text-white cursor-pointer"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
