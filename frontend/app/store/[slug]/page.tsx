"use client";

import { useEffect, useState, useMemo, use } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  MessageCircle,
  AlertCircle,
  Store,
  Share2,
  Check,
  Package,
} from "lucide-react";
import Image from "next/image";
import { api, StoreResponse, ProductResponse } from "../../lib/api";

export default function StoreCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [store, setStore] = useState<StoreResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  // Floating Cart State: Record<productId, quantity>
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      setError(null);
      try {
        const storeData = await api.getStoreBySlug(slug);
        setStore(storeData);

        const prods = await api.getProducts(slug);
        setProducts(prods);

        // Find max price to configure slider
        if (prods.length > 0) {
          const highest = Math.max(...prods.map((p) => p.price));
          setMaxPrice(Math.ceil(highest / 500) * 500 || 2000);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load store catalog."
        );
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, [slug]);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, maxPrice]);

  // Cart operations
  function updateCart(productId: string, delta: number, availableStock: number) {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      if (next > availableStock) {
        return prev;
      }
      return { ...prev, [productId]: next };
    });
  }

  // Cart totals calculation
  const { cartItemsList, cartTotal, totalItemCount } = useMemo(() => {
    const list: { product: ProductResponse; quantity: number; subtotal: number }[] =
      [];
    let total = 0;
    let count = 0;

    Object.entries(cart).forEach(([prodId, qty]) => {
      const prod = products.find((p) => p.id === prodId);
      if (prod && qty > 0) {
        const sub = prod.price * qty;
        total += sub;
        count += qty;
        list.push({ product: prod, quantity: qty, subtotal: sub });
      }
    });

    return { cartItemsList: list, cartTotal: total, totalItemCount: count };
  }, [cart, products]);

  // 1-Click WhatsApp Checkout
  async function handleCheckout() {
    if (cartItemsList.length === 0) return;
    setIsCheckingOut(true);

    try {
      const calcPayload = {
        store_slug: slug,
        items: cartItemsList.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        delivery_notes: deliveryNotes.trim() || undefined,
      };

      const res = await api.calculateOrder(calcPayload);
      if (res.whatsapp_checkout_url) {
        window.open(res.whatsapp_checkout_url, "_blank");
      }
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to generate checkout link."
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            border: "3px solid var(--line)",
            borderTopColor: "var(--teal)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ opacity: 0.7 }}>Loading store catalog...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "80px auto",
          padding: "32px 24px",
          textAlign: "center",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
        }}
      >
        <AlertCircle size={40} color="#b91c1c" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 24, margin: "0 0 8px" }}>Store Not Found</h2>
        <p style={{ opacity: 0.7, margin: "0 0 24px" }}>
          {error || "The requested catalog does not exist or has been moved."}
        </p>
        <a
          href="/"
          className="btn-primary"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          Return to PolaLink Home
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px 120px" }}>
      {/* ── Store Header ── */}
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          paddingBottom: 24,
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {store.qr_code_data_url && (
            <Image
              src={store.qr_code_data_url}
              alt="Store QR Code"
              width={80}
              height={80}
              unoptimized
              style={{
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "#fff",
                padding: 4,
              }}
            />
          )}
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 999,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                fontSize: 12,
                color: "var(--teal)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {store.category || "Verified Sri Lankan Merchant"}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-anton), 'Anton', sans-serif",
                fontSize: 34,
                lineHeight: 1.1,
                margin: "0 0 6px",
                letterSpacing: "0.01em",
              }}
            >
              {store.name}
            </h1>
            {store.description && (
              <p
                style={{
                  fontSize: 14,
                  opacity: 0.75,
                  margin: "0 0 6px",
                  maxWidth: 560,
                }}
              >
                {store.description}
              </p>
            )}
            <div style={{ fontSize: 13, opacity: 0.6, display: "flex", gap: 14 }}>
              <span>📍 {store.location || "Sri Lanka"}</span>
              <span>💬 WhatsApp: +{store.whatsapp_number}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--paper)",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--ink)",
          }}
        >
          {copied ? <Check size={16} color="var(--teal)" /> : <Share2 size={16} />}
          {copied ? "Link Copied" : "Share Store"}
        </button>
      </header>

      {/* ── Search & Filter Controls ── */}
      <section style={{ marginBottom: 36 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, spices, sweets..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--paper)",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Price Range Slider */}
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                opacity: 0.7,
                marginBottom: 4,
              }}
            >
              <span>Max Price</span>
              <span style={{ fontWeight: 600, color: "var(--teal)" }}>
                Rs. {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer", accentColor: "var(--teal)" }}
            />
          </div>
        </div>

        {/* Category Tags */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13,
                border: "1px solid var(--line)",
                cursor: "pointer",
                background:
                  selectedCategory === cat ? "var(--teal)" : "var(--paper)",
                color: selectedCategory === cat ? "var(--paper)" : "var(--ink)",
                whiteSpace: "nowrap",
                fontWeight: selectedCategory === cat ? 600 : 400,
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Product Grid ── */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 20px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: 12,
            border: "1px dashed var(--line)",
          }}
        >
          <Package size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>No products match your filters</h3>
          <p style={{ opacity: 0.6, fontSize: 14 }}>Try adjusting your search query or price slider.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filteredProducts.map((p) => {
            const qtyInCart = cart[p.id] || 0;
            const isSoldOut = p.stock_badge === "OUT_OF_STOCK" || p.stock === 0 || !p.is_available;
            const isLowStock = p.stock_badge === "LOW_STOCK";

            return (
              <div
                key={p.id}
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: isSoldOut ? 0.65 : 1,
                  position: "relative",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    height: 180,
                    width: "100%",
                    position: "relative",
                    background: "rgba(0,0,0,0.05)",
                  }}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--line)",
                      }}
                    >
                      <Package size={40} />
                    </div>
                  )}

                  {/* Stock Badges */}
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    {isSoldOut ? (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span
                        style={{
                          background: "#f59e0b",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Only {p.stock} Left
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Product Info */}
                <div
                  style={{
                    padding: 16,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600, marginBottom: 4 }}>
                      {p.category}
                    </div>
                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: 16,
                        lineHeight: 1.3,
                        fontWeight: 600,
                      }}
                    >
                      {p.title}
                    </h3>
                    {p.description && (
                      <p
                        style={{
                          fontSize: 13,
                          opacity: 0.7,
                          margin: "0 0 12px",
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Quantity Controls */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, opacity: 0.6 }}>Price:</span>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: "var(--font-anton), 'Anton', sans-serif",
                        }}
                      >
                        Rs. {p.price.toLocaleString()}
                      </div>
                    </div>

                    {isSoldOut ? (
                      <span style={{ fontSize: 12, opacity: 0.5, fontStyle: "italic" }}>
                        Unavailable
                      </span>
                    ) : qtyInCart === 0 ? (
                      <button
                        onClick={() => updateCart(p.id, 1, p.stock)}
                        style={{
                          background: "var(--teal)",
                          color: "var(--paper)",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "rgba(43,99,87,0.1)",
                          borderRadius: 8,
                          padding: "4px 6px",
                        }}
                      >
                        <button
                          onClick={() => updateCart(p.id, -1, p.stock)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            display: "flex",
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: "center" }}>
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => updateCart(p.id, 1, p.stock)}
                          disabled={qtyInCart >= p.stock}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: qtyInCart >= p.stock ? "not-allowed" : "pointer",
                            opacity: qtyInCart >= p.stock ? 0.3 : 1,
                            padding: 4,
                            display: "flex",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Floating Cart Bar & WhatsApp Checkout Modal ── */}
      {totalItemCount > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: 620,
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: 16,
            padding: "16px 20px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  background: "var(--marigold)",
                  color: "var(--ink)",
                  borderRadius: 999,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {totalItemCount}
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Your Order:</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--font-anton), 'Anton', sans-serif",
                  }}
                >
                  Rs. {cartTotal.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                background: "#25D366", // WhatsApp Brand Green
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageCircle size={18} />
              {isCheckingOut ? "Calculating..." : "1-Click WhatsApp Order"}
            </button>
          </div>

          {/* Quick optional customer notes */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 10,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 12,
                outline: "none",
              }}
            />
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Delivery city / notes"
              style={{
                flex: 2,
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
