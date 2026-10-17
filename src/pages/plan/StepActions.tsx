import { Link } from "react-router-dom";

export function StepActions({ onNext, busy, back, nextLabel = "Save and continue" }: { onNext: () => void; busy?: boolean; back?: string; nextLabel?: string }) {
  return (
    <div className="jp-actions">
      <button type="button" className="jp-btn" onClick={onNext} disabled={busy}>{nextLabel} →</button>
      {back && <Link className="jp-btn2" to={back}>Back</Link>}
      <span className="jp-hint">Saved as you go.</span>
    </div>
  );
}
