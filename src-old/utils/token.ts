import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "./storage";

const EMPTY_TOKEN_VALUES = new Set(["", "undefined", "null"]);

export const normalizeAuthToken = (token?: string | null) => {
  if (!token) return null;

  const normalized = token.trim().replace(/^Bearer\s+/i, "");
  return EMPTY_TOKEN_VALUES.has(normalized.toLowerCase()) ? null : normalized;
};

export const isJwtLikeToken = (token?: string | null) => {
  const normalized = normalizeAuthToken(token);
  return (
    !!normalized && normalized.split(".").length === 3 && !/\s/.test(normalized)
  );
};

export const clearAuthStorage = () => {
  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  storage.remove(STORAGE_KEYS.USER_TYPE);
  storage.remove(STORAGE_KEYS.WORKSPACE);
};

/** Headers for API calls made with fetch (file downloads): the sign-in token and, in a team, the workspace (Stage 9). */
export const apiHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { authorization: `Bearer ${normalizeAuthToken(storage.get(STORAGE_KEYS.TOKEN)) ?? ""}` };
  const ws = storage.get(STORAGE_KEYS.WORKSPACE);
  if (ws && storage.get(STORAGE_KEYS.USER_TYPE) === "researcher") h["x-workspace"] = String(ws);
  return h;
};
