"use client";

import { Store, Phone, Share2 } from "lucide-react";
import type { ShopInfo } from "./types";

interface StorefrontHeaderProps {
    shop: ShopInfo;
    onShare?: () => void;
}

export function StorefrontHeader({ shop, onShare }: StorefrontHeaderProps) {
    function handleContact() {
        const tel = shop.contact.replace(/\s+/g, "");
        const isPhone = /^\+?[\d\-]{7,}$/.test(tel);
        if (isPhone) {
            window.open(`https://wa.me/${tel.replace(/\D/g, "")}`, "_blank");
        } else {
            window.location.href = `mailto:${tel}`;
        }
    }

    return (
        <div className="sf-header">
            {shop.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.logoUrl} alt="" className="sf-header-logo"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
            ) : (
                <div className="sf-header-logo-placeholder">
                    <Store size={28} color="rgba(246,241,228,0.7)" />
                </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                    fontSize: 26,
                    margin: "0 0 4px",
                    letterSpacing: "0.01em",
                    lineHeight: 1.1,
                }}>
                    {shop.shopName}
                </h1>
                {shop.description && (
                    <p style={{ fontSize: 13.5, opacity: 0.7, margin: "0 0 6px", lineHeight: 1.5, maxWidth: 500 }}>
                        {shop.description}
                    </p>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {shop.category && (
                        <span className="sf-category-tag" style={{ fontSize: 11.5 }}>
                            {shop.category}
                        </span>
                    )}
                    {shop.location && (
                        <span style={{ fontSize: 12, opacity: 0.55 }}>📍 {shop.location}</span>
                    )}
                </div>
            </div>

            <div className="sf-header-actions">
                <button
                    className="sf-icon-btn"
                    title="Contact seller"
                    onClick={handleContact}
                    aria-label="Contact seller"
                >
                    <Phone size={16} />
                </button>
                {onShare && (
                    <button
                        className="sf-icon-btn"
                        title="Share shop"
                        onClick={onShare}
                        aria-label="Share shop"
                    >
                        <Share2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
