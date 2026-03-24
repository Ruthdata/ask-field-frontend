import { useSendOtpMutation } from "@/redux/api/slices/authSlice";
import { formatApiError } from "@utils/helper";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const RecoverPassword = () => {
  const navigate = useNavigate()
  const [sendOtp, {isLoading}] = useSendOtpMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
        if(!email) return
      const response = await sendOtp({ email }).unwrap();

      if (response.success) {
        setError('')
        toast.success(response.message || "");
        navigate(`/auth/reset-password?email=${email}`)
      }

    } catch (err) {
      const message = formatApiError(err)
      setError(message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-24 pb-12">
      <div className="w-full flex flex-col items-center gap-4">
        <h2 className="md:text-4xl text-2xl font-semibold text text-center">
          Recover Password
        </h2>
        <p className="text-[14px] text-center">
          Don’t worry, we’ll send you a reset notification.
        </p>
        <div className="md:w-[50%] w-full">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
            className="w-full border border-gray-300 rounded-lg px-4 mb-2 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {error && (
            <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "Recover Password"}
          </button>
          <Link to='/auth/login'>
          <button
            className="w-full mt-3 py-3 text-gray-700 bg-gray-200 rounded-full text-sm tracking-wide active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Back to Login
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
