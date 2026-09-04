import type { ReactNode } from "react";

export type MetricCardTone = "primary" | "warning" | "secondary" | "neutral";

const TONE_CLASSES: Record<MetricCardTone, string> = {
  primary: "bg-slate-50 text-primary",
  warning: "bg-destructive-bg text-destructive",
  secondary: "bg-secondary-bg text-secondary-text",
  neutral: "bg-slate-50 text-slate-500",
};

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon: ReactNode;
  tone?: MetricCardTone;
  footer?: ReactNode;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  tone = "neutral",
  footer,
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-level-1 transition-shadow hover:shadow-level-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-label-md font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-tabular text-headline-xl font-bold text-slate-900">
            {value}
          </span>
          {unit ? (
            <span className="text-body-md text-slate-500">{unit}</span>
          ) : null}
        </div>
        {footer}
      </div>
    </div>
  );
}
