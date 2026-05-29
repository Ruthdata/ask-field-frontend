import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export type ScreenerOption = {
  id: string;
  label: string;
};

type ScreenerGroup = {
  id: string;
  label: string;
  question: string;
  options: ScreenerOption[];
  searchable?: boolean;
  type?: "checkbox" | "age";
};

type ScreenerCategory = {
  id: string;
  label: string;
  groups: ScreenerGroup[];
};

type Props = {
  isOpen: boolean;
  selectedIds: string[];
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const toOptions = (prefix: string, labels: string[]): ScreenerOption[] =>
  labels.map((label) => ({ id: `${prefix}-${slug(label)}`, label }));

const languageOptions = toOptions("language", [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Basque",
  "Bengali",
  "Belarusian",
  "Burmese",
  "Bulgarian",
  "Catalan",
  "Czech",
  "Chinese",
  "Croatian",
  "Danish",
  "Dutch",
  "English",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Igbo",
  "Italian",
  "Japanese",
  "Korean",
  "Malay",
  "Mandarin",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Xhosa",
  "Yoruba",
]);

const languageGroup = (
  id: string,
  label: string,
  question: string,
): ScreenerGroup => ({
  id,
  label,
  question,
  options: languageOptions.map((option) => ({
    ...option,
    id: `${id}-${option.id}`,
  })),
  searchable: true,
});

const screenerCategories: ScreenerCategory[] = [
  {
    id: "languages",
    label: "Languages",
    groups: [
      languageGroup(
        "first-language",
        "First Language",
        "What is your first language?",
      ),
      {
        id: "english-monolingual",
        label: "English speaking Monolingual",
        question:
          "Are you an English-speaking monolingual, that is, are you fluent only in English? Or are you also fluent in any other language(s)",
        options: toOptions("english-monolingual", [
          "I only know English",
          "I know one other language in addition to English",
          "I know 2 or more languages in addition to English",
          "N/A or Rather not say",
        ]),
      },
      {
        id: "raised-monolingual",
        label: "Were you raised monolingual?",
        question: "Were you raised monolingual?",
        options: toOptions("raised-monolingual", [
          "I was raised with my native language only",
          "I was raised with two or more languages",
        ]),
      },
      {
        id: "bilingual",
        label: "Bilingual",
        question:
          "Apart from your native language, do you speak any other languages fluently?",
        options: toOptions("bilingual", [
          "none just my native language",
          "native language + one other language",
          "native language + two other languages",
          "native language + three or more other languages",
        ]),
      },
      languageGroup(
        "primary-language",
        "Primary Language",
        "Which of the following is your primary spoken language?",
      ),
      languageGroup(
        "earliest-language",
        "Earliest Language in life",
        "What language(s) did you speak earliest in life?",
      ),
      languageGroup(
        "fluent-languages",
        "Fluent Languages",
        "Which of the following languages are you fluent in?",
      ),
      languageGroup(
        "dialect-language",
        "Dialect & regional language variations",
        "Which variation(s) or regional dialect(s) do you speak fluently, if any?",
      ),
    ],
  },
  {
    id: "demographics",
    label: "Demographics",
    groups: [
      {
        id: "age",
        label: "Age",
        question: "What is your first language?",
        type: "age",
        options: [],
      },
      {
        id: "relationship",
        label: "Relationship/marital status",
        question: "What is your relationship / marital status?",
        options: toOptions("relationship", [
          "Single",
          "In a relationship",
          "Engaged",
          "Married",
          "Widowed",
          "Divorced",
          "Separated",
          "Never married",
          "Rather Not Say",
          "In a civil partnership/civil union or similar",
        ]),
      },
      {
        id: "gender",
        label: "Gender",
        question:
          "What gender are you currently? We will ask about your sex later.",
        options: toOptions("gender", [
          "Man (including Trans Male/Trans Man)",
          "Woman (including Trans Female/Trans Woman)",
          "Non-binary (would like to give more detail)",
          "Rather not say",
        ]),
      },
      {
        id: "cis-trans",
        label: "Cisgender & Transgender",
        question:
          "Does your current gender differ from the one you were assigned at birth?",
        options: toOptions("cis-trans", ["Yes", "No", "Rather not say"]),
      },
      {
        id: "lgbtq",
        label: "LGBTQ+",
        question: "Do you identify as LGBTQ+?",
        options: toOptions("lgbtq", ["Yes", "No", "Prefer not to say"]),
      },
      languageGroup(
        "country-residence",
        "Current Country of residence",
        "What is your current country of residence?",
      ),
      languageGroup("nationality", "Nationality", "What is your nationality?"),
      {
        id: "ethnicity",
        label: "Ethnicity",
        question: "What is your ethnicity?",
        options: toOptions("ethnicity", [
          "Asian",
          "Black / African / Caribbean",
          "Hispanic / Latino",
          "Middle Eastern",
          "White",
          "Mixed / Multiple ethnic groups",
          "Other",
          "Prefer not to say",
        ]),
      },
      {
        id: "sex",
        label: "Sex",
        question: "What sex were you assigned at birth?",
        options: toOptions("sex", [
          "Female",
          "Male",
          "Intersex",
          "Rather not say",
        ]),
      },
      {
        id: "sexual-orientation",
        label: "Sexual Orientation",
        question: "What is your sexual orientation?",
        options: toOptions("sexual-orientation", [
          "Straight / Heterosexual",
          "Gay or lesbian",
          "Bisexual",
          "Asexual",
          "Pansexual",
          "Queer",
          "Other",
          "Prefer not to say",
        ]),
      },
      {
        id: "non-binary",
        label: "Gender identity on-binary only",
        question: "Which non-binary gender identity applies to you?",
        options: toOptions("non-binary", [
          "Agender",
          "Genderfluid",
          "Genderqueer",
          "Non-binary",
          "Another identity",
          "Prefer not to say",
        ]),
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    groups: [
      {
        id: "undergraduate-year",
        label: "Undergraduate year of study",
        question: "What is your current undergraduate year of study?",
        options: toOptions("undergraduate-year", [
          "1st Year",
          "2nd Year",
          "3rd Year",
          "4th Year",
          "Other",
          "N/A",
        ]),
      },
      {
        id: "highest-education",
        label: "Highest education level completed",
        question: "What is the highest education level you have completed?",
        options: toOptions("highest-education", [
          "High school",
          "Some college",
          "Bachelor's degree",
          "Master's degree",
          "Doctorate",
          "Other",
        ]),
      },
      languageGroup(
        "degree-subject",
        "Degree subject",
        "What is your degree subject?",
      ),
      {
        id: "degree-completion",
        label: "Year of Highest Degree Completion",
        question: "When did you complete your highest degree?",
        options: toOptions("degree-completion", [
          "Currently studying",
          "2020 or later",
          "2015-2019",
          "2010-2014",
          "Before 2010",
        ]),
      },
      languageGroup(
        "degree-area",
        "Highest Degree Subject Area",
        "What is your highest degree subject area?",
      ),
      languageGroup("subject", "Subject", "Which subject area applies?"),
    ],
  },
  {
    id: "work",
    label: "Work",
    groups: [
      {
        id: "employment-status",
        label: "Employment Status",
        question: "What is your employment status ?",
        options: toOptions("employment-status", [
          "Full-Time",
          "Part-Time",
          "Due to start a new job within the next month",
          "Unemployed (and job seeking)",
          "Not in paid work (e.g. homemaker', retired or disabled)",
          "Other",
        ]),
      },
      {
        id: "job-seeking",
        label: "Job Seeking",
        question: "Are you currently looking for a job?",
        options: toOptions("job-seeking", [
          "Yes",
          "No",
          "Open to opportunities",
        ]),
      },
      languageGroup(
        "organization-type",
        "Organization Type",
        "What type of organization do you work for?",
      ),
      languageGroup(
        "current-job-role",
        "Current Job Role",
        "What is your current job role?",
      ),
      {
        id: "employment-type",
        label: "Employment Type",
        question: "What is your employment type?",
        options: toOptions("employment-type", [
          "Permanent",
          "Contract",
          "Freelance",
          "Internship",
          "Temporary",
        ]),
      },
      {
        id: "years-experience",
        label: "Years of Experience",
        question: "How many years of work experience do you have?",
        options: toOptions("years-experience", [
          "Less than 1 year",
          "1-2 years",
          "3-5 years",
          "6-10 years",
          "10+ years",
        ]),
      },
    ],
  },
];

const ageOptions = Array.from({ length: 83 }, (_, index) => String(index + 18));

const clampIndex = (index: number, length: number) =>
  Math.min(Math.max(index, 0), length - 1);

export default function ScreenerModal({
  isOpen,
  selectedIds,
  onClose,
  onSave,
}: Props) {
  const [activeCategory, setActiveCategory] = useState(
    screenerCategories[0].id,
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [draftSelected, setDraftSelected] = useState(selectedIds);
  const [search, setSearch] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const category =
    screenerCategories.find((item) => item.id === activeCategory) ||
    screenerCategories[0];
  const group =
    category.groups[clampIndex(activeGroupIndex, category.groups.length)];
  const isAgeGroup = group.type === "age";

  const searchValue = search.trim().toLowerCase();
  const filteredOptions =
    searchValue && group.searchable
      ? group.options.filter((option) =>
          option.label.toLowerCase().includes(searchValue),
        )
      : group.options;

  if (!isOpen) return null;

  const toggleOption = (id: string) => {
    setDraftSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const selectVisible = () => {
    const visibleIds = filteredOptions.map((option) => option.id);
    setDraftSelected((current) =>
      Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const applyAge = () => {
    if (!minAge || !maxAge) return;

    setDraftSelected((current) => [
      ...current.filter((id) => !id.startsWith("age-range-")),
      `age-range-${minAge}-${maxAge}`,
    ]);
  };

  const removeAge = () => {
    setMinAge("");
    setMaxAge("");
    setDraftSelected((current) =>
      current.filter((id) => !id.startsWith("age-range-")),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-2 py-4 sm:px-4">
      <div className="relative grid max-h-[92vh] min-h-[74vh] w-full max-w-6xl grid-rows-[auto_auto_1fr_auto] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          aria-label="Close screeners"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-5 pt-6 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-950 sm:text-5xl">
            All Screeners
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            Find the right participants you need
          </p>
        </div>

        <div className="mt-4 flex gap-5 overflow-x-auto border-b border-gray-100 px-5 sm:px-8">
          {screenerCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveCategory(item.id);
                setActiveGroupIndex(0);
                setSearch("");
              }}
              className={`min-w-fit border-b-2 px-4 pb-2 text-sm ${
                activeCategory === item.id
                  ? "border-yellow-400 text-yellow-500"
                  : "border-transparent text-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 overflow-y-auto px-5 py-6 sm:px-8 lg:grid-cols-[370px_1fr] lg:gap-8">
          <div className="flex gap-2 overflow-x-auto lg:block lg:overflow-visible">
            {category.groups.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveGroupIndex(index);
                  setSearch("");
                }}
                className={`min-h-12 shrink-0 border px-4 py-3 text-left text-sm lg:block lg:w-full lg:border-x-0 lg:border-t-0 ${
                  index === activeGroupIndex
                    ? "border-l-2 border-l-yellow-400 border-b-gray-100 bg-yellow-100 font-medium"
                    : "border-gray-100 bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 lg:mt-0">
            <p className="max-w-2xl text-sm leading-relaxed text-gray-900">
              Participants were asked the following question:{" "}
              <span className="font-bold">{group.question}</span>
            </p>

            {isAgeGroup ? (
              <div className="mt-4 max-w-xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Min Age", minAge, setMinAge],
                    ["Max Age", maxAge, setMaxAge],
                  ].map(([label, value, setValue]) => (
                    <label key={label as string} className="block text-sm">
                      <span>
                        {label as string}
                        <span className="text-red-500">*</span>
                      </span>
                      <select
                        value={value as string}
                        onChange={(event) =>
                          (setValue as (value: string) => void)(
                            event.target.value,
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none focus:border-yellow-400"
                      >
                        <option value="">-- Select --</option>
                        {ageOptions.map((age) => (
                          <option key={age} value={age}>
                            {age}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={removeAge}
                    className="rounded-3xl bg-red-100 px-10 py-3 text-sm font-medium text-red-500"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={applyAge}
                    className="rounded-3xl bg-[#3E3E3E] px-10 py-3 text-sm font-medium text-white"
                  >
                    Apply and save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`mt-4 grid gap-3 ${
                    group.searchable ? "sm:grid-cols-[170px_1fr]" : "sm:w-44"
                  }`}
                >
                  <button
                    type="button"
                    onClick={selectVisible}
                    className="rounded bg-yellow-400 px-4 py-3 text-sm font-medium text-white"
                  >
                    Select all {filteredOptions.length}
                    <span className="ml-2 inline-block h-3 w-3 rounded border border-white align-middle" />
                  </button>
                  {group.searchable && (
                    <label className="flex items-center gap-2 rounded bg-gray-50 px-4 py-3 text-sm text-gray-500">
                      <Search className="h-4 w-4" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Type to search languages..."
                        className="w-full bg-transparent outline-none"
                      />
                    </label>
                  )}
                </div>

                <div className="mt-4 grid gap-2">
                  {filteredOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={draftSelected.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-yellow-400"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button
            type="button"
            onClick={() => onSave(draftSelected)}
            className="rounded-3xl bg-[#3E3E3E] px-12 py-3 text-sm font-medium text-white sm:w-96"
          >
            Done
          </button>

          {activeCategory === "languages" && !isAgeGroup && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveGroupIndex((index) =>
                    clampIndex(index - 1, category.groups.length),
                  )
                }
                className="rounded-full bg-gray-100 p-3 text-gray-400"
                aria-label="Previous screener group"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <span
                  key={page}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${
                    page === 1
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {page}
                </span>
              ))}
              <button
                type="button"
                onClick={() =>
                  setActiveGroupIndex((index) =>
                    clampIndex(index + 1, category.groups.length),
                  )
                }
                className="rounded-full bg-yellow-400 p-3 text-white"
                aria-label="Next screener group"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
