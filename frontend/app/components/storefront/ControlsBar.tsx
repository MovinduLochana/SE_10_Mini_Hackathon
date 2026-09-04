"use client";

import { Search } from "lucide-react";
import type { FilterState } from "./types";
import { CATEGORIES } from "../storefront-onboarding/types";

interface ControlsBarProps {
    filters: FilterState;
    onChange: (patch: Partial<FilterState>) => void;
}

export function ControlsBar({ filters, onChange }: ControlsBarProps) {
    return (
        <div>
            <div className="sf-controls">
                {/* Search */}
                <div className="sf-search">
                    <Search size={15} className="sf-search-icon" />
                    <input
                        type="search"
                        placeholder="Search products…"
                        value={filters.search}
                        onChange={(e) => onChange({ search: e.target.value })}
                        aria-label="Search products"
                    />
                </div>

                {/* Filter row */}
                <div className="sf-filter-row">
                    {/* Category */}
                    <select
                        className="sf-select"
                        value={filters.category}
                        onChange={(e) => onChange({ category: e.target.value })}
                        aria-label="Filter by category"
                    >
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Price range input & slider */}
                    <div className="sf-price-range">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            min={0}
                            onChange={(e) => onChange({ minPrice: e.target.value })}
                            aria-label="Minimum price"
                        />
                        <span>–</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            min={0}
                            onChange={(e) => onChange({ maxPrice: e.target.value })}
                            aria-label="Maximum price"
                        />
                    </div>
                </div>

                {/* Interactive LKR Price Slider */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    fontSize: 12.5,
                    color: "var(--ink)"
                }}>
                    <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                        Max Price: <strong style={{ color: "var(--teal)" }}>{filters.maxPrice ? `Rs. ${Number(filters.maxPrice).toLocaleString()}` : "Any"}</strong>
                    </span>
                    <input
                        type="range"
                        min="200"
                        max="10000"
                        step="100"
                        value={filters.maxPrice || "10000"}
                        onChange={(e) => onChange({ maxPrice: e.target.value === "10000" ? "" : e.target.value })}
                        style={{
                            flex: 1,
                            accentColor: "var(--teal)",
                            cursor: "pointer",
                            height: 4,
                        }}
                    />
                    {filters.maxPrice && (
                        <button
                            type="button"
                            onClick={() => onChange({ maxPrice: "" })}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--terra)",
                                cursor: "pointer",
                                fontSize: 11.5,
                                textDecoration: "underline",
                                padding: 0
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
