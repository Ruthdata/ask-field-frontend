import { useState, type FormEvent, type ReactNode } from "react";
import { formatApiError } from "@/utils/helper";
import { useSubmitLeadMutation, type LeadPayload, type LeadType } from "@/redux/api/leadsApi";

/** A calm single-column page inside the public site's nav and footer. */
export function PublicPage({ label, title, lede, children }: { label: string; title: string; lede: ReactNode; children: ReactNode }) {
  return (
    <main className="mk mk-page">
      <div className="pub">
        <span className="label">{label}</span>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {children}
      </div>
    </main>
  );
}

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** Which lead field this answer goes to. Anything else is sent under `details`. */
  maps?: "name" | "email" | "organization" | "country" | "message" | "role";
};

/** A short form that posts to POST /leads and swaps itself for a thank-you note. */
export function LeadForm({ type, fields, submitLabel, success }: { type: LeadType; fields: FieldDef[]; submitLabel: string; success: ReactNode }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? ""])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [submit, { isLoading }] = useSubmitLeadMutation();

  if (done) {
    return (
      <div className="note ok" role="status">
        <span>{success}</span>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !v[f.name]?.trim()) er[f.name] = `Enter ${f.label.toLowerCase()}.`;
      if (f.type === "email" && v[f.name] && !/^\S+@\S+\.\S+$/.test(v[f.name])) er[f.name] = "Enter a valid email.";
    });
    setErrors(er);
    if (Object.keys(er).length) return;

    const body: LeadPayload = { type, email: "", source: window.location.pathname, details: {} };
    fields.forEach((f) => {
      const value = v[f.name]?.trim();
      if (!value) return;
      if (f.maps) (body as unknown as Record<string, string>)[f.maps] = value;
      else body.details![f.label] = value;
    });
    try {
      setServerError("");
      await submit(body).unwrap();
      setDone(true);
    } catch (err) {
      setServerError(formatApiError(err) || "Something went wrong. Please try again.");
    }
  };

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {fields.map((f) => {
        const id = `f-${f.name}`;
        const set = (value: string) => setV({ ...v, [f.name]: value });
        return (
          <div className="field" key={f.name}>
            <label htmlFor={id}>
              {f.label}
              {!f.required && <span className="opt"> (optional)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea id={id} value={v[f.name]} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.name]} />
            ) : f.type === "select" ? (
              <select id={id} value={v[f.name]} onChange={(e) => set(e.target.value)}>
                {f.options!.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input id={id} type={f.type ?? "text"} value={v[f.name]} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.name]} />
            )}
            {f.hint && !errors[f.name] && <span className="hint">{f.hint}</span>}
            {errors[f.name] && <span className="err">{errors[f.name]}</span>}
          </div>
        );
      })}
      {serverError && (
        <div className="note bad" role="alert">
          {serverError}
        </div>
      )}
      <div>
        <button className="btn btn-sun" type="submit" disabled={isLoading}>
          {isLoading ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
















// import { useState, type FormEvent, type ReactNode } from "react";
// import { formatApiError } from "@/utils/helper";
// import { useSubmitLeadMutation, type LeadPayload, type LeadType } from "@/redux/api/leadsApi";

// /** A calm single-column page inside the public site's nav and footer. */
// export function PublicPage({ label, title, lede, children }: { label: string; title: string; lede: ReactNode; children: ReactNode }) {
//   return (
//     <main className="mk mk-page">
//       <div className="pub">
//         <span className="label">{label}</span>
//         <h1>{title}</h1>
//         <p className="lede">{lede}</p>
//         {children}
//       </div>
//     </main>
//   );
// }

// export type FieldDef = {
//   name: string;
//   label: string;
//   type?: "text" | "email" | "textarea" | "select";
//   options?: string[];
//   required?: boolean;
//   hint?: string;
//   placeholder?: string;
//   /** Which lead field this answer goes to. Anything else is sent under `details`. */
//   maps?: "name" | "email" | "organization" | "country" | "message" | "role";
// };

// /** A short form that posts to POST /leads and swaps itself for a thank-you note. */
// export function LeadForm({ type, fields, submitLabel, success }: { type: LeadType; fields: FieldDef[]; submitLabel: string; success: ReactNode }) {
//   const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? ""])));
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [serverError, setServerError] = useState("");
//   const [done, setDone] = useState(false);
//   const [submit, { isLoading }] = useSubmitLeadMutation();

//   if (done) {
//     return (
//       <div className="note ok" role="status">
//         <span>{success}</span>
//       </div>
//     );
//   }

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     const er: Record<string, string> = {};
//     fields.forEach((f) => {
//       if (f.required && !v[f.name]?.trim()) er[f.name] = `Enter ${f.label.toLowerCase()}.`;
//       if (f.type === "email" && v[f.name] && !/^\S+@\S+\.\S+$/.test(v[f.name])) er[f.name] = "Enter a valid email.";
//     });
//     setErrors(er);
//     if (Object.keys(er).length) return;

//     const body: LeadPayload = { type, email: "", source: window.location.pathname, details: {} };
//     fields.forEach((f) => {
//       const value = v[f.name]?.trim();
//       if (!value) return;
//       if (f.maps) (body as unknown as Record<string, string>)[f.maps] = value;
//       else body.details![f.label] = value;
//     });
//     try {
//       setServerError("");
//       await submit(body).unwrap();
//       setDone(true);
//     } catch (err) {
//       setServerError(formatApiError(err) || "Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <form className="form" onSubmit={onSubmit} noValidate>
//       {fields.map((f) => {
//         const id = `f-${f.name}`;
//         const set = (value: string) => setV({ ...v, [f.name]: value });
//         return (
//           <div className="field" key={f.name}>
//             <label htmlFor={id}>
//               {f.label}
//               {!f.required && <span className="opt"> (optional)</span>}
//             </label>
//             {f.type === "textarea" ? (
//               <textarea id={id} value={v[f.name]} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.name]} />
//             ) : f.type === "select" ? (
//               <select id={id} value={v[f.name]} onChange={(e) => set(e.target.value)}>
//                 {f.options!.map((o) => (
//                   <option key={o}>{o}</option>
//                 ))}
//               </select>
//             ) : (
//               <input id={id} type={f.type ?? "text"} value={v[f.name]} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} aria-invalid={!!errors[f.name]} />
//             )}
//             {f.hint && !errors[f.name] && <span className="hint">{f.hint}</span>}
//             {errors[f.name] && <span className="err">{errors[f.name]}</span>}
//           </div>
//         );
//       })}
//       {serverError && (
//         <div className="note bad" role="alert">
//           {serverError}
//         </div>
//       )}
//       <div>
//         <button className="btn btn-sun" type="submit" disabled={isLoading}>
//           {isLoading ? "Sending…" : submitLabel}
//         </button>
//       </div>
//     </form>
//   );
// }
