use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde_json::Value;
use std::{collections::HashMap, sync::Arc};

use crate::{
    core::auth::AuthenticatedUser,
    error::AppError,
    models::order::{
        OrderCalculateRequest, OrderCalculateResponse, OrderCreateRequest,
        OrderRecordResponse,
    },
    services::order_service::process_order_calculation,
    AppState,
};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/calculate", post(calculate_order))
        .route("/", post(create_order))
        .route("/store/{slug}", get(get_store_orders))
}

async fn calculate_order(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<OrderCalculateRequest>,
) -> Result<Json<OrderCalculateResponse>, AppError> {
    if payload.items.is_empty() {
        return Err(AppError::bad_request("Cart cannot be empty."));
    }

    let store_res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{}", payload.store_slug))], None)
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found(format!("Store with slug '{}' not found.", payload.store_slug)))?;

    let product_ids: Vec<String> = payload.items.iter().map(|i| i.product_id.clone()).collect();
    let in_clause = format!("in.({})", product_ids.join(","));

    let products_res = state
        .supabase
        .table_select("products", &[("id", &in_clause)], None)
        .await?;

    let mut products_by_id = HashMap::new();
    for p in products_res {
        if let Some(id) = p.get("id").and_then(|v| v.as_str()) {
            products_by_id.insert(id.to_string(), p);
        }
    }

    let calculation = process_order_calculation(
        &store,
        &products_by_id,
        &payload.items,
        payload.customer_name.as_deref().unwrap_or(""),
        payload.customer_phone.as_deref().unwrap_or(""),
        payload.delivery_notes.as_deref().unwrap_or(""),
    );

    Ok(Json(calculation))
}

async fn create_order(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<OrderCreateRequest>,
) -> Result<(StatusCode, Json<OrderRecordResponse>), AppError> {
    if payload.items.is_empty() {
        return Err(AppError::bad_request("Cart cannot be empty."));
    }

    let store_res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{}", payload.store_slug))], None)
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Store not found."))?;

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");

    let product_ids: Vec<String> = payload.items.iter().map(|i| i.product_id.clone()).collect();
    let in_clause = format!("in.({})", product_ids.join(","));

    let products_res = state
        .supabase
        .table_select("products", &[("id", &in_clause)], None)
        .await?;

    let mut products_by_id = HashMap::new();
    for p in products_res {
        if let Some(id) = p.get("id").and_then(|v| v.as_str()) {
            products_by_id.insert(id.to_string(), p);
        }
    }

    let calc = process_order_calculation(
        &store,
        &products_by_id,
        &payload.items,
        payload.customer_name.as_deref().unwrap_or(""),
        payload.customer_phone.as_deref().unwrap_or(""),
        payload.delivery_notes.as_deref().unwrap_or(""),
    );

    let customer_name = payload.customer_name.unwrap_or_else(|| "Guest Customer".to_string());
    let customer_phone = payload.customer_phone.unwrap_or_default();
    let delivery_notes = payload.delivery_notes.unwrap_or_default();

    let order_insert = serde_json::json!({
        "store_id": store_id,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "total_amount": calc.total_amount,
        "status": "WHATSAPP_PENDING",
        "delivery_notes": delivery_notes,
    });

    let new_order_res = state
        .supabase
        .table_insert("orders", &order_insert, None)
        .await?;

    let new_order = new_order_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to record order."))?;

    let new_order_id = new_order.get("id").and_then(|v| v.as_str()).unwrap_or("");

    let mut order_items_insert = Vec::new();
    for it in &calc.items {
        order_items_insert.push(serde_json::json!({
            "order_id": new_order_id,
            "product_id": it.product_id,
            "product_title": it.title,
            "quantity": it.quantity,
            "unit_price": it.unit_price,
            "subtotal": it.subtotal,
        }));
    }

    if !order_items_insert.is_empty() {
        let _ = state
            .supabase
            .table_insert("order_items", &Value::Array(order_items_insert), None)
            .await;
    }

    let order_response = OrderRecordResponse {
        id: new_order_id.to_string(),
        store_id: store_id.to_string(),
        customer_name: new_order.get("customer_name").and_then(|v| v.as_str()).map(|s| s.to_string()),
        customer_phone: new_order.get("customer_phone").and_then(|v| v.as_str()).map(|s| s.to_string()),
        total_amount: new_order.get("total_amount").and_then(|v| v.as_f64()).unwrap_or(calc.total_amount),
        status: new_order.get("status").and_then(|v| v.as_str()).unwrap_or("PENDING").to_string(),
        delivery_notes: new_order.get("delivery_notes").and_then(|v| v.as_str()).map(|s| s.to_string()),
        created_at: new_order.get("created_at").and_then(|v| v.as_str()).map(|s| s.to_string()),
    };

    Ok((StatusCode::CREATED, Json(order_response)))
}

async fn get_store_orders(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<OrderRecordResponse>>, AppError> {
    let store_res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{slug}"))], user.token.as_deref())
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Store not found."))?;

    let owner_id = store.get("user_id").and_then(|v| v.as_str()).unwrap_or("");
    if owner_id != user.id {
        return Err(AppError::forbidden(
            "You do not have permission to view this store's orders.",
        ));
    }

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");
    let orders_res = state
        .supabase
        .table_select(
            "orders",
            &[
                ("store_id", &format!("eq.{store_id}")),
                ("order", "created_at.desc"),
            ],
            user.token.as_deref(),
        )
        .await?;

    let mut list = Vec::new();
    for o in orders_res {
        let id = o.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let s_id = o.get("store_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let customer_name = o.get("customer_name").and_then(|v| v.as_str()).map(|s| s.to_string());
        let customer_phone = o.get("customer_phone").and_then(|v| v.as_str()).map(|s| s.to_string());
        let total_amount = o.get("total_amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let status = o.get("status").and_then(|v| v.as_str()).unwrap_or("PENDING").to_string();
        let delivery_notes = o.get("delivery_notes").and_then(|v| v.as_str()).map(|s| s.to_string());
        let created_at = o.get("created_at").and_then(|v| v.as_str()).map(|s| s.to_string());

        list.push(OrderRecordResponse {
            id,
            store_id: s_id,
            customer_name,
            customer_phone,
            total_amount,
            status,
            delivery_notes,
            created_at,
        });
    }

    Ok(Json(list))
}
