import "@/styles/referral.css";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLookupInviteQuery } from "@/redux/api/referralApi";
import { readInvite, saveInvite } from "@/lib/referral";

/**
 * "Invited by Ada (University of Florida)" on the sign-up pages, from a /r/:code link or ?ref=.
 * Shows nothing when there's no invite, the code isn't valid, or it's for the other kind of account.
 */
export default function InvitedBanner({ type, tone = "light" }: { type: "researcher" | "participant"; tone?: "light" | "dark" }) {
  const [params] = useSearchParams();
  const invite = readInvite(params.get("ref"));
  const { data } = useLookupInviteQuery(invite?.code ?? "", { skip: !invite?.code });
  const i = data?.data;
  useEffect(() => {
    if (i && params.get("ref")) saveInvite(i.code, i.type);
  }, [i, params]);
  if (!i || i.type !== type) return null;
  return (
    <div className="ref-banner" data-tone={tone} role="note">
      <span className="ref-banner-dot" aria-hidden="true">{i.firstName.slice(0, 1).toUpperCase()}</span>
      <span>
        <b>{i.firstName}</b>
        {i.organization ? ` (${i.organization})` : ""} invited you.
        <span className="ref-banner-offer">{i.offer}</span>
      </span>
    </div>
  );
}
