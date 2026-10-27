import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile, a free bot check on participant sign-up. Shows nothing unless
 * VITE_TURNSTILE_SITE_KEY is set (the backend skips the check when TURNSTILE_SECRET is empty).
 */
type TurnstileApi = { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
let loading: Promise<void> | null = null;

function load() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Turnstile failed to load"));
      document.head.appendChild(s);
    });
  }
  return loading;
}

export default function Turnstile({ onToken }: { onToken: (t: string | undefined) => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    let id: string | undefined;
    let gone = false;
    load()
      .then(() => {
        if (gone || !box.current || !window.turnstile) return;
        id = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(undefined),
          size: "flexible",
        });
      })
      .catch(() => onToken(undefined));
    return () => {
      gone = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [onToken]);
  if (!SITE_KEY) return null;
  return <div ref={box} />;
}
