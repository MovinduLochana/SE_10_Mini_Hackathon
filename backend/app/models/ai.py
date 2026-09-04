from typing import List, Optional
from pydantic import BaseModel, Field

class CopyGenerationRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Product name", examples=["Pure Kithul Treacle"])
    keywords: str = Field(..., min_length=2, max_length=200, description="2-3 brief merchant notes", examples=["organic, low sugar, traditional tapping from Deniyaya"])
    target_audience: Optional[str] = Field("Sri Lankan households and food lovers", description="Target customer segment")

class CopyGenerationResponse(BaseModel):
    title: str
    marketing_pitch: str
    highlights: List[str] = []
    generated_by: str = "PolaLink AI"

class CategorySuggestionRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, examples=["Pure Cinnamon Sticks (Ceylon Alba)"])
    description: Optional[str] = Field(None, examples=["Hand-picked spicy aroma"])

class CategorySuggestionResponse(BaseModel):
    title: str
    suggested_category: str
    alternative_categories: List[str] = []
    confidence: float = 0.95
