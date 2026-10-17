import type { PlanStep } from "@/redux/api/planApi";

/** URL slugs for the four steps, in order. */
export const SLUGS = ["basics", "who", "setup", "pay"] as const;
export type Slug = (typeof SLUGS)[number];
export const STEP_OF: Record<Slug, PlanStep> = { basics: "basics", who: "audience", setup: "setup", pay: "pay" };
export const SETUP_NAME: Record<string, string> = {
  survey: "Survey link",
  interview: "Interview times",
  "focus-group": "Group sessions",
  "product-test": "Test and tasks",
  "ai-evaluation": "Task setup",
};
export const stepName = (slug: Slug, method: string) =>
  slug === "basics" ? "Basics" : slug === "who" ? "Who you need" : slug === "setup" ? SETUP_NAME[method] : "Pay and timing";
export const planPath = (id: string, slug: Slug) => `/dashboard/researcher/studies/${id}/plan/${slug}`;
export const launchPath = (id: string, page: "" | "pay" | "status" = "") => `/dashboard/researcher/studies/${id}/launch${page ? `/${page}` : ""}`;
