import { apiSlice } from "./slices/appSlice";
import { DashboardStatsResponse } from "../../../types/researcher";

export const researcherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => ({
        url: "/researchers/dashboard-stats",
        method: "GET",
      }),
      providesTags: ["Researchers"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useLazyGetDashboardStatsQuery } =
  researcherApi;