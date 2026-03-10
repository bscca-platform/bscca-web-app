mod db;
mod models;
mod handlers;

use axum::{routing::{get, post}, Router};
use std::sync::Arc;
use tokio::sync::broadcast;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use handlers::{get_teams, get_live_match, events_handler, AppState};
use db::Database;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "backend_rust=debug,tower_http=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db = Database::init().await?;
    let (tx, _rx) = broadcast::channel(100);

    let state = Arc::new(AppState {
        db: Arc::new(db),
        tx,
    });

    let app = Router::new()
        .route("/api/teams", get(get_teams).post(handlers::create_team))
        .route("/api/teams/:id", post(handlers::update_team).delete(handlers::delete_team))
        .route("/api/players", get(handlers::get_players).post(handlers::create_player))
        .route("/api/players/:id", post(handlers::update_player).delete(handlers::delete_player))
        .route("/api/matches", get(handlers::get_matches).post(handlers::create_match))
        .route("/api/matches/:id", post(handlers::update_match))
        .route("/api/live_match_details", post(handlers::upsert_live_details))
        .route("/api/matches/initialize", post(handlers::initialize_match))
        .route("/api/matches/finish", post(handlers::finish_match))
        .route("/api/matches/live", get(get_live_match))
        .route("/api/tournaments", get(handlers::get_tournaments))
        .route("/api/events", get(events_handler))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    tracing::debug!("listening on {}", listener.local_addr()?);
    
    axum::serve(listener, app).await?;

    Ok(())
}
