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

const baseUrl = import.meta.env.VITE_API_URL;

// Create the standard base query
const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
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

    // 2. Check for your specific "TokenExpiredError" message
    if (errorData?.message.name === "TokenExpiredError") {
      const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
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
        }>;

        const accessToken = responseData.data.accessToken;

        if (accessToken) {
          console.log(accessToken, "inside");
          storage.set(STORAGE_KEYS.TOKEN, accessToken);
          window.location.reload();
        } else {
          storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = "/";
        }
      } else {
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
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
