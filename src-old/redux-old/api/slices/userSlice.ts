import { apiSlice } from "./appSlice";
import {
  CompleteProfile,
  Participant,
  Researcher,
} from "../../../types/user.type";
import { ApiSuccess } from "@/types/api.type";
import {
  CreateSurveyActionPayload,
  SurveyActionResponse,
} from "@/types/survey";
// import { ApiSuccess } from "../../../types/api.type";


export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerParticipant: builder.mutation<
      ApiSuccess<Participant>,
      Partial<Participant>
    >({
      query: (body) => {
        return {
          url: "/participants/auth/register",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    registerResearcher: builder.mutation<
      ApiSuccess<Researcher>,
      {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        jobTitle: string;
        organizationName: string;
        organizationType: string;
        country: string;
        signupPlatform: "email" | "google";
      }
    >({
      query: (body) => ({
        url: "/researchers/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    loginParticipant: builder.mutation<
      ApiSuccess<{ accessToken: string; user: string; refreshToken: string }>,
      Partial<Participant>
    >({
      query: (body) => {
        return {
          url: "/participants/auth/login",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),
    loginResearcher: builder.mutation<
      ApiSuccess<{ accessToken: string; user: string; refreshToken: string }>,
      Partial<Participant>
    >({
      query: (body) => {
        return {
          url: "/researchers/auth/login",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),
    completeProfile: builder.mutation<
      ApiSuccess<{ profile: CompleteProfile }>,
      Partial<CompleteProfile>
    >({
      query: (body) => {
        return {
          url: "/participants/auth/complete-profile",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),
    verifyEmail: builder.mutation<
      ApiSuccess<string>,
      { token: string; email: string }
    >({
      query: (body) => {
        return {
          url: "/participants/auth/verify-email",
          method: "GET",
          params: body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    verifyResearcherEmail: builder.mutation<
      ApiSuccess<string>,
      { token: string; email: string }
    >({
      query: (body) => {
        return {
          url: "/researchers/auth/verify-email",
          method: "GET",
          params: body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    googleAuthVerify: builder.mutation<
      ApiSuccess<{
        accessToken: string;
        user: Participant;
        refreshToken: string;
      }>,
      { token: string }
    >({
      query: (body) => {
        return {
          url: "/participants/auth/google-auth",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    getParticipant: builder.query<ApiSuccess<Participant>, void>({
      query: () => "/participants/me",
      // providesTags: "users"
      providesTags: ["Users"],
    }),
    checkSurveyEligibility: builder.query<SurveyActionResponse, string>({
      query: (surveyId) => `/surveys/check-eligibility/${surveyId}`,
      providesTags: ["Surveys"],
    }),
    createSurveyAction: builder.mutation<
      SurveyActionResponse,
      CreateSurveyActionPayload
    >({
      query: (body) => ({
        url: "/surveys/create-survey-action",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Surveys"],
    }),
    verifySurveyAction: builder.mutation<SurveyActionResponse, string>({
      query: (surveyId) => ({
        url: `/surveys/verify-survey-action/${surveyId}`,
        method: "GET",
      }),
      invalidatesTags: ["Surveys"],
    }),
    getResearcher: builder.query<ApiSuccess<Researcher>, void>({
      query: () => "/researchers/me",
      // providesTags: "users"
      providesTags: ["Users"],
    }),
    getRefreshToken: builder.query<
      ApiSuccess<{ accessToken: string }>,
      { token: string }
    >({
      query: (args) => ({
        url: "/participants/auth/refresh-token",
        method: "GET",
        headers: {
          token: args.token,
        },
      }),
      providesTags: ["Users"],
      // providesTags: "users"
    }),
    sendOtp: builder.mutation<ApiSuccess<{}>, { email: string }>({
      query: (body) => {
        return {
          url: "/participants/auth/send-otp",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    verifyResetPasswordOtp: builder.mutation<
      ApiSuccess<{ token: string }>,
      { email: string; code: string }
    >({
      query: (body) => {
        return {
          url: "/participants/auth/verify-otp",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
    resetPassword: builder.mutation<
      ApiSuccess<string>,
      { token: string; email: string; password: string }
    >({
      query: (body) => {
        return {
          url: "/participants/auth/reset-password",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useRegisterParticipantMutation,
  useLoginParticipantMutation,
  useLoginResearcherMutation,
  useLazyGetParticipantQuery,
  useLazyGetResearcherQuery,
  useVerifyEmailMutation,
  useGoogleAuthVerifyMutation,
  useLazyGetRefreshTokenQuery,
  useCompleteProfileMutation,
  useCheckSurveyEligibilityQuery,
  useLazyCheckSurveyEligibilityQuery,
  useCreateSurveyActionMutation,
  useVerifySurveyActionMutation,
  useSendOtpMutation,
  useVerifyResetPasswordOtpMutation,
  useResetPasswordMutation,
  useRegisterResearcherMutation,
  useVerifyResearcherEmailMutation,
} = authApi;
