type ProjectStatusTab = "live" | "drafts" | "closed";

type Props = {
  activeTab: ProjectStatusTab;
  setActiveTab: (value: ProjectStatusTab) => void;
};

const ProjectSelectTab = ({ activeTab, setActiveTab }: Props) => {

  const tabs = [
    { key: "live", label: "Live Surveys" },
    { key: "drafts", label: "Drafts" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div>
      {/* Tabs header */}
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ProjectStatusTab)}
            className={`relative pb-1 pt-6 text-sm sm:text-base px-5 cursor-pointer mb-5 font-medium transition
              ${
                activeTab === tab.key
                  ? "text-yellow-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}

            {/* Yellow underline */}
            {activeTab === tab.key && (
              <span className="absolute left-0 bottom-0 h-0.5 w-full bg-yellow-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectSelectTab;
