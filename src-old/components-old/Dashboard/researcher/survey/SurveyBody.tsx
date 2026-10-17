import { MoreVertical } from "lucide-react";
import { Survey } from "@/types/survey";

type SurveyBodyProps = {
  survey: Survey;
};

const statusStyles = {
  published: {
    label: "Live",
    text: "text-green-500",
    bg: "bg-green-100",
    dot: "bg-green-500",
  },
  draft: {
    label: "Draft",
    text: "text-orange-500",
    bg: "bg-orange-100",
    dot: "bg-orange-500",
  },
  closed: {
    label: "Closed",
    text: "text-red-500",
    bg: "bg-red-100",
    dot: "bg-red-500",
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const SurveyBody = ({ survey }: SurveyBodyProps) => {
  const config = statusStyles[survey.status] ?? statusStyles.draft;
  const targetResponses = survey.numberOfParticipants || 0;
  const completedResponses = survey.totalSubmission || 0;
  const completion =
    targetResponses > 0
      ? Math.min(100, Math.round((completedResponses / targetResponses) * 100))
      : 0;
  const totalSpend =
    (survey.numberOfParticipants || 0) * (survey.surveyAmount || 0);

  return (
    <div
      className="flex justify-between border border-gray-100 py-1 px-1 gap-1 hover:bg-gray-100 bg-gray-50 font-light rounded-xl mt-2"
    >
      <span className="text-xs sm:text-sm py-2 px-3 flex-2 border-r border-gray-300 whitespace-nowrap">
        {survey.surveyName || "Untitled Study"}
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        <div
          className={`w-fit py-1 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${config.text} ${config.bg}`}
        >
          <div className={`h-2 w-2 rounded-full ${config.dot}`} />
          {config.label}
        </div>
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        {completedResponses} / {targetResponses}
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-1 border-r border-gray-300 whitespace-nowrap">
        {completion}%
      </span>

      <span className="text-xs sm:text-sm py-2 px-3 flex-[1.8] flex items-center justify-between whitespace-nowrap">
        <span className="text-[11px] sm:text-xs">
          {formatCurrency(totalSpend)}
        </span>
        <MoreVertical size={16} className="cursor-pointer" />
      </span>
    </div>
  );
};

export default SurveyBody;
