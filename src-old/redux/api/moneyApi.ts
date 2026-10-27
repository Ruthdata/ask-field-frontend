import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import { apiHeaders } from "@/utils/token";

/** Participant Stage 6: get paid (see the "joinStudy Participant Flow" canvas, 6.1–6.4). */

export type PayoutMethod = "bank" | "mobile-money" | "airtime" | "paypal";
export interface MethodOption {
  method: PayoutMethod;
  label: string;
  note: string;
  institutionLabel: string | null;
  institutions: string[];
  accountLabel: string;
  accountHint: string;
}
export interface SavedMethod { method: PayoutMethod; institution: string; last4: string; accountName: string; savedAt: string }
export interface PayoutMethodView { country: string; currency: string | null; options: MethodOption[]; current: SavedMethod | null; holdUntil: string | null }
export type MoneyLine =
  | { id: string; kind: "earning"; title: string; surveyId: string | null; amount: number; currency: string; at: string }
  | { id: string; kind: "payout"; title: string; status: "sending" | "sent" | "failed"; amount: number; currency: string; localAmount: number | null; localCurrency: string | null; reason: string; reference: string; at: string };
export interface MoneyView {
  currency: string;
  ready: number;
  waiting: number;
  waitingCount: number;
  onWay: number;
  minPayout: number;
  localCurrency: string | null;
  method: SavedMethod | null;
  holdUntil: string | null;
  airtimeMax: number;
  lines: MoneyLine[];
}
export interface Quote { quoteId: string; amount: number; currency: string; rate: number; localAmount: number; localCurrency: string; fee: number; expiresAt: string; to: SavedMethod }
export interface PayoutStatus {
  id: string;
  status: "sending" | "sent" | "failed";
  amount: number;
  currency: string;
  localAmount: number | null;
  localCurrency: string | null;
  rate: number | null;
  to: { method: PayoutMethod; institution: string; last4: string };
  reference: string;
  requestedAt: string;
  sentAt: string | null;
  failedAt: string | null;
  reason: string;
}

export const moneyApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getMoney: b.query<ApiSuccess<MoneyView>, void>({ query: () => "/participants/me/money", providesTags: ["Wallet"] }),
    getPayoutMethod: b.query<ApiSuccess<PayoutMethodView>, void>({ query: () => "/participants/me/payout-method", providesTags: ["Wallet"] }),
    savePayoutMethod: b.mutation<ApiSuccess<PayoutMethodView>, { method: PayoutMethod; institution?: string; account: string }>({
      query: (body) => ({ url: "/participants/me/payout-method", method: "PUT", body }),
      invalidatesTags: ["Wallet"],
    }),
    quotePayout: b.mutation<ApiSuccess<Quote>, { amount?: number }>({ query: (body) => ({ url: "/participants/me/payouts/quote", method: "POST", body }) }),
    cashOut: b.mutation<ApiSuccess<PayoutStatus>, { quoteId: string }>({
      query: (body) => ({ url: "/participants/me/payouts", method: "POST", body }),
      invalidatesTags: ["Wallet", "Studies"],
    }),
    getPayout: b.query<ApiSuccess<PayoutStatus>, string>({ query: (id) => `/participants/me/payouts/${id}`, providesTags: ["Wallet"] }),
  }),
});

export const { useGetMoneyQuery, useGetPayoutMethodQuery, useSavePayoutMethodMutation, useQuotePayoutMutation, useCashOutMutation, useGetPayoutQuery } = moneyApi;

/** Downloads every study paid and every cash-out as CSV. */
export async function downloadStatement() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/participants/me/statement.csv`, { headers: apiHeaders() });
  if (!res.ok) throw new Error("We couldn't make the file. Try again.");
  const url = URL.createObjectURL(await res.blob());
  Object.assign(document.createElement("a"), { href: url, download: "joinstudy-statement.csv" }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
