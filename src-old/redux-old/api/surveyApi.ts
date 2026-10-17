import { apiSlice } from "./slices/appSlice";
import {
  CreateDraftSurveyPayload,
  CreateDraftSurveyResponse,
  UpdateDraftSurveyPayload,
  GetSurveysByProjectPayload,
  GetAllSurveysPayload,
  SurveyResponse,
  SurveysListResponse,
} from "@/types/survey";

export const surveyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDraftSurvey: builder.mutation<
      CreateDraftSurveyResponse,
      CreateDraftSurveyPayload
    >({
      query: (body) => ({
        url: "/surveys/create-draft-survey",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Surveys"], 
    }),
    publishDraftSurvey: builder.mutation<SurveyResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/publish-draft-survey/${surveyId}`,
        method: "POST",
      }),
      invalidatesTags: ["Surveys"],
    }),

    updateDraftSurvey: builder.mutation<
      SurveyResponse,
      UpdateDraftSurveyPayload
    >({
      query: ({ surveyId, body }) => ({
        url: `/surveys/update-draft-survey/${surveyId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Surveys"],
    }),


    getSurveysByProject: builder.query<
      SurveysListResponse,
      GetSurveysByProjectPayload
    >({
      query: ({ projectId, status }) => ({
        url: `/surveys/get-surveys-by-project/${projectId}`,
        method: "GET",
        params: { status },
      }),
      providesTags: ["Surveys"], 
    }),

    getAllSurveys: builder.query<SurveysListResponse, GetAllSurveysPayload>({
      query: ({ status }) => ({
        url: "/surveys/get-all-surveys",
        method: "GET",
        params: { status },
      }),
      providesTags: ["Surveys"],
    }),

    getUserSurvey: builder.query<SurveyResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/get-user-survey/${surveyId}`,
        method: "GET",
      }),
      providesTags: ["Surveys"],
    }),

  }),
});

export const {
  useCreateDraftSurveyMutation,
  usePublishDraftSurveyMutation,
  useUpdateDraftSurveyMutation,
  useGetSurveysByProjectQuery,
  useLazyGetSurveysByProjectQuery,
  useGetAllSurveysQuery,
  useLazyGetAllSurveysQuery,
  useGetUserSurveyQuery,
  useLazyGetUserSurveyQuery,
} = surveyApi;
