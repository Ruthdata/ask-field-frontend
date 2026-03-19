import { apiSlice } from "./appSlice";
import { CompleteProfile, User } from "../../../types/user.type";
import { ApiSuccess } from "@/types/api.type";
// import { ApiSuccess } from "../../../types/api.type";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerParticipant: builder.mutation<ApiSuccess<User>, Partial<User>>({
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
    loginUser: builder.mutation<ApiSuccess<{accessToken: string, user: string, refreshToken: string}>, Partial<User>>({
      query: (body) => {
        return {
          url: "/participants/auth/login",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),
    completeProfile: builder.mutation<ApiSuccess<{profile: CompleteProfile}>, Partial<CompleteProfile>>({
      query: (body) => {
        return {
          url: "/participants/auth/complete-profile",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),
    verifyEmail: builder.mutation<ApiSuccess<string>,{ token: string; email: string }>({
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
    googleAuthVerify: builder.mutation<ApiSuccess<{accessToken: string, user: User, refreshToken: string}>,{ token: string }>({
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
    getUser: builder.query<ApiSuccess<User>, void>({
      query: () => "/participants/me",
      // providesTags: "users"
      providesTags: ["Users"],
    }),
    getRefreshToken: builder.query<ApiSuccess<{accessToken: string}>, {token: string}>({
      query: (args) =>({
        url: "/participants/auth/refresh-token",
        method: "GET",
        headers: {
          token: args.token
        }
      }),
      providesTags: ["Users"],
      // providesTags: "users"
    }),
  }),
});

export const {
  useRegisterParticipantMutation,
  useLoginUserMutation,
  useLazyGetUserQuery,
  useVerifyEmailMutation,
  useGoogleAuthVerifyMutation,
  useLazyGetRefreshTokenQuery,
  useCompleteProfileMutation
} = authApi;
