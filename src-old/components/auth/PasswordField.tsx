import { useState } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "new-password" | "current-password";
  placeholder?: string;
  error?: string;
  aside?: React.ReactNode;
}

export default function PasswordField({ id, label, value, onChange, autoComplete, placeholder, error, aside }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="pass">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <button type="button" onClick={() => setShow(!show)} aria-pressed={show} aria-label={show ? "Hide password" : "Show password"}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <span className="err" id={`${id}-err`}>{error}</span>}
    </div>
  );
}
