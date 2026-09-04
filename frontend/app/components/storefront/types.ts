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

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_SHOP: ShopInfo = {
    shopName: "Nadeeka's Spice Corner",
    ownerName: "Nadeeka Perera",
    description: "Fresh-ground spices and pantry staples, made in small batches right here in Negombo.",
    category: "Grocery & food",
    contact: "+94 77 123 4567",
    location: "Negombo",
    slug: "nadeekas-spice-corner",
};

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Roasted Curry Powder",
        description: "A deep, smoky blend of coriander, cumin, fennel, and black pepper. Slow-roasted for an hour to bring out the full aroma. Perfect for chicken curry, dhal, or a quick tempered vegetable.",
        price: 350,
        currency: "LKR",
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
        stock: 24,
        createdAt: "2026-08-20T00:00:00Z",
    },
    {
        id: "2",
        name: "Turmeric Powder",
        description: "Pure, single-origin turmeric from Matale district. Bright golden colour with an earthy warmth and none of the bitterness of imported brands.",
        price: 280,
        currency: "LKR",
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80",
        stock: 2,
        createdAt: "2026-08-22T00:00:00Z",
    },
    {
        id: "3",
        name: "Coconut Sambol Mix",
        description: "A ready-to-mix dry sambol of desiccated coconut, dried chilli, Maldive fish, and moringa leaves. Reconstitute with lime juice in five minutes.",
        price: 420,
        currency: "LKR",
        category: "Pantry",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
        stock: 8,
        createdAt: "2026-08-25T00:00:00Z",
    },
    {
        id: "4",
        name: "Black Pepper Whole",
        description: "Kandyan highlands black pepper, harvested at peak ripeness and sun-dried for two weeks. Sharp, citrusy heat. Sold by 50 g bag.",
        price: 190,
        currency: "LKR",
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        stock: 0,
        createdAt: "2026-08-18T00:00:00Z",
    },
    {
        id: "5",
        name: "Jaggery (Pol Hakuru)",
        description: "100% palm jaggery from Kurunegala. No added sugar, no preservatives. Crumble into curries, hoppers, or your morning porridge.",
        price: 520,
        currency: "LKR",
        category: "Pantry",
        imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80",
        stock: 15,
        createdAt: "2026-09-01T00:00:00Z",
    },
    {
        id: "6",
        name: "Goraka (Dried Gamboge)",
        description: "Tangy, sun-dried goraka pieces for authentic fish curry sourness. A little goes a long way — these are Grade A pieces, free of mould.",
        price: 160,
        currency: "LKR",
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1598511726648-699f2f62e52e?w=400&q=80",
        stock: 30,
        createdAt: "2026-09-03T00:00:00Z",
    },
];
