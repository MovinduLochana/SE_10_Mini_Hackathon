use axum::{
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidationErrorDetail {
    pub field: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationErrorResponse {
    pub success: bool,
    pub error: String,
    pub message: String,
    pub details: Vec<ValidationErrorDetail>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorDetailResponse {
    pub detail: String,
}

#[derive(Debug)]
pub enum AppError {
    ValidationError(Vec<ValidationErrorDetail>),
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    Internal(String),
}

impl AppError {
    pub fn validation(field: impl Into<String>, message: impl Into<String>) -> Self {
        Self::ValidationError(vec![ValidationErrorDetail {
            field: field.into(),
            message: message.into(),
        }])
    }

    pub fn bad_request(msg: impl Into<String>) -> Self {
        Self::BadRequest(msg.into())
    }

    pub fn unauthorized(msg: impl Into<String>) -> Self {
        Self::Unauthorized(msg.into())
    }

    pub fn forbidden(msg: impl Into<String>) -> Self {
        Self::Forbidden(msg.into())
    }

    pub fn not_found(msg: impl Into<String>) -> Self {
        Self::NotFound(msg.into())
    }

    pub fn internal(msg: impl Into<String>) -> Self {
        Self::Internal(msg.into())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::ValidationError(details) => {
                let body = ValidationErrorResponse {
                    success: false,
                    error: "Validation Error".to_string(),
                    message: "One or more input fields are invalid.".to_string(),
                    details,
                };
                (StatusCode::UNPROCESSABLE_ENTITY, Json(body)).into_response()
            }
            AppError::BadRequest(detail) => {
                (StatusCode::BAD_REQUEST, Json(ErrorDetailResponse { detail })).into_response()
            }
            AppError::Unauthorized(detail) => {
                let mut resp = (StatusCode::UNAUTHORIZED, Json(ErrorDetailResponse { detail })).into_response();
                resp.headers_mut().insert(
                    header::WWW_AUTHENTICATE,
                    HeaderValue::from_static("Bearer"),
                );
                resp
            }
            AppError::Forbidden(detail) => {
                (StatusCode::FORBIDDEN, Json(ErrorDetailResponse { detail })).into_response()
            }
            AppError::NotFound(detail) => {
                (StatusCode::NOT_FOUND, Json(ErrorDetailResponse { detail })).into_response()
            }
            AppError::Internal(detail) => {
                tracing::error!("Internal error: {}", detail);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorDetailResponse { detail }),
                )
                    .into_response()
            }
        }
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Internal(format!("HTTP client error: {err}"))
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::BadRequest(format!("JSON parsing error: {err}"))
    }
}
