import { apiSlice } from "./appSlice";
import { User } from "../../../types/user.type";
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
    loginUser: builder.mutation<ApiSuccess<{token: string, user: string}>, Partial<User>>({
      query: (body) => {
        return {
          url: "/participants/auth/login",
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
    googleAuthVerify: builder.mutation<ApiSuccess<{token: string, user: User}>,{ token: string }>({
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
      query: () => "/users/get-account",
      // providesTags: "users"
      providesTags: ["Users"],
    }),
  }),
});

export const {
  useRegisterParticipantMutation,
  useLoginUserMutation,
  useLazyGetUserQuery,
  useVerifyEmailMutation,
  useGoogleAuthVerifyMutation
} = authApi;
