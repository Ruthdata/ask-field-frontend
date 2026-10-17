import React from "react";

type Props = {
  open: boolean;
  onClose: () => void; // 1. Ensure this is defined
};

const WelcomeResearcher = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* 2. Clicking the background overlay triggers onClose */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-[2rem] shadow-xl px-8 py-12 md:px-10 max-w-md w-full text-center animate-fadeIn z-10">
        
        {/* 3. Clicking the top-right X triggers onClose */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-5xl mb-4 select-none">🎉</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Welcome to joinStudy!
        </h1>

        <p className="text-base text-gray-500 mb-6">
          You can now start creating surveys on the platform.
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button className="inline-block w-full cursor-pointer py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all">
            We sent you a link
          </button>

          {/* 4. Clicking the Cancel button triggers onClose */}
          <button 
            onClick={onClose}
            className="inline-block w-full cursor-pointer py-3.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeResearcher;
