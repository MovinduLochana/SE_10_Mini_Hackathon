/**
 * Typed mock data for the Owner Console (Dashboard + Inventory Manager).
 *
 * Shapes here are guesses at what `backend/` will eventually return. Swap the
 * `getX()` functions for real fetches (e.g. server-side `fetch` calls or a
 * typed API client) once those endpoints exist — the component tree already
 * consumes this data through those function boundaries.
 *
 * `getAllProducts()` is the single source of truth for the product catalog;
 * both the Dashboard's "Recent Inventory" and the Inventory Manager read
 * from it so the two screens never drift out of sync.
 */

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface Product {
  id: string;
  name: string;
  sku: string;
  /** Maker/workshop attribution shown under the SKU. */
  vendor: string;
  /** Absolute or app-relative URL to a product thumbnail. */
  imageUrl: string;
  category: string;
  /** Price in whole currency units (e.g. USD dollars), not cents. */
  price: number;
  stock: number;
  stockStatus: StockStatus;
  description?: string;
}

/** 0 units = out of stock, 1-4 = low stock, 5+ = healthy. Matches DESIGN.md's Status Badge spec. */
export function deriveStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock < 5) return "low-stock";
  return "in-stock";
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

/* ------------------------------------------------------------------------ */
/* Product catalog                                                          */
/* ------------------------------------------------------------------------ */

interface RawProduct {
  name: string;
  sku: string;
  vendor: string;
  imageUrl: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
}

