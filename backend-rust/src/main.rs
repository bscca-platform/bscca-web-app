mod db;
mod models;
mod handlers;
mod cricket;

use axum::{
    routing::{get, post},
    Router,
    http::{Request, StatusCode},
    middleware::{self, Next},
    response::Response,
    body::Body,
};
use std::env;
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
        http: reqwest::Client::new(),
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
        .route("/api/tournaments", get(handlers::get_tournaments).post(handlers::create_tournament))
        .route("/api/tournaments/:id", post(handlers::update_tournament).delete(handlers::delete_tournament))
        .route("/api/tournaments/:id/teams", post(handlers::sync_tournament_teams))
        .route("/api/scorecards/batting/upsert", post(handlers::upsert_scorecard_batting))
        .route("/api/scorecards/bowling/upsert", post(handlers::upsert_scorecard_bowling))
        .route("/api/teams/:id/players", get(handlers::get_team_players))
        .route("/api/teams/:id/matches", get(handlers::get_team_matches))
        .route("/api/teams/:id/scorecards/batting", get(handlers::get_team_scorecards_batting))
        .route("/api/teams/:id/scorecards/bowling", get(handlers::get_team_scorecards_bowling))
        .route("/api/teams/slug/:slug", get(handlers::get_team_by_slug))
        .route("/api/players/slug/:slug", get(handlers::get_player_by_slug))
        .route("/api/scorecards/batting/:match_id", get(handlers::get_scorecard_batting))
        .route("/api/scorecards/bowling/:match_id", get(handlers::get_scorecard_bowling))
        .route("/api/upload", post(handlers::upload_handler))
        .route("/api/proxy-image", get(handlers::proxy_image))
        .route("/api/events", get(events_handler))
        .route("/api/admin/stats", get(handlers::get_admin_stats))
        .route("/api/health", get(handlers::health_check))
        .layer(middleware::from_fn(auth_middleware))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "7860".to_string())
        .parse::<u16>()?;

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    tracing::debug!("listening on {}", listener.local_addr()?);
    
    axum::serve(listener, app).await?;

    Ok(())
}

async fn auth_middleware(req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    let auth_header = req.headers().get("X-API-Key");
    let expected_key = env::var("ADMIN_API_KEY").unwrap_or_else(|_| "bscca-secret-786".to_string());

    if let Some(key) = auth_header {
        if key.to_str().unwrap_or_default() == expected_key {
            return Ok(next.run(req).await);
        }
    }

    // Still allow GET requests to proceed without key (for public viewing)
    // but protect everything else
    if req.method() == axum::http::Method::GET {
        return Ok(next.run(req).await);
    }

    Err(StatusCode::UNAUTHORIZED)
}
