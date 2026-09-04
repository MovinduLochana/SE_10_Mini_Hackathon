import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, status, Response
from app.core.config import settings
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user, get_optional_user, AuthenticatedUser
from app.models.store import StoreCreate, StoreResponse, StoreUpdate, slugify
from app.models.product import ProductCreate
from app.services.qr_service import generate_qr_data_url, generate_qr_image_bytes

router = APIRouter(prefix="/api/stores", tags=["Stores"])

def build_store_response(store_data: dict) -> StoreResponse:
    slug = store_data.get("slug", "")
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    store_url = f"{frontend_base}/store/{slug}"
    qr_data_url = generate_qr_data_url(store_url)

    return StoreResponse(
        id=str(store_data.get("id")),
        user_id=str(store_data.get("user_id")) if store_data.get("user_id") else None,
        name=store_data.get("name"),
        slug=slug,
        whatsapp_number=store_data.get("whatsapp_number"),
        description=store_data.get("description"),
        category=store_data.get("category"),
        location=store_data.get("location"),
        logo_url=store_data.get("logo_url"),
        owner_name=store_data.get("owner_name"),
        store_url=store_url,
        qr_code_data_url=qr_data_url,
        created_at=store_data.get("created_at"),
        updated_at=store_data.get("updated_at")
    )

class StoreOnboardingRequest(StoreCreate):
    initial_product: Optional[ProductCreate] = None

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def onboard_store(
    payload: StoreOnboardingRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Onboard a new merchant store.
    Requires authentication via Supabase Auth Bearer token.
    Automatically assigns store ownership to the authenticated merchant.
    Optionally creates an initial product entry in the same transaction.
    """
    supabase = get_supabase()

    # Generate slug if not explicitly provided
    desired_slug = payload.slug or slugify(payload.name)
    if not desired_slug:
        desired_slug = f"store-{uuid.uuid4().hex[:6]}"

    # Ensure slug uniqueness
    existing = supabase.table("stores").select("id").eq("slug", desired_slug).execute()
    if existing.data:
        # Append short random suffix
        desired_slug = f"{desired_slug}-{uuid.uuid4().hex[:4]}"

    store_insert = {
        "user_id": current_user.id,
        "name": payload.name,
        "slug": desired_slug,
        "whatsapp_number": payload.whatsapp_number,
        "description": payload.description or ""
    }

    try:
        res = supabase.table("stores").insert(store_insert).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create store record.")
        new_store = res.data[0]

        # If initial product provided, insert it
        if payload.initial_product:
            prod = payload.initial_product
            prod_insert = {
                "store_id": new_store["id"],
                "title": prod.title,
                "description": prod.description or "",
                "price": prod.price,
                "category": prod.category,
                "stock": prod.stock,
                "image_url": prod.image_url or "",
                "is_available": prod.is_available and (prod.stock > 0)
            }
            supabase.table("products").insert(prod_insert).execute()

        return build_store_response(new_store)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Store creation failed: {str(e)}")

@router.get("/my/stores", response_model=List[StoreResponse])
async def get_my_stores(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns all stores owned by the currently authenticated merchant.
    """
    supabase = get_supabase()
    res = supabase.table("stores").select("*").eq("user_id", current_user.id).order("created_at", desc=True).execute()
    return [build_store_response(s) for s in res.data or []]

@router.get("/{slug}", response_model=StoreResponse)
async def get_store_by_slug(slug: str):
    """
    Public endpoint: Retrieves store details by URL slug, including clean store URL and QR code.
    """
    supabase = get_supabase()
    res = supabase.table("stores").select("*").eq("slug", slug).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Store with slug '{slug}' not found.")
    
    return build_store_response(res.data[0])

@router.get("/{slug}/qr")
async def get_store_qr_code(slug: str):
    """
    Public endpoint: Streams a downloadable/scannable QR code image (PNG)
    pointing to the store catalog at `{FRONTEND_URL}/store/{slug}`.
    """
    supabase = get_supabase()
    res = supabase.table("stores").select("slug").eq("slug", slug).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Store with slug '{slug}' not found.")

    frontend_base = settings.FRONTEND_URL.rstrip("/")
    store_url = f"{frontend_base}/store/{slug}"
    png_bytes = generate_qr_image_bytes(store_url)

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="{slug}-polalink-qr.png"'
        }
    )

@router.patch("/{slug}", response_model=StoreResponse)
async def update_store(
    slug: str,
    payload: StoreUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Updates store profile. Only the owner merchant can update the store.
    """
    supabase = get_supabase()
    store_res = supabase.table("stores").select("*").eq("slug", slug).execute()
    if not store_res.data:
        raise HTTPException(status_code=404, detail="Store not found.")

    store = store_res.data[0]
    if store.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this store.")

    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        return build_store_response(store)

    res = supabase.table("stores").update(update_fields).eq("id", store["id"]).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to update store.")
    return build_store_response(res.data[0])
