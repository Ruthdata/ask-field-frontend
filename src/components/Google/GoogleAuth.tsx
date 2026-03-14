import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { GoogleIcon } from "@components/icons";
import { useGoogleAuthVerifyMutation } from "@/redux/api/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "@/config/constants";

const GoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [googleAuth] = useGoogleAuthVerifyMutation();
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const token = await user.getIdToken();

      const res = await googleAuth({ token }).unwrap();

      if(res.data.success) {
        const token = res.data.data.token;
        const user = res.data.data.user;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        navigate('/waitlist')
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={loginWithGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer mb-2"
    >
      <GoogleIcon />
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
};

export default GoogleAuth;