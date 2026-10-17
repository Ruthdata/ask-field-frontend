import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, getUserType } from "../utils/auth";

interface ProtectedRouteProps {
  requiredRole?: "researcher" | "participant";
}

/** Not signed in (or signed in as the other account type) → the one sign-in page, then back here. */
const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { pathname, search } = useLocation();
  const back = `next=${encodeURIComponent(pathname + search)}${requiredRole ? `&intent=${requiredRole}` : ""}`;

  if (!isAuthenticated() || (requiredRole && getUserType() !== requiredRole)) {
    return <Navigate to={`/sign-in?${back}`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
