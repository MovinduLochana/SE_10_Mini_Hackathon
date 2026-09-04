import re
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, AliasChoices
from datetime import datetime

SL_PHONE_REGEX = re.compile(r"^(?:\+?94|0)?(7[01245678]\d{7})$")

def normalize_sl_phone(phone: str) -> str:
    """
    Validates and normalizes Sri Lankan mobile numbers into standard format: 947XXXXXXXX.
    Accepts: 0771234567, +94771234567, 94771234567, 771234567
    """
    cleaned = re.sub(r"[\s\-()]", "", phone)
    match = SL_PHONE_REGEX.match(cleaned)
    if not match:
        raise ValueError(
            "Invalid Sri Lankan mobile number. Must match Sri Lankan mobile prefixes (070, 071, 072, 074, 075, 076, 077, 078) followed by 7 digits."
        )
    subscriber_number = match.group(1)
    return f"94{subscriber_number}"

def slugify(text: str) -> str:
    """Converts a string into a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

class StoreBase(BaseModel):
    name: str = Field(..., validation_alias=AliasChoices("name", "shopName", "shop_name"), min_length=2, max_length=100, description="Shop or Vendor Name", examples=["Ruhunu Spices"])
    whatsapp_number: str = Field(..., validation_alias=AliasChoices("whatsapp_number", "contact", "whatsappNumber"), description="Sri Lankan mobile number (e.g. 0771234567)", examples=["0771234567"])
    description: Optional[str] = Field(None, max_length=500, description="Brief store description or bio")
    slug: Optional[str] = Field(None, max_length=120, description="Custom store URL slug. Generated from name if omitted.")
    category: Optional[str] = Field(None, max_length=100, description="Store category")
    location: Optional[str] = Field(None, max_length=100, description="City / Region")
    logo_url: Optional[str] = Field(None, validation_alias=AliasChoices("logo_url", "logoUrl"), description="Logo or banner URL")
    owner_name: Optional[str] = Field(None, validation_alias=AliasChoices("owner_name", "ownerName"), description="Merchant contact name")

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return normalize_sl_phone(v)

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        if v:
            clean_slug = slugify(v)
            if not clean_slug:
                raise ValueError("Invalid slug format.")
            return clean_slug
        return None

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    whatsapp_number: Optional[str] = None
    description: Optional[str] = None

    @field_validator("whatsapp_number")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return normalize_sl_phone(v)
        return None

class StoreResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    slug: str
    whatsapp_number: str
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    owner_name: Optional[str] = None
    store_url: str
    qr_code_data_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
