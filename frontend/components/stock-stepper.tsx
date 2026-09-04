"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/icons";

export interface StockStepperProps {
  initialValue: number;
  onChange?: (value: number) => void;
}

export function StockStepper({ initialValue, onChange }: StockStepperProps) {
  const [value, setValue] = useState(initialValue);

  function update(next: number) {
    const clamped = Math.max(0, next);
    setValue(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="inline-flex items-center rounded-lg bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={() => update(value - 1)}
        aria-label="Decrease stock"
        className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-900 hover:bg-slate-100"
      >
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span className="font-tabular w-8 text-center text-data-md font-semibold text-slate-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => update(value + 1)}
        aria-label="Increase stock"
        className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-900 hover:bg-slate-100"
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
