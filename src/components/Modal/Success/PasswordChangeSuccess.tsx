import { MailIcon } from "@components/icons";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  to: string;
};

const PasswordChangeSuccess = ({ open, to }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-[90%] text-center animate-fadeIn">

        {/* Icon */}
        <div className="w-40 h-40 mx-auto mb-6 bg-[#3E3E3E] p-6 rounded-full">
          <img src='/images/success/success2.svg' className="w-full h-full" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Password Reset Successful
        </h1>

        {/* Description */}
        <p className="text-[13px] text-gray-500 mb-2">
        Your password has been changed and updated successfully.
        </p>

        {/* Actions */}
        <div className="space-y-3">
            <Link to={to}>
          <button
            className="w-full py-3 my-2 bg-gray-200 cursor-pointer text-black rounded-full text-sm hover:bg-gray-300 transition-all"
          >
            Continue to Login
          </button>
            </Link>

          <p className="text-[12px] text-gray-400 mb-2">
        Your password has been changed and updated successfully.
        </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeSuccess;