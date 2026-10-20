import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { store } from "@/redux/store";
import { apiSlice } from "@/redux/api/slices/appSlice";

export type AccountType = "researcher" | "participant";

export interface Session {
  accessToken: string;
  refreshToken: string;
  userType: AccountType;
  user: { firstName?: string; isCompleteProfile?: boolean } & Record<string, unknown>;
}

export interface NeedsChoice {
  needsChoice: true;
  choices: AccountType[];
}

export const isChoice = (d: unknown): d is NeedsChoice => Boolean(d && (d as NeedsChoice).needsChoice);

/** Saves the tokens and account type after any successful sign-in. */
export function saveSession(s: Session, remember = true) {
  // A different person may have been signed in on this tab: forget everything cached for them.
  store.dispatch(apiSlice.util.resetApiState());
  storage.set(STORAGE_KEYS.TOKEN, s.accessToken, remember);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, s.refreshToken, remember);
  storage.set(STORAGE_KEYS.USER_TYPE, s.userType, remember);
}

export const dashboardFor = (t: AccountType) => (t === "researcher" ? "/dashboard/researcher" : "/dashboard/participant");

/** Only same-site paths for that account type, so `?next=` can't send people elsewhere. */
export function safeNext(next: string | null, t: AccountType) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return dashboardFor(t);
  // A participant who signs in from a survey's finish link goes back to it.
  if (t === "participant" && /^\/done\/[A-Za-z0-9-]{1,20}$/.test(next)) return next;
  // A researcher who signs in from a team invite goes back to it (Stage 9).
  if (t === "researcher" && /^\/join\/[a-f0-9]{16,64}$/.test(next)) return next;
  return next.startsWith(dashboardFor(t)) ? next : dashboardFor(t);
}

export interface ApiProblem {
  status?: number;
  code?: string;
  message: string;
  data?: Record<string, unknown>;
}

/** Turns an RTK Query error into { status, code, message, data } with a readable message. */
export function readProblem(err: unknown): ApiProblem {
  const e = err as { status?: number | string; data?: { code?: string; message?: unknown; error?: unknown; data?: Record<string, unknown> } };
  const body = e?.data;
  const raw = typeof body?.message === "string" ? body.message : typeof body?.error === "string" ? body.error : "";
  const status = typeof e?.status === "number" ? e.status : undefined;
  const offline = e?.status === "FETCH_ERROR";
  return {
    status,
    code: body?.code,
    data: body?.data,
    message: raw || (offline ? "We couldn't reach joinStudy. Check your connection and try again." : "Something went wrong. Please try again."),
  };
}

export const METHOD_LABELS: Record<string, string> = {
  survey: "Surveys",
  interview: "Interviews",
  "focus-group": "Focus groups",
  "product-test": "Product tests",
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
