use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, patch, post},
    Json, Router,
};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    core::auth::AuthenticatedUser,
    error::AppError,
    models::store::{slugify, StoreCreate, StoreResponse, StoreUpdate},
    services::qr_service::{generate_qr_data_url, generate_qr_image_bytes},
    AppState,
};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(onboard_store))
        .route("/my/stores", get(get_my_stores))
        .route("/{slug}", get(get_store_by_slug))
        .route("/{slug}/qr", get(get_store_qr_code))
        .route("/{slug}", patch(update_store))
}

pub fn build_store_response(store_data: &Value, frontend_url: &str) -> Result<StoreResponse, AppError> {
    let slug = store_data.get("slug").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let frontend_base = frontend_url.trim_end_matches('/');
    let store_url = format!("{frontend_base}/store/{slug}");
    let qr_data_url = generate_qr_data_url(&store_url).ok();

    Ok(StoreResponse {
        id: store_data.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        user_id: store_data.get("user_id").and_then(|v| v.as_str()).map(|s| s.to_string()),
        name: store_data.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        slug,
        whatsapp_number: store_data.get("whatsapp_number").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        description: store_data.get("description").and_then(|v| v.as_str()).map(|s| s.to_string()),
        category: store_data.get("category").and_then(|v| v.as_str()).map(|s| s.to_string()),
        location: store_data.get("location").and_then(|v| v.as_str()).map(|s| s.to_string()),
        logo_url: store_data.get("logo_url").and_then(|v| v.as_str()).map(|s| s.to_string()),
        owner_name: store_data.get("owner_name").and_then(|v| v.as_str()).map(|s| s.to_string()),
        store_url,
        qr_code_data_url: qr_data_url,
        created_at: store_data.get("created_at").and_then(|v| v.as_str()).map(|s| s.to_string()),
        updated_at: store_data.get("updated_at").and_then(|v| v.as_str()).map(|s| s.to_string()),
    })
}

async fn onboard_store(
    State(state): State<Arc<AppState>>,
    user: AuthenticatedUser,
    Json(mut payload): Json<StoreCreate>,
) -> Result<(StatusCode, Json<StoreResponse>), AppError> {
    payload.validate_and_normalize()?;

    let mut desired_slug = if let Some(slug) = payload.slug {
        slugify(&slug)
    } else {
        slugify(&payload.name)
    };

    if desired_slug.is_empty() {
        desired_slug = format!("store-{}", &Uuid::new_v4().simple().to_string()[..6]);
    }

    // Check slug uniqueness
    let existing = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{desired_slug}"))], None)
        .await?;

    if !existing.is_empty() {
        desired_slug = format!("{desired_slug}-{}", &Uuid::new_v4().simple().to_string()[..4]);
    }

    let mut store_insert = serde_json::json!({
        "user_id": user.id,
        "name": payload.name,
        "slug": desired_slug,
        "whatsapp_number": payload.whatsapp_number,
        "description": payload.description.unwrap_or_default(),
    });

    if let Some(cat) = payload.category {
        store_insert["category"] = serde_json::json!(cat);
    }
    if let Some(loc) = payload.location {
        store_insert["location"] = serde_json::json!(loc);
    }
    if let Some(logo) = payload.logo_url {
        store_insert["logo_url"] = serde_json::json!(logo);
    }
    if let Some(owner) = payload.owner_name {
        store_insert["owner_name"] = serde_json::json!(owner);
    }

    let res = state
        .supabase
        .table_insert("stores", &store_insert, user.token.as_deref())
        .await?;

    let new_store = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to create store record."))?;

    if let Some(mut prod) = payload.initial_product {
        let _ = prod.validate_and_normalize();
        let store_id = new_store.get("id").and_then(|v| v.as_str()).unwrap_or("");
        let is_avail = prod.is_available && prod.stock > 0;
        let prod_insert = serde_json::json!({
            "store_id": store_id,
            "title": prod.title,
            "description": prod.description.unwrap_or_default(),
            "price": prod.price,
            "category": prod.category,
            "stock": prod.stock,
            "image_url": prod.image_url.unwrap_or_default(),
            "is_available": is_avail,
        });
        let _ = state
            .supabase
            .table_insert("products", &prod_insert, user.token.as_deref())
            .await;
    }

    let response = build_store_response(&new_store, &state.config.frontend_url)?;
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_my_stores(
    State(state): State<Arc<AppState>>,
    user: AuthenticatedUser,
) -> Result<Json<Vec<StoreResponse>>, AppError> {
    let res = state
        .supabase
        .table_select(
            "stores",
            &[
                ("user_id", &format!("eq.{}", user.id)),
                ("order", "created_at.desc"),
            ],
            user.token.as_deref(),
        )
        .await?;

    let mut stores = Vec::new();
    for item in res {
        stores.push(build_store_response(&item, &state.config.frontend_url)?);
    }

    Ok(Json(stores))
}

async fn get_store_by_slug(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Json<StoreResponse>, AppError> {
    let res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{slug}"))], None)
        .await?;

    let store = res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found(format!("Store with slug '{slug}' not found.")))?;

    let response = build_store_response(&store, &state.config.frontend_url)?;
    Ok(Json(response))
}

async fn get_store_qr_code(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Response, AppError> {
    let res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{slug}"))], None)
        .await?;

    if res.is_empty() {
        return Err(AppError::not_found(format!("Store with slug '{slug}' not found.")));
    }

    let frontend_base = state.config.frontend_url.trim_end_matches('/');
    let store_url = format!("{frontend_base}/store/{slug}");
    let png_bytes = generate_qr_image_bytes(&store_url)?;

    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, HeaderValue::from_static("image/png"));
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_str(&format!("inline; filename=\"{slug}-polalink-qr.png\""))
            .unwrap_or_else(|_| HeaderValue::from_static("inline")),
    );

    Ok((headers, Body::from(png_bytes)).into_response())
}

async fn update_store(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
    user: AuthenticatedUser,
    Json(mut payload): Json<StoreUpdate>,
) -> Result<Json<StoreResponse>, AppError> {
    payload.validate_and_normalize()?;

    let store_res = state
        .supabase
        .table_select("stores", &[("slug", &format!("eq.{slug}"))], None)
        .await?;

    let store = store_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::not_found("Store not found."))?;

    let owner_id = store.get("user_id").and_then(|v| v.as_str()).unwrap_or("");
    if owner_id != user.id {
        return Err(AppError::forbidden(
            "You do not have permission to update this store.",
        ));
    }

    let store_id = store.get("id").and_then(|v| v.as_str()).unwrap_or("");
    let mut update_json = serde_json::Map::new();

    if let Some(name) = payload.name {
        update_json.insert("name".to_string(), serde_json::json!(name));
    }
    if let Some(phone) = payload.whatsapp_number {
        update_json.insert("whatsapp_number".to_string(), serde_json::json!(phone));
    }
    if let Some(desc) = payload.description {
        update_json.insert("description".to_string(), serde_json::json!(desc));
    }

    if update_json.is_empty() {
        let resp = build_store_response(&store, &state.config.frontend_url)?;
        return Ok(Json(resp));
    }

    let update_res = state
        .supabase
        .table_update(
            "stores",
            &[("id", &format!("eq.{store_id}"))],
            &Value::Object(update_json),
            user.token.as_deref(),
        )
        .await?;

    let updated = update_res
        .into_iter()
        .next()
        .ok_or_else(|| AppError::internal("Failed to update store."))?;

    let response = build_store_response(&updated, &state.config.frontend_url)?;
    Ok(Json(response))
}
