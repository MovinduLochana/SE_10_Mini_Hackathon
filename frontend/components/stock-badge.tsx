import type { StockStatus } from "@/lib/mock-data";

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  "in-stock": {
    label: "In Stock",
    bg: "bg-secondary-bg",
    text: "text-secondary-text",
    border: "border-secondary-border",
    dot: "bg-secondary",
  },
  "low-stock": {
    label: "Low Stock",
    bg: "bg-warning-bg",
    text: "text-warning-text",
    border: "border-warning-border",
    dot: "bg-warning",
  },
  "out-of-stock": {
    label: "Out of Stock",
    bg: "bg-neutral-bg",
    text: "text-neutral-text",
    border: "border-neutral-border",
    dot: "bg-neutral-dot",
  },
};

export interface StockBadgeProps {
  status: StockStatus;
  count: number;
}

export function StockBadge({ status, count }: StockBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-label-sm font-semibold whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="font-tabular">{count}</span> {config.label}
    </span>
  );
}
