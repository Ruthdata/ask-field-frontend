import { useId } from "react";

/** A number with − and + buttons. You can also type into it. */
export default function Stepper({
  label, hint, value, onChange, step = 1, min = 1, max = 100000, prefix = "", big = false,
}: {
  label: string; hint?: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; prefix?: string; big?: boolean;
}) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const field = (
    <div className={`ja-step${big ? " big" : ""}`}>
      <button type="button" aria-label={`Less: ${label}`} onClick={() => onChange(clamp(value - step))}>−</button>
      {prefix && <span aria-hidden="true" style={{ fontFamily: "var(--mono)", marginRight: -8 }}>{prefix}</span>}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? min : clamp(Number(e.target.value)))}
      />
      <button type="button" aria-label={`More: ${label}`} onClick={() => onChange(clamp(value + step))}>+</button>
    </div>
  );
  if (big) {
    return (
      <div className="ja-est-row">
        <div className="l">
          <label htmlFor={id}>{label}</label>
          {hint && <span className="ja-small">{hint}</span>}
        </div>
        {field}
      </div>
    );
  }
  return (
    <div className="ja-row">
      <label htmlFor={id} style={{ fontSize: 15 }}>{label}</label>
      {field}
    </div>
  );
}
