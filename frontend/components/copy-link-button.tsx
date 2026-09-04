"use client";

import { useState } from "react";
import { CopyIcon, CheckCircleIcon } from "@/components/icons";

export interface CopyLinkButtonProps {
  url: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyLinkButton({
  url,
  label = "Copy Link",
  copiedLabel = "Copied!",
  className = "",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-label-md font-semibold text-slate-900 shadow-level-1 transition-colors hover:bg-slate-50 ${className}`}
    >
      {copied ? (
        <CheckCircleIcon className="h-4 w-4 text-secondary" />
      ) : (
        <CopyIcon className="h-4 w-4 text-primary" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