// Real thumbnail URLs pulled from the design mocks. Filler products below
// reuse this small pool rather than inventing broken image URLs — swap for
// real per-product photos once products come from `backend/`.
const IMG = {
  mug: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsUEqdaDGIj4QYUySDeFdtN1Hgr8NI5b5eUb55WZ0jxXcAis8EVkrvsSacv83d5oS8KSX0YF9hyPKF7ludG4Q4gSm7FkypVjl0MmIF7S7FmbF08ukb8AJTv_2ZyE7w2K9rRD9n1jAL2_imog3jFtu4Bx7kwiwFTUCtUTc98B7yoZLvoh4RyR1WF-F6AiBMNa2UOfWb7pqkiTJmXYUCJ5U-u5DORrSVdIzAW7dE6luRCs3y3qXni2dH",
  journal: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqEfUj2G_byCunKwh96fvM8j014mHzI36prMkC7jfE_ea3hXBll42EaJPHiHZVhq8fbCbw01BrYpmpcE0hjBg_x5-IuLs4IGzBc6kTbw5a78E_4Yo9z0wCE5CfNozUppKML6rpdbf19VOkwwrFEbEv5B8G2zym6LdzkPIORyEO63FvFD0SCLhpzfoKyr_GaP-bMVcKJxobPgcDYEHG0f4EcsjBhoIosCMz3_0dcPx_RnyvDb_WXKdd",
  candle: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeIf9pL75A8-1Ebt3TH3o719-K30Jm8sxeGaRitzEX1OvuLSc-x_SwvCVicRMUAWO3TwTEjEC1bJPup5xmHbKGVHh2mGYH_hFUGsGT4j87AGeGWnT878ow4ecElz-s_IM4VtjGAGqOxnm8pnap0oDtMkSN_XZQt5es0efuI4d6JPhKuydFMDwFPKGDNoxE7iE14dXHb6i0TYchbTo8Lj0hYhVbT2mA8Z2IQvqrylqDb98VxpbqvAL7",
  linenThrow: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvm3MLcJwE0qMPtJAW15y26qHSqKXT9ug4Ri4Mf_RTCuiDncsenNxIl7QRJDcmwzTMKqEBcTD_NUA6iFVwdlTn52qMDj4PAYc_g1vrkKXXJxp2jVEtCWCU-iAa5umCS6twLND3PSmdx-WNynAxYjY3MlW9GUr6Spxj7LTMwqLSI__5kXOtBBKOm54ruVNpXqSghCxdTMJunM_aifS5rLNdHxzu3QfjBmebx6t50ooEM1kOk2aCPOfK",
  platter: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKYCpX2VygOUAVUqAw9Tq05QApT0-LO0574N5vPmDEoms7gi6qRwW38UYVIIdTJ2HKe10NTjvy7k6J_zPz5clgDRQAnhrGw_T6uSwh2n4EzjbGOexhWocD8IYTMpMSNMNkZgmkfG8-XulmAJu79W01qRTnRe9UFdofSjH2YTz7hxVcRZDic1D1hrB-HBXpRfGqt5xqtehDgC16yAvwrgYQrobPVSxg46PBl7OBFvsv40JMsavWaokO",
  vase: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKy7xL-M5_ptcnBqwqArcPPoGYIE1hv4RjYBFkljOEPdWzdW2Nwa1aCC7EZ8HtkF2abYgmjsusj9BIMcDLGc7eoOao21foEO7o9QIN_DrUCckRyzhHGezvn5kaS4AIysWcgtOs6HoblrjHK-YZWGrVhniMTKzC8d-_nYqa0QWi4C3mLGS9-qS_tZuSwp5SldABerK4x25Pxe-Jihl56Hd26pIZW6pURK6lYvDASIwwsXXK9cotcHEt",
  tote: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt50fRyy2NkTQZ3PnkUjxPWP3AOUSQXqcO8HhmZ2IRRHjPOvBtHqL1s3IgT9WS41W0JLOGv99LWy0XZJ1UVg73TSXf-HXGZ6UcoGPTN7jv3PXBPZRtm8_2R5_fpuPcZLUAQCKpXkjKCZMv5aCfUI3I0kkAscLagfi7rcFSCl_XjoKrHmqSi4h0gcxIxyW40RvbPwt4xnD4yxW79egUJ4gtb8oPaYNUjKZYTsdWvOQgglH0JBkbagpa",
  soyCandle: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFEbgXLKoelt3xxnTInwY4FsgRlWMloJR4gR0magjWXHEY0t_DuKY3JMZIB6-BILqitNX_qhx-9bG9AOymmnD68WTy_sZ3bJwDW8gkXKkaUiBFlH8h2lfvltCQYHF4kd48361eiausIPrskw615DBVs76CgG-3o6nfacoi3XO6slIzBSNRQS4XN6aKJ3l3S-qAo3KqRmPKNNFFt1zxUk31J1_ILM5xvVuFWFCzX46RKn5bLgb4tGtc",
  oakBoard: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8PTtx7f5W1ZoI2zLAMcJpzvCFP1UlsPqp1bZz15kvGVt07HPswCQg5WstTMA_64hvVizURr64TqGStPK-i7hYHPjQ065gvnoYDiZ2xL68XgfMqHBPX70MM-iU4yAFYLfC9avIH4fkxSXcWoWAPUCcmLVMgEczS_QD_4nWkjQspfC75cTyyeXh8Uvj9mibIYkYNrLCfNJ0OsmpDlgJjXnGcrQNNN-Yw_M62pYdKmJhuSnfOoSQyjfj",
  indigoLinen: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8c-sZQWPSv872scRwbBkB0cONE-Yb-sg3XLh_e-VScxJJg4dMAY-KwabSsbOs99n0AVbsIe92Owdaan-TnD_mMy_alTbaouCOKLj2hRkLnf2pAsvvfh-sDOBjYuoirCAi-hQpyC0tIhDx-T2BZL28DhtLTvlzavdyf8iG-OtF36SbTG0ZnDxFV1PRw0yQBw8y0j9-DxS_gC6sIm6UAPlkkNN81HoOTUMH6BFTP1WkCW5loxCHsyiE",
  ring: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7yZFj8QXuiR1kyz7uluk9_-7e-BQS2mIok75xf6b_Sjh7VdQH2hl3z4gxnhAiwBtoduhjNKoK3FnnyKUvcArzXk89IO4M-H8ZFQpLVhjlRQGW_yZ7QYcbfR56_cCVb388RJBG_5P4lEx464Bcbzg6Itjdu6y_FISDTYFohTVIwZ5F3d0V7Mkk23auWuinvbonO4r6rYwG8tBIAsXk7EfX_9EZwk1ugO9INFdHN8prcwxONHPtnvhp",
} as const;

