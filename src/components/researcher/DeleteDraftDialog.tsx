import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDeleteDraftStudyMutation } from "@/redux/api/planApi";
import { readProblem } from "@/lib/session";

/**
 * "Delete this draft?" Used by the planner and by a study's ⋯ menu. Only drafts that were never paid for can be
 * deleted; the server says why when one can't (an invoice waiting, already paid...).
 */
export default function DeleteDraftDialog({ id, title, onClose, onDeleted }: { id: string; title: string; onClose: () => void; onDeleted?: () => void }) {
  const [problem, setProblem] = useState("");
  const [del, { isLoading }] = useDeleteDraftStudyMutation();
  const navigate = useNavigate();
  const keep = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    keep.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = async () => {
    setProblem("");
    try {
      await del(id).unwrap();
      if (onDeleted) onDeleted();
      else navigate("/dashboard/researcher/studies", { replace: true, state: { deleted: title } });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };

  return createPortal(
    <div style={DD.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dd-h" aria-describedby="dd-p" style={DD.box}>
        <h2 id="dd-h" style={DD.h}>Delete this draft?</h2>
        <p id="dd-p" style={DD.p}>
          “{title}” and everything you've planned for it will be deleted. This can't be undone. Nothing has been paid, so there's nothing to refund.
        </p>
        {problem && <p role="alert" style={{ ...DD.p, color: "#9a3412", background: "#fff4ed", padding: "10px 12px", borderRadius: 12 }}>{problem}</p>}
        <div style={DD.row}>
          <button type="button" onClick={go} disabled={isLoading} style={{ ...DD.btn, background: "#9a3412", color: "#fff" }}>{isLoading ? "Deleting…" : "Delete draft"}</button>
          <button ref={keep} type="button" onClick={onClose} style={{ ...DD.btn, background: "#fff", color: "#120e22", boxShadow: "inset 0 0 0 1.5px #ebe9f2" }}>Keep it</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const DD: Record<string, React.CSSProperties> = {
  scrim: { position: "fixed", inset: 0, zIndex: 90, background: "rgba(18,14,34,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  box: { width: "min(460px, 100%)", boxSizing: "border-box", background: "#fff", color: "#120e22", borderRadius: 24, padding: "clamp(20px, 5vw, 30px)", display: "grid", gap: 14, boxShadow: "0 24px 80px rgba(18,14,34,.3)", fontFamily: "Geist, system-ui, sans-serif" },
  h: { margin: 0, fontFamily: "'Bricolage Grotesque', Geist, sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1.1 },
  p: { margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#4b4664" },
  row: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 },
  btn: { flex: "1 1 150px", height: 50, borderRadius: 999, border: 0, font: "inherit", fontSize: 15.5, fontWeight: 600, cursor: "pointer" },
};
