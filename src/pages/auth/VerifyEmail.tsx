import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useVerifyEmailMutation } from "@/redux/api/slices/authSlice";
import { useRef } from "react";
import VerifyAccountSuccess from "@components/Success/VerifyAccountSuccess";


const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [isOpenWaitlistSuccessModal, setIsOpenWaitlistSuccessModal] = useState(false)

  const navigate = useNavigate();
  const [verifyEmail] = useVerifyEmailMutation();


const hasVerified = useRef(false);

useEffect(() => {
  if (hasVerified.current) return;

  const verify = async () => {
    if (!email || !token) return;

    hasVerified.current = true;

    try {
      const res = await verifyEmail({ email, token }).unwrap();

      console.log(res,'the verify email')
      if (res.success) {
        toast.success(res.message || "Email verified successfully!");
        setIsOpenWaitlistSuccessModal(true)
        // setTimeout(() => navigate("/waitlist"), 3000);
      }
    } catch (err: any) {
      const apiError = err?.data?.error || "Verification failed";

      setTimeout(() => navigate("/auth/sign-up/participant"), 3000);
    }
  };

  verify();
}, [email, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p>Please hold. Checking this account.</p>
      <VerifyAccountSuccess open={isOpenWaitlistSuccessModal} to='/waitlist' />
    </div>
  );
};

export default VerifyEmail;
