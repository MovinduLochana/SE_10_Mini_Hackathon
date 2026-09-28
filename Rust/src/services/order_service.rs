use std::collections::HashMap;
use serde_json::Value;
use crate::models::order::{
    CalculatedOrderItem, OrderCalculateResponse, OrderItemInput,
};

pub fn format_lkr(amount: f64) -> String {
    let int_part = amount.floor() as i64;
    let cents = ((amount - int_part as f64) * 100.0).round() as i64;
    let s = int_part.abs().to_string();
    let mut formatted_int = String::new();
    let len = s.len();
    for (i, c) in s.chars().enumerate() {
        if i > 0 && (len - i).is_multiple_of(3) {
            formatted_int.push(',');
        }
        formatted_int.push(c);
    }
    format!("Rs. {formatted_int}.{cents:02}")
}

pub fn build_whatsapp_order_message(
    store_name: &str,
    customer_name: &str,
    customer_phone: &str,
    delivery_notes: &str,
    items: &[CalculatedOrderItem],
    total_amount: f64,
) -> String {
    let mut lines = vec![
        format!("*New Order for {store_name}*"),
        "━━━━━━━━━━━━━━━━━━━━━━".to_string(),
    ];

    if !customer_name.trim().is_empty() {
        lines.push(format!("*Customer:* {}", customer_name.trim()));
    }
    if !customer_phone.trim().is_empty() {
        lines.push(format!("*Contact:* {}", customer_phone.trim()));
    }

    lines.push(String::new());
    lines.push("*Ordered Items:*".to_string());
    for item in items {
        lines.push(format!(
            "• {}x {} — {}",
            item.quantity,
            item.title,
            format_lkr(item.subtotal)
        ));
    }

    lines.push("━━━━━━━━━━━━━━━━━━━━━━".to_string());
    lines.push(format!("*Total Amount:* {}", format_lkr(total_amount)));

    if !delivery_notes.trim().is_empty() {
        lines.push(String::new());
        lines.push(format!("*Delivery / Notes:* {}", delivery_notes.trim()));
    }

    lines.push("━━━━━━━━━━━━━━━━━━━━━━".to_string());
    lines.push("```Sent via StallFront```".to_string());

    lines.join("\n")
}

pub fn generate_whatsapp_url(phone_number: &str, message: &str) -> String {
    let clean_phone: String = phone_number
        .chars()
        .filter(|c| *c != '+' && *c != ' ' && *c != '-')
        .collect();
    let encoded = urlencoding::encode(message);
    format!("https://wa.me/{clean_phone}?text={encoded}")
}

pub fn process_order_calculation(
    store: &Value,
    products_by_id: &HashMap<String, Value>,
    requested_items: &[OrderItemInput],
    customer_name: &str,
    customer_phone: &str,
    delivery_notes: &str,
) -> OrderCalculateResponse {
    let mut calculated_items = Vec::new();
    let mut total_amount = 0.0;
    let mut has_stock_issues = false;
    let mut stock_warnings = Vec::new();

    for item in requested_items {
        let product = products_by_id.get(&item.product_id);
        if product.is_none() {
            has_stock_issues = true;
            stock_warnings.push(format!(
                "Product ID '{}' was not found in this catalog.",
                item.product_id
            ));
            continue;
        }

        let prod = product.unwrap();
        let title = prod.get("title").and_then(|v| v.as_str()).unwrap_or("Unknown Product").to_string();
        let price = prod.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let available_stock = prod.get("stock").and_then(|v| v.as_i64()).unwrap_or(0);
        let is_available = prod.get("is_available").and_then(|v| v.as_bool()).unwrap_or(true);

        let is_sufficient = is_available && (available_stock >= item.quantity);
        if !is_sufficient {
            has_stock_issues = true;
            if !is_available || available_stock <= 0 {
                stock_warnings.push(format!("'{title}' is currently marked Out of Stock."));
            } else {
                stock_warnings.push(format!(
                    "'{title}' only has {available_stock} items left in stock (requested {}).",
                    item.quantity
                ));
            }
        }

        let line_subtotal = ((price * item.quantity as f64) * 100.0).round() / 100.0;
        total_amount += line_subtotal;

        calculated_items.push(CalculatedOrderItem {
            product_id: item.product_id.clone(),
            title,
            unit_price: price,
            quantity: item.quantity,
            subtotal: line_subtotal,
            available_stock,
            is_sufficient,
        });
    }

    let store_name = store
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("PolaLink Store");
    let whatsapp_number = store
        .get("whatsapp_number")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let final_total = (total_amount * 100.0).round() / 100.0;

    let formatted_msg = build_whatsapp_order_message(
        store_name,
        customer_name,
        customer_phone,
        delivery_notes,
        &calculated_items,
        final_total,
    );

    let whatsapp_url = generate_whatsapp_url(whatsapp_number, &formatted_msg);

    OrderCalculateResponse {
        store_name: store_name.to_string(),
        whatsapp_number: whatsapp_number.to_string(),
        items: calculated_items,
        total_amount: final_total,
        currency: "LKR".to_string(),
        has_stock_issues,
        stock_warnings,
        whatsapp_checkout_url: whatsapp_url,
        formatted_whatsapp_message: formatted_msg,
    }
}
