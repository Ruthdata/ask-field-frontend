import { PARTICIPANT_QUESTIONS } from "@/config/constants";
import React, { useState } from "react";

const CompleteProfile = () => {
  const [showModal, setShowModal] = useState(true);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const totalSteps = PARTICIPANT_QUESTIONS.length;
  const currentQuestion = PARTICIPANT_QUESTIONS[step - 1];

  const handleNextStep = () => {
    console.log("Saved answers:", answers);
  
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log("Final submission:", answers);
      setShowModal(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="relative min-h-screen p-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 w-full right-0 flex items-center justify-center bg-black/50">
          <div className="bg-white/90 rounded-2xl md:w-[70%] w-[95%] min-h-[70vh] p-8 relative shadow-xl flex flex-col">
            {" "}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Profile to Start Getting Paid
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This helps us match you with relevant surveys and ensure smooth
              payouts.
            </p>
            {/* Step Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex gap-5">
                <img src="/Subtract.svg" /> {currentQuestion.title}
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currentQuestion.label}*
              </label>
              <input
                type="text"
                name={currentQuestion.name}
                value={answers[currentQuestion.name] || ""}
                onChange={handleChange}
                placeholder={currentQuestion.placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between md:flex-row gap-5 md:gap-0 flex-col mt-auto pt-6">              {/* Step Indicator */}
              <div className="flex items-center gap-2 flex-col">
                <span className="text-xs text-gray-500">
                  Step {step}/{totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 rounded-md transition-all duration-300 ${
                        idx + 1 === step
                          ? "bg-yellow-400 w-8"
                          : "bg-gray-300 w-4"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleNextStep();
                  }}
                  className="px-4 py-2 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 transition"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dim the background when modal is open */}
      {/* {showModal && <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />} */}
    </div>
  );
};

export default CompleteProfile;
