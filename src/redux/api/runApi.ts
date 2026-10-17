import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { StudyMethod } from "./homeApi";
import type { PayResult, Receipt } from "./launchApi";

/** Stage 6: running a live study (backend: /api/surveys/:id/live…, /api/bookings…, messages). */

export interface LiveView {
  surveyId: string;
  projectId: string;
  name: string;
  method: StudyMethod;
  status: "live" | "closed" | "draft";
  paused: boolean;
  publishedAt: string | null;
  closedAt: string | null;
  closes: string | null;
  places: number;
  minutes: number;
  counts: { approved: number; toReview: number; inProgress: number; rejected: number; screenedOut: number; noShow: number; left: number };
  medianMinutes: number | null;
  perDay: { day: string; count: number }[];
  quotas: { value: string; places: number; done: number }[];
  stuck: { code: string; participantSince: string }[];
  bookings: null | { booked: number; happened: number; noshow: number; next: { start: string; code: string }[] };
  money: { paidIn: number; paidOut: number; held: number; currency: string };
  perPerson: number;
  returnLink: string | null;
}
export interface LiveParticipant { surveyActionId: string; participantId: string; code: string; status: string; startedAt: string; submittedAt: string | null; minutes: number | null }
export type BookingStatus = "booked" | "cancelled" | "happened" | "noshow";
export interface Booking { bookingId: string; surveyId: string; participantId: string; start: string; end: string; status: BookingStatus; videoUrl?: string; participantTz: string }
export interface ResearcherBookings {
  timeZone: string;
  videoMode: "one" | "each";
  capacity: number;
  bookings: (Booking & { code: string; country: string })[];
  open: { start: string; end: string; left: number }[];
}
export interface Message { messageId: string; from: "researcher" | "participant"; body: string; broadcast: boolean; readAt?: string; createdAt: string }
export interface Thread { surveyId: string; participantId: string; study: string; code: string; status: string; count: number; unread: number; last: { from: string; body: string; at: string; broadcast?: boolean } }
export interface ThreadView { surveyId: string; participantId: string; code: string; status: string; study: string; messages: Message[] }
export interface ParticipantThread { surveyId: string; study: string; count: number; unread: number; last: { from: string; body: string; at: string } }
export interface ParticipantThreadView { surveyId: string; study: string; code: string; researcher: { name: string; organization: string }; canReply: boolean; messages: Message[] }
export interface Slot { start: string; end: string; left: number }
export interface SlotsView { title: string; method: StudyMethod; perPerson: number; currency: string; organization: string; verified: boolean; minutes: number; booking: MyBooking | null; slots: Slot[] }
export interface MyBooking extends Booking { title: string; canChange: boolean }
export type AddPlacesResult = PayResult & { extra?: number };
// Stage 7: review the work
export type Flag = "fast" | "no-link" | "rejected-before";
export type RejectReason = "tasks" | "attention" | "low-effort" | "not-eligible" | "other";
export interface ReviewItem {
  surveyActionId: string;
  participantId: string;
  code: string;
  status: "submitted" | "approved" | "rejected";
  minutes: number | null;
  submittedAt: string;
  reviewedAt: string | null;
  autoApproveAt: string | null;
  flags: Flag[];
  finishedBy: "link" | "self" | "booking" | null;
  review: { by: "researcher" | "auto" | "attendance"; reason: RejectReason | null; note: string } | null;
}
export interface ReviewView {
  surveyId: string;
  name: string;
  method: StudyMethod;
  plannedMinutes: number;
  perPerson: number;
  feeRate: number;
  currency: string;
  autoApproveDays: number;
  reviewMode: "manual" | "auto";
  counts: { toReview: number; flagged: number; approved: number; rejected: number };
  soonest: string | null;
  reasons: { key: RejectReason; label: string }[];
  items: ReviewItem[];
}
export interface ToReviewRow { surveyId: string; name: string; method: StudyMethod; count: number; flagged: number; toMark: number; autoApproveAt: string | null }

/** Opening a conversation marks it read on the server, so unread counts (tag "Inbox") refresh after it loads. */
async function readMarksRead(dispatch: (a: unknown) => unknown, done: Promise<unknown>) {
  try {
    await done;
    dispatch(apiSlice.util.invalidateTags(["Inbox"]));
  } catch {
    /* nothing to refresh */
  }
}

const live = (id: string) => [{ type: "Live" as const, id }, { type: "Surveys" as const, id }, "Researchers" as const];

