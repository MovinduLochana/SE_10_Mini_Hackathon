from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user, AuthenticatedUser
from app.models.order import (
    OrderCalculateRequest,
    OrderCalculateResponse,
    OrderCreateRequest,
    OrderRecordResponse
)
from app.services.order_service import process_order_calculation

router = APIRouter(prefix="/api/orders", tags=["Orders & WhatsApp Checkout"])

@router.post("/calculate", response_model=OrderCalculateResponse)
async def calculate_order_and_checkout(payload: OrderCalculateRequest):
    """
    Public Live Order Calculator & 1-Click WhatsApp Checkout Link Generator:
    - Verifies product existence and real-time inventory count
    - Computes line items and grand total in LKR
    - Checks stock warnings (e.g. out-of-stock items)
    - Builds a pre-filled, formatted WhatsApp checkout message and direct https://wa.me/ URL
    """
    supabase = get_supabase()

    # Fetch store
    store_res = supabase.table("stores").select("*").eq("slug", payload.store_slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail=f"Store with slug '{payload.store_slug}' not found.")
    store = store_res.data[0]

    # Fetch all requested products in one batch query
    product_ids = [str(item.product_id) for item in payload.items]
    if not product_ids:
        raise HTTPException(status_code=400, detail="Cart cannot be empty.")

    products_res = supabase.table("products").select("*").in_("id", product_ids).execute()
    products_by_id = {str(p["id"]): p for p in products_res.data or []}

    calculation = process_order_calculation(
        store=store,
        products_by_id=products_by_id,
        requested_items=payload.items,
        customer_name=payload.customer_name or "",
        customer_phone=payload.customer_phone or "",
        delivery_notes=payload.delivery_notes or ""
    )

    return calculation

@router.post("", response_model=OrderRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_order_record(payload: OrderCreateRequest):
    """
    Optional: Persist an order record in Supabase database when customer clicks checkout,
    enabling vendor order tracking and dashboard analytics.
    """
    supabase = get_supabase()

    # Validate store
    store_res = supabase.table("stores").select("id, whatsapp_number, name").eq("slug", payload.store_slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail="Store not found.")
    store = store_res.data[0]

    product_ids = [str(item.product_id) for item in payload.items]
    products_res = supabase.table("products").select("*").in_("id", product_ids).execute()
    products_by_id = {str(p["id"]): p for p in products_res.data or []}

    calc = process_order_calculation(
        store=store,
        products_by_id=products_by_id,
        requested_items=payload.items,
        customer_name=payload.customer_name or "",
        customer_phone=payload.customer_phone or "",
        delivery_notes=payload.delivery_notes or ""
    )

    try:
        # Create order
        order_insert = {
            "store_id": store["id"],
            "customer_name": payload.customer_name or "Guest Customer",
            "customer_phone": payload.customer_phone or "",
            "total_amount": calc.total_amount,
            "status": "WHATSAPP_PENDING",
            "delivery_notes": payload.delivery_notes or ""
        }
        order_res = supabase.table("orders").insert(order_insert).execute()
        if not order_res.data:
            raise HTTPException(status_code=500, detail="Failed to record order.")
        new_order = order_res.data[0]

        # Create order items
        order_items_insert = []
        for it in calc.items:
            order_items_insert.append({
                "order_id": new_order["id"],
                "product_id": it.product_id,
                "product_title": it.title,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "subtotal": it.subtotal
            })

        if order_items_insert:
            supabase.table("order_items").insert(order_items_insert).execute()

        return OrderRecordResponse(
            id=str(new_order["id"]),
            store_id=str(new_order["store_id"]),
            customer_name=new_order.get("customer_name"),
            customer_phone=new_order.get("customer_phone"),
            total_amount=float(new_order.get("total_amount", 0)),
            status=new_order.get("status", "PENDING"),
            delivery_notes=new_order.get("delivery_notes"),
            created_at=new_order.get("created_at")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record order: {str(e)}")

@router.get("/store/{slug}", response_model=List[OrderRecordResponse])
async def get_store_orders(
    slug: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Merchant order history list for the specified store.
    """
    supabase = get_supabase()
    store_res = supabase.table("stores").select("id, user_id").eq("slug", slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail="Store not found.")
    store = store_res.data[0]

    if store.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this store's orders.")

    orders_res = supabase.table("orders").select("*").eq("store_id", store["id"]).order("created_at", desc=True).execute()
    return [
        OrderRecordResponse(
            id=str(o["id"]),
            store_id=str(o["store_id"]),
            customer_name=o.get("customer_name"),
            customer_phone=o.get("customer_phone"),
            total_amount=float(o.get("total_amount", 0)),
            status=o.get("status", "PENDING"),
            delivery_notes=o.get("delivery_notes"),
            created_at=o.get("created_at")
        )
        for o in orders_res.data or []
    ]
