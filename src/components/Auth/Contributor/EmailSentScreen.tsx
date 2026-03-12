import { MailIcon } from "@components/icons";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";



export default function EmailSentScreen() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams()

  const email = searchParams.get("email");

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      } else {
        setError(data.message || "Failed to resend. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-115 flex flex-col items-center text-center px-6 py-12">
      {/* Mail icon */}
      <div className="w-40 h-40 mb-8">
        <MailIcon />
      </div>

      {/* Heading */}
      <h1 className="font-serif text-[2rem] font-bold text-gray-900 mb-4">
        Verify your Email
      </h1>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-2">
        We&apos;ve sent a verification email to{" "}
        <span className="font-semibold text-gray-800">{email}</span>.
        <br />
        Open the email and click the &quot;Join AskField&quot; link to finish signing up.
      </p>

      {/* Spam notice pill */}
      <div className="mt-4 px-5 py-2.5 bg-gray-100 rounded-full text-xs text-gray-500">
        Check your spam or promotions folder if not found on Email inbox.
      </div>

      {/* Resent success message */}
      {resent && (
        <p className="mt-4 text-xs text-green-600 font-medium">
          ✓ Verification email resent! Check your inbox.
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-4 text-xs text-red-500">{error}</p>
      )}

      {/* Resend / Change email links */}
      <p className="mt-4 text-xs text-gray-400">
        Didn&apos;t receive any verification email?{" "}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-amber-500 font-medium hover:underline disabled:opacity-50 cursor-pointer"
        >
          {resending ? "Sending..." : "Resend Email"}
        </button>
        {/* {onChangeEmail && (
          <>
            {" "}or{" "}
            <button
              onClick={onChangeEmail}
              className="text-amber-500 font-medium hover:underline cursor-pointer"
            >
              Change Email Address
            </button>
          </>
        )} */}
      </p>
    </div>
  );
}