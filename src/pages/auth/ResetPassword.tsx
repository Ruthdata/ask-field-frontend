import {
  useSendOtpMutation,
  useVerifyResetPasswordOtpMutation,
} from "@/redux/api/slices/authSlice";
import OTPForm from "@components/Button/OTPForm";
import { formatApiError } from "@utils/helper";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [verifyResetPasswordOtp, { isLoading: isLoadingResetOtp }] =
    useVerifyResetPasswordOtpMutation();
  const [resendOtp, { isLoading: isLoadingSendOtp }] = useSendOtpMutation();
  const [otp, setOtp] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  const email = searchParams.get("email");

  const handleOtpChange = async (value: string) => {
    try {
      setOtp(value);
      if (!email) {
        return toast.error("Please provide an email");
      }

      // Automatically trigger verification when all 6 digits are entered
      if (value.length === 6) {
        const form = { email, code: value };
        const res = await verifyResetPasswordOtp(form).unwrap();
        const token = res.data.token;
        if (res.success) {
          setError("");
          toast.success(res.message ?? "");
          return navigate(
            `/auth/change-password?token=${token}&email=${email}`
          );
        }
      }
    } catch (error) {
      const message = formatApiError(error);
      setError(message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!email) {
        return toast.error("Please provide an email");
      }
      if (otp.length === 6) {
        const form = { email, code: otp };
        const res = await verifyResetPasswordOtp(form).unwrap();
        const token = res.data.token;
        if (res.success) {
          setError("");
          toast.success(res.message ?? "");
          return navigate(
            `/auth/change-password?token=${token}&email=${email}`
          );
        }
      }
    } catch (error) {
        console.log(error,'the error')
      const message = formatApiError(error);
      setError(message);
    }
  };

  const handleResend = async () => {
    try {
      setOtp("");
      if (!email) {
        return setError("We experienced an issue accessing your email");
      }
      const res = await resendOtp({ email }).unwrap();
      if (res.success) {
        setError("");
        toast.success(res.message ?? "");
      }
    } catch (error) {
      const message = formatApiError(error);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-24 pb-12">
      <div className="w-full flex flex-col items-center gap-4">
        <h2 className="md:text-4xl text-2xl font-semibold text text-center">
          Password Reset
        </h2>
        <p className="text-[14px] text-center">
          We’ve sent a 6-digit code to{" "}
          <span className="font-bold">{email}</span>
        </p>
        <div className="md:w-[50%] w-full">
          <div className="flex justify-center my-3">
            <OTPForm value={otp} handleChange={handleOtpChange} numInputs={6} />{" "}
          </div>
          {error && (
            <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          <p className="text-center mt-4 text-[12px]">
            Didn’t receive any email?{" "}
            <button
              disabled={isLoadingSendOtp}
              onClick={handleResend}
              className="text-yellow-400 cursor-pointer"
            >
              {isLoadingSendOtp ? "Resending..." : "Click to resend"}
            </button>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
