export type RobotsDirective =
  | "index, follow"
  | "noindex, follow"
  | "noindex, nofollow";

export type SeoConfig = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  robots?: RobotsDirective;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
};

const siteUrlFromEnv = import.meta.env.VITE_FRONTEND_URL;

export const SITE_URL = (siteUrlFromEnv || "https://joinstudy.co").replace(
  /\/+$/,
  "",
);
export const SITE_NAME = "joinStudy";
export const DEFAULT_IMAGE = "/images/find-participants.png";
export const DEFAULT_DESCRIPTION =
  "joinStudy helps researchers recruit verified participants globally and helps participants join legitimate paid research studies.";

const defaultKeywords = [
  "joinStudy",
  "research participant recruitment",
  "paid research studies",
  "survey participants",
  "academic research participants",
  "product testing participants",
  "AI data studies",
  "Global South research",
];

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/askfield-logo-icon.png"),
    sameAs: [],
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export const defaultSeo: SeoConfig = {
  title: "joinStudy | Recruit Research Participants and Join Paid Studies",
  description: DEFAULT_DESCRIPTION,
  path: "/",
  keywords: defaultKeywords,
  robots: "index, follow",
  image: DEFAULT_IMAGE,
  type: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  },
};

export const routeSeo: Record<string, SeoConfig> = {
  "/": defaultSeo,
  "/waitlist": {
    title: "joinStudy Waitlist | Research Participant Platform",
    description:
      "Join the joinStudy waitlist for access to paid research studies and participant recruitment tools.",
    path: "/waitlist",
    keywords: [
      "joinStudy waitlist",
      "paid study waitlist",
      "research platform waitlist",
    ],
    robots: "noindex, follow",
  },
  "/complete-survey": {
    title: "Survey Completed | joinStudy",
    description:
      "Your joinStudy survey response has been received and submitted for review.",
    path: "/complete-survey",
    robots: "noindex, nofollow",
  },
  "/researcher-pending": {
    title: "Researcher Access Pending | joinStudy",
    description:
      "Your joinStudy researcher access request is pending review.",
    path: "/researcher-pending",
    robots: "noindex, nofollow",
  },
  "/auth/login/participant": {
    title: "Participant Login | joinStudy",
    description:
      "Log in to your joinStudy participant account to find studies, complete surveys, and track earnings.",
    path: "/auth/login/participant",
    robots: "noindex, follow",
  },
  "/auth/login/researcher": {
    title: "Researcher Login | joinStudy",
    description:
      "Log in to your joinStudy researcher account to create studies and manage participants.",
    path: "/auth/login/researcher",
    robots: "noindex, follow",
  },
  "/auth/sign-up/participant": {
    title: "Join Paid Research Studies | joinStudy",
    description:
      "Create a participant profile on joinStudy to apply for legitimate paid surveys, interviews, usability tests, and research studies.",
    path: "/auth/sign-up/participant",
    keywords: [
      "join paid research studies",
      "paid surveys",
      "research participant signup",
      "paid interviews",
      "usability testing participant",
    ],
    robots: "index, follow",
  },
  "/auth/sign-up/researcher": {
    title: "Recruit Research Participants | joinStudy",
    description:
      "Create a joinStudy researcher account to recruit, screen, and manage qualified participants for surveys, interviews, product tests, and AI data studies.",
    path: "/auth/sign-up/researcher",
    keywords: [
      "recruit research participants",
      "survey participant recruitment",
      "screen research participants",
      "product research recruitment",
      "AI data study participants",
    ],
    robots: "index, follow",
  },
};

const privateRoutePrefixes = ["/dashboard"];
const authNoIndexPrefixes = [
  "/auth/email-sent",
  "/auth/verify-email",
  "/auth/researcher/verify-email",
  "/auth/recover-password",
  "/auth/reset-password",
  "/auth/change-password",
  "/auth/sign-up/researcher/",
];

export function getSeoForPath(pathname: string): SeoConfig {
  if (routeSeo[pathname]) return routeSeo[pathname];

  if (privateRoutePrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return {
      title: "Dashboard | joinStudy",
      description:
        "Manage your joinStudy account, studies, surveys, messages, and payments.",
      path: pathname,
      robots: "noindex, nofollow",
    };
  }

  if (authNoIndexPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return {
      title: "Account Setup | joinStudy",
      description: "Continue setting up or securing your joinStudy account.",
      path: pathname,
      robots: "noindex, follow",
    };
  }

  return {
    title: "Page Not Found | joinStudy",
    description:
      "The joinStudy page you are looking for could not be found.",
    path: pathname,
    robots: "noindex, follow",
  };
}

export function mergeSeo(seo: SeoConfig): Required<SeoConfig> {
  return {
    ...defaultSeo,
    ...seo,
    path: seo.path || defaultSeo.path || "/",
    keywords: [...defaultKeywords, ...(seo.keywords || [])],
    robots: seo.robots || defaultSeo.robots || "index, follow",
    image: seo.image || defaultSeo.image || DEFAULT_IMAGE,
    type: seo.type || defaultSeo.type || "website",
    jsonLd: seo.jsonLd || {},
  };
}
