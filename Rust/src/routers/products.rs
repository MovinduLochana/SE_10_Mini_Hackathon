use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde_json::Value;
use std::sync::Arc;

use crate::{
    core::auth::AuthenticatedUser,
    error::AppError,
    models::product::{
        ProductCreate, ProductFilterParams, ProductResponse, ProductStockAdjust,
        ProductToggleStatus, ProductUpdate, StockBadge,
    },
    AppState,
};

pub fn stores_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/{slug}/products", get(get_public_products))
        .route("/{slug}/products", post(add_product))
        .route("/{slug}/inventory", get(get_merchant_inventory))
}

pub fn product_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/{id}", patch(update_product_details))
        .route("/{id}", delete(delete_product))
        .route("/{id}/stock", patch(adjust_product_stock))
        .route("/{id}/toggle-status", patch(toggle_product_availability))
}

pub fn format_product_response(item: &Value) -> Result<ProductResponse, AppError> {
    let id = item.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let store_id = item.get("store_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let title = item.get("title").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let description = item.get("description").and_then(|v| v.as_str()).map(|s| s.to_string());
    let price = item.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let category = item.get("category").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let stock = item.get("stock").and_then(|v| v.as_i64()).unwrap_or(0);
    let image_url = item.get("image_url").and_then(|v| v.as_str()).map(|s| s.to_string());
    let is_available = item.get("is_available").and_then(|v| v.as_bool()).unwrap_or(true);
    let badge = StockBadge::compute(stock, is_available);
    let created_at = item.get("created_at").and_then(|v| v.as_str()).map(|s| s.to_string());
    let updated_at = item.get("updated_at").and_then(|v| v.as_str()).map(|s| s.to_string());

    Ok(ProductResponse {
        id,
        store_id,
        title,
        description,
        price,
        category,
        stock,
        image_url,
        is_available,
        stock_badge: badge,
        created_at,
        updated_at,
    })
}

async fn verify_product_ownership(
    state: &AppState,
    product_id: &str,
    user_id: &str,
    token: Option<&str>,
) -> Result<Value, AppError> {
    let prod_res = state
        .supabase
        .table_select("products", &[("id", &format!("eq.{product_id}"))], token)
        .await?;

    let prod = prod_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Product not found."))?;

    let store_id = prod
        .get("store_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::forbidden("Product has no associated store."))?;

    let store_res = state
        .supabase
        .table_select("stores", &[("id", &format!("eq.{store_id}"))], token)
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::forbidden("Associated store not found."))?;

    let owner_id = store.get("user_id").and_then(|v| v.as_str()).unwrap_or("");
    if owner_id != user_id {
        return Err(AppError::forbidden(
            "You do not have permission to modify this product.",
        ));
    }

    Ok(prod)
}

async fn get_public_products(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    Query(params): Query<ProductFilterParams>,
) -> Result<Json<Vec<ProductResponse>>, AppError> {
    let store_res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{slug}"))], None)
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found(format!("Store with slug '{slug}' not found.")))?;

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");

    let mut query_pairs: Vec<(String, String)> = vec![
        ("store_id".to_string(), format!("eq.{store_id}")),
    ];

    if let Some(cat) = params.category {
        let trimmed = cat.trim();
        if !trimmed.is_empty() {
            query_pairs.push(("category".to_string(), format!("ilike.*{trimmed}*")));
        }
    }

    if let Some(term) = params.search {
        let trimmed = term.trim();
        if !trimmed.is_empty() {
            query_pairs.push(("or".to_string(), format!("(title.ilike.*{trimmed}*,description.ilike.*{trimmed}*)")));
        }
    }

    if let Some(min_p) = params.min_price {
        query_pairs.push(("price".to_string(), format!("gte.{min_p}")));
    }
    if let Some(max_p) = params.max_price {
        query_pairs.push(("price".to_string(), format!("lte.{max_p}")));
    }

    if params.in_stock_only.unwrap_or(false) {
        query_pairs.push(("is_available".to_string(), "eq.true".to_string()));
        query_pairs.push(("stock".to_string(), "gt.0".to_string()));
    }

    match params.sort_by.as_deref() {
        Some("price_asc") => query_pairs.push(("order".to_string(), "price.asc".to_string())),
        Some("price_desc") => query_pairs.push(("order".to_string(), "price.desc".to_string())),
        Some("newest") => query_pairs.push(("order".to_string(), "created_at.desc".to_string())),
        _ => query_pairs.push(("order".to_string(), "created_at.asc".to_string())),
    }

    let pairs_ref: Vec<(&str, &str)> = query_pairs
        .iter()
        .map(|(k, v)| (k.as_str(), v.as_str()))
        .collect();

    let res = state.supabase.table_select("products", &pairs_ref, None).await?;

    let mut products = Vec::new();
    for p in res {
        products.push(format_product_response(&p)?);
    }

    Ok(Json(products))
}

