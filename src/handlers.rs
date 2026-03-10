use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{sse::{Event, Sse}, IntoResponse},
    Json,
};
use serde::Deserialize;
use crate::db::Database;
use crate::models::*;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio_stream::StreamExt;
use futures_util::stream::Stream;
use std::convert::Infallible;
use uuid::Uuid;

pub struct AppState {
    pub db: Arc<Database>,
    pub tx: broadcast::Sender<String>,
}

pub async fn broadcast_update(state: &Arc<AppState>, match_id: &str) {
    let msg = serde_json::json!({ "match_id": match_id }).to_string();
    let _ = state.tx.send(msg);
}

pub async fn get_teams(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut rows = match state.db.client.query("SELECT * FROM teams", ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut teams = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        // Map row to Team struct (simplified for now)
        // In a real app, use a helper or sqlx-like macro
        teams.push(Team {
            id: row.get(0).unwrap_or_default(),
            name: row.get(1).unwrap_or_default(),
            slug: row.get(2).unwrap_or_default(),
            location: row.get(3).ok(),
            initials: row.get(4).ok(),
            description: row.get(5).ok(),
            image: row.get(6).ok(),
            achievements: row.get(7).ok(),
            played: row.get(8).unwrap_or(0),
            won: row.get(9).unwrap_or(0),
            lost: row.get(10).unwrap_or(0),
            nrr: row.get(11).unwrap_or_else(|_| "0.000".to_string()),
            total_runs_scored: row.get(12).unwrap_or(0),
            total_overs_faced: row.get(13).unwrap_or(0.0),
            total_runs_conceded: row.get(14).unwrap_or(0),
            total_overs_bowled: row.get(15).unwrap_or(0.0),
            created_at: None, // Simplified
        });
    }

    Json(teams).into_response()
}

