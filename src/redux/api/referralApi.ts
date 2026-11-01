import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";

/** Refer a friend (backend: /api/referrals/*, /api/researchers/me/referrals, /api/participants/me/referrals). */

export interface Invite {
  code: string;
  type: "researcher" | "participant";
  firstName: string;
  organization: string;
  offer: string;
}

export type FriendStatus = "joined" | "qualified" | "not-eligible";

export interface ResearcherReferrals {
  on: true;
  code: string;
  link: string;
  currency: string;
  terms: { share: number; windowDays: number; friendCap: number; yearCap: number; creditMonths: number; friendFeeRate: number; standardFeeRate: number };
  friends: { name: string; joinedAt: string; status: FriendStatus; earned: number; windowEnds: string | null }[];
  totals: { invited: number; paid: number; earned: number; thisYear: number; available: number; nextExpiry: { amount: number; at: string } | null };
  trusted: boolean;
  cardHidden: boolean;
}

export type Waitlist = { status: "active" } | { status: "waiting"; country: string; position: number; total: number; score: number; since: string };

export interface ParticipantReferrals {
  on: true;
  code: string;
  link: string;
  currency: string;
  reward: { amount: number; afterStudies: number } | null;
  friends: { name: string; joinedAt: string; status: FriendStatus; rewarded: boolean }[];
  totals: { invited: number; verified: number };
  trustedMember: boolean;
  waitlist: Waitlist;
}

type Off = { on: false };

export const referralApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    lookupInvite: b.query<ApiSuccess<Invite>, string>({
      query: (code) => `/referrals/code/${encodeURIComponent(code)}`,
    }),
    getMyReferrals: b.query<ApiSuccess<ResearcherReferrals | Off>, void>({
      query: () => "/researchers/me/referrals",
      providesTags: ["Referrals"],
    }),
    hideReferralCard: b.mutation<ApiSuccess<{ hidden: true }>, void>({
      query: () => ({ url: "/researchers/me/referrals/hide-card", method: "POST" }),
      invalidatesTags: ["Referrals", "Researchers"],
    }),
    getParticipantReferrals: b.query<ApiSuccess<ParticipantReferrals | Off>, void>({
      query: () => "/participants/me/referrals",
      providesTags: ["Referrals"],
    }),
  }),
});

export const { useLookupInviteQuery, useGetMyReferralsQuery, useHideReferralCardMutation, useGetParticipantReferralsQuery } = referralApi;
