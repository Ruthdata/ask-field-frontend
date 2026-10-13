import { useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useApproveSurveyActionMutation,
  useListSurveyActionsQuery,
  useRejectSurveyActionMutation,
} from "@/redux/api/researcherApi";
import { SurveyAction, SurveyActionStatus } from "@/types/survey";
import { formatApiError } from "@/utils/helper";

const getSurveyActionId = (action: SurveyAction) =>
  action.surveyActionId || action._id || "";

const statusStyles: Record<SurveyActionStatus, string> = {
  "in-progress": "bg-blue-50 text-blue-700 ring-blue-100",
  submitted: "bg-amber-50 text-amber-700 ring-amber-100",
  approved: "bg-green-50 text-green-700 ring-green-100",
  rejected: "bg-red-50 text-red-700 ring-red-100",
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

export default function SurveyActions() {
  const [query, setQuery] = useState("");
  const [activeActionId, setActiveActionId] = useState("");
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useListSurveyActionsQuery();
  const [approveSurveyAction] = useApproveSurveyActionMutation();
  const [rejectSurveyAction] = useRejectSurveyActionMutation();

  const surveyActions = data?.data || [];
  const filteredActions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return surveyActions;

    return surveyActions.filter((action) => {
      const actionId = getSurveyActionId(action).toLowerCase();
      return (
        actionId.includes(value) ||
        action.surveyId?.toLowerCase().includes(value) ||
        action.participantId?.toLowerCase().includes(value) ||
        action.status?.toLowerCase().includes(value)
      );
    });
  }, [query, surveyActions]);

  const handleAction = async (
    action: SurveyAction,
    type: "approve" | "reject",
  ) => {
    const surveyActionId = getSurveyActionId(action);
    if (!surveyActionId) {
      toast.error("This survey action is missing an id.");
      return;
    }

    try {
      setActiveActionId(surveyActionId);
      const mutation =
        type === "approve" ? approveSurveyAction : rejectSurveyAction;
      const response = await mutation(surveyActionId).unwrap();
      toast.success(
        response.message ||
          `Survey action ${type === "approve" ? "approved" : "rejected"}.`,
      );
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setActiveActionId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="rounded-2xl bg-white px-6 py-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-950">
              Survey Actions
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review submitted participant actions and decide whether to approve
              or reject them.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actions"
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white sm:w-72"
              />
            </label>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading survey actions...
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <CircleAlert className="h-10 w-10 text-red-600" />
            <h2 className="mt-3 text-base font-semibold text-gray-950">
              Unable to load survey actions
            </h2>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredActions.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Clock3 className="h-10 w-10 text-gray-400" />
            <h2 className="mt-3 text-base font-semibold text-gray-950">
              No survey actions found
            </h2>
            <p className="mt-1 max-w-sm text-sm text-gray-600">
              Submitted participant actions will appear here when they are ready
              for review.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredActions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-5 py-4 font-semibold">Action</th>
                  <th className="px-5 py-4 font-semibold">Survey</th>
                  <th className="px-5 py-4 font-semibold">Participant</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Started</th>
                  <th className="px-5 py-4 font-semibold">Submitted</th>
                  <th className="px-5 py-4 font-semibold">Time</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Decision
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActions.map((action) => {
                  const surveyActionId = getSurveyActionId(action);
                  const isFinal =
                    action.status === "approved" || action.status === "rejected";
                  const isMutating = activeActionId === surveyActionId;

                  return (
                    <tr key={surveyActionId} className="align-middle">
                      <td className="px-5 py-4 font-medium text-gray-950">
                        <span className="block max-w-[140px] truncate">
                          {surveyActionId || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        <span className="block max-w-[140px] truncate">
                          {action.surveyId}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        <span className="block max-w-[140px] truncate">
                          {action.participantId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${
                            statusStyles[action.status] ||
                            "bg-gray-50 text-gray-700 ring-gray-100"
                          }`}
                        >
                          {action.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatDateTime(action.startedAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatDateTime(action.submittedAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatDuration(action.timeSpent)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(action, "approve")}
                            disabled={isFinal || isMutating}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-green-600 px-3 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                          >
                            {isMutating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(action, "reject")}
                            disabled={isFinal || isMutating}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                          >
                            {isMutating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
