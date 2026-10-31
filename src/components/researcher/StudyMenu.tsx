import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { HomeStudy } from "@/redux/api/homeApi";
import { downloadResults, useRunAgainMutation } from "@/redux/api/runApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { readProblem } from "@/lib/session";
import { studyLink } from "@/lib/study";
import DeleteDraftDialog from "./DeleteDraftDialog";

type Item = { label: string; run: () => void | Promise<void>; danger?: boolean };

/**
 * The ⋯ menu on a study row (like Prolific's). What it offers depends on where the study is:
 * - draft: Edit · Duplicate · Delete
 * - waiting for payment or our check: Open · Duplicate
 * - live: Open · Pause or Resume · Add places · Close early · Duplicate (the study page's own dialogs confirm)
 * - closed: Open · Download results · Run it again
 * Viewers in a team only get Open (and Download results).
 */
export default function StudyMenu({ s, onDone }: { s: HomeStudy; onDone?: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [problem, setProblem] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const ws = useWorkspace();
  const [copy] = useRunAgainMutation();

  const study = `/dashboard/researcher/studies/${s.surveyId}`;
  const duplicate = async () => {
    try {
      const r = (await copy({ id: s.surveyId, copy: true }).unwrap()).data;
      navigate(`${study.replace(s.surveyId, r.surveyId)}/plan/basics`);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const items: Item[] = [];
  const draftStage = s.stage === "none" || s.stage === "changes-needed";
  if (s.status === "draft" && draftStage) {
    items.push({ label: ws.canEdit ? "Edit" : "Open", run: () => navigate(studyLink(s)) });
    if (ws.canEdit) items.push({ label: "Duplicate", run: duplicate }, { label: "Delete", run: () => setDeleting(true), danger: true });
  } else if (s.status === "draft") {
    items.push({ label: "Open", run: () => navigate(studyLink(s)) });
    if (ws.canEdit) items.push({ label: "Duplicate", run: duplicate });
  } else if (s.status === "live") {
    items.push({ label: "Open", run: () => navigate(study) });
    if (ws.canEdit && !s.heldByJoinStudy) items.push({ label: s.paused ? "Resume" : "Pause", run: () => navigate(`${study}?change=pause`) });
    if (ws.canPay) items.push({ label: s.method === "focus-group" ? "Add a session" : "Add places", run: () => navigate(`${study}?change=places`) });
    if (ws.canEdit) items.push({ label: "Close early", run: () => navigate(`${study}?change=close`), danger: true }, { label: "Duplicate", run: duplicate });
  } else {
    items.push({ label: "Open", run: () => navigate(study) });
    items.push({ label: "Download results", run: () => downloadResults(s.surveyId).then(() => onDone?.("Results downloaded.")).catch((e) => setProblem(e.message)) });
    if (ws.canEdit) items.push({ label: "Run it again", run: duplicate });
  }

  // The menu sits above the page (the table scrolls sideways on phones and would cut it off), next to its button.
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const place = () => {
      const r = btn.current!.getBoundingClientRect();
      const w = 220;
      const h = menu.current?.offsetHeight || items.length * 46 + 12;
      const below = r.bottom + 6 + h <= window.innerHeight - 8;
      setPos({ top: below ? r.bottom + 6 : Math.max(8, r.top - 6 - h), left: Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    const away = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    const keys = (e: KeyboardEvent) => {
      const list = [...(menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") || [])];
      const i = list.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]?.focus();
      } else if (e.key === "Tab") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", keys);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="ja-dots"
        aria-label={`Actions for ${s.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setProblem("");
          setOpen((o) => !o);
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="3.5" r="1.6" fill="currentColor" /><circle cx="9" cy="9" r="1.6" fill="currentColor" /><circle cx="9" cy="14.5" r="1.6" fill="currentColor" /></svg>
      </button>
      {open &&
        createPortal(
          <div ref={menu} role="menu" aria-label={`Actions for ${s.name}`} className="ja-pop" style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}>
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                role="menuitem"
                className={it.danger ? "danger" : undefined}
                onClick={() => {
                  setOpen(false);
                  void it.run();
                }}
              >
                {it.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
      {problem && <span role="alert" className="ja-pop-problem">{problem}</span>}
      {deleting && (
        <DeleteDraftDialog
          id={s.surveyId}
          title={s.name || "this draft"}
          onClose={() => setDeleting(false)}
          onDeleted={() => {
            setDeleting(false);
            onDone?.(`Draft “${s.name}” deleted.`);
          }}
        />
      )}
    </>
  );
}
