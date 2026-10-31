import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetHomeQuery, type StudyStatus } from "@/redux/api/homeApi";
import StudiesTable from "@/components/researcher/StudiesTable";

const FILTERS: { id: "all" | StudyStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "closed", label: "Closed" },
];

/** Every study, from every project. */
export default function Studies() {
  const { data, isLoading, isError, refetch } = useGetHomeQuery();
  const [filter, setFilter] = useState<"all" | StudyStatus>("all");
  const h = data?.data;
  const deleted = (useLocation().state as { deleted?: string } | null)?.deleted;
  const [notice, setNotice] = useState(deleted ? `Draft “${deleted}” deleted.` : "");
  const shown = h ? h.studies.filter((s) => filter === "all" || s.status === filter) : [];

  return (
    <div className="ja-page">
      <div className="ja-row">
        <h1 className="ja-h1">Studies</h1>
        <Link to="/dashboard/researcher/new" className="ja-btn ink">+ New study</Link>
      </div>
      {notice && <div className="ja-card" role="status" style={{ padding: "14px 18px", borderRadius: 16, background: "#f0faf3", border: "1px solid #cfe9d6" }}>{notice}</div>}
      {isLoading && <div className="ja-skeleton" style={{ height: 280 }} aria-busy="true" />}
      {isError && <div className="ja-error" role="alert">We couldn't load your studies. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>}
      {h && (
        <>
          <div role="group" aria-label="Show" className="ja-chips">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="ja-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label} {f.id === "all" ? h.counts.total : h.counts[f.id]}
              </button>
            ))}
          </div>
          <section className="ja-card" aria-label="Studies list">
            {shown.length ? (
              <StudiesTable studies={shown} currency={h.money.currency} label="Studies" onNotice={setNotice} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", padding: "12px 4px" }}>
                <span style={{ fontWeight: 600 }}>{h.counts.total ? "Nothing here yet." : "No studies yet."}</span>
                <span className="ja-muted">{h.counts.total ? "Try another filter." : "Start one and it'll be saved as a draft as you go."}</span>
                {!h.counts.total && <Link to="/dashboard/researcher/new" className="ja-link">Start your first study →</Link>}
              </div>
            )}
          </section>
          <p className="ja-small">Studies you made inside projects are listed here too. <Link to="/dashboard/researcher/projects" style={{ color: "var(--ink)" }}>Projects</Link></p>
        </>
      )}
    </div>
  );
}
