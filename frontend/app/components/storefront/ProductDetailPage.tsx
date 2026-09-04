"use client";

import { ArrowLeft, Phone, MessageCircle, Package, Tag } from "lucide-react";
import type { Product, ShopInfo } from "./types";

interface ProductDetailPageProps {
    product: Product;
    shop: ShopInfo;
    onBack: () => void;
}

function StockLabel({ stock }: { stock: number }) {
    if (stock === 0) return (
        <span className="sf-badge sf-badge-out" style={{ fontSize: 13, padding: "5px 12px" }}>
            Out of stock
        </span>
    );
    if (stock <= 3) return (
        <span className="sf-badge sf-badge-low" style={{ fontSize: 13, padding: "5px 12px" }}>
            Only {stock} left
        </span>
    );
    return (
        <span className="sf-badge sf-badge-in" style={{ fontSize: 13, padding: "5px 12px" }}>
            In stock ({stock} available)
        </span>
    );
}

export function ProductDetailPage({ product, shop, onBack }: ProductDetailPageProps) {
    function handleWhatsApp() {
        const tel = shop.contact.replace(/\D/g, "");
        const msg = encodeURIComponent(`Hi, I'm interested in "${product.name}" (${product.currency} ${product.price.toLocaleString()}) from ${shop.shopName}.`);
        window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
    }

    function handleCall() {
        window.location.href = `tel:${shop.contact.replace(/\s+/g, "")}`;
    }

    const isOut = product.stock === 0;

    return (
        <div className="sf-page app-root">
            {/* Back link */}
            <button
                onClick={onBack}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink)",
                    opacity: 0.65,
                    fontSize: 14,
                    fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
                    padding: "24px 0 4px",
                    marginBottom: 0,
                }}
            >
                <ArrowLeft size={15} /> Back to shop
            </button>

            <div className="sf-detail-grid">
                {/* Photo */}
                {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="sf-detail-img"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                ) : (
                    <div className="sf-detail-img-placeholder">
                        <Package size={64} />
                    </div>
                )}

                {/* Info panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Category tag */}
                    <div>
                        <span className="sf-category-tag">
                            <Tag size={11} />
                            {product.category}
                        </span>
                    </div>

                    {/* Name */}
                    <h1 style={{
                        fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        fontSize: 32,
                        margin: 0,
                        lineHeight: 1.1,
                        letterSpacing: "0.01em",
                    }}>
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div style={{
                        fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        fontSize: 28,
                        color: "var(--teal)",
                        letterSpacing: "0.01em",
                    }}>
                        {product.currency} {product.price.toLocaleString()}
                    </div>

                    {/* Stock */}
                    <StockLabel stock={product.stock} />

                    {/* Description */}
                    <p style={{
                        fontSize: 15,
                        lineHeight: 1.65,
                        opacity: 0.8,
                        margin: 0,
                        borderTop: "1px solid var(--line)",
                        paddingTop: 18,
                    }}>
                        {product.description}
                    </p>

                    {/* CTAs */}
                    {!isOut && (
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
                            <button
                                className="btn-primary"
                                onClick={handleWhatsApp}
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <MessageCircle size={16} />
                                Inquire on WhatsApp
                            </button>
                            <button
                                className="btn-ghost"
                                onClick={handleCall}
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <Phone size={16} />
                                Call seller
                            </button>
                        </div>
                    )}

                    {isOut && (
                        <p style={{ fontSize: 13.5, opacity: 0.55, margin: 0, fontStyle: "italic" }}>
                            This product is currently out of stock. Contact the seller to ask when it will be restocked.
                        </p>
                    )}

                    {/* Shop credit */}
                    <div style={{
                        borderTop: "1px solid var(--line)",
                        paddingTop: 14,
                        fontSize: 13,
                        opacity: 0.55,
                    }}>
                        Listed by <strong style={{ fontWeight: 600, opacity: 1 }}>{shop.shopName}</strong>
                        {shop.location && <> · {shop.location}</>}
                    </div>
                </div>
            </div>
        </div>
    );
}
