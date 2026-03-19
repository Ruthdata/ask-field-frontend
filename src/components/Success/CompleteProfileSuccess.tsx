import React from "react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  to: string;
  name?: string
};

const CompleteProfileSuccess = ({ open, to, name }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-[90%] overflow-hidden animate-fadeIn">
        
        {/* TOP GRADIENT SECTION */}
        <div className="bg-linear-to-b from-[#fbc02d] to-white px-8 pt-10 pb-16 text-center">
          <div className="text-5xl mb-1 flex justify-center items-center">
            <img src='/images/success/success.svg' className="h-35" alt="success" />
          </div>

        </div>

        {/* BOTTOM CONTENT SECTION */}
        <div className="px-8 pb-2 -mt-10 text-center">
          <div className="bg-white rounded-xl p-6">
          <h1 className="text-[30px] font-bold text-gray-900">
            Great Job, {name}!
          </h1>
            <p className="text-sm text-gray-600 mb-6 mt-2">
              Your account is now fully set up. You’re set to start participating
              in surveys and earning rewards.
            </p>

            <Link
              to={to}
              className="inline-block w-full py-3.5 bg-[#3E3E3E] text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-all"
            >
              Start your first survey
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompleteProfileSuccess;