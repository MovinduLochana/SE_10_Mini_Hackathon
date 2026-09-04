use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::{
    core::auth::AuthenticatedUser,
    error::AppError,
    AppState,
};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/signup", post(signup_handler))
        .route("/login", post(login_handler))
        .route("/me", get(me_handler))
}

#[derive(Debug, Deserialize)]
pub struct AuthCredentials {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub user_id: String,
    pub email: String,
}

async fn signup_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthCredentials>,
) -> Result<(StatusCode, Json<AuthTokenResponse>), AppError> {
    let res = state.supabase.auth_sign_up(&payload.email, &payload.password).await?;

    let user_id = res
        .pointer("/user/id")
        .or_else(|| res.get("id"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::bad_request("Could not create user account."))?
        .to_string();

    let email = res
        .pointer("/user/email")
        .or_else(|| res.get("email"))
        .and_then(|v| v.as_str())
        .unwrap_or(&payload.email)
        .to_string();

    let access_token = res
        .pointer("/session/access_token")
        .or_else(|| res.get("access_token"))
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok((
        StatusCode::CREATED,
        Json(AuthTokenResponse {
            access_token,
            token_type: "bearer".to_string(),
            user_id,
            email,
        }),
    ))
}

async fn login_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthCredentials>,
) -> Result<Json<AuthTokenResponse>, AppError> {
    let res = state.supabase.auth_sign_in(&payload.email, &payload.password).await?;

    let user_id = res
        .pointer("/user/id")
        .or_else(|| res.get("id"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::unauthorized("Invalid email or password."))?
        .to_string();

    let email = res
        .pointer("/user/email")
        .or_else(|| res.get("email"))
        .and_then(|v| v.as_str())
        .unwrap_or(&payload.email)
        .to_string();

    let access_token = res
        .get("access_token")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok(Json(AuthTokenResponse {
        access_token,
        token_type: "bearer".to_string(),
        user_id,
        email,
    }))
}

async fn me_handler(
    user: AuthenticatedUser,
) -> Json<Value> {
    Json(json!({
        "user_id": user.id,
        "email": user.email,
        "metadata": user.metadata
    }))
}
