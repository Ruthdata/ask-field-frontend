import { PARTICIPANT_QUESTIONS } from "@/config/constants";
import CompleteProfileSuccess from "@components/Modal/Success/CompleteProfileSuccess";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { getFormattedAnswers } from "@/utils/formatDate";
import { useCompleteProfileMutation } from "@/redux/api/slices/userSlice";
import { formatApiError } from "@utils/helper";

const CompleteProfile = () => {
  const [completeProfile, {isLoading}] = useCompleteProfileMutation()

  const [showModal, setShowModal] = useState(true);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleteProfile, setIsCompleteProfile] = useState(false);
  const { getParticipantFirstName, refetchUser } = useCurrentUser();

  const totalSteps = PARTICIPANT_QUESTIONS.length;
  const currentStepData = PARTICIPANT_QUESTIONS[step - 1];
  const username = getParticipantFirstName();

  // NEXT STEP
  const handleNextStep = async() => {
    try {
      
      const currentQuestions = currentStepData.questions;
  
      // ✅ VALIDATION
      const isValid = currentQuestions.every((q) => {
        if (q.type === "date") {
          return (
            answers[`${q.name}_day`] &&
            answers[`${q.name}_month`] &&
            answers[`${q.name}_year`]
          );
        }
        return answers[q.name] && answers[q.name].trim() !== "";
      });
  
      if (!isValid) {
        toast.error("Please fill all fields before continuing.");
        return;
      }
  
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // const formattedAnswers = getFormattedAnswers(answers);
  
        const res = await completeProfile(answers).unwrap()
  
        if(res.success){
          await refetchUser()
          toast.success(res.message ?? '')
          setShowModal(false);
          setIsCompleteProfile(true);
        }
        
      }
    } catch (error) {
      const message = formatApiError(error)
      toast.error(message || '')
    }
  };

  // BACK
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // HANDLE INPUT + SELECT
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="relative min-h-screen p-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 pr-6 md:pr-1">
          <div className="bg-white rounded-2xl md:w-[78%] w-[95%] min-h-[70vh] h-[90vh] p-8 shadow-xl flex flex-col overflow-y-auto">
            {/* HEADER */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Profile to Start Getting Paid
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This helps us match you with relevant surveys and ensure smooth
              payouts.
            </p>

            {/* QUESTIONS */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-5">
                <img src="/Subtract.svg" alt="icon" />
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-3">
                    {currentStepData.label}
                  </h3>
                  <div className="flex gap-1 items-center">
                    <img src="/information.svg" className="h-3" alt="info" />
                    <p className="text-gray-400 text-[10px]">
                      {currentStepData?.info}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.questions.map((q) => (
                  <div
                    key={q.name}
                    className={`col-span-1 ${
                      q.span === 2 ? "md:col-span-2" : ""
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {q.label}
                      <span className="text-red-500">*</span>
                    </label>

                    {/* INPUT */}
                    {q.type === "input" && (
                      <input
                        type="text"
                        name={q.name}
                        value={answers[q.name] || ""}
                        onChange={handleChange}
                        placeholder={q.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    )}

                    {/* SELECT */}
                    {q.type === "select" && (
                      <select
                        name={q.name}
                        value={answers[q.name] || ""}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                          !answers[q.name] ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        <option value="" className="text-gray-400">
                          -- Select or Search --
                        </option>
                        {q.options?.map((option: string) => (
                          <option
                            key={option}
                            value={option}
                            className="text-gray-900"
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {/* {DATE} */}
                    {q.type === "date" && (
                      <div className="flex gap-2">
                        {/* DAY */}
                        <select
                          name={`${q.name}_day`}
                          value={answers[`${q.name}_day`] || ""}
                          onChange={handleChange}
                          className="w-1/3 border border-gray-300 rounded-lg px-2 py-2"
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>

                        {/* MONTH */}
                        <select
                          name={`${q.name}_month`}
                          value={answers[`${q.name}_month`] || ""}
                          onChange={handleChange}
                          className="w-1/3 border border-gray-300 rounded-lg px-2 py-2"
                        >
                          <option value="">Month</option>
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((m, i) => (
                            <option key={i + 1} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </select>

                        {/* YEAR */}
                        <select
                          name={`${q.name}_year`}
                          value={answers[`${q.name}_year`] || ""}
                          onChange={handleChange}
                          className="w-1/3 border border-gray-300 rounded-lg px-2 py-2"
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 2016 - 1940 + 1 }, (_, i) => {
                            const year = 2016 - i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-auto pt-6 flex-col md:flex-row gap-4">
              {/* STEP INDICATOR */}
              <div className="flex flex-col items-center gap-2">
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

              {/* BUTTONS */}
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 cursor-pointer"
                >
                  {isLoading ? "Loading..." : step === totalSteps ? "Submit" : "Save and Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <CompleteProfileSuccess
        to="/dashboard/participant"
        open={isCompleteProfile}
        name={username}
      />
    </div>
  );
};

export default CompleteProfile;
