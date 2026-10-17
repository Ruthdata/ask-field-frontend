import { Link } from "react-router-dom";
import type { HomeStudy } from "@/redux/api/homeApi";
import { formatMoney, methodById, studyLink } from "@/lib/study";

const STATUS_LABEL = { draft: "Draft", live: "Live", closed: "Closed" } as const;
const STAGE_LABEL: Record<string, string> = { "awaiting-payment": "Awaiting payment", checking: "In review", "changes-needed": "Changes needed", rejected: "Not approved" };
const STAGE_TEXT: Record<string, string> = { "awaiting-payment": "Waiting for your payment", checking: "We're checking it", "changes-needed": "We asked for a change", rejected: "Refunded" };

function progress(s: HomeStudy) {
  if (s.status === "draft" && s.stage && s.stage !== "none") return { text: STAGE_TEXT[s.stage], pct: 0 };
  if (s.status === "draft") return { text: s.missing.length ? `${s.missing.length} thing${s.missing.length === 1 ? "" : "s"} left before launch` : "Ready to launch", pct: 0 };
  const done = s.approved + s.toReview;
  const parts = [`${done} of ${s.places || "?"} done`];
  if (s.toReview) parts.push(`${s.toReview} to review`);
  if (s.status === "closed" && s.rejected) parts.push(`${s.rejected} rejected`);
  return { text: parts.join(" · "), pct: s.places ? Math.min(100, Math.round((done / s.places) * 100)) : 0 };
}

export default function StudiesTable({ studies, currency, label = "Your studies" }: { studies: HomeStudy[]; currency: string; label?: string }) {
  return (
    <div role="table" aria-label={label} className="ja-table">
      <div role="row" className="ja-tr head">
        <span role="columnheader">Study</span>
        <span role="columnheader">Method</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Progress</span>
        <span role="columnheader">Spent so far</span>
      </div>
      {studies.map((s) => {
        const p = progress(s);
        return (
          <Link role="row" key={s.surveyId} to={studyLink(s)} className="ja-tr">
            <span role="cell" className="nm">{s.name}</span>
            <span role="cell" className="meta">{methodById(s.method)?.label ?? "Survey"}</span>
            <span role="cell"><span className={`ja-pill ${s.status}`}>{s.status === "draft" && s.stage && s.stage !== "none" ? STAGE_LABEL[s.stage] : STATUS_LABEL[s.status]}</span></span>
            <span role="cell" className="ja-prog">
              <span>{p.text}</span>
              <span className="ja-bar" aria-hidden="true"><span style={{ width: `${p.pct}%`, background: s.status === "closed" ? "#c9c5d8" : undefined }} /></span>
            </span>
            <span role="cell" className="money">{s.spent ? formatMoney(s.spent, currency) : "—"}</span>
          </Link>
        );
      })}
    </div>
  );
}
