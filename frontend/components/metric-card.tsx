import type { ReactNode } from "react";

export type MetricCardTone = "primary" | "warning" | "secondary" | "neutral" | "destructive";

const TONE_CLASSES: Record<MetricCardTone, string> = {
  primary: "bg-slate-50 text-primary",
  warning: "bg-warning-bg text-warning-text",
  secondary: "bg-secondary-bg text-secondary-text",
  neutral: "bg-slate-50 text-slate-500",
  destructive: "bg-destructive-bg text-destructive",
};

const PROGRESS_TRACK_CLASSES: Record<MetricCardTone, string> = {
  primary: "bg-primary",
  warning: "bg-warning",
  secondary: "bg-secondary",
  neutral: "bg-slate-400",
  destructive: "bg-destructive",
};

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon: ReactNode;
  tone?: MetricCardTone;
  footer?: ReactNode;
  /** 0-100. When set, renders a thin progress bar under the value/footer. */
  progressPercent?: number;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  tone = "neutral",
  footer,
  progressPercent,
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
        {progressPercent !== undefined ? (
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${PROGRESS_TRACK_CLASSES[tone]}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
