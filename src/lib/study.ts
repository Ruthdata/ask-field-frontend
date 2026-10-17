import type { HomeStudy, NeedsYou, StudyMethod } from "@/redux/api/homeApi";

/** The five things a researcher can run, with what they'll set up for each. */
export const METHODS: { id: StudyMethod; label: string; word: string; note: string; estimateNote: string; minStep: number; minutes: number; people: number }[] = [
  {
    id: "survey", label: "Survey", word: "survey", minStep: 5, minutes: 15, people: 100,
    note: "Link your Qualtrics, Google Forms or other survey",
    estimateNote: "Your survey stays where it is (Qualtrics, Google Forms and others). We send people to it and check they finished.",
  },
  {
    id: "interview", label: "Interviews", word: "interviews", minStep: 15, minutes: 45, people: 12,
    note: "Offer time slots; we book people and send reminders",
    estimateNote: "Includes booking and reminders. You run the call on your own video tool.",
  },
  {
    id: "focus-group", label: "Focus group", word: "focus group", minStep: 15, minutes: 60, people: 18,
    note: "Pick session times and how many per group",
    estimateNote: "Everyone in a group is booked into the same session. People who don't take part aren't charged.",
  },
  {
    id: "product-test", label: "Product test", word: "product test", minStep: 5, minutes: 20, people: 20,
    note: "Share an app or prototype and set tasks",
    estimateNote: "Participants use your app or prototype and record what they do. You set the tasks when you plan it.",
  },
  {
    id: "ai-evaluation", label: "AI evaluation", word: "AI evaluation", minStep: 15, minutes: 60, people: 20,
    note: "Native speakers rate, rank and correct model outputs",
    estimateNote: "Native speakers rate, rank or correct model outputs. Count each person's working time, not the number of items.",
  },
];

export const methodById = (id?: string) => METHODS.find((m) => m.id === id);

/** Where participants can be recruited today. Keep in step with the homepage wallets. */
export const PARTICIPANT_COUNTRIES = [
  { name: "Nigeria", open: true },
  { name: "Ghana", open: false },
  { name: "Kenya", open: false },
];

/** Drafts open in the planner (Stage 4) or their launch status (Stage 5); live and closed studies open the study page (Stage 6). */
export const studyLink = (s: Pick<HomeStudy, "projectId" | "surveyId" | "status"> & { stage?: HomeStudy["stage"] }) =>
  s.status !== "draft"
    ? `/dashboard/researcher/studies/${s.surveyId}`
    : s.stage && s.stage !== "none"
      ? `/dashboard/researcher/studies/${s.surveyId}/launch/status`
      : `/dashboard/researcher/studies/${s.surveyId}/plan/basics`;

export const needsYouLink = (n: NeedsYou) =>
  n.kind === "review"
    ? `/dashboard/researcher/studies/${n.surveyId}?tab=review`
    : n.kind === "changes"
      ? `/dashboard/researcher/studies/${n.surveyId}/launch/status`
      : studyLink({ ...n, status: "draft" });

export function estimateCost(people: number, minutes: number, ratePerHour: number, feeRate: number) {
  const perPerson = Math.round(((ratePerHour * minutes) / 60) * 100) / 100;
  const pay = perPerson * people;
  const fee = Math.round(pay * feeRate * 100) / 100;
  return { perPerson, pay, fee, total: pay + fee };
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export const percent = (rate: number) => `${Math.round(rate * 100)}%`;

/** Starting pay per hour and step size for the estimate, by the currency the server charges in. */
export function rateDefaults(currency = "USD") {
  const table: Record<string, { rate: number; step: number }> = {
    NGN: { rate: 5000, step: 500 },
    GHS: { rate: 60, step: 5 },
    KES: { rate: 600, step: 50 },
  };
  return table[currency] ?? { rate: 12, step: 1 };
}
