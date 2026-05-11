import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserType } from "../utils/auth";

interface ProtectedRouteProps {
  requiredRole?: "researcher" | "participant";
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login/participant" replace />;
  }

  if (requiredRole && getUserType() !== requiredRole) {
    return <Navigate to={`/auth/login/${requiredRole}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
