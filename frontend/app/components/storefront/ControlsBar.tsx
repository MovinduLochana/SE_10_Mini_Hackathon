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

                    {/* Price range */}
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
            </div>
        </div>
    );
}
