import { useCallback, useEffect, useRef, useState } from "react";
import { useSavePlanStepMutation, type PlanStep } from "@/redux/api/planApi";
import { readProblem } from "@/lib/session";

type Status = "saved" | "saving" | "unsaved" | "error";

/**
 * One planner step's form state. Changes autosave after a pause; `submit` saves and checks the whole step.
 * Field errors come back from the server keyed by field ("url", "consent.text", "questions"…).
 */
export function useStepDraft<T extends Record<string, unknown>>(id: string, step: PlanStep, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("saved");
  const [save] = useSavePlanStepMutation();
  const latest = useRef(value);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(async (final = false) => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setStatus("saving");
    try {
      const res = await save({ id, step, data: latest.current, final }).unwrap();
      setErrors(res.data.fields || {});
      setStatus("saved");
      return { ok: true as const };
    } catch (err) {
      const p = readProblem(err);
      const fields = (p.data?.fields as Record<string, string> | undefined) ?? {};
      setErrors(fields);
      setStatus(p.code === "step_incomplete" ? "saved" : "error");
      return { ok: false as const, message: p.message, fields };
    }
  }, [id, save, step]);

  const update = useCallback((patch: Partial<T>) => {
    setValue((v) => {
      const next = { ...v, ...patch };
      latest.current = next;
      return next;
    });
    setErrors((e) => {
      const copy = { ...e };
      for (const k of Object.keys(patch)) for (const ek of Object.keys(copy)) if (ek === k || ek.startsWith(`${k}.`)) delete copy[ek];
      return copy;
    });
    setStatus("unsaved");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      void flush(false);
    }, 1200);
  }, [flush]);

  // Save anything pending when leaving the step.
  useEffect(() => () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      void save({ id, step, data: latest.current, final: false });
    }
  }, [id, save, step]);

  return { value, update, errors, status, flush };
}

export const statusText = (s: Status) => (s === "saving" ? "Saving…" : s === "unsaved" ? "Unsaved changes" : s === "error" ? "Couldn't save. Check your connection." : "Draft · saved");
