import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/config/constants";
import { getUserType, isAuthenticated } from "@/utils/auth";
import AccountTypeModal from "@components/Modal/Home/Modal/AccountTypeModal";
import LoginTypeModal from "@components/Modal/Home/Modal/LoginTypeModal";

const NavbarHome = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "researcher" | "contributor" | null
  >(null);

  const handleStartCollecting = () => {
    setSelectedAction("researcher");
    setIsModalOpen(true);
  };

  const handleContribute = () => {
    if (isAuthenticated()) {
      navigate(
        getUserType() === "researcher"
          ? "/dashboard/researcher"
          : "/dashboard/participant"
      );
      return;
    }

    navigate("/auth/sign-up/participant");
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_TYPE);
    setOpen(false);
    navigate("/");
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
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-50 py-3 px-4 sm:px-6 z-50 shadow-sm rounded-full w-[95%] max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/shared/askfield-logo-icon.png"
              alt="AskField Logo"
              width={36}
              height={36}
              className="mr-2"
            />
            <span className="text-xl sm:text-2xl font-semibold">
              <span className="text-yellow-400">ask</span>
              <span className="text-gray-900">Field</span>
            </span>
          </Link>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/">
              {/* <Link to="/auth/sign-up/researcher"> */}
              <button className="px-5 py-2 cursor-pointer text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition">
                Start collecting data
              </button>
            </Link>
            <button
              onClick={handleContribute}
              className="px-5 cursor-pointer py-2 text-yellow-500 border border-yellow-400 rounded-full hover:bg-yellow-50 transition"
            >
                Contribute and get paid
            </button>
            {/* Login / Logout */}
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="px-4 py-1 cursor-pointer bg-red-600 text-white rounded-full hover:bg-red-500 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleOpenModal}
                className="px-5 cursor-pointer py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-200 transition"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 mt-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 shadow-md">
            <Link to="/" onClick={() => setOpen(false)}>
              {/* <Link to="/auth/sign-up/researcher" onClick={() => setOpen(false)}> */}
              <button className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition">
                Start collecting data
              </button>
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                handleContribute();
              }}
              className="w-full px-4 py-2 text-yellow-500 border border-yellow-400 rounded-full hover:bg-yellow-50 transition"
            >
              Contribute and get paid
            </button>
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="cursor-pointer w-full px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleOpenModal}
                className="px-5 w-full cursor-pointer py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <LoginTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectResearcher={handleSelectResearcher}
        onSelectContributor={handleSelectContributor}
      />
    </>
  );
};

export default NavbarHome;
