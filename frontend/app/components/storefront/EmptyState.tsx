"use client";

import { Search } from "lucide-react";

interface EmptyStateProps {
    hasFilters: boolean;
    onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
    return (
        <div className="sf-empty">
            <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(28,43,34,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink)",
                opacity: 0.35,
            }}>
                <Search size={26} />
            </div>

            <h2 style={{
                fontFamily: "var(--font-anton), 'Anton', sans-serif",
                fontSize: 22,
                margin: 0,
                letterSpacing: "0.01em",
            }}>
                {hasFilters ? "No products match your filters" : "No products yet"}
            </h2>

            <p style={{ fontSize: 14.5, opacity: 0.6, margin: 0, maxWidth: 320, lineHeight: 1.55 }}>
                {hasFilters
                    ? "Try adjusting your search terms, category, or price range."
                    : "This shop hasn't added any products yet. Check back soon!"}
            </p>

            {hasFilters && (
                <button className="btn-ghost" onClick={onClearFilters} style={{ marginTop: 6 }}>
                    Clear filters
                </button>
            )}
        </div>
    );
}
