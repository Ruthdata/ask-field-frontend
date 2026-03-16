import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50">
      <div className="w-full max-w-115 flex flex-col items-center text-center px-6 py-12 mt-20">
        
        {/* Icon */}
        <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-full bg-gray-100">
          <SearchX className="w-12 h-12 text-gray-500" />
        </div>

        {/* 404 */}
        <p className="text-sm text-gray-400 mb-2 tracking-widest">ERROR 404</p>

        {/* Heading */}
        <h1 className="font-serif text-[2rem] font-bold text-gray-900 mb-4">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist or may have been
          moved. Let’s get you back on track.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition"
          >
            Go Home
          </Link>

          {/* <Link
            to="/waitlist"
            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition"
          >
            Join Waitlist
          </Link> */}
        </div>

        {/* Footer note */}
        <div className="mt-8 px-5 py-2.5 bg-gray-100 rounded-full text-xs text-gray-500">
          If you think this is a mistake, contact support.
        </div>
      </div>
    </div>
  );
}