pub async fn get_live_match(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    // 1. Find live match
    let mut rows = match state.db.client.query("SELECT * FROM matches WHERE status = 'live' LIMIT 1", ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    if let Ok(Some(row)) = rows.next().await {
        let match_data = Match {
            id: row.get(0).unwrap_or_default(),
            slug: row.get(1).unwrap_or_default(),
            team1_id: row.get(2).ok(),
            team2_id: row.get(3).ok(),
            t1: row.get(4).ok(),
            t2: row.get(5).ok(),
            i1: row.get(6).ok(),
            i2: row.get(7).ok(),
            date: row.get(8).ok(),
            time: row.get(9).ok(),
            venue: row.get(10).ok(),
            status: row.get(11).unwrap_or_else(|_| "upcoming".to_string()),
            match_number: row.get(12).ok(),
            stage: row.get(13).ok(),
            team1_score: row.get(14).ok(),
            team2_score: row.get(15).ok(),
            result_text: row.get(16).ok(),
            pom_text: row.get(17).ok(),
            winner_id: row.get(18).ok(),
            match_type: row.get(19).unwrap_or_else(|_| "tournament".to_string()),
            tournament_id: row.get(20).ok(),
            created_at: None,
        };
        return Json(match_data).into_response();
    }

    (StatusCode::NOT_FOUND, "No live match").into_response()
}

pub async fn get_matches(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut rows = match state.db.client.query("SELECT * FROM matches ORDER BY created_at DESC", ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut matches = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        matches.push(Match {
            id: row.get(0).unwrap_or_default(),
            slug: row.get(1).unwrap_or_default(),
            team1_id: row.get(2).ok(),
            team2_id: row.get(3).ok(),
            t1: row.get(4).ok(),
            t2: row.get(5).ok(),
            i1: row.get(6).ok(),
            i2: row.get(7).ok(),
            date: row.get(8).ok(),
            time: row.get(9).ok(),
            venue: row.get(10).ok(),
            status: row.get(11).unwrap_or_else(|_| "upcoming".to_string()),
            match_number: row.get(12).ok(),
            stage: row.get(13).ok(),
            team1_score: row.get(14).ok(),
            team2_score: row.get(15).ok(),
            result_text: row.get(16).ok(),
            pom_text: row.get(17).ok(),
            winner_id: row.get(18).ok(),
            match_type: row.get(19).unwrap_or_else(|_| "tournament".to_string()),
            tournament_id: row.get(20).ok(),
            created_at: None,
        });
    }

    Json(matches).into_response()
}

pub async fn get_players(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut rows = match state.db.client.query("SELECT * FROM players", ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut players = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        players.push(Player {
            id: row.get(0).unwrap_or_default(),
            team_id: row.get(1).ok(),
            name: row.get(2).unwrap_or_default(),
            slug: row.get(3).unwrap_or_default(),
            role: row.get(4).ok(),
            specialization: row.get(5).ok(),
            dob: row.get(6).ok(),
            style_batting: row.get(7).ok(),
            style_bowling: row.get(8).ok(),
            image: row.get(9).ok(),
            bio: row.get(10).ok(),
            matches_played: row.get(11).unwrap_or(0),
            total_runs: row.get(12).unwrap_or(0),
            total_balls_faced: row.get(13).unwrap_or(0),
            strike_rate: row.get(14).unwrap_or_else(|_| "0.00".to_string()),
            highest_score: row.get(15).unwrap_or(0),
            fifties: row.get(16).unwrap_or(0),
            wickets: row.get(17).unwrap_or(0),
            overs_bowled: row.get(18).unwrap_or_else(|_| "0.0".to_string()),
            runs_conceded: row.get(19).unwrap_or(0),
            economy: row.get(20).unwrap_or_else(|_| "0.00".to_string()),
            last_updated: None,
            created_at: None,
        });
    }

    Json(players).into_response()
}

pub async fn get_tournaments(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut rows = match state.db.client.query("SELECT * FROM tournaments", ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut tournaments = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        tournaments.push(Tournament {
            id: row.get(0).unwrap_or_default(),
            name: row.get(1).unwrap_or_default(),
            status: row.get(2).unwrap_or_else(|_| "upcoming".to_string()),
            created_at: None,
        });
    }

    Json(tournaments).into_response()
}

pub async fn events_handler(
    State(state): State<Arc<AppState>>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let rx = state.tx.subscribe();

    let stream = tokio_stream::wrappers::BroadcastStream::new(rx).map(|msg| {
        match msg {
            Ok(m) => Ok(Event::default().data(m)),
            Err(_) => Ok(Event::default().data("error")),
        }
    });

    Sse::new(stream)
}

pub async fn create_match(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Match>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO matches (id, slug, team1_id, team2_id, t1, t2, i1, i2, date, time, venue, status, match_number, stage, match_type, tournament_id) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.slug, payload.team1_id, payload.team2_id, payload.t1, payload.t2, payload.i1, payload.i2,
        payload.date, payload.time, payload.venue, payload.status, payload.match_number, payload.stage, payload.match_type, payload.tournament_id
    ]).await;

    match res {
        Ok(_) => Json(id).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

pub async fn update_match(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<Match>,
) -> impl IntoResponse {
    let sql = "UPDATE matches SET slug=?, team1_id=?, team2_id=?, t1=?, t2=?, i1=?, i2=?, date=?, time=?, venue=?, status=?, match_number=?, stage=?, team1_score=?, team2_score=?, result_text=?, winner_id=?, match_type=?, tournament_id=? 
               WHERE id=?";
    
    let res = state.db.client.execute(sql, libsql::params![
        payload.slug, payload.team1_id, payload.team2_id, payload.t1, payload.t2, payload.i1, payload.i2,
        payload.date, payload.time, payload.venue, payload.status, payload.match_number, payload.stage, 
        payload.team1_score, payload.team2_score, payload.result_text, payload.winner_id, payload.match_type, payload.tournament_id,
        id.clone()
    ]).await;

    match res {
        Ok(_) => {
            broadcast_update(&state, &id).await;
            StatusCode::OK.into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

pub async fn upsert_live_details(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LiveMatchDetails>,
) -> impl IntoResponse {
    let sql = "INSERT INTO live_match_details (id, match_id, team1_id, team2_id, team1_score, team1_overs, team2_score, team2_overs, team2_status, toss_winner_id, match_status_text, current_batter_1_id, current_batter_1_runs, current_batter_1_balls, current_batter_2_id, current_batter_2_runs, current_batter_2_balls, current_bowler_id, current_bowler_wickets, current_bowler_runs, current_bowler_overs, last_updated) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(match_id) DO UPDATE SET 
               team1_score=excluded.team1_score, team1_overs=excluded.team1_overs, team2_score=excluded.team2_score, team2_overs=excluded.team2_overs, team2_status=excluded.team2_status, match_status_text=excluded.match_status_text, 
               current_batter_1_id=excluded.current_batter_1_id, current_batter_1_runs=excluded.current_batter_1_runs, current_batter_1_balls=excluded.current_batter_1_balls,
               current_batter_2_id=excluded.current_batter_2_id, current_batter_2_runs=excluded.current_batter_2_runs, current_batter_2_balls=excluded.current_batter_2_balls,
               current_bowler_id=excluded.current_bowler_id, current_bowler_wickets=excluded.current_bowler_wickets, current_bowler_runs=excluded.current_bowler_runs, current_bowler_overs=excluded.current_bowler_overs,
               last_updated=CURRENT_TIMESTAMP";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };

    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id.clone(), payload.team1_id, payload.team2_id, payload.team1_score, payload.team1_overs, payload.team2_score, payload.team2_overs, payload.team2_status, payload.toss_winner_id, payload.match_status_text,
        payload.current_batter_1_id, payload.current_batter_1_runs, payload.current_batter_1_balls,
        payload.current_batter_2_id, payload.current_batter_2_runs, payload.current_batter_2_balls,
        payload.current_bowler_id, payload.current_bowler_wickets, payload.current_bowler_runs, payload.current_bowler_overs
    ]).await;

    match res {
        Ok(_) => {
            broadcast_update(&state, &payload.match_id).await;
            StatusCode::OK.into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

#[derive(Deserialize)]
pub struct InitializeMatchPayload {
    pub match_id: String,
    pub toss_winner_id: String,
    pub toss_decision: String,
}

pub async fn initialize_match(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<InitializeMatchPayload>,
) -> impl IntoResponse {
    // 1. Update match status to 'live'
    let _ = state.db.client.execute("UPDATE matches SET status = 'live' WHERE id = ?", libsql::params![payload.match_id.clone()]).await;

    // 2. Fetch team names for toss text
    // (Simplified: assuming IDs are enough for now or we just use a generic text)
    let toss_text = format!("Toss won by {} and elected to {} first.", payload.toss_winner_id, payload.toss_decision);

    // 3. Create live match details
    let sql = "INSERT INTO live_match_details (id, match_id, toss_winner_id, match_status_text, team1_score, team1_overs, team2_score, team2_status, last_updated) 
               VALUES (?, ?, ?, ?, '0/0', '0.0', '0/0', 'Yet to Bat', CURRENT_TIMESTAMP)";
    
    let res = state.db.client.execute(sql, libsql::params![
        Uuid::new_v4().to_string(), payload.match_id.clone(), payload.toss_winner_id, toss_text
    ]).await;

    match res {
        Ok(_) => {
            broadcast_update(&state, &payload.match_id).await;
            StatusCode::OK.into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

#[derive(Deserialize)]
pub struct FinishMatchPayload {
    pub match_id: String,
    pub team1_score: String,
    pub team2_score: String,
    pub winner_id: String,
    pub result_text: Option<String>,
}

pub async fn finish_match(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<FinishMatchPayload>,
) -> impl IntoResponse {
    // 1. Update match
    let res = state.db.client.execute(
        "UPDATE matches SET status = 'finished', team1_score = ?, team2_score = ?, winner_id = ?, result_text = ? WHERE id = ?",
        libsql::params![payload.team1_score, payload.team2_score, payload.winner_id.clone(), payload.result_text.unwrap_or_default(), payload.match_id.clone()]
    ).await;

    if res.is_err() {
        return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to update match").into_response();
    }

    // 2. Update team stats (Simplified: just increment played/won/lost)
    // In a real app, you'd calculate NRR here too
    let _ = state.db.client.execute("UPDATE teams SET played = played + 1, won = won + 1 WHERE id = ?", libsql::params![payload.winner_id.clone()]).await;
    let _ = state.db.client.execute(
        "UPDATE teams SET played = played + 1, lost = lost + 1 WHERE id = (SELECT CASE WHEN team1_id = ? THEN team2_id ELSE team1_id END FROM matches WHERE id = ?)",
        libsql::params![payload.winner_id, payload.match_id.clone()]
    ).await;

    broadcast_update(&state, &payload.match_id).await;
    StatusCode::OK.into_response()
}

// TEAM HANDLERS
pub async fn create_team(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Team>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO teams (id, name, slug, location, initials, description, image, played, won, lost, nrr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.name, payload.slug, payload.location, payload.initials, payload.description, payload.image, payload.played, payload.won, payload.lost, payload.nrr
    ]).await;

    match res {
        Ok(_) => Json(id).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn update_team(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<Team>,
) -> impl IntoResponse {
    let sql = "UPDATE teams SET name=?, slug=?, location=?, initials=?, description=?, image=?, played=?, won=?, lost=?, nrr=? WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.name, payload.slug, payload.location, payload.initials, payload.description, payload.image, payload.played, payload.won, payload.lost, payload.nrr, id
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn delete_team(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let res = state.db.client.execute("DELETE FROM teams WHERE id = ?", libsql::params![id]).await;
    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

// PLAYER HANDLERS
pub async fn create_player(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Player>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO players (id, team_id, name, slug, role, specialization, dob, style_batting, style_bowling, image, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.team_id, payload.name, payload.slug, payload.role, payload.specialization, payload.dob, payload.style_batting, payload.style_bowling, payload.image, payload.bio
    ]).await;

    match res {
        Ok(_) => Json(id).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn update_player(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<Player>,
) -> impl IntoResponse {
    let sql = "UPDATE players SET team_id=?, name=?, slug=?, role=?, specialization=?, dob=?, style_batting=?, style_bowling=?, image=?, bio=?, matches_played=?, total_runs=?, total_balls_faced=?, strike_rate=?, highest_score=?, fifties=?, wickets=?, overs_bowled=?, runs_conceded=?, economy=? WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.team_id, payload.name, payload.slug, payload.role, payload.specialization, payload.dob, payload.style_batting, payload.style_bowling, payload.image, payload.bio,
        payload.matches_played, payload.total_runs, payload.total_balls_faced, payload.strike_rate, payload.highest_score, payload.fifties, payload.wickets, payload.overs_bowled, payload.runs_conceded, payload.economy, id
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn delete_player(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let res = state.db.client.execute("DELETE FROM players WHERE id = ?", libsql::params![id]).await;
    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

// Add more handlers as needed...
