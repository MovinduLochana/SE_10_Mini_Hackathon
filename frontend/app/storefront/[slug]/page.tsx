"use client";

import { useState } from "react";
import { StorefrontHomePage } from "../../components/storefront/StorefrontHomePage";
import { ProductDetailPage } from "../../components/storefront/ProductDetailPage";
import { MOCK_SHOP, MOCK_PRODUCTS } from "../../components/storefront/types";
import type { Product } from "../../components/storefront/types";

export default function StorefrontPage() {
    const [selected, setSelected] = useState<Product | null>(null);

    // In a real app, fetch shop + products by `params.slug` from your API.
    // For now we use the mock data so you can see the screens working.
    
    const shop = MOCK_SHOP;
    const products = MOCK_PRODUCTS;

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
