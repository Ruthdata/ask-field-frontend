import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useVerifyEmailMutation, useVerifyResearcherEmailMutation } from "@/redux/api/slices/userSlice";
import { useRef } from "react";
import VerifyAccountSuccess from "@components/Success/VerifyAccountSuccess";


const VerifyResearcherEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [isComplete, setIsComplete] = useState(false)

  const navigate = useNavigate();
  const [verifyEmail] = useVerifyResearcherEmailMutation();


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
        setTimeout(() => navigate("/auth/login/researcher"), 3000);
      }
    } catch (err: any) {
      const apiError = err?.data?.error || "Verification failed";
      toast.error(apiError)

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

export default VerifyResearcherEmail;
