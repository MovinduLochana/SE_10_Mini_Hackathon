import { StockBadge } from "@/components/stock-badge";
import { StockStepper } from "@/components/stock-stepper";
import { CopyIcon, EditIcon, ExternalLinkIcon, TrashIcon } from "@/components/icons";
import type { Product, StockStatus } from "@/lib/mock-data";

export interface ProductRowProps {
  product: Product;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onStockChange: (id: string, stock: number, status: StockStatus) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  deriveStatus: (stock: number) => StockStatus;
}

export function ProductRow({
  product,
  selected,
  onToggleSelect,
  onStockChange,
  onEdit,
  onDuplicate,
  onDelete,
  deriveStatus,
}: ProductRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          aria-label={`Select ${product.name}`}
          className="h-4 w-4 cursor-pointer rounded accent-primary"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover shadow-level-1"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-title-sm text-slate-900">{product.name}</span>
            <span className="flex items-center gap-1.5 text-label-sm text-slate-500">
              <span className="font-tabular">SKU: {product.sku}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              {product.vendor}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-label-sm font-medium text-slate-900">
          {product.category}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="font-tabular text-data-md font-semibold text-slate-900">
          ${product.price.toFixed(2)}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-center">
          <StockStepper
            initialValue={product.stock}
            onChange={(value) => onStockChange(product.id, value, deriveStatus(value))}
          />
        </div>
      </td>
      <td className="px-3 py-3">
        <StockBadge status={product.stockStatus} count={product.stock} />
      </td>
      <td className="px-4 py-3 text-right">
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
      </td>
    </tr>
  );
}
