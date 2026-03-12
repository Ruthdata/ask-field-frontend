import React, { useState } from "react";
import VerifyEmailScreen from "./VerifyEmailScreen";
import GoogleAuth from "@components/Google/GoogleAuth";


const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

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
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            role: "participant",
            // Required by schema — collect in a later profile completion step
            gender: "prefer-not-to-say",
            dateOfBirth: new Date("2000-01-01").toISOString(),
            identityDocument: "pending",
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setRegisteredEmail(form.email);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Swap to verification screen after successful registration
  if (registeredEmail) {
    return (
      <VerifyEmailScreen
        email={registeredEmail}
        onChangeEmail={() => setRegisteredEmail(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] px-10 py-11">
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
          className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-gray-300 accent-gray-900 cursor-pointer"
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
          checked={updates}
          onChange={() => setUpdates(!updates)}
          className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-gray-300 accent-gray-900 cursor-pointer"
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