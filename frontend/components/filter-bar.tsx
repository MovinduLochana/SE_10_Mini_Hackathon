import { GridIcon, SearchIcon, TableIcon, XCircleIcon } from "@/components/icons";
import type { CategoryCount, StockStatus } from "@/lib/mock-data";

export type StatusFilter = "all" | StockStatus;
export type SortOption = "recent" | "price_asc" | "price_desc" | "stock_desc" | "alpha";
export type ViewMode = "table" | "grid";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock (<5)" },
  { value: "out-of-stock", label: "Out of Stock" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Sort: Recently Added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock_desc", label: "Stock: High to Low" },
  { value: "alpha", label: "Alphabetical (A-Z)" },
];

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  categories: CategoryCount[];
  totalCount: number;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  categories,
  totalCount,
  categoryFilter,
  onCategoryFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-level-1">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name, SKU, or tag..."
            className="h-9 w-full rounded-lg bg-slate-50 pr-8 pl-9 text-body-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 hover:text-slate-900"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="h-9 cursor-pointer rounded-lg bg-slate-50 px-3 text-body-sm text-slate-900 focus:bg-white focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-9 cursor-pointer rounded-lg bg-slate-50 px-3 text-body-sm text-slate-900 focus:bg-white focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-lg bg-slate-50 p-0.5">
            <button
              type="button"
              title="Table View"
              onClick={() => onViewModeChange("table")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "table" ? "bg-white text-primary shadow-level-1" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Card Grid View"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "grid" ? "bg-white text-primary shadow-level-1" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
        <button
          type="button"
          onClick={() => onCategoryFilterChange("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-label-md font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "all"
              ? "bg-primary text-white shadow-level-1"
              : "bg-slate-50 text-slate-500 hover:text-slate-900"
          }`}
        >
          All ({totalCount})
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => onCategoryFilterChange(category.name)}
            className={`shrink-0 rounded-full px-3 py-1 text-label-md font-semibold whitespace-nowrap transition-all ${
              categoryFilter === category.name
                ? "bg-primary text-white shadow-level-1"
                : "bg-slate-50 text-slate-500 hover:text-slate-900"
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
}
