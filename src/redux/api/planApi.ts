import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { StudyMethod } from "./homeApi";

export type PlanStep = "basics" | "audience" | "setup" | "pay";

export interface Question { text: string; answers: { text: string; qualifies: boolean }[] }
export interface Plan {
  basics?: {
    title?: string; internalName?: string; description?: string; sensitive?: boolean; warning?: string;
    consent?: { mode: "joinstudy" | "own"; text: string };
    ethics?: { body: string; reference: string };
  };
  audience?: {
    countries?: string[]; includeDiaspora?: boolean; minAge?: number; maxAge?: number; genders?: string[]; languages?: string[];
    education?: string; employment?: string; students?: string; questions?: Question[];
    quota?: { by: "gender" | "language"; groups: { value: string; places: number }[] } | null;
  };
  setup?: Record<string, unknown>;
  pay?: { perPerson?: number; places?: number; opens?: "approved" | "date"; opensAt?: string | null; closes?: "full" | "date"; closesAt?: string | null; review?: "manual" | "auto" };
}

export interface PlanView {
  surveyId: string;
  projectId: string;
  method: StudyMethod;
  status: "draft" | "live" | "closed";
  /** Stage 5: where it is in launching. */
  launchStage: "none" | "awaiting-payment" | "checking" | "changes-needed" | "rejected";
  name: string;
  plan: Plan;
  missing: Record<PlanStep, string[]>;
  done: Record<PlanStep, boolean>;
  ready: boolean;
  returnLink: string | null;
  figures: { places: number; minutes: number; perPerson: number; hourly: number; feeRate: number; pay: number; fee: number; total: number; currency: string };
  minHourlyPay: number | null;
  organization: { name: string; verified: boolean };
  fields?: Record<string, string>;
}

/** Stage 4: the study planner (backend: /api/surveys/:id/plan…). */
export const planApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getPlan: b.query<ApiSuccess<PlanView>, string>({
      query: (id) => `/surveys/${id}/plan`,
      providesTags: (_r, _e, id) => [{ type: "Surveys", id }],
    }),
    getMatchCount: b.query<ApiSuccess<{ count: number; total: number }>, { id: string; v: number }>({
      query: ({ id }) => `/surveys/${id}/plan/match`,
    }),
    savePlanStep: b.mutation<ApiSuccess<PlanView>, { id: string; step: PlanStep; data: Record<string, unknown>; final?: boolean }>({
      query: ({ id, step, data, final }) => ({ url: `/surveys/${id}/plan/${step}`, method: "PUT", body: { data, final: !!final } }),
      // Keep the planner's copy current without a refetch (the summary column reads it).
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(planApi.util.upsertQueryData("getPlan", id, data));
        } catch (err) {
          const view = (err as { error?: { data?: { data?: { view?: PlanView } } } })?.error?.data?.data?.view;
          if (view) dispatch(planApi.util.upsertQueryData("getPlan", id, { success: true, message: "", data: view }));
        }
      },
      invalidatesTags: ["Researchers"],
    }),
    // ---------- participants ----------
    screenForStudy: b.mutation<ApiSuccess<{ surveyActionId: string; status: string }>, { id: string; answers: number[] }>({
      query: ({ id, answers }) => ({ url: `/surveys/${id}/screen`, method: "POST", body: { answers } }),
    }),
    studyStartLink: b.mutation<ApiSuccess<{ url: string; surveyActionId: string; book?: boolean }>, { id: string; consent: boolean }>({
      query: ({ id, consent }) => ({ url: `/surveys/${id}/start-link`, method: "POST", body: { consent } }),
    }),
    finishByCode: b.mutation<ApiSuccess<{ status: string }>, string>({
      query: (code) => ({ url: `/surveys/done/${encodeURIComponent(code)}`, method: "POST" }),
      invalidatesTags: ["Surveys", "Wallet"],
    }),
  }),
});

export const {
  useGetPlanQuery,
  useGetMatchCountQuery,
  useSavePlanStepMutation,
  useScreenForStudyMutation,
  useStudyStartLinkMutation,
  useFinishByCodeMutation,
} = planApi;
