pub mod config;
pub mod error;
pub mod core;
pub mod models;
pub mod services;
pub mod routers;

use axum::Router;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

use crate::{
    config::Config,
    core::supabase::SupabaseClient,
};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub supabase: Arc<SupabaseClient>,
}

pub fn create_app(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::permissive();

    let stores_router = routers::stores::router().merge(routers::products::stores_routes());

    Router::new()
        .merge(routers::root::router())
        .nest("/api/auth", routers::auth::router())
        .nest("/api/stores", stores_router)
        .nest("/api/products", routers::products::product_routes())
        .nest("/api/orders", routers::orders::router())
        .nest("/api/ai", routers::ai::router())
        .layer(cors)
        .with_state(state)
}
