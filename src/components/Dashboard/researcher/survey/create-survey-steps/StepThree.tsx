import { CircleAlert, Copy, Plus, SquarePen } from "lucide-react";
import toast from "react-hot-toast";
import StepIndicator from "../StepIndicator";
import { CompletionPath, SurveyStepThreeData } from "@/types/survey";

type Props = {
  stepData: SurveyStepThreeData;
  setStepData: (data: SurveyStepThreeData) => void;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
};

const selectClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400";

const submissionOptions = [
  {
    value: "manual_review",
    title: "Manually Review",
    description: "Review each submission before taking further action.",
  },
  {
    value: "approve_and_pay",
    title: "Approve & Pay",
    description:
      "Automatically approve the submission and pay the participant.",
  },
];

const participantGroups = [
  { value: "general", label: "General Pool" },
  { value: "returning", label: "Returning Participants" },
  { value: "high_quality", label: "High Quality Group" },
];

const recordIdOptions = [
  { value: "", label: "-- Select or search --" },
  { value: "askfield_id", label: "joinStudy ID" },
  { value: "respondent_id", label: "Respondent ID" },
  { value: "custom_id", label: "Custom ID" },
];

const StepThree = ({
  stepData,
  setStepData,
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
}: Props) => {
  const updatePath = (pathId: string, changes: Partial<CompletionPath>) => {
    setStepData({
      ...stepData,
      completionPaths: stepData.completionPaths.map((path) =>
        path.id === pathId ? { ...path, ...changes } : path,
      ),
    });
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Unable to copy right now.");
    }
  };

  const addCompletionPath = () => {
    const nextIndex = stepData.completionPaths.length + 1;
    setStepData({
      ...stepData,
      completionPaths: [
        ...stepData.completionPaths,
        {
          id: `path-${nextIndex}`,
          name: `Path ${nextIndex}`,
          handleSubmission: "",
          addToParticipantGroup: "general",
          redirectUrl: "",
          completionCode: `ASK${String(nextIndex).padStart(4, "0")}`,
        },
      ],
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Create a Fresh Study
      </h1>

      <div className="mt-8 space-y-6">
        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">
            Data Collection
          </h2>
          <label className="block mt-5 text-sm text-gray-700">
            What&apos;s the URL of your Study?
            <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={stepData.surveyURL}
            onChange={(e) =>
              setStepData({ ...stepData, surveyURL: e.target.value })
            }
            placeholder="https://research.example.com/decision-making-study"
            className={`${inputClass} mt-2`}
          />
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">
            Recording joinStudy IDs
          </h2>
          <label className="block mt-5 text-sm text-gray-700">
            How do you want to record IDs?
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.toRecordId}
            onChange={(e) =>
              setStepData({ ...stepData, toRecordId: e.target.value })
            }
            className={`${selectClass} mt-2`}
          >
            {recordIdOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="mt-4 flex gap-2 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            <CircleAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              To match participant demographic data in joinStudy with
              submissions, your tool needs to record a unique participant ID.
            </p>
          </div>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">
            Completion Path
          </h2>

          <div className="space-y-5 mt-5">
            {stepData.completionPaths.map((path) => (
              <div
                key={path.id}
                className="border border-gray-100 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{path.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Default Path</p>
                  </div>
                  <SquarePen size={18} className="text-yellow-500" />
                </div>

                <p className="mt-5 text-sm text-gray-700">
                  How do you want to process submissions?
                  <span className="text-red-500">*</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {submissionOptions.map((option) => {
                    const isSelected = path.handleSubmission === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updatePath(path.id, {
                            handleSubmission: option.value,
                          })
                        }
                        className={`border rounded-2xl p-4 text-left transition ${
                          isSelected
                            ? "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50"
                            : "border-gray-200 hover:shadow-md"
                        }`}
                      >
                        <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-yellow-400">
                          {isSelected && (
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          )}
                        </div>
                        <p className="font-medium text-sm">{option.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <label className="block mt-5 text-sm text-gray-700">
                  Add to participant group
                </label>
                <select
                  value={path.addToParticipantGroup}
                  onChange={(e) =>
                    updatePath(path.id, {
                      addToParticipantGroup: e.target.value,
                    })
                  }
                  className={`${selectClass} mt-2`}
                >
                  {participantGroups.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-medium">Redirect URL</p>
                    <div className="bg-white rounded-xl px-3 py-2 mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs truncate">
                        {path.redirectUrl || "Will be generated after save"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(path.redirectUrl)}
                        className="text-sm underline cursor-pointer disabled:opacity-40"
                        disabled={!path.redirectUrl}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-medium">Copy & Paste Code</p>
                    <div className="bg-white rounded-xl px-3 py-2 mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        {path.completionCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(path.completionCode)}
                        className="inline-flex items-center gap-1 text-sm underline cursor-pointer"
                      >
                        Copy <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCompletionPath}
            className="mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-3xl bg-[#3E3E3E] text-white text-sm cursor-pointer"
          >
            <Plus size={16} /> Add a completion path
          </button>
        </section>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 flex-col md:flex-row gap-5">
        <StepIndicator step={step} totalSteps={totalSteps} />
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex-1 md:flex-none px-5 py-3 rounded-3xl bg-gray-100 text-gray-700 cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="flex-1 md:flex-none px-5 py-3 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
