"use client";

import { useState } from "react";
import { CloseIcon, ImageIcon } from "@/components/icons";
import type { Product } from "@/lib/mock-data";

export interface ProductFormValues {
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  description: string;
}

export interface ProductFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  product?: Product;
  categories: string[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

const EMPTY_FORM: ProductFormValues = {
  name: "",
  price: 0,
  stock: 0,
  category: "",
  imageUrl: "",
  description: "",
};

export function ProductFormModal({
  open,
  mode,
  product,
  categories,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Re-seed the form from `product` each time the dialog opens. Adjusting
  // state during render (rather than in a useEffect) avoids an extra
  // commit-then-rerender pass — see https://react.dev/learn/you-might-not-need-an-effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        product
          ? {
              name: product.name,
              price: product.price,
              stock: product.stock,
              category: product.category,
              imageUrl: product.imageUrl,
              description: product.description ?? "",
            }
          : { ...EMPTY_FORM, category: categories[0] ?? "" },
      );
      setIsAddingCategory(false);
      setNewCategory("");
    }
  }

  if (!open) return null;

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCategory = isAddingCategory ? newCategory.trim() : values.category;
    if (!values.name.trim() || !finalCategory) return;
    onSubmit({ ...values, category: finalCategory });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-level-3"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 id="product-form-title" className="text-headline-md text-slate-900">
            {mode === "add" ? "New Product" : "Edit Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-name" className="text-label-md font-semibold text-slate-500">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className="h-9 rounded bg-white px-3 text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
              placeholder="e.g. Stoneware Pour-Over Mug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="product-price" className="text-label-md font-semibold text-slate-500">
                Price (USD)
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                step={0.01}
                required
                value={values.price}
                onChange={(e) => update("price", Number(e.target.value))}
                className="font-tabular h-9 rounded bg-white px-3 text-right text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="product-stock" className="text-label-md font-semibold text-slate-500">
                Stock Quantity
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                step={1}
                required
                value={values.stock}
                onChange={(e) => update("stock", Math.max(0, Math.round(Number(e.target.value))))}
                className="font-tabular h-9 rounded bg-white px-3 text-right text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-category" className="text-label-md font-semibold text-slate-500">
              Category
            </label>
            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="h-9 flex-1 rounded bg-white px-3 text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="rounded-lg border border-slate-200 px-3 text-label-md font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  id="product-category"
                  value={values.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="h-9 flex-1 cursor-pointer rounded bg-white px-3 text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="rounded-lg border border-slate-200 px-3 text-label-md font-semibold text-slate-900 hover:bg-slate-50"
                >
                  + Add new
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-image" className="text-label-md font-semibold text-slate-500">
              Photo URL
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-slate-500">
                {values.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={values.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6" />
                )}
              </div>
              <input
                id="product-image"
                type="url"
                value={values.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://..."
                className="h-9 flex-1 rounded bg-white px-3 text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-description" className="text-label-md font-semibold text-slate-500">
              Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the product's materials, craftsmanship and story..."
              className="resize-none rounded bg-white px-3 py-2 text-body-sm text-slate-900 shadow-[inset_0_0_0_1px_#cbd5e1] focus:shadow-[inset_0_0_0_1px_var(--color-primary-focus)] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-label-md font-semibold text-slate-900 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-label-md font-semibold text-white shadow-level-1 transition-colors hover:bg-primary-hover"
            >
              {mode === "add" ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
