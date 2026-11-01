/**
 * Refer a friend: the invite code from a /r/:code link, kept for 30 days in this browser so it still counts if the
 * person signs up later (email or Google). The server ignores a code of the wrong account type.
 */
const KEY = "js-invite";
const DAYS = 30;

export function saveInvite(code: string, type: "researcher" | "participant") {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, type, at: Date.now() }));
  } catch {
    /* private mode: the ?ref= in the address still works */
  }
}

/** The saved invite, or the one in the address (?ref=). */
export function readInvite(fromUrl?: string | null): { code: string; type?: "researcher" | "participant" } | null {
  if (fromUrl) return { code: fromUrl.trim().toUpperCase() };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!v?.code || Date.now() - v.at > DAYS * 864e5) return null;
    return { code: v.code, type: v.type };
  } catch {
    return null;
  }
}

/** The code to send with a sign-up, when it's for this kind of account. */
export const inviteCodeFor = (type: "researcher" | "participant", fromUrl?: string | null) => {
  const i = readInvite(fromUrl);
  return i && (!i.type || i.type === type) ? i.code : undefined;
};

export function clearInvite() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** The text participants share on WhatsApp. */
export const inviteMessage = (link: string) => `I get paid to take part in research studies on joinStudy. Join with my link: ${link}`;

/** Share links. */
export const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
export const linkedinShare = (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
export const emailShare = (subject: string, body: string) => `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
