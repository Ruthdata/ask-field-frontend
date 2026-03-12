import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";
import { useFormContext } from "@context/FormContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Password() {
  const { formData, updateFormData } = useFormContext();

  const [password, setPassword] = useState(formData.password || "");
  const [confirmPassword, setConfirmPassword] = useState(
    formData.confirmPassword || ""
  );

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (password && confirmPassword) {
      updateFormData({ password, confirmPassword });
    //   navigate("/next-route"); // add your next step here if needed
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Cool, now set a password for your account
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
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
            disabled={!password || !confirmPassword}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium cursor-pointer hover:bg-gray-900 transition disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </FormLayout>
  );
}