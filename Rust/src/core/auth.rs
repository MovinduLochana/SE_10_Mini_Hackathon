use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticatedUser {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(default)]
    pub metadata: Value,
}

pub struct OptionalUser(pub Option<AuthenticatedUser>);

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync + AsRef<crate::AppState>,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|h| h.to_str().ok());

        let token = match auth_header {
            Some(val) if val.starts_with("Bearer ") => val.trim_start_matches("Bearer ").trim(),
            _ => {
                return Err(AppError::unauthorized(
                    "Authentication token is missing. Please provide a Bearer token in the Authorization header.",
                ));
            }
        };

        if token.is_empty() {
            return Err(AppError::unauthorized(
                "Authentication token is missing. Please provide a Bearer token in the Authorization header.",
            ));
        }

        let app_state = state.as_ref();
        let user_val = app_state.supabase.auth_get_user(token).await?;

        let id = user_val
            .get("id")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::unauthorized("Invalid or expired authentication token."))?
            .to_string();

        let email = user_val
            .get("email")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let metadata = user_val
            .get("user_metadata")
            .cloned()
            .unwrap_or_else(|| serde_json::json!({}));

        Ok(AuthenticatedUser {
            id,
            email,
            token: Some(token.to_string()),
            metadata,
        })
    }
}

impl<S> FromRequestParts<S> for OptionalUser
where
    S: Send + Sync + AsRef<crate::AppState>,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        match AuthenticatedUser::from_request_parts(parts, state).await {
            Ok(user) => Ok(OptionalUser(Some(user))),
            Err(_) => Ok(OptionalUser(None)),
        }
    }
}
