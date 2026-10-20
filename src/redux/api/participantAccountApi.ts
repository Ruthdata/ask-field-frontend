import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import { apiHeaders } from "@/utils/token";
import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";

/** Participant Stage 7: settings, your data, help and reporting a study (the "joinStudy Participant Flow" canvas, 7.1–7.4). */

export interface ParticipantEmailPrefs { studies: boolean; messages: boolean; news: boolean }
export interface ParticipantSettings {
  email: string;
  pendingEmail: string | null;
  hasPassword: boolean;
  passwordChangedAt: string | null;
  signupPlatform: "email" | "google";
  name: string;
  nameLocked: boolean;
  phone: { last2: string; channel: "whatsapp" | "sms" } | null;
  country: string | null;
  emailPrefs: ParticipantEmailPrefs;
}
export interface Tokens { accessToken: string; refreshToken: string }
export interface CloseCheck { canClose: boolean; reasons: string[]; currency: string; ready: number; waiting: number; canCashOut: boolean; minPayout: number }
export type HelpTopic = "account" | "money" | "verification" | "study" | "other";
export type ReportReason = "asks-details" | "asks-money" | "harmful" | "not-as-described" | "broken-link" | "other";
export interface ReportForm { surveyId: string; title: string; reasons: { value: ReportReason; label: string }[]; already: { reference: string; reason: ReportReason; at: string } | null }

const ME = "/participants/me";

export const participantAccountApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getParticipantSettings: b.query<ApiSuccess<ParticipantSettings>, void>({ query: () => `${ME}/settings`, providesTags: ["ParticipantAccount"] }),
    requestParticipantEmail: b.mutation<ApiSuccess<ParticipantSettings>, { email: string; password?: string }>({
      query: (body) => ({ url: `${ME}/settings/email`, method: "POST", body }),
      invalidatesTags: ["ParticipantAccount"],
    }),
    cancelParticipantEmail: b.mutation<ApiSuccess<ParticipantSettings>, void>({ query: () => ({ url: `${ME}/settings/email`, method: "DELETE" }), invalidatesTags: ["ParticipantAccount"] }),
    confirmNewParticipantEmail: b.mutation<ApiSuccess<{ email: string }>, string>({ query: (token) => ({ url: "/participants/settings/confirm-email", method: "POST", body: { token } }) }),
    changeParticipantPassword: b.mutation<ApiSuccess<Tokens>, { current?: string; next: string }>({
      // No automatic refetch: the page stores this device's new tokens first, then refreshes (see keepThisDevice).
      query: (body) => ({ url: `${ME}/settings/password`, method: "POST", body }),
    }),
    sendPhoneChange: b.mutation<ApiSuccess<{ sentTo: string; channel: string; retryAfter: number }>, { phone: string; channel: "whatsapp" | "sms" }>({
      query: (body) => ({ url: `${ME}/settings/phone/send`, method: "POST", body }),
    }),
    verifyPhoneChange: b.mutation<ApiSuccess<ParticipantSettings>, { code: string }>({
      query: (body) => ({ url: `${ME}/settings/phone/verify`, method: "POST", body }),
      invalidatesTags: ["ParticipantAccount", "Verification"],
    }),
    setParticipantEmailPrefs: b.mutation<ApiSuccess<ParticipantSettings>, Partial<ParticipantEmailPrefs>>({
      query: (body) => ({ url: `${ME}/settings/email-prefs`, method: "PUT", body }),
      invalidatesTags: ["ParticipantAccount", "Studies"],
    }),
    signOutOthers: b.mutation<ApiSuccess<Tokens>, void>({ query: () => ({ url: `${ME}/settings/sign-out-others`, method: "POST" }) }),
    getParticipantCloseCheck: b.query<ApiSuccess<CloseCheck>, void>({ query: () => `${ME}/close`, providesTags: ["ParticipantAccount", "Wallet"] }),
    closeParticipantAccount: b.mutation<ApiSuccess<{ closed: boolean }>, { password?: string; giveUp?: boolean }>({ query: (body) => ({ url: `${ME}/close`, method: "POST", body }) }),
    contactJoinStudy: b.mutation<ApiSuccess<{ reference: string; answerWithinDays: number }>, { topic: HelpTopic; message: string; surveyId?: string }>({
      query: (body) => ({ url: `${ME}/help/contact`, method: "POST", body }),
    }),
    getReportForm: b.query<ApiSuccess<ReportForm>, string>({ query: (id) => `${ME}/studies/${id}/report` }),
    reportStudy: b.mutation<ApiSuccess<{ reference: string; paused: boolean; safety: boolean }>, { id: string; reason: ReportReason; message?: string }>({
      query: ({ id, ...body }) => ({ url: `${ME}/studies/${id}/report`, method: "POST", body }),
    }),
  }),
});

export const {
  useGetParticipantSettingsQuery,
  useRequestParticipantEmailMutation,
  useCancelParticipantEmailMutation,
  useConfirmNewParticipantEmailMutation,
  useChangeParticipantPasswordMutation,
  useSendPhoneChangeMutation,
  useVerifyPhoneChangeMutation,
  useSetParticipantEmailPrefsMutation,
  useSignOutOthersMutation,
  useGetParticipantCloseCheckQuery,
  useCloseParticipantAccountMutation,
  useContactJoinStudyMutation,
  useGetReportFormQuery,
  useReportStudyMutation,
} = participantAccountApi;

/** After a password change or "sign out everywhere else", this device keeps going with its new tokens. */
export function keepThisDevice(t: Tokens) {
  const remember = Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN));
  storage.set(STORAGE_KEYS.TOKEN, t.accessToken, remember);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, t.refreshToken, remember);
  return participantAccountApi.util.invalidateTags(["ParticipantAccount"]);
}

/** Downloads everything joinStudy holds about them as JSON. */
export async function downloadMyData() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${ME}/data.json`, { headers: apiHeaders() });
  if (!res.ok) throw new Error("We couldn't make the file. Try again.");
  const url = URL.createObjectURL(await res.blob());
  Object.assign(document.createElement("a"), { href: url, download: `joinstudy-my-data-${new Date().toISOString().slice(0, 10)}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
