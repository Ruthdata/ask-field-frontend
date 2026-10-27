import { useState } from "react";
import { GoogleIcon } from "@components/icons";
import { useGoogleSignInMutation } from "@/redux/api/authApi";
import { readProblem, type AccountType, type NeedsChoice, type Session } from "@/lib/session";

interface Props {
  /** Participant sign-up: a new participant account also needs the country and the 18+/terms agreement. */
  extra?: { country?: string; agree?: boolean };
  /** Return false to stop before opening Google (e.g. the agreement box isn't ticked). */
  beforeOpen?: () => boolean;
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
export default function GoogleButton({ extra, beforeOpen, intent, method, accountType, onSession, onChoice, onError }: Props) {
  const [busy, setBusy] = useState(false);
  const [googleSignIn] = useGoogleSignInMutation();

  const go = async () => {
    if (busy) return;
    if (beforeOpen && !beforeOpen()) return;
    setBusy(true);
    try {
      const [{ signInWithPopup }, { auth, googleProvider, missingFirebaseSettings }] = await Promise.all([import("firebase/auth"), import("../../firebase")]);
      if (missingFirebaseSettings.length) {
        console.error("Google sign-in isn't set up: missing", missingFirebaseSettings.join(", "));
        onError("Google sign-in isn't set up on this site yet. Please use your email for now.", "google_not_configured");
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const res = await googleSignIn({ token, intent, method, accountType, ...extra }).unwrap();
      const data = res.data;
      if ("needsChoice" in data) onChoice(data, token);
      else onSession(data);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request" || code === "auth/user-cancelled") return;
      if (code?.startsWith("auth/")) {
        // Keep the real reason visible: in the console for whoever deploys, and as a short code people can report.
        console.error("Google sign-in failed:", code, (err as Error)?.message);
        onError(`${googleProblem(code)} (${code})`, code);
      } else {
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

/** Plain words for the Firebase errors people actually hit. */
function googleProblem(code: string) {
  switch (code) {
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups for this site, or use your email.";
    case "auth/network-request-failed":
      return "We couldn't reach Google. Check your connection and try again.";
    case "auth/unauthorized-domain":
      return "Google sign-in isn't switched on for this web address yet. Please use your email for now.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
    case "auth/invalid-app-credential":
      return "Google sign-in isn't set up correctly on our side. Please use your email for now.";
    case "auth/account-exists-with-different-credential":
      return "This email already signs in another way. Use your email and password.";
    case "auth/too-many-requests":
      return "Too many tries. Wait a minute and try again.";
    default:
      return "Google sign-in didn't work. Try again, or use your email.";
  }
}
