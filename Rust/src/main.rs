use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use polalink_backend::{
    config::Config,
    core::supabase::SupabaseClient,
    create_app, AppState,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "polalink_backend=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    let api_key = config.effective_api_key().to_string();
    let supabase = Arc::new(SupabaseClient::new(
        config.supabase_url.clone(),
        api_key,
    ));

    let bind_addr = format!("{}:{}", config.host, config.port);
    let state = Arc::new(AppState {
        config: config.clone(),
        supabase,
    });

    let app = create_app(state);

    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!("🚀 PolaLink LK Backend (Rust/Axum) listening on http://{}", bind_addr);
    tracing::info!("Frontend target: {}", config.frontend_url);

    axum::serve(listener, app).await?;

    Ok(())
}
