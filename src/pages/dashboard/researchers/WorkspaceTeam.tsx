import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useChangeRoleMutation,
  useGetTeamQuery,
  useInviteMutation,
  useLeaveWorkspaceMutation,
  useRemoveMemberMutation,
  useResendInviteMutation,
  type Member,
  type Role,
} from "@/redux/api/accountApi";
import { useWorkspace } from "@/hooks/useWorkspace";
import { readProblem } from "@/lib/session";
import "@/styles/run.css";

/** Stage 9: who's in this workspace, with their roles, and invites. */
const ROLES: { role: Exclude<Role, "owner">; label: string; note: string }[] = [
  { role: "admin", label: "Admin", note: "Everything, including paying and inviting." },
  { role: "researcher", label: "Researcher", note: "Plan, run and review studies. Can't pay or manage the team." },
  { role: "viewer", label: "Viewer", note: "Sees studies, results and statements only." },
];
const WORD: Record<Role, string> = { owner: "Owner", admin: "Admin", researcher: "Researcher", viewer: "Viewer" };
const initials = (s: string) => s.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");

export default function WorkspaceTeam() {
  const { data, isLoading, isError, refetch } = useGetTeamQuery(undefined, { refetchOnMountOrArgChange: true });
  const ws = useWorkspace();
  const navigate = useNavigate();
  const [inviting, setInviting] = useState(false);
  const [problem, setProblem] = useState("");
  const [said, setSaid] = useState("");
  const [resend] = useResendInviteMutation();
  const [remove] = useRemoveMemberMutation();
  const [leave, leaveState] = useLeaveWorkspaceMutation();
  const t = data?.data;
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setProblem("");
    setSaid("");
    try {
      await fn();
      setSaid(ok);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="ja-page">
      <h1 className="ja-h1">Team</h1>
      <p className="ja-lede">People in the {t?.name || "…"} workspace see and work on the same studies. What they can do depends on their role.</p>
      {isLoading && <div className="ja-skeleton" style={{ height: 260 }} aria-busy="true" />}
      {isError && <div className="ja-error" role="alert">We couldn't load the team. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>}
      {said && <div className="jr-alert" role="status" style={{ background: "var(--paper)", borderColor: "var(--line)" }}><span className="txt">{said}</span></div>}
      {problem && <div className="jr-error" role="alert">{problem}</div>}
      {t && (
        <div className="ja-cols">
          <section className="ja-card ja-col-main" aria-labelledby="mem-h">
            <div className="ja-row">
              <h2 id="mem-h" className="ja-h2">Members</h2>
              {t.canManage && <button type="button" className="ja-btn" style={{ height: 46, fontSize: 15 }} onClick={() => setInviting(true)}>Invite someone</button>}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {t.members.map((m) => <MemberRow key={m.researcherId} m={m} canManage={t.canManage} myRole={t.myRole} onDone={setSaid} onProblem={setProblem} />)}
              {t.invites.map((i) => (
                <li key={i.membershipId} className="jr-who" style={{ flexWrap: "wrap" }}>
                  <span className="ja-avatar" aria-hidden="true" style={{ background: "var(--line-2)", color: "var(--ink-2)" }}>{initials(i.email)}</span>
                  <span style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <b style={{ fontFamily: "var(--body)", fontWeight: 600, width: "auto", overflowWrap: "anywhere" }}>{i.email}</b>
                    <span className="ja-small">{i.expired ? "Invite expired" : `Invited · expires ${new Date(i.expiresAt).toLocaleDateString()}`}</span>
                  </span>
                  <span className="jr-status">{WORD[i.role]}</span>
                  {t.canManage && (
                    <>
                      <button type="button" className="ja-link" style={{ fontSize: 14 }} onClick={() => act(() => resend(i.membershipId).unwrap(), `Invite sent again to ${i.email}.`)}>Resend<span className="sr-only"> to {i.email}</span></button>
                      <button type="button" className="ja-link" style={{ fontSize: 14 }} onClick={() => act(() => remove(i.membershipId).unwrap(), "Invite cancelled.")}>Cancel<span className="sr-only"> invite to {i.email}</span></button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {ws.current && !ws.current.own && (
              <button type="button" className="ja-link" style={{ color: "#7a1d12" }} disabled={leaveState.isLoading} onClick={() => act(async () => { await leave(ws.current!.workspaceId).unwrap(); ws.switchTo(ws.list.find((w) => w.own)!); navigate("/dashboard/researcher"); }, "You left the workspace.")}>
                Leave this workspace
              </button>
            )}
          </section>
          <aside className="ja-col-side">
            <section className="ja-card" style={{ gap: 10, fontSize: 14.5, lineHeight: 1.5 }} aria-labelledby="roles-h">
              <h2 id="roles-h" className="ja-h3">Roles</h2>
              <span><b>Owner</b> · everything, including closing the account. One per workspace.</span>
              {ROLES.map((r) => <span key={r.role}><b>{r.label}</b> · {r.note}</span>)}
            </section>
            <section className="ja-card" style={{ gap: 8, background: "var(--mist)", border: 0, fontSize: 14.5, lineHeight: 1.5 }}>
              <b>Emails about studies</b>
              <span className="ja-muted">Bookings, replies and reminders go to the person who made the study. Receipts go to the receipt details on Payments.</span>
            </section>
          </aside>
        </div>
      )}
      {inviting && <InviteDialog onClose={(sent) => { setInviting(false); if (sent) setSaid(`Invite sent to ${sent}.`); }} />}
    </div>
  );
}

function MemberRow({ m, canManage, myRole, onDone, onProblem }: { m: Member; canManage: boolean; myRole: Role; onDone: (s: string) => void; onProblem: (s: string) => void }) {
  const [change, changeState] = useChangeRoleMutation();
  const [remove, removeState] = useRemoveMemberMutation();
  const editable = canManage && m.role !== "owner" && !m.you && (myRole === "owner" || m.role !== "admin");
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    onProblem("");
    try {
      await fn();
      onDone(ok);
    } catch (err) {
      onProblem(readProblem(err).message);
    }
  };
  return (
    <li className="jr-who" style={{ flexWrap: "wrap" }}>
      <span className="ja-avatar" aria-hidden="true">{initials(m.name)}</span>
      <span style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <b style={{ fontFamily: "var(--body)", fontWeight: 600, width: "auto" }}>{m.name}{m.you ? " (you)" : ""}</b>
        <span className="ja-small" style={{ overflowWrap: "anywhere" }}>{m.email}</span>
      </span>
      {editable && m.membershipId ? (
        <>
          <label className="sr-only" htmlFor={`role-${m.membershipId}`}>Role for {m.name}</label>
          <select id={`role-${m.membershipId}`} value={m.role} disabled={changeState.isLoading} onChange={(e) => run(() => change({ id: m.membershipId!, role: e.target.value as Role }).unwrap(), `${m.name} is now ${WORD[e.target.value as Role]}.`)} style={{ height: 36, borderRadius: 10, border: "1.5px solid var(--line)", font: "inherit", fontSize: 14, padding: "0 8px", background: "var(--paper)" }}>
            {ROLES.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}
          </select>
          <button type="button" className="ja-link" style={{ fontSize: 14, color: "#7a1d12" }} disabled={removeState.isLoading} onClick={() => run(() => remove(m.membershipId!).unwrap(), `${m.name} was removed.`)}>Remove<span className="sr-only"> {m.name}</span></button>
        </>
      ) : (
        <span className={`jr-status${m.role === "owner" ? " ok" : ""}`}>{WORD[m.role]}</span>
      )}
    </li>
  );
}

function InviteDialog({ onClose }: { onClose: (sent?: string) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "owner">>("researcher");
  const [problem, setProblem] = useState("");
  const [invite, state] = useInviteMutation();
  const send = async () => {
    setProblem("");
    try {
      await invite({ email, role }).unwrap();
      onClose(email);
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  return (
    <div className="jr-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="jr-dialog" role="dialog" aria-modal="true" aria-labelledby="inv-t" onKeyDown={(e) => e.key === "Escape" && onClose()}>
        <h2 id="inv-t">Invite someone</h2>
        <div className="jr-field">
          <label htmlFor="inv-e">Email</label>
          <input id="inv-e" type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@university.edu" />
        </div>
        <div role="radiogroup" aria-label="Role" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROLES.map((r) => (
            <button key={r.role} type="button" role="radio" aria-checked={role === r.role} className="jr-opt" style={{ flex: "none" }} onClick={() => setRole(r.role)}><b>{r.label}</b><span>{r.note}</span></button>
          ))}
        </div>
        <span className="ja-small">They get an email with a link that works for 7 days. If they don't have a joinStudy account, they make one.</span>
        {problem && <div className="jr-error" role="alert">{problem}</div>}
        <div className="jr-btns">
          <button type="button" className="jr-btn sun" disabled={!email.trim() || state.isLoading} onClick={send}>{state.isLoading ? "Sending…" : "Send invite"}</button>
          <button type="button" className="jr-btn" onClick={() => onClose()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
