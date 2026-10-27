import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { Session } from "@/lib/session";

/** Participant Stage 1: join, sign up, confirm email, and verify once (see the "joinStudy Participant Flow" canvas). */

export const PARTICIPANT_COUNTRIES = ["Nigeria", "Ghana", "Kenya"] as const;
export type ParticipantCountry = (typeof PARTICIPANT_COUNTRIES)[number];
export const CALLING_CODE: Record<string, string> = { Nigeria: "234", Ghana: "233", Kenya: "254" };
export const PHONE_EXAMPLE: Record<string, string> = { Nigeria: "0803 555 0142", Ghana: "024 555 0142", Kenya: "0712 555 142" };

export type VerificationStatus = "none" | "phone" | "checking" | "verified" | "review" | "duplicate" | "rejected";
export type SelfieOutcome = "verified" | "retry" | "review" | "duplicate";
export interface Verification {
  required: boolean;
  status: VerificationStatus;
  consented: boolean;
  phoneVerified: boolean;
  phoneLast2: string | null;
  channel: "whatsapp" | "sms" | null;
  selfieTriesLeft: number;
  verifiedAt: string | null;
  country: string | null;
  callingCode: string | null;
  qualifying: { count: number; minPay: number; maxPay: number; currency: string };
  testMode: { phone: boolean; selfie: boolean };
}

export interface ParticipantSignUp {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  agree: boolean;
  receivesUpdates: boolean;
  turnstileToken?: string;
}

/** Participant Stage 2: the "About you" profile. */
export type ProfilePart = "where" | "languages" | "work";
export interface Option { value: string; label: string }
export interface ParticipantProfile {
  country: string;
  answers: {
    region: string;
    birthMonth: number | null;
    birthYear: number | null;
    gender: "" | "female" | "male";
    firstLanguage: string;
    languages: string[];
    education: string;
    student: "" | "yes" | "no";
    work: string;
    devices: string[];
  };
  parts: Record<ProfilePart, boolean>;
  complete: boolean;
  locked: boolean;
  verification: VerificationStatus;
  linkedin: { connected: boolean; connectedAt: string | null; nameMatches: boolean | null; testMode: boolean };
  options: { regionLabel: string; regions: string[]; languages: string[]; genders: Option[]; education: Option[]; work: Option[]; devices: Option[] };
}


/** Participant Stage 3: finding studies. Pay is in the study's currency (USD by default). */
export type HomeSituation = "profile" | "waiting" | "verify" | "ready" | "all-set";
export type StudyMethod = "survey" | "interview" | "focus-group" | "product-test" | "ai-evaluation";
export interface StudyCard {
  id: string;
  title: string;
  summary: string;
  method: StudyMethod;
  minutes: number;
  pay: number;
  hourly: number;
  currency: string;
  places: number;
  placesLeft: number;
  closesAt: string | null;
  books: boolean;
  devices: string[];
  researcher: { name: string; organization: string } | null;
  publishedAt: string | null;
}
export interface ParticipantHome {
  firstName: string;
  situation: HomeSituation;
  profile: { complete: boolean; parts: Record<ProfilePart, boolean> };
  verification: { required: boolean; status: VerificationStatus; verified: boolean; message: string | null };
  studies: StudyCard[];
  payRange: { min: number; max: number } | null;
  hiddenCount: number;
  inProgress: { id: string; title: string; pay: number; currency: string; startedAt: string; heldUntil: string | null; expired: boolean; books: boolean }[];
  doneCount: number;
  alerts: { email: boolean };
  money: { currency: string; waiting: number; ready: number; minPayout: number };
}
export type StudyState = "start" | "verify" | "blocked" | "not-for-you" | "in-progress" | "done" | "closed" | "full";
/** Participant Stage 4: how a finished attempt went, for the thank-you page. */
export type FinishOutcome = "paid" | "review" | "late" | "late-over";
export type LeaveReason = "longer" | "link-broken" | "came-up" | "uncomfortable" | "other";
export const LEAVE_REASONS: { value: LeaveReason; label: string }[] = [
  { value: "longer", label: "Takes longer than it said" },
  { value: "link-broken", label: "The link didn't work" },
  { value: "came-up", label: "Something came up" },
  { value: "uncomfortable", label: "I'm not comfortable with it" },
  { value: "other", label: "Something else" },
];
export interface FinishResult { outcome: FinishOutcome; amount: number; currency: string | null; surveyId: string }
export type HideReason = "too-long" | "pay-low" | "topic" | "timing" | "other";
export const HIDE_REASONS: { value: HideReason; label: string }[] = [
  { value: "too-long", label: "Takes too long" },
  { value: "pay-low", label: "Pay is too low" },
  { value: "topic", label: "Not my topic" },
  { value: "timing", label: "Bad timing" },
  { value: "other", label: "Something else" },
];
export interface StudyDetail extends StudyCard {
  description: string;
  ethics: string;
  consent: { required: boolean; text: string };
  warning: string;
  hasQuestions: boolean;
  tasks: string[];
  equipment: string;
  state: StudyState;
  myStatus: string | null;
  fit: { ok: boolean; reason: string | null };
  verification: { required: boolean; status: VerificationStatus; message: string | null };
  hidden: { reason: HideReason | null } | null;
  paidWithin: string;
  heldUntil: string | null;
  holds: boolean;
  hasCode: boolean;
  outcome: FinishOutcome | null;
}
export interface HiddenStudy extends StudyCard { reason: HideReason | null; reasonLabel: string | null }


