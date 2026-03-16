// components/PublicRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const PublicRoute = () => {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/waitlist" replace />;
};

export default PublicRoute;