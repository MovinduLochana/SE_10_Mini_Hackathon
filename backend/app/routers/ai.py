from fastapi import APIRouter
from app.models.ai import (
    CopyGenerationRequest,
    CopyGenerationResponse,
    CategorySuggestionRequest,
    CategorySuggestionResponse
)
from app.services.ai_service import generate_marketing_copy, suggest_category

router = APIRouter(prefix="/api/ai", tags=["AI Marketing & Tools"])

@router.post("/generate-copy", response_model=CopyGenerationResponse)
async def generate_product_copy(payload: CopyGenerationRequest):
    """
    AI Marketing Copywriter:
    Takes 2-3 brief vendor notes and produces a compelling 2-sentence marketing pitch
    optimized for local Sri Lankan buyers.
    """
    return await generate_marketing_copy(title=payload.title, keywords=payload.keywords)

@router.post("/suggest-category", response_model=CategorySuggestionResponse)
async def suggest_product_category(payload: CategorySuggestionRequest):
    """
    Auto-Categorization:
    Recommends the best category tag based on product title and description.
    """
    return await suggest_category(title=payload.title, description=payload.description or "")
