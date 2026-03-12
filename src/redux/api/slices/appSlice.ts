import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;



export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl, // ✅ Your global backend URL
    prepareHeaders: (headers) => {
      // Optional: attach tokens here (JWT, API keys)
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Items", "Users"],
  endpoints: () => ({}), // Features will inject their own endpoints
});
