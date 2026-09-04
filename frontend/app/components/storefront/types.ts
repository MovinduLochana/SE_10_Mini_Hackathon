// ── Product types ────────────────────────────────────────────────────────────

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    imageUrl?: string;
    stock: number; // 0 = out of stock
    createdAt: string; // ISO date string
}

export type SortKey = "price_asc" | "price_desc" | "newest";

export interface FilterState {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    sort: SortKey;
}

// ── Shop info (from onboarding) ───────────────────────────────────────────────

export interface ShopInfo {
    shopName: string;
    ownerName: string;
    description: string;
    category: string;
    contact: string;
    location?: string;
    logoUrl?: string;
    slug: string;
}

