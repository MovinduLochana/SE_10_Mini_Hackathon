"use client";

import { useState } from "react";
import {
  ArrowForwardIcon,
  CameraIcon,
  DownloadIcon,
  LinkIcon,
  PdfIcon,
  SendIcon,
} from "@/components/icons";
import type { DistributionChannel } from "@/lib/mock-data";

const ICONS: Record<string, typeof SendIcon> = {
  whatsapp: SendIcon,
  instagram: CameraIcon,
  "standee-pdf": PdfIcon,
};

const ICON_TONE: Record<string, string> = {
  whatsapp: "bg-secondary text-white",
  instagram: "bg-primary text-white",
  "standee-pdf": "bg-slate-200 text-primary",
};

export function DistributionList({
  channels,
}: {
  channels: DistributionChannel[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleClick(channel: DistributionChannel) {
    if (channel.action === "link" && channel.href) {
      window.open(channel.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (channel.action === "copy" && channel.href) {
      try {
        await navigator.clipboard.writeText(channel.href);
      } catch {
        // Clipboard API unavailable — fail silently.
      }
      setCopiedId(channel.id);
      setTimeout(() => setCopiedId((current) => (current === channel.id ? null : current)), 2000);
      return;
    }
    // "download": no real asset yet — this is a non-functional placeholder.
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-label-sm font-semibold tracking-wide text-slate-500 uppercase">
        1-Click Distribution
      </span>
      <div className="flex flex-col gap-1">
        {channels.map((channel) => {
          const Icon = ICONS[channel.id] ?? SendIcon;
          const trailing =
            channel.action === "link" ? (
              <ArrowForwardIcon className="h-4 w-4 text-slate-500" />
            ) : channel.action === "copy" ? (
              <LinkIcon className="h-4 w-4 text-slate-500" />
            ) : (
              <DownloadIcon className="h-4 w-4 text-slate-500" />
            );

          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleClick(channel)}
              className="group flex items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_TONE[channel.id] ?? "bg-slate-200 text-primary"}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-label-md text-slate-900 transition-colors group-hover:text-primary">
                    {channel.label}
                  </span>
                  <span className="text-body-sm text-slate-500">
                    {copiedId === channel.id ? "Link copied!" : channel.description}
                  </span>
                </div>
              </div>
              {trailing}
            </button>
          );
        })}
      </div>
    </div>
  );
}
