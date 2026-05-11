import { ChangeEvent } from "react";
import StepIndicator from "../StepIndicator";
import StudyDisplayToParticipant from "../StudyDisplayToParticipant";
import { SurveyStepTwoData } from "@/types/survey";

export type FieldConfig = {
  name: keyof SurveyStepTwoData | string;
  label: string;
  type?: "text" | "textarea";
  fullWidth?: boolean;
  placeholder?: string;
  isRequired?: boolean;
};

type StepTwoProps = {
  stepTwoData: SurveyStepTwoData;
  setStepTwoData: (data: SurveyStepTwoData) => void;
  fields: FieldConfig[];
  step: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

const deviceOptions = ["Mobile", "Tablet", "Desktop"];
const equipmentOptions = ["Audio", "Camera", "Microphone", "Software Download"];
const ageOptions = Array.from({ length: 83 }, (_, index) => String(index + 18));
const genderOptions = ["Male", "Female"];
const selectClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white";

const StepTwo = ({
  stepTwoData,
  setStepTwoData,
  fields,
  step,
  totalSteps,
  onNext,
  onBack,
  isSubmitting = false,
}: StepTwoProps) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStepTwoData({ ...stepTwoData, [name]: value });
  };

  const updateStepTwoField = (name: keyof SurveyStepTwoData, value: string) => {
    setStepTwoData({ ...stepTwoData, [name]: value });
  };

  const toggleDevice = (device: string) => {
    const hasDevice = stepTwoData.usableDevices.includes(device);
    const usableDevices = hasDevice
      ? stepTwoData.usableDevices.filter((item) => item !== device)
      : [...stepTwoData.usableDevices, device];

    setStepTwoData({ ...stepTwoData, usableDevices });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold">Study Details</h1>
      <p className="mt-3 text-sm text-gray-600">
        Add the key information participants need before joining your study.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
            <label className="block text-gray-700 text-sm mb-1.5">
              {field.label}
              {field.isRequired && <span className="text-red-500">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={stepTwoData[field.name as keyof SurveyStepTwoData] as string}
                onChange={handleInputChange}
                placeholder={field.placeholder || ""}
                className="input resize-none h-28"
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={stepTwoData[field.name as keyof SurveyStepTwoData] as string}
                onChange={handleInputChange}
                placeholder={field.placeholder || ""}
                className="input"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <StudyDisplayToParticipant
          selectedLabel={stepTwoData.surveyLabel}
          onChange={(surveyLabel) =>
            setStepTwoData({ ...stepTwoData, surveyLabel })
          }
        />
      </div>

      <div className="mt-8">
        <h2 className="text-base sm:text-lg font-semibold">Device Requirement</h2>
        <p className="mt-2 text-sm text-gray-700">
          What devices can participants use to take the study?
          <span className="text-red-500">*</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {deviceOptions.map((device) => {
            const isSelected = stepTwoData.usableDevices.includes(device);

            return (
              <button
                key={device}
                type="button"
                onClick={() => toggleDevice(device)}
                className={`border rounded-2xl p-4 flex items-center justify-center cursor-pointer transition text-sm font-medium ${
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                {device}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-gray-700">
          Does your study require any of the following?
          <span className="text-red-500">*</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {equipmentOptions.map((equipment) => {
            const isSelected = stepTwoData.surveyEquipment === equipment;

            return (
              <button
                key={equipment}
                type="button"
                onClick={() =>
                  setStepTwoData({ ...stepTwoData, surveyEquipment: equipment })
                }
                className={`border rounded-2xl p-4 flex items-center justify-center cursor-pointer transition text-sm font-medium ${
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                {equipment}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] sm:text-xs text-gray-500 leading-relaxed">
          These options help participants understand what is needed before they
          join. Use later recruitment settings to decide who is eligible.
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold">
          Participant Requirements
        </h2>

        <div className="mt-4 border border-gray-100 rounded-2xl p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">
                Min Age<span className="text-red-500">*</span>
              </label>
              <select
                value={stepTwoData.minimumAge}
                onChange={(e) =>
                  updateStepTwoField("minimumAge", e.target.value)
                }
                className={`${selectClass} mt-2`}
              >
                <option value="">-- Select --</option>
                {ageOptions.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700">
                Max Age<span className="text-red-500">*</span>
              </label>
              <select
                value={stepTwoData.maximumAge}
                onChange={(e) =>
                  updateStepTwoField("maximumAge", e.target.value)
                }
                className={`${selectClass} mt-2`}
              >
                <option value="">-- Select --</option>
                {ageOptions.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="block mt-4 text-sm text-gray-700">Gender</label>
          <select
            value={stepTwoData.gender}
            onChange={(e) => updateStepTwoField("gender", e.target.value)}
            className={`${selectClass} mt-2`}
          >
            <option value="">-- Select or search --</option>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
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

export default StepTwo;
