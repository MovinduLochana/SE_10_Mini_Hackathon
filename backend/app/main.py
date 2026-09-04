import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.supabase_client import get_supabase
from app.routers import auth, stores, products, orders, ai

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("polalink")

app = FastAPI(
    title="PolaLink LK Backend API",
    description="""
    🚀 **PolaLink LK** - Hyper-local Sri Lankan micro-merchant e-commerce and WhatsApp checkout platform.

    ### Core Modules:
    - **Merchant Onboarding & Products**: Dynamic store creation, Sri Lankan 07X mobile validation, scannable QR codes.
    - **Customer Catalog & Order Engine**: Instant search, category & price filters, floating cart calculation, 1-click WhatsApp checkout link.
    - **Real-Time Inventory**: 1-click In Stock / Out of Stock toggles, quick restock quantity adjustments, visual badges.
    - **AI Copywriting & Auto-Categorization**: 2-sentence marketing pitch generator and category classifier.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for Next.js Frontend (Supports Localhost & Vercel)
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]
if "https://se-10-mini-hackathon.vercel.app" not in origins:
    origins.append("https://se-10-mini-hackathon.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_origin_regex=r"https?://.*\.vercel\.app|https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Validation Error Handler (Providing explicit structured notices for frontend forms)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "Invalid input.")
        errors.append({
            "field": field,
            "message": msg
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "message": "One or more input fields are invalid.",
            "details": errors
        }
    )

# Register Routers
app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(ai.router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "PolaLink LK Backend API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
        "frontend_target": settings.FRONTEND_URL
    }

@app.get("/health", tags=["Health"])
async def health_check():
    supabase_ok = False
    supabase_msg = "Not configured"
    try:
        sb = get_supabase()
        # Test lightweight ping
        res = sb.table("stores").select("id").limit(1).execute()
        supabase_ok = True
        supabase_msg = "Connected"
    except Exception as e:
        supabase_msg = str(e)

    return {
        "status": "healthy",
        "supabase_connected": supabase_ok,
        "supabase_message": supabase_msg
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
