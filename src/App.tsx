import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function CompleteSurvey() {
  const { getParticipantFirstName } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-sm rounded-[2rem] p-10 md:p-14 text-center">
        
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-yellow-400 text-white flex items-center justify-center text-4xl mx-auto mb-8">
          ✓
        </div>

        {/* Heading */}
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-5">
          Thank You!
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          Thanks for taking the time to complete the survey,
          <span className="font-semibold text-black">
            {" "}
            {getParticipantFirstName()}
          </span>
          .
          <br />
          Your feedback means a lot to us and helps us improve the experience
          for everyone.
        </p>

        {/* Footer Note */}
        <div className="mt-10 inline-flex items-center px-5 py-3 rounded-full bg-gray-100 text-sm text-gray-600">
          Your response has been recorded successfully.
        </div>
      </div>
    </div>
  );
}