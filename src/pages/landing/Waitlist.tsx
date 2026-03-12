import { MailIcon } from "@components/icons";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Waitlist() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const referralLink = `https://yourapp.com/join?ref=${email}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50">
      {/* Add margin top to push content down */}
      <div className="w-full max-w-115 flex flex-col items-center text-center px-6 py-12 mt-20">
        
        {/* Waitlist icon */}
        <div className="w-40 h-40 mb-8">
          <MailIcon />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-[2rem] font-bold text-gray-900 mb-4">
          You&apos;re on the Waitlist!
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          Thanks for signing up,{" "}
          <span className="font-semibold text-gray-800">{email}</span>!
          <br />
          We&apos;ll notify you as soon as your spot is available.
        </p>

        {/* Optional spam/folder notice */}
        <div className="mt-6 px-5 py-2.5 bg-gray-100 rounded-full text-xs text-gray-500">
          Check your inbox or spam folder for updates.
        </div>
      </div>
    </div>
  );
}