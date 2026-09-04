use serde::{Deserialize, Serialize};
use crate::error::{AppError, ValidationErrorDetail};

#[allow(non_camel_case_types)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StockBadge {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK,
}

impl StockBadge {
    pub fn compute(stock: i64, is_available: bool) -> Self {
        if stock <= 0 || !is_available {
            StockBadge::OUT_OF_STOCK
        } else if stock <= 5 {
            StockBadge::LOW_STOCK
        } else {
            StockBadge::IN_STOCK
        }
    }
}

pub fn to_title_case(s: &str) -> String {
    s.split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => {
                    let upper = first.to_uppercase().collect::<String>();
                    let rest = chars.as_str().to_lowercase();
                    format!("{upper}{rest}")
                }
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductCreate {
    pub title: String,
    #[serde(default)]
    pub description: Option<String>,
    pub price: f64,
    pub category: String,
    #[serde(default)]
    pub stock: i64,
    #[serde(default)]
    pub image_url: Option<String>,
    #[serde(default = "default_true")]
    pub is_available: bool,
}

fn default_true() -> bool {
    true
}

impl ProductCreate {
    pub fn validate_and_normalize(&mut self) -> Result<(), AppError> {
        let mut errors = Vec::new();

        let trimmed_title = self.title.trim();
        if trimmed_title.len() < 2 || trimmed_title.len() > 150 {
            errors.push(ValidationErrorDetail {
                field: "title".to_string(),
                message: "String should have at least 2 characters and at most 150 characters".to_string(),
            });
        }
        self.title = trimmed_title.to_string();

        if self.price <= 0.0 {
            errors.push(ValidationErrorDetail {
                field: "price".to_string(),
                message: "Input should be greater than 0".to_string(),
            });
        }

        let trimmed_cat = self.category.trim();
        if trimmed_cat.len() < 2 || trimmed_cat.len() > 50 {
            errors.push(ValidationErrorDetail {
                field: "category".to_string(),
                message: "String should have at least 2 characters and at most 50 characters".to_string(),
            });
        }
        self.category = to_title_case(trimmed_cat);

        if self.stock < 0 {
            errors.push(ValidationErrorDetail {
                field: "stock".to_string(),
                message: "Input should be greater than or equal to 0".to_string(),
            });
        }

        if !errors.is_empty() {
            return Err(AppError::ValidationError(errors));
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProductUpdate {
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub price: Option<f64>,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub stock: Option<i64>,
    #[serde(default)]
    pub image_url: Option<String>,
    #[serde(default)]
    pub is_available: Option<bool>,
}

impl ProductUpdate {
    pub fn validate_and_normalize(&mut self) -> Result<(), AppError> {
        let mut errors = Vec::new();

        if let Some(title) = &self.title {
            let trimmed = title.trim();
            if trimmed.len() < 2 || trimmed.len() > 150 {
                errors.push(ValidationErrorDetail {
                    field: "title".to_string(),
                    message: "String should have at least 2 characters and at most 150 characters".to_string(),
                });
            } else {
                self.title = Some(trimmed.to_string());
            }
        }

        if let Some(price) = self.price {
            if price <= 0.0 {
                errors.push(ValidationErrorDetail {
                    field: "price".to_string(),
                    message: "Input should be greater than 0".to_string(),
                });
            }
        }

        if let Some(category) = &self.category {
            let trimmed = category.trim();
            if trimmed.len() < 2 || trimmed.len() > 50 {
                errors.push(ValidationErrorDetail {
                    field: "category".to_string(),
                    message: "String should have at least 2 characters and at most 50 characters".to_string(),
                });
            } else {
                self.category = Some(to_title_case(trimmed));
            }
        }

        if let Some(stock) = self.stock {
            if stock < 0 {
                errors.push(ValidationErrorDetail {
                    field: "stock".to_string(),
                    message: "Input should be greater than or equal to 0".to_string(),
                });
            }
        }

        if !errors.is_empty() {
            return Err(AppError::ValidationError(errors));
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductStockAdjust {
    #[serde(default)]
    pub adjustment: Option<i64>,
    #[serde(default)]
    pub new_stock: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductToggleStatus {
    pub is_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductResponse {
    pub id: String,
    pub store_id: String,
    pub title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub price: f64,
    pub category: String,
    pub stock: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    pub is_available: bool,
    pub stock_badge: StockBadge,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Default)]
pub struct ProductFilterParams {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub min_price: Option<f64>,
    #[serde(default)]
    pub max_price: Option<f64>,
    #[serde(default)]
    pub in_stock_only: Option<bool>,
    #[serde(default)]
    pub sort_by: Option<String>,
}
