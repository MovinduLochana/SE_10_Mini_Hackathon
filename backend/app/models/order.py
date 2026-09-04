from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0, description="Order quantity (must be > 0)")

class OrderCalculateRequest(BaseModel):
    store_slug: str
    items: List[OrderItemInput]
    customer_name: Optional[str] = Field(None, description="Customer name for personalized WhatsApp order")
    customer_phone: Optional[str] = Field(None, description="Customer contact phone")
    delivery_notes: Optional[str] = Field(None, description="Delivery location / instructions")

class CalculatedOrderItem(BaseModel):
    product_id: str
    title: str
    unit_price: float
    quantity: int
    subtotal: float
    available_stock: int
    is_sufficient: bool

class OrderCalculateResponse(BaseModel):
    store_name: str
    whatsapp_number: str
    items: List[CalculatedOrderItem]
    total_amount: float
    currency: str = "LKR"
    has_stock_issues: bool
    stock_warnings: List[str] = []
    whatsapp_checkout_url: str
    formatted_whatsapp_message: str

class OrderCreateRequest(OrderCalculateRequest):
    save_to_store: bool = True

class OrderRecordResponse(BaseModel):
    id: str
    store_id: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: float
    status: str
    delivery_notes: Optional[str] = None
    created_at: Optional[datetime] = None
