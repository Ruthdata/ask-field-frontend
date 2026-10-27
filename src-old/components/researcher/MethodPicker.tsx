import type { StudyMethod } from "@/redux/api/homeApi";
import { METHODS } from "@/lib/study";

/** "What do you want to run?" The method from setup is marked, and picked unless they choose another. */
export default function MethodPicker({
  value, onChange, fromSetup, labelledBy, light = false,
}: { value: StudyMethod; onChange: (m: StudyMethod) => void; fromSetup?: string; labelledBy: string; light?: boolean }) {
  const move = (dir: number) => {
    const i = METHODS.findIndex((m) => m.id === value);
    const next = METHODS[(i + dir + METHODS.length) % METHODS.length];
    onChange(next.id);
    document.getElementById(`m-${next.id}`)?.focus();
  };
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={`ja-tiles${light ? " light" : ""}`}>
      {METHODS.map((m) => {
        const on = m.id === value;
        return (
          <button
            key={m.id}
            id={`m-${m.id}`}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className="ja-tile"
            onClick={() => onChange(m.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            }}
          >
            <span className="t">{m.label}{m.id === fromSetup && <span className="tag">from setup</span>}</span>
            <span className="n">{m.note}</span>
          </button>
        );
      })}
    </div>
  );
}
