import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { GoogleIcon } from "@components/icons";

const GoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const token = await user.getIdToken();

      await fetch("http://localhost:5000/api/participants/auth/google-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });

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