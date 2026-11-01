import "@/styles/referral.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useHideReferralCardMutation } from "@/redux/api/referralApi";
import { formatMoney, percent } from "@/lib/study";

type Offer = { friendFeeRate: number; share: number; friendCap: number };

/**
 * Refer a friend on the researcher home. "Not now" hides it for good (saved on the account).
 * `variant="live"`: the prompt after a study goes live (not hideable; it only shows on that page).
 */
export default function ReferCard({ offer, currency, variant = "home" }: { offer: Offer; currency: string; variant?: "home" | "live" }) {
  const [hidden, setHidden] = useState(false);
  const [hide] = useHideReferralCardMutation();
  if (hidden) return null;
  const live = variant === "live";
  return (
    <section aria-labelledby={`refer-${variant}`} className="ja-card sun" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "14px 24px" }}>
      <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 id={`refer-${variant}`} style={{ fontFamily: "var(--body)", fontWeight: 600, fontSize: 17, letterSpacing: 0 }}>
          {live ? "Know someone who'd use joinStudy?" : "Refer a researcher, earn credit"}
        </h2>
        <span className="ja-muted" style={{ fontSize: 15 }}>
          Their first study is at the {percent(offer.friendFeeRate)} fee. You get {percent(offer.share)} of their fees as credit, up to {formatMoney(offer.friendCap, currency)} per friend.
        </span>
      </div>
      <Link to="/dashboard/researcher/refer" className="ja-btn ink" style={{ textDecoration: "none" }}>Get your link</Link>
      {!live && (
        <button type="button" className="ja-link" style={{ fontWeight: 400, alignSelf: "center" }} onClick={() => { setHidden(true); hide(); }}>
          Not now
        </button>
      )}
    </section>
  );
}
