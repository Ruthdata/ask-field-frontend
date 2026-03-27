import { useResetPasswordMutation } from "@/redux/api/slices/userSlice";
import { EyeIcon } from "@components/icons";
import CompleteProfileSuccess from "@components/Success/CompleteProfileSuccess";
import PasswordChangeSuccess from "@components/Success/PasswordChangeSuccess";
import { formatApiError } from "@utils/helper";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const inputClass =
  "w-full box-border px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all focus:border-gray-900 focus:bg-white placeholder:text-gray-300";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

const ChangePassword = () => {
  const [resetPassword] = useResetPasswordMutation()
  const navigate = useNavigate()
  const [isComplete, setIsCommplete] = useState(false)

  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("")

  const [form, setForm] = useState({ confirmPassword: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const handleSubmit = async () => {
    try {
        if (!email) {
            return toast.error("Please provide an email");
          }
        if (!token) {
            return toast.error("Please provide an token");
          }
    
        if (!form.password && !form.confirmPassword) {
          return setError('Please provide a password and confirm it');
        }

        if (form.password != form.confirmPassword) {
          return setError('Password and Confirm Passwords must match');
        }

        if (form.password.length < 8) {
          return setError('Password must be atleast 8 characters long');
        }
        setError('')
        const res = await resetPassword({email, token, password: form.password}).unwrap()
        if(res.success){
            toast.success(res.message ?? "")
            setIsCommplete(true)
        }
    } catch (error) {
        const message = formatApiError(error)
        console.log({message})
        setError(message)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-24 pb-12">
      <div className="w-full flex flex-col items-center gap-4">
        <h2 className="md:text-4xl text-2xl font-semibold text text-center">
          Set New Password
        </h2>
        <p className="text-[14px] text-center">
          Must be at least 8 characters.
        </p>
        <div className="md:w-[50%] w-full">
          <div className="mb-1.5">
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelClass} style={{ marginBottom: 0 }}>
                Password<span className="text-red-400 ml-0.5">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                className={inputClass}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a strong password"
                value={form.password}
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
          <div className="mb-1.5">
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelClass} style={{ marginBottom: 0 }}>
                Confirm Password<span className="text-red-400 ml-0.5">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                className={inputClass}
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 bg-gray-900 text-white rounded-full text-sm tracking-wide hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Set new Password
          </button>
          <p className="text-center mt-4 text-[12px]">
            Didn’t receive any email?{" "}
            <span className="text-yellow-400 cursor-pointer">
              Click to resend
            </span>{" "}
          </p>
        </div>
      </div>
      <PasswordChangeSuccess
        to="/auth/login/participant"
        open={isComplete}
      />
    </div>
  );
};

export default ChangePassword;
