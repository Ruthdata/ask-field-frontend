import React, { ChangeEvent, useState } from "react";
import StepIndicator from "../StepIndicator";
import StudyDisplayToParticipant from "../StudyDisplayToParticipant";

type StepTwoData = {
  [key: string]: string | undefined; // allows dynamic fields
};

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "textarea"; // new property
  fullWidth?: boolean; // for spanning both columns
  placeholder?: string;
  isRequired?: boolean;
};

type StepTwoProps = {
  stepTwoData: StepTwoData;
  setStepTwoData: (data: StepTwoData) => void;
  fields: FieldConfig[]; // list of input fields with labels
  step: number;
  totalSteps: number;
  onNext: () => void;
};

const StepTwo = ({
  stepTwoData,
  setStepTwoData,
  fields,
  step,
  totalSteps,
  onNext,
}: StepTwoProps) => {
  const [selectedDevice, setSelectedDevice] = useState<string>(
    stepTwoData.device || ""
  );

  const [selectedStudyRequirement, setSelectedStudyRequirement] = useState<string>(
    stepTwoData.equipment || ""
  );

  const devices = ["Mobile", "Tablet", "Desktop"];
  const equipments = ["Audio", "Camera", "Microphone", "Software Download"];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStepTwoData({ ...stepTwoData, [name]: value });
  };

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device);
    setStepTwoData({ ...stepTwoData, device });
  };

  const handleStudentRequirement = (studyRequirement: string) => {
    setSelectedStudyRequirement(studyRequirement);
    setStepTwoData({ ...stepTwoData, studyRequirement });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold">Study Details</h1>

      <p className="mt-6 text-sm sm:text-base">
        Please fill out the study information:
      </p>

      {/* Dynamic Fields */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {fields.map((field) => (
          <div key={field.name} className={field.fullWidth ? "col-span-2" : ""}>
            <label className="block text-gray-600 text-sm mb-1">
              {field.label}
              {field.isRequired && <span className="text-red-500">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={stepTwoData[field.name] || ""}
                onChange={handleInputChange}
                placeholder={field.placeholder || ""}
                className="input resize-none h-24"
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={stepTwoData[field.name] || ""}
                onChange={handleInputChange}
                placeholder={field.placeholder || ""}
                className="input"
              />
            )}
          </div>
        ))}
      </div>

      {/* Study Label Section */}
      <div className="mt-6">
        <StudyDisplayToParticipant />
      </div>

      {/* Device Requirement Section */}
      <div className="mt-8">
        <h1 className="text-md sm:text-md font-semibold my-2">
          Device Requirement
        </h1>
        {/* Device options */}
        <p className="mt-2 text-sm sm:text-base">
          What devices can Participants use to take the study?
          <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {devices.map((device) => (
            <div
              key={device}
              onClick={() => handleDeviceSelect(device)}
              className={`border rounded-3xl p-2 flex items-center justify-center cursor-pointer transition
                ${
                  selectedDevice === device
                    ? "border-yellow-400 border shadow-lg bg-yellow-50"
                    : "border-gray-200 hover:shadow-lg"
                }`}
            >
              <span className="capitalize font-medium">{device}</span>
            </div>
          ))}
        </div>
        {/* Device requirement */}
        <p className="mt-2 text-sm sm:text-base">
          Does your Study require any of the following?
          <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {equipments.map((equipment) => (
            <div
              key={equipment}
              onClick={() => handleStudentRequirement(equipment)}
              className={`border rounded-3xl p-2 flex items-center justify-center cursor-pointer transition
                ${
                    selectedStudyRequirement === equipment
                    ? "border-yellow-400 border shadow-lg bg-yellow-50"
                    : "border-gray-200 hover:shadow-lg"
                }`}
            >
              <span className="capitalize font-medium">{equipment}</span>
            </div>
          ))}
        </div>
        <div className="flex mt-3 gap-2 items-start pt-2">
          <img src="/information.svg" alt="info" />
          <p className="text-[11px] font-light">
            The devices and tool options will be displayed to participants on
            their study preview. These options don’t screen participants. Top
            screen participants, use the{" "}
            <span className="text-yellow-400 mx-1">Prescreen participants</span>
            option in the{" "}
            <span className="text-yellow-400 mx-1">
              Recruit Participants
            </span>{" "}
            section. Learn more about{" "}
            <span className="text-yellow-400 mx-1">Device Compatibility</span>
          </p>
        </div>
      </div>

      {/* Step Indicator & Next Button */}
      <div className="flex items-center justify-between mt-6 flex-col md:flex-row gap-5">
        <StepIndicator step={step} totalSteps={totalSteps} />
        <div className="flex gap-2">
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-3xl bg-[#3E3E3E] text-white cursor-pointer"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
