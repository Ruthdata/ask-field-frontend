import type { SavedMethod } from "@/redux/api/moneyApi";

/** "GTBank ••6789", "M-Pesa ••0142", "PayPal" (Participant Stage 6). */
export function methodName(m: Pick<SavedMethod, "method" | "institution" | "last4"> | null) {
  if (!m) return "";
  if (m.method === "paypal") return `PayPal ••${m.last4}`;
  const what = m.institution || (m.method === "bank" ? "Bank" : m.method === "airtime" ? "Airtime" : "Mobile money");
  return `${what}${m.method === "airtime" ? " airtime" : ""} ••${m.last4}`;
}
