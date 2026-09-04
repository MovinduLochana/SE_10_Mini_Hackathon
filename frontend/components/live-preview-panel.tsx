import {
  ChatIcon,
  ImageIcon,
  ShoppingBagIcon,
  StarIcon,
  SyncIcon,
  TruckIcon,
} from "@/components/icons";

export interface LivePreviewPanelProps {
  previewUrl: string;
  title: string;
  category: string;
  imageUrl?: string;
  price: number;
  comparePrice: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  visible: boolean;
  whatsappEnabled: boolean;
}

export function LivePreviewPanel({
  previewUrl,
  title,
  category,
  imageUrl,
  price,
  comparePrice,
  stock,
  lowStockThreshold,
  description,
  visible,
  whatsappEnabled,
}: LivePreviewPanelProps) {
  const hasDiscount = comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const stockBadge =
    stock <= 0
      ? { label: "Sold Out", className: "bg-destructive-bg text-destructive" }
      : stock <= lowStockThreshold
        ? { label: `Only ${stock} remaining`, className: "bg-warning-bg text-warning-text" }
        : { label: `${stock} in stock`, className: "bg-white/90 text-secondary-text" };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-level-3">
      <div className="mb-3 flex items-center justify-between pb-3 text-slate-500">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary/60" />
          <span className="ml-2 truncate text-label-sm text-slate-500">{previewUrl}</span>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-label-sm font-semibold ${
            visible ? "bg-slate-100 text-slate-900" : "bg-slate-200 text-slate-500"
          }`}
        >
          {visible ? "Active" : "Hidden (Unlisted)"}
        </span>
      </div>

      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-100 shadow-inner">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-label-sm font-bold tracking-wide text-slate-900 shadow-level-1 backdrop-blur-md">
          NEW ARRIVAL
        </span>
        <span
          className={`absolute right-3 bottom-3 flex items-center gap-1 rounded-md px-2 py-1 text-label-sm font-semibold shadow-level-1 backdrop-blur-md ${stockBadge.className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {stockBadge.label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-label-sm font-semibold tracking-wider text-primary uppercase">
            {category || "Uncategorized"}
          </span>
          <div className="flex items-center gap-0.5 text-slate-500">
            <StarIcon className="h-3.5 w-3.5 text-warning" />
            <span className="text-label-sm font-semibold text-slate-900">5.0</span>
            <span className="text-body-sm text-slate-500">(12)</span>
          </div>
        </div>

        <h3 className="text-headline-md font-bold text-slate-900">
          {title.trim() || "Untitled Artisan Product"}
        </h3>

        <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
          <span className="font-tabular text-data-lg font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          {hasDiscount ? (
            <>
              <span className="font-tabular text-data-md text-slate-500 line-through">
                ${comparePrice.toFixed(2)}
              </span>
              <span className="rounded bg-secondary-bg px-1.5 py-0.5 text-label-sm font-bold text-secondary-text">
                {discountPercent}% OFF
              </span>
            </>
          ) : null}
        </div>

        <p className="line-clamp-3 pt-1 text-body-sm leading-relaxed text-slate-500">
          {description.trim() || "No description provided yet."}
        </p>

        <div className="space-y-2 pt-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-label-md font-semibold text-white shadow-level-1 transition-opacity hover:opacity-95"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Add to Cart
          </button>
          {whatsappEnabled ? (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-label-md font-semibold text-white shadow-level-1 transition-opacity hover:opacity-95"
            >
              <ChatIcon className="h-4 w-4" />
              Inquire via WhatsApp
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-2 text-label-sm text-slate-500">
          <span className="flex items-center gap-1">
            <TruckIcon className="h-3.5 w-3.5" />
            Free bespoke packaging
          </span>
          <span className="flex items-center gap-1">
            <SyncIcon className="h-3.5 w-3.5" />
            14-day exchange
          </span>
        </div>
      </div>
    </div>
  );
}
