"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AddCircleIcon,
  CategoryIcon,
  DashboardIcon,
  InventoryIcon,
  SettingsIcon,
  StorefrontIcon,
  SyncIcon,
  ExternalLinkIcon,
} from "@/components/icons";
import type { ShopInfo } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, exact: false },
  { href: "/inventory", label: "Inventory Manager", icon: InventoryIcon, exact: true },
  { href: "/inventory/new", label: "Add Product", icon: AddCircleIcon, exact: false },
  { href: "/categories", label: "Categories", icon: CategoryIcon, exact: false },
  { href: "/shop-settings", label: "Shop Settings", icon: SettingsIcon, exact: false },
] as const;

export function Sidebar({ shop }: { shop: ShopInfo }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar-collapsed shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white xl:w-sidebar-expanded">
      <div className="flex flex-col">
        <div className="flex h-16 items-center gap-2.5 px-3 xl:px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <StorefrontIcon className="h-4.5 w-4.5" />
          </div>
          <div className="hidden flex-col leading-tight xl:flex">
            <span className="text-title-sm text-slate-900">Artisan Commerce</span>
            <span className="text-label-sm text-slate-500">Merchant Console</span>
          </div>
        </div>

        <div className="px-2 py-2 xl:px-3">
          <div className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 p-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="hidden min-w-0 flex-col xl:flex">
              <span className="text-label-sm tracking-wide text-slate-500 uppercase">
                Active Store
              </span>
              <span className="truncate text-title-sm text-slate-900">{shop.name}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white px-1.5 py-1 shadow-level-1 xl:px-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span className="hidden text-label-sm font-semibold text-secondary-text xl:inline">
                Live
              </span>
            </div>
          </div>
        </div>

        <nav className="mt-1 flex flex-col gap-1 px-2 xl:px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2 text-body-md transition-colors xl:justify-start ${
                  isActive
                    ? "bg-primary font-semibold text-white shadow-level-1"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 px-2 pb-4 xl:px-3">
        <Link
          href="/dashboard"
          title="Store Preview"
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-900 transition-colors hover:bg-slate-100 xl:justify-between"
        >
          <span className="flex items-center gap-2">
            <StorefrontIcon className="h-4 w-4 text-primary" />
            <span className="hidden text-label-md xl:inline">Store Preview</span>
          </span>
          <ExternalLinkIcon className="hidden h-3.5 w-3.5 text-slate-500 xl:inline" />
        </Link>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 p-2 xl:flex-row xl:items-center xl:justify-between">
          <span className="flex items-center gap-2 text-label-sm text-slate-500">
            <SyncIcon className="h-4 w-4 text-secondary" />
            <span className="hidden xl:inline">Live Catalog Sync</span>
          </span>
          <span className="font-tabular text-data-md font-semibold text-slate-900">
            {shop.catalogSyncPercent}%
          </span>
        </div>
      </div>
    </aside>
  );
}
