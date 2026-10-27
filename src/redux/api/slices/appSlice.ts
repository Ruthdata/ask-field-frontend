import { STORAGE_KEYS } from "@/config/constants";
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { storage } from "@/utils/storage";
import { IDLE_MINUTES, idleLimitMs, idleMs, renewSession, signOutForIdle } from "@/lib/idle";
import {
  clearAuthStorage,
  isJwtLikeToken,
  normalizeAuthToken,
} from "@/utils/token";

const baseUrl = import.meta.env.VITE_API_URL;

const getJwtErrorName = (data: unknown) => {
  if (!data || typeof data !== "object") return null;

  const message = (data as { message?: unknown }).message;
  if (message && typeof message === "object" && "name" in message) {
    return String((message as { name?: unknown }).name);
  }

  return null;
};

// Create the standard base query
const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers) => {
    const storedToken = storage.get(STORAGE_KEYS.TOKEN);
    const token = normalizeAuthToken(storedToken);

    if (token && isJwtLikeToken(token)) {
      headers.set("authorization", `Bearer ${token}`);
      // Stage 9: work in a team workspace the researcher belongs to.
      const ws = storage.get(STORAGE_KEYS.WORKSPACE);
      if (ws && /^[a-f\d]{24}$/i.test(String(ws)) && storage.get(STORAGE_KEYS.USER_TYPE) === "researcher") headers.set("x-workspace", String(ws));
    } else if (storedToken) {
      storage.remove(STORAGE_KEYS.TOKEN);
    }

    return headers;
  },
});

// Create a custom wrapper to intercept requests
const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // 1. Check if the request failed with 401 (Unauthorized)
  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as any;
    const errorName = getJwtErrorName(errorData);

    if (errorName === "JsonWebTokenError") {
      clearAuthStorage();
      return result;
    }

    // 2. The access token ran out. Alpha feedback: renew only for someone active within the idle limit
    // (background requests must not keep an idle sign-in alive); otherwise sign out with an explanation.
    if (errorName === "TokenExpiredError") {
      if (IDLE_MINUTES && idleMs() >= idleLimitMs()) {
        signOutForIdle("idle");
        return result;
      }
      if (await renewSession()) result = await baseQuery(args, api, extraOptions);
      else signOutForIdle("expired");
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ["Items", "Users", "Researchers", "Projects", "Surveys", "Wallet", "Live", "Bookings", "Messages", "Inbox", "Review", "Team", "Account", "Verification", "Profile", "Studies", "ParticipantAccount"],
  endpoints: () => ({}),
});
