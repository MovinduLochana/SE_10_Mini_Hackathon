from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user, AuthenticatedUser
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductStockAdjust,
    ProductToggleStatus,
    StockBadge
)

router = APIRouter(tags=["Products & Inventory"])

def format_product_response(item: dict) -> ProductResponse:
    stock = int(item.get("stock", 0))
    is_available = bool(item.get("is_available", True))
    badge = ProductResponse.compute_badge(stock, is_available)

    return ProductResponse(
        id=str(item.get("id")),
        store_id=str(item.get("store_id")),
        title=item.get("title"),
        description=item.get("description"),
        price=float(item.get("price")),
        category=item.get("category"),
        stock=stock,
        image_url=item.get("image_url"),
        is_available=is_available,
        stock_badge=badge,
        created_at=item.get("created_at"),
        updated_at=item.get("updated_at")
    )

def verify_store_ownership(supabase, store_id: str, user_id: str):
    """Verifies that store_id belongs to user_id."""
    res = supabase.table("stores").select("user_id").eq("id", store_id).execute()
    if not res.data or res.data[0].get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage this store's inventory."
        )

def verify_product_ownership(supabase, product_id: str, user_id: str) -> dict:
    """Verifies product exists and belongs to a store owned by user_id."""
    prod_res = supabase.table("products").select("*, stores(user_id)").eq("id", product_id).execute()
    if not prod_res.data:
        raise HTTPException(status_code=404, detail="Product not found.")
    prod = prod_res.data[0]
    store_info = prod.get("stores")
    if not store_info or store_info.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this product."
        )
    return prod

# --------------------------------------------------------------------------
# Public Customer Catalog Endpoints
# --------------------------------------------------------------------------

@router.get("/api/stores/{slug}/products", response_model=List[ProductResponse])
async def get_public_products(
    slug: str,
    search: Optional[str] = Query(None, description="Search term in title or description"),
    category: Optional[str] = Query(None, description="Category filter (e.g. Spices, Sweets)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter in LKR"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter in LKR"),
    in_stock_only: Optional[bool] = Query(False, description="Filter out out-of-stock items"),
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, newest")
):
    """
    Public Customer Catalog API:
    Instant search by title/description, category tag filter, LKR price slider range filter,
    stock status filter, and price/newest sorting.
    """
    supabase = get_supabase()

    # Get store ID by slug
    store_res = supabase.table("stores").select("id").eq("slug", slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail=f"Store with slug '{slug}' not found.")
    store_id = store_res.data[0]["id"]

    query = supabase.table("products").select("*").eq("store_id", store_id)

    # Filter by category
    if category and category.strip():
        query = query.ilike("category", f"%{category.strip()}%")

    # Filter by search term
    if search and search.strip():
        term = search.strip()
        query = query.or_(f"title.ilike.%{term}%,description.ilike.%{term}%")

    # Filter by price range
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)

    # Filter in-stock only
    if in_stock_only:
        query = query.eq("is_available", True).gt("stock", 0)

    # Sorting
    if sort_by == "price_asc":
        query = query.order("price", desc=False)
    elif sort_by == "price_desc":
        query = query.order("price", desc=True)
    elif sort_by == "newest":
        query = query.order("created_at", desc=True)
    else:
        query = query.order("created_at", desc=False)

    res = query.execute()
    return [format_product_response(p) for p in res.data or []]

# --------------------------------------------------------------------------
# Merchant Inventory Management Endpoints (Auth Protected)
# --------------------------------------------------------------------------

@router.get("/api/stores/{slug}/inventory", response_model=List[ProductResponse])
async def get_merchant_inventory(
    slug: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Merchant Inventory API:
    Lists all inventory items with computed stock badges (IN_STOCK, LOW_STOCK, OUT_OF_STOCK).
    """
    supabase = get_supabase()
    store_res = supabase.table("stores").select("id, user_id").eq("slug", slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail="Store not found.")
    
    store = store_res.data[0]
    if store.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this inventory.")

    res = supabase.table("products").select("*").eq("store_id", store["id"]).order("created_at", desc=True).execute()
    return [format_product_response(p) for p in res.data or []]

@router.post("/api/stores/{slug}/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def add_product(
    slug: str,
    payload: ProductCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Adds a new product to the merchant's store catalog.
    """
    supabase = get_supabase()
    store_res = supabase.table("stores").select("id, user_id").eq("slug", slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail="Store not found.")
    
    store = store_res.data[0]
    if store.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to add products to this store.")

    insert_data = {
        "store_id": store["id"],
        "title": payload.title,
        "description": payload.description or "",
        "price": payload.price,
        "category": payload.category,
        "stock": payload.stock,
        "image_url": payload.image_url or "",
        "is_available": payload.is_available and (payload.stock > 0)
    }

    res = supabase.table("products").insert(insert_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create product.")
    return format_product_response(res.data[0])

@router.patch("/api/products/{product_id}", response_model=ProductResponse)
async def update_product_details(
    product_id: str,
    payload: ProductUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Inline edit for product details (title, description, price, category, stock, image).
    """
    supabase = get_supabase()
    verify_product_ownership(supabase, product_id, current_user.id)

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        res = supabase.table("products").select("*").eq("id", product_id).execute()
        return format_product_response(res.data[0])

    # If stock is being updated to 0, automatically reflect availability if desired
    if "stock" in update_fields and update_fields["stock"] == 0:
        update_fields["is_available"] = False

    res = supabase.table("products").update(update_fields).eq("id", product_id).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to update product.")
    return format_product_response(res.data[0])

@router.patch("/api/products/{product_id}/stock", response_model=ProductResponse)
async def adjust_product_stock(
    product_id: str,
    payload: ProductStockAdjust,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Quick-adjust quantity counter to restock or decrement items.
    Supports either relative adjustment (+5, -2) or absolute new_stock.
    """
    supabase = get_supabase()
    prod = verify_product_ownership(supabase, product_id, current_user.id)

    current_stock = int(prod.get("stock", 0))

    if payload.new_stock is not None:
        target_stock = payload.new_stock
    elif payload.adjustment is not None:
        target_stock = max(0, current_stock + payload.adjustment)
    else:
        raise HTTPException(status_code=400, detail="Either 'adjustment' or 'new_stock' must be provided.")

    is_avail = bool(prod.get("is_available", True))
    if target_stock == 0:
        is_avail = False
    elif target_stock > 0 and not is_avail and (payload.adjustment is not None and payload.adjustment > 0):
        # If restocked from zero, automatically toggle available
        is_avail = True

    res = supabase.table("products").update({
        "stock": target_stock,
        "is_available": is_avail
    }).eq("id", product_id).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to update stock.")
    return format_product_response(res.data[0])

@router.patch("/api/products/{product_id}/toggle-status", response_model=ProductResponse)
async def toggle_product_availability(
    product_id: str,
    payload: ProductToggleStatus,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    1-Click Live Stock Status Toggle:
    Mark item as In Stock or Out of Stock, immediately reflected on the public catalog.
    """
    supabase = get_supabase()
    verify_product_ownership(supabase, product_id, current_user.id)

    res = supabase.table("products").update({
        "is_available": payload.is_available
    }).eq("id", product_id).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to toggle product status.")
    return format_product_response(res.data[0])

@router.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Deletes a product item from the catalog.
    """
    supabase = get_supabase()
    verify_product_ownership(supabase, product_id, current_user.id)

    supabase.table("products").delete().eq("id", product_id).execute()
    return None
