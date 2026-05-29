import OptionCard from "../OptionCard";
import StepIndicator from "../StepIndicator";
import { SurveyTypeOption } from "@/types/survey";

type StepOneProps = {
  selected: SurveyTypeOption | null;
  setSelected: (value: SurveyTypeOption) => void;
  step: number;
  totalSteps: number;
  onNext: () => void;
  isSubmitting?: boolean;
};

const StepOne = ({
  selected,
  setSelected,
  step,
  totalSteps,
  onNext,
  isSubmitting = false,
}: StepOneProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Create a Fresh Study
      </h1>

      <div className="mt-8 rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold">Data Collection</h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose how participants will access your study.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mt-6">
          <OptionCard
            type="external"
            selected={selected}
            setSelected={setSelected}
            title="External Study Link"
            description="Recruit on joinStudy and send participants to your own survey URL."
          />
          <OptionCard
            type="aiTaskBuilder"
            selected={selected}
            setSelected={setSelected}
            title="AI Task Builder"
            description="Create a guided AI collection flow directly on joinStudy."
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 flex-col md:flex-row gap-5">
        <StepIndicator step={step} totalSteps={totalSteps} />

        <button
          onClick={onNext}
          disabled={!selected || isSubmitting}
          className="px-5 py-3 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </button>
      </div>
    </div>
  );
};

export default StepOne;
