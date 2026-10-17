import { apiSlice } from "./slices/appSlice";
import { DashboardStatsResponse } from "@/types/researcher";
import {
  SurveyActionResponse,
  SurveyActionsListResponse,
} from "@/types/survey";

export interface CompleteResearcherProfilePayload {
  purposeHere: string[];
  researchType: string[];
  researchInterest: string[];
  firstName?: string;
  lastName?: string;
  organization?: string;
  street?: string;
  address2?: string;
  city?: string;
  country?: string;
}

export const researcherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    completeResearcherProfile: builder.mutation<{ success: boolean; message: string }, CompleteResearcherProfilePayload>({
      query: (body) => ({ url: "/researchers/auth/complete-profile", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
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
      invalidatesTags: ["Surveys", "Researchers", "Wallet"],
    }),
    rejectSurveyAction: builder.mutation<SurveyActionResponse, string>({
      query: (surveyActionId) => ({
        url: `/surveys/reject-survey-action/${surveyActionId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Surveys", "Researchers", "Wallet"],
    }),
  }),
});

export const {
  useCompleteResearcherProfileMutation,
  useGetDashboardStatsQuery,
  useLazyGetDashboardStatsQuery,
  useListSurveyActionsQuery,
  useLazyListSurveyActionsQuery,
  useGetSurveyActionQuery,
  useLazyGetSurveyActionQuery,
  useApproveSurveyActionMutation,
  useRejectSurveyActionMutation,
} = researcherApi;
