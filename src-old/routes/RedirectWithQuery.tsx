import { Navigate, useLocation } from "react-router-dom";

/** Sends an old address to its Stage 1 replacement, keeping the query string (email, token, next…). */
export default function RedirectWithQuery({ to, add }: { to: string; add?: Record<string, string> }) {
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  for (const [k, v] of Object.entries(add ?? {})) if (!q.has(k)) q.set(k, v);
  const s = q.toString();
  return <Navigate to={`${to}${s ? `?${s}` : ""}`} replace />;
}
