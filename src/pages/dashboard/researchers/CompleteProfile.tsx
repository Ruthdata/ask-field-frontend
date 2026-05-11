import { useState, ChangeEvent, JSX, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCurrentUser } from "@hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";

type Step = {
  id: number;
  title: string;
  icon?: string;
};

const stepsData: Step[] = [
  {
    id: 1,
    title: "Verify Email",
    icon: "/images/dashboard/completed-step.svg",
  },
  {
    id: 2,
    title: "What are you here to do",
    icon: "/images/dashboard/chat-step.svg",
  },
  {
    id: 3,
    title: "What type of research are you interested in",
    icon: "/images/dashboard/chat-step.svg",
  },
  {
    id: 4,
    title: "Where did you hear about us",
    icon: "/images/dashboard/chat-step.svg",
  },
  {
    id: 5,
    title: "Set your office address",
    icon: "/images/dashboard/location.svg",
  },
];

type SelectedOptions = Record<number, string[]>;

type FormData = {
  firstName?: string;
  lastName?: string;
  organization?: string;
  street?: string;
  address2?: string;
  city?: string;
  country?: string;
};

export default function CompleteProfile(): JSX.Element {
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [showModal, setShowModal] = useState<boolean>(
    localStorage.getItem("researcher_profile_complete") !== "true",
  );
  const { researcher } = useCurrentUser();
  const navigate = useNavigate();

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: researcher?.firstName || "",
    lastName: researcher?.lastName || "",
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const percentage: number = Math.round(
    (completedSteps.size / stepsData.length) * 100,
  );

  useEffect(() => {
    if (researcher?.isVerified) {
      setCompletedSteps((prev) => new Set(prev).add(0));
      setActiveStep(1);
    }
  }, [researcher?.isVerified]);

  const handleNext = (): void => {
    if (activeStep !== null) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep));
      if (activeStep < stepsData.length - 1) setActiveStep(activeStep + 1);
    }
  };

  const toggleOption = (step: number, option: string): void => {
    setSelectedOptions((prev) => {
      const current = prev[step] || [];
      const exists = current.includes(option);
      const newOptions = exists
        ? current.filter((i) => i !== option)
        : [...current, option];

      setCompletedSteps((prevSet) => {
        const updated = new Set(prevSet);
        if (newOptions.length > 0) updated.add(step);
        else updated.delete(step);
        return updated;
      });

      return { ...prev, [step]: newOptions };
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setCompletedSteps((prevSet) => {
      const updated = new Set(prevSet);
      const hasValue = Object.values({ ...formData, [name]: value }).some(
        (val) => val && val !== "",
      );
      if (hasValue) updated.add(4);
      else updated.delete(4);
      return updated;
    });
  };

  const handleSaveAddress = (): void => {
    const optionSteps = [1, 2, 3];
    const addressStepIndex = 4;
    const requiredAddressFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "organization",
      "street",
      "city",
      "country",
    ];

    for (const step of optionSteps) {
      const selected = selectedOptions[step] || [];
      if (selected.length === 0) {
        setActiveStep(step);
        return;
      }
    }

    const emptyField = requiredAddressFields.find(
      (field) => !formData[field] || formData[field] === "",
    );
    if (emptyField) {
      setActiveStep(addressStepIndex);
      inputRefs.current[emptyField]?.focus();
      return;
    }

    const allData = {
      purposeHere: selectedOptions[1] || [],
      researchType: selectedOptions[2] || [],
      researchInterest: selectedOptions[3] || [],
      ...formData,
    };

    console.log("Complete Profile Data:", allData);
    
    setCompletedSteps(new Set([0, 1, 2, 3, 4]));
    localStorage.setItem("researcher_profile_complete", "true");
    setShowModal(false);
    navigate("/dashboard/researcher");
  };

  const renderStepContent = (index: number): JSX.Element | null => {
    const isVerified = !researcher?.isVerified;
    switch (index) {
      case 0:
        return (
          <div className="flex gap-6 items-center">
            <div className="flex-1">
              <p className="text-sm mb-4">
                We’ve sent a verification link to{" "}
                <span className="font-medium text-yellow-400">
                  {researcher?.email}
                </span>
                . Click it to verify your email.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                It typically takes 3 mins. Check spam if it doesn’t arrive.
              </p>
              <div className="flex gap-3">
                {isVerified && (
                  <button className="px-4 py-2 border cursor-pointer rounded-4xl text-sm">
                    Resend Email
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 border rounded-4xl text-sm bg-[#3E3E3E] text-white"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="/images/verify-email.png"
                alt="verify"
                className="w-full h-48 object-contain"
              />
            </div>
          </div>
        );
      case 1:
      case 2:
      case 3: {
        const options: string[] = [
          "UI/UX",
          "Marketing",
          "Education",
          "Healthcare",
          "Finance",
        ];
        return (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              {options.map((item) => {
                const isSelected = selectedOptions[index]?.includes(item);
                return (
                  <span
                    key={item}
                    onClick={() => toggleOption(index, item)}
                    className={`px-4 py-2 rounded-full text-sm cursor-pointer border transition ${
                      isSelected
                        ? "bg-yellow-400 text-white border-yellow-400"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </span>
                );
              })}
            </div>
            <button
              onClick={handleNext}
              disabled={!selectedOptions[index]?.length}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        );
      }
      case 4:
        return (
          <div className="grid grid-cols-2 gap-4">
            {[
              "firstName",
              "lastName",
              "organization",
              "street",
              "address2",
              "city",
              "country",
            ].map((field, i) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field as keyof FormData] || ""}
                onChange={handleInputChange}
                ref={(el) => {
                  inputRefs.current[field] = el;
                }}
                className={`input ${!formData[field as keyof FormData] && i < 6 ? "border-red-500" : ""}`}
              />
            ))}
            <div className="col-span-2">
              <button
                onClick={handleSaveAddress}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen p-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 pr-6 md:pr-1">
          <div className="bg-white rounded-2xl md:w-[78%] w-[95%] h-[90vh] p-8 shadow-xl flex flex-col overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              Help us set up your account
            </h2>

            <div className="relative w-fit mb-6">
              <div className="rounded-full px-1 pe-2 py-1 text-sm bg-gray-200 shadow flex justify-between gap-2 items-center">
                <span className="bg-[#FF0000] text-white text-[10px] rounded-4xl px-3 py-1">
                  {percentage}%
                </span>{" "}
                <span className="text-[13px] text-gray-400">Complete</span>
              </div>
            </div>

            <div className="w-full h-2 bg-yellow-100 rounded-full mb-8">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex flex-col gap-6">
              {stepsData.map((step, index) => {
                const isActive = index === activeStep;
                const isDisabled = index === 1 && !researcher?.isVerified;

                return (
                  <div key={step.id} className="relative">
                    {isActive && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-yellow-400"></div>
                    )}

                    <div
                      onClick={() =>
                        !isDisabled &&
                        setActiveStep((prev) => (prev === index ? null : index))
                      }
                      className={`flex items-center justify-between cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden`}
                        >
                          <img src={step.icon} alt="" />
                        </div>
                        <p className="font-medium">{step.title}</p>
                      </div>
                      {isActive ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>

                    {isActive && (
                      <div className="ml-12 mt-3 p-4 bg-gray-50 rounded-xl">
                        {renderStepContent(index)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .input {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
          }
          .input:focus {
            box-shadow: 0 0 0 2px #facc15;
          }
          .border-red-500 {
            border-color: #f87171;
          }
        `}
      </style>
    </div>
  );
}
