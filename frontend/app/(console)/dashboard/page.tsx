import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { StockBadge } from "@/components/stock-badge";
import { StockStepper } from "@/components/stock-stepper";
import { CopyLinkButton } from "@/components/copy-link-button";
import { LowStockAlertBanner } from "@/components/low-stock-alert-banner";
import { WeeklyEngagementChart } from "@/components/weekly-engagement-chart";
import { StorefrontQrCode } from "@/components/storefront-qr-code";
import { DistributionList } from "@/components/distribution-list";
import {
  ArrowForwardIcon,
  CategoryIcon,
  ChatIcon,
  CheckCircleIcon,
  EyeIcon,
  InventoryIcon,
  LightbulbIcon,
  PrinterIcon,
  TrendingUpIcon,
  WarningIcon,
} from "@/components/icons";
import {
  getDashboardMetrics,
  getDistributionChannels,
  getLowStockAlert,
  getRecentInventory,
  getShopInfo,
  getStorefrontUrl,
  getTotalProductCount,
  getWeeklyEngagement,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const shop = getShopInfo();
  const metrics = getDashboardMetrics();
  const alert = getLowStockAlert();
  const products = getRecentInventory();
  const totalProducts = getTotalProductCount();
  const engagement = getWeeklyEngagement();
  const channels = getDistributionChannels(shop);
  const storefrontUrl = getStorefrontUrl(shop);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-xl bg-white shadow-level-1">
        <div className="pointer-events-none absolute -top-24 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-80 w-80 rounded-full bg-secondary/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 p-6 lg:flex-row lg:items-center">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-bg px-2 py-0.5 text-secondary-text">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="text-label-sm font-semibold tracking-wider uppercase">
                Live &amp; Synchronized
              </span>
            </div>
            <h1 className="text-headline-xl-mobile font-bold text-slate-900 sm:text-headline-xl">
              Welcome back, {shop.ownerName}!
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-md text-slate-500">
              <span>Your boutique catalog is live at</span>
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-tabular font-semibold text-primary hover:underline"
              >
                /shop/{shop.slug}
              </a>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-label-md text-secondary-text">
                <EyeIcon className="h-4 w-4" />
                {shop.viewsToday} views today
              </span>
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <CopyLinkButton url={storefrontUrl} className="flex-1 sm:flex-none" />
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-white shadow-level-1 transition-colors hover:bg-primary-hover sm:flex-none"
            >
              <PrinterIcon className="h-4 w-4" />
              Download Standee Card
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-6 py-2.5 text-label-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-slate-900">
              <CheckCircleIcon className="h-3.5 w-3.5 text-secondary" />
              {shop.uptimePercent}% Storefront Uptime
            </span>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden sm:inline">
              Next automated inventory sync in {shop.nextSyncMinutes}m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Catalog Storage</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${shop.catalogStoragePercent}%` }}
              />
            </div>
            <span className="font-tabular font-semibold text-slate-900">
              {shop.catalogStoragePercent}%
            </span>
          </div>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active Products"
          value={metrics.activeProducts}
          unit="items"
          icon={<InventoryIcon className="h-5 w-5" />}
          tone="primary"
          footer={
            <span className="flex items-center gap-1 text-label-md text-secondary-text">
              <TrendingUpIcon className="h-4 w-4" />
              +{metrics.productsAddedThisWeek} added this week
            </span>
          }
        />
        <MetricCard
          label="Stock Alerts"
          value={metrics.stockAlertsCount}
          unit="need attention"
          icon={<WarningIcon className="h-5 w-5" />}
          tone="warning"
          footer={
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-label-sm text-slate-500">
                {metrics.lowStockCount} Low / {metrics.outOfStockCount} Empty
              </span>
              <a
                href="#inventory-table"
                className="text-label-md font-semibold text-primary hover:underline"
              >
                Restock ↗
              </a>
            </div>
          }
        />
        <MetricCard
          label="Store Inquiries"
          value={metrics.storeInquiries}
          unit="WhatsApp clicks"
          icon={<ChatIcon className="h-5 w-5" />}
          tone="secondary"
          footer={
            <span className="flex items-center gap-1 text-label-md text-secondary-text">
              <TrendingUpIcon className="h-4 w-4" />
              +{metrics.inquiriesChangePercent}% vs last week
            </span>
          }
        />
        <MetricCard
          label="Catalog Spectrum"
          value={metrics.activeCategories}
          unit="active categories"
          icon={<CategoryIcon className="h-5 w-5" />}
          tone="neutral"
          footer={
            <span className="truncate text-label-sm text-slate-500">
              {metrics.categoryPreview.join(", ")}...
            </span>
          }
        />
      </section>

      {/* Low stock alert */}
      <LowStockAlertBanner alert={alert} />

      {/* Main split: table + share widget */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-3 lg:col-span-8" id="inventory-table">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-headline-md text-slate-900">Recent Inventory</h2>
              <span className="font-tabular rounded-full bg-slate-100 px-2 py-0.5 text-data-md font-semibold text-slate-900">
                {products.length} items
              </span>
            </div>
            <Link
              href="/inventory-manager"
              className="flex items-center gap-1 text-label-md font-semibold text-primary hover:underline"
            >
              Open Inventory Manager
              <ArrowForwardIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-level-1">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-label-sm text-slate-500 uppercase">
                    <th className="px-4 py-2.5 font-semibold">Product</th>
                    <th className="px-3 py-2.5 font-semibold">Category</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Price</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-3 py-2.5 font-semibold">Stock Adj</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-body-sm text-slate-900">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover shadow-level-1"
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-title-sm text-slate-900">
                              {product.name}
                            </span>
                            <span className="font-tabular text-data-md text-slate-500">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-slate-50 px-2 py-0.5 text-label-sm text-slate-500">
                          {product.category}
                        </span>
                      </td>
                      <td className="font-tabular px-3 py-2 text-right text-data-md font-semibold text-slate-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <StockBadge status={product.stockStatus} count={product.stock} />
                      </td>
                      <td className="px-3 py-2">
                        <StockStepper initialValue={product.stock} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="text-label-md font-semibold text-primary hover:text-primary-hover"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between bg-slate-50/40 p-3 text-label-sm text-slate-500">
              <span>
                Showing {products.length} of {totalProducts} total products
              </span>
              <div className="flex items-center gap-1">
                <button className="rounded bg-white px-2 py-1 font-semibold text-slate-900 shadow-level-1">
                  1
                </button>
                <button className="rounded px-2 py-1 transition-colors hover:bg-slate-100">
                  2
                </button>
                <button className="rounded px-2 py-1 transition-colors hover:bg-slate-100">
                  3
                </button>
                <span className="px-1">...</span>
                <button className="rounded px-2 py-1 transition-colors hover:bg-slate-100">
                  10
                </button>
              </div>
            </div>
          </div>

          <WeeklyEngagementChart points={engagement.points} changePercent={engagement.changePercent} />
        </section>

        {/* Right column */}
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-level-1">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md text-slate-900">Storefront Share</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm font-semibold text-primary">
                Live Link
              </span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-4 text-center">
              <div className="flex items-center justify-center rounded-xl bg-white p-3 shadow-level-1">
                <StorefrontQrCode className="h-36 w-36 text-slate-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-title-sm text-slate-900">Scan for Instant Showcase</span>
                <span className="text-body-sm text-slate-500">
                  Points directly to {shop.slug} live menu
                </span>
              </div>
            </div>

            <DistributionList channels={channels} />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4 shadow-level-1">
            <LightbulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex flex-col gap-1">
              <span className="text-title-sm text-slate-900">Artisan Maker Pro-Tip</span>
              <p className="text-body-sm text-slate-500">
                Placing your printed QR Standee at the workshop checkout counter increases
                catalog repeat orders by <strong className="text-slate-900">34%</strong>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
