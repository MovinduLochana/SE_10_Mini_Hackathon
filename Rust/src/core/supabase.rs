use reqwest::Client;
use serde_json::Value;
use std::sync::Arc;
use crate::error::AppError;

#[derive(Clone, Debug)]
pub struct SupabaseClient {
    client: Client,
    pub supabase_url: String,
    pub api_key: String,
}

impl SupabaseClient {
    pub fn new(supabase_url: String, api_key: String) -> Self {
        let client = Client::builder()
            .build()
            .unwrap_or_else(|_| Client::new());
        Self {
            client,
            supabase_url: supabase_url.trim_end_matches('/').to_string(),
            api_key,
        }
    }

    pub fn is_configured(&self) -> bool {
        !self.supabase_url.is_empty()
            && !self.api_key.is_empty()
            && !self.supabase_url.contains("your-project")
    }

    pub async fn auth_sign_up(&self, email: &str, password: &str) -> Result<Value, AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/auth/v1/signup", self.supabase_url);
        let resp = self.client
            .post(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password
            }))
            .send()
            .await?;

        let status = resp.status();
        let body: Value = resp.json().await?;
        if !status.is_success() {
            let msg = body.get("msg")
                .or_else(|| body.get("message"))
                .or_else(|| body.get("error_description"))
                .and_then(|v| v.as_str())
                .unwrap_or("Signup failed.");
            return Err(AppError::bad_request(msg));
        }
        Ok(body)
    }

    pub async fn auth_sign_in(&self, email: &str, password: &str) -> Result<Value, AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/auth/v1/token?grant_type=password", self.supabase_url);
        let resp = self.client
            .post(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password
            }))
            .send()
            .await?;

        let status = resp.status();
        let body: Value = resp.json().await?;
        if !status.is_success() {
            let msg = body.get("error_description")
                .or_else(|| body.get("msg"))
                .or_else(|| body.get("message"))
                .and_then(|v| v.as_str())
                .unwrap_or("Invalid email or password.");
            return Err(AppError::unauthorized(msg));
        }
        Ok(body)
    }

    pub async fn auth_get_user(&self, token: &str) -> Result<Value, AppError> {
        if !self.is_configured() {
            return Err(AppError::unauthorized("Supabase credentials not configured."));
        }
        let url = format!("{}/auth/v1/user", self.supabase_url);
        let resp = self.client
            .get(&url)
            .header("apikey", &self.api_key)
            .header("Authorization", format!("Bearer {token}"))
            .send()
            .await?;

        let status = resp.status();
        let body: Value = resp.json().await?;
        if !status.is_success() {
            let msg = body.get("msg")
                .or_else(|| body.get("message"))
                .and_then(|v| v.as_str())
                .unwrap_or("Invalid or expired authentication token.");
            return Err(AppError::unauthorized(msg));
        }
        Ok(body)
    }

    pub async fn table_select(
        &self,
        table: &str,
        query_pairs: &[(&str, &str)],
        auth_token: Option<&str>,
    ) -> Result<Vec<Value>, AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/rest/v1/{}", self.supabase_url, table);
        let mut req = self.client.get(&url)
            .header("apikey", &self.api_key)
            .query(query_pairs);

        if let Some(token) = auth_token {
            req = req.header("Authorization", format!("Bearer {token}"));
        } else {
            req = req.header("Authorization", format!("Bearer {}", self.api_key));
        }

        let resp = req.send().await?;
        let status = resp.status();
        let text = resp.text().await?;

        if !status.is_success() {
            return Err(AppError::bad_request(format!("Supabase error: {text}")));
        }

        let res: Vec<Value> = serde_json::from_str(&text).map_err(|e| {
            AppError::internal(format!("Failed to parse Supabase JSON: {e}, text: {text}"))
        })?;

        Ok(res)
    }

    pub async fn table_insert(
        &self,
        table: &str,
        payload: &Value,
        auth_token: Option<&str>,
    ) -> Result<Vec<Value>, AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/rest/v1/{}", self.supabase_url, table);
        let mut req = self.client.post(&url)
            .header("apikey", &self.api_key)
            .header("Prefer", "return=representation")
            .header("Content-Type", "application/json")
            .json(payload);

        if let Some(token) = auth_token {
            req = req.header("Authorization", format!("Bearer {token}"));
        } else {
            req = req.header("Authorization", format!("Bearer {}", self.api_key));
        }

        let resp = req.send().await?;
        let status = resp.status();
        let text = resp.text().await?;

        if !status.is_success() {
            return Err(AppError::bad_request(format!("Supabase insert error: {text}")));
        }

        let res: Vec<Value> = serde_json::from_str(&text).map_err(|e| {
            AppError::internal(format!("Failed to parse Supabase JSON: {e}, text: {text}"))
        })?;

        Ok(res)
    }

    pub async fn table_update(
        &self,
        table: &str,
        query_pairs: &[(&str, &str)],
        payload: &Value,
        auth_token: Option<&str>,
    ) -> Result<Vec<Value>, AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/rest/v1/{}", self.supabase_url, table);
        let mut req = self.client.patch(&url)
            .header("apikey", &self.api_key)
            .header("Prefer", "return=representation")
            .header("Content-Type", "application/json")
            .query(query_pairs)
            .json(payload);

        if let Some(token) = auth_token {
            req = req.header("Authorization", format!("Bearer {token}"));
        } else {
            req = req.header("Authorization", format!("Bearer {}", self.api_key));
        }

        let resp = req.send().await?;
        let status = resp.status();
        let text = resp.text().await?;

        if !status.is_success() {
            return Err(AppError::bad_request(format!("Supabase update error: {text}")));
        }

        let res: Vec<Value> = serde_json::from_str(&text).map_err(|e| {
            AppError::internal(format!("Failed to parse Supabase JSON: {e}, text: {text}"))
        })?;

        Ok(res)
    }

    pub async fn table_delete(
        &self,
        table: &str,
        query_pairs: &[(&str, &str)],
        auth_token: Option<&str>,
    ) -> Result<(), AppError> {
        if !self.is_configured() {
            return Err(AppError::bad_request("Supabase credentials not configured."));
        }
        let url = format!("{}/rest/v1/{}", self.supabase_url, table);
        let mut req = self.client.delete(&url)
            .header("apikey", &self.api_key)
            .query(query_pairs);

        if let Some(token) = auth_token {
            req = req.header("Authorization", format!("Bearer {token}"));
        } else {
            req = req.header("Authorization", format!("Bearer {}", self.api_key));
        }

        let resp = req.send().await?;
        if !resp.status().is_success() {
            let text = resp.text().await?;
            return Err(AppError::bad_request(format!("Supabase delete error: {text}")));
        }

        Ok(())
    }

    pub async fn health_check(&self) -> (bool, String) {
        if !self.is_configured() {
            return (false, "Not configured".to_string());
        }
        let url = format!("{}/rest/v1/stores?select=id&limit=1", self.supabase_url);
        match self.client.get(&url)
            .header("apikey", &self.api_key)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
        {
            Ok(resp) => {
                if resp.status().is_success() {
                    (true, "Connected".to_string())
                } else {
                    let err = resp.text().await.unwrap_or_default();
                    (false, err)
                }
            }
            Err(e) => (false, e.to_string()),
        }
    }
}

pub type SharedSupabase = Arc<SupabaseClient>;
