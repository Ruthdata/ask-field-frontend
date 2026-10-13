type StepIndicatorProps = {
    step: number;
    totalSteps: number;
  };
  const StepIndicator = ({ step, totalSteps }: StepIndicatorProps) => {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500">
          Step {step}/{totalSteps}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-md transition-all duration-300 ${
                idx + 1 === step ? "bg-yellow-400 w-15" : "bg-gray-300 w-5"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  export default StepIndicator