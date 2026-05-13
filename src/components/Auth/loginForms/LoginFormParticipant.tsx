import { STORAGE_KEYS } from "@/config/constants";
import { useLoginParticipantMutation } from "@/redux/api/slices/userSlice";
import { isJwtLikeToken, normalizeAuthToken } from "@/utils/token";
import GoogleAuth from "@components/Google/GoogleAuth";
import { EyeIcon } from "@components/icons";
import { formatApiError } from "@utils/helper";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const inputClass =
  "w-full box-border px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none transition-all focus:border-gray-900 focus:bg-white placeholder:text-gray-300";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

export default function LoginFormParticipant() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginUser, {}] = useLoginParticipantMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // Handle the form submission here (e.g., API call for login)
    try {
      // Placeholder for actual login logic
      const res = await loginUser(form).unwrap();
      if (res.success) {
        const accessToken = normalizeAuthToken(res.data.accessToken);
        const refreshToken = normalizeAuthToken(res.data.refreshToken);

        if (!accessToken || !isJwtLikeToken(accessToken)) {
          setError(
            "Login failed: the server did not return a valid access token.",
          );
          return;
        }

        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        localStorage.setItem(STORAGE_KEYS.USER_TYPE, "participant"); // add this
        // navigate("/waitlist");
        navigate("/dashboard/participant");
      }
      // Example of a successful login:
      // handleAuthSuccess(data, () => window.location.assign("/dashboard"));
    } catch (err) {
      const message = formatApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-115 bg-white rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] px-10 py-11">
      <h1 className="font-serif text-[2.2rem] leading-tight text-gray-900 mb-3">
        Login
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-7">
        Now, login to your AskField account & start getting paid.
      </p>
      <GoogleAuth />

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">Or, Login with your email</span>
        <div className="flex-1 h-px bg-gray-200" />
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

      <div className="mb-1.5">
        <div className="flex justify-between items-center mb-1.5">
          <label className={labelClass} style={{ marginBottom: 0 }}>
            Password<span className="text-red-400 ml-0.5">*</span>
          </label>
          <a
            href="/auth/recover-password"
            className="text-xs text-amber-500 font-medium hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <div className="relative">
          <input
            className={inputClass}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

      <div className="flex items-center gap-2 mt-3 mb-4">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
          className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
        />
        <label
          htmlFor="remember"
          className="text-xs text-gray-500 cursor-pointer"
        >
          Remember me
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
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center mt-4 text-xs text-gray-400">
        Don't have an account as a participant?{" "}
        <a
          href="/auth/sign-up/participant"
          className="text-red-400 font-medium hover:underline"
        >
          Sign Up
        </a>
      </p>
    </div>
  );
}
