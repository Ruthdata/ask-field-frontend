import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Frown,
  Loader2,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLazyCheckSurveyEligibilityQuery } from "@/redux/api/slices/userSlice";
import { useGetAllSurveysQuery } from "@/redux/api/surveyApi";
import { Survey, SurveyAction, SurveyListPayload } from "@/types/survey";
import { formatApiError } from "@/utils/helper";

type ModalState = "details" | "unqualified" | "error" | null;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("NGN", "NGN ");

const getSurveyId = (survey: Survey) => survey.surveyId || survey._id || "";
const SURVEY_ACTION_STORAGE_KEY = "askfield_latest_survey_action_id";
const SURVEY_ACTION_BY_SURVEY_KEY = "askfield_survey_action";

const getSurveys = (payload?: SurveyListPayload): Survey[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data || payload.items || payload.results || [];
};

const getSurveyActionId = (surveyAction?: SurveyAction) =>
  surveyAction?.surveyActionId || surveyAction?._id || "";

const storeSurveyAction = (surveyId: string, surveyAction?: SurveyAction) => {
  const surveyActionId = getSurveyActionId(surveyAction);
  if (!surveyActionId) return;

  sessionStorage.setItem(SURVEY_ACTION_STORAGE_KEY, surveyActionId);
  sessionStorage.setItem(
    `${SURVEY_ACTION_BY_SURVEY_KEY}:${surveyId}`,
    surveyActionId,
  );
};

const withParticipantSurveyParams = (
  surveyUrl: string,
  token: string,
  surveyId: string,
) => {
  const url = new URL(surveyUrl, window.location.origin);
  url.searchParams.set("token", token);
  url.searchParams.set("surveyId", surveyId);
  return url.toString();
};

const isApiRouteError = (error: unknown) => {
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" && status >= 500;
};

const isGenericApiFailure = (message: string) =>
  /something went wrong|researcher's only|researchers only|forbidden/i.test(
    message,
  );

