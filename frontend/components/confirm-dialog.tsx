"use client";

import { useEffect } from "react";
import { WarningIcon } from "@/components/icons";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-5 shadow-level-3"
      >
        <div className="flex items-start gap-3">
          {tone === "destructive" ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive-bg text-destructive">
              <WarningIcon className="h-5 w-5" />
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <h2 id="confirm-dialog-title" className="text-title-sm text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="text-body-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-label-md font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-1.5 text-label-md font-semibold text-white transition-colors ${
              tone === "destructive"
                ? "bg-destructive hover:opacity-90"
                : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
