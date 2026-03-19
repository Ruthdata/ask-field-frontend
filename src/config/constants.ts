export const APP_NAME = "My React App";

export const STORAGE_KEYS = {
  TOKEN: "x-ask-token",
  REFRESH_TOKEN: "refresh-x-ask-token",
};

export const PARTICIPANT_QUESTIONS = [
  {
    step: 1,
    label: "Demographics",
    info: "Some of these details can’t be changed later, so please select carefully.",
    questions: [
      {
        type: "select",
        name: "countryOfResidence",
        label: "Country of Residence",
        placeholder: "-- Select or Search --",
        options: ["USA", "Nigeria"],
        span: 1,
      },
      {
        type: "select",
        name: "countryOfBirth",
        label: "Country of Birth",
        placeholder: "e.g. Doe",
        options: ["USA", "Nigeria"],
        span: 1,
      },
      {
        type: "date",
        name: "dob",
        label: "Date of Birth",
        span: 1,
      },

      {
        type: "select",
        name: "gender",
        label: "Gender",
        options: ["Male", "Female"],
        span: 1,
      },
      {
        type: "select",
        name: "pob",
        label: "Place of Birth",
        options: ["Kano", "Anambra"],
        span: 1,
      },
      {
        type: "select",
        name: "ethnic",
        label: "What ethnic group do you belong to?",
        options: ["Igbo", "Yoruba", "Hausa"],
        span: 1,
      },
      {
        type: "select",
        name: "mostTimeSpent",
        label: "Where did you spend most of your time before turning 18?",
        options: ["Anambra", "Lagos"],
        span: 2,
      },
    ],
  },
  {
    step: 2,
    label: "Languages",
    info: "Some of these details can’t be changed later, so please select carefully.",
    questions: [
      {
        type: "select",
        name: "firstLanguage",
        label: "What is your first language",
        placeholder: "john.doe@example.com",
        options: ["Igbo", "English", "Yoruba", "Hausa"],
        span: 1,
      },
      {
        type: "select",
        name: "fluentLanguage",
        label: "Which of the following languages are you fluent in",
        placeholder: "john.doe@example.com",
        options: ["Igbo", "English", "Yoruba", "Hausa"],
        span: 1,
      },
      {
        type: "select",
        name: "dialect",
        label: "Which variation(s) or regional dialect(s) do you speak fluently, if any?",
        placeholder: "john.doe@example.com",
        options: ["Igbo", "English", "Yoruba", "Hausa"],
        span: 2,
      },
    ],
  },
  {
    step: 3,
    label: "What's your educational background?",
    questions: [
       {
        type: "select",
        name: "educationLevel",
        label: "Which of these is the highest level of education you have completed?",
        placeholder: "john.doe@example.com",
        options: ["BSc", "MSc", "OND", "HND"],
        span: 2,
      },
       {
        type: "select",
        name: "isStudent",
        label: "Are you a student?",
        placeholder: "john.doe@example.com",
        options: ["YES", "NO"],
        span: 2,
      },
    ],
  },
  {
    step: 4,
    label: "What's your professional background?",
    questions: [
       {
        type: "select",
        name: "employmentStatus",
        label: "What is your employment status?",
        placeholder: "john.doe@example.com",
        options: ["Employed", "Self Employed", "Unemployed"],
        span: 2,
      },
    ],
  },
  {
    step: 5,
    label: "Additional questions",
    questions: [
      {
        type: "select",
        name: "workHour",
        label: "How many hours would you be willing to work on AskField on average per week?",
        placeholder: "john.doe@example.com",
        options: ["4h", "8h", "12h"],
        span: 1,
      },
      {
        type: "select",
        name: "mostLifeTime",
        label: "Where did you spend most of your time before turning 18?",
        placeholder: "john.doe@example.com",
        options: ["Anambra", "Lagos", "Benin"],
        span: 1,
      },
      {
        type: "select",
        name: "shareLinkedin",
        label: "Would you like to share your LinkedIn profile?",
        placeholder: "john.doe@example.com",
        options: ["YES", "NO"],
        span: 1,
      },
      {
        type: "select",
        name: "currency",
        label: "Currency",
        placeholder: "john.doe@example.com",
        options: ["$(US)", "#(NGN)"],
        span: 1,
      },
      {
        type: "input",
        name: "payPerHour",
        label: "Pay per hour",
        placeholder: "Enter amount",
        span: 1,
      },
    ],
  },
];
