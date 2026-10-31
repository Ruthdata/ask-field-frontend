import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";

export type StudyMethod = "survey" | "interview" | "focus-group" | "product-test" | "ai-evaluation";
export type StudyStatus = "draft" | "live" | "closed";

export interface HomeStudy {
  surveyId: string;
  projectId: string;
  name: string;
  method: StudyMethod;
  status: StudyStatus;
  places: number;
  approved: number;
  rejected: number;
  toReview: number;
  inProgress: number;
  spent: number;
  missing: string[];
  /** Stage 5: where a draft is in launching. */
  stage: "none" | "awaiting-payment" | "checking" | "changes-needed" | "rejected";
  funded: number;
  updatedAt: string;
  /** For the row's ⋯ menu. */
  paused?: boolean;
  heldByJoinStudy?: boolean;
  settled?: boolean;
}

export type NeedsYou =
  | { kind: "changes"; surveyId: string; projectId: string; name: string; count: number; note: string }
  | { kind: "review"; surveyId: string; projectId: string; name: string; count: number }
  | { kind: "draft"; surveyId: string; projectId: string; name: string; count: number; missing: string[] };

export interface HomeSummary {
  firstName: string;
  account: {
    setupComplete: boolean;
    organizationName: string;
    organizationType: string;
    firstMethod: string;
    verification: "none" | "pending" | "verified" | "rejected";
    feeRate: number;
  };
  counts: { total: number; draft: number; live: number; closed: number };
  studies: HomeStudy[];
  needsYou: NeedsYou[];
  money: { paid: number; held: number; credit: number; currency: string };
  founding: "none" | "applied" | "dismissed";
}

export interface StartStudyPayload {
  method: StudyMethod;
  surveyName?: string;
  /** Put it in this project instead of "My studies". */
  projectId?: string;
  estimate?: { participants: number; minutes: number; ratePerHour: number };
}

/** Stage 3: the researcher home (backend: GET /api/researchers/me/home), starting a study, and the founding-lab card. */
export const homeApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getHome: b.query<ApiSuccess<HomeSummary>, void>({
      query: () => "/researchers/me/home",
      providesTags: ["Surveys", "Researchers", "Wallet", "Users"],
    }),
    startStudy: b.mutation<ApiSuccess<{ surveyId: string; projectId: string }>, StartStudyPayload>({
      query: (body) => ({ url: "/surveys/start", method: "POST", body }),
      invalidatesTags: ["Surveys", "Projects"],
    }),
    foundingLab: b.mutation<ApiSuccess<{ status: HomeSummary["founding"] }>, { action: "apply" | "dismiss" }>({
      query: (body) => ({ url: "/researchers/me/founding-lab", method: "POST", body }),
      invalidatesTags: ["Researchers"],
    }),
  }),
});

export const { useGetHomeQuery, useStartStudyMutation, useFoundingLabMutation } = homeApi;
