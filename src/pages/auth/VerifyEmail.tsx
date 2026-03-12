import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useVerifyEmailMutation } from "@/redux/api/slices/authSlice";
import { ApiSuccess } from "@/types/api.type";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [verifyEmail, { data, isLoading }] = useVerifyEmailMutation();

  useEffect(() => {
    const verify = async () => {
      if (!email || !token) return;

      try {
        const res = await verifyEmail({ email, token }).unwrap();
        if (res.success) {
          toast.success(data?.message || "Email verified successfully!");
          setTimeout(() => navigate("/waitlist"), 3000);
        }
      } catch (err: any) {
        const apiError = err?.data?.error || "Verification failed"
        setError(apiError);
        // setTimeout(() => navigate("/auth/sign-up/participant"), 3000);
      }
    };

    verify();
  }, [searchParams, email, token, navigate]);
  console.log({error})

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {error && <p>{error}</p>}
      {data?.success && (
        <p>✅ Email verified successfully! Redirecting to login...</p>
      )}
    </div>
  );
};

export default VerifyEmail;
