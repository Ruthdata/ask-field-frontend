/** Times and dates for Stage 6 pages. `timeZone` is optional: participants see their own. */
export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function dayLabel(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone }).format(new Date(iso));
}
export function timeLabel(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}
export const shortDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
export const dayKey = (iso: string, timeZone?: string) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).format(new Date(iso));

/** "3h 10m ago", "2 days ago", "just now". */
export function ago(iso: string, now = Date.now()) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h${m % 60 ? ` ${m % 60}m` : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** Groups items by their day, keeping order. */
export function byDay<T>(items: T[], at: (x: T) => string, timeZone?: string) {
  const out: { key: string; label: string; items: T[] }[] = [];
  for (const x of items) {
    const key = dayKey(at(x), timeZone);
    let g = out.find((o) => o.key === key);
    if (!g) out.push((g = { key, label: dayLabel(at(x), timeZone), items: [] }));
    g.items.push(x);
  }
  return out;
}

export const STATUS_WORDS: Record<string, string> = {
  "in-progress": "taking it now",
  submitted: "to review",
  approved: "approved",
  rejected: "rejected",
  "no-show": "didn't join",
  "screened-out": "screened out",
};

/** "in 2 days", "in 5 hours", "within the hour". */
export function untilLabel(iso: string, now: number) {
  const h = Math.round((new Date(iso).getTime() - now) / 3600e3);
  if (h <= 1) return "within the hour";
  if (h < 24) return `in ${h} hours`;
  const d = Math.round(h / 24);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}
