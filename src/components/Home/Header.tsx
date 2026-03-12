import React, { useState } from "react";
import { Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import AccountTypeModal from "./Modal/AccountTypeModal";
import PartnerHome from "@components/Partner/PartnerHome";
import Design from "./Design";

export default function Header() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"researcher" | "contributor" | null>(null);

  const handleStartCollecting = () => {
    setSelectedAction("researcher");
    setIsModalOpen(true);
  };

  const handleContribute = () => {
    setSelectedAction("contributor");
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
      <div className="flex flex-col items-center justify-center text-center gap-2 mt-30 mb-20">
        <h1 className="text-6xl font-bold">
          High Quality <span className="text-brand-primary">Data,</span>
        </h1>

        <h1 className="text-6xl font-bold">
          Collected in Hours Not Days
        </h1>

        <Text className="text-lg font-normal width-full max-w-xl mt-4 mb-6">
          Unlock reliable data for your research projects with our fast survey
          tools - built for precision, speed and actionable results.
        </Text>

        <div>
          <button
            onClick={handleStartCollecting}
            className="bg-[#3E3E3E] text-white p-3 rounded-3xl w-[243px] cursor-pointer hover:bg-[#2E2E2E] transition-colors"
          >
            Start collecting Data
          </button>

          <button
            onClick={handleContribute}
            className="bg-transparent border border-[#3E3E3E] text-[#3E3E3E] p-3 rounded-3xl ml-4 w-[243px] cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Contribute and get paid
          </button>
        </div>

        <Design />
        <PartnerHome />
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