import React from "react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  to: string
};

const VerifyAccountSuccess = ({ open, to }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-12 max-w-md w-[90%] text-center animate-fadeIn">
        
        {/* Emoji */}
        <div className="text-5xl mb-4">🎉</div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re logged in!
        </h1>

        {/* Text */}
        <p className="text-sm text-gray-500 mb-2">
          Welcome to AskField. Your account has been verified successfully.
        </p>

        <p className="text-lg text-gray-400 mb-8">
          You are on the waitlist.
        </p>

        {/* Button */}
        <Link
          to={to}
          className="inline-block w-full py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default VerifyAccountSuccess;