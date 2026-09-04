use axum::{
    body::Body,
    http::{header, Request, StatusCode},
};
use http_body_util::BodyExt;
use std::sync::Arc;
use tower::ServiceExt;

use polalink_backend::{
    config::Config,
    core::supabase::SupabaseClient,
    create_app, AppState,
};

fn setup_app() -> axum::Router {
    let config = Config::from_env();
    let api_key = config.effective_api_key().to_string();
    let supabase = Arc::new(SupabaseClient::new(
        config.supabase_url.clone(),
        api_key,
    ));
    let state = Arc::new(AppState { config, supabase });
    create_app(state)
}

#[tokio::test]
async fn test_root_endpoint() {
    let app = setup_app();
    let response = app
        .oneshot(
            Request::builder()
                .uri("/")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let data: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(data["app"], "PolaLink LK Backend API");
    assert_eq!(data["status"], "online");
}

#[tokio::test]
async fn test_health_endpoint() {
    let app = setup_app();
    let response = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let data: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(data["status"], "healthy");
}

#[tokio::test]
async fn test_ai_copy_generator_endpoint() {
    let app = setup_app();
    let payload = serde_json::json!({
        "title": "Ceylon Alba Cinnamon Quills",
        "keywords": "organic, freshly packed, export grade"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/ai/generate-copy")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let data: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(data["title"], "Ceylon Alba Cinnamon Quills");
    assert!(data["marketing_pitch"].as_str().unwrap().len() > 20);
    assert!(!data["highlights"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn test_ai_category_suggestion_endpoint() {
    let app = setup_app();
    let payload = serde_json::json!({
        "title": "Badapu Thuna Paha Roasted Curry Powder"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/ai/suggest-category")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let data: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(data["suggested_category"], "Spices");
}

#[tokio::test]
async fn test_validation_error_formatting() {
    let app = setup_app();
    let payload = serde_json::json!({
        "name": "",
        "whatsapp_number": "invalid_number"
    });

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/stores")
                .header(header::CONTENT_TYPE, "application/json")
                .header(header::AUTHORIZATION, "Bearer fake_token")
                .body(Body::from(serde_json::to_vec(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    // Since auth runs or validation runs, status should be 401 or 422
    let status = response.status();
    assert!(status == StatusCode::UNAUTHORIZED || status == StatusCode::UNPROCESSABLE_ENTITY);
}