export const runApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getLive: b.query<ApiSuccess<LiveView>, string>({ query: (id) => `/surveys/${id}/live`, providesTags: (_r, _e, id) => [{ type: "Live", id }, { type: "Surveys", id }] }),
    getLiveParticipants: b.query<ApiSuccess<LiveParticipant[]>, string>({ query: (id) => `/surveys/${id}/participants`, providesTags: (_r, _e, id) => [{ type: "Live", id }] }),
    setPaused: b.mutation<ApiSuccess<LiveView>, { id: string; paused: boolean }>({
      query: ({ id, paused }) => ({ url: `/surveys/${id}/live/${paused ? "pause" : "resume"}`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => live(id),
    }),
    setCloseDate: b.mutation<ApiSuccess<LiveView>, { id: string; date: string | null }>({
      query: ({ id, date }) => ({ url: `/surveys/${id}/live/close-date`, method: "POST", body: { date } }),
      invalidatesTags: (_r, _e, { id }) => live(id),
    }),
    closeEarly: b.mutation<ApiSuccess<LiveView>, string>({
      query: (id) => ({ url: `/surveys/${id}/live/close`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [...live(id), { type: "Bookings", id }],
    }),
    addPlaces: b.mutation<ApiSuccess<AddPlacesResult>, { id: string; extra?: number; session?: string; method: "card" | "invoice"; useCredit?: boolean; receipt?: Receipt }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/live/add-places`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [...live(id), { type: "Bookings", id }],
    }),
    addTimes: b.mutation<ApiSuccess<LiveView>, { id: string; weekly?: string[]; to?: string }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/live/add-times`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [...live(id), { type: "Bookings", id }],
    }),
    getBookings: b.query<ApiSuccess<ResearcherBookings>, string>({ query: (id) => `/surveys/${id}/bookings`, providesTags: (_r, _e, id) => [{ type: "Bookings", id }, { type: "Surveys", id }] }),
    markBooking: b.mutation<ApiSuccess<Booking>, { id: string; bookingId: string; as: "happened" | "noshow" }>({
      query: ({ bookingId, as }) => ({ url: `/bookings/${bookingId}/${as}`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [...live(id), { type: "Bookings", id }, "Wallet"],
    }),
    setBookingLink: b.mutation<ApiSuccess<Booking>, { id: string; bookingId: string; url: string }>({
      query: ({ bookingId, url }) => ({ url: `/bookings/${bookingId}/link`, method: "POST", body: { url } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Bookings", id }],
    }),

    // messages, researcher side
    getInbox: b.query<ApiSuccess<{ threads: Thread[]; unread: number }>, void>({ query: () => `/researchers/me/messages`, providesTags: ["Inbox"] }),
    getStudyThreads: b.query<ApiSuccess<Thread[]>, string>({ query: (id) => `/surveys/${id}/messages`, providesTags: ["Inbox"] }),
    getThread: b.query<ApiSuccess<ThreadView>, { id: string; participantId: string }>({
      query: ({ id, participantId }) => `/surveys/${id}/messages/${participantId}`,
      providesTags: ["Messages"],
      onQueryStarted: (_a, { dispatch, queryFulfilled }) => readMarksRead(dispatch, queryFulfilled),
    }),
    sendMessage: b.mutation<ApiSuccess<{ sent: number; broadcast: boolean }>, { id: string; to: string; body: string }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/messages`, method: "POST", body }),
      invalidatesTags: ["Messages", "Inbox"],
    }),

    // review (Stage 7)
    getReview: b.query<ApiSuccess<ReviewView>, string>({ query: (id) => `/surveys/${id}/review`, providesTags: (_r, _e, id) => [{ type: "Live", id }, "Review"] }),
    decide: b.mutation<ApiSuccess<{ decision: string; done: number; skipped: number; view: ReviewView }>, { id: string; ids: string[]; decision: "approve" | "reject"; reason?: RejectReason; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/review`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [...live(id), "Review", "Wallet"],
    }),
    saveAttendance: b.mutation<ApiSuccess<{ joined: number; missed: number }>, { id: string; joined: string[]; missed: string[] }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/attendance`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [...live(id), { type: "Bookings", id }, "Review", "Wallet"],
    }),
    getToReview: b.query<ApiSuccess<ToReviewRow[]>, void>({ query: () => `/researchers/me/to-review`, providesTags: ["Review"] }),

    // participant side
    getSlots: b.query<ApiSuccess<SlotsView>, string>({ query: (id) => `/surveys/${id}/slots`, providesTags: ["Bookings"] }),
    book: b.mutation<ApiSuccess<MyBooking>, { id: string; start: string; timeZone: string }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/book`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    cancelBooking: b.mutation<ApiSuccess<{ status: string }>, string>({ query: (bookingId) => ({ url: `/bookings/${bookingId}/cancel`, method: "POST" }), invalidatesTags: ["Bookings"] }),
    getMyBookings: b.query<ApiSuccess<MyBooking[]>, void>({ query: () => `/participants/me/bookings`, providesTags: ["Bookings"] }),
    getMyInbox: b.query<ApiSuccess<{ threads: ParticipantThread[]; unread: number }>, void>({ query: () => `/participants/me/messages`, providesTags: ["Inbox"] }),
    getMyThread: b.query<ApiSuccess<ParticipantThreadView>, string>({
      query: (surveyId) => `/participants/me/messages/${surveyId}`,
      providesTags: ["Messages"],
      onQueryStarted: (_a, { dispatch, queryFulfilled }) => readMarksRead(dispatch, queryFulfilled),
    }),
    replyAsParticipant: b.mutation<ApiSuccess<Message>, { surveyId: string; body: string }>({
      query: ({ surveyId, body }) => ({ url: `/participants/me/messages/${surveyId}`, method: "POST", body: { body } }),
      invalidatesTags: ["Messages", "Inbox"],
    }),
  }),
});

export const {
  useGetLiveQuery,
  useGetLiveParticipantsQuery,
  useSetPausedMutation,
  useSetCloseDateMutation,
  useCloseEarlyMutation,
  useAddPlacesMutation,
  useAddTimesMutation,
  useGetBookingsQuery,
  useMarkBookingMutation,
  useSetBookingLinkMutation,
  useGetInboxQuery,
  useGetStudyThreadsQuery,
  useGetThreadQuery,
  useSendMessageMutation,
  useGetSlotsQuery,
  useBookMutation,
  useCancelBookingMutation,
  useGetMyBookingsQuery,
  useGetMyInboxQuery,
  useGetMyThreadQuery,
  useReplyAsParticipantMutation,
  useGetReviewQuery,
  useDecideMutation,
  useSaveAttendanceMutation,
  useGetToReviewQuery,
} = runApi;
