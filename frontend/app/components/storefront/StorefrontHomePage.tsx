"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Check, Share2 } from "lucide-react";
import { StorefrontHeader } from "./StorefrontHeader";
import { ControlsBar } from "./ControlsBar";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./EmptyState";
import type { Product, ShopInfo, FilterState, SortKey } from "./types";

interface StorefrontHomePageProps {
    shop: ShopInfo;
    products: Product[];
    onProductClick: (product: Product) => void;
}

const SORT_OPTIONS: { label: string; value: SortKey; icon: React.ReactNode }[] = [
    { label: "Newest", value: "newest", icon: <ArrowUpDown size={13} /> },
    { label: "Price ↑", value: "price_asc", icon: <ArrowUp size={13} /> },
    { label: "Price ↓", value: "price_desc", icon: <ArrowDown size={13} /> },
];

const DEFAULT_FILTERS: FilterState = {
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
};

export function StorefrontHomePage({ shop, products, onProductClick }: StorefrontHomePageProps) {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [copied, setCopied] = useState(false);

    function patchFilters(patch: Partial<FilterState>) {
        setFilters((f) => ({ ...f, ...patch }));
    }

    function clearFilters() {
        setFilters(DEFAULT_FILTERS);
    }

    function handleShare() {
        const url = window.location.href;
        navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    }

    const filtered = useMemo(() => {
        let list = [...products];

        if (filters.search.trim()) {
            const q = filters.search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }

        if (filters.category) {
            list = list.filter((p) => p.category === filters.category);
        }

        const minP = parseFloat(filters.minPrice);
        const maxP = parseFloat(filters.maxPrice);
        if (!isNaN(minP)) list = list.filter((p) => p.price >= minP);
        if (!isNaN(maxP)) list = list.filter((p) => p.price <= maxP);

        switch (filters.sort) {
            case "price_asc":
                list.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                list.sort((a, b) => b.price - a.price);
                break;
            case "newest":
            default:
                list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return list;
    }, [products, filters]);

    const hasActiveFilters =
        !!filters.search || !!filters.category || !!filters.minPrice || !!filters.maxPrice;

    return (
        <div className="app-root">
            <div className="sf-page">
                <StorefrontHeader shop={shop} onShare={handleShare} />

                {/* Share feedback toast */}
                {copied && (
                    <div style={{
                        position: "fixed",
                        bottom: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--teal)",
                        color: "var(--paper)",
                        padding: "10px 18px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 100,
                        boxShadow: "0 4px 16px rgba(17,26,20,0.22)",
                    }}>
                        <Check size={15} /> Link copied!
                    </div>
                )}

                <ControlsBar filters={filters} onChange={patchFilters} />

                {/* Sort + result count bar */}
                <div className="sf-sort-row">
                    <span className="sf-result-count">
                        {filtered.length} {filtered.length === 1 ? "product" : "products"}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => patchFilters({ sort: opt.value })}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "1px solid",
                                    borderColor: filters.sort === opt.value ? "var(--teal)" : "var(--line)",
                                    background: filters.sort === opt.value
                                        ? "rgba(43,99,87,0.08)"
                                        : "transparent",
                                    color: filters.sort === opt.value ? "var(--teal)" : "var(--ink)",
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                                    cursor: "pointer",
                                    transition: "all 0.12s ease",
                                }}
                                aria-pressed={filters.sort === opt.value}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product grid or empty state */}
                {filtered.length > 0 ? (
                    <div className="sf-product-grid">
                        {filtered.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={onProductClick}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        hasFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    />
                )}
            </div>
        </div>
    );
}
