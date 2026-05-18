import React, { useState } from "react";
import { Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import AccountTypeModal from "./Modal/AccountTypeModal";
import PartnerHome from "@components/Partner/PartnerHome";
import Design from "./Design";

import meshBg from "/images/home/background-gradient.png";

export default function Header() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartCollecting = () => {
    setIsModalOpen(true);
  };

  const handleContribute = () => {
    setIsModalOpen(true);
  };

  const handleSelectResearcher = () => {
    setIsModalOpen(false);
    navigate("/auth/sign-up/participant");
  };

  const handleSelectContributor = () => {
    setIsModalOpen(false);
    navigate("/auth/sign-up/contributor");
  };

  return (
    <>
      <div className="relative w-full overflow-hidden">
        {/* Warm gradient base — longer fade to white */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 100% 70% at 50% -10%, #f0c93a 0%, #f9e68a 25%, #fef9d7 55%, #ffffff 85%)",
          }}
        />

        {/* Dot grid — left side */}
        <svg
          className="absolute left-0 top-0 -z-10 h-full w-48 opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots-left"
              x="0"
              y="0"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.2" fill="#c9a84c" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-left)" />
        </svg>

        {/* Dot grid — right side */}
        <svg
          className="absolute right-0 top-0 -z-10 h-full w-48 opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots-right"
              x="0"
              y="0"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.2" fill="#c9a84c" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-right)" />
        </svg>

        {/* Mesh shape — positioned in hero area only */}
        <img
          src={meshBg}
          alt=""
          aria-hidden="true"
          className="absolute -z-10 pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            width: "70%",
            maxWidth: "750px",
            opacity: 0.55,
            filter:
              "sepia(1) saturate(2) hue-rotate(5deg) brightness(1.3) contrast(0.8)",
            mixBlendMode: "darken",
          }}
        />
        <div className="flex flex-col items-center justify-center text-center gap-2 pt-24 pb-20 px-4">
          {/* "Fast Survey Insights" badge */}
          <div className="flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-4 py-1.5 mb-4 shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              Fast Survey Insights
            </span>
            <span className="bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              ↗
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-4xl font-bold leading-tight">
            Recruit verified participants for research, product testing, and AI
            data studies.
          </h1>

          <Text className="text-base font-normal max-w-lg mt-4 mb-6 text-gray-600">
            Find, screen, and manage qualified participants globally with clear
            eligibility, consent, compensation, and study details built into the
            workflow.
          </Text>

          <div className="flex gap-4">
            <button
              onClick={handleStartCollecting}
              className="bg-[#3E3E3E] text-white px-8 py-3 rounded-3xl cursor-pointer hover:bg-[#2E2E2E] transition-colors font-medium"
            >
              Find Participant
            </button>

            <button
              onClick={handleContribute}
              className="bg-transparent border border-[#3E3E3E] text-[#3E3E3E] px-8 py-3 rounded-3xl cursor-pointer hover:bg-white/60 transition-colors font-medium"
            >
              Join Paid Studies
            </button>
          </div>

          <Design />
          <PartnerHome />
        </div>
      </div>

      <AccountTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectResearcher={handleSelectResearcher}
        onSelectContributor={handleSelectContributor}
      />
    </>
  );
}
