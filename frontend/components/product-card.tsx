import { StockBadge } from "@/components/stock-badge";
import { StockStepper } from "@/components/stock-stepper";
import { CopyIcon, EditIcon, ExternalLinkIcon, TrashIcon } from "@/components/icons";
import type { Product, StockStatus } from "@/lib/mock-data";

export interface ProductCardProps {
  product: Product;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onStockChange: (id: string, stock: number, status: StockStatus) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  deriveStatus: (stock: number) => StockStatus;
}

export function ProductCard({
  product,
  selected,
  onToggleSelect,
  onStockChange,
  onEdit,
  onDuplicate,
  onDelete,
  deriveStatus,
}: ProductCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-level-1 transition-shadow hover:shadow-level-2">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-32 w-full rounded-lg bg-slate-100 object-cover"
        />
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          aria-label={`Select ${product.name}`}
          className="absolute top-2 left-2 h-4 w-4 cursor-pointer rounded accent-primary"
        />
        <div className="absolute top-2 right-2">
          <StockBadge status={product.stockStatus} count={product.stock} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="truncate text-title-sm text-slate-900">{product.name}</span>
        <span className="text-label-sm text-slate-500">
          <span className="font-tabular">{product.sku}</span> &middot; {product.vendor}
        </span>
        <div className="flex items-center justify-between pt-1">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-label-sm font-medium text-slate-900">
            {product.category}
          </span>
          <span className="font-tabular text-data-md font-semibold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <StockStepper
          initialValue={product.stock}
          onChange={(value) => onStockChange(product.id, value, deriveStatus(value))}
        />
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            title="Edit Listing"
            onClick={() => onEdit(product)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Duplicate SKU"
            onClick={() => onDuplicate(product)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <CopyIcon className="h-4 w-4" />
          </button>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            title="View in Storefront"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-secondary-text"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            title="Delete Product"
            onClick={() => onDelete(product)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-destructive-bg hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