// The 5 products the Dashboard mock shows verbatim in "Recent Inventory" —
// kept first in the catalog so that slice keeps matching the reference.
const FEATURED_DASHBOARD_PRODUCTS: RawProduct[] = [
  {
    name: "Stoneware Pour-Over Mug",
    sku: "SKU-STM-091",
    vendor: "Ceramics Studio",
    imageUrl: IMG.mug,
    category: "Ceramics",
    price: 38,
    stock: 18,
    description: "A speckled stoneware mug with a soft matte glaze, hand-thrown for slow morning pours.",
  },
  {
    name: "Saddle Leather Journal Folio",
    sku: "SKU-LEA-440",
    vendor: "Artisan Workshop",
    imageUrl: IMG.journal,
    category: "Leather Goods",
    price: 74,
    stock: 7,
    description: "Vegetable-tanned leather folio with brass rivet closure and hand-stitched edging.",
  },
  {
    name: "Cedarwood & Amber Candle",
    sku: "SKU-CND-112",
    vendor: "Apothecary",
    imageUrl: IMG.candle,
    category: "Home & Candle",
    price: 29,
    stock: 2,
    description: "Hand-poured soy wax candle in cedarwood and amber, finished with a cotton wick.",
  },
  {
    name: "Raw Linen Loom Throw",
    sku: "SKU-TXT-890",
    vendor: "Weaving Loft",
    imageUrl: IMG.linenThrow,
    category: "Textiles",
    price: 115,
    stock: 12,
    description: "Pure washed organic linen throw in oatmeal beige with a frayed fringe border.",
  },
  {
    name: "Hand-Carved Walnut Platter",
    sku: "SKU-WDW-033",
    vendor: "Woodcraft",
    imageUrl: IMG.platter,
    category: "Home & Candle",
    price: 88,
    stock: 0,
    description: "Turned black walnut serving platter with an organic live edge and food-safe oil finish.",
  },
];

// Additional named products lifted from the Inventory Manager mock.
const FEATURED_INVENTORY_PRODUCTS: RawProduct[] = [
  {
    name: "Hand-thrown Terracotta Vase",
    sku: "CRT-0941",
    vendor: "Ceramics Studio",
    imageUrl: IMG.vase,
    category: "Ceramics",
    price: 48,
    stock: 14,
    description: "Organic earthenware vase with a speckled matte beige glaze and a raw clay neck.",
  },
  {
    name: "Rustic Leather Tote Bag",
    sku: "LTH-2201",
    vendor: "Artisan Workshop",
    imageUrl: IMG.tote,
    category: "Leather Goods",
    price: 120,
    stock: 8,
    description: "Vegetable-tanned chestnut leather tote with brass rivets and saddle stitching.",
  },
  {
    name: "Cedarwood & Amber Soy Candle",
    sku: "CND-4103",
    vendor: "Apothecary",
    imageUrl: IMG.soyCandle,
    category: "Home & Candle",
    price: 34.5,
    stock: 2,
    description: "Hand-poured cedarwood and golden amber soy candle in an amber glass jar.",
  },
  {
    name: "Smoked Oak Serving Board",
    sku: "WOD-1108",
    vendor: "Woodcraft",
    imageUrl: IMG.oakBoard,
    category: "Home & Candle",
    price: 76,
    stock: 19,
    description: "Solid smoked European oak charcuterie board with a brass hanging loop.",
  },
  {
    name: "Indigo Loomed Linen Throw",
    sku: "TXT-5519",
    vendor: "Weaving Loft",
    imageUrl: IMG.indigoLinen,
    category: "Textiles",
    price: 110,
    stock: 0,
    description: "Woven raw linen throw with hand-twisted fringe in an off-white and indigo melange.",
  },
  {
    name: "Hammered Gold River Pearl Ring",
    sku: "JWY-8802",
    vendor: "Metalsmith Lab",
    imageUrl: IMG.ring,
    category: "Jewelry",
    price: 185,
    stock: 6,
    description: "Hammered recycled gold ring set with a natural uncut river pearl.",
  },
];

