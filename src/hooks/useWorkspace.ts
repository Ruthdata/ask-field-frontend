import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { currentWorkspaceId, setWorkspace, useGetWorkspacesQuery, type Role, type Workspace } from "@/redux/api/accountApi";

/** Stage 9: the workspace the researcher is working in, and their role there. Falls back to their own. */
export function useWorkspace() {
  const dispatch = useDispatch();
  const { data } = useGetWorkspacesQuery();
  const list: Workspace[] = data?.data ?? [];
  const id = currentWorkspaceId();
  const current = list.find((w) => w.workspaceId === id) ?? list.find((w) => w.own) ?? null;
  const stale = Boolean(id && list.length && !list.some((w) => w.workspaceId === id));
  // Removed from a workspace (or it closed): go back to your own.
  useEffect(() => {
    if (stale) {
      setWorkspace(null);
      dispatch(apiSlice.util.resetApiState());
    }
  }, [stale, dispatch]);
  const role: Role = current?.role ?? "owner";
  return {
    list,
    current,
    role,
    canPay: role === "owner" || role === "admin",
    canEdit: role !== "viewer",
    switchTo: (w: Workspace) => {
      setWorkspace(w.own ? null : w.workspaceId);
      dispatch(apiSlice.util.resetApiState());
    },
  };
}
