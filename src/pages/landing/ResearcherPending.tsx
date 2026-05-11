import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSearchParams } from "react-router-dom";

export default function ResearcherPending() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const { getResearcherFirstName } = useCurrentUser();

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50">
      <div className="w-full max-w-115 flex flex-col items-center text-center px-6 py-12 mt-20">

        {/* Heading */}
        <h1 className="font-serif text-[2rem] font-bold text-gray-900 mb-4">
          Your Dashboard is on the Way 🚧
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          Hi{" "}
          <span className="font-semibold text-gray-900">
            {getResearcherFirstName()}
          </span>
          {email && (
            <span className="text-gray-700"> ({email})</span>
          )}
          ,
        </p>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          You&apos;ll be among the first to know once it&apos;s ready. Thanks for your patience—we&apos;re building something great for you.
        </p>

        {/* Info notice */}
        <div className="mt-4 px-5 py-2.5 bg-gray-100 rounded-full text-xs text-gray-500">
          We’ll notify you via email as soon as your dashboard is live.
        </div>
      </div>
    </div>
  );
}