import { Eye, EyeOff, TrendingUp } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  change: string;
  showVisibility?: boolean;
  isVisible?: boolean;
  isDisplayBalance?: boolean;
  onToggleVisibility?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  title,
  value,
  change,
  showVisibility = false,
  isVisible = true,
  isDisplayBalance = false,
  onToggleVisibility,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start mb-4 gap-2">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <span>{icon}</span>
        </div>
        <div className="flex flex-col w-full">
          <div className="gap-3 flex items-center p-2">
            <p className="text-gray-500 text-sm m-0">{title}</p>

            {isDisplayBalance && showVisibility && (
              <button
                onClick={onToggleVisibility}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={isVisible ? "Hide balance" : "Show balance"}
              >
                {isVisible ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          <div className="ps-2">
            <div className="flex items-baseline gap-2">
              {title.includes("Balance") && (
                <span className="text-gray-900 font-semibold text-lg">NGN</span>
              )}
              <h3 className="text-gray-900 font-bold text-3xl">
                {isVisible ? value : "••••"}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-gray-400 text-xs">{change}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
