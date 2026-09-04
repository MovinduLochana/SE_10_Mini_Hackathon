"use client";

import { useState, useEffect, use } from "react";
import { StorefrontHomePage } from "../../components/storefront/StorefrontHomePage";
import { ProductDetailPage } from "../../components/storefront/ProductDetailPage";
import { MOCK_SHOP, MOCK_PRODUCTS } from "../../components/storefront/types";
import type { Product, ShopInfo } from "../../components/storefront/types";
import { api } from "../../lib/api";

export default function StorefrontPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [selected, setSelected] = useState<Product | null>(null);
    const [shop, setShop] = useState<ShopInfo>(MOCK_SHOP);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchStoreData() {
            setLoading(true);
            try {
                const storeData = await api.getStoreBySlug(slug);
                const prodsData = await api.getProducts(slug);

                if (isMounted && storeData) {
                    setShop({
                        shopName: storeData.name,
                        ownerName: storeData.owner_name || "Merchant",
                        description: storeData.description || "",
                        category: storeData.category || "General",
                        contact: storeData.whatsapp_number,
                        location: storeData.location || "Sri Lanka",
                        logoUrl: storeData.logo_url,
                        slug: storeData.slug,
                    });

                    if (prodsData) {
                        setProducts(
                            prodsData.map((p) => ({
                                id: p.id,
                                name: p.title,
                                description: p.description || "",
                                price: p.price,
                                currency: "LKR",
                                category: p.category,
                                imageUrl: p.image_url,
                                stock: p.is_available ? p.stock : 0,
                                createdAt: p.created_at || new Date().toISOString(),
                            }))
                        );
                    }
                }
            } catch (err) {
                console.warn("Could not load store from API, using fallback data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (slug) {
            fetchStoreData();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "70vh",
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
                <p style={{ opacity: 0.7 }}>Loading storefront...</p>
            </div>
        );
    }

    if (selected) {
        return (
            <ProductDetailPage
                product={selected}
                shop={shop}
                onBack={() => setSelected(null)}
            />
        );
    }

    return (
        <StorefrontHomePage
            shop={shop}
            products={products}
            onProductClick={setSelected}
        />
    );
}
