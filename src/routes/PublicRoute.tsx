// components/PublicRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const PublicRoute = () => {
  const location = useLocation()
  
  if (location.pathname === "/auth/verify-email") {
    return <Outlet />;
  }

  return !isAuthenticated() ? <Outlet /> : <Navigate to="/waitlist" replace />;
};

export default PublicRoute;