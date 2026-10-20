import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Menu, X } from "lucide-react";
import { useGetResearcherQuery } from "@/redux/api/slices/userSlice";
import { useGetHomeQuery } from "@/redux/api/homeApi";
import { useGetInboxQuery, useGetToReviewQuery } from "@/redux/api/runApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { clearAuthStorage } from "@/utils/token";
import "@/styles/app.css";

const Icon = ({ d }: { d: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** Stage 3 navigation; Messages added in Stage 6. Review and money for one study live inside that study. */
const NAV = [
  { to: "/dashboard/researcher", label: "Home", end: true, d: "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" },
  { to: "/dashboard/researcher/studies", label: "Studies", count: true, d: "M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM8 9h8M8 13h8M8 17h5" },
  { to: "/dashboard/researcher/survey-actions", label: "To review", waiting: true, d: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" },
  { to: "/dashboard/researcher/messages", label: "Messages", unread: true, d: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z" },
  { to: "/dashboard/researcher/estimate", label: "Cost estimate", d: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h2M12 18h4" },
  { to: "/dashboard/researcher/wallet", label: "Payments", d: "M5 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM3 10h18M7 15h4" },
  { to: "/dashboard/researcher/workspace-team", label: "Team", d: "M9 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM3.5 19c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6M17 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM16 13.6c2.2 0 3.9 1.3 4.5 3.9" },
  { to: "/dashboard/researcher/support", label: "Help", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3M12 17h.01" },
];

const Logo = () => (
  <Link to="/" className="ja-logo">
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#f0c93a" />
      <circle cx="12" cy="12" r="4.4" fill="#120e22" />
    </svg>
    joinStudy
  </Link>
);

export default function ResearcherDashboardLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: me } = useGetResearcherQuery();
  const { data: home } = useGetHomeQuery();
  const { data: inbox } = useGetInboxQuery(undefined, { pollingInterval: 60000 });
  const unread = inbox?.data?.unread ?? 0;
  const { data: waitingData } = useGetToReviewQuery(undefined, { pollingInterval: 120000 });
  const waiting = (waitingData?.data || []).reduce((t, r) => t + r.count + r.toMark, 0);
  const r = me?.data;
  const h = home?.data;

  // Close the phone menu whenever the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const name = r ? `${r.firstName} ${r.lastName || ""}`.trim() : "";
  const initials = r ? `${r.firstName?.[0] || ""}${r.lastName?.[0] || ""}`.toUpperCase() : "";
  const verified = r?.institutionVerification?.status === "verified";
  const org = !r ? "" : !r.isCompleteProfile ? "Setup not finished" : r.organizationName ? `${r.organizationName}${verified ? " · ✓ verified" : ""}` : "Independent researcher";

  const ws = useWorkspace();
  // Signed up from a team invite: finish joining (Stage 9).
  useEffect(() => {
    const pending = storage.get(STORAGE_KEYS.PENDING_INVITE);
    if (pending && r?.isCompleteProfile) navigate(`/join/${pending}`, { replace: true });
  }, [r?.isCompleteProfile, navigate]);
  const ROLE_WORD: Record<string, string> = { owner: "Owner", admin: "Admin", researcher: "Researcher", viewer: "Viewer" };

  const signOut = () => {
    clearAuthStorage();
    dispatch(apiSlice.util.resetApiState());
    navigate("/", { replace: true });
  };

  return (
    <div className="ja">
      <div className={`ja-scrim${open ? " open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="ja-side" className={`ja-side${open ? " open" : ""}`} aria-label="Researcher menu">
        <Logo />
        {ws.list.length > 1 && ws.current && (
          <div className="ja-ws">
            <label htmlFor="ja-ws" className="ja-mono" style={{ fontSize: 11.5 }}>Workspace</label>
            <select id="ja-ws" value={ws.current.workspaceId} onChange={(e) => { const w = ws.list.find((x) => x.workspaceId === e.target.value); if (w) { ws.switchTo(w); navigate("/dashboard/researcher"); } }}>
              {ws.list.map((w) => <option key={w.workspaceId} value={w.workspaceId}>{w.own ? `${w.name} (yours)` : w.name}</option>)}
            </select>
            {!ws.current.own && <span className="ja-small">{ROLE_WORD[ws.role]} · {ws.current.ownerName}'s workspace</span>}
          </div>
        )}
        {ws.canEdit && (
          <Link to="/dashboard/researcher/new" className="ja-new">
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>+</span> New study
          </Link>
        )}
        <nav aria-label="Main" className="ja-navlist">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `ja-nv${isActive ? " on" : ""}`}>
              <Icon d={n.d} />
              {n.label}
              {n.count && h ? <span className="count">{h.counts.total}</span> : null}
              {n.waiting && waiting > 0 ? <span className="count" style={{ background: "var(--sun)", color: "var(--sun-ink)", borderRadius: 999, padding: "1px 8px" }}>{waiting}<span className="sr-only"> waiting</span></span> : null}
              {n.unread && unread > 0 ? <span className="count" style={{ background: "var(--sun)", color: "var(--sun-ink)", borderRadius: 999, padding: "1px 8px" }}>{unread}<span className="sr-only"> unread</span></span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="ja-acct">
          <div className="who">
            <span className="ja-avatar" aria-hidden="true">{initials || "…"}</span>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span className="name">{name || " "}</span>
              <span className="org">{org}</span>
            </div>
          </div>
          <div className="links">
            <Link to={r?.isCompleteProfile ? "/dashboard/researcher/settings" : "/setup"}>{r?.isCompleteProfile ? "Settings" : "Finish setup"}</Link>
            <button type="button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <div className="ja-main">
        <header className="ja-top">
          <button type="button" className="ja-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="ja-side" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo />
          <Link to="/dashboard/researcher/new" className="ja-new" aria-label="New study">
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>+</span> New
          </Link>
        </header>
        <main className="ja-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
