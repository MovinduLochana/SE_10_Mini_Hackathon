use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderItemInput {
    pub product_id: String,
    pub quantity: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderCalculateRequest {
    pub store_slug: String,
    pub items: Vec<OrderItemInput>,
    #[serde(default)]
    pub customer_name: Option<String>,
    #[serde(default)]
    pub customer_phone: Option<String>,
    #[serde(default)]
    pub delivery_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedOrderItem {
    pub product_id: String,
    pub title: String,
    pub unit_price: f64,
    pub quantity: i64,
    pub subtotal: f64,
    pub available_stock: i64,
    pub is_sufficient: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderCalculateResponse {
    pub store_name: String,
    pub whatsapp_number: String,
    pub items: Vec<CalculatedOrderItem>,
    pub total_amount: f64,
    pub currency: String,
    pub has_stock_issues: bool,
    pub stock_warnings: Vec<String>,
    pub whatsapp_checkout_url: String,
    pub formatted_whatsapp_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderCreateRequest {
    pub store_slug: String,
    pub items: Vec<OrderItemInput>,
    #[serde(default)]
    pub customer_name: Option<String>,
    #[serde(default)]
    pub customer_phone: Option<String>,
    #[serde(default)]
    pub delivery_notes: Option<String>,
    #[serde(default = "default_true")]
    pub save_to_store: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderRecordResponse {
    pub id: String,
    pub store_id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub customer_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub customer_phone: Option<String>,
    pub total_amount: f64,
    pub status: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delivery_notes: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
}
