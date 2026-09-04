/**
 * Typed mock data for the Owner Console dashboard.
 *
 * Shapes here are guesses at what `backend/` will eventually return. Swap the
 * `getX()` functions for real fetches (e.g. server-side `fetch` calls or a
 * typed API client) once those endpoints exist — the component tree already
 * consumes this data through those function boundaries.
 */

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface Product {
  id: string;
  name: string;
  sku: string;
  /** Absolute or app-relative URL to a product thumbnail. */
  imageUrl: string;
  category: string;
  /** Price in whole currency units (e.g. USD dollars), not cents. */
  price: number;
  stock: number;
  stockStatus: StockStatus;
}

export interface ShopInfo {
  name: string;
  ownerName: string;
  ownerRole: string;
  /** Path segment used to build the public storefront URL. */
  slug: string;
  storefrontBaseUrl: string;
  isLive: boolean;
  viewsToday: number;
  uptimePercent: number;
  nextSyncMinutes: number;
  catalogStoragePercent: number;
  catalogSyncPercent: number;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  unitsLeft: number;
  thresholdUnits: number;
}

export interface WeeklyEngagementPoint {
  day: string;
  /** Relative value 0-100, used to size the bar chart placeholder. */
  value: number;
}

export interface DistributionChannel {
  id: string;
  label: string;
  description: string;
  action: "link" | "copy" | "download";
  href?: string;
}

export function getShopInfo(): ShopInfo {
  return {
    name: "Velvet & Oak",
    ownerName: "Elena",
    ownerRole: "Shop Owner",
    slug: "velvet-oak",
    storefrontBaseUrl: "https://artisan.store/shop",
    isLive: true,
    viewsToday: 142,
    uptimePercent: 99.9,
    nextSyncMinutes: 12,
    catalogStoragePercent: 60,
    catalogSyncPercent: 100,
  };
}

export function getStorefrontUrl(shop: ShopInfo): string {
  return `${shop.storefrontBaseUrl}/${shop.slug}`;
}

export interface DashboardMetrics {
  activeProducts: number;
  productsAddedThisWeek: number;
  stockAlertsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  storeInquiries: number;
  inquiriesChangePercent: number;
  activeCategories: number;
  categoryPreview: string[];
}

export function getDashboardMetrics(): DashboardMetrics {
  return {
    activeProducts: 48,
    productsAddedThisWeek: 4,
    stockAlertsCount: 3,
    lowStockCount: 2,
    outOfStockCount: 1,
    storeInquiries: 39,
    inquiriesChangePercent: 18,
    activeCategories: 6,
    categoryPreview: ["Ceramics", "Leather", "Wood"],
  };
}

export function getLowStockAlert(): LowStockAlert {
  return {
    productId: "sku-cnd-112",
    productName: "Cedarwood & Amber Candle",
    unitsLeft: 2,
    thresholdUnits: 5,
  };
}

