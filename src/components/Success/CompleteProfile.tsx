import React from 'react'
import { Link } from 'react-router-dom';

const CompleteProfile = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg px-10 py-12 max-w-md w-full text-center">
            {/* Celebration Emoji */}
            <div className="text-5xl mb-4">🎉</div>
    
            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              You&apos;re logged in!
            </h1>
    
            {/* Description */}
            <p className="text-sm text-gray-500 mb-2">
              Welcome to AskField. Your account has been verified successfully.
            </p>
            <p className="text-xl text-gray-400 mb-8">
              You are on the waitlist.
            </p>
    
            {/* Go Home Button */}
            <Link
              to="/"
              className="inline-block w-full py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
}

export default CompleteProfile