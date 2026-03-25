import DashboardSection from "@components/Dashboard/DashboardSection";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// skipCompleteProfileRedirect

const ParticipantDashboardHome = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const skipRedirect =
      searchParams.get("skipCompleteProfileRedirect") === "true";

    if (skipRedirect) {
      // Remove the query param to prevent loop
      const url = window.location.href.replace(
        "?skipCompleteProfileRedirect=true",
        ""
      );
      window.location.replace(url);
    }
  }, []);

  return (
    <div>
      <DashboardSection />
    </div>
  );
};

export default ParticipantDashboardHome;
