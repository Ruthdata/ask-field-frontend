import { apiSlice } from "./slices/appSlice";
import { DashboardStatsResponse } from "@/types/researcher";
import {
  SurveyActionResponse,
  SurveyActionsListResponse,
} from "@/types/survey";

export const researcherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => ({
        url: "/researchers/dashboard-stats",
        method: "GET",
      }),
      providesTags: ["Researchers"],
    }),
    listSurveyActions: builder.query<SurveyActionsListResponse, void>({
      query: () => ({
        url: "/surveys/list-survey-actions",
        method: "GET",
      }),
      providesTags: ["Surveys"],
    }),
    getSurveyAction: builder.query<SurveyActionResponse, string>({
      query: (surveyActionId) => ({
        url: `/surveys/get-survey-actions/${surveyActionId}`,
        method: "GET",
      }),
      providesTags: ["Surveys"],
    }),
    approveSurveyAction: builder.mutation<SurveyActionResponse, string>({
      query: (surveyActionId) => ({
        url: `/surveys/approve-survey-action/${surveyActionId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Surveys"],
    }),
    rejectSurveyAction: builder.mutation<SurveyActionResponse, string>({
      query: (surveyActionId) => ({
        url: `/surveys/reject-survey-action/${surveyActionId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Surveys"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useLazyGetDashboardStatsQuery,
  useListSurveyActionsQuery,
  useLazyListSurveyActionsQuery,
  useGetSurveyActionQuery,
  useLazyGetSurveyActionQuery,
  useApproveSurveyActionMutation,
  useRejectSurveyActionMutation,
} = researcherApi;
