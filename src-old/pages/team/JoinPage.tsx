import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setWorkspace, useAcceptInviteMutation, useGetInviteQuery } from "@/redux/api/accountApi";
import { useGetResearcherQuery } from "@/redux/api/slices/userSlice";
import { apiSlice } from "@/redux/api/slices/appSlice";
import { readProblem } from "@/lib/session";
import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";
import { clearAuthStorage, isJwtLikeToken } from "@/utils/token";
import "@/styles/app.css";

/** Stage 9: an invite to someone's workspace. Works signed in, signed out, or new to joinStudy. */
const WORD: Record<string, string> = { admin: "an Admin", researcher: "a Researcher", viewer: "a Viewer" };

export default function JoinPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signedIn = isJwtLikeToken(storage.get(STORAGE_KEYS.TOKEN)) && storage.get(STORAGE_KEYS.USER_TYPE) === "researcher";
  const { data, isLoading, isError, error } = useGetInviteQuery(token);
  const { data: me } = useGetResearcherQuery(undefined, { skip: !signedIn });
  const [accept, state] = useAcceptInviteMutation();
  const [problem, setProblem] = useState("");
  const i = data?.data;
  const myEmail = me?.data?.email?.toLowerCase();
  const join = async () => {
    setProblem("");
    try {
      const r = (await accept(token).unwrap()).data;
      storage.remove(STORAGE_KEYS.PENDING_INVITE);
      setWorkspace(r.workspaceId);
      dispatch(apiSlice.util.resetApiState());
      navigate("/dashboard/researcher", { replace: true });
    } catch (err) {
      setProblem(readProblem(err).message);
    }
  };
  const startSignUp = () => {
    storage.set(STORAGE_KEYS.PENDING_INVITE, token);
    navigate(`/auth/sign-up/researcher?email=${encodeURIComponent(i?.email || "")}&source=invite`);
  };
  const signOut = () => {
    clearAuthStorage();
    dispatch(apiSlice.util.resetApiState());
    navigate(`/sign-in?intent=researcher&email=${encodeURIComponent(i?.email || "")}&next=${encodeURIComponent(`/join/${token}`)}`);
  };
  return (
    <div className="jp" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "48px 16px" }}>
      <Link to="/" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, letterSpacing: "-.045em", color: "var(--ink)", textDecoration: "none" }}>joinStudy</Link>
      <main className="jp-sec" style={{ width: "min(560px, 100%)", gap: 18 }}>
        {isLoading && <div className="ja-skeleton" style={{ height: 200 }} aria-busy="true" />}
        {isError && (
          <>
            <h1 className="jp-h1" style={{ margin: 0 }}>This invite can't be used</h1>
            <p className="jp-lede" style={{ margin: 0 }}>{readProblem(error).message || "Ask the person who invited you for a new one."}</p>
            <Link className="jp-btn2" to="/">Go to joinStudy</Link>
          </>
        )}
        {i && (
          <>
            <span className="jp-mono">Invitation</span>
            <h1 className="jp-h1" style={{ margin: 0 }}>{i.inviter || "Someone"} invited you to the {i.workspace} workspace</h1>
            <p className="jp-lede" style={{ margin: 0 }}>As {WORD[i.role] || i.role}: {i.roleNote}. Your own studies stay in your own workspace; switch between them from the menu.</p>
            {signedIn && myEmail === i.email && (
              <>
                <div className="jp-note">Signed in as <b>{myEmail}</b></div>
                {problem && <div className="jp-note bad" role="alert">{problem}</div>}
                <div className="jp-actions">
                  <button type="button" className="jp-btn" onClick={join} disabled={state.isLoading}>{state.isLoading ? "Joining…" : "Join the workspace"}</button>
                  <Link className="jp-btn2" to="/dashboard/researcher" onClick={() => storage.remove(STORAGE_KEYS.PENDING_INVITE)}>Not now</Link>
                </div>
              </>
            )}
            {signedIn && myEmail && myEmail !== i.email && (
              <>
                <div className="jp-note bad" role="alert">This invite is for {i.email}, but you're signed in as {myEmail}. Sign in with the invited address, or ask {i.inviter || "them"} for a new invite.</div>
                <div className="jp-actions"><button type="button" className="jp-btn2" onClick={signOut}>Sign out and use {i.email}</button></div>
              </>
            )}
            {!signedIn && (
              <>
                <div className="jp-actions">
                  {i.hasAccount ? (
                    <Link className="jp-btn" to={`/sign-in?intent=researcher&email=${encodeURIComponent(i.email)}&next=${encodeURIComponent(`/join/${token}`)}`}>Sign in to join</Link>
                  ) : (
                    <button type="button" className="jp-btn" onClick={startSignUp}>Create your account</button>
                  )}
                  {i.hasAccount ? (
                    <button type="button" className="jp-btn2" onClick={startSignUp}>I'm new to joinStudy</button>
                  ) : (
                    <Link className="jp-btn2" to={`/sign-in?intent=researcher&email=${encodeURIComponent(i.email)}&next=${encodeURIComponent(`/join/${token}`)}`}>I have an account</Link>
                  )}
                </div>
                <span className="jp-hint">Use {i.email}, the address the invite was sent to. The invite works until {new Date(i.expiresAt).toLocaleDateString()}.</span>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
