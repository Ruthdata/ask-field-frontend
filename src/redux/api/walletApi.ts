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


export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getParticipantEarnings: builder.query<ApiSuccess<ParticipantEarnings>, void>({
      query: () => "/participants/earnings",
      providesTags: ["Wallet"],
    }),
    getResearcherWallet: builder.query<ApiSuccess<ResearcherWallet>, void>({
      query: () => "/researchers/wallet",
      providesTags: ["Wallet"],
    }),
  }),
});

export const {
  useGetParticipantEarningsQuery,
  useGetResearcherWalletQuery,
} = walletApi;
