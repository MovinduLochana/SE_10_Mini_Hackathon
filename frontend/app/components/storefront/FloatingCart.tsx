"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart, ChevronUp, ChevronDown, Plus, Minus, Trash2 } from "lucide-react";
import type { Product } from "./types";
import { api } from "../../../lib/api";

interface FloatingCartProps {
    cart: Record<string, number>;
    products: Product[];
    storeSlug: string;
    onUpdateQuantity: (productId: string, delta: number) => void;
    onClearCart: () => void;
}

export function FloatingCart({
    cart,
    products,
    storeSlug,
    onUpdateQuantity,
    onClearCart,
}: FloatingCartProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorNotice, setErrorNotice] = useState<string | null>(null);

    // Calculate line items and total
    const cartItems = Object.entries(cart)
        .map(([id, qty]) => {
            const product = products.find((p) => p.id === id);
            if (!product || qty <= 0) return null;
            return {
                product,
                quantity: qty,
                subtotal: product.price * qty,
            };
        })
        .filter(Boolean) as { product: Product; quantity: number; subtotal: number }[];

    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    if (totalCount === 0) return null;

    async function handleWhatsAppCheckout() {
        setLoading(true);
        setErrorNotice(null);

        try {
            const payload = {
                store_slug: storeSlug,
                items: cartItems.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
                customer_name: customerName.trim() || undefined,
                customer_phone: customerPhone.trim() || undefined,
                delivery_notes: deliveryNotes.trim() || undefined,
            };

            const res = await api.calculateOrder(payload);

            if (res.has_stock_issues && res.stock_warnings.length > 0) {
                setErrorNotice(res.stock_warnings.join(" | "));
            }

            if (res.whatsapp_checkout_url) {
                window.open(res.whatsapp_checkout_url, "_blank");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to calculate order.";
            setErrorNotice(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 32px)",
                maxWidth: 620,
                zIndex: 1000,
                borderRadius: 16,
                background: "var(--ink, #1c1917)",
                color: "var(--paper, #fcfbf7)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: "var(--font-work-sans), sans-serif",
            }}
        >
            {/* ── Expanded Drawer Content ── */}
            {isExpanded && (
                <div style={{ padding: "18px 20px 10px", maxHeight: "60vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Your Order Breakdown</h4>
                        <button
                            onClick={onClearCart}
                            style={{
                                background: "none",
                                border: "none",
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 12,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <Trash2 size={13} /> Clear
                        </button>
                    </div>

                    {/* Items List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                        {cartItems.map((item) => (
                            <div
                                key={item.product.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "rgba(255,255,255,0.06)",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.product.name}
                                    </div>
                                    <div style={{ fontSize: 12, opacity: 0.65 }}>
                                        Rs. {item.product.price.toLocaleString()} × {item.quantity} = <strong style={{ opacity: 1, color: "var(--marigold, #f59e0b)" }}>Rs. {item.subtotal.toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                                        style={{
                                            background: "rgba(255,255,255,0.15)",
                                            border: "none",
                                            borderRadius: 6,
                                            width: 26,
                                            height: 26,
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center" }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                                        disabled={item.quantity >= item.product.stock}
                                        style={{
                                            background: "rgba(255,255,255,0.15)",
                                            border: "none",
                                            borderRadius: 6,
                                            width: 26,
                                            height: 26,
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: item.quantity >= item.product.stock ? "not-allowed" : "pointer",
                                            opacity: item.quantity >= item.product.stock ? 0.3 : 1,
                                        }}
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery & Customer Details */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <input
                            type="text"
                            placeholder="Your Name (Kasun Perera)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                fontSize: 13,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Phone (0771234567)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                fontSize: 13,
                                outline: "none",
                            }}
                        />
                    </div>
                    <textarea
                        placeholder="Delivery Address / Notes (e.g. Near Galle Face, please call before arriving)"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        rows={2}
                        style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontSize: 13,
                            outline: "none",
                            boxSizing: "border-box",
                            resize: "vertical",
                        }}
                    />

                    {errorNotice && (
                        <div
                            style={{
                                marginTop: 10,
                                padding: "8px 12px",
                                borderRadius: 6,
                                background: "#ef4444",
                                color: "#fff",
                                fontSize: 12,
                            }}
                        >
                            {errorNotice}
                        </div>
                    )}
                </div>
            )}

            {/* ── Summary Bar ── */}
            <div
                style={{
                    padding: "14px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    borderTop: isExpanded ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            background: "var(--marigold, #f59e0b)",
                            color: "var(--ink, #1c1917)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        {totalCount}
                    </div>
                    <div>
                        <div style={{ fontSize: 11, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Order Subtotal
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--font-anton), 'Anton', sans-serif",
                                fontSize: 20,
                                letterSpacing: "0.02em",
                            }}
                        >
                            Rs. {totalAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppCheckout();
                        }}
                        disabled={loading}
                        style={{
                            background: "#25D366", // Official WhatsApp Green
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 10,
                            padding: "10px 16px",
                            fontSize: 13.5,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 4px 14px rgba(37,211,102,0.4)",
                        }}
                    >
                        <MessageCircle size={17} />
                        {loading ? "Preparing..." : "1-Click WhatsApp Order"}
                    </button>

                    <div style={{ opacity: 0.7, padding: 4 }}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
