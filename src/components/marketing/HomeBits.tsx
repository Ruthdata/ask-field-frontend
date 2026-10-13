import { useEffect, useState } from "react";

const WORDS = ["Yoruba", "Igbo", "Hausa", "Pidgin", "Twi", "Swahili"];

export function LanguageWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 1900);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="word flip" key={i}>
      {WORDS[i]}
    </span>
  );
}

export function SampleTask() {
  const [pick, setPick] = useState<"A" | "B" | null>(null);
  return (
    <div className="task" aria-label="Sample evaluation task">
      <div className="top label">
        <span>Sample task</span>
        <span>Yoruba</span>
      </div>
      <p className="prompt">&ldquo;Kí ni mo lè ṣe láti dín owó iná mànàmáná kù?&rdquo;</p>
      <p className="tr">How can I lower my electricity bill? Pick the better reply.</p>
      {(["A", "B"] as const).map((k) => (
        <button key={k} className="choice" type="button" aria-pressed={pick === k} onClick={() => setPick(k)}>
          <span className="b" />
          <span>
            <b>{k}.</b>{" "}
            {k === "A"
              ? "Track usage on your prepaid meter and switch appliances off at the socket. Fluent, natural Yoruba."
              : "Apply for a US energy rebate. Translated word for word."}
          </span>
        </button>
      ))}
      <div className="foot label">
        <span>fluency · accuracy · local fit</span>
        <span className={`ok${pick ? " show" : ""}`}>saved</span>
      </div>
    </div>
  );
}
