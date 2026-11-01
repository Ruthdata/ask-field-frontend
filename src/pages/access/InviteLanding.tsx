import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLookupInviteQuery } from "@/redux/api/referralApi";
import { saveInvite } from "@/lib/referral";
import { dashboardPath } from "@/lib/site";

/** /r/:code: remembers the invite, then opens the right sign-up page. A link that isn't valid goes to the homepage. */
export default function InviteLanding() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { data, isError } = useLookupInviteQuery(code, { skip: !code });
  useEffect(() => {
    const signedIn = dashboardPath();
    if (signedIn) {
      navigate(signedIn, { replace: true });
      return;
    }
    if (isError || !code) {
      navigate("/", { replace: true });
      return;
    }
    const i = data?.data;
    if (!i) return;
    saveInvite(i.code, i.type);
    navigate(i.type === "researcher" ? `/auth/sign-up/researcher?ref=${i.code}&source=referral` : `/participate?ref=${i.code}`, { replace: true });
  }, [data, isError, code, navigate]);
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", color: "#4b4664" }} aria-busy="true">
      Opening your invite…
    </div>
  );
}
