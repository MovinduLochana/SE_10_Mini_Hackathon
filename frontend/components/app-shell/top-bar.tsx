import Link from "next/link";
import {
  AddCircleIcon,
  BellIcon,
  ExternalLinkIcon,
  QrIcon,
  SearchIcon,
} from "@/components/icons";
import type { ShopInfo } from "@/lib/mock-data";
import { getStorefrontUrl } from "@/lib/mock-data";

const OWNER = { name: "Elena Vance", role: "Shop Owner", avatarUrl: null as string | null };

export function TopBar({ shop }: { shop: ShopInfo }) {
  const storefrontUrl = getStorefrontUrl(shop);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search inventory SKU, title, tag..."
            className="w-full rounded-lg border border-transparent bg-slate-50 py-2 pr-3 pl-9 text-body-sm text-slate-900 placeholder:text-slate-500 focus:border-primary-focus focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-label-md font-semibold text-slate-900 transition-colors hover:bg-slate-100 lg:inline-flex"
        >
          <ExternalLinkIcon className="h-4 w-4 text-slate-500" />
          View Storefront
        </a>
        <button
          type="button"
          title="Share QR Code"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-900 transition-colors hover:bg-slate-100"
        >
          <QrIcon className="h-4.5 w-4.5" />
        </button>
        <Link
          href="/add-product"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-label-md font-semibold text-white shadow-level-1 transition-colors hover:bg-primary-hover sm:px-4"
        >
          <AddCircleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Add Product</span>
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="hidden items-center gap-2 pl-1 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-label-md font-semibold text-white">
            {OWNER.name.charAt(0)}
          </div>
          <div className="hidden flex-col text-left lg:flex">
            <span className="text-label-md leading-tight text-slate-900">{OWNER.name}</span>
            <span className="text-label-sm text-slate-500">{OWNER.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
