/**
 * PolaLink LK: Frontend API Client
 * Interfaces with the FastAPI backend (on Railway or Localhost)
 */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export interface StoreResponse {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  description?: string;
  category?: string;
  location?: string;
  logo_url?: string;
  owner_name?: string;
  store_url: string;
  qr_code_data_url?: string;
}

export interface ProductResponse {
  id: string;
  store_id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  is_available: boolean;
  stock_badge: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface OrderCalculationItem {
  product_id: string;
  quantity: number;
}

export interface OrderCalculateRequest {
  store_slug: string;
  items: OrderCalculationItem[];
  customer_name?: string;
  customer_phone?: string;
  delivery_notes?: string;
}

export interface OrderCalculateResponse {
  store_name: string;
  whatsapp_number: string;
  total_amount: number;
  currency: string;
  has_stock_issues: boolean;
  stock_warnings: string[];
  whatsapp_checkout_url: string;
  formatted_whatsapp_message: string;
}

export interface OnboardStorePayload {
  name: string;
  whatsapp_number: string;
  description?: string;
  slug?: string;
  category?: string;
  location?: string;
  logo_url?: string;
  owner_name?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg =
      data?.message ||
      data?.detail ||
      (Array.isArray(data?.details)
        ? data.details.map((d: { message: string }) => d.message).join(", ")
        : "An error occurred while communicating with the server.");
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async signup(email: string, password: string) {
    return request<{ access_token: string; user_id: string; email: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  },

  async login(email: string, password: string) {
    return request<{ access_token: string; user_id: string; email: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  },

  // Stores
  async onboardStore(payload: OnboardStorePayload, token: string) {
    return request<StoreResponse>("/api/stores", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  async getStoreBySlug(slug: string) {
    return request<StoreResponse>(`/api/stores/${slug}`);
  },

  async getMyStores(token: string) {
    return request<StoreResponse[]>("/api/stores/my/stores", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Products & Public Catalog
  async getProducts(
    slug: string,
    params?: {
      search?: string;
      category?: string;
      min_price?: number;
      max_price?: number;
      in_stock_only?: boolean;
      sort_by?: string;
    }
  ) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.min_price !== undefined) query.set("min_price", String(params.min_price));
    if (params?.max_price !== undefined) query.set("max_price", String(params.max_price));
    if (params?.in_stock_only) query.set("in_stock_only", "true");
    if (params?.sort_by) query.set("sort_by", params.sort_by);

    const qs = query.toString();
    return request<ProductResponse[]>(
      `/api/stores/${slug}/products${qs ? `?${qs}` : ""}`
    );
  },

  // Live Order Calculator & WhatsApp Checkout
  async calculateOrder(payload: OrderCalculateRequest) {
    return request<OrderCalculateResponse>("/api/orders/calculate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // AI Copywriter & Categorizer
  async generateCopy(title: string, keywords: string) {
    return request<{
      title: string;
      marketing_pitch: string;
      highlights: string[];
      generated_by: string;
    }>("/api/ai/generate-copy", {
      method: "POST",
      body: JSON.stringify({ title, keywords }),
    });
  },

  async suggestCategory(title: string) {
    return request<{
      title: string;
      suggested_category: string;
      alternative_categories: string[];
    }>("/api/ai/suggest-category", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },
};
