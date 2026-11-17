import type { ReactNode } from "react";

interface LabeledFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

/** 保持 <label> 包裹以获得原生控件隐式关联 */
export const LabeledField = ({ label, hint, children }: LabeledFieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
    {hint ? <small className="text-xs leading-snug text-muted-foreground/70">{hint}</small> : null}
  </label>
);
