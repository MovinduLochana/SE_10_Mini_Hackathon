import { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontClientView } from "./StorefrontClientView";
import type { Product, ShopInfo } from "../../components/storefront/types";
import { api } from "../../lib/api";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const store = await api.getStoreBySlug(slug);
        if (store) {
            return {
                title: `${store.name} | PolaLink LK`,
                description: store.description || `Browse products from ${store.name} and order directly via WhatsApp.`,
                openGraph: {
                    title: `${store.name} - PolaLink LK Catalog`,
                    description: store.description || `Order directly on WhatsApp from ${store.name}.`,
                    images: store.logo_url ? [{ url: store.logo_url }] : [],
                },
            };
        }
    } catch {
        // Fallback title
    }

    return {
        title: "Storefront Catalog | PolaLink LK",
        description: "Sri Lankan Hyper-Local Merchant Catalog with 1-Click WhatsApp Ordering.",
    };
}

export default async function StoreCatalogPage({ params }: PageProps) {
    const { slug } = await params;

    let shop: ShopInfo | null = null;
    let products: Product[] = [];

    try {
        const [storeData, prodsData] = await Promise.all([
            api.getStoreBySlug(slug),
            api.getProducts(slug),
        ]);

        if (storeData) {
            shop = {
                shopName: storeData.name,
                ownerName: storeData.owner_name || "Merchant",
                description: storeData.description || "",
                category: storeData.category || "General",
                contact: storeData.whatsapp_number,
                location: storeData.location || "Sri Lanka",
                logoUrl: storeData.logo_url,
                slug: storeData.slug,
            };
        }

        if (Array.isArray(prodsData)) {
            products = prodsData.map((p) => ({
                id: p.id,
                name: p.title,
                description: p.description || "",
                price: p.price,
                currency: "LKR",
                category: p.category,
                imageUrl: p.image_url,
                stock: p.is_available ? p.stock : 0,
                createdAt: p.created_at || new Date().toISOString(),
            }));
        }
    } catch (err) {
        console.warn(`[StoreCatalogPage] Error fetching store data for slug "${slug}":`, err);
    }

    if (!shop) {
        notFound();
    }

    return <StorefrontClientView shop={shop} products={products} />;
}
