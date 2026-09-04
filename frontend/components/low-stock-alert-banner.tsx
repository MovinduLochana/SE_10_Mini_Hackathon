"use client";

import { useState } from "react";
import { AddCircleIcon, CloseIcon, WarningIcon } from "@/components/icons";
import type { LowStockAlert } from "@/lib/mock-data";

export interface LowStockAlertBannerProps {
  alert: LowStockAlert;
  onQuickRestock?: (productId: string) => void;
}

export function LowStockAlertBanner({
  alert,
  onQuickRestock,
}: LowStockAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [restocked, setRestocked] = useState(false);

  if (dismissed) return null;

  return (
    <section className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-level-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning-text">
          <WarningIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-title-sm font-semibold text-slate-900">
              {alert.productName}
            </span>
            <span className="rounded bg-destructive-bg px-2 py-0.5 text-label-sm font-semibold text-destructive">
              Only {alert.unitsLeft} left
            </span>
          </div>
          <span className="text-body-sm text-slate-500">
            Current reserve is below minimum safety threshold (
            {alert.thresholdUnits} units).
          </span>
        </div>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={restocked}
          onClick={() => {
            setRestocked(true);
            onQuickRestock?.(alert.productId);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-4 py-1.5 text-label-md font-semibold text-primary shadow-level-1 transition-colors hover:bg-slate-100 disabled:cursor-default disabled:text-secondary-text sm:flex-none"
        >
          <AddCircleIcon className="h-4 w-4" />
          <span>{restocked ? "Restocked +5" : "+5 Quick Restock"}</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
