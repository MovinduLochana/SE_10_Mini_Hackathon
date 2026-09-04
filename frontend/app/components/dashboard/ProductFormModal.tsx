"use client";

import { useState } from "react";
import { X, Sparkles, Wand2, Loader2, Check, AlertCircle } from "lucide-react";
import { api, ProductResponse } from "../../../lib/api";
import { CATEGORIES } from "../storefront-onboarding/types";

interface ProductFormModalProps {
    storeSlug: string;
    token: string;
    initialProduct?: ProductResponse | null;
    onClose: () => void;
    onProductCreated?: (product: ProductResponse) => void;
    onProductUpdated?: (product: ProductResponse) => void;
}

export function ProductFormModal({
    storeSlug,
    token,
    initialProduct,
    onClose,
    onProductCreated,
    onProductUpdated,
}: ProductFormModalProps) {
    const isEdit = Boolean(initialProduct);
    const [title, setTitle] = useState(initialProduct?.title || "");
    const [category, setCategory] = useState(initialProduct?.category || "");
    const [price, setPrice] = useState<string>(initialProduct ? String(initialProduct.price) : "");
    const [stock, setStock] = useState<string>(initialProduct ? String(initialProduct.stock) : "10");
    const [imageUrl, setImageUrl] = useState(initialProduct?.image_url || "");
    const [description, setDescription] = useState(initialProduct?.description || "");

    // AI Copywriter state
    const [keywords, setKeywords] = useState("");
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyError, setCopyError] = useState<string | null>(null);

    // AI Categorizer state
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
    const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

    // Form validation and submission state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // ── AI Auto-Categorizer ──
    async function handleSuggestCategory() {
        if (!title.trim()) {
            setErrors((prev) => ({ ...prev, title: "Enter a title first to suggest a category." }));
            return;
        }
        setIsSuggestingCategory(true);
        try {
            const res = await api.suggestCategory(title.trim());
            if (res.suggested_category) {
                setCategory(res.suggested_category);
            }
            if (res.alternative_categories && res.alternative_categories.length > 0) {
                setSuggestedCategories(res.alternative_categories);
            }
        } catch {
            // Heuristic fallback
            const lower = title.toLowerCase();
            if (/cinnamon|pepper|cardamom|clove|curry|masala|turmeric|chilli/i.test(lower)) {
                setCategory("Spices");
            } else if (/kithul|treacle|jaggery|sweet|dodol|halapa|honey/i.test(lower)) {
                setCategory("Sweets");
            } else if (/tea|coffee|king coconut|juice/i.test(lower)) {
                setCategory("Beverages");
            } else if (/vegetable|fruit|banana|mango|coconut/i.test(lower)) {
                setCategory("Fresh Produce");
            } else {
                setCategory("Homemade");
            }
        } finally {
            setIsSuggestingCategory(false);
        }
    }

    // ── AI Marketing Copywriter ──
    async function handleGenerateCopy() {
        if (!title.trim()) {
            setCopyError("Please enter a product title first.");
            return;
        }

        setIsGeneratingCopy(true);
        setCopyError(null);
        setCopySuccess(false);

        try {
            const res = await api.generateCopy(title.trim(), keywords.trim());
            if (res.marketing_pitch) {
                setDescription(res.marketing_pitch);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to generate AI pitch.";
            setCopyError(msg);
        } finally {
            setIsGeneratingCopy(false);
        }
    }

    // ── Submit & Validation ──
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError(null);
        const errs: Record<string, string> = {};

        if (!title.trim()) errs.title = "Product title is required.";
        if (!category.trim()) errs.category = "Please select or enter a category.";

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            errs.price = "Price must be greater than 0 LKR.";
        }

        const numStock = parseInt(stock, 10);
        if (isNaN(numStock) || numStock < 0) {
            errs.stock = "Stock must be 0 or more.";
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEdit && initialProduct) {
                const updatedProduct = await api.updateProduct(
                    initialProduct.id,
                    {
                        title: title.trim(),
                        description: description.trim() || undefined,
                        price: numPrice,
                        category: category.trim(),
                        stock: numStock,
                        image_url: imageUrl.trim() || undefined,
                        is_available: numStock > 0,
                    },
                    token
                );

                onProductUpdated?.(updatedProduct);
                onClose();
            } else {
                const newProduct = await api.addProduct(
                    storeSlug,
                    {
                        title: title.trim(),
                        description: description.trim() || undefined,
                        price: numPrice,
                        category: category.trim(),
                        stock: numStock,
                        image_url: imageUrl.trim() || undefined,
                        is_available: numStock > 0,
                    },
                    token
                );

                onProductCreated?.(newProduct);
                onClose();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : isEdit ? "Failed to update product." : "Failed to create product.";
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(17, 26, 20, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "var(--paper, #fcfbf7)",
                    borderRadius: 16,
                    width: "100%",
                    maxWidth: 580,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
                    border: "1px solid var(--line, #e7e5e4)",
                    padding: 24,
                    position: "relative",
                    fontFamily: "var(--font-work-sans), sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 18,
                        right: 18,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--ink, #1c1917)",
                        opacity: 0.6,
                        padding: 4,
                    }}
                >
                    <X size={20} />
                </button>

                {/* Modal Title */}
                <h2
                    style={{
                        fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        fontSize: 24,
                        margin: "0 0 4px",
                        color: "var(--ink, #1c1917)",
                    }}
                >
                    {isEdit ? "Edit Product" : "Add New Product"}
                </h2>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, opacity: 0.65, color: "var(--ink)" }}>
                    {isEdit
                        ? "Update product details, pricing, stock count, or refine AI copy."
                        : "Enter product details, stock count, and use AI to craft your marketing pitch."}
                </p>

                {submitError && (
                    <div
                        style={{
                            padding: "10px 14px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #f87171",
                            borderRadius: 8,
                            color: "#b91c1c",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 16,
                        }}
                    >
                        <AlertCircle size={16} />
                        <span>{submitError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Title & Auto-Categorizer */}
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                            Item Title *
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                placeholder="e.g. Ceylon Cinnamon Sticks (Alba Grade)"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                                }}
                                style={{
                                    flex: 1,
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: `1px solid ${errors.title ? "#ef4444" : "var(--line, #e7e5e4)"}`,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    fontSize: 14,
                                    outline: "none",
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSuggestCategory}
                                disabled={isSuggestingCategory || !title.trim()}
                                title="Auto-detect category with AI"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "0 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--teal, #0d9488)",
                                    backgroundColor: "rgba(13,148,136,0.08)",
                                    color: "var(--teal, #0d9488)",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: !title.trim() ? "not-allowed" : "pointer",
                                    opacity: !title.trim() ? 0.6 : 1,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {isSuggestingCategory ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                Auto-Category
                            </button>
                        </div>
                        {errors.title && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                            }}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: `1px solid ${errors.category ? "#ef4444" : "var(--line, #e7e5e4)"}`,
                                backgroundColor: "var(--paper, #fcfbf7)",
                                fontSize: 14,
                                outline: "none",
                            }}
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {errors.category && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.category}</div>}

                        {suggestedCategories.length > 0 && (
                            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontSize: 11.5, opacity: 0.6 }}>Other options:</span>
                                {suggestedCategories.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCategory(c)}
                                        style={{
                                            border: "1px dashed var(--teal, #0d9488)",
                                            backgroundColor: "transparent",
                                            borderRadius: 6,
                                            padding: "2px 8px",
                                            fontSize: 11.5,
                                            color: "var(--teal, #0d9488)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        + {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price (LKR) & Stock Count */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                                Price (LKR) *
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                placeholder="e.g. 1200"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                    if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                                }}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: `1px solid ${errors.price ? "#ef4444" : "var(--line, #e7e5e4)"}`,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    fontSize: 14,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                            {errors.price && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.price}</div>}
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                                Initial Stock Count *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="10"
                                value={stock}
                                onChange={(e) => {
                                    setStock(e.target.value);
                                    if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                                }}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: `1px solid ${errors.stock ? "#ef4444" : "var(--line, #e7e5e4)"}`,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    fontSize: 14,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                            {errors.stock && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.stock}</div>}
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                            Image URL (optional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: "1px solid var(--line, #e7e5e4)",
                                backgroundColor: "var(--paper, #fcfbf7)",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* AI Marketing Copywriter Block */}
                    <div
                        style={{
                            border: "1px solid rgba(13,148,136,0.3)",
                            borderRadius: 12,
                            padding: 14,
                            backgroundColor: "rgba(13,148,136,0.03)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--teal, #0d9488)" }}>
                                <Sparkles size={16} />
                                AI Marketing Copywriter
                            </div>
                            <span style={{ fontSize: 11, opacity: 0.6 }}>2-sentence Sri Lankan buyer pitch</span>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                            <input
                                type="text"
                                placeholder="Keywords (e.g. organic, pure ceylon, traditional)"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    border: "1px solid var(--line, #e7e5e4)",
                                    fontSize: 12.5,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleGenerateCopy}
                                disabled={isGeneratingCopy || !title.trim()}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    backgroundColor: "var(--teal, #0d9488)",
                                    color: "#fff",
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: !title.trim() ? "not-allowed" : "pointer",
                                    opacity: !title.trim() ? 0.6 : 1,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {isGeneratingCopy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {isGeneratingCopy ? "Crafting..." : "Write with AI"}
                            </button>
                        </div>

                        {copySuccess && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--teal, #0d9488)", fontSize: 11.5, marginBottom: 8 }}>
                                <Check size={13} /> Pitch generated and inserted below!
                            </div>
                        )}
                        {copyError && (
                            <div style={{ color: "#ef4444", fontSize: 11.5, marginBottom: 8 }}>
                                {copyError}
                            </div>
                        )}

                        {/* Description Textarea */}
                        <div>
                            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 4 }}>
                                Product Description / Pitch
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Detailed description or let AI craft it above..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    border: "1px solid var(--line, #e7e5e4)",
                                    fontSize: 13,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    boxSizing: "border-box",
                                    resize: "vertical",
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 18px",
                                borderRadius: 8,
                                border: "1px solid var(--line, #e7e5e4)",
                                backgroundColor: "transparent",
                                fontSize: 13.5,
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: "10px 22px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "var(--teal, #0d9488)",
                                color: "#fff",
                                fontSize: 13.5,
                                fontWeight: 600,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            {isSubmitting
                                ? isEdit ? "Updating..." : "Saving..."
                                : isEdit ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