interface CategoryFillerSpec {
  category: string;
  skuPrefix: string;
  vendors: string[];
  adjectives: string[];
  nouns: string[];
  imageUrls: string[];
  basePrice: number;
  count: number;
  /** How many of this category's filler items should render as low-stock (1-4 units). */
  lowStockCount: number;
}

// Filler counts are chosen so the full catalog lands on 48 total SKUs,
// matching the Inventory Manager mock's headline numbers (14/8/12/9/5 by
// category, 42 healthy / 4 low / 2 depleted overall) once combined with the
// 11 featured products above.
const CATEGORY_FILLERS: CategoryFillerSpec[] = [
  {
    category: "Ceramics",
    skuPrefix: "CRT",
    vendors: ["Ceramics Studio", "Clay & Kiln Collective"],
    adjectives: ["Speckled Stoneware", "Matte Glaze", "Ash-Fired", "Hand-Thrown Porcelain", "Textured Terracotta", "Salt-Fired"],
    nouns: ["Bowl", "Tumbler", "Dinner Plate", "Teapot", "Planter", "Butter Dish"],
    imageUrls: [IMG.mug, IMG.vase],
    basePrice: 26,
    count: 12,
    lowStockCount: 0,
  },
  {
    category: "Leather Goods",
    skuPrefix: "LTH",
    vendors: ["Artisan Workshop", "Leatherworks Co."],
    adjectives: ["Vegetable-Tanned", "Waxed Chestnut", "Full-Grain", "Hand-Stitched", "Saddle-Stitched", "Burnished"],
    nouns: ["Card Wallet", "Belt", "Crossbody Bag", "Key Fob", "Passport Case", "Tool Roll"],
    imageUrls: [IMG.journal, IMG.tote],
    basePrice: 45,
    count: 6,
    lowStockCount: 1,
  },
  {
    category: "Home & Candle",
    skuPrefix: "HMC",
    vendors: ["Apothecary", "Woodcraft", "Home Studio"],
    adjectives: ["Hand-Poured Soy", "Smoked Oak", "Reclaimed Walnut", "Botanical", "Matte Ceramic", "Beeswax"],
    nouns: ["Votive Candle", "Serving Board", "Trinket Dish", "Diffuser", "Coaster Set", "Incense Holder"],
    imageUrls: [IMG.candle, IMG.soyCandle, IMG.oakBoard, IMG.platter],
    basePrice: 24,
    count: 8,
    lowStockCount: 0,
  },
  {
    category: "Textiles",
    skuPrefix: "TXT",
    vendors: ["Weaving Loft", "Loom House"],
    adjectives: ["Raw Linen", "Handwoven Wool", "Organic Cotton", "Indigo-Dyed", "Chunky Knit", "Undyed Alpaca"],
    nouns: ["Table Runner", "Napkin Set", "Cushion Cover", "Market Tote", "Scarf", "Blanket"],
    imageUrls: [IMG.linenThrow, IMG.indigoLinen],
    basePrice: 42,
    count: 7,
    lowStockCount: 1,
  },
  {
    category: "Jewelry",
    skuPrefix: "JWY",
    vendors: ["Metalsmith Lab", "Gem & Wire"],
    adjectives: ["Hammered Gold", "Sterling Silver", "Recycled Brass", "Raw Stone", "Minimalist"],
    nouns: ["Stacking Ring", "Hoop Earrings", "Pendant Necklace", "Cuff Bracelet"],
    imageUrls: [IMG.ring],
    basePrice: 95,
    count: 4,
    lowStockCount: 0,
  },
];

