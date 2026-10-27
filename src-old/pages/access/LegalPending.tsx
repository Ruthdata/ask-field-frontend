import { Link } from "react-router-dom";
import { CardPage } from "@components/auth/AuthShell";

/** Placeholder until the real Terms and Privacy Policy are written. Honest about it, with a way to ask. */
export default function LegalPending({ title }: { title: string }) {
  return (
    <CardPage>
      <div style={{ display: "grid", gap: 10 }}>
        <span className="label">joinStudy</span>
        <h1>{title}</h1>
        <p className="lede">
          We're finalising this page. Until it's published, email <a className="text" href="mailto:hello@joinstudy.io">hello@joinstudy.io</a> with any
          question about how we handle your account and data.
        </p>
      </div>
      <Link className="btn btn-outline btn-block" to="/">Back to joinStudy</Link>
    </CardPage>
  );
}
