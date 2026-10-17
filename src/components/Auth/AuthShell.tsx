import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "@components/marketing/Logo";

/** Split screen used by sign-up and sign-in (canvas 1.2 and 1.5): dark story on the left, the form on the right. */
export function AuthShell({ side, children }: { side: ReactNode; children: ReactNode }) {
  return (
    <div className="mk mk-auth">
      <aside className="auth-side">
        <Link className="logo" to="/" aria-label="joinStudy home">
          <LogoMark />
          joinStudy
        </Link>
        {side}
      </aside>
      <main className="auth-main" id="main">
        {children}
      </main>
    </div>
  );
}

/** Centred card on a pale page (canvas 1.3, 1.4, 1.6). */
export function CardPage({ children, right, wide }: { children: ReactNode; right?: ReactNode; wide?: boolean }) {
  return (
    <div className="mk mk-card-page">
      <header className="card-head">
        <Link className="logo" to="/" aria-label="joinStudy home">
          <LogoMark />
          joinStudy
        </Link>
        {right ?? <a href="mailto:hello@joinstudy.io">Need help?</a>}
      </header>
      <main className="card-wrap" id="main">
        <div className={`auth-card${wide ? " setup-card" : ""}`}>{children}</div>
      </main>
    </div>
  );
}
