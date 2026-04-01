import React, { useState } from "react";

type StudyLabel = {
  name: "survey" | "decision making" | "writing" | "interview" | "ai task" | "none";
  icon: string;
};

const StudyDisplayToParticipant = () => {
  const [selectedLabel, setSelectedLabel] = useState<StudyLabel | null>(null);

  const labels: StudyLabel[] = [
    { name: "survey", icon: "/images/survey-label.svg" },
    { name: "decision making", icon: "/images/decision-making.svg" },
    { name: "writing", icon: "/images/survey-writing.svg" },
    { name: "interview", icon: "/images/survey-interview.svg" },
    { name: "ai task", icon: "/images/survey-ai.svg" },
    { name: "none", icon: "/images/survey-none.svg" },
  ];

  const optionStyles = (label: StudyLabel) =>
    `border rounded-2xl p-5 flex flex-col items-center justify-center relative cursor-pointer transition
     ${
       selectedLabel?.name === label.name
         ? "border-yellow-400 ring-2 ring-yellow-400 shadow-lg bg-yellow-50"
         : "border-gray-200 hover:shadow-lg"
     }`;

  return (
    <div>
      <h1 className="text-md sm:text-md font-semibold my-2">Data Collection Type</h1>
      <p className="mt-6 text-sm sm:text-base">
        Select a Study Label to display to Participants
        <span className="text-red-500">*</span>
      </p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {labels.map((label) => (
          <div
            key={label.name}
            className={optionStyles(label)}
            onClick={() => setSelectedLabel(label)}
          >
            {/* Radio indicator */}
            <div
              className={`h-5 w-5 rounded-full mb-2 flex items-center justify-center absolute top-3 left-3 ${
                selectedLabel?.name === label.name
                  ? "border-yellow-400 border-2"
                  : "border-gray-300 border"
              }`}
            >
              {selectedLabel?.name === label.name && (
                <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full" />
              )}
            </div>

            {/* Icon */}
            <img src={label.icon} alt={label.name} className="mb-2 w-8 h-8" />

            {/* Label */}
            <span className="capitalize font-medium">{label.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyDisplayToParticipant;