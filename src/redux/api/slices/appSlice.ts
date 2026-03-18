import { STORAGE_KEYS } from "@/config/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL;



export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl, // ✅ Your global backend URL
    prepareHeaders: (headers) => {
      // Optional: attach tokens here (JWT, API keys)
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Items", "Users"],
  endpoints: () => ({}),
});
