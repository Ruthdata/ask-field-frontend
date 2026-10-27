import { formatMoney } from "@/lib/study";
import type { StudyCard, StudyMethod } from "@/redux/api/participantApi";

/** Participant Stage 3: words and formats shared by home, the study list and the study page. */

/** The display face (loaded in index.html). */
export const DISPLAY = { fontFamily: "'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif" } as const;

export const METHOD_LABEL: Record<StudyMethod, string> = {
  survey: "Survey",
  interview: "Interview",
  "focus-group": "Group discussion",
  "product-test": "Product test",
  "ai-evaluation": "AI task",
};
export const DEVICE_LABEL: Record<string, string> = { phone: "Phone", tablet: "Tablet", computer: "Computer" };

export const studyPath = (id: string) => `/dashboard/participant/studies/${id}`;

export function closesLabel(day: string | null) {
  if (!day) return "";
  const d = new Date(`${day}T12:00:00Z`);
  const days = Math.round((d.getTime() - Date.now()) / 864e5);
  if (days <= 6) return `closes ${d.toLocaleDateString("en-GB", { weekday: "short" })}`;
  return `closes ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

export function metaLine(s: StudyCard) {
  const bits = [METHOD_LABEL[s.method] ?? "Study", `${s.minutes} min`, `${formatMoney(s.hourly, s.currency)}/hr`];
  if (s.placesLeft > 0 && s.placesLeft <= 20) bits.push(`${s.placesLeft} ${s.placesLeft === 1 ? "place" : "places"} left`);
  else if (s.closesAt) bits.push(closesLabel(s.closesAt));
  else if (s.placesLeft > 0) bits.push(`${s.placesLeft} places left`);
  return bits.join(" · ");
}

export const startLabel = (s: { books: boolean }) => (s.books ? "Choose a time" : "Start");


/** "45 min", "1 hr 30 min": how long a place is still held (Participant Stage 4). */
export function heldLabel(mins: number) {
  if (mins >= 120) return `${Math.floor(mins / 60)} hr ${mins % 60 ? `${mins % 60} min` : ""}`.trim();
  if (mins >= 60) return `1 hr${mins > 60 ? ` ${mins - 60} min` : ""}`;
  return `${mins} min`;
}

