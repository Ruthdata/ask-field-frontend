import { useState } from "react";
import { GoogleIcon } from "@components/icons";
import { useGoogleSignInMutation } from "@/redux/api/authApi";
import { readProblem, type AccountType, type NeedsChoice, type Session } from "@/lib/session";

interface Props {
  intent?: AccountType;
  method?: string;
  accountType?: AccountType;
  onSession: (s: Session) => void;
  onChoice: (c: NeedsChoice, googleToken: string) => void;
  onError: (message: string, code?: string) => void;
}

/**
 * "Continue with Google". Uses the Firebase popup, then /api/auth/google, which knows whether the
 * email belongs to a researcher, a participant or both (so researchers no longer land in a participant account).
 */
export default function GoogleButton({ intent, method, accountType, onSession, onChoice, onError }: Props) {
  const [busy, setBusy] = useState(false);
  const [googleSignIn] = useGoogleSignInMutation();

  const go = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const [{ signInWithPopup }, { auth, googleProvider }] = await Promise.all([import("firebase/auth"), import("../../firebase")]);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const res = await googleSignIn({ token, intent, method, accountType }).unwrap();
      const data = res.data;
      if ("needsChoice" in data) onChoice(data, token);
      else onSession(data);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code?.startsWith("auth/")) onError("Google sign-in didn't work. Try again, or use your email.");
      else {
        const p = readProblem(err);
        onError(p.message, p.code);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className="btn btn-line btn-block" onClick={go} disabled={busy} aria-busy={busy}>
      <GoogleIcon />
      {busy ? "Opening Google…" : "Continue with Google"}
    </button>
  );
}
