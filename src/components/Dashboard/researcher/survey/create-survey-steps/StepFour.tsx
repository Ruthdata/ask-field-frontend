import { ChartColumn, CircleAlert, FlaskConical, PieChart } from "lucide-react";
import StepIndicator from "../StepIndicator";
import { SurveyStepFourData } from "@/types/survey";

type Props = {
  stepData: SurveyStepFourData;
  setStepData: (data: SurveyStepFourData) => void;
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

const distributionOptions = [
  {
    value: "standard_sample",
    title: "Standard Sample",
    description: "Distribute your study to available participants.",
    icon: FlaskConical,
  },
  {
    value: "quota_sample",
    title: "Quota Sample",
    description: "Distribute your study using custom quotas.",
    icon: PieChart,
  },
  {
    value: "representative_sample",
    title: "Representative Sample",
    description: "Distribute your study using balanced quotas.",
    icon: ChartColumn,
  },
];

const findParticipantOptions = [
  { value: "", label: "-- Select from options --" },
  { value: "askfield", label: "Recruit on AskField" },
  { value: "bring_your_own", label: "Bring your own participants" },
];

const screeningOptions = [
  { value: "", label: "-- Select from options --" },
  { value: "none", label: "No screening" },
  { value: "prescreener", label: "Use AskField prescreener" },
  { value: "custom", label: "Custom screener" },
];

const credentialOptions = [
  { value: "", label: "-- Select from options --" },
  { value: "none", label: "No login required" },
  { value: "login_password", label: "Login and password required" },
  { value: "single_sign_on", label: "Single sign-on required" },
];

const totalSubmissionOptions = [
  { value: "", label: "-- Select from options --" },
  { value: "1", label: "1 time" },
  { value: "2", label: "2 times" },
  { value: "3", label: "3 times" },
];

const inputRejectionOptions = [
  { value: "", label: "-- Select from options --" },
  { value: "0", label: "Never reject automatically" },
  { value: "25", label: "Reject submissions below 25% of expected time" },
  { value: "50", label: "Reject submissions below 50% of expected time" },
  { value: "75", label: "Reject submissions below 75% of expected time" },
];

const StepFour = ({
  stepData,
  setStepData,
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
}: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold">Create a Fresh Study</h1>

      <div className="mt-8 space-y-6">
        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">
            Recruit participants - Source
          </h2>
          <label className="block mt-5 text-sm text-gray-700">
            How do you want to find participants on AskField?
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.howToFindParticipant}
            onChange={(e) =>
              setStepData({ ...stepData, howToFindParticipant: e.target.value })
            }
            className={`${selectClass} mt-2`}
          >
            {findParticipantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Participants</h2>
          <label className="block mt-5 text-sm text-gray-700">
            How many participants are you looking to recruit?
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={stepData.numberOfParticipants}
            onChange={(e) =>
              setStepData({ ...stepData, numberOfParticipants: e.target.value })
            }
            placeholder="Enter number of participants"
            className={`${inputClass} mt-2`}
          />
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Screening</h2>
          <label className="block mt-5 text-sm text-gray-700">
            How do you want to screen participants on AskField?
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.howToScreenParticipants}
            onChange={(e) =>
              setStepData({
                ...stepData,
                howToScreenParticipants: e.target.value,
              })
            }
            className={`${selectClass} mt-2`}
          >
            {screeningOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Study Distribution</h2>
          <p className="mt-5 text-sm text-gray-700">
            How do you want to distribute your study?
            <span className="text-red-500">*</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {distributionOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = stepData.surveyDistribution === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setStepData({
                      ...stepData,
                      surveyDistribution: option.value,
                    })
                  }
                  className={`border rounded-2xl p-4 text-left transition ${
                    isSelected
                      ? "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={18} className="text-gray-600" />
                    <div className="h-5 w-5 rounded-full border border-yellow-400 flex items-center justify-center">
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-sm mt-4">{option.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Credentials</h2>
          <label className="block mt-5 text-sm text-gray-700">
            Do participants require a login & password to access your survey tool?
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.surveyCrendentials}
            onChange={(e) =>
              setStepData({ ...stepData, surveyCrendentials: e.target.value })
            }
            className={`${selectClass} mt-2`}
          >
            {credentialOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Submissions</h2>
          <label className="block mt-5 text-sm text-gray-700">
            Total times a participant can complete your study
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.totalSubmission}
            onChange={(e) =>
              setStepData({ ...stepData, totalSubmission: e.target.value })
            }
            className={`${selectClass} mt-2`}
          >
            {totalSubmissionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Input Rejection</h2>
          <label className="block mt-5 text-sm text-gray-700">
            Reject exceptionally fast submissions
            <span className="text-red-500">*</span>
          </label>
          <select
            value={stepData.inputRejection}
            onChange={(e) =>
              setStepData({ ...stepData, inputRejection: e.target.value })
            }
            className={`${selectClass} mt-2`}
          >
            {inputRejectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="mt-4 flex gap-2 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            <CircleAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              AskField can automatically reject submissions that finish far below
              your estimated completion time to reduce low quality responses.
            </p>
          </div>
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

export default StepFour;
