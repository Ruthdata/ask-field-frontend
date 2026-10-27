import { apiSlice } from "./slices/appSlice";
import { authApi as userApi } from "./slices/userSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { InstitutionVerification, Researcher } from "@/types/user.type";

export interface ProfilePayload {
  organizationType: string;
  organizationName: string;
  country: string;
  role?: string;
  researchAreas: string[];
  firstMethod?: string;
  heardFrom?: string;
}

export interface Pricing {
  platformFeeRate: number;
  academicFeeRate: number;
  minPayoutAmount: number;
  /** Hard floor: a study can't launch below this hourly pay (null = no floor). */
  minHourlyPay: number | null;
  /** The suggested hourly pay: a warning shows below it, and estimates start here. */
  recommendedHourlyPay?: number | null;
  currency: string;
}

/** Stage 2: account setup and institution verification (backend: /api/researchers/me/*). */
export const setupApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    saveProfile: b.mutation<ApiSuccess<{ user: Researcher; next: "verify" | "dashboard" }>, ProfilePayload>({
      query: (body) => ({ url: "/researchers/me/profile", method: "PUT", body }),
      // Put the saved account straight into the cache, so the next page never sees the old copy.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userApi.util.upsertQueryData("getResearcher", undefined, { success: true, message: "", data: data.data.user }));
        } catch {
          /* the page shows the error */
        }
      },
      invalidatesTags: ["Users"],
    }),
    sendWorkEmailCode: b.mutation<ApiSuccess<{ alreadyVerified: boolean; email?: string; academic?: boolean }>, { email: string }>({
      query: (body) => ({ url: "/researchers/me/verification/email", method: "POST", body }),
    }),
    confirmWorkEmail: b.mutation<ApiSuccess<{ user: Researcher; status: InstitutionVerification["status"] }>, { code: string }>({
      query: (body) => ({ url: "/researchers/me/verification/email/confirm", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    submitStaffLink: b.mutation<ApiSuccess<{ user: Researcher; status: InstitutionVerification["status"] }>, { url: string }>({
      query: (body) => ({ url: "/researchers/me/verification/link", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    getPricing: b.query<ApiSuccess<Pricing>, void>({
      query: () => "/pricing",
    }),
  }),
});

export const { useSaveProfileMutation, useSendWorkEmailCodeMutation, useConfirmWorkEmailMutation, useSubmitStaffLinkMutation, useGetPricingQuery } = setupApi;

export const ORG_TYPES = [
  { id: "university", label: "University or college", note: "Faculty, staff or students" },
  { id: "institute", label: "Research institute", note: "Independent or public" },
  { id: "company", label: "Company", note: "Product, UX, market or AI teams" },
  { id: "nonprofit", label: "Non-profit or NGO", note: "Foundations and charities" },
  { id: "government", label: "Government", note: "Agencies and public bodies" },
  { id: "independent", label: "Independent researcher", note: "On your own, no organisation" },
] as const;
export const VERIFIABLE = ["university", "institute", "nonprofit", "government"];

export const FIRST_METHODS = [
  { id: "survey", label: "Survey" },
  { id: "interview", label: "Interview" },
  { id: "focus-group", label: "Focus group" },
  { id: "product-test", label: "Product test" },
  { id: "ai-evaluation", label: "AI evaluation" },
  { id: "not-sure", label: "Not sure yet" },
];

export const ROLES = [
  "Professor or principal investigator",
  "Postdoctoral researcher",
  "PhD or master's student",
  "Research staff or assistant",
  "UX or product researcher",
  "Data or AI team",
  "Something else",
];

export const RESEARCH_AREAS = [
  "Psychology",
  "Public health",
  "Economics",
  "Political science",
  "Sociology",
  "Education",
  "UX and product",
  "AI and machine learning",
  "Marketing",
  "Something else",
];

export const HEARD_FROM = ["A colleague", "Search", "Social media", "A conference or talk", "An article or newsletter", "Something else"];
