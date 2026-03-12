import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavbarHome = () => {
  const [open, setOpen] = useState(false);

  return (
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
          <Link to="/auth/sign-up/participant">
            <button className="px-5 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition">
              Start collecting data
            </button>
          </Link>

          <Link to="/auth/sign-up/contributor">
            <button className="px-5 py-2 text-yellow-500 border border-yellow-400 rounded-full hover:bg-yellow-50 transition">
              Contribute and get paid
            </button>
          </Link>

          <Link to="/auth/login">
            <button className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition">
              Login
            </button>
          </Link>
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
          <Link to="/auth/sign-up/participant" onClick={() => setOpen(false)}>
            <button className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition">
              Start collecting data
            </button>
          </Link>

          <Link to="/auth/sign-up/contributor" onClick={() => setOpen(false)}>
            <button className="w-full px-4 py-2 text-yellow-500 border border-yellow-400 rounded-full hover:bg-yellow-50 transition">
              Contribute and get paid
            </button>
          </Link>

          <Link to="/auth/login" onClick={() => setOpen(false)}>
            <button className="w-full px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarHome;