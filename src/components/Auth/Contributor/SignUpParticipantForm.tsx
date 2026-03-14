import React, { useState } from "react";
import VerifyEmailScreen from "./EmailSentScreen";
import GoogleAuth from "@components/Google/GoogleAuth";
import { useRegisterParticipantMutation } from "@/redux/api/slices/authSlice";
import toast from "react-hot-toast";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { EyeIcon } from "@components/icons";
import { User } from "@/types/user.type";

const inputClass =
  "w-full box-border px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all focus:border-gray-900 focus:bg-white placeholder:text-gray-300";

const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

export default function SignUpParticipantForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [registerUser, { isLoading, error: registerError, data }] =
    useRegisterParticipantMutation();

    const [form, setForm] = useState<Partial<User> & { confirmPassword: string }>({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      signupPlatform: "email",
      receivesUpdates: false,
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Participant Terms to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form).unwrap();
      if (res.success && res.message) {
        toast.success(res.message);
        navigate(`/auth/email-sent?email=${form.email}`);
      } else {
        setError("");
      }
    } catch (err) {
      const message =
        ((err as FetchBaseQueryError).data as { error: string })?.error ??
        "Network error.";
      console.log(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-115 bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] px-10 py-11">
      <h1 className="font-serif text-[2.2rem] leading-tight text-gray-900 mb-3">
        Sign up as a<br />
        participant
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-7">
        Please enter your legal name exactly as it appears on your ID issued by
        your current country of residence. Otherwise, you may not be able to
        join. For a full list of accepted IDs.
      </p>

      <GoogleAuth />

      {/* Removed Google, Facebook, and Apple buttons */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">
          Or, sign up with your email
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <div>
          <label className={labelClass}>
            Legal First Name<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            className={inputClass}
            name="firstName"
            placeholder="Enter first name"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className={labelClass}>
            Legal Last Name<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            className={inputClass}
            name="lastName"
            placeholder="Enter last name"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3.5">
        <label className={labelClass}>
          Email<span className="text-red-400 ml-0.5">*</span>
        </label>
        <input
          className={inputClass}
          name="email"
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3.5">
        <label className={labelClass}>Password</label>
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

      <div className="mb-3.5">
        <label className={labelClass}>Confirm Password</label>
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
      </div>

      <div className="flex items-start gap-2.5 mb-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
          className="w-4 h-4 mt-0.5 shrink-0 rounded border-gray-300 accent-gray-900 cursor-pointer"
        />
        <label
          htmlFor="terms"
          className="text-xs text-gray-500 leading-relaxed cursor-pointer"
        >
          I agree to AskField&apos;s{" "}
          <a href="#" className="text-red-400 font-medium hover:underline">
            Participant Terms
          </a>{" "}
          and have read and understood the{" "}
          <a href="#" className="text-red-400 font-medium hover:underline">
            Privacy Notice
          </a>
          .
        </label>
      </div>

      <div className="flex items-start gap-2.5 mb-3">
        <input
          type="checkbox"
          id="updates"
          checked={form.receivesUpdates}
          onChange={() =>
            setForm((prev) => ({
              ...prev,
              receivesUpdates: !prev.receivesUpdates,
            }))
          }
          className="w-4 h-4 mt-0.5 shrink-0 rounded border-gray-300 accent-gray-900 cursor-pointer"
        />
        <label
          htmlFor="updates"
          className="text-xs text-gray-500 leading-relaxed cursor-pointer"
        >
          I want to receive updates about services, promotions & news from
          AskField, its affiliates and business partners (e.g., through
          newsletters and/or SMS messages).
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-2 py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold tracking-wide hover:bg-gray-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-center mt-4 text-xs text-gray-400">
        Already registered as a participant on AskField?{" "}
        <a href="/login" className="text-red-400 font-medium hover:underline">
          Login
        </a>
      </p>
    </div>
  );
}
