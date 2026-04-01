import StepOne from "@components/Dashboard/researcher/survey/create-survey-steps/StepOne";
import StepTwo, { FieldConfig } from "@components/Dashboard/researcher/survey/create-survey-steps/StepTwo";
import StepIndicator from "@components/Dashboard/researcher/survey/StepIndicator";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/** Define the combined form data type */
type FormData = {
  surveyType: "external" | "aiTaskBuilder" | null;
  stepTwoData?: {
    field1?: string;
    field2?: string;
    // add more fields for step two
  };
  stepThreeData?: any;
  stepFourData?: any;
  stepFiveData?: any;
};

const stepTwoField: FieldConfig[] = [
    { name: "researchName", label: "Study Name", placeholder: "Enter research name", isRequired: true, type: 'text' },
    { name: "studyName", label: "Internal Study Name", placeholder: "Enter study name", type: 'text' },
    { name: "studyDescription", label: "Description of Study", isRequired: true, type: 'textarea', fullWidth: true },
  ];

const CreateSurvey = () => {
  const navigate = useNavigate();
  const totalSteps = 5;
  const [step, setStep] = useState(1);

  // Single formData state
  const [formData, setFormData] = useState<FormData>({
    surveyType: null,
  });

  /** Update formData with partial step data */
  const handleUpdateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  /** Move to next step */
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final submission
      console.log("Complete Form Data:", formData);
      navigate("/dashboard/researcher/projects/123");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6 flex gap-5">
      {/* Left: Main Step */}
      <div className="flex-3 flex flex-col gap-5">
        {step === 1 && (
          <StepOne
          selected={formData.surveyType}
          setSelected={(selected) =>
            handleUpdateFormData({ surveyType: selected })
          }
          step={step}
          totalSteps={totalSteps}
          onNext={handleNext}
        />
        )}

        {step === 2 && (
          <StepTwo
            stepTwoData={formData.stepTwoData || {}}
            setStepTwoData={(data) => handleUpdateFormData({ stepTwoData: data })}
            step={step}
            totalSteps={totalSteps}
            onNext={handleNext}
            fields={stepTwoField}
          />
        )}

        {step === 3 && (
          <StepIndicator step={step} totalSteps={totalSteps}>
            {/* Replace with StepThree component */}
          </StepIndicator>
        )}

        {step === 4 && (
          <StepIndicator step={step} totalSteps={totalSteps}>
            {/* Replace with StepFour component */}
          </StepIndicator>
        )}

        {step === 5 && (
          <StepIndicator step={step} totalSteps={totalSteps}>
            {/* Replace with StepFive component */}
          </StepIndicator>
        )}
      </div>

      {/* Right: Sidebar / Cost Breakdown */}
      <div className="shadow-lg bg-white rounded-2xl px-4 py-7 flex-1 h-fit">
        <h3 className="font-bold mb-3">Cost Breakdown</h3>
        <div className="flex justify-between py-2 items-center">
          <span className="text-gray-400 text-[12px]">No. of Participants</span>
          <span className="font-semibold text-[12px]">0</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-gray-400 text-[12px]">Study Duration</span>
          <span className="font-semibold text-[12px]">1 mins</span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-gray-400 text-[12px]">Cost/Participants</span>
          <span className="font-semibold text-[12px]">NGN 12,000</span>
        </div>
        <div className="border-t border-t-gray-200 mt-3 pt-4 flex flex-col gap-3">
          <button className="w-full rounded-3xl bg-gray-300 font-light py-3 cursor-pointer">
            Save as draft
          </button>
          <button className="w-full rounded-3xl border border-gray-700 font-light py-2 cursor-pointer">
            Preview as Participant
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSurvey;