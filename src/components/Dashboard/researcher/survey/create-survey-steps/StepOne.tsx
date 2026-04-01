import React from 'react'
import OptionCard from '../OptionCard';
import StepIndicator from '../StepIndicator';

type Step1Props = {
    selected: "external" | "aiTaskBuilder" | null;
    setSelected: (value: "external" | "aiTaskBuilder") => void;
    step: number;
    totalSteps: number;
    onNext: () => void;
  };
  
  const StepOne = ({
    selected,
    setSelected,
    step,
    totalSteps,
    onNext,
  }: Step1Props) => {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold">Create a Fresh Study</h1>
  
        <p className="mt-6 text-sm sm:text-base">How do you want to collect data</p>
  
        <p className="my-6 text-sm sm:text-base">
          Where did you spend most of your time before turning 18?{" "}
          <span className="text-red-500">*</span>
        </p>
  
        <div className="flex flex-col sm:flex-row gap-5 mt-6">
          <OptionCard
            type="external"
            selected={selected}
            setSelected={setSelected}
            title="External Study Link"
            description="Provide your survey's URL"
          />
          <OptionCard
            type="aiTaskBuilder"
            selected={selected}
            setSelected={setSelected}
            title="AI Task Builder"
            description="Create AI-data collections on Join Study"
          />
        </div>
  
        <div className="flex items-center justify-between mt-3 pt-6 flex-col md:flex-row gap-5">
          <StepIndicator step={step} totalSteps={totalSteps} />
  
          <div className="flex gap-2">
            <button
              onClick={onNext}
              disabled={!selected}
              className="px-4 py-2 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer disabled:opacity-50"
            >
              Save and Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

export default StepOne