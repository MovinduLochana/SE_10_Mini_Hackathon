"""
PolaLink LK Seed Script:
Populates realistic Sri Lankan stores and products for the hackathon demo.
Run with: python scripts/seed.py
"""

import sys
import os
import uuid

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase
from app.core.config import settings

SAMPLE_STORES = [
    {
        "name": "Ruhunu Spices & Herbs",
        "slug": "ruhunu-spices",
        "whatsapp_number": "94771234567",
        "description": "Authentic organic spices harvested directly from home gardens in Matara & Galle. 100% natural, freshly grounded.",
        "products": [
            {
                "title": "Ceylon Cinnamon Alba Grade (100g)",
                "description": "Premium pencil-thin true Ceylon cinnamon quills with sweet, delicate aroma.",
                "price": 850.0,
                "category": "Spices",
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Roasted Village Curry Powder / Badapu Thuna Paha (250g)",
                "description": "Slow-roasted Southern style aromatic curry powder with coriander, cumin, and curry leaves.",
                "price": 450.0,
                "category": "Spices",
                "stock": 40,
                "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Pure Crushed Black Pepper (100g)",
                "description": "Sun-dried Matara black pepper corns, coarsely ground with intense heat.",
                "price": 380.0,
                "category": "Spices",
                "stock": 18,
                "image_url": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Sun-Dried Goraka Pieces (200g)",
                "description": "Traditional Gambooge for authentic Sri Lankan fish and meat curries.",
                "price": 320.0,
                "category": "Spices",
                "stock": 3,
                "image_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop",
                "is_available": True
            }
        ]
    },
    {
        "name": "Kandy Kithul & Village Delights",
        "slug": "kandy-kithul",
        "whatsapp_number": "94719876543",
        "description": "Direct from Kandy knuckles forest borders. Pure kithul treacle, jaggery, and homemade traditional condiments.",
        "products": [
            {
                "title": "Pure Kithul Treacle Bottle (375ml)",
                "description": "100% pure tapping from Deniyaya rainforest borders, no added sugar or coloring.",
                "price": 1250.0,
                "category": "Sweets",
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Traditional Kithul Jaggery Half Moon (300g)",
                "description": "Rich golden jaggery crafted in earthen pans. Great accompaniment with plain tea.",
                "price": 680.0,
                "category": "Sweets",
                "stock": 12,
                "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Homemade Katta Sambol in Olive Oil (200g)",
                "description": "Fiery Maldive fish, red chili, and shallots simmered with traditional lime juice.",
                "price": 520.0,
                "category": "Homemade",
                "stock": 2,
                "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop",
                "is_available": True
            },
            {
                "title": "Ambul Banana Fresh Bunch (1kg)",
                "description": "Naturally ripened sweet sour local banana bunch from local home garden.",
                "price": 280.0,
                "category": "Fresh Produce",
                "stock": 0,
                "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop",
                "is_available": False
            }
        ]
    }
]

def seed_database():
    print("🌱 PolaLink LK: Seeding Supabase database...")
    try:
        supabase = get_supabase()
    except Exception as e:
        print(f"❌ Could not connect to Supabase: {e}")
        print("Please configure SUPABASE_URL and SUPABASE_KEY in backend/.env before seeding.")
        return

    for store_data in SAMPLE_STORES:
        slug = store_data["slug"]
        print(f"-> Processing store: {store_data['name']} ({slug})")

        # Check existing store
        existing = supabase.table("stores").select("id").eq("slug", slug).execute()
        if existing.data:
            store_id = existing.data[0]["id"]
            print(f"   Store already exists (ID: {store_id}). Updating...")
            supabase.table("stores").update({
                "name": store_data["name"],
                "whatsapp_number": store_data["whatsapp_number"],
                "description": store_data["description"]
            }).eq("id", store_id).execute()
        else:
            print("   Creating new store...")
            res = supabase.table("stores").insert({
                "name": store_data["name"],
                "slug": slug,
                "whatsapp_number": store_data["whatsapp_number"],
                "description": store_data["description"]
            }).execute()
            if not res.data:
                print(f"   ❌ Failed to insert store {slug}")
                continue
            store_id = res.data[0]["id"]

        # Insert / Update Products
        for prod in store_data["products"]:
            # Check existing product by title and store_id
            existing_prod = supabase.table("products").select("id").eq("store_id", store_id).eq("title", prod["title"]).execute()
            prod_record = {
                "store_id": store_id,
                "title": prod["title"],
                "description": prod["description"],
                "price": prod["price"],
                "category": prod["category"],
                "stock": prod["stock"],
                "image_url": prod["image_url"],
                "is_available": prod["is_available"]
            }
            if existing_prod.data:
                supabase.table("products").update(prod_record).eq("id", existing_prod.data[0]["id"]).execute()
                print(f"   - Updated product: {prod['title']}")
            else:
                supabase.table("products").insert(prod_record).execute()
                print(f"   + Inserted product: {prod['title']}")

    print("\n✅ Seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
