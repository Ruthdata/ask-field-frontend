import { useId, type ReactNode } from "react";

/** Small building blocks for the planner. Every input gets a real label, and errors sit next to their field. */

export function Field({ label, hint, error, children, id }: { label: ReactNode; hint?: ReactNode; error?: string; children: (id: string, describedBy?: string) => ReactNode; id?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const hid = hint ? `${fid}-h` : undefined;
  const eid = error ? `${fid}-e` : undefined;
  const describedBy = [hid, eid].filter(Boolean).join(" ") || undefined;
  return (
    <div className="jp-fld">
      <label htmlFor={fid}>{label}</label>
      {children(fid, describedBy)}
      {hint && <span id={hid} className="jp-hint">{hint}</span>}
      {error && <span id={eid} className="jp-err" role="alert">{error}</span>}
    </div>
  );
}

export function ErrorLine({ error }: { error?: string }) {
  return error ? <span className="jp-err" role="alert">{error}</span> : null;
}

/** A group of radio cards (one choice). Arrow keys move between them. */
export function Choice<T extends string>({ label, value, onChange, options, grid = false, error }: {
  label?: string; value: T | undefined; onChange: (v: T) => void; grid?: boolean; error?: string;
  options: { value: T; title: string; text?: string; disabled?: boolean }[];
}) {
  const gid = useId();
  const enabled = options.filter((o) => !o.disabled);
  const move = (dir: number) => {
    const i = enabled.findIndex((o) => o.value === value);
    const next = enabled[(i + dir + enabled.length) % enabled.length];
    onChange(next.value);
    document.getElementById(`${gid}-${next.value}`)?.focus();
  };
  return (
    <div className="jp-fld">
      {label && <span id={`${gid}-l`} className="jp-lbl">{label}</span>}
      <div role="radiogroup" aria-labelledby={label ? `${gid}-l` : undefined} className={`jp-opts${grid ? " grid" : ""}`}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              id={`${gid}-${o.value}`}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (!value && o === enabled[0]) ? 0 : -1}
              disabled={o.disabled}
              className="jp-opt"
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); move(1); }
                if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
              }}
            >
              <span className="jp-dot" aria-hidden="true" />
              <span className="jp-ot"><b>{o.title}</b>{o.text && <span>{o.text}</span>}</span>
            </button>
          );
        })}
      </div>
      <ErrorLine error={error} />
    </div>
  );
}

export function Toggle({ on, onChange, title, text }: { on: boolean; onChange: (v: boolean) => void; title: string; text?: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="jp-tog" onClick={() => onChange(!on)}>
      <span className="jp-sw" aria-hidden="true" />
      <span className="jp-ot"><b>{title}</b>{text && <span>{text}</span>}</span>
    </button>
  );
}

/** Toggle buttons. `multi` keeps a list; otherwise exactly one is on. */
export function Chips({ label, hint, options, selected, onChange, error, disabledNote }: {
  label: string; hint?: string; options: { value: string; label: string; disabled?: boolean }[]; selected: string[]; onChange: (v: string[]) => void; error?: string; disabledNote?: string;
}) {
  const gid = useId();
  return (
    <div className="jp-fld" role="group" aria-labelledby={`${gid}-l`}>
      <span id={`${gid}-l`} className="jp-lbl">{label}</span>
      {hint && <span className="jp-hint" style={{ marginTop: -4 }}>{hint}</span>}
      <div className="jp-chips">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button key={o.value} type="button" className="jp-chip" aria-pressed={on} disabled={o.disabled}
              onClick={() => onChange(on ? selected.filter((x) => x !== o.value) : [...selected, o.value])}>
              {o.label}{o.disabled && disabledNote ? ` · ${disabledNote}` : ""}
            </button>
          );
        })}
      </div>
      <ErrorLine error={error} />
    </div>
  );
}

/** Number input that keeps empty as undefined (so "required" messages make sense). */
export function NumberInput({ id, value, onChange, min, max, step, describedBy, invalid, ...rest }: {
  id: string; value: number | undefined; onChange: (v: number | undefined) => void; min?: number; max?: number; step?: number; describedBy?: string; invalid?: boolean; style?: React.CSSProperties; "aria-label"?: string;
}) {
  return (
    <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step ?? "any"} value={value ?? ""} aria-describedby={describedBy} aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} {...rest} />
  );
}
