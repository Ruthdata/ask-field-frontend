import { Link } from "react-router-dom";
import { LogoMark } from "./Logo";
import { ROUTES, SUPPORT_EMAIL } from "@/lib/site";

export default function SiteFooter() {
  return (
    <div className="mk mk-foot">
      <footer>
        <div className="wrap">
          <Link className="logo" to="/">
            <LogoMark />
            joinStudy
          </Link>
          <nav aria-label="Footer">
            <a href="/#pricing">Pricing</a>
            <Link to={ROUTES.requestCountry}>Request a country</Link>
            <Link to={ROUTES.foundingLabs}>Founding labs</Link>
            <a href="/#faq">Help</a>
          </nav>
          <a className="mail" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          <span>© {new Date().getFullYear()} joinStudy</span>
        </div>
      </footer>
    </div>
  );
}
