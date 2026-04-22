import ProjectSelectTab from "@components/Dashboard/researcher/tabs/ProjectSelectTab";
import { useGetProjectByIdQuery } from "@/redux/api/projectApi";
import { useGetSurveysByProjectQuery } from "@/redux/api/surveyApi";
import { Survey } from "@/types/survey";
import { MoreVertical, Plus, SquarePen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

type SurveyListPayload =
  | Survey[]
  | {
      data?: Survey[];
      items?: Survey[];
      results?: Survey[];
    };

const getSurveys = (payload: SurveyListPayload | undefined) => {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const statusConfig = {
  published: "bg-green-100 text-green-700",
  draft: "bg-orange-100 text-orange-700",
  closed: "bg-red-100 text-red-700",
};

const getSurveyIdentifier = (survey: Survey) => survey.surveyId || survey._id || "";

const SurveyRowMenu = ({
  survey,
  projectId,
}: {
  survey: Survey;
  projectId: string;
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const surveyId = getSurveyIdentifier(survey);
  const isDraft = survey.status === "draft";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditDraft = () => {
    setOpen(false);

    if (!surveyId) {
      toast.error("This survey is missing an id, so it can't be edited yet.");
      return;
    }

    if (!isDraft) {
      toast("Only draft surveys can be updated from this menu for now.");
      return;
    }

    navigate(
      `/dashboard/researcher/projects/${projectId}/create-survey?surveyId=${surveyId}`
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50"
        aria-label={`Open actions for ${survey.surveyName || "survey"}`}
      >
        <MoreVertical size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          <button
            type="button"
            onClick={handleEditDraft}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
              isDraft
                ? "text-gray-700 hover:bg-gray-50 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <SquarePen size={16} />
            {isDraft ? "Update draft survey" : "Draft surveys are editable"}
          </button>
        </div>
      )}
    </div>
  );
};

const Project = () => {
  const { id = "" } = useParams();
  const [activeTab, setActiveTab] = useState<"live" | "drafts" | "closed">(
    "live"
  );

  const { data, isLoading, isError } = useGetProjectByIdQuery(id, {
    skip: !id,
  });

  const surveyStatus =
    activeTab === "live" ? "published" : activeTab === "drafts" ? "draft" : "closed";

  const {
    data: surveysData,
    isLoading: isLoadingSurveys,
    isError: isSurveyError,
  } = useGetSurveysByProjectQuery(
    { projectId: id, status: surveyStatus },
    { skip: !id }
  );

  const project = data?.data;
  const surveys = getSurveys(surveysData?.data as SurveyListPayload | undefined);

  return (
    <div className="bg-gray-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="mb-3 text-sm text-gray-600">
        <Link to="/dashboard/researcher/projects" className="hover:underline">
          My Projects
        </Link>
        {" / "}
        <span className="text-yellow-500">{project?.title || "Project"}</span>
      </div>

      <div className="max-w-7xl mx-auto shadow-lg px-4 sm:px-6 py-5 bg-white rounded-[28px]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg sm:text-xl">
              {isLoading ? "Loading project..." : project?.title || "Project"}
            </h3>
            {!isLoading && project && (
              <p className="text-sm text-gray-600">
                Participant view: {project.participantView}
              </p>
            )}
          </div>

          <Link
            to={`/dashboard/researcher/projects/${id}/create-survey`}
            className="w-full sm:w-auto bg-[#3E3E3E] flex items-center justify-center gap-2 py-2.5 px-6 rounded-3xl text-white text-sm cursor-pointer"
          >
            <Plus size={16} />
            New survey
          </Link>
        </div>

        <ProjectSelectTab activeTab={activeTab} setActiveTab={setActiveTab} />

        {isLoading && (
          <p className="text-sm text-gray-500 py-6">Loading project details...</p>
        )}

        {isError && (
          <p className="text-sm text-red-500 py-6">
            We couldn&apos;t load this project right now.
          </p>
        )}

        {!isLoading && !isError && project && (
          <div className="mt-2 rounded-[28px] border border-[#EFE8DD] bg-[#FCFBF8] p-4 sm:p-5">
            <div className="mt-1">
              {isLoadingSurveys ? (
                <p className="text-sm text-gray-500 mt-4">Loading surveys...</p>
              ) : isSurveyError ? (
                <p className="text-sm text-red-500 mt-4">
                  We couldn&apos;t load surveys for this project.
                </p>
              ) : surveys.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white">
                  <p className="text-sm text-gray-500">
                    No {surveyStatus} surveys yet for this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveys.map((survey) => {
                    const spend =
                      (survey.numberOfParticipants || 0) * (survey.surveyAmount || 0);

                    return (
                      <div
                        key={getSurveyIdentifier(survey)}
                        className="rounded-2xl border border-[#EAE4D8] bg-white px-4 py-4"
                      >
                        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {survey.surveyName || "Untitled Study"}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                statusConfig[survey.status]
                              }`}
                            >
                              {survey.status}
                            </span>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="text-xs uppercase tracking-wide text-gray-400 sm:hidden">
                              Responses
                            </p>
                            <p>0 / {survey.numberOfParticipants || 0}</p>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="text-xs uppercase tracking-wide text-gray-400 sm:hidden">
                              Duration
                            </p>
                            <p>{survey.surveyDuration || 0} min</p>
                          </div>

                          <div className="text-sm text-gray-700">
                            <p className="text-xs uppercase tracking-wide text-gray-400 sm:hidden">
                              Total Spend
                            </p>
                            <p>${spend.toLocaleString()} USD</p>
                          </div>

                          <div className="flex justify-end">
                            <SurveyRowMenu survey={survey} projectId={id} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
