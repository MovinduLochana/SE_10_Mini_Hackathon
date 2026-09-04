from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum

class StockBadge(str, Enum):
    IN_STOCK = "IN_STOCK"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"

class ProductBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=150, description="Product title", examples=["Ceylon Organic Cinnamon Quills (100g)"])
    description: Optional[str] = Field(None, max_length=1000, description="Product description or marketing pitch")
    price: float = Field(..., gt=0, description="Price in LKR (must be > 0)", examples=[650.0])
    category: str = Field(..., min_length=2, max_length=50, description="Category tag (e.g. Spices, Fresh Produce, Homemade, Sweets)", examples=["Spices"])
    stock: int = Field(0, ge=0, description="Stock count (non-negative integer)", examples=[25])
    image_url: Optional[str] = Field(None, description="Direct URL to product image")
    is_available: bool = Field(True, description="Stock availability toggle (In Stock / Out of Stock)")

    @field_validator("category")
    @classmethod
    def clean_category(cls, v: str) -> str:
        return v.strip().title()

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

class ProductStockAdjust(BaseModel):
    adjustment: Optional[int] = Field(None, description="Increment or decrement value (e.g. +5 or -2)")
    new_stock: Optional[int] = Field(None, ge=0, description="Absolute stock value to set")

class ProductToggleStatus(BaseModel):
    is_available: bool = Field(..., description="Set In Stock (True) or Out of Stock (False)")

class ProductResponse(BaseModel):
    id: str
    store_id: str
    title: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int
    image_url: Optional[str] = None
    is_available: bool
    stock_badge: StockBadge
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @classmethod
    def compute_badge(cls, stock: int, is_available: bool) -> StockBadge:
        if stock <= 0 or not is_available:
            return StockBadge.OUT_OF_STOCK
        elif stock <= 5:
            return StockBadge.LOW_STOCK
        return StockBadge.IN_STOCK

class ProductFilterParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock_only: Optional[bool] = False
    sort_by: Optional[str] = Field(None, description="price_asc, price_desc, or newest")
