import { useFormContext } from "@context/FormContext";
import FormLayout from "./FormLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Company() {
  const { formData, updateFormData } = useFormContext();
  const [email, setEmail] = useState(formData.email || "");
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (email && agreed) {
      updateFormData({ email });
      navigate("/auth/sign-up/participant/country"); // Next step
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && email && agreed) {
      handleSubmit();
    }
  };

  return (
    <FormLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          What's your
        </h1>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          organization email
        </h1>

        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            />
          </div>

          <p className="text-sm text-gray-600 mb-4">
            We'll occasionally send you emails and messages about how to use
            AskField, as well as new features and offers.
          </p>

          <div className="flex items-start mb-6">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 mr-2 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
            />

            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to AskField{" "}
              <span className="text-amber-500 hover:text-amber-600 font-medium cursor-pointer">
                Research Terms
              </span>{" "}
              and have read and understood the{" "}
              <span className="text-amber-500 hover:text-amber-600 font-medium cursor-pointer">
                Privacy Policy
              </span>
              .
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email || !agreed}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
}