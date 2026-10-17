import type { AccountType } from "@/lib/session";

/** Shown when one email has both a researcher and a participant account. */
export default function AccountChoice({ choices, onPick, busy }: { choices: AccountType[]; onPick: (t: AccountType) => void; busy?: boolean }) {
  return (
    <div className="alert plain" role="group" aria-labelledby="choose-account">
      <span id="choose-account">This email has two accounts. Which one do you want to open?</span>
      <div className="row">
        {choices.map((t) => (
          <button key={t} type="button" className={`btn ${t === "researcher" ? "btn-ink" : "btn-outline"}`} disabled={busy} onClick={() => onPick(t)}>
            {t === "researcher" ? "Researcher account" : "Participant account"}
          </button>
        ))}
      </div>
    </div>
  );
}
