import { getUserType, isAuthenticated } from "@/utils/auth";

export const SUPPORT_EMAIL = "hello@joinstudy.io";

export const ROUTES = {
  researcherSignup: "/auth/sign-up/researcher",
  participantSignup: "/auth/sign-up/participant",
  signIn: "/sign-in",
  foundingLabs: "/founding-labs",
  requestCountry: "/request-a-country",
  aiPilot: "/ai-pilot",
};

/** Where a signed-in user's dashboard is, or null when nobody is signed in. */
export const dashboardPath = () => {
  if (!isAuthenticated()) return null;
  return getUserType() === "researcher" ? "/dashboard/researcher" : "/dashboard/participant";
};
