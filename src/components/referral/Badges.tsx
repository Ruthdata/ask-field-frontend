import "@/styles/referral.css";
import type { ResearcherBadge } from "@/redux/api/participantApi";

const LABEL: Record<ResearcherBadge, { text: string; title: string }> = {
  "founding-lab": { text: "Founding lab", title: "One of the first research teams on joinStudy" },
  "trusted-researcher": { text: "Trusted researcher", title: "Brought another researcher to joinStudy who ran a study" },
};

/** Badges next to a researcher's name on study cards and pages (Refer a friend). */
export default function ResearcherBadges({ badges }: { badges?: ResearcherBadge[] }) {
  if (!badges?.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5 align-middle">
      {badges.map((b) => (
        <span key={b} className={`ref-badge${b === "trusted-researcher" ? " light" : ""}`} style={{ height: 24, fontSize: 12 }} title={LABEL[b].title}>
          {b === "founding-lab" ? "◆" : "★"} {LABEL[b].text}
        </span>
      ))}
    </span>
  );
}
