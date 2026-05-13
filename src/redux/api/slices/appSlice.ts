import { STORAGE_KEYS } from "@/config/constants";
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { storage } from "@/utils/storage";
import { ApiSuccess } from "@/types/api.type";
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

    // 2. Check for your specific "TokenExpiredError" message
    if (errorName === "TokenExpiredError") {
      const refreshToken = normalizeAuthToken(
        storage.get(STORAGE_KEYS.REFRESH_TOKEN),
      );

      if (refreshToken && isJwtLikeToken(refreshToken)) {
        // 1. Trigger the refresh
        const response = await baseQuery(
          {
            url: "/participants/auth/refresh-token",
            method: "GET",
            headers: { token: refreshToken },
          },
          api,
          extraOptions,
        );

        const responseData = response.data as ApiSuccess<{
          accessToken: string;
        }> | undefined;

        const accessToken = normalizeAuthToken(responseData?.data?.accessToken);

        if (accessToken && isJwtLikeToken(accessToken)) {
          storage.set(STORAGE_KEYS.TOKEN, accessToken);
          result = await baseQuery(args, api, extraOptions);
        } else {
          clearAuthStorage();
          window.location.href = "/";
        }
      } else {
        clearAuthStorage();
        window.location.href = "/";
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ["Items", "Users", "Researchers", "Projects", "Surveys"],
  endpoints: () => ({}),
});
