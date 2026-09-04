"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
    Store,
    QrCode,
    Plus,
    Search,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    LogOut,
    Trash2,
    Loader2,
    RefreshCw,
    Download,
    Eye,
    EyeOff,
    Pencil,
    Check
} from "lucide-react";
import Image from "next/image";
import { api, StoreResponse, ProductResponse } from "../lib/api";
import { ProductFormModal } from "../components/dashboard/ProductFormModal";

export default function DashboardPage() {
    const [token, setToken] = useState<string | null>(null);
    const [stores, setStores] = useState<StoreResponse[]>([]);
    const [selectedStore, setSelectedStore] = useState<StoreResponse | null>(null);
    const [inventory, setInventory] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [inventoryError, setInventoryError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [syncingProductIds, setSyncingProductIds] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Debounced pending stock adjustment tracking
    const pendingAdjustments = useRef<Map<string, { delta: number; timer: NodeJS.Timeout; originalStock: number }>>(new Map());

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "sold_out">("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Login state if not authenticated
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    function showToast(msg: string) {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    }

    useEffect(() => {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("polalink_token") : null;
        if (storedToken) {
            setToken(storedToken);
            setIsCheckingAuth(false);
            loadMerchantStores(storedToken);
        } else {
            setIsCheckingAuth(false);
            setLoading(false);
            setIsInitialLoad(false);
            setInventoryLoading(false);
        }
    }, []);

    async function loadMerchantStores(authToken: string) {
        setLoading(true);
        setInventoryLoading(true);
        setInventoryError(null);
        try {
            const myStores = await api.getMyStores(authToken);
            setStores(myStores);
            if (myStores.length > 0) {
                // Check if preferred slug is stored
                const savedSlug = localStorage.getItem("polalink_slug");
                const matched = myStores.find((s) => s.slug === savedSlug) || myStores[0];
                setSelectedStore(matched);
                await loadInventory(matched.slug, authToken);
            } else {
                setInventoryLoading(false);
            }
        } catch (err: unknown) {
            console.error("Failed to load merchant stores:", err);
            setInventoryError(err instanceof Error ? err.message : "Failed to load stores.");
            setInventoryLoading(false);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }

    async function loadInventory(slug: string, authToken: string) {
        setInventoryLoading(true);
        setInventoryError(null);
        try {
            const items = await api.getMerchantInventory(slug, authToken);
            setInventory(items);
        } catch (err: unknown) {
            console.error("Failed to load inventory:", err);
            setInventoryError(err instanceof Error ? err.message : "Failed to load inventory items.");
        } finally {
            setInventoryLoading(false);
        }
    }

    async function handleLoginSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoginError("");
        if (!loginEmail || !loginPassword) {
            setLoginError("Please enter your email and password.");
            return;
        }

        setIsLoggingIn(true);
        try {
            const res = await api.login(loginEmail, loginPassword);
            const authToken = res.access_token;
            localStorage.setItem("polalink_token", authToken);
            setToken(authToken);
            setIsInitialLoad(true);
            await loadMerchantStores(authToken);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to log in.";
            setLoginError(msg);
            setIsInitialLoad(false);
        } finally {
            setIsLoggingIn(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("polalink_token");
        localStorage.removeItem("polalink_slug");
        setToken(null);
        setStores([]);
        setSelectedStore(null);
        setInventory([]);
    }

    // ── 1-Click Stock Status Toggle ──
    async function handleToggleStatus(productId: string, currentAvailable: boolean) {
        if (!token) return;
        setActionLoadingId(productId);
        const newAvailable = !currentAvailable;

        // Optimistic update
        setInventory((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, is_available: newAvailable } : item
            )
        );

        try {
            const updated = await api.toggleProductStatus(productId, newAvailable, token);
            setInventory((prev) =>
                prev.map((item) => (item.id === productId ? updated : item))
            );
        } catch (err) {
            console.error("Toggle status failed:", err);
            // Revert
            setInventory((prev) =>
                prev.map((item) =>
                    item.id === productId ? { ...item, is_available: currentAvailable } : item
                )
            );
        } finally {
            setActionLoadingId(null);
        }
    }

    // Clean up debounced timers on unmount
    useEffect(() => {
        const pendingMap = pendingAdjustments.current;
        return () => {
            pendingMap.forEach((entry) => {
                clearTimeout(entry.timer);
            });
            pendingMap.clear();
        };
    }, []);

    // ── Non-Freezing Optimistic & Debounced Deferred Stock Restock ──
    function handleAdjustStock(productId: string, delta: number) {
        if (!token) return;

        const currentItem = inventory.find((i) => i.id === productId);
        if (!currentItem) return;

        // 1. Calculate next optimistic stock
        const currentStock = currentItem.stock;
        const targetStock = Math.max(0, currentStock + delta);
        const nextAvailable = targetStock > 0 ? (currentStock === 0 ? true : currentItem.is_available) : false;

        // 2. Instant optimistic update in React state - ZERO UI freeze
        setInventory((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, stock: targetStock, is_available: nextAvailable }
                    : item
            )
        );

        // 3. Debounced deferred sync
        const existing = pendingAdjustments.current.get(productId);
        if (existing) {
            clearTimeout(existing.timer);
        }

        const accumulatedDelta = (existing ? existing.delta : 0) + delta;
        const baseOriginalStock = existing ? existing.originalStock : currentStock;

        // Set non-blocking syncing indicator
        setSyncingProductIds((prev) => new Set(prev).add(productId));

        const timer = setTimeout(async () => {
            try {
                const updated = await api.adjustProductStock(productId, { adjustment: accumulatedDelta }, token);
                // Synchronize with backend canonical state
                setInventory((prev) =>
                    prev.map((item) => (item.id === productId ? updated : item))
                );
            } catch (err) {
                console.error("Debounced adjust stock failed:", err);
                // Rollback to original base stock on network/server error
                setInventory((prev) =>
                    prev.map((item) =>
                        item.id === productId ? { ...item, stock: baseOriginalStock } : item
                    )
                );
            } finally {
                pendingAdjustments.current.delete(productId);
                setSyncingProductIds((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
            }
        }, 500);

        pendingAdjustments.current.set(productId, {
            delta: accumulatedDelta,
            timer,
            originalStock: baseOriginalStock,
        });
    }

    // ── Delete Product ──
    async function handleDeleteProduct(productId: string) {
        if (!token) return;
        setActionLoadingId(productId);

        try {
            await api.deleteProduct(productId, token);
            setInventory((prev) => prev.filter((item) => item.id !== productId));
            setDeleteConfirmId(null);
        } catch (err) {
            console.error("Delete product failed:", err);
        } finally {
            setActionLoadingId(null);
        }
    }

    // ── Filtered Inventory ──
    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === "all" || item.category === selectedCategory;

            let matchesStatus = true;
            if (statusFilter === "in_stock") {
                matchesStatus = item.is_available && item.stock > 3;
            } else if (statusFilter === "low_stock") {
                matchesStatus = item.is_available && item.stock > 0 && item.stock <= 3;
            } else if (statusFilter === "sold_out") {
                matchesStatus = !item.is_available || item.stock === 0;
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [inventory, searchQuery, selectedCategory, statusFilter]);

    // Metrics
    const metrics = useMemo(() => {
        const total = inventory.length;
        const inStock = inventory.filter((i) => i.is_available && i.stock > 3).length;
        const lowStock = inventory.filter((i) => i.is_available && i.stock > 0 && i.stock <= 3).length;
        const soldOut = inventory.filter((i) => !i.is_available || i.stock === 0).length;
        return { total, inStock, lowStock, soldOut };
    }, [inventory]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        inventory.forEach((i) => set.add(i.category));
        return Array.from(set);
    }, [inventory]);

function DashboardSkeleton() {
    return (
        <div className="app-root animate-pulse" style={{ minHeight: "100vh", backgroundColor: "var(--cream, #f5f4ef)", padding: "24px 16px 64px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {/* Header Skeleton */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)" }} />
                        <div>
                            <div style={{ width: 170, height: 22, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.08)", marginBottom: 6 }} />
                            <div style={{ width: 240, height: 12, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.04)" }} />
                        </div>
                    </div>
                </div>

                {/* Profile Card Skeleton */}
                <div style={{ backgroundColor: "var(--paper, #fcfbf7)", border: "1px solid var(--line, #e7e5e4)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.07)" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ width: 140, height: 16, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", marginBottom: 8 }} />
                        <div style={{ width: 280, height: 12, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" }} />
                    </div>
                </div>

                {/* Metrics Skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ backgroundColor: "var(--paper, #fcfbf7)", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--line, #e7e5e4)" }}>
                            <div style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.06)", marginBottom: 8 }} />
                            <div style={{ width: 42, height: 24, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.1)" }} />
                        </div>
                    ))}
                </div>

                {/* Controls Skeleton */}
                <div style={{ backgroundColor: "var(--paper, #fcfbf7)", height: 60, borderRadius: 14, border: "1px solid var(--line, #e7e5e4)", marginBottom: 16 }} />

                {/* Rows Skeleton */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ backgroundColor: "var(--paper, #fcfbf7)", height: 74, borderRadius: 12, border: "1px solid var(--line, #e7e5e4)", display: "flex", alignItems: "center", padding: "0 18px", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.06)" }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ width: "32%", height: 15, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", marginBottom: 6 }} />
                                <div style={{ width: "18%", height: 11, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

    // ── Auth Checking & Initial Loading State ──
    if (isCheckingAuth || (token && (isInitialLoad || loading))) {
        return <DashboardSkeleton />;
    }

    // ── Unauthenticated State ──
    if (!token) {
        return (
            <div className="app-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ width: "100%", maxWidth: 440, backgroundColor: "var(--paper, #fcfbf7)", border: "1px solid var(--line, #e7e5e4)", borderRadius: 16, padding: 32, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <Store size={26} color="var(--teal, #0d9488)" />
                        <h1 style={{ fontFamily: "var(--font-anton), 'Anton', sans-serif", fontSize: 26, margin: 0 }}>
                            Merchant Dashboard
                        </h1>
                    </div>
                    <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24, lineHeight: 1.5 }}>
                        Log in with your PolaLink LK merchant account to manage your live inventory, stock levels, and products.
                    </p>

                    {loginError && (
                        <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #f87171", borderRadius: 8, color: "#b91c1c", fontSize: 13, marginBottom: 18 }}>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line, #e7e5e4)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line, #e7e5e4)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            style={{
                                marginTop: 8,
                                padding: "12px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "var(--teal, #0d9488)",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: isLoggingIn ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                            }}
                        >
                            {isLoggingIn && <Loader2 size={16} className="animate-spin" />}
                            {isLoggingIn ? "Logging in..." : "Access Dashboard"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: 12 }}>
                            <a href="/" style={{ color: "var(--teal, #0d9488)", fontSize: 13.5, textDecoration: "none", fontWeight: 500 }}>
                                Need a shop? Register for free →
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ── Main Dashboard ──
    return (
        <div className="app-root" style={{ minHeight: "100vh", backgroundColor: "var(--cream, #f5f4ef)", padding: "24px 16px 64px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {/* Top Nav / Brand Bar */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--teal, #0d9488)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                            <Store size={22} />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <h1 style={{ fontFamily: "var(--font-anton), 'Anton', sans-serif", fontSize: 24, margin: 0, color: "var(--ink, #1c1917)" }}>
                                    {selectedStore ? selectedStore.name : "Merchant Dashboard"}
                                </h1>
                                {selectedStore && (
                                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, backgroundColor: "rgba(13,148,136,0.1)", color: "var(--teal, #0d9488)", fontWeight: 600 }}>
                                        {selectedStore.category}
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: 0, fontSize: 12.5, opacity: 0.6, color: "var(--ink, #1c1917)" }}>
                                Sri Lankan Micro-Merchant Inventory Control Engine
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {selectedStore && (
                            <>
                                <a
                                    href={`/store/${selectedStore.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "8px 14px",
                                        borderRadius: 8,
                                        backgroundColor: "var(--paper, #fcfbf7)",
                                        border: "1px solid var(--line, #e7e5e4)",
                                        color: "var(--ink, #1c1917)",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        textDecoration: "none",
                                    }}
                                >
                                    <ExternalLink size={14} /> Storefront
                                </a>

                                <button
                                    onClick={() => setShowQrModal(true)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "8px 14px",
                                        borderRadius: 8,
                                        backgroundColor: "var(--paper, #fcfbf7)",
                                        border: "1px solid var(--line, #e7e5e4)",
                                        color: "var(--ink, #1c1917)",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    <QrCode size={14} /> Shop QR
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 12px",
                                borderRadius: 8,
                                backgroundColor: "transparent",
                                border: "1px solid var(--line, #e7e5e4)",
                                color: "var(--terra, #c2410c)",
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </header>

                {/* Store Profile Card */}
                {selectedStore && (
                    <div
                        style={{
                            backgroundColor: "var(--paper, #fcfbf7)",
                            border: "1px solid var(--line, #e7e5e4)",
                            borderRadius: 14,
                            padding: "16px 20px",
                            marginBottom: 20,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                        }}
                    >
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            {selectedStore.logo_url ? (
                                <Image
                                    src={selectedStore.logo_url}
                                    alt={selectedStore.name}
                                    width={48}
                                    height={48}
                                    style={{ borderRadius: 10, objectFit: "cover" }}
                                    unoptimized
                                />
                            ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Store size={22} color="var(--ink)" />
                                </div>
                            )}
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{selectedStore.name}</div>
                                <div style={{ fontSize: 13, opacity: 0.7 }}>
                                    Owner: {selectedStore.owner_name || "Merchant"} • WhatsApp: <strong>{selectedStore.whatsapp_number}</strong> • {selectedStore.location || "Sri Lanka"}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12.5, opacity: 0.6 }}>Public Catalog:</span>
                            <code style={{ fontSize: 12, padding: "4px 8px", backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 6 }}>
                                /store/{selectedStore.slug}
                            </code>
                        </div>
                    </div>
                )}

                {/* Metrics Row */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 12,
                        marginBottom: 24,
                    }}
                >
                    <div style={{ backgroundColor: "var(--paper, #fcfbf7)", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--line, #e7e5e4)" }}>
                        <div style={{ fontSize: 12.5, opacity: 0.6, marginBottom: 4, fontWeight: 500 }}>Total Products</div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)" }}>{metrics.total}</div>
                    </div>

                    <div style={{ backgroundColor: "var(--paper, #fcfbf7)", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--line, #e7e5e4)" }}>
                        <div style={{ fontSize: 12.5, color: "#059669", marginBottom: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={13} /> In Stock
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: "#059669" }}>{metrics.inStock}</div>
                    </div>

                    <div style={{ backgroundColor: "var(--paper, #fcfbf7)", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--line, #e7e5e4)" }}>
                        <div style={{ fontSize: 12.5, color: "#d97706", marginBottom: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={13} /> Low Stock (≤ 3)
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: "#d97706" }}>{metrics.lowStock}</div>
                    </div>

                    <div style={{ backgroundColor: "var(--paper, #fcfbf7)", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--line, #e7e5e4)" }}>
                        <div style={{ fontSize: 12.5, color: "#dc2626", marginBottom: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                            <XCircle size={13} /> Sold Out
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: "#dc2626" }}>{metrics.soldOut}</div>
                    </div>
                </div>

                {/* Inventory Controls Bar */}
                <div
                    style={{
                        backgroundColor: "var(--paper, #fcfbf7)",
                        padding: "16px 20px",
                        borderRadius: 14,
                        border: "1px solid var(--line, #e7e5e4)",
                        marginBottom: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 14,
                    }}
                >
                    {/* Search & Category */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Filter items by title, category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px 8px 32px",
                                    borderRadius: 8,
                                    border: "1px solid var(--line, #e7e5e4)",
                                    fontSize: 13.5,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {categories.length > 0 && (
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px solid var(--line, #e7e5e4)",
                                    fontSize: 13.5,
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    outline: "none",
                                }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Stock status filter chips */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(["all", "in_stock", "low_stock", "sold_out"] as const).map((key) => {
                            const labels = {
                                all: "All",
                                in_stock: "In Stock",
                                low_stock: "Low Stock",
                                sold_out: "Sold Out",
                            };
                            const isActive = statusFilter === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        border: `1px solid ${isActive ? "var(--teal, #0d9488)" : "var(--line, #e7e5e4)"}`,
                                        backgroundColor: isActive ? "rgba(13,148,136,0.1)" : "transparent",
                                        color: isActive ? "var(--teal, #0d9488)" : "var(--ink, #1c1917)",
                                        fontSize: 12.5,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    {labels[key]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Add Product Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        disabled={!selectedStore}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "9px 18px",
                            borderRadius: 8,
                            border: "none",
                            backgroundColor: "var(--teal, #0d9488)",
                            color: "#fff",
                            fontSize: 13.5,
                            fontWeight: 600,
                            cursor: !selectedStore ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>

                {/* Inventory List */}
                {loading || inventoryLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: "var(--paper, #fcfbf7)",
                                    height: 74,
                                    borderRadius: 12,
                                    border: "1px solid var(--line, #e7e5e4)",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 18px",
                                    gap: 14,
                                    opacity: 0.65,
                                }}
                                className="animate-pulse"
                            >
                                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.06)" }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ width: "32%", height: 15, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", marginBottom: 6 }} />
                                    <div style={{ width: "18%", height: 11, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : inventoryError ? (
                    <div
                        style={{
                            backgroundColor: "var(--paper, #fcfbf7)",
                            border: "1px dashed var(--line, #e7e5e4)",
                            borderRadius: 14,
                            padding: 36,
                            textAlign: "center",
                        }}
                    >
                        <AlertTriangle size={32} color="var(--terra, #c2410c)" style={{ margin: "0 auto 10px" }} />
                        <h3 style={{ margin: "0 0 6px", fontSize: 17, color: "var(--ink, #1c1917)" }}>Unable to load inventory</h3>
                        <p style={{ margin: "0 0 16px", fontSize: 13.5, opacity: 0.7 }}>{inventoryError}</p>
                        <button
                            onClick={() => {
                                if (token && selectedStore) {
                                    loadInventory(selectedStore.slug, token);
                                }
                            }}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "var(--teal, #0d9488)",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : stores.length === 0 ? (
                    <div
                        style={{
                            backgroundColor: "var(--paper, #fcfbf7)",
                            border: "1px dashed var(--line, #e7e5e4)",
                            borderRadius: 14,
                            padding: 48,
                            textAlign: "center",
                        }}
                    >
                        <Store size={36} color="var(--teal, #0d9488)" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
                        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>No store found</h3>
                        <p style={{ margin: "0 0 18px", fontSize: 13.5, opacity: 0.65 }}>
                            You haven&apos;t created a store yet. Set up your shop profile to start managing products.
                        </p>
                        <a
                            href="/"
                            style={{
                                display: "inline-block",
                                padding: "9px 20px",
                                borderRadius: 8,
                                backgroundColor: "var(--teal, #0d9488)",
                                color: "#fff",
                                fontSize: 13.5,
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            + Create Shop
                        </a>
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div
                        style={{
                            backgroundColor: "var(--paper, #fcfbf7)",
                            border: "1px dashed var(--line, #e7e5e4)",
                            borderRadius: 14,
                            padding: 48,
                            textAlign: "center",
                        }}
                    >
                        <Package size={36} color="var(--teal, #0d9488)" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
                        <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>No products found</h3>
                        <p style={{ margin: "0 0 18px", fontSize: 13.5, opacity: 0.65 }}>
                            {inventory.length === 0
                                ? "Your inventory is currently empty. Add your first item using the button above."
                                : "Try clearing your filters or search query."}
                        </p>
                        {inventory.length === 0 && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{
                                    padding: "8px 18px",
                                    borderRadius: 8,
                                    border: "none",
                                    backgroundColor: "var(--teal, #0d9488)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                + Add First Item
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {filteredInventory.map((item) => {
                            const isActionLoading = actionLoadingId === item.id;
                            const isSoldOut = !item.is_available || item.stock === 0;
                            const isLowStock = item.is_available && item.stock > 0 && item.stock <= 3;

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        backgroundColor: "var(--paper, #fcfbf7)",
                                        border: "1px solid var(--line, #e7e5e4)",
                                        borderRadius: 12,
                                        padding: "14px 18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        flexWrap: "wrap",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {/* Left: Thumbnail + Info */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 220, flex: 2 }}>
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.title}
                                                width={48}
                                                height={48}
                                                style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                                                unoptimized
                                            />
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Package size={22} color="var(--ink)" opacity={0.4} />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
                                                {item.title}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, opacity: 0.65, marginTop: 2 }}>
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <strong style={{ color: "var(--teal, #0d9488)" }}>
                                                    Rs. {item.price.toLocaleString()}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Stock Status Badge */}
                                    <div style={{ minWidth: 120 }}>
                                        {isSoldOut ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#fee2e2", color: "#b91c1c" }}>
                                                <XCircle size={12} /> Sold Out
                                            </span>
                                        ) : isLowStock ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#fef3c7", color: "#b45309" }}>
                                                <AlertTriangle size={12} /> Low ({item.stock} left)
                                            </span>
                                        ) : (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#d1fae5", color: "#065f46" }}>
                                                <CheckCircle2 size={12} /> In Stock ({item.stock})
                                            </span>
                                        )}
                                    </div>

                                    {/* Non-Freezing Inline Restock Counter */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <button
                                            onClick={() => handleAdjustStock(item.id, -1)}
                                            disabled={item.stock <= 0}
                                            title="Decrement stock by 1"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 6,
                                                border: "1px solid var(--line, #e7e5e4)",
                                                backgroundColor: "transparent",
                                                cursor: item.stock <= 0 ? "not-allowed" : "pointer",
                                                opacity: item.stock <= 0 ? 0.35 : 1,
                                                fontWeight: 700,
                                                fontSize: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                userSelect: "none",
                                            }}
                                        >
                                            -
                                        </button>
                                        <div style={{ position: "relative", minWidth: 36, textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                                                {item.stock}
                                            </span>
                                            {syncingProductIds.has(item.id) && (
                                                <span
                                                    title="Syncing..."
                                                    style={{
                                                        position: "absolute",
                                                        top: -3,
                                                        right: -6,
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        backgroundColor: "var(--teal, #0d9488)",
                                                        boxShadow: "0 0 4px var(--teal, #0d9488)",
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAdjustStock(item.id, 1)}
                                            title="Restock +1"
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 6,
                                                border: "1px solid var(--line, #e7e5e4)",
                                                backgroundColor: "transparent",
                                                cursor: "pointer",
                                                fontWeight: 700,
                                                fontSize: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                userSelect: "none",
                                            }}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => handleAdjustStock(item.id, 5)}
                                            title="Quick restock +5"
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: 6,
                                                border: "1px solid rgba(13,148,136,0.3)",
                                                backgroundColor: "rgba(13,148,136,0.08)",
                                                color: "var(--teal, #0d9488)",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                fontSize: 11,
                                                userSelect: "none",
                                            }}
                                        >
                                            +5
                                        </button>
                                    </div>

                                    {/* 1-Click Stock Status Toggle */}
                                    <div>
                                        <button
                                            onClick={() => handleToggleStatus(item.id, item.is_available)}
                                            disabled={isActionLoading}
                                            title={item.is_available ? "Hide from public catalog" : "Show on public catalog"}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "6px 12px",
                                                borderRadius: 6,
                                                border: "1px solid var(--line, #e7e5e4)",
                                                backgroundColor: item.is_available ? "rgba(5,150,105,0.08)" : "rgba(0,0,0,0.04)",
                                                color: item.is_available ? "#059669" : "var(--ink, #1c1917)",
                                                fontSize: 12.5,
                                                fontWeight: 500,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {item.is_available ? <Eye size={13} /> : <EyeOff size={13} />}
                                            {item.is_available ? "Available" : "Hidden"}
                                        </button>
                                    </div>

                                    {/* Actions: Edit & Delete */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <button
                                            onClick={() => {
                                                setEditingProduct(item);
                                                setShowAddModal(true);
                                            }}
                                            title="Edit product details"
                                            style={{
                                                background: "none",
                                                border: "1px solid var(--line, #e7e5e4)",
                                                borderRadius: 6,
                                                color: "var(--ink, #1c1917)",
                                                opacity: 0.75,
                                                cursor: "pointer",
                                                padding: "5px 7px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        {deleteConfirmId === item.id ? (
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <button
                                                    onClick={() => {
                                                        handleDeleteProduct(item.id);
                                                        showToast("Product deleted.");
                                                    }}
                                                    style={{
                                                        padding: "5px 8px",
                                                        borderRadius: 6,
                                                        border: "none",
                                                        backgroundColor: "#dc2626",
                                                        color: "#fff",
                                                        fontSize: 11.5,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    style={{
                                                        padding: "5px 8px",
                                                        borderRadius: 6,
                                                        border: "1px solid var(--line, #e7e5e4)",
                                                        backgroundColor: "transparent",
                                                        fontSize: 11.5,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                disabled={isActionLoading}
                                                title="Delete product"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#9ca3af",
                                                    cursor: "pointer",
                                                    padding: 6,
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Product Creation & Editing Modal */}
            {showAddModal && selectedStore && token && (
                <ProductFormModal
                    storeSlug={selectedStore.slug}
                    token={token}
                    initialProduct={editingProduct}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingProduct(null);
                    }}
                    onProductCreated={(newProduct) => {
                        setInventory((prev) => [newProduct, ...prev]);
                        showToast(`Added "${newProduct.title}" to catalog.`);
                    }}
                    onProductUpdated={(updatedProduct) => {
                        setInventory((prev) =>
                            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
                        );
                        showToast(`Updated "${updatedProduct.title}".`);
                    }}
                />
            )}

            {/* Global Toast Notification */}
            {toastMessage && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        backgroundColor: "var(--ink, #1c1917)",
                        color: "var(--paper, #fcfbf7)",
                        padding: "10px 18px",
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 1200,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    }}
                >
                    <Check size={15} color="var(--teal, #0d9488)" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && selectedStore && (
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
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "var(--paper, #fcfbf7)",
                            borderRadius: 16,
                            width: "100%",
                            maxWidth: 400,
                            padding: 24,
                            textAlign: "center",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontFamily: "var(--font-anton), 'Anton', sans-serif", fontSize: 22, margin: "0 0 6px" }}>
                            {selectedStore.name} QR Code
                        </h3>
                        <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 20px" }}>
                            Print this QR code on packaging, stickers, or share on WhatsApp and social media.
                        </p>

                        <div style={{ display: "inline-block", padding: 12, borderRadius: 12, backgroundColor: "#fff", border: "1px solid var(--line, #e7e5e4)", marginBottom: 16 }}>
                            <Image
                                src={selectedStore.qr_code_data_url || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedStore.store_url || window.location.origin + "/store/" + selectedStore.slug)}`}
                                alt="Store QR code"
                                width={180}
                                height={180}
                                unoptimized
                            />
                        </div>

                        <div style={{ fontSize: 13, marginBottom: 20 }}>
                            <a
                                href={selectedStore.store_url || `/store/${selectedStore.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--teal, #0d9488)", textDecoration: "none", wordBreak: "break-all" }}
                            >
                                {selectedStore.store_url || `/store/${selectedStore.slug}`}
                            </a>
                        </div>

                        <button
                            onClick={() => setShowQrModal(false)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: 8,
                                border: "none",
                                backgroundColor: "var(--teal, #0d9488)",
                                color: "#fff",
                                fontSize: 13.5,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
