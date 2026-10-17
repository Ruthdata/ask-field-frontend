import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { absoluteUrl, getSeoForPath, mergeSeo, SITE_NAME } from "@/lib/seo";

const MANAGED_SELECTOR = "meta[data-route-seo], link[data-route-seo]";
const JSON_LD_ID = "route-seo-jsonld";

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.setAttribute("data-route-seo", "true");
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    element.setAttribute("data-route-seo", "true");
    document.head.appendChild(element);
  }

  element.href = href;
}

export default function RouteSEO() {
  const location = useLocation();

  useEffect(() => {
    const seo = mergeSeo(getSeoForPath(location.pathname));
    const canonicalUrl = absoluteUrl(seo.path);
    const imageUrl = absoluteUrl(seo.image);

    document.title = seo.title;
    document.documentElement.lang = "en";

    document.head
      .querySelectorAll(`${MANAGED_SELECTOR}[data-route-owned="true"]`)
      .forEach((element) => element.remove());

    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "keywords", seo.keywords.join(", "));
    upsertMeta("name", "robots", seo.robots);
    upsertMeta("name", "author", SITE_NAME);
    upsertMeta("name", "application-name", SITE_NAME);
    upsertMeta("name", "theme-color", "#f0c93a");

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", seo.type);
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", `${SITE_NAME} research platform`);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:image", imageUrl);

    upsertLink("canonical", canonicalUrl);

    const existingJsonLd = document.getElementById(JSON_LD_ID);
    existingJsonLd?.remove();

    if (Object.keys(seo.jsonLd).length > 0) {
      const script = document.createElement("script");
      script.id = JSON_LD_ID;
      script.type = "application/ld+json";
      script.text = JSON.stringify(seo.jsonLd);
      document.head.appendChild(script);
    }
  }, [location.pathname]);

  return null;
}
