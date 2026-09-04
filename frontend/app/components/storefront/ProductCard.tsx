"use client";

import { Package } from "lucide-react";
import type { Product } from "./types";

function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span className="sf-badge sf-badge-out">Out of stock</span>;
    if (stock <= 3) return <span className="sf-badge sf-badge-low">Only {stock} left</span>;
    return <span className="sf-badge sf-badge-in">In stock</span>;
}

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
    const isOut = product.stock === 0;

    return (
        <div
            className={`sf-card${isOut ? " out-of-stock" : ""}`}
            onClick={() => !isOut && onClick(product)}
            role={isOut ? "article" : "button"}
            tabIndex={isOut ? -1 : 0}
            onKeyDown={(e) => !isOut && e.key === "Enter" && onClick(product)}
            aria-label={product.name}
        >
            {/* Image */}
            {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="sf-card-img"
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
            ) : (
                <div className="sf-card-img-placeholder">
                    <Package size={32} />
                </div>
            )}

            {/* Body */}
            <div className="sf-card-body">
                <p className="sf-card-name">{product.name}</p>
                <div className="sf-card-price">
                    {product.currency} {product.price.toLocaleString()}
                </div>
                <div className="sf-card-footer">
                    <StockBadge stock={product.stock} />
                    <span style={{ fontSize: 11.5, opacity: 0.45, fontStyle: "italic" }}>
                        {product.category}
                    </span>
                </div>
            </div>
        </div>
    );
}