/** Participant Stage 5: after a study. */
export type MyBucket = "in-progress" | "waiting" | "paid" | "not-approved" | "ended";
export type AppealStatus = "open" | "approved" | "kept" | "escalated" | "upheld" | "overturned";
export type AppealWhy = "did-tasks" | "did-checks" | "eligible" | "other";
export const APPEAL_WHYS: { value: AppealWhy; label: string }[] = [
  { value: "did-tasks", label: "I did everything the study asked" },
  { value: "did-checks", label: "I did the attention checks" },
  { value: "eligible", label: "I am who the study is for" },
  { value: "other", label: "Something else" },
];
export interface MyStudyRow {
  surveyId: string;
  title: string;
  method: StudyMethod;
  bucket: MyBucket;
  status: string;
  amount: number;
  currency: string;
  startedAt: string;
  submittedAt: string | null;
  decidedAt: string | null;
  heldUntil: string | null;
  bookedFor: string | null;
  autoApproveAt: string | null;
  askUntil: string | null;
  appeal: AppealStatus | null;
  changed: boolean;
}
export interface MyDecision {
  surveyId: string;
  title: string;
  method: StudyMethod;
  code: string;
  researcher: { name: string; organization: string };
  status: string;
  bucket: MyBucket | null;
  amount: number;
  currency: string;
  decidedAt: string | null;
  decidedBy: string | null;
  reason: { key: string; text: string } | null;
  note: string;
  autoApproveAt: string | null;
  askUntil: string | null;
  appeal: {
    status: AppealStatus;
    why: AppealWhy;
    whyLabel: string;
    message: string;
    askedAt: string;
    answer: string;
    answeredAt: string | null;
    answerBy: string | null;
    escalatedAt: string | null;
    resolution: string;
    resolvedAt: string | null;
  } | null;
  canAsk: boolean;
  canEscalate: boolean;
}

