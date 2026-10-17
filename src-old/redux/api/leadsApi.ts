import { apiSlice } from "./slices/appSlice";
import { ApiSuccess } from "@/types/api.type";

export type LeadType = "waitlist" | "founding-lab" | "request-country" | "ai-pilot";

export interface LeadPayload {
  type: LeadType;
  email: string;
  name?: string;
  organization?: string;
  role?: string;
  country?: string;
  message?: string;
  source?: string;
  details?: Record<string, string | number | boolean>;
}

export const leadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitLead: builder.mutation<ApiSuccess<{ type: LeadType; email: string }>, LeadPayload>({
      query: (body) => ({ url: "/leads", method: "POST", body }),
    }),
  }),
});

export const { useSubmitLeadMutation } = leadsApi;
