interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoFocus?: boolean;
}

export default function TextField({ id, label, value, onChange, type = "text", autoComplete, placeholder, hint, error, autoFocus }: Props) {
  const described = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={described}
        autoFocus={autoFocus}
        spellCheck={type === "email" ? false : undefined}
      />
      {error ? <span className="err" id={`${id}-err`}>{error}</span> : hint ? <span className="hint" id={`${id}-hint`}>{hint}</span> : null}
    </div>
  );
}