export const participantApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getParticipantHome: b.query<ApiSuccess<ParticipantHome>, void>({ query: () => "/participants/me/home", providesTags: ["Studies", "Wallet"] }),
    getParticipantStudy: b.query<ApiSuccess<StudyDetail>, string>({ query: (id) => `/participants/me/studies/${id}`, providesTags: ["Studies"] }),
    getHiddenStudies: b.query<ApiSuccess<HiddenStudy[]>, void>({ query: () => "/participants/me/studies/hidden", providesTags: ["Studies"] }),
    hideStudy: b.mutation<ApiSuccess<{ hidden: true }>, { id: string; reason?: HideReason }>({
      query: ({ id, reason }) => ({ url: `/participants/me/studies/${id}/hide`, method: "POST", body: reason ? { reason } : {} }),
      invalidatesTags: ["Studies", "Verification"],
    }),
    unhideStudy: b.mutation<ApiSuccess<{ hidden: false }>, string>({
      query: (id) => ({ url: `/participants/me/studies/${id}/hide`, method: "DELETE" }),
      invalidatesTags: ["Studies", "Verification"],
    }),
    finishStudy: b.mutation<ApiSuccess<FinishResult>, { id: string; code: string }>({
      query: ({ id, code }) => ({ url: `/participants/me/studies/${id}/finish`, method: "POST", body: { code } }),
      invalidatesTags: ["Studies", "Wallet"],
    }),
    leaveStudy: b.mutation<ApiSuccess<{ left: true }>, { id: string; reason?: LeaveReason }>({
      query: ({ id, reason }) => ({ url: `/participants/me/studies/${id}/leave`, method: "POST", body: reason ? { reason } : {} }),
      invalidatesTags: ["Studies", "Bookings"],
    }),
    getMyStudies: b.query<ApiSuccess<{ rows: MyStudyRow[]; counts: Record<string, number> }>, void>({ query: () => "/participants/me/my-studies", providesTags: ["Studies", "Wallet"] }),
    getMyDecision: b.query<ApiSuccess<MyDecision>, string>({ query: (id) => `/participants/me/my-studies/${id}`, providesTags: ["Studies"] }),
    askAboutDecision: b.mutation<ApiSuccess<MyDecision>, { id: string; why: AppealWhy; message: string }>({
      query: ({ id, ...body }) => ({ url: `/participants/me/my-studies/${id}/ask`, method: "POST", body }),
      invalidatesTags: ["Studies", "Messages", "Inbox"],
    }),
    escalateDecision: b.mutation<ApiSuccess<MyDecision>, string>({
      query: (id) => ({ url: `/participants/me/my-studies/${id}/escalate`, method: "POST" }),
      invalidatesTags: ["Studies"],
    }),
    setStudyEmails: b.mutation<ApiSuccess<{ email: boolean }>, boolean>({
      query: (email) => ({ url: "/participants/me/alerts", method: "PUT", body: { email } }),
      invalidatesTags: ["Studies"],
    }),
    stopStudyEmails: b.mutation<ApiSuccess<{ email: false }>, { u: string; t: string }>({
      query: (body) => ({ url: "/participants/alerts/stop", method: "POST", body }),
    }),
    getProfile: b.query<ApiSuccess<ParticipantProfile>, void>({ query: () => "/participants/me/profile", providesTags: ["Profile"] }),
    saveProfilePart: b.mutation<ApiSuccess<ParticipantProfile>, { part: ProfilePart; body: Record<string, unknown> }>({
      query: ({ part, body }) => ({ url: `/participants/me/profile/${part}`, method: "PUT", body }),
      invalidatesTags: ["Profile", "Verification", "Users"],
    }),
    startLinkedin: b.mutation<ApiSuccess<{ url: string; testMode: boolean }>, void>({ query: () => ({ url: "/participants/me/linkedin/start", method: "POST" }) }),
    completeLinkedin: b.mutation<ApiSuccess<ParticipantProfile>, { code: string; state: string }>({
      query: (body) => ({ url: "/participants/me/linkedin/complete", method: "POST", body }),
      invalidatesTags: ["Profile"],
    }),
    disconnectLinkedin: b.mutation<ApiSuccess<ParticipantProfile>, void>({ query: () => ({ url: "/participants/me/linkedin", method: "DELETE" }), invalidatesTags: ["Profile"] }),
    signUpParticipant: b.mutation<ApiSuccess<{ email: string; firstName: string }>, ParticipantSignUp>({
      query: (body) => ({ url: "/participants/auth/register", method: "POST", body }),
    }),
    joinWaitlist: b.mutation<ApiSuccess<object>, { email: string; country: string }>({
      query: (body) => ({ url: "/participants/waitlist", method: "POST", body }),
    }),
    changeUnconfirmedEmail: b.mutation<ApiSuccess<{ email: string }>, { email: string; password: string; newEmail: string }>({
      query: (body) => ({ url: "/participants/auth/change-email", method: "POST", body }),
    }),
    confirmParticipantEmail: b.mutation<ApiSuccess<(Session & { alreadyVerified: false }) | { alreadyVerified: true }>, { email: string; token: string }>({
      query: (params) => ({ url: "/participants/auth/verify-email", method: "GET", params }),
    }),

    getVerification: b.query<ApiSuccess<Verification>, void>({ query: () => "/participants/me/verification", providesTags: ["Verification"] }),
    consentToVerification: b.mutation<ApiSuccess<Verification>, void>({
      query: () => ({ url: "/participants/me/verification/consent", method: "POST" }),
      invalidatesTags: ["Verification"],
    }),
    sendPhoneCode: b.mutation<ApiSuccess<{ sentTo: string; channel: "whatsapp" | "sms"; retryAfter: number }>, { phone: string; channel: "whatsapp" | "sms" }>({
      query: (body) => ({ url: "/participants/me/verification/phone/send", method: "POST", body }),
    }),
    checkPhoneCode: b.mutation<ApiSuccess<Verification>, { code: string }>({
      query: (body) => ({ url: "/participants/me/verification/phone/verify", method: "POST", body }),
      invalidatesTags: ["Verification"],
    }),
    startSelfie: b.mutation<ApiSuccess<{ session: string | null; mode: "test" | "sdk" | "review"; clientToken?: string }>, void>({
      query: () => ({ url: "/participants/me/verification/selfie/start", method: "POST" }),
    }),
    completeSelfie: b.mutation<ApiSuccess<Verification>, { session: string; testOutcome?: SelfieOutcome }>({
      query: (body) => ({ url: "/participants/me/verification/selfie/complete", method: "POST", body }),
      invalidatesTags: ["Verification"],
    }),
  }),
});

export const {
  useGetParticipantHomeQuery,
  useGetParticipantStudyQuery,
  useGetHiddenStudiesQuery,
  useHideStudyMutation,
  useUnhideStudyMutation,
  useSetStudyEmailsMutation,
  useGetMyStudiesQuery,
  useGetMyDecisionQuery,
  useAskAboutDecisionMutation,
  useEscalateDecisionMutation,
  useFinishStudyMutation,
  useLeaveStudyMutation,
  useStopStudyEmailsMutation,
  useGetProfileQuery,
  useSaveProfilePartMutation,
  useStartLinkedinMutation,
  useCompleteLinkedinMutation,
  useDisconnectLinkedinMutation,
  useSignUpParticipantMutation,
  useJoinWaitlistMutation,
  useChangeUnconfirmedEmailMutation,
  useConfirmParticipantEmailMutation,
  useGetVerificationQuery,
  useConsentToVerificationMutation,
  useSendPhoneCodeMutation,
  useCheckPhoneCodeMutation,
  useStartSelfieMutation,
  useCompleteSelfieMutation,
} = participantApi;
