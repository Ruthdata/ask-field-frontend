import { getUserType, isAuthenticated } from "@/utils/auth";

export const SUPPORT_EMAIL = "hello@joinstudy.io";

export const ROUTES = {
  researcherSignup: "/auth/sign-up/researcher",
  participantSignup: "/participate",
  signIn: "/sign-in",
  foundingLabs: "/founding-labs",
  requestCountry: "/request-a-country",
  aiPilot: "/ai-pilot",
};

/**
 * Researcher sign-up link that remembers which button was clicked and, for the method cards,
 * which method, so the sign-up page can say "Starting with: Interviews".
 */
export const researcherSignup = (source: string, method?: string) =>
  `${ROUTES.researcherSignup}?${new URLSearchParams({ ...(method ? { method } : {}), source }).toString()}`;

/** Where a signed-in user's dashboard is, or null when nobody is signed in. */
export const dashboardPath = () => {
  if (!isAuthenticated()) return null;
  return getUserType() === "researcher" ? "/dashboard/researcher" : "/dashboard/participant";
};
