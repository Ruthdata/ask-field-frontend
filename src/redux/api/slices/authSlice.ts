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
    loginUser: builder.mutation<ApiSuccess<{redirectUrl: string}>, Partial<User>>({
      query: (body) => {
        return {
          url: "/users/login",
          method: "POST",
          body,
        };
      },
      // providesTags: "users"
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
  useVerifyEmailMutation
} = authApi;