async fn get_merchant_inventory(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<ProductResponse>>, AppError> {
    let store_res = state
        .supabase
        .table_select(
            "stores",
            &[("slug", &format!("eq.{slug}"))],
            user.token.as_deref(),
        )
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Store not found."))?;

    let owner_id = store.get("user_id").and_then(|v| v.as_str()).unwrap_or("");
    if owner_id != user.id {
        return Err(AppError::forbidden(
            "You do not have permission to view this inventory.",
        ));
    }

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");
    let res = state
        .supabase
        .table_select(
            "products",
            &[
                ("store_id", &format!("eq.{store_id}")),
                ("order", "created_at.desc"),
            ],
            user.token.as_deref(),
        )
        .await?;

    let mut products = Vec::new();
    for p in res {
        products.push(format_product_response(&p)?);
    }

    Ok(Json(products))
}

async fn add_product(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    user: AuthenticatedUser,
    Json(mut payload): Json<ProductCreate>,
) -> Result<(StatusCode, Json<ProductResponse>), AppError> {
    payload.validate_and_normalize()?;

    let store_res = state
        .supabase
        .table_select(
            "stores",
            &[("slug", &format!("eq.{slug}"))],
            user.token.as_deref(),
        )
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Store not found."))?;

    let owner_id = store.get("user_id").and_then(|v| v.as_str()).unwrap_or("");
    if owner_id != user.id {
        return Err(AppError::forbidden(
            "You do not have permission to add products to this store.",
        ));
    }

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");
    let is_avail = payload.is_available && (payload.stock > 0);

    let insert_data = serde_json::json!({
        "store_id": store_id,
        "title": payload.title,
        "description": payload.description.unwrap_or_default(),
        "price": payload.price,
        "category": payload.category,
        "stock": payload.stock,
        "image_url": payload.image_url.unwrap_or_default(),
        "is_available": is_avail,
    });

    let res = state
        .supabase
        .table_insert("products", &insert_data, user.token.as_deref())
        .await?;

    let new_prod = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to create product."))?;

    Ok((StatusCode::CREATED, Json(format_product_response(&new_prod)?)))
}

async fn update_product_details(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<String>,
    user: AuthenticatedUser,
    Json(mut payload): Json<ProductUpdate>,
) -> Result<Json<ProductResponse>, AppError> {
    payload.validate_and_normalize()?;

    let _existing = verify_product_ownership(&state, &product_id, &user.id, user.token.as_deref()).await?;

    let mut update_json = serde_json::Map::new();
    if let Some(title) = payload.title {
        update_json.insert("title".to_string(), serde_json::json!(title));
    }
    if let Some(desc) = payload.description {
        update_json.insert("description".to_string(), serde_json::json!(desc));
    }
    if let Some(price) = payload.price {
        update_json.insert("price".to_string(), serde_json::json!(price));
    }
    if let Some(cat) = payload.category {
        update_json.insert("category".to_string(), serde_json::json!(cat));
    }
    if let Some(stock) = payload.stock {
        update_json.insert("stock".to_string(), serde_json::json!(stock));
        if stock == 0 {
            update_json.insert("is_available".to_string(), serde_json::json!(false));
        }
    }
    if let Some(img) = payload.image_url {
        update_json.insert("image_url".to_string(), serde_json::json!(img));
    }
    if let Some(avail) = payload.is_available {
        update_json.insert("is_available".to_string(), serde_json::json!(avail));
    }

    if update_json.is_empty() {
        let current = state
            .supabase
            .table_select("products", &[("id", &format!("eq.{product_id}"))], user.token.as_deref())
            .await?;
        let prod = current.into_iter().next().ok_or_else(|| AppError::not_found("Product not found."))?;
        return Ok(Json(format_product_response(&prod)?));
    }

    let res = state
        .supabase
        .table_update(
            "products",
            &[("id", &format!("eq.{product_id}"))],
            &Value::Object(update_json),
            user.token.as_deref(),
        )
        .await?;

    let updated = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to update product."))?;

    Ok(Json(format_product_response(&updated)?))
}

async fn adjust_product_stock(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<String>,
    user: AuthenticatedUser,
    Json(payload): Json<ProductStockAdjust>,
) -> Result<Json<ProductResponse>, AppError> {
    let prod = verify_product_ownership(&state, &product_id, &user.id, user.token.as_deref()).await?;

    let current_stock = prod.get("stock").and_then(|v| v.as_i64()).unwrap_or(0);

    let target_stock = if let Some(new_s) = payload.new_stock {
        if new_s < 0 {
            return Err(AppError::validation("new_stock", "Stock must be non-negative"));
        }
        new_s
    } else if let Some(adj) = payload.adjustment {
        (current_stock + adj).max(0)
    } else {
        return Err(AppError::bad_request("Either 'adjustment' or 'new_stock' must be provided."));
    };

    let mut is_avail = prod.get("is_available").and_then(|v| v.as_bool()).unwrap_or(true);
    if target_stock == 0 {
        is_avail = false;
    } else if target_stock > 0 && !is_avail && payload.adjustment.map(|a| a > 0).unwrap_or(false) {
        is_avail = true;
    }

    let update_body = serde_json::json!({
        "stock": target_stock,
        "is_available": is_avail
    });

    let res = state
        .supabase
        .table_update(
            "products",
            &[("id", &format!("eq.{product_id}"))],
            &update_body,
            user.token.as_deref(),
        )
        .await?;

    let updated = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to update stock."))?;

    Ok(Json(format_product_response(&updated)?))
}

async fn toggle_product_availability(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<String>,
    user: AuthenticatedUser,
    Json(payload): Json<ProductToggleStatus>,
) -> Result<Json<ProductResponse>, AppError> {
    let _prod = verify_product_ownership(&state, &product_id, &user.id, user.token.as_deref()).await?;

    let res = state
        .supabase
        .table_update(
            "products",
            &[("id", &format!("eq.{product_id}"))],
            &serde_json::json!({ "is_available": payload.is_available }),
            user.token.as_deref(),
        )
        .await?;

    let updated = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to toggle product status."))?;

    Ok(Json(format_product_response(&updated)?))
}

async fn delete_product(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<String>,
    user: AuthenticatedUser,
) -> Result<StatusCode, AppError> {
    let _prod = verify_product_ownership(&state, &product_id, &user.id, user.token.as_deref()).await?;

    state
        .supabase
        .table_delete(
            "products",
            &[("id", &format!("eq.{product_id}"))],
            user.token.as_deref(),
        )
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
