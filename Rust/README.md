# PolaLink LK — Rust Axum Backend (`/Rust`)

High-performance, memory-efficient asynchronous REST API for **PolaLink LK** built in **Rust** using **Axum 0.8**, **Tokio**, and **Tower-HTTP**.

Provides 100% parity with the FastAPI backend while delivering low sub-millisecond latencies, negligible memory footprint, and single-binary deployment.

---

## Features

- **Store Onboarding & Management**:
  - Sri Lankan 07X mobile number normalization & validation (`947XXXXXXXX`).
  - Automatic URL slug generation and collision handling.
  - Dynamically generated scannable QR codes (PNG download & Base64 Data URLs).
- **Public Customer Catalog**:
  - Instant full-text search across titles and descriptions.
  - Category filtering and price range (min/max in LKR) slider filtering.
  - In-stock availability toggles and price/newest sorting.
- **Merchant Inventory Management**:
  - Auth-protected via Supabase GoTrue Bearer tokens.
  - Real-time stock status badge computation (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
  - 1-Click stock availability toggling and quantity adjustments (+5, -2, or absolute values).
- **Order Engine & WhatsApp Checkout**:
  - Stock verification and warning notifications for out-of-stock items.
  - Automatic Sri Lankan Rupee formatting (`Rs. 2,150.00`).
  - Pre-filled WhatsApp click-to-chat checkout link generator (`https://wa.me/...`).
- **AI Copywriting & Auto-Categorization**:
  - 15 localized Sri Lankan marketing pitch templates with dynamic highlight extraction.
  - Sri Lankan heuristic keyword categorizer (Spices, Sweets, Homemade, Grocery, Apparel, Electronics, Crafts, Hardware, Wellness).
  - Optional Google Gemini 2.5 Flash API integration.

---

## Directory Structure

```
Rust/
├── Cargo.toml
├── .env.example
├── README.md
├── src/
│   ├── main.rs                 # Server entrypoint and TCP binding
│   ├── lib.rs                  # Module declarations and Axum router setup
│   ├── config.rs               # Environment configuration
│   ├── error.rs                # Unified error handling & FastAPI-compatible JSON errors
│   ├── core/
│   │   ├── auth.rs             # AuthenticatedUser and OptionalUser extractors
│   │   └── supabase.rs         # PostgREST + GoTrue asynchronous client
│   ├── models/
│   │   ├── store.rs            # Store models, SL phone validator, slugifier
│   │   ├── product.rs          # Product models, stock badges, filter params
│   │   ├── order.rs            # Order models and calculation schemas
│   │   └── ai.rs               # Copywriting and categorization models
│   ├── services/
│   │   ├── qr_service.rs       # PNG byte generation & Base64 data URLs
│   │   ├── order_service.rs    # WhatsApp order messages & wa.me URLs
│   │   └── ai_service.rs       # Marketing pitch templates, heuristics & Gemini
│   └── routers/
│       ├── root.rs             # GET / and GET /health
│       ├── auth.rs             # POST /api/auth/signup, /login, GET /me
│       ├── stores.rs           # /api/stores CRUD & QR code endpoint
│       ├── products.rs         # Public catalog & merchant inventory endpoints
│       ├── orders.rs           # Live order calculation & WhatsApp link endpoints
│       └── ai.rs               # AI copywriting & categorization endpoints
└── tests/
    ├── validation_and_services_test.rs  # Unit tests (phones, slugify, QR, orders, AI)
    └── api_endpoints_test.rs            # Integration tests (Axum router & handlers)
```

---

## Getting Started

### 1. Requirements

- Rust 1.80+ (tested on Rust 1.94+)
- Cargo

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or `SUPABASE_KEY`) are populated.

### 3. Run Development Server

```bash
cargo run
```

By default, the server binds to `http://0.0.0.0:8000`.

### 4. Run Tests

```bash
# Run all unit & integration tests
cargo test

# Run validation tests only
cargo test --test validation_and_services_test

# Run API integration tests only
cargo test --test api_endpoints_test
```

### 5. Build for Production

```bash
cargo build --release
```

The compiled binary will be located at `target/release/polalink_backend`.
