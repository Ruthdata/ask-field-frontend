import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { clearAuthStorage, isJwtLikeToken, normalizeAuthToken } from "@/utils/token";

/**
 * Alpha feedback: people are signed out after 20 minutes without activity, for security.
 *
 * - Activity (typing, tapping, clicking, scrolling) in any joinStudy tab counts: the time is kept in localStorage.
 * - While someone is active, the sign-in is renewed every few minutes. The server lets a sign-in last at most
 *   SESSION_IDLE_MINUTES (20) after it was last renewed, so it ends on the server too, not just in this browser.
 * - Background requests (unread counts and so on) don't count as activity and never renew the sign-in.
 */
export const IDLE_MINUTES = Number(import.meta.env.VITE_IDLE_MINUTES ?? 20) || 0;
export const WARN_SECONDS = 60;
const RENEW_EVERY_MS = 4 * 60 * 1000;
const LAST_ACTIVE = "js-last-active";
const LAST_RENEWED = "js-last-renewed";

const read = (k: string) => Number(localStorage.getItem(k) || 0);
export const lastActive = () => read(LAST_ACTIVE);
export const idleMs = () => Date.now() - (lastActive() || Date.now());
export const idleLimitMs = () => IDLE_MINUTES * 60 * 1000;

export function markActive(now = Date.now()) {
  try {
    // Writing on every mouse move would be wasteful: once every 5 seconds is plenty.
    if (now - lastActive() > 5000) localStorage.setItem(LAST_ACTIVE, String(now));
  } catch {
    /* private mode: the timer still runs in this tab */
  }
}

/** A sign-in that starts now counts as activity (and as just renewed). */
export function markSignedIn() {
  const now = String(Date.now());
  try {
    localStorage.setItem(LAST_ACTIVE, now);
    localStorage.setItem(LAST_RENEWED, now);
  } catch {
    /* ignore */
  }
}

let renewing: Promise<boolean> | null = null;

/** Swaps both tokens for new ones. Returns false when the server says the sign-in is over. */
export async function renewSession(): Promise<boolean> {
  if (renewing) return renewing;
  renewing = (async () => {
    const refresh = normalizeAuthToken(storage.get(STORAGE_KEYS.REFRESH_TOKEN));
    if (!refresh || !isJwtLikeToken(refresh)) return false;
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/participants/auth/refresh-token`, { headers: { token: refresh } });
      if (r.status === 401) return false;
      if (!r.ok) return true; // A hiccup (offline, server restart): try again later rather than sign out.
      const body = await r.json();
      const access = normalizeAuthToken(body?.data?.accessToken);
      const next = normalizeAuthToken(body?.data?.refreshToken);
      if (!access || !isJwtLikeToken(access)) return false;
      storage.set(STORAGE_KEYS.TOKEN, access);
      if (next && isJwtLikeToken(next)) storage.set(STORAGE_KEYS.REFRESH_TOKEN, next);
      localStorage.setItem(LAST_RENEWED, String(Date.now()));
      return true;
    } catch {
      return true;
    } finally {
      renewing = null;
    }
  })();
  return renewing;
}

/** Renew while active, at most every few minutes. */
export function renewIfDue() {
  if (!IDLE_MINUTES) return;
  if (Date.now() - read(LAST_RENEWED) < RENEW_EVERY_MS) return;
  if (idleMs() > RENEW_EVERY_MS) return;
  void renewSession();
}

/** Signs out and goes to sign-in with a short explanation, coming back to the same page afterwards. */
export function signOutForIdle(reason: "idle" | "expired" = "idle") {
  const type = storage.get(STORAGE_KEYS.USER_TYPE);
  clearAuthStorage();
  try {
    localStorage.removeItem(LAST_RENEWED);
  } catch {
    /* ignore */
  }
  const here = window.location.pathname + window.location.search;
  // On a public page (the homepage, say) just forget the sign-in; only signed-in pages go to the sign-in page.
  if (!/^\/(dashboard|done|join)\b/.test(window.location.pathname)) {
    window.dispatchEvent(new Event("js-signed-out"));
    return;
  }
  const q = new URLSearchParams({ reason });
  if (type === "researcher" || type === "participant") q.set("intent", type);
  if (here.startsWith("/dashboard") || here.startsWith("/done/")) q.set("next", here);
  window.location.assign(`/sign-in?${q.toString()}`);
}
