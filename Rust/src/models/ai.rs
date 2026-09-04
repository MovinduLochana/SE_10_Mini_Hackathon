use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopyGenerationRequest {
    pub title: String,
    pub keywords: String,
    #[serde(default = "default_target_audience")]
    pub target_audience: String,
}

fn default_target_audience() -> String {
    "Sri Lankan households and food lovers".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopyGenerationResponse {
    pub title: String,
    pub marketing_pitch: String,
    pub highlights: Vec<String>,
    pub generated_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategorySuggestionRequest {
    pub title: String,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategorySuggestionResponse {
    pub title: String,
    pub suggested_category: String,
    pub alternative_categories: Vec<String>,
    pub confidence: f64,
}
