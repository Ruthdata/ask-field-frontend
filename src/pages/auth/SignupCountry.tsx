import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "@context/FormContext";
import { COUNTRIES } from "@/lib/countries";
import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";

export default function SignupCountry() {
  const { formData, updateFormData } = useFormContext();
  const [country, setCountry] = useState(formData.country || "");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (country) {
      updateFormData({ country });
      navigate("/auth/sign-up/participant/organization-name");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          What is your country of residence?
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country of residence
          </label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Select a country</option>

            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 transition cursor-pointer"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={!country}
            className="w-full bg-gray-800 text-white py-3 cursor-pointer rounded-4xl font-medium hover:bg-gray-900 transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
}