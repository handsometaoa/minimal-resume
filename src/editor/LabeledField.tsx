import type { ReactNode } from "react";

interface LabeledFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export const LabeledField = ({ label, hint, children }: LabeledFieldProps) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint ? <small className="field__hint">{hint}</small> : null}
  </label>
);