export function getRecentInventory(): Product[] {
  return [
    {
      id: "sku-stm-091",
      name: "Stoneware Pour-Over Mug",
      sku: "SKU-STM-091",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCsUEqdaDGIj4QYUySDeFdtN1Hgr8NI5b5eUb55WZ0jxXcAis8EVkrvsSacv83d5oS8KSX0YF9hyPKF7ludG4Q4gSm7FkypVjl0MmIF7S7FmbF08ukb8AJTv_2ZyE7w2K9rRD9n1jAL2_imog3jFtu4Bx7kwiwFTUCtUTc98B7yoZLvoh4RyR1WF-F6AiBMNa2UOfWb7pqkiTJmXYUCJ5U-u5DORrSVdIzAW7dE6luRCs3y3qXni2dH",
      category: "Ceramics",
      price: 38,
      stock: 18,
      stockStatus: "in-stock",
    },
    {
      id: "sku-lea-440",
      name: "Saddle Leather Journal Folio",
      sku: "SKU-LEA-440",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBqEfUj2G_byCunKwh96fvM8j014mHzI36prMkC7jfE_ea3hXBll42EaJPHiHZVhq8fbCbw01BrYpmpcE0hjBg_x5-IuLs4IGzBc6kTbw5a78E_4Yo9z0wCE5CfNozUppKML6rpdbf19VOkwwrFEbEv5B8G2zym6LdzkPIORyEO63FvFD0SCLhpzfoKyr_GaP-bMVcKJxobPgcDYEHG0f4EcsjBhoIosCMz3_0dcPx_RnyvDb_WXKdd",
      category: "Leatherware",
      price: 74,
      stock: 7,
      stockStatus: "in-stock",
    },
    {
      id: "sku-cnd-112",
      name: "Cedarwood & Amber Candle",
      sku: "SKU-CND-112",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBeIf9pL75A8-1Ebt3TH3o719-K30Jm8sxeGaRitzEX1OvuLSc-x_SwvCVicRMUAWO3TwTEjEC1bJPup5xmHbKGVHh2mGYH_hFUGsGT4j87AGeGWnT878ow4ecElz-s_IM4VtjGAGqOxnm8pnap0oDtMkSN_XZQt5es0efuI4d6JPhKuydFMDwFPKGDNoxE7iE14dXHb6i0TYchbTo8Lj0hYhVbT2mA8Z2IQvqrylqDb98VxpbqvAL7",
      category: "Candles",
      price: 29,
      stock: 2,
      stockStatus: "low-stock",
    },
    {
      id: "sku-txt-890",
      name: "Raw Linen Loom Throw",
      sku: "SKU-TXT-890",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCvm3MLcJwE0qMPtJAW15y26qHSqKXT9ug4Ri4Mf_RTCuiDncsenNxIl7QRJDcmwzTMKqEBcTD_NUA6iFVwdlTn52qMDj4PAYc_g1vrkKXXJxp2jVEtCWCU-iAa5umCS6twLND3PSmdx-WNynAxYjY3MlW9GUr6Spxj7LTMwqLSI__5kXOtBBKOm54ruVNpXqSghCxdTMJunM_aifS5rLNdHxzu3QfjBmebx6t50ooEM1kOk2aCPOfK",
      category: "Textiles",
      price: 115,
      stock: 12,
      stockStatus: "in-stock",
    },
    {
      id: "sku-wdw-033",
      name: "Hand-Carved Walnut Platter",
      sku: "SKU-WDW-033",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAKYCpX2VygOUAVUqAw9Tq05QApT0-LO0574N5vPmDEoms7gi6qRwW38UYVIIdTJ2HKe10NTjvy7k6J_zPz5clgDRQAnhrGw_T6uSwh2n4EzjbGOexhWocD8IYTMpMSNMNkZgmkfG8-XulmAJu79W01qRTnRe9UFdofSjH2YTz7hxVcRZDic1D1hrB-HBXpRfGqt5xqtehDgC16yAvwrgYQrobPVSxg46PBl7OBFvsv40JMsavWaokO",
      category: "Woodwork",
      price: 88,
      stock: 0,
      stockStatus: "out-of-stock",
    },
  ];
}

export function getTotalProductCount(): number {
  return 48;
}

export function getWeeklyEngagement(): {
  points: WeeklyEngagementPoint[];
  changePercent: number;
} {
  return {
    points: [
      { day: "Mon", value: 40 },
      { day: "Tue", value: 55 },
      { day: "Wed", value: 48 },
      { day: "Thu", value: 70 },
      { day: "Fri", value: 85 },
      { day: "Sat", value: 100 },
      { day: "Sun", value: 62 },
    ],
    changePercent: 22.4,
  };
}

export function getDistributionChannels(shop: ShopInfo): DistributionChannel[] {
  const url = getStorefrontUrl(shop);
  return [
    {
      id: "whatsapp",
      label: "WhatsApp Broadcast",
      description: "Broadcast catalog link to buyers",
      action: "link",
      href: `https://wa.me/?text=${encodeURIComponent(
        `Explore the new ${shop.name} Artisan Collection: ${url}`,
      )}`,
    },
    {
      id: "instagram",
      label: "Instagram Story Link",
      description: "Pre-formatted swipe up URL",
      action: "copy",
      href: `${url}?utm_source=instagram_story`,
    },
    {
      id: "standee-pdf",
      label: "Table Tent Standee (PDF)",
      description: "Print-ready A6 / 4x6 tabletop card",
      action: "download",
    },
  ];
}
