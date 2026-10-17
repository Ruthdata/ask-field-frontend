import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";
import { useFormContext } from "@context/FormContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrganizationName() {
  const { formData, updateFormData, formStep, setFormStep } = useFormContext();
  const [organizationName, setOrganizationName] = useState(
    formData.organizationName || "",
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (formStep < 3) navigate("/auth/sign-up/researcher");
  }, [formStep, navigate]); // FIXED: navigate added to deps

  const handleSubmit = () => {
    if (!organizationName) return;
    updateFormData({ organizationName });
    setFormStep(4);
    navigate("/auth/sign-up/researcher/job-title");
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          What's the name of your organization?
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization/Institution Name
          </label>
          <input
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter Organization Name"
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
            disabled={!organizationName}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 cursor-pointer transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
}
