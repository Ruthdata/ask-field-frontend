import React from "react";

type Props = {
  open: boolean;
};

const WelcomeResearcher = ({ open }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-12 max-w-md w-[90%] text-center animate-fadeIn">
        {/* Emoji */}
        <div className="text-5xl mb-4">🎉</div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Welcome to joinStudy!
        </h1>

        {/* Text */}
        <p className="text-lg text-gray-500 mb-4">
          You can now start creating surveys on the platform.
        </p>

        {/* Button */}
        <button className="inline-block w-full cursor-pointer py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-all">
          We sent you a link
        </button>
      </div>
    </div>
  );
};

export default WelcomeResearcher;
