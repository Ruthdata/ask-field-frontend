import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoMark } from "./Logo";
import { dashboardPath, researcherSignup, ROUTES } from "@/lib/site";

/** Public-site navigation. Dark over the homepage hero, light everywhere else. */
export default function SiteNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(true);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => {
      const hero = document.querySelector(".mk .hero") as HTMLElement | null;
      setScrolled(window.scrollY > 10);
      setLight(!hero || window.scrollY > hero.offsetHeight - 72);
    };
    on();
    // The hero mounts with the page, so check again on the next frame.
    const raf = requestAnimationFrame(on);
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [pathname]);

  // Close the menu when the route changes (adjusting state during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const page = Array.from(document.querySelectorAll<HTMLElement>("main, footer, .mk-page"));
    page.forEach((el) => (el.inert = open));
    if (open) menu.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const f = [burger.current!, ...Array.from(menu.current?.querySelectorAll<HTMLElement>("a") ?? [])];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 1000) setOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      document.body.classList.remove("menu-open");
      page.forEach((el) => (el.inert = false));
    };
  }, [open]);

  const openPricing = () => {
    const d = document.getElementById("pricing") as HTMLDetailsElement | null;
    if (d) d.open = true;
  };
  const dash = dashboardPath();
  const close = () => setOpen(false);

  return (
    <div className="mk mk-nav">
      <header className={`nav${scrolled ? " scrolled" : ""}${light ? " light" : ""}`}>
        <div className="wrap">
          <Link className="logo" to="/" aria-label="joinStudy home">
            <LogoMark />
            joinStudy
          </Link>
          <nav className="links" aria-label="Main">
            <a href="/#methods">Researchers</a>
            <a href="/#ai">AI teams</a>
            <a href="/#pricing" onClick={openPricing}>
              Pricing
            </a>
          </nav>
          <div className="nav-r">
            <a className="earn-link" href="/#earn">
              <i aria-hidden="true" />
              Earn with us
            </a>
            {dash ? (
              <Link className="signin" to={dash}>
                Dashboard
              </Link>
            ) : (
              <Link className="signin" to={ROUTES.signIn}>
                Sign in
              </Link>
            )}
            {!dash && (
              <Link className="btn btn-sun start" to={ROUTES.start}>
                <span className="long">Get started</span>
                <span className="short">Start</span>
              </Link>
            )}
          </div>
          <button
            ref={burger}
            className="burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen(!open)}
          >
            <span />
          </button>
        </div>
      </header>
      <div className={`menu${open ? " open" : ""}`} id="menu" aria-hidden={!open} ref={menu}>
        <nav aria-label="Menu">
          <a href="/#methods" onClick={close}>Researchers</a>
          <a href="/#ai" onClick={close}>AI teams</a>
          <a href="/#pricing" onClick={() => { openPricing(); close(); }}>Pricing</a>
          <a href="/#faq" onClick={close}>FAQ</a>
          <a href="/#earn" onClick={close}>Earn with us</a>
          {dash ? <Link to={dash}>Dashboard</Link> : <Link to={ROUTES.signIn}>Sign in</Link>}
        </nav>
        <div className="ctas">
          <Link className="btn btn-sun" to={researcherSignup("menu")}>Start a study</Link>
          <Link className="btn ghost" to={ROUTES.participantSignup}>Start earning</Link>
        </div>
      </div>
    </div>
  );
}
