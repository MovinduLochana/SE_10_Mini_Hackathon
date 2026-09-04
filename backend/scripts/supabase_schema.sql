-- ==============================================================================
-- PolaLink LK: Supabase Database Schema
-- Run this SQL in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Stores Table (Micro-merchant profiles)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by store slug and merchant user_id
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores (slug);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores (user_id);

-- 3. Products Table (Inventory & Catalog items)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for product search, filtering, and merchant stock management
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products (store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products (is_available);

-- 4. Orders Table (Optional WhatsApp order logging / tracking)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING',
    delivery_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders (store_id);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Stores Policies:
-- Anyone (public / anonymous) can read stores by slug
DROP POLICY IF EXISTS "Public can view stores" ON public.stores;
CREATE POLICY "Public can view stores" 
ON public.stores FOR SELECT 
USING (true);

-- Authenticated merchants can insert their own store
DROP POLICY IF EXISTS "Merchants can insert own store" ON public.stores;
CREATE POLICY "Merchants can insert own store" 
ON public.stores FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Authenticated merchants can update their own store
DROP POLICY IF EXISTS "Merchants can update own store" ON public.stores;
CREATE POLICY "Merchants can update own store" 
ON public.stores FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Products Policies:
-- Anyone can view products of any store
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
ON public.products FOR SELECT 
USING (true);

-- Authenticated merchants can insert products to their stores
DROP POLICY IF EXISTS "Merchants can insert products" ON public.products;
CREATE POLICY "Merchants can insert products" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = products.store_id 
        AND stores.user_id = auth.uid()
    )
);

-- Authenticated merchants can update their products (price, stock, availability)
DROP POLICY IF EXISTS "Merchants can update products" ON public.products;
CREATE POLICY "Merchants can update products" 
ON public.products FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = products.store_id 
        AND stores.user_id = auth.uid()
    )
);

-- Authenticated merchants can delete their products
DROP POLICY IF EXISTS "Merchants can delete products" ON public.products;
CREATE POLICY "Merchants can delete products" 
ON public.products FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = products.store_id 
        AND stores.user_id = auth.uid()
    )
);

-- Orders Policies:
-- Anyone can place/insert an order (for customers checking out)
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Only store owner can view orders
DROP POLICY IF EXISTS "Merchants can view store orders" ON public.orders;
CREATE POLICY "Merchants can view store orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.stores 
        WHERE stores.id = orders.store_id 
        AND stores.user_id = auth.uid()
    )
);
