use axum::{extract::State, routing::get, Json, Router};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
}

async fn root_handler(State(state): State<Arc<AppState>>) -> Json<Value> {
    Json(json!({
        "app": "PolaLink LK Backend API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
        "frontend_target": state.config.frontend_url
    }))
}

async fn health_handler(State(state): State<Arc<AppState>>) -> Json<Value> {
    let (connected, message) = state.supabase.health_check().await;
    Json(json!({
        "status": "healthy",
        "supabase_connected": connected,
        "supabase_message": message
    }))
}
