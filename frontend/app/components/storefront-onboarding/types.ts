// ── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES = [
    "Grocery & food",
    "Fashion & apparel",
    "Electronics",
    "Handmade & crafts",
    "Hardware & tools",
    "Beauty & wellness",
    "Other",
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface FormState {
    ownerName: string;
    email: string;
    password: string;
    shopName: string;
    category: string;
    description: string;
    contact: string;
    location: string;
    logoUrl: string;
}

export type Screen = "landing" | "register" | "details" | "success";
