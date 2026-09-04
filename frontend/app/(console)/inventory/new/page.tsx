"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ImageGalleryUploader,
  type ProductImage,
} from "@/components/image-gallery-uploader";
import { LivePreviewPanel } from "@/components/live-preview-panel";
import { ToggleSwitch } from "@/components/toggle-switch";
import {
  ArchiveIcon,
  ChatIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  LightbulbIcon,
  PlusIcon,
  PublishIcon,
  SparkleIcon,
  StorefrontIcon,
} from "@/components/icons";
import { getAllProducts, getCategories, getShopInfo } from "@/lib/mock-data";

const TITLE_MAX_LENGTH = 80;
const MAX_IMAGES = 6;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Ceramics: ["mug", "bowl", "vase", "plate", "teapot", "ceramic", "stoneware", "clay", "tumbler"],
  "Leather Goods": ["leather", "wallet", "tote", "bag", "belt", "journal", "folio"],
  "Home & Candle": ["candle", "board", "platter", "diffuser", "coaster", "incense", "votive"],
  Textiles: ["throw", "linen", "scarf", "blanket", "cushion", "wool", "cotton", "runner", "napkin"],
  Jewelry: ["ring", "necklace", "earring", "bracelet", "pendant", "gold", "silver", "hoop"],
};

function suggestCategoryFromTitle(title: string, availableCategories: string[]): string | null {
  const normalized = title.toLowerCase();
  if (!normalized.trim()) return null;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (availableCategories.includes(category) && keywords.some((word) => normalized.includes(word))) {
      return category;
    }
  }
  return null;
}

/**
 * Shape expected by the future product-creation endpoint (e.g.
 * `POST /api/products`). Keep this in sync with backend/ once it exists —
 * `status` distinguishes "Save as Draft" from "Publish to Catalog".
 */
interface ProductDraftPayload {
  title: string;
  category: string;
  sellingPrice: number;
  comparePrice: number | null;
  stock: number;
  lowStockThreshold: number;
  images: string[]; // ordered; first entry is the primary cover
  description: string;
  visibleOnStorefront: boolean;
  whatsappInquiries: boolean;
  status: "draft" | "published";
}

