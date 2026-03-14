import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useVerifyEmailMutation } from "@/redux/api/slices/authSlice";
import { useRef } from "react";


const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [verifyEmail, { data, isLoading }] = useVerifyEmailMutation();


const hasVerified = useRef(false);

useEffect(() => {
  if (hasVerified.current) return;

  const verify = async () => {
    if (!email || !token) return;

    hasVerified.current = true;

    try {
      const res = await verifyEmail({ email, token }).unwrap();

      if (res.success) {
        toast.success(res.message || "Email verified successfully!");
        setTimeout(() => navigate("/waitlist"), 3000);
      }
    } catch (err: any) {
      const apiError = err?.data?.error || "Verification failed";
      setError(apiError);

      setTimeout(() => navigate("/auth/sign-up/participant"), 3000);
    }
  };

  verify();
}, [email, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p>Please hold. Checking this account.</p>
    </div>
  );
};

export default VerifyEmail;
