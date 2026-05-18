import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "For Researchers", href: "#for-researchers" },
      { label: "For Participants", href: "#for-participants" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#" },
      { label: "Trust & Ethics", href: "#trust-ethics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "mailto:contact@ruthdata.com" },
      { label: "Pilot Access", href: "/auth/sign-up/researcher" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Participant Terms", href: "#" },
      { label: "Researcher Terms", href: "#" },
      { label: "Payment Policy", href: "#" },
      { label: "Prohibited Studies Policy", href: "#" },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const isRoute = href.startsWith("/");

  if (isRoute) {
    return (
      <Link className="text-white/75 transition-colors hover:text-white" to={href}>
        {label}
      </Link>
    );
  }

  return (
    <a className="text-white/75 transition-colors hover:text-white" href={href}>
      {label}
    </a>
  );
}

const FooterHome = () => {
  return (
    <footer className="bg-[#4A3824] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold md:text-5xl">
          Start better research with joinStudy
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
          Recruit qualified participants, run transparent studies, and support
          fair participation across global research communities.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/auth/sign-up/researcher"
            className="rounded-full border-2 border-white px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-[#4A3824]"
          >
            Start a Study
          </Link>
          <Link
            to="/auth/sign-up/participant"
            className="rounded-full bg-white px-8 py-3 font-medium text-[#4A3824] transition-colors hover:bg-white/90"
          >
            Join Paid Studies
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="border-t border-white/15" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <div className="text-3xl font-bold">
              <span className="text-yellow-300">join</span>Study
            </div>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75">
              joinStudy helps researchers recruit, screen, and manage research
              participants globally, with stronger access to underrepresented
              communities and a participant experience built around clear study
              details, consent, choice, and fair compensation.
            </p>

            <div className="mt-7 space-y-4 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0" />
                <a href="mailto:contact@ruthdata.com" className="hover:text-white">
                  contact@ruthdata.com
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Phone className="h-5 w-5 shrink-0" />
                <a href="tel:+2348061402043" className="hover:text-white">
                  +234 806 1402 043
                </a>
                <span className="text-white/40">/</span>
                <a href="tel:+2347017383237" className="hover:text-white">
                  +234 701 7383 237
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>No 1A Ipaduma, Asokoro Abuja.</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-semibold text-white">{column.title}</h3>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  {column.links.map((link) => (
                    <FooterLink key={link.label} {...link} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} joinStudy. All Rights Reserved.</p>

          <div className="flex gap-3">
            <a
              href="#"
              aria-label="joinStudy on LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-[#4A3824]"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="joinStudy on Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-[#4A3824]"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="joinStudy on Twitter"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white hover:text-[#4A3824]"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterHome;
