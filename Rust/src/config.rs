use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub supabase_url: String,
    pub supabase_key: String,
    pub supabase_publishable_key: String,
    pub supabase_secret_key: String,
    pub supabase_jwks_url: String,
    pub supabase_jwt_secret: String,

    pub app_name: String,
    pub frontend_url: String,
    pub cors_origins: Vec<String>,
    pub host: String,
    pub port: u16,
    pub debug: bool,

    pub gemini_api_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        // Attempt loading .env from current directory, then fallback to ../backend/.env
        let _ = dotenvy::dotenv();
        let _ = dotenvy::from_path("../backend/.env");

        let supabase_url = env::var("SUPABASE_URL").unwrap_or_default();
        let supabase_key = env::var("SUPABASE_KEY").unwrap_or_default();
        let supabase_publishable_key = env::var("SUPABASE_PUBLISHABLE_KEY").unwrap_or_default();
        let supabase_secret_key = env::var("SUPABASE_SECRET_KEY").unwrap_or_default();
        let supabase_jwks_url = env::var("SUPABASE_JWKS_URL").unwrap_or_default();
        let supabase_jwt_secret = env::var("SUPABASE_JWT_SECRET").unwrap_or_default();

        let app_name = env::var("APP_NAME").unwrap_or_else(|_| "PolaLink LK API".to_string());
        let frontend_url = env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

        let cors_origins_raw = env::var("CORS_ORIGINS").unwrap_or_else(|_| "[\"http://localhost:3000\",\"http://127.0.0.1:3000\"]".to_string());
        let cors_origins: Vec<String> = if let Ok(parsed) = serde_json::from_str::<Vec<String>>(&cors_origins_raw) {
            parsed
        } else {
            cors_origins_raw
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        };

        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8000);
        let debug = env::var("DEBUG")
            .map(|v| v.to_lowercase() == "true" || v == "1")
            .unwrap_or(true);

        let gemini_api_key = env::var("GEMINI_API_KEY").unwrap_or_default();

        Self {
            supabase_url,
            supabase_key,
            supabase_publishable_key,
            supabase_secret_key,
            supabase_jwks_url,
            supabase_jwt_secret,
            app_name,
            frontend_url,
            cors_origins,
            host,
            port,
            debug,
            gemini_api_key,
        }
    }

    pub fn effective_api_key(&self) -> &str {
        if !self.supabase_secret_key.is_empty() {
            &self.supabase_secret_key
        } else if !self.supabase_key.is_empty() {
            &self.supabase_key
        } else {
            &self.supabase_publishable_key
        }
    }
}
