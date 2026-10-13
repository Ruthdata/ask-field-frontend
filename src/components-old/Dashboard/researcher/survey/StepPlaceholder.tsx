import StepIndicator from "./StepIndicator";

type StepProps = {
    stepNumber: number;
    totalSteps: number;
    onNext: () => void;
  };
  const StepPlaceholder = ({ stepNumber, totalSteps, onNext }: StepProps) => {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Step {stepNumber}</h1>
        <p className="text-sm text-gray-600">
          Content for step {stepNumber} goes here. You can replace this with your actual form fields.
        </p>
        <StepIndicator step={stepNumber} totalSteps={totalSteps} />
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer"
          >
            Save and Continue
          </button>
        </div>
      </div>
    );
  };

export default StepPlaceholder