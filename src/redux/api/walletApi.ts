import { apiSlice } from "./slices/appSlice";
import { ApiSuccess } from "@/types/api.type";

export type LedgerKind = "earning" | "payout" | "charge" | "funding" | "credit" | "credit-used";
export type LedgerStatus = "pending" | "available" | "processing" | "paid" | "cancelled" | "failed" | "refunded";

export interface LedgerLine {
  _id: string;
  kind: LedgerKind;
  status: LedgerStatus;
  amount: number;
  fee?: number;
  currency: string;
  title: string;
  description?: string;
  surveyId?: string;
  surveyActionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantEarnings {
  currency: string;
  pending: number;
  available: number;
  processing: number;
  paidOut: number;
  totalEarned: number;
  minPayout: number;
  completedStudies: number;
  transactions: LedgerLine[];
}

export interface ResearcherWallet {
  currency: string;
  spent: number;
  feeRate: number;
  /** Stage 5: money back from closed studies, to use on the next one. */
  credit: number;
  /** Stage 5: payments made for studies (card, invoice or credit). */
  fundings: import("./launchApi").Funding[];
  transactions: LedgerLine[];
}

export interface PayoutDetails {
  method: "bank_transfer" | "mobile_money" | "paypal";
  bankName?: string;
  accountName: string;
  accountNumber: string;
}

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getParticipantEarnings: builder.query<ApiSuccess<ParticipantEarnings>, void>({
      query: () => "/participants/earnings",
      providesTags: ["Wallet"],
    }),
    savePayoutDetails: builder.mutation<ApiSuccess<unknown>, PayoutDetails>({
      query: (body) => ({ url: "/participants/payout-details", method: "PUT", body }),
      invalidatesTags: ["Wallet", "Users"],
    }),
    requestPayout: builder.mutation<ApiSuccess<LedgerLine>, { amount?: number }>({
      query: (body) => ({ url: "/participants/payouts", method: "POST", body }),
      invalidatesTags: ["Wallet"],
    }),
    getResearcherWallet: builder.query<ApiSuccess<ResearcherWallet>, void>({
      query: () => "/researchers/wallet",
      providesTags: ["Wallet"],
    }),
  }),
});

export const {
  useGetParticipantEarningsQuery,
  useSavePayoutDetailsMutation,
  useRequestPayoutMutation,
  useGetResearcherWalletQuery,
} = walletApi;