function buildFillerProducts(spec: CategoryFillerSpec): RawProduct[] {
  return Array.from({ length: spec.count }, (_, i) => {
    const adjective = spec.adjectives[i % spec.adjectives.length];
    const noun = spec.nouns[i % spec.nouns.length];
    const vendor = spec.vendors[i % spec.vendors.length];
    const imageUrl = spec.imageUrls[i % spec.imageUrls.length];
    const stock = i < spec.lowStockCount ? 2 + i : 6 + ((i * 5) % 24);
    const price = Math.round((spec.basePrice + ((i * 7) % 40)) * 100) / 100;
    return {
      name: `${adjective} ${noun}`,
      sku: `${spec.skuPrefix}-${(1000 + i * 37).toString().padStart(4, "0")}`,
      vendor,
      imageUrl,
      category: spec.category,
      price,
      stock,
    };
  });
}

let cachedCatalog: Product[] | null = null;

/** The full, shared product catalog. Both the Dashboard and Inventory Manager read from this. */
export function getAllProducts(): Product[] {
  if (cachedCatalog) return cachedCatalog;

  const raw: RawProduct[] = [
    ...FEATURED_DASHBOARD_PRODUCTS,
    ...FEATURED_INVENTORY_PRODUCTS,
    ...CATEGORY_FILLERS.flatMap(buildFillerProducts),
  ];

  cachedCatalog = raw.map((product, index) => ({
    id: `product-${index + 1}-${product.sku.toLowerCase()}`,
    stockStatus: deriveStockStatus(product.stock),
    ...product,
  }));

  return cachedCatalog;
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((product) => product.id === id);
}

export interface CategoryCount {
  name: string;
  count: number;
}

/** Category chip counts, computed live from the catalog (never hardcoded). */
export function getCategories(products: Product[] = getAllProducts()): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
}

export interface InventoryStats {
  totalSkus: number;
  newThisMonth: number;
  healthyStock: number;
  healthyStockPercent: number;
  lowStock: number;
  depleted: number;
}

/** Stat-card figures for the Inventory Manager header, computed from the catalog. */
export function getInventoryStats(products: Product[] = getAllProducts()): InventoryStats {
  const totalSkus = products.length;
  const healthyStock = products.filter((p) => p.stockStatus === "in-stock").length;
  const lowStock = products.filter((p) => p.stockStatus === "low-stock").length;
  const depleted = products.filter((p) => p.stockStatus === "out-of-stock").length;
  return {
    totalSkus,
    // Not derivable from mock data without created-at timestamps — static for now.
    newThisMonth: 6,
    healthyStock,
    healthyStockPercent: totalSkus === 0 ? 0 : Math.round((healthyStock / totalSkus) * 1000) / 10,
    lowStock,
    depleted,
  };
}

/* ------------------------------------------------------------------------ */
/* Dashboard-specific views over the shared catalog                         */
/* ------------------------------------------------------------------------ */

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
  const products = getAllProducts();
  const categories = getCategories(products);
  const lowStockCount = products.filter((p) => p.stockStatus === "low-stock").length;
  const outOfStockCount = products.filter((p) => p.stockStatus === "out-of-stock").length;

  return {
    activeProducts: products.length,
    // Not derivable from mock data without created-at timestamps — static for now.
    productsAddedThisWeek: 4,
    stockAlertsCount: lowStockCount + outOfStockCount,
    lowStockCount,
    outOfStockCount,
    storeInquiries: 39,
    inquiriesChangePercent: 18,
    activeCategories: categories.length,
    categoryPreview: categories.slice(0, 3).map((c) => c.name),
  };
}

export function getLowStockAlert(): LowStockAlert {
  return {
    productId: "product-3-sku-cnd-112",
    productName: "Cedarwood & Amber Candle",
    unitsLeft: 2,
    thresholdUnits: 5,
  };
}

/** Top 5 of the shared catalog — kept in sync automatically, never a separate list. */
export function getRecentInventory(): Product[] {
  return getAllProducts().slice(0, 5);
}

export function getTotalProductCount(): number {
  return getAllProducts().length;
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
