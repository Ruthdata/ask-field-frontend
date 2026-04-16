import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, getUserType } from "../utils/auth";

const PublicRoute = () => {
  const location = useLocation();

  if (
    location.pathname === "/auth/verify-email" ||
    location.pathname === "/auth/researcher/verify-email"
  ) {
    return <Outlet />;
  }

  if (isAuthenticated()) {
    const userType = getUserType();
    // Redirect to the correct dashboard based on role
    return (
      <Navigate
        to={userType === "researcher" ? "/dashboard/researcher" : "/waitlist"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicRoute;
