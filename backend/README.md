# PolaLink LK Backend (FastAPI + Supabase) 🇱🇰

Welcome to the backend service for **PolaLink LK** — the hyper-local micro-merchant e-commerce and WhatsApp direct ordering platform.

---

## ⚡ Quick Start

### 1. Setup Virtual Environment & Dependencies
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret-optional

FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Optional for AI Copywriter (falls back to built-in local engine if empty)
GEMINI_API_KEY=
```

### 3. Setup Supabase Database
1. Open your Supabase project dashboard: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** -> **New Query**.
3. Paste the contents of [`scripts/supabase_schema.sql`](scripts/supabase_schema.sql) and click **Run**.
4. *(Optional)* Seed initial Sri Lankan demo merchants & products:
```bash
python scripts/seed.py
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- 📖 **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📑 **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔐 Authentication (Supabase Auth)
All merchant management endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <supabase_access_token>
```
The Next.js frontend can obtain this token using the Supabase client (`supabase.auth.getSession()`), or you can test signup/login via:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

---

## 📡 API Reference for Next.js Developers

### 1. Merchant Onboarding & Store Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/stores` | Bearer | Onboard new store (auto-assigns to merchant, validates SL phone, issues slug & QR) |
| `GET` | `/api/stores/{slug}` | Public | Get store info, catalog link, and QR code (Base64 data URL) |
| `GET` | `/api/stores/{slug}/qr` | Public | Stream downloadable PNG QR code image |
| `GET` | `/api/stores/my/stores` | Bearer | Get all stores owned by the logged-in merchant |
| `PATCH`| `/api/stores/{slug}` | Bearer | Update store name, bio, or WhatsApp number |

#### Example: Onboard Store & Initial Product
```json
POST /api/stores
Authorization: Bearer <token>
{
  "name": "Ruhunu Spices",
  "whatsapp_number": "0771234567",
  "description": "Authentic organic spices from Matara",
  "initial_product": {
    "title": "Ceylon Cinnamon Alba (100g)",
    "price": 850.0,
    "category": "Spices",
    "stock": 20,
    "image_url": "https://..."
  }
}
```

---

### 2. Public Customer Catalog & Live Order Engine
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stores/{slug}/products` | Public | Search & filter products (`search`, `category`, `min_price`, `max_price`, `in_stock_only`, `sort_by`) |
| `POST`| `/api/orders/calculate` | Public | Live cart calculator & pre-filled WhatsApp checkout link generator |
| `POST`| `/api/orders` | Public | Persist customer order to Supabase for merchant tracking |

#### Example: Live Order Calculator & WhatsApp Checkout
```json
POST /api/orders/calculate
{
  "store_slug": "ruhunu-spices",
  "customer_name": "Kasun Perera",
  "customer_phone": "0712345678",
  "delivery_notes": "Deliver near Colombo 03, please call before delivery",
  "items": [
    {
      "product_id": "c138f267-336c-4860-84cf-dbe5e165fa47",
      "quantity": 2
    }
  ]
}
```
**Response:**
```json
{
  "store_name": "Ruhunu Spices",
  "whatsapp_number": "94771234567",
  "total_amount": 1700.0,
  "currency": "LKR",
  "has_stock_issues": false,
  "stock_warnings": [],
  "whatsapp_checkout_url": "https://wa.me/94771234567?text=...",
  "formatted_whatsapp_message": "🛍️ *New Order for Ruhunu Spices*..."
}
```

---

### 3. Real-Time Merchant Inventory Management
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stores/{slug}/inventory` | Bearer | Get full inventory with stock badges (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) |
| `POST` | `/api/stores/{slug}/products` | Bearer | Add new product to catalog |
| `PATCH`| `/api/products/{id}` | Bearer | Inline edit product details (title, price, category, etc.) |
| `PATCH`| `/api/products/{id}/stock` | Bearer | Inline restock / quantity counter (`adjustment: +5` or `new_stock: 10`) |
| `PATCH`| `/api/products/{id}/toggle-status` | Bearer | 1-Click In Stock / Out of Stock toggle (`is_available: true/false`) |
| `DELETE`| `/api/products/{id}` | Bearer | Delete discontinued product |

---

### 4. AI Marketing Copywriter & Tools
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/generate-copy` | Public | Takes 2-3 notes and returns a 2-sentence pitch for Sri Lankan buyers |
| `POST` | `/api/ai/suggest-category` | Public | Automatically suggests the best category tag based on product title |

#### Example: Generate Marketing Copy
```json
POST /api/ai/generate-copy
{
  "title": "Pure Kithul Treacle",
  "keywords": "organic, low sugar, traditional tapping from Deniyaya"
}
```
**Response:**
```json
{
  "title": "Pure Kithul Treacle",
  "marketing_pitch": "Handcrafted with care, our Pure Kithul Treacle brings you the finest Sri Lankan goodness featuring organic, low sugar, traditional tapping from Deniyaya. Perfect for your household or gifting, guaranteed to deliver pure traditional flavor and freshness straight to your doorstep.",
  "highlights": ["organic", "low sugar", "traditional tapping from Deniyaya"],
  "generated_by": "PolaLink Local AI Engine"
}
```
