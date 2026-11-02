import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { PlanView } from "./planApi";
import { apiHeaders } from "@/utils/token";

/** ready = paid, waiting for the researcher to click "Publish now". */
export type LaunchStage = "none" | "awaiting-payment" | "checking" | "changes-needed" | "ready" | "rejected";
export interface Funding {
  fundingId: string;
  method: "card" | "invoice" | "credit";
  status: "pending" | "paid" | "cancelled" | "refunded";
  amount: number;
  creditUsed: number;
  currency: string;
  number?: string;
  providerRef?: string;
  cardLast4?: string;
  paidAt?: string;
  createdAt: string;
  title?: string;
  paidByName?: string; // Stage 9: who in the workspace paid
}
export interface LaunchView extends PlanView {
  launchStage: LaunchStage;
  review: { checks: { key: string; label: string; ok: boolean; note: string }[]; note: string; requestedAt: string | null; decidedAt: string | null };
  fundings: Funding[];
  paidIn: number;
  due: number;
  credit: number;
  payments: { cards: "stripe" | "test" | "unavailable"; publishableKey: string | null; invoices: boolean; /** joinStudy checks a paid study before it can be published (REVIEW_BEFORE_PUBLISH). */ reviewBeforePublish?: boolean };
  /** Ticked at checkout: go live as soon as the payment arrives. */
  publishWhenPaid?: boolean;
  readyAt?: string | null;
  /** The closing date has passed: change it before publishing. */
  closingPassed?: boolean;
}
export interface Receipt { name: string; organization: string; email: string; cc: string; reference: string; country: string }
export type PayResult =
  | { fundingId: string; status: "pending"; method: "card"; provider: "stripe" | "test"; clientSecret: string; publishableKey: string | null; amount: number; currency: string }
  | { fundingId: string; status: "pending"; method: "invoice"; number: string; reference: string; amount: number; currency: string }
  | { fundingId: string | null; status: "paid" | "checking" | "ready" | "live"; method: "credit" | null };

/** Stage 5: fund and launch (backend: /api/surveys/:id/launch…, /api/billing…). */
export const launchApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getLaunch: b.query<ApiSuccess<LaunchView>, string>({
      query: (id) => `/surveys/${id}/launch`,
      providesTags: (_r, _e, id) => [{ type: "Surveys", id }],
    }),
    payForStudy: b.mutation<ApiSuccess<PayResult>, { id: string; method: "card" | "invoice"; useCredit: boolean; agree: boolean; receipt: Receipt; publishWhenPaid?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/surveys/${id}/launch/pay`, method: "POST", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Surveys", id }, "Researchers"],
    }),
    confirmTestPayment: b.mutation<ApiSuccess<{ status: string }>, { fundingId: string; id: string }>({
      query: ({ fundingId }) => ({ url: `/billing/test-confirm/${fundingId}`, method: "POST" }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Surveys", id }, "Researchers", "Wallet"],
    }),
    resubmitStudy: b.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({ url: `/surveys/${id}/launch/resubmit`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Surveys", id }, "Researchers"],
    }),
    publishStudy: b.mutation<ApiSuccess<LaunchView>, string>({
      query: (id) => ({ url: `/surveys/${id}/launch/publish`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Surveys", id }, "Surveys", "Researchers"],
    }),
    refundStudy: b.mutation<ApiSuccess<LaunchView>, string>({
      query: (id) => ({ url: `/surveys/${id}/launch/refund`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Surveys", id }, "Surveys", "Researchers", "Wallet"],
    }),
    cancelInvoice: b.mutation<ApiSuccess<LaunchView>, string>({
      query: (id) => ({ url: `/surveys/${id}/launch/cancel-invoice`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Surveys", id }, "Researchers"],
    }),
  }),
});

export const { useGetLaunchQuery, usePayForStudyMutation, useConfirmTestPaymentMutation, useResubmitStudyMutation, useCancelInvoiceMutation, usePublishStudyMutation, useRefundStudyMutation } = launchApi;

/** Opens a receipt or invoice in a new tab (it needs the sign-in token, so it's fetched, not linked). */
export async function openFundingDocument(fundingId: string) {
  const w = window.open("", "_blank");
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/billing/fundings/${fundingId}/document`, {
      headers: apiHeaders(),
    });
    const html = await res.text();
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  } catch {
    w?.close();
  }
}
