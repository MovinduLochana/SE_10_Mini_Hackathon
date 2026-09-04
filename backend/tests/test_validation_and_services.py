import pytest
from pydantic import ValidationError

from app.models.store import StoreCreate, normalize_sl_phone, slugify
from app.models.product import ProductCreate, ProductResponse, StockBadge
from app.services.qr_service import generate_qr_data_url, generate_qr_image_bytes
from app.services.order_service import process_order_calculation, generate_whatsapp_url, format_lkr
from app.services.ai_service import generate_local_marketing_pitch, suggest_category_locally
from app.models.order import OrderItemInput

def test_sri_lankan_phone_validation():
    # Valid formats
    assert normalize_sl_phone("0771234567") == "94771234567"
    assert normalize_sl_phone("+94712345678") == "94712345678"
    assert normalize_sl_phone("94749876543") == "94749876543"
    assert normalize_sl_phone("076 123 4567") == "94761234567"
    assert normalize_sl_phone("070-1122334") == "94701122334"

    # Invalid formats
    with pytest.raises(ValueError):
        normalize_sl_phone("0112345678")  # Landline
    with pytest.raises(ValueError):
        normalize_sl_phone("0791234567")  # 079 is not an SL mobile prefix
    with pytest.raises(ValueError):
        normalize_sl_phone("12345")       # Too short
    with pytest.raises(ValueError):
        normalize_sl_phone("abcdefghij")  # Non-numeric

def test_store_creation_validation():
    store = StoreCreate(
        name="Galle Fort Antiques",
        whatsapp_number="0771234567",
        description="Authentic collectibles"
    )
    assert store.name == "Galle Fort Antiques"
    assert store.whatsapp_number == "94771234567"

    # Test invalid phone rejection in Pydantic model
    with pytest.raises(ValidationError):
        StoreCreate(
            name="Invalid Store",
            whatsapp_number="0115555555"
        )

def test_slugify():
    assert slugify("Ruhunu Spices & Herbs!") == "ruhunu-spices-herbs"
    assert slugify("  Kandy   Kithul  ") == "kandy-kithul"

def test_product_validation_rules():
    # Valid product
    prod = ProductCreate(
        title="Pure Cinnamon (100g)",
        price=850.0,
        category="Spices",
        stock=20
    )
    assert prod.price == 850.0
    assert prod.stock == 20
    assert prod.category == "Spices"

    # Price must be > 0
    with pytest.raises(ValidationError):
        ProductCreate(
            title="Zero Price Product",
            price=0.0,
            category="Spices",
            stock=10
        )

    # Stock must be >= 0
    with pytest.raises(ValidationError):
        ProductCreate(
            title="Negative Stock Product",
            price=100.0,
            category="Spices",
            stock=-5
        )

def test_stock_badges():
    assert ProductResponse.compute_badge(stock=0, is_available=True) == StockBadge.OUT_OF_STOCK
    assert ProductResponse.compute_badge(stock=10, is_available=False) == StockBadge.OUT_OF_STOCK
    assert ProductResponse.compute_badge(stock=3, is_available=True) == StockBadge.LOW_STOCK
    assert ProductResponse.compute_badge(stock=15, is_available=True) == StockBadge.IN_STOCK

def test_qr_code_generation():
    test_url = "http://localhost:3000/store/ruhunu-spices"
    png_bytes = generate_qr_image_bytes(test_url)
    assert len(png_bytes) > 0
    assert png_bytes.startswith(b"\x89PNG")  # PNG Magic Number

    data_url = generate_qr_data_url(test_url)
    assert data_url.startswith("data:image/png;base64,")

def test_order_calculator_and_whatsapp_generation():
    store = {
        "name": "Ruhunu Spices",
        "whatsapp_number": "94771234567"
    }
    products = {
        "prod-1": {
            "title": "Ceylon Cinnamon (100g)",
            "price": 850.0,
            "stock": 10,
            "is_available": True
        },
        "prod-2": {
            "title": "Village Curry Powder (250g)",
            "price": 450.0,
            "stock": 20,
            "is_available": True
        }
    }
    items = [
        OrderItemInput(product_id="prod-1", quantity=2),
        OrderItemInput(product_id="prod-2", quantity=1)
    ]

    res = process_order_calculation(
        store=store,
        products_by_id=products,
        requested_items=items,
        customer_name="Kasun Perera",
        customer_phone="0712345678",
        delivery_notes="Near Galle Face, Colombo"
    )

    expected_total = (850.0 * 2) + 450.0  # 2150.0
    assert res.total_amount == expected_total
    assert res.has_stock_issues is False
    assert len(res.items) == 2
    assert "https://wa.me/94771234567?text=" in res.whatsapp_checkout_url
    assert "Kasun Perera" in res.formatted_whatsapp_message
    assert "Rs. 2,150.00" in res.formatted_whatsapp_message

def test_order_calculator_with_stock_warnings():
    store = {"name": "Test Store", "whatsapp_number": "94771234567"}
    products = {
        "prod-1": {
            "title": "Out of Stock Item",
            "price": 500.0,
            "stock": 0,
            "is_available": False
        },
        "prod-2": {
            "title": "Low Stock Item",
            "price": 200.0,
            "stock": 2,
            "is_available": True
        }
    }
    items = [
        OrderItemInput(product_id="prod-1", quantity=1),
        OrderItemInput(product_id="prod-2", quantity=5)  # requests 5 but only 2 available
    ]

    res = process_order_calculation(
        store=store,
        products_by_id=products,
        requested_items=items
    )

    assert res.has_stock_issues is True
    assert len(res.stock_warnings) == 2
    assert "Out of Stock" in res.stock_warnings[0]
    assert "only has 2 items left in stock" in res.stock_warnings[1]

def test_ai_copywriter_and_category_heuristics():
    # Pitch generator
    pitch, highlights = generate_local_marketing_pitch(
        title="Pure Kithul Treacle",
        keywords="organic, low sugar, traditional tapping"
    )
    assert "Pure Kithul Treacle" in pitch
    assert "organic" in pitch
    assert len(highlights) >= 2

    # Categorization
    cat, alts, conf = suggest_category_locally("Ceylon Alba Cinnamon Sticks")
    assert cat == "Spices"

    cat2, alts2, conf2 = suggest_category_locally("Pure Kithul Treacle Bottle")
    assert cat2 == "Sweets"

    cat3, alts3, conf3 = suggest_category_locally("Homemade Katta Sambol")
    assert cat3 == "Homemade"
