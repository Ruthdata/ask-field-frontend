import { apiSlice } from "./slices/appSlice";
import type { ApiSuccess } from "@/types/api.type";
import type { Receipt } from "./launchApi";
import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { apiHeaders } from "@/utils/token";

/** Stage 9: workspaces and team, your own settings, and the workspace's billing details. */

export type Role = "owner" | "admin" | "researcher" | "viewer";
export interface Workspace { workspaceId: string; name: string; role: Role; own: boolean; ownerName?: string }
export interface Member { membershipId: string | null; researcherId: string; name: string; email: string; role: Role; you: boolean }
export interface Invite { membershipId: string; email: string; role: Role; invitedAt: string; expiresAt: string; expired: boolean }
export interface TeamView { workspaceId: string; name: string; myRole: Role; canManage: boolean; members: Member[]; invites: Invite[] }
export interface InviteInfo { workspace: string; inviter: string; email: string; role: Role; roleNote: string; expiresAt: string; hasAccount: boolean }
export type EmailPrefs = { bookings: boolean; messages: boolean; review: boolean; finish: boolean; news: boolean };
export interface AccountSettings {
  firstName: string;
  lastName: string;
  email: string;
  pendingEmail: string | null;
  hasPassword: boolean;
  emailPrefs: EmailPrefs;
  organization: { name: string; type: string; country: string; verification: string };
}
export interface CloseCheck { canClose: boolean; reasons: string[]; credit: number }
export type BillingDetails = Receipt & { saved: boolean };

export const accountApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getWorkspaces: b.query<ApiSuccess<Workspace[]>, void>({ query: () => `/researchers/me/workspaces`, providesTags: ["Team"] }),
    getTeam: b.query<ApiSuccess<TeamView>, void>({ query: () => `/researchers/me/team`, providesTags: ["Team"] }),
    invite: b.mutation<ApiSuccess<TeamView>, { email: string; role: Role }>({ query: (body) => ({ url: `/team/invites`, method: "POST", body }), invalidatesTags: ["Team"] }),
    resendInvite: b.mutation<ApiSuccess<{ sent: boolean }>, string>({ query: (id) => ({ url: `/team/invites/${id}/resend`, method: "POST" }), invalidatesTags: ["Team"] }),
    changeRole: b.mutation<ApiSuccess<unknown>, { id: string; role: Role }>({ query: ({ id, role }) => ({ url: `/team/members/${id}`, method: "PUT", body: { role } }), invalidatesTags: ["Team"] }),
    removeMember: b.mutation<ApiSuccess<unknown>, string>({ query: (id) => ({ url: `/team/members/${id}`, method: "DELETE" }), invalidatesTags: ["Team"] }),
    leaveWorkspace: b.mutation<ApiSuccess<unknown>, string>({ query: (workspaceId) => ({ url: `/team/leave/${workspaceId}`, method: "POST" }), invalidatesTags: ["Team"] }),
    getInvite: b.query<ApiSuccess<InviteInfo>, string>({ query: (token) => `/team/invite/${token}` }),
    acceptInvite: b.mutation<ApiSuccess<{ workspaceId: string; name: string; role: Role }>, string>({ query: (token) => ({ url: `/team/invite/${token}/accept`, method: "POST" }), invalidatesTags: ["Team"] }),

    getAccount: b.query<ApiSuccess<AccountSettings>, void>({ query: () => `/researchers/me/account`, providesTags: ["Account"] }),
    updateName: b.mutation<ApiSuccess<AccountSettings>, { firstName: string; lastName: string }>({ query: (body) => ({ url: `/researchers/me/account`, method: "PUT", body }), invalidatesTags: ["Account", "Researchers"] }),
    changeEmail: b.mutation<ApiSuccess<AccountSettings>, { email: string; password?: string }>({ query: (body) => ({ url: `/researchers/me/email`, method: "POST", body }), invalidatesTags: ["Account"] }),
    confirmEmail: b.mutation<ApiSuccess<{ email: string }>, string>({ query: (token) => ({ url: `/researchers/email/confirm`, method: "POST", body: { token } }), invalidatesTags: ["Account", "Researchers"] }),
    changePassword: b.mutation<ApiSuccess<{ accessToken: string; refreshToken: string }>, { current?: string; next: string }>({ query: (body) => ({ url: `/researchers/me/password`, method: "POST", body }) }),
    setEmailPrefs: b.mutation<ApiSuccess<AccountSettings>, Partial<EmailPrefs>>({ query: (body) => ({ url: `/researchers/me/email-prefs`, method: "PUT", body }), invalidatesTags: ["Account"] }),
    getCloseCheck: b.query<ApiSuccess<CloseCheck>, void>({ query: () => `/researchers/me/close`, providesTags: ["Account"] }),
    closeAccount: b.mutation<ApiSuccess<{ closed: boolean }>, { confirm: string; password?: string }>({ query: (body) => ({ url: `/researchers/me/close`, method: "POST", body }) }),

    getBilling: b.query<ApiSuccess<BillingDetails>, void>({ query: () => `/researchers/me/billing`, providesTags: ["Account"] }),
    saveBilling: b.mutation<ApiSuccess<BillingDetails>, Receipt>({ query: (body) => ({ url: `/researchers/me/billing`, method: "PUT", body }), invalidatesTags: ["Account"] }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetTeamQuery,
  useInviteMutation,
  useResendInviteMutation,
  useChangeRoleMutation,
  useRemoveMemberMutation,
  useLeaveWorkspaceMutation,
  useGetInviteQuery,
  useAcceptInviteMutation,
  useGetAccountQuery,
  useUpdateNameMutation,
  useChangeEmailMutation,
  useConfirmEmailMutation,
  useChangePasswordMutation,
  useSetEmailPrefsMutation,
  useGetCloseCheckQuery,
  useCloseAccountMutation,
  useGetBillingQuery,
  useSaveBillingMutation,
} = accountApi;

/** The workspace the app is working in: another researcher's id, or empty for your own. */
export const currentWorkspaceId = () => String(storage.get(STORAGE_KEYS.WORKSPACE) || "");
export function setWorkspace(id: string | null) {
  if (id) storage.set(STORAGE_KEYS.WORKSPACE, id);
  else storage.remove(STORAGE_KEYS.WORKSPACE);
}

/** Downloads a year's payments as CSV. */
export async function downloadPayments(year: number) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/researchers/me/payments.csv?year=${year}`, { headers: apiHeaders() });
  if (!res.ok) throw new Error("We couldn't make the file. Try again.");
  const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "")?.[1] || `joinstudy-payments-${year}.csv`;
  const url = URL.createObjectURL(await res.blob());
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
