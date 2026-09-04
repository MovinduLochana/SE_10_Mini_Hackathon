"use client";

import { Package, Plus, Minus } from "lucide-react";
import type { Product } from "./types";

function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span className="sf-badge sf-badge-out">Out of stock</span>;
    if (stock <= 3) return <span className="sf-badge sf-badge-low">Only {stock} left</span>;
    return <span className="sf-badge sf-badge-in">In stock</span>;
}

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    cartQuantity?: number;
    onUpdateQuantity?: (productId: string, delta: number) => void;
}

export function ProductCard({
    product,
    onClick,
    cartQuantity = 0,
    onUpdateQuantity,
}: ProductCardProps) {
    const isOut = product.stock === 0;

    return (
        <div
            className={`sf-card${isOut ? " out-of-stock" : ""}`}
            style={{ display: "flex", flexDirection: "column", position: "relative" }}
        >
            {/* Clickable Image & Name to open detail */}
            <div
                onClick={() => !isOut && onClick(product)}
                style={{ cursor: isOut ? "default" : "pointer" }}
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
                <div className="sf-card-body" style={{ paddingBottom: 6 }}>
                    <p className="sf-card-name" style={{ marginBottom: 4 }}>{product.name}</p>
                    <div className="sf-card-price" style={{ marginBottom: 8 }}>
                        {product.currency} {product.price.toLocaleString()}
                    </div>
                    <div className="sf-card-footer" style={{ marginBottom: 12 }}>
                        <StockBadge stock={product.stock} />
                        <span style={{ fontSize: 11.5, opacity: 0.45, fontStyle: "italic" }}>
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* In-page Quantity / Add to Cart Controls */}
            <div style={{ padding: "0 14px 14px", marginTop: "auto" }}>
                {isOut ? (
                    <button
                        disabled
                        style={{
                            width: "100%",
                            padding: "8px 0",
                            borderRadius: 8,
                            border: "1px solid var(--line, #e7e5e4)",
                            background: "rgba(0,0,0,0.04)",
                            color: "var(--ink, #1c1917)",
                            opacity: 0.5,
                            fontSize: 12.5,
                            cursor: "not-allowed",
                        }}
                    >
                        Sold Out
                    </button>
                ) : cartQuantity === 0 ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity?.(product.id, 1);
                        }}
                        style={{
                            width: "100%",
                            padding: "8px 0",
                            borderRadius: 8,
                            border: "none",
                            background: "var(--teal, #0d9488)",
                            color: "var(--paper, #fcfbf7)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            transition: "background 0.15s ease",
                        }}
                    >
                        <Plus size={14} /> Add to Cart
                    </button>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(13,148,136,0.1)",
                            borderRadius: 8,
                            padding: "4px 8px",
                            border: "1px solid rgba(13,148,136,0.25)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => onUpdateQuantity?.(product.id, -1)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                display: "flex",
                                color: "var(--teal, #0d9488)",
                            }}
                        >
                            <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--teal, #0d9488)" }}>
                            {cartQuantity} in cart
                        </span>
                        <button
                            onClick={() => onUpdateQuantity?.(product.id, 1)}
                            disabled={cartQuantity >= product.stock}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: cartQuantity >= product.stock ? "not-allowed" : "pointer",
                                opacity: cartQuantity >= product.stock ? 0.3 : 1,
                                padding: 4,
                                display: "flex",
                                color: "var(--teal, #0d9488)",
                            }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
