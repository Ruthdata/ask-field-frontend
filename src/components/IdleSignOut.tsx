import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "@/utils/auth";
import { IDLE_MINUTES, WARN_SECONDS, idleLimitMs, idleMs, markActive, renewIfDue, renewSession, signOutForIdle } from "@/lib/idle";

const EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll", "mousemove"] as const;

/**
 * Alpha feedback: signs people out after 20 minutes without activity. A minute before, it asks "Still there?".
 * Mounted once for the whole app; it does nothing while nobody is signed in.
 */
export default function IdleSignOut() {
  const [left, setLeft] = useState<number | null>(null);
  const warning = useRef(false);
  const stay = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!IDLE_MINUTES) return;
    const onActivity = () => {
      if (!isAuthenticated() || warning.current) return; // While asking, only the buttons count.
      markActive();
      renewIfDue();
    };
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));

    const tick = () => {
      if (!isAuthenticated()) {
        if (warning.current) {
          warning.current = false;
          setLeft(null);
        }
        return;
      }
      const idle = idleMs();
      const limit = idleLimitMs();
      if (idle >= limit) return signOutForIdle("idle");
      if (idle >= limit - WARN_SECONDS * 1000) {
        warning.current = true;
        setLeft(Math.max(1, Math.ceil((limit - idle) / 1000)));
      } else if (warning.current) {
        // Someone carried on in another tab.
        warning.current = false;
        setLeft(null);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    // Another tab signed out: follow it.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "x-ask-token" && !e.newValue && window.location.pathname.startsWith("/dashboard")) signOutForIdle("idle");
    };
    window.addEventListener("storage", onStorage);
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (left !== null) stay.current?.focus();
  }, [left !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (left === null) return null;

  const keepGoing = async () => {
    warning.current = false;
    setLeft(null);
    try {
      localStorage.setItem("js-last-active", String(Date.now()));
    } catch {
      /* ignore */
    }
    if (!(await renewSession())) signOutForIdle("expired");
  };

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="idle-h" aria-describedby="idle-p" style={S.scrim}>
      <div style={S.box}>
        <h2 id="idle-h" style={S.h}>Still there?</h2>
        <p id="idle-p" style={S.p}>
          For your security, we sign you out after {IDLE_MINUTES} minutes without activity. You'll be signed out in{" "}
          <b>{left} second{left === 1 ? "" : "s"}</b>.
        </p>
        <div style={S.row}>
          <button ref={stay} type="button" onClick={keepGoing} style={{ ...S.btn, ...S.primary }}>Stay signed in</button>
          <button type="button" onClick={() => signOutForIdle("idle")} style={{ ...S.btn, ...S.line }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  scrim: { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(18,14,34,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  box: { width: "min(440px, 100%)", boxSizing: "border-box", background: "#fff", color: "#120e22", borderRadius: 24, padding: "clamp(20px, 5vw, 32px)", display: "grid", gap: 14, boxShadow: "0 24px 80px rgba(18,14,34,.3)", fontFamily: "Geist, system-ui, sans-serif" },
  h: { margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1.1 },
  p: { margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#4b4664" },
  row: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 },
  btn: { flex: "1 1 160px", height: 50, borderRadius: 999, border: 0, fontSize: 15.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  primary: { background: "#f0c93a", color: "#251d00" },
  line: { background: "#fff", color: "#120e22", boxShadow: "inset 0 0 0 1.5px #ebe9f2" },
};
