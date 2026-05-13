import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useVerifySurveyActionMutation } from "@/redux/api/slices/userSlice";
import { formatApiError } from "@/utils/helper";

const SURVEY_ACTION_STORAGE_KEY = "askfield_latest_survey_action_id";
const SURVEY_ACTION_BY_SURVEY_KEY = "askfield_survey_action";

export default function SurveyThankYouPage() {
  const { getParticipantFirstName } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const [verifySurveyAction] = useVerifySurveyActionMutation();
  const [submissionMessage, setSubmissionMessage] = useState(
    "Your response has been recorded successfully.",
  );
  const hasVerifiedSurveyAction = useRef(false);

  useEffect(() => {
    const surveyId = searchParams.get("surveyId");
    const token = searchParams.get("token");
    const responseId = searchParams.get("responseId");
    const surveyActionId =
      searchParams.get("surveyActionId") ||
      (surveyId
        ? sessionStorage.getItem(`${SURVEY_ACTION_BY_SURVEY_KEY}:${surveyId}`)
        : null) ||
      sessionStorage.getItem(SURVEY_ACTION_STORAGE_KEY);

    if (hasVerifiedSurveyAction.current) return;

    if (!surveyActionId) {
      if (surveyId || token || responseId) {
        setSubmissionMessage(
          "Your response was received, but we could not find the survey action to submit for review.",
        );
      }
      return;
    }

    hasVerifiedSurveyAction.current = true;

    verifySurveyAction(surveyActionId)
      .unwrap()
      .then((response) => {
        sessionStorage.removeItem(SURVEY_ACTION_STORAGE_KEY);
        if (surveyId) {
          sessionStorage.removeItem(`${SURVEY_ACTION_BY_SURVEY_KEY}:${surveyId}`);
        }
        setSubmissionMessage(
          response.message || "Your survey has been submitted for review.",
        );
      })
      .catch((error) => {
        setSubmissionMessage(formatApiError(error));
      });
  }, [searchParams, verifySurveyAction]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-sm rounded-[2rem] p-10 md:p-14 text-center">
        
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-4xl mx-auto mb-8">
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
          {submissionMessage}
        </div>
      </div>
    </div>
  );
}
