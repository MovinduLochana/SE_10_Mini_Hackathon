"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { FilterBar, type SortOption, type StatusFilter, type ViewMode } from "@/components/filter-bar";
import { ProductRow } from "@/components/product-row";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProductFormModal, type ProductFormValues } from "@/components/product-form-modal";
import {
  CartOffIcon,
  CheckCircleIcon,
  ChecklistIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  InventoryIcon,
  PlusIcon,
  SearchIcon,
  WarningIcon,
} from "@/components/icons";
import {
  deriveStockStatus,
  getAllProducts,
  getCategories,
  getInventoryStats,
  type Product,
  type StockStatus,
} from "@/lib/mock-data";

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24, 48];

export default function InventoryManagerPage() {
  const [products, setProducts] = useState<Product[]>(() => getAllProducts());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const categories = useMemo(() => getCategories(products), [products]);
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);
  const stats = useMemo(() => getInventoryStats(products), [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || product.stockStatus === statusFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });

    switch (sortOption) {
      case "price_asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "stock_desc":
        return [...result].sort((a, b) => b.stock - a.stock);
      case "alpha":
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return result;
    }
  }, [products, searchQuery, statusFilter, categoryFilter, sortOption]);

  function updateSearchQuery(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function updateStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function updateCategoryFilter(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function updateSortOption(value: SortOption) {
    setSortOption(value);
    setPage(1);
  }

  function updateRowsPerPage(value: number) {
    setRowsPerPage(value);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const allOnPageSelected =
    pageProducts.length > 0 && pageProducts.every((p) => selectedIds.has(p.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageProducts.forEach((p) => next.delete(p.id));
      } else {
        pageProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleStockChange(id: string, stock: number, stockStatus: StockStatus) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock, stockStatus } : p)));
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleDuplicate(product: Product) {
    const copy: Product = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
    };
    setProducts((prev) => [copy, ...prev]);
  }

  function handleFormSubmit(values: ProductFormValues) {
    if (!editingProduct) return;
    const stockStatus = deriveStockStatus(values.stock);
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...p, ...values, stockStatus } : p)),
    );
    setFormOpen(false);
  }

  function confirmDelete() {
    if (deleteTarget) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    }
    setDeleteTarget(null);
  }

  function confirmBulkDelete() {
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    clearSelection();
    setBulkDeleteOpen(false);
  }

  function handleBulkCategoryChange() {
    setBatchMenuOpen(false);
    const newCategory = window.prompt(
      `Set category for ${selectedIds.size} selected product(s):`,
    );
    if (!newCategory || !newCategory.trim()) return;
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, category: newCategory.trim() } : p)),
    );
    clearSelection();
  }

  function handleExportCsv() {
    const header = "Name,SKU,Vendor,Category,Price,Stock,Status\n";
    const rows = filteredProducts
      .map((p) =>
        [p.name, p.sku, p.vendor, p.category, p.price, p.stock, p.stockStatus]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }

  const hasAnyProducts = products.length > 0;
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const rangeEnd = Math.min(currentPage * rowsPerPage, filteredProducts.length);

  const tableVisibleClass = viewMode === "table" ? "hidden md:block" : "hidden";
  const gridVisibleClass = viewMode === "grid" ? "block" : "block md:hidden";

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-4 p-4 sm:p-6">
      {/* Breadcrumb + header + toolbar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-label-sm tracking-wider text-slate-500 uppercase">
            <span>Catalog Engine</span>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="font-semibold text-primary">Inventory Manager</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-headline-xl-mobile font-bold text-slate-900 sm:text-headline-xl">
              Store Inventory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-label-sm text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
              Sync Active &bull; {stats.totalSkus} Managed SKUs
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-label-md font-semibold text-slate-900 shadow-level-1 transition-colors hover:bg-slate-50"
          >
            <DownloadIcon className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBatchMenuOpen((v) => !v)}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-label-md font-semibold text-slate-900 shadow-level-1 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChecklistIcon className="h-4 w-4 text-slate-500" />
              Batch Tools
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
            </button>
            {batchMenuOpen && selectedIds.size > 0 ? (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setBatchMenuOpen(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg bg-white py-1 shadow-level-3">
                  <button
                    type="button"
                    onClick={handleBulkCategoryChange}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-slate-900 hover:bg-slate-50"
                  >
                    Bulk Change Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBatchMenuOpen(false);
                      setBulkDeleteOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-destructive hover:bg-destructive-bg"
                  >
                    Bulk Delete Selected
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-white shadow-level-1 transition-colors hover:bg-primary-hover"
          >
            <PlusIcon className="h-4 w-4" />
            New Product
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total SKU Portfolio"
          value={stats.totalSkus}
          icon={<InventoryIcon className="h-4 w-4" />}
          tone="primary"
          footer={
            <span className="text-label-sm font-semibold text-secondary-text">
              +{stats.newThisMonth} this month
            </span>
          }
          progressPercent={100}
        />
        <MetricCard
          label="Healthy Stock"
          value={stats.healthyStock}
          icon={<CheckCircleIcon className="h-4 w-4" />}
          tone="secondary"
          footer={<span className="text-label-sm text-slate-500">{stats.healthyStockPercent}% volume</span>}
          progressPercent={stats.healthyStockPercent}
        />
        <MetricCard
          label="Low Stock Warning"
          value={stats.lowStock}
          icon={<WarningIcon className="h-4 w-4" />}
          tone="warning"
          footer={<span className="text-label-sm font-semibold text-warning-text">&lt; 5 units left</span>}
          progressPercent={stats.totalSkus === 0 ? 0 : (stats.lowStock / stats.totalSkus) * 100}
        />
        <MetricCard
          label="Depleted Units"
          value={stats.depleted}
          icon={<CartOffIcon className="h-4 w-4" />}
          tone="destructive"
          footer={<span className="text-label-sm font-semibold text-destructive">Immediate reorder</span>}
          progressPercent={stats.totalSkus === 0 ? 0 : (stats.depleted / stats.totalSkus) * 100}
        />
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={updateSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={updateStatusFilter}
        sortOption={sortOption}
        onSortChange={updateSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        totalCount={products.length}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={updateCategoryFilter}
      />

      {selectedIds.size > 0 ? (
        <div className="sticky top-17 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 p-3 text-white shadow-level-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-label-sm font-bold">
              {selectedIds.size}
            </span>
            <span className="text-label-md font-medium">
              {selectedIds.size} product{selectedIds.size === 1 ? "" : "s"} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkCategoryChange}
              className="rounded-lg bg-white/15 px-3 py-1 text-label-sm font-semibold transition-colors hover:bg-white/25"
            >
              Update Category
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="rounded-lg bg-destructive px-3 py-1 text-label-sm font-semibold transition-colors hover:opacity-90"
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Clear selection"
              className="rounded-full p-1 text-white/70 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-level-1">
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title={hasAnyProducts ? "No catalog SKUs matched your filters" : "No products yet"}
            description={
              hasAnyProducts
                ? "Try resetting active categories or searching by broader keywords."
                : "Add your first product to start building your storefront catalog."
            }
            action={
              hasAnyProducts ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg bg-slate-100 px-4 py-1.5 text-label-md font-semibold text-slate-900 transition-colors hover:bg-slate-200"
                >
                  Reset All Filters
                </button>
              ) : (
                <Link
                  href="/inventory/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-label-md font-semibold text-white shadow-level-1 hover:bg-primary-hover"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Product
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className={`${tableVisibleClass} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-level-1`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="h-10 bg-slate-50 text-label-sm tracking-wider text-slate-500 uppercase select-none">
                    <th scope="col" className="w-12 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        aria-label="Select all products on this page"
                        className="h-4 w-4 cursor-pointer rounded accent-primary"
                      />
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">Item / SKU</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Category</th>
                    <th scope="col" className="px-3 py-2 text-right font-semibold">Price</th>
                    <th scope="col" className="px-3 py-2 text-center font-semibold">Live Stock</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Availability</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-body-sm text-slate-900">
                  {pageProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      selected={selectedIds.has(product.id)}
                      onToggleSelect={toggleSelect}
                      onStockChange={handleStockChange}
                      onEdit={openEditForm}
                      onDuplicate={handleDuplicate}
                      onDelete={setDeleteTarget}
                      deriveStatus={deriveStockStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              total={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={updateRowsPerPage}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>

          <div className={gridVisibleClass}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  onToggleSelect={toggleSelect}
                  onStockChange={handleStockChange}
                  onEdit={openEditForm}
                  onDuplicate={handleDuplicate}
                  onDelete={setDeleteTarget}
                  deriveStatus={deriveStockStatus}
                />
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-level-1">
              <PaginationBar
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                total={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={updateRowsPerPage}
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      <ProductFormModal
        open={formOpen}
        mode="edit"
        product={editingProduct}
        categories={categoryNames.length > 0 ? categoryNames : ["Uncategorized"]}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name ?? ""}"?`}
        description="This will permanently remove the product from your catalog."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.size} selected product${selectedIds.size === 1 ? "" : "s"}?`}
        description="This will permanently remove these products from your catalog."
        confirmLabel="Delete All"
        tone="destructive"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}

interface PaginationBarProps {
  rangeStart: number;
  rangeEnd: number;
  total: number;
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (value: number) => void;
}

function PaginationBar({
  rangeStart,
  rangeEnd,
  total,
  rowsPerPage,
  onRowsPerPageChange,
  page,
  totalPages,
  onPageChange,
}: PaginationBarProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-between gap-3 bg-slate-50/60 p-3 text-label-sm text-slate-500 sm:flex-row">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="font-semibold text-slate-900">{rangeStart}-{rangeEnd}</strong> of{" "}
          <strong className="font-semibold text-slate-900">{total}</strong> products
        </span>
        <div className="flex items-center gap-1.5">
          <span>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="h-7 cursor-pointer rounded bg-white px-1.5 text-body-sm text-slate-900 shadow-level-1 focus:outline-none"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md bg-white p-1.5 text-slate-500 shadow-level-1 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`h-7 w-7 rounded-md text-label-sm font-semibold transition-colors ${
                num === page ? "bg-primary text-white shadow-level-1" : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
            >
              {num}
            </button>
          ))}
          {totalPages > 3 ? (
            <>
              <span className="px-1">&hellip;</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`h-7 w-7 rounded-md text-label-sm font-semibold transition-colors ${
                  totalPages === page ? "bg-primary text-white shadow-level-1" : "bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                {totalPages}
              </button>
            </>
          ) : null}
        </div>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md bg-white p-1.5 text-slate-500 shadow-level-1 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
