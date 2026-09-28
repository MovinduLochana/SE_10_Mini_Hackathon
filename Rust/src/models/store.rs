use regex::Regex;
use serde::{Deserialize, Serialize};
use std::sync::LazyLock;
use crate::error::{AppError, ValidationErrorDetail};

static SL_PHONE_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^(?:\+?94|0)?(7[01245678]\d{7})$").unwrap()
});

static SLUG_CLEAN_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[^\w\s-]").unwrap()
});

static SLUG_DASH_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[\s_-]+").unwrap()
});

pub fn normalize_sl_phone(phone: &str) -> Result<String, AppError> {
    let cleaned: String = phone
        .chars()
        .filter(|c| !c.is_whitespace() && *c != '-' && *c != '(' && *c != ')')
        .collect();

    if let Some(captures) = SL_PHONE_REGEX.captures(&cleaned) {
        if let Some(sub) = captures.get(1) {
            return Ok(format!("94{}", sub.as_str()));
        }
    }

    Err(AppError::ValidationError(vec![ValidationErrorDetail {
        field: "whatsapp_number".to_string(),
        message: "Invalid Sri Lankan mobile number. Must match Sri Lankan mobile prefixes (070, 071, 072, 074, 075, 076, 077, 078) followed by 7 digits.".to_string(),
    }]))
}

pub fn slugify(text: &str) -> String {
    let lower = text.to_lowercase();
    let trimmed = lower.trim();
    let cleaned = SLUG_CLEAN_REGEX.replace_all(trimmed, "");
    let dashed = SLUG_DASH_REGEX.replace_all(&cleaned, "-");
    dashed.trim_matches('-').to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreCreate {
    #[serde(alias = "shopName", alias = "shop_name")]
    pub name: String,

    #[serde(alias = "contact", alias = "whatsappNumber")]
    pub whatsapp_number: String,

    #[serde(default)]
    pub description: Option<String>,

    #[serde(default)]
    pub slug: Option<String>,

    #[serde(default)]
    pub category: Option<String>,

    #[serde(default)]
    pub location: Option<String>,

    #[serde(default, alias = "logoUrl")]
    pub logo_url: Option<String>,

    #[serde(default, alias = "ownerName")]
    pub owner_name: Option<String>,

    #[serde(default)]
    pub initial_product: Option<crate::models::product::ProductCreate>,
}

impl StoreCreate {
    pub fn validate_and_normalize(&mut self) -> Result<(), AppError> {
        let mut errors = Vec::new();

        let trimmed_name = self.name.trim();
        if trimmed_name.len() < 2 || trimmed_name.len() > 100 {
            errors.push(ValidationErrorDetail {
                field: "name".to_string(),
                message: "String should have at least 2 characters and at most 100 characters".to_string(),
            });
        }
        self.name = trimmed_name.to_string();

        match normalize_sl_phone(&self.whatsapp_number) {
            Ok(normalized) => self.whatsapp_number = normalized,
            Err(AppError::ValidationError(errs)) => errors.extend(errs),
            Err(e) => return Err(e),
        }

        if let Some(slug) = &self.slug {
            let s = slugify(slug);
            if s.is_empty() {
                errors.push(ValidationErrorDetail {
                    field: "slug".to_string(),
                    message: "Invalid slug format.".to_string(),
                });
            } else {
                self.slug = Some(s);
            }
        }

        if !errors.is_empty() {
            return Err(AppError::ValidationError(errors));
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StoreUpdate {
    #[serde(default)]
    pub name: Option<String>,

    #[serde(default, alias = "contact", alias = "whatsappNumber")]
    pub whatsapp_number: Option<String>,

    #[serde(default)]
    pub description: Option<String>,
}

impl StoreUpdate {
    pub fn validate_and_normalize(&mut self) -> Result<(), AppError> {
        let mut errors = Vec::new();

        if let Some(name) = &self.name {
            let trimmed = name.trim();
            if trimmed.len() < 2 || trimmed.len() > 100 {
                errors.push(ValidationErrorDetail {
                    field: "name".to_string(),
                    message: "String should have at least 2 characters and at most 100 characters".to_string(),
                });
            } else {
                self.name = Some(trimmed.to_string());
            }
        }

        if let Some(phone) = &self.whatsapp_number {
            match normalize_sl_phone(phone) {
                Ok(normalized) => self.whatsapp_number = Some(normalized),
                Err(AppError::ValidationError(errs)) => errors.extend(errs),
                Err(e) => return Err(e),
            }
        }

        if !errors.is_empty() {
            return Err(AppError::ValidationError(errors));
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreResponse {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub whatsapp_number: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub category: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub owner_name: Option<String>,
    pub store_url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub qr_code_data_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}
