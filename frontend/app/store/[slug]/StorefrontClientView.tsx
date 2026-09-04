"use client";

import { useState } from "react";
import { StorefrontHomePage } from "../../components/storefront/StorefrontHomePage";
import { ProductDetailPage } from "../../components/storefront/ProductDetailPage";
import type { Product, ShopInfo } from "../../components/storefront/types";

interface StorefrontClientViewProps {
    shop: ShopInfo;
    products: Product[];
}

export function StorefrontClientView({ shop, products }: StorefrontClientViewProps) {
    const [selected, setSelected] = useState<Product | null>(null);

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
