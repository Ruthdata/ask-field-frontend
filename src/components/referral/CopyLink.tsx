import "@/styles/referral.css";
import { useState } from "react";

/** The invite link with a Copy button. Works on phones (selects the text when the clipboard isn't allowed). */
export default function CopyLink({ link, dark = false }: { link: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async (input: HTMLInputElement | null) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      input?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="ref-copy" data-dark={dark || undefined}>
      <label htmlFor="ref-link" className="sr-only">Your invite link</label>
      <input id="ref-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" onClick={(e) => copy(e.currentTarget.previousElementSibling as HTMLInputElement)} aria-live="polite">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