const Surveys = () => {
  const { participant } = useCurrentUser();
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedSurveyAction, setSelectedSurveyAction] =
    useState<SurveyAction | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [eligibilityError, setEligibilityError] = useState("");
  const {
    data: surveysResponse,
    isLoading: isLoadingSurveys,
    isError: isSurveyFetchError,
  } = useGetAllSurveysQuery({ status: "published" });
  const [checkEligibility, { isFetching }] =
    useLazyCheckSurveyEligibilityQuery();

  const surveys = getSurveys(surveysResponse?.data);

  const closeModal = () => {
    setModalState(null);
    setSelectedSurveyAction(null);
    setEligibilityError("");
  };

  const handleCheckEligibility = async (survey: Survey) => {
    const surveyId = getSurveyId(survey);
    if (!surveyId) {
      setSelectedSurvey(survey);
      setEligibilityError("This survey is missing an id.");
      setModalState("unqualified");
      return;
    }

    try {
      setSelectedSurvey(survey);
      setEligibilityError("");
      const eligibility = await checkEligibility(surveyId).unwrap();

      if (eligibility.success === false) {
        const message = eligibility.message || "Something went wrong.";
        setEligibilityError(message);
        setModalState(isGenericApiFailure(message) ? "error" : "unqualified");
        return;
      }

      storeSurveyAction(surveyId, eligibility.data);
      setSelectedSurveyAction(eligibility.data);
      setSelectedSurvey(survey);
      setModalState("details");
    } catch (error) {
      const message = formatApiError(error);
      setEligibilityError(message);
      setModalState(
        isApiRouteError(error) || isGenericApiFailure(message)
          ? "error"
          : "unqualified",
      );
    }
  };

  const handleStartSurvey = () => {
    if (!selectedSurvey?.surveyURL) return;

    const surveyId = getSurveyId(selectedSurvey);
    if (!surveyId) {
      setEligibilityError("This survey is missing an id.");
      return;
    }

    const participantToken =
      participant?._id || selectedSurveyAction?.participantId || "";
    const surveyUrl = withParticipantSurveyParams(
      selectedSurvey.surveyURL,
      participantToken,
      surveyId,
    );

    window.location.assign(surveyUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="rounded-2xl bg-[#FBC02D] px-6 py-7 text-gray-950 relative overflow-hidden">
        <div className="absolute right-8 top-2 text-white/25 text-7xl leading-none">
          ✦
        </div>
        <p className="text-[11px] font-semibold uppercase mb-2">Pro tip</p>
        <p className="max-w-4xl text-base md:text-lg font-medium leading-relaxed">
          To earn more from joinStudy paid surveys, stay honest, avoid giving
          fake information. If you don't qualify for one survey, keep trying;
          your genuine participation pays off!
        </p>
      </section>

      <section className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-950">
              Available Surveys
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Check out surveys tailored just for you and start earning rewards.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-gray-800 shadow-sm">
              Sort by: <ChevronDown className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-gray-800 shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {isLoadingSurveys && (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-white py-12 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading surveys...
          </div>
        )}

        {isSurveyFetchError && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-10 text-center text-sm text-red-600">
            Unable to load surveys right now.
          </div>
        )}

        {!isLoadingSurveys && !isSurveyFetchError && surveys.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-10 text-center text-sm text-gray-600">
            No published surveys are available right now.
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {surveys.map((survey) => (
            <button
              key={getSurveyId(survey)}
              onClick={() => handleCheckEligibility(survey)}
              disabled={isFetching}
              className="text-left rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="relative h-36 overflow-hidden rounded-xl bg-gray-900">
                <img
                  src="/images/dashboard/survey.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 left-0 rounded-tr-2xl bg-linear-to-r from-[#FF5BC8] to-[#A403CC] px-4 py-1.5 text-[11px] text-white">
                  Ends in 2 days
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FBC02D33] px-3 py-1">
                <span className="text-sm font-semibold">
                  {formatCurrency(survey.surveyAmount)}
                </span>
                <span className="rounded-full bg-[#3E3E3E] px-2 py-0.5 text-[10px] text-white">
                  {survey.surveyDuration}min
                </span>
              </div>

              <h2 className="mt-3 text-sm font-semibold text-gray-950">
                {survey.surveyName}
              </h2>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
                {survey.surveyDescription}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FBC02D33] px-3 py-1 text-[11px] text-gray-800">
                  <Users className="h-3 w-3" />
                  {survey.numberOfParticipants} Participants
                </span>
                <span className="rounded-full bg-[#FBC02D33] px-3 py-1 text-[11px] capitalize text-gray-800">
                  {survey.surveyLabel}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <img
                  src="/images/dashboard/byUser.png"
                  alt=""
                  className="h-9 w-9 rounded-full"
                />
                <div>
                  <h3 className="text-xs font-medium text-gray-950">
                    By Orji Maxwell
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Avvicv Group of Companies
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-full bg-[#3E3E3E] px-4 py-2 text-center text-xs font-semibold text-white">
                {isFetching ? "Checking..." : "Start"}
              </div>
            </button>
          ))}
        </div>
      </section>

      {modalState && selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[1px]">
          {modalState === "details" && (
            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-700 shadow-sm"
                aria-label="Close survey details"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="h-40 overflow-hidden rounded-t-2xl bg-gray-900">
                <img
                  src="/images/dashboard/survey.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8">
                <h2 className="text-3xl font-bold leading-tight text-gray-950">
                  {selectedSurvey.surveyName}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {selectedSurvey.surveyDescription}
                </p>
                <p className="mt-5 text-sm font-semibold text-gray-950">
                  By Orji Maxwell
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FBC02D33] px-3 py-1 text-xs">
                    {selectedSurvey.numberOfParticipants.toLocaleString()} Slots
                    Available
                  </span>
                  <span className="rounded-full bg-[#FBC02D33] px-3 py-1 text-xs capitalize">
                    {selectedSurvey.surveyLabel}
                  </span>
                  <span className="rounded-full bg-[#FBC02D33] px-3 py-1 text-xs font-semibold">
                    {formatCurrency(selectedSurvey.surveyAmount)}
                  </span>
                  <span className="rounded-full bg-[#3E3E3E] px-3 py-1 text-xs text-white">
                    {selectedSurvey.surveyDuration}min
                  </span>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    This study requires sharing personal data about your
                    responses and general usage. Personal data requested:
                    responses.
                  </p>
                  <p>
                    Researcher's privacy notice: we kindly ask you to send
                    photos of your face. All photos will be used only for
                    training AI models.
                  </p>
                  <div>
                    <p className="font-semibold text-gray-800">Requirements:</p>
                    <p>
                      Age: {selectedSurvey.minimumAge} -{" "}
                      {selectedSurvey.maximumAge}
                    </p>
                    <p>Location: Nigeria</p>
                  </div>
                </div>

                {eligibilityError && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {eligibilityError}
                  </p>
                )}

                <button
                  onClick={handleStartSurvey}
                  className="mt-6 w-full rounded-full bg-[#3E3E3E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Start survey
                </button>
              </div>
            </div>
          )}

          {modalState === "unqualified" && (
            <ResultModal
              title="Oops! You Don't Qualify"
              description={
                eligibilityError ||
                "Thanks for trying! Unfortunately, you didn't qualify this time."
              }
              actionLabel="Find more surveys"
              onAction={closeModal}
              onClose={closeModal}
              icon={
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-[#3E3E3E]">
                  <Frown className="h-32 w-32 fill-[#FBC02D] text-[#3E3E3E]" />
                  <span className="absolute bottom-12 right-6 flex h-14 w-14 items-center justify-center rounded-xl bg-red-600 text-3xl font-bold text-[#FBC02D]">
                    x
                  </span>
                </div>
              }
            />
          )}

          {modalState === "error" && (
            <ResultModal
              title="Unable To Check Eligibility"
              description={
                eligibilityError ||
                "We could not check this survey right now. Please try again."
              }
              actionLabel="Back to surveys"
              onAction={closeModal}
              onClose={closeModal}
              icon={
                <div className="flex h-52 w-52 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle className="h-28 w-28 text-red-600" />
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

type ResultModalProps = {
  title: string;
  description: string;
  actionLabel: string;
  icon: React.ReactNode;
  footer?: string;
  onAction: () => void;
  onClose: () => void;
  isLoading?: boolean;
};

const ResultModal = ({
  title,
  description,
  actionLabel,
  icon,
  footer,
  onAction,
  onClose,
  isLoading = false,
}: ResultModalProps) => (
  <div className="relative w-full max-w-2xl rounded-2xl bg-white px-6 py-8 text-center shadow-2xl md:px-10">
    <button
      onClick={onClose}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white p-2 text-gray-700 shadow-md md:bottom-auto md:left-auto md:right-4 md:top-4 md:translate-x-0"
      aria-label="Close modal"
    >
      <X className="h-4 w-4" />
    </button>
    <div className="relative mx-auto flex justify-center">{icon}</div>
    <h2 className="mt-6 text-3xl font-bold text-gray-950 md:text-4xl">
      {title}
    </h2>
    <p className="mt-3 text-sm text-gray-700">{description}</p>
    <button
      onClick={onAction}
      disabled={isLoading}
      className="mx-auto mt-5 block w-full max-w-md rounded-full bg-[#3E3E3E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Starting survey..." : actionLabel}
    </button>
    {footer && (
      <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-gray-500">
        {footer}
      </p>
    )}
  </div>
);

export default Surveys;
