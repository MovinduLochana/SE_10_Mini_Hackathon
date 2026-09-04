import urllib.parse
from typing import List, Dict, Any, Tuple
from app.models.order import (
    OrderItemInput,
    CalculatedOrderItem,
    OrderCalculateResponse
)

def format_lkr(amount: float) -> str:
    """Formats a float into Sri Lankan Rupee currency string e.g. Rs. 1,250.00"""
    return f"Rs. {amount:,.2f}"

def build_whatsapp_order_message(
    store_name: str,
    customer_name: str,
    customer_phone: str,
    delivery_notes: str,
    items: List[CalculatedOrderItem],
    total_amount: float
) -> str:
    """
    Constructs a readable, polite Sri Lankan WhatsApp checkout message.
    """
    lines = [
        f"🛍️ *New Order for {store_name}*",
        "━━━━━━━━━━━━━━━━━━━━━━"
    ]

    if customer_name:
        lines.append(f"👤 *Customer:* {customer_name.strip()}")
    if customer_phone:
        lines.append(f"📞 *Contact:* {customer_phone.strip()}")

    lines.append("")
    lines.append("*Ordered Items:*")
    for item in items:
        lines.append(f"• {item.quantity}x {item.title} — {format_lkr(item.subtotal)}")

    lines.append("━━━━━━━━━━━━━━━━━━━━━━")
    lines.append(f"💰 *Total Amount:* {format_lkr(total_amount)}")

    if delivery_notes and delivery_notes.strip():
        lines.append("")
        lines.append(f"📍 *Delivery / Notes:* {delivery_notes.strip()}")

    lines.append("━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("_Sent via PolaLink LK_ 🇱🇰")

    return "\n".join(lines)

def generate_whatsapp_url(phone_number: str, message: str) -> str:
    """
    Builds a direct WhatsApp Click-to-Chat URL: https://wa.me/<phone>?text=<encoded_message>
    Ensures phone number has no leading '+' or spaces.
    """
    clean_phone = phone_number.replace("+", "").replace(" ", "").replace("-", "")
    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_text}"

def process_order_calculation(
    store: Dict[str, Any],
    products_by_id: Dict[str, Dict[str, Any]],
    requested_items: List[OrderItemInput],
    customer_name: str = "",
    customer_phone: str = "",
    delivery_notes: str = ""
) -> OrderCalculateResponse:
    """
    Validates items, stock availability, computes line totals and grand total in LKR,
    and returns a ready-to-use WhatsApp checkout URL.
    """
    calculated_items: List[CalculatedOrderItem] = []
    total_amount = 0.0
    has_stock_issues = False
    stock_warnings: List[str] = []

    for item in requested_items:
        product = products_by_id.get(str(item.product_id))
        if not product:
            has_stock_issues = True
            stock_warnings.append(f"Product ID '{item.product_id}' was not found in this catalog.")
            continue

        title = product.get("title", "Unknown Product")
        price = float(product.get("price", 0.0))
        available_stock = int(product.get("stock", 0))
        is_available = bool(product.get("is_available", True))

        is_sufficient = is_available and (available_stock >= item.quantity)
        if not is_sufficient:
            has_stock_issues = True
            if not is_available or available_stock <= 0:
                stock_warnings.append(f"'{title}' is currently marked Out of Stock.")
            else:
                stock_warnings.append(f"'{title}' only has {available_stock} items left in stock (requested {item.quantity}).")

        line_subtotal = round(price * item.quantity, 2)
        total_amount += line_subtotal

        calculated_items.append(
            CalculatedOrderItem(
                product_id=str(item.product_id),
                title=title,
                unit_price=price,
                quantity=item.quantity,
                subtotal=line_subtotal,
                available_stock=available_stock,
                is_sufficient=is_sufficient
            )
        )

    store_name = store.get("name", "PolaLink Store")
    whatsapp_number = store.get("whatsapp_number", "")

    formatted_msg = build_whatsapp_order_message(
        store_name=store_name,
        customer_name=customer_name or "",
        customer_phone=customer_phone or "",
        delivery_notes=delivery_notes or "",
        items=calculated_items,
        total_amount=round(total_amount, 2)
    )

    whatsapp_url = generate_whatsapp_url(whatsapp_number, formatted_msg)

    return OrderCalculateResponse(
        store_name=store_name,
        whatsapp_number=whatsapp_number,
        items=calculated_items,
        total_amount=round(total_amount, 2),
        currency="LKR",
        has_stock_issues=has_stock_issues,
        stock_warnings=stock_warnings,
        whatsapp_checkout_url=whatsapp_url,
        formatted_whatsapp_message=formatted_msg
    )
