use axum::{extract::State, routing::post, Json, Router};
use std::sync::Arc;

use crate::{
    models::ai::{
        CategorySuggestionRequest, CategorySuggestionResponse, CopyGenerationRequest,
        CopyGenerationResponse,
    },
    services::ai_service::{generate_marketing_copy, suggest_category},
    AppState,
};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/generate-copy", post(generate_copy_handler))
        .route("/suggest-category", post(suggest_category_handler))
}

async fn generate_copy_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CopyGenerationRequest>,
) -> Json<CopyGenerationResponse> {
    let client = reqwest::Client::new();
    let resp = generate_marketing_copy(
        &client,
        &state.config.gemini_api_key,
        &payload.title,
        &payload.keywords,
    )
    .await;
    Json(resp)
}

async fn suggest_category_handler(
    Json(payload): Json<CategorySuggestionRequest>,
) -> Json<CategorySuggestionResponse> {
    let resp = suggest_category(
        &payload.title,
        payload.description.as_deref().unwrap_or(""),
    );
    Json(resp)
}