export default function AddProductPage() {
  const shop = useMemo(() => getShopInfo(), []);
  const initialCategories = useMemo(
    () => getCategories(getAllProducts()).map((c) => c.name),
    [],
  );

  const [categoryOptions, setCategoryOptions] = useState<string[]>(initialCategories);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategories[0] ?? "");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [comparePrice, setComparePrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [savedState, setSavedState] = useState<"draft" | "published" | null>(null);

  const suggestedCategory = suggestCategoryFromTitle(title, categoryOptions);
  const showAiSuggestion = Boolean(suggestedCategory && suggestedCategory !== category);

  function acceptSuggestion() {
    if (!suggestedCategory) return;
    setIsAddingCategory(false);
    setCategory(suggestedCategory);
  }

  function confirmNewCategory() {
    const trimmed = newCategoryValue.trim();
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    setCategoryOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCategory(trimmed);
    setNewCategoryValue("");
    setIsAddingCategory(false);
  }

  function buildPayload(status: "draft" | "published"): ProductDraftPayload {
    return {
      title: title.trim(),
      category,
      sellingPrice,
      comparePrice: comparePrice > 0 ? comparePrice : null,
      stock,
      lowStockThreshold,
      images: images.map((image) => image.url),
      description,
      visibleOnStorefront: visible,
      whatsappInquiries: whatsappEnabled,
      status,
    };
  }

  function handleSaveDraft() {
    console.log("Save as Draft ->", buildPayload("draft"));
    setSavedState("draft");
    setTimeout(() => setSavedState(null), 2000);
  }

  function handlePublish() {
    console.log("Publish to Catalog ->", buildPayload("published"));
    setSavedState("published");
    setTimeout(() => setSavedState(null), 2000);
  }

  const titleSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const previewUrl = `${shop.slug.replace(/-/g, "")}.artisan.shop/p/${titleSlug || "new-product"}`;

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-4 p-4 sm:p-6">
      {/* Breadcrumb + header + actions */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-label-md text-slate-500">
            <Link href="/inventory" className="transition-colors hover:text-primary">
              Inventory
            </Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="font-semibold text-slate-900">New Product</span>
            <span className="ml-1.5 rounded-full bg-secondary-bg px-2 py-0.5 text-label-sm font-semibold tracking-wide text-secondary-text">
              DRAFT V1.2
            </span>
          </div>
          <h1 className="text-headline-xl-mobile font-bold tracking-tight text-slate-900 sm:text-headline-xl">
            Add New Product
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-label-md font-semibold text-slate-900 shadow-level-1 transition-colors hover:bg-slate-50"
          >
            <ArchiveIcon className="h-4 w-4 text-slate-500" />
            {savedState === "draft" ? "Saved!" : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-label-md font-semibold text-white shadow-level-1 transition-all hover:bg-primary-hover hover:shadow-level-2"
          >
            <PublishIcon className="h-4 w-4" />
            {savedState === "published" ? "Published!" : "Publish to Catalog"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left column — form */}
        <div className="flex flex-col gap-6 xl:col-span-7">
          {/* 1. Basic Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-level-1">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="text-headline-md text-slate-900">1. Basic Details</h2>
              </div>
              <span className="text-label-sm tracking-wider text-slate-500 uppercase">
                Catalog Indexing
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-title" className="text-label-md font-semibold text-slate-900">
                  Product Title
                </label>
                <div className="relative">
                  <input
                    id="product-title"
                    type="text"
                    value={title}
                    maxLength={TITLE_MAX_LENGTH}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Handcrafted Ceramic Mug"
                    className="h-10 w-full rounded-lg bg-slate-50 px-3 pr-16 text-title-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-label-sm text-slate-400">
                    {title.length} / {TITLE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="category-select" className="text-label-md font-semibold text-slate-900">
                      Primary Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory((v) => !v)}
                      className="flex items-center gap-0.5 text-label-sm font-semibold text-primary hover:underline"
                    >
                      <PlusIcon className="h-3 w-3" />
                      New
                    </button>
                  </div>
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={newCategoryValue}
                        onChange={(e) => setNewCategoryValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            confirmNewCategory();
                          }
                        }}
                        placeholder="New category name"
                        className="h-9 flex-1 rounded-lg bg-slate-50 px-3 text-body-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={confirmNewCategory}
                        className="rounded-lg bg-primary px-3 text-label-md font-semibold text-white hover:bg-primary-hover"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-9 w-full cursor-pointer appearance-none rounded-lg bg-slate-50 px-3 pr-8 text-body-sm text-slate-900 focus:bg-white focus:outline-none"
                      >
                        {categoryOptions.length === 0 ? <option value="">Uncategorized</option> : null}
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-end md:col-span-6">
                  {showAiSuggestion ? (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2">
                      <SparkleIcon className="h-4 w-4 shrink-0 animate-pulse text-primary" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-label-sm leading-none text-slate-500">
                          AI Taxonomy Match
                        </span>
                        <span className="block truncate text-label-md font-semibold text-slate-900">
                          {suggestedCategory}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={acceptSuggestion}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-label-sm font-semibold text-white shadow-level-1 hover:bg-primary-hover"
                      >
                        <CheckCircleIcon className="h-3 w-3" />
                        Accept
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <label
                    htmlFor="selling-price"
                    className="mb-1 block text-label-sm tracking-wide text-slate-500 uppercase"
                  >
                    Selling Price ($ USD)
                  </label>
                  <div className="relative flex items-center">
                    <span className="font-tabular absolute left-3 text-data-lg text-slate-900">$</span>
                    <input
                      id="selling-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                      className="font-tabular w-full rounded-md bg-white py-1.5 pr-3 pl-8 text-right text-data-lg text-slate-900 shadow-level-1 focus:outline-none"
                    />
                  </div>
                  <span className="mt-1 block text-body-sm text-slate-500">
                    Your baseline storefront retail price
                  </span>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <label
                    htmlFor="compare-price"
                    className="mb-1 block text-label-sm tracking-wide text-slate-500 uppercase"
                  >
                    Comparative Price ($ USD)
                  </label>
                  <div className="relative flex items-center">
                    <span className="font-tabular absolute left-3 text-data-lg text-slate-500">$</span>
                    <input
                      id="compare-price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={comparePrice}
                      onChange={(e) => setComparePrice(Math.max(0, Number(e.target.value)))}
                      className="font-tabular w-full rounded-md bg-white py-1.5 pr-3 pl-8 text-right text-data-lg text-slate-900 shadow-level-1 focus:outline-none"
                    />
                  </div>
                  <span className="mt-1 block text-body-sm text-slate-500">
                    Displays strikethrough markdown on store
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <label
                      htmlFor="stock-input"
                      className="block text-label-sm tracking-wide text-slate-500 uppercase"
                    >
                      Stock Quantity
                    </label>
                    <span className="text-body-sm text-slate-500">
                      Units presently on handcrafted inventory
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStock((v) => Math.max(0, v - 1))}
                      aria-label="Decrease stock"
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-900 shadow-level-1 transition-colors hover:bg-slate-100"
                    >
                      &minus;
                    </button>
                    <input
                      id="stock-input"
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Math.max(0, Math.round(Number(e.target.value))))}
                      className="font-tabular w-full rounded-md bg-white py-1 text-center text-data-lg text-slate-900 shadow-level-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStock((v) => v + 1)}
                      aria-label="Increase stock"
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-900 shadow-level-1 transition-colors hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-lg bg-slate-50 p-3">
                  <div>
                    <label
                      htmlFor="threshold-input"
                      className="block text-label-sm tracking-wide text-slate-500 uppercase"
                    >
                      Low Stock Threshold
                    </label>
                    <span className="text-body-sm text-slate-500">
                      Triggers urgent banner when remaining units reach
                    </span>
                  </div>
                  <div className="relative mt-2 flex items-center">
                    <input
                      id="threshold-input"
                      type="number"
                      min={0}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Math.max(0, Number(e.target.value)))}
                      className="font-tabular w-full rounded-md bg-white py-1.5 pr-14 pl-3 text-right text-data-lg text-slate-900 shadow-level-1 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute right-3 text-label-sm font-medium text-slate-500">
                      units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Media & Product Gallery */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-level-1">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="text-headline-md text-slate-900">2. Media &amp; Product Gallery</h2>
              </div>
              <span className="text-label-sm text-slate-500">
                {images.length} of {MAX_IMAGES} angles uploaded
              </span>
            </div>
            <ImageGalleryUploader images={images} onChange={setImages} maxImages={MAX_IMAGES} />
          </section>

          {/* 3. Product Description */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-level-1">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="text-headline-md text-slate-900">3. Product Description</h2>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-label-md font-semibold text-slate-900">
                Storefront Description
              </label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product's materials, craftsmanship and story..."
                className="resize-none rounded-lg bg-slate-50 p-3 text-body-md leading-relaxed text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-focus/20 focus:outline-none"
              />
              <div className="flex items-center justify-end pt-1 text-label-sm text-slate-500">
                <span>{description.length} characters</span>
              </div>
            </div>
          </section>

          {/* 4. Channels & Inquiries */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-level-1">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="text-headline-md text-slate-900">4. Channels &amp; Inquiries</h2>
              </div>
              <span className="text-label-sm font-semibold text-secondary-text">
                {visible ? "Storefront Active" : "Storefront Hidden"}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100">
                <div className="flex items-start gap-3">
                  <StorefrontIcon className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <label htmlFor="toggle-visibility" className="block cursor-pointer text-title-sm text-slate-900">
                      Visible on Public Storefront
                    </label>
                    <span className="text-body-sm text-slate-500">
                      Display immediately within buyer catalog search and collections grid.
                    </span>
                  </div>
                </div>
                <ToggleSwitch id="toggle-visibility" checked={visible} onChange={setVisible} />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100">
                <div className="flex items-start gap-3">
                  <ChatIcon className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <label htmlFor="toggle-whatsapp" className="block cursor-pointer text-title-sm text-slate-900">
                      Direct WhatsApp Inquiries
                    </label>
                    <span className="text-body-sm text-slate-500">
                      Inject frictionless click-to-chat inquiry buttons with pre-filled SKU details.
                    </span>
                  </div>
                </div>
                <ToggleSwitch id="toggle-whatsapp" checked={whatsappEnabled} onChange={setWhatsappEnabled} />
              </div>
            </div>
          </section>
        </div>

        {/* Right column — Live Customer View */}
        <div className="sticky top-20 flex flex-col gap-4 xl:col-span-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-primary" />
              <span className="text-title-sm text-slate-900">Live Customer View</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-label-sm text-slate-500 shadow-level-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              Real-time Preview
            </div>
          </div>

          <LivePreviewPanel
            previewUrl={previewUrl}
            title={title}
            category={category}
            imageUrl={images[0]?.url}
            price={sellingPrice}
            comparePrice={comparePrice}
            stock={stock}
            lowStockThreshold={lowStockThreshold}
            description={description}
            visible={visible}
            whatsappEnabled={whatsappEnabled}
          />

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 shadow-level-1">
            <LightbulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex flex-col gap-1">
              <span className="text-label-md font-semibold text-slate-900">Merchant Pro Tip</span>
              <p className="text-body-sm text-slate-500">
                Items containing organic material origins and care guidelines generate{" "}
                <strong className="text-slate-900">34% more</strong> WhatsApp conversations and
                direct orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
