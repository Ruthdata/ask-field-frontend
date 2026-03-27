import { useRegisterResearcherMutation } from "@/redux/api/slices/authSlice";
import FormLayout from "@components/Auth/Contributor/Participant/FormLayout";
import { EyeIcon } from "@components/icons";
import WelcomeResearcher from "@components/Success/WelcomeResearcher";
import { useFormContext } from "@context/FormContext";
import { formatApiError } from "@utils/helper";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full box-border px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all focus:border-gray-900 focus:bg-white placeholder:text-gray-300";

export default function Password() {
  const { formData, formStep, setFormStep } = useFormContext();
  const [registerResearcher, {isLoading}] = useRegisterResearcherMutation();
  const [isComplete, setIsComplete] = useState(false)

  const [password, setPassword] = useState(formData.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(
    formData.confirmPassword || ""
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (formStep < 7) {
      navigate("/auth/sign-up/researcher");
    }
  }, [formStep]);

  const handleSubmit = async () => {
    try {
      if (password && confirmPassword) {
        setFormStep(8);
        console.log({ password });
        const postData = { ...formData, password };
        // updateFormData({password });
        console.log(postData);
        const res = await registerResearcher(postData).unwrap();
        if (res.success) {
          setIsComplete(true)
        }
        //   navigate("/next-route"); // add your next step here if needed
      }
    } catch (error) {
      const message = formatApiError(error);
      toast.error(message);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const isPasswordClear = () => {
    return !password || !confirmPassword || password != confirmPassword;
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
          <div className="relative">
            <input
              className={inputClass}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              className={inputClass}
              name="password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
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
            disabled={isPasswordClear()}
            className="w-full bg-gray-800 text-white py-3 rounded-4xl font-medium cursor-pointer hover:bg-gray-900 transition disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </div>
      </div>
      <WelcomeResearcher open={isComplete} />
    </FormLayout>
  );
}
