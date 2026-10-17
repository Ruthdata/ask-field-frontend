import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { AccountType, NeedsChoice, Session } from "@/lib/session";

/** Stage 1 endpoints (backend: /api/auth/* and /api/researchers/auth/*). */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    signUpResearcher: b.mutation<
      ApiSuccess<{ email: string; firstName: string }>,
      { fullName: string; email: string; password: string; receivesUpdates: boolean; method?: string; source?: string }
    >({
      query: (body) => ({ url: "/researchers/auth/register", method: "POST", body }),
    }),
    resendVerification: b.mutation<ApiSuccess<object>, { email: string; accountType?: AccountType }>({
      query: (body) => ({ url: "/auth/resend-verification", method: "POST", body }),
    }),
    confirmResearcherEmail: b.mutation<ApiSuccess<(Session & { alreadyVerified: false }) | { alreadyVerified: true }>, { email: string; token: string }>({
      query: (params) => ({ url: "/researchers/auth/verify-email", method: "GET", params }),
    }),
    signIn: b.mutation<ApiSuccess<Session | NeedsChoice>, { email: string; password: string; intent?: AccountType; accountType?: AccountType }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    googleSignIn: b.mutation<ApiSuccess<Session | NeedsChoice>, { token: string; intent?: AccountType; accountType?: AccountType; method?: string }>({
      query: (body) => ({ url: "/auth/google", method: "POST", body }),
    }),
    sendResetCode: b.mutation<ApiSuccess<object>, { email: string }>({
      query: (body) => ({ url: "/auth/send-otp", method: "POST", body }),
    }),
    checkResetCode: b.mutation<ApiSuccess<{ token: string }>, { email: string; code: string }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
    }),
    setNewPassword: b.mutation<ApiSuccess<Session>, { email: string; token: string; password: string; intent?: AccountType }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useSignUpResearcherMutation,
  useResendVerificationMutation,
  useConfirmResearcherEmailMutation,
  useSignInMutation,
  useGoogleSignInMutation,
  useSendResetCodeMutation,
  useCheckResetCodeMutation,
  useSetNewPasswordMutation,
} = authApi;
