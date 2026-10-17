import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";
import { useFormContext } from "@context/FormContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JobTitle() {
  const { formData, updateFormData, formStep, setFormStep } = useFormContext();
  const [jobTitle, setJobTitle] = useState(formData.jobTitle || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (formStep < 4) navigate("/auth/sign-up/researcher");
  }, [formStep, navigate]);

  const handleSubmit = () => {
    if (!jobTitle) return;
    updateFormData({ jobTitle });
    setFormStep(5);
    navigate("/auth/sign-up/researcher/organization-type");
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          What's your job title there?
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter Job Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 transition cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jobTitle}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 cursor-pointer transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
}
