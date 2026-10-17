import { CircleAlert, Clock3 } from "lucide-react";
import StepIndicator from "../StepIndicator";
import { SurveyStepFiveData } from "@/types/survey";

type Props = {
  stepData: SurveyStepFiveData;
  setStepData: (data: SurveyStepFiveData) => void;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400";

const currencyOptions = ["USD"];

const StepFive = ({
  stepData,
  setStepData,
  step,
  totalSteps,
  onBack,
  onSubmit,
  isSubmitting = false,
}: Props) => {
  const estimatedDuration = Number(stepData.surveyDuration) || 0;
  const estimatedAmount = Number(stepData.surveyAmount) || 0;
  const hourlyRate =
    estimatedDuration > 0 ? Math.round((estimatedAmount / estimatedDuration) * 60) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Create a Fresh Study</h1>
          <p className="mt-3 text-sm text-gray-600">
            Set the estimated time and participant reward for this study.
          </p>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-fuchsia-600 text-white text-xs font-semibold">
          Max Time: 20mins
        </span>
      </div>

      <div className="mt-8 space-y-6">
        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <label className="block text-sm text-gray-700">
            How long will your Study take to complete?
            <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex items-center gap-3">
            <div className="shrink-0 h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
              <Clock3 size={18} className="text-gray-600" />
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={stepData.surveyDuration}
              onChange={(e) =>
                setStepData({ ...stepData, surveyDuration: e.target.value })
              }
              placeholder="Enter duration in minutes"
              className={inputClass}
            />
          </div>

          <div className="mt-4 flex gap-2 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            <CircleAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              If the median completion time exceeds this estimate, you may need
              to increase the reward later.
            </p>
          </div>
        </section>

        <section className="border border-gray-100 rounded-2xl p-5 sm:p-6">
          <label className="block text-sm text-gray-700">
            How much do you want to pay?
            <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-[96px_1fr] gap-3">
            <select className={inputClass} defaultValue={currencyOptions[0]}>
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={stepData.surveyAmount}
              onChange={(e) =>
                setStepData({ ...stepData, surveyAmount: e.target.value })
              }
              placeholder="Enter amount"
              className={inputClass}
            />
          </div>

          <div className="mt-4 flex gap-2 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
            <CircleAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              This is the fixed reward each participant receives. We use it with
              your estimated duration to calculate the hourly rate.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Hourly Rate</span>
              <span>{hourlyRate > 0 ? `${hourlyRate} USD/hr` : "0 USD/hr"}</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{
                  width: `${Math.min(Math.max((hourlyRate / 50) * 100, 0), 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-semibold">
              <span className="px-2 py-1 rounded-full bg-red-500 text-white">
                20 USD
              </span>
              <span className="px-2 py-1 rounded-full bg-green-600 text-white">
                35 USD
              </span>
              <span className="px-2 py-1 rounded-full bg-yellow-400 text-white">
                50 USD
              </span>
            </div>
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
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 md:flex-none px-5 py-3 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Study"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFive;
