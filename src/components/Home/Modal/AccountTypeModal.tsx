import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom"; // Using react-router-dom for navigation

interface AccountTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResearcher: () => void;
  onSelectContributor: () => void;
}

export default function AccountTypeModal({
  isOpen,
  onClose,
  onSelectResearcher,
  onSelectContributor,
}: AccountTypeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Pattern - Orange hexagonal pattern */}
        <div className="relative h-72 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 overflow-hidden">
          {/* Hexagonal Pattern Overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hexagons"
                x="0"
                y="0"
                width="80"
                height="69.28"
                patternUnits="userSpaceOnUse"
              >
                {/* Large hexagon */}
                <path
                  d="M40 0 L60 11.547 L60 34.641 L40 46.188 L20 34.641 L20 11.547 Z"
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="3"
                />
                {/* Medium hexagon */}
                <path
                  d="M40 10 L52 17.32 L52 31.96 L40 39.28 L28 31.96 L28 17.32 Z"
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="2.5"
                />
                {/* Small hexagon */}
                <path
                  d="M40 17 L46 21.155 L46 29.445 L40 33.6 L34 29.445 L34 21.155 Z"
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>

          {/* Additional decorative shapes */}
          <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="absolute bottom-8 right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/5" />
        </div>

        {/* Content Card */}
        <div className="relative bg-white rounded-t-3xl -mt-8 px-8 py-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Select Your
            <br />
            Account Type
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Sign in as a Researcher to collect data, or as a Contributor to
            provide survey responses.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <div>
              <Link to="/auth/sign-up/participant">
                <button
                  onClick={onSelectResearcher}
                  className="w-full py-4 px-6 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Sign Up as a Participant
                </button>
              </Link>
            </div>
            <div>
              <Link to="/auth/sign-up/contributor">
                <button
                  onClick={onSelectContributor}
                  className="w-full py-4 px-6 bg-white text-gray-900 rounded-2xl font-semibold text-base border-2 border-gray-900 hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Sign Up as a Contributor
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}