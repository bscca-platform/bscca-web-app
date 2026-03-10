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
use axum::extract::Multipart;
use base64::{Engine as _, engine::general_purpose};

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
    let sql = "SELECT t.*, te.id as team_id, te.name as team_name, te.initials as team_initials, te.image as team_image 
               FROM tournaments t 
               LEFT JOIN tournament_teams tt ON t.id = tt.tournament_id 
               LEFT JOIN teams te ON tt.team_id = te.id 
               ORDER BY t.created_at DESC";
    
    let mut rows = match state.db.client.query(sql, ()).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut tournament_map: std::collections::HashMap<String, Tournament> = std::collections::HashMap::new();

    while let Ok(Some(row)) = rows.next().await {
        let id: String = row.get(0).unwrap_or_default();
        
        let tournament = tournament_map.entry(id.clone()).or_insert_with(|| Tournament {
            id,
            name: row.get(1).unwrap_or_default(),
            slug: row.get(2).ok(),
            start_date: row.get(3).ok(),
            end_date: row.get(4).ok(),
            description: row.get(5).ok(),
            status: row.get(6).unwrap_or_else(|_| "upcoming".to_string()),
            created_at: None,
            teams: Some(Vec::new()),
        });

        if let Ok(team_id) = row.get::<String>(9) {
            if let Some(ref mut teams) = tournament.teams {
                teams.push(Team {
                    id: team_id,
                    name: row.get(10).unwrap_or_default(),
                    slug: "".to_string(), // Simplified
                    location: None,
                    initials: row.get(11).ok(),
                    description: None,
                    image: row.get(12).ok(),
                    achievements: None,
                    played: 0,
                    won: 0,
                    lost: 0,
                    nrr: "0.000".to_string(),
                    total_runs_scored: 0,
                    total_overs_faced: 0.0,
                    total_runs_conceded: 0,
                    total_overs_bowled: 0.0,
                    created_at: None,
                });
            }
        }
    }

    let mut result: Vec<Tournament> = tournament_map.into_values().collect();
    result.sort_by(|a, b| b.id.cmp(&a.id)); // Simple sort by ID for now

    Json(result).into_response()
}

pub async fn create_tournament(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Tournament>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO tournaments (id, name, slug, start_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.name, payload.slug, payload.start_date, payload.end_date, payload.description, payload.status
    ]).await;

    match res {
        Ok(_) => Json(serde_json::json!({ "id": id })).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn update_tournament(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<Tournament>,
) -> impl IntoResponse {
    let sql = "UPDATE tournaments SET name=?, slug=?, start_date=?, end_date=?, description=?, status=? WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.name, payload.slug, payload.start_date, payload.end_date, payload.description, payload.status, id
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn delete_tournament(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let _ = state.db.client.execute("DELETE FROM tournament_teams WHERE tournament_id = ?", libsql::params![id.clone()]).await;
    let res = state.db.client.execute("DELETE FROM tournaments WHERE id = ?", libsql::params![id]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

#[derive(Deserialize)]
pub struct SyncTeamsPayload {
    pub team_ids: Vec<String>,
}

pub async fn sync_tournament_teams(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<SyncTeamsPayload>,
) -> impl IntoResponse {
    // 1. Delete existing
    let _ = state.db.client.execute("DELETE FROM tournament_teams WHERE tournament_id = ?", libsql::params![id.clone()]).await;
    
    // 2. Insert new
    for team_id in payload.team_ids {
        let _ = state.db.client.execute(
            "INSERT INTO tournament_teams (tournament_id, team_id) VALUES (?, ?)",
            libsql::params![id.clone(), team_id]
        ).await;
    }

    StatusCode::OK.into_response()
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

pub async fn get_team_by_slug(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let mut rows = match state.db.client.query("SELECT * FROM teams WHERE slug = ? LIMIT 1", libsql::params![slug]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    if let Ok(Some(row)) = rows.next().await {
        let team = Team {
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
            created_at: None,
        };
        return Json(team).into_response();
    }

    (StatusCode::NOT_FOUND, "Team not found").into_response()
}

pub async fn get_player_by_slug(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    // Basic join to get team initials/name if needed by frontend
    let sql = "SELECT p.*, t.name as team_name, t.initials as team_initials 
               FROM players p 
               LEFT JOIN teams t ON p.team_id = t.id 
               WHERE p.slug = ? LIMIT 1";
    
    let mut rows = match state.db.client.query(sql, libsql::params![slug]).await {
        Ok(rows) => rows,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    };

    if let Ok(Some(row)) = rows.next().await {
        // We'll return a JSON with player info and nested team info to satisfy frontend
        let player_json = serde_json::json!({
            "id": row.get::<String>(0).unwrap_or_default(),
            "team_id": row.get::<Option<String>>(1).unwrap_or_default(),
            "name": row.get::<String>(2).unwrap_or_default(),
            "slug": row.get::<String>(3).unwrap_or_default(),
            "role": row.get::<Option<String>>(4).unwrap_or_default(),
            "specialization": row.get::<Option<String>>(5).unwrap_or_default(),
            "dob": row.get::<Option<String>>(6).unwrap_or_default(),
            "style_batting": row.get::<Option<String>>(7).unwrap_or_default(),
            "style_bowling": row.get::<Option<String>>(8).unwrap_or_default(),
            "image": row.get::<Option<String>>(9).unwrap_or_default(),
            "bio": row.get::<Option<String>>(10).unwrap_or_default(),
            "matches_played": row.get::<i32>(11).unwrap_or(0),
            "total_runs": row.get::<i32>(12).unwrap_or(0),
            "total_balls_faced": row.get::<i32>(13).unwrap_or(0),
            "strike_rate": row.get::<String>(14).unwrap_or_else(|_| "0.00".to_string()),
            "highest_score": row.get::<i32>(15).unwrap_or(0),
            "fifties": row.get::<i32>(16).unwrap_or(0),
            "wickets": row.get::<i32>(17).unwrap_or(0),
            "overs_bowled": row.get::<String>(18).unwrap_or_else(|_| "0.0".to_string()),
            "runs_conceded": row.get::<i32>(19).unwrap_or(0),
            "economy": row.get::<String>(20).unwrap_or_else(|_| "0.00".to_string()),
            "teams": {
                "name": row.get::<Option<String>>(23).unwrap_or_default(),
                "initials": row.get::<Option<String>>(24).unwrap_or_default(),
            }
        });
        return Json(player_json).into_response();
    }

    (StatusCode::NOT_FOUND, "Player not found").into_response()
}

pub async fn get_scorecard_batting(
    State(state): State<Arc<AppState>>,
    Path(match_id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT sb.*, p.name as player_name 
               FROM scorecard_batting sb 
               JOIN players p ON sb.player_id = p.id 
               WHERE sb.match_id = ? 
               ORDER BY sb.order_index ASC";
    
    let mut rows = match state.db.client.query(sql, libsql::params![match_id]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut records = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        records.push(serde_json::json!({
            "id": row.get::<String>(0).unwrap_or_default(),
            "match_id": row.get::<String>(1).unwrap_or_default(),
            "team_id": row.get::<String>(2).unwrap_or_default(),
            "player_id": row.get::<String>(3).unwrap_or_default(),
            "runs": row.get::<i32>(4).unwrap_or(0),
            "balls": row.get::<i32>(5).unwrap_or(0),
            "fours": row.get::<i32>(6).unwrap_or(0),
            "sixes": row.get::<i32>(7).unwrap_or(0),
            "out_info": row.get::<Option<String>>(8).unwrap_or_default(),
            "is_not_out": row.get::<i32>(9).unwrap_or(0) != 0,
            "player": {
                "name": row.get::<String>(11).unwrap_or_default()
            }
        }));
    }

    Json(records).into_response()
}

pub async fn get_scorecard_bowling(
    State(state): State<Arc<AppState>>,
    Path(match_id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT sb.*, p.name as player_name 
               FROM scorecard_bowling sb 
               JOIN players p ON sb.player_id = p.id 
               WHERE sb.match_id = ? 
               ORDER BY sb.order_index ASC";
    
    let mut rows = match state.db.client.query(sql, libsql::params![match_id]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut records = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        records.push(serde_json::json!({
            "id": row.get::<String>(0).unwrap_or_default(),
            "match_id": row.get::<String>(1).unwrap_or_default(),
            "team_id": row.get::<String>(2).unwrap_or_default(),
            "player_id": row.get::<String>(3).unwrap_or_default(),
            "overs": row.get::<String>(4).unwrap_or_else(|_| "0.0".to_string()),
            "runs": row.get::<i32>(5).unwrap_or(0),
            "wickets": row.get::<i32>(6).unwrap_or(0),
            "player": {
                "name": row.get::<String>(8).unwrap_or_default()
            }
        }));
    }

    Json(records).into_response()
}

pub async fn get_team_players(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT * FROM players WHERE team_id = ?";
    let mut rows = match state.db.client.query(sql, libsql::params![id]).await {
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

pub async fn get_team_matches(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT * FROM matches WHERE team1_id = ? OR team2_id = ? ORDER BY date DESC";
    let mut rows = match state.db.client.query(sql, libsql::params![id.clone(), id]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut matches = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        matches.push(serde_json::json!({
            "id": row.get::<String>(0).ok(),
            "slug": row.get::<String>(1).ok(),
            "team1_id": row.get::<Option<String>>(2).ok(),
            "team2_id": row.get::<Option<String>>(3).ok(),
            "t1": row.get::<Option<String>>(4).ok(),
            "t2": row.get::<Option<String>>(5).ok(),
            "i1": row.get::<Option<String>>(6).ok(),
            "i2": row.get::<Option<String>>(7).ok(),
            "date": row.get::<Option<String>>(8).ok(),
            "time": row.get::<Option<String>>(9).ok(),
            "venue": row.get::<Option<String>>(10).ok(),
            "status": row.get::<String>(11).ok(),
            "match_number": row.get::<Option<String>>(12).ok(),
            "stage": row.get::<Option<String>>(13).ok(),
            "team1_score": row.get::<Option<String>>(14).ok(),
            "team2_score": row.get::<Option<String>>(15).ok(),
            "result_text": row.get::<Option<String>>(16).ok(),
            "pom_text": row.get::<Option<String>>(17).ok(),
            "winner_id": row.get::<Option<String>>(18).ok(),
        }));
    }

    Json(matches).into_response()
}

pub async fn get_team_scorecards_batting(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT sb.*, p.name as player_name 
               FROM scorecard_batting sb 
               JOIN players p ON sb.player_id = p.id 
               WHERE sb.team_id = ? 
               ORDER BY sb.runs DESC";
    
    let mut rows = match state.db.client.query(sql, libsql::params![id]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut records = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        records.push(serde_json::json!({
            "id": row.get::<String>(0).ok(),
            "match_id": row.get::<String>(1).ok(),
            "team_id": row.get::<String>(2).ok(),
            "player_id": row.get::<String>(3).ok(),
            "runs": row.get::<i32>(4).ok(),
            "balls": row.get::<i32>(5).ok(),
            "fours": row.get::<i32>(6).ok(),
            "sixes": row.get::<i32>(7).ok(),
            "out_info": row.get::<Option<String>>(8).ok(),
            "is_not_out": row.get::<i32>(9).unwrap_or(0) != 0,
            "player": {
                "name": row.get::<String>(11).ok()
            }
        }));
    }

    Json(records).into_response()
}

pub async fn get_team_scorecards_bowling(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let sql = "SELECT sb.*, p.name as player_name 
               FROM scorecard_bowling sb 
               JOIN players p ON sb.player_id = p.id 
               WHERE sb.team_id = ? 
               ORDER BY sb.wickets DESC";
    
    let mut rows = match state.db.client.query(sql, libsql::params![id]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "DB Error").into_response(),
    };

    let mut records = Vec::new();
    while let Ok(Some(row)) = rows.next().await {
        records.push(serde_json::json!({
            "id": row.get::<String>(0).ok(),
            "match_id": row.get::<String>(1).ok(),
            "team_id": row.get::<String>(2).ok(),
            "player_id": row.get::<String>(3).ok(),
            "overs": row.get::<String>(4).ok(),
            "runs": row.get::<i32>(5).ok(),
            "wickets": row.get::<i32>(6).ok(),
            "player": {
                "name": row.get::<String>(8).ok()
            }
        }));
    }

    Json(records).into_response()
}

pub async fn delete_player(

// UPLOAD HANDLER
pub async fn upload_handler(mut multipart: Multipart) -> impl IntoResponse {
    if let Ok(Some(field)) = multipart.next_field().await {
        let name = field.name().unwrap_or("file").to_string();
        let file_name = field.file_name().unwrap_or("upload.png").to_string();
        let content_type = field.content_type().unwrap_or("image/png").to_string();
        
        match field.bytes().await {
            Ok(data) => {
                let base64_data = general_purpose::STANDARD.encode(data);
                let data_url = format!("data:{};base64,{}", content_type, base64_data);
                return Json(serde_json::json!({
                    "url": data_url,
                    "name": name,
                    "fileName": file_name
                })).into_response();
            }
            Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Upload error: {}", e)).into_response(),
        }
    }

    (StatusCode::BAD_REQUEST, "No file provided").into_response()
}

pub async fn upsert_scorecard_batting(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ScorecardBatting>,
) -> impl IntoResponse {
    let sql = "INSERT INTO scorecard_batting (id, match_id, team_id, player_id, runs, balls, fours, sixes, out_info, is_not_out, order_index) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
               ON CONFLICT(match_id, player_id) DO UPDATE SET 
               runs=excluded.runs, balls=excluded.balls, fours=excluded.fours, sixes=excluded.sixes, 
               out_info=excluded.out_info, is_not_out=excluded.is_not_out";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };
    
    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id, payload.team_id, payload.player_id, payload.runs, payload.balls, payload.fours, payload.sixes, 
        payload.out_info, payload.is_not_out as i32, payload.order_index
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

pub async fn upsert_scorecard_bowling(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ScorecardBowling>,
) -> impl IntoResponse {
    let sql = "INSERT INTO scorecard_bowling (id, match_id, team_id, player_id, overs, runs, wickets, order_index) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
               ON CONFLICT(match_id, player_id) DO UPDATE SET 
               overs=excluded.overs, runs=excluded.runs, wickets=excluded.wickets";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };
    
    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id, payload.team_id, payload.player_id, payload.overs, payload.runs, payload.wickets, payload.order_index
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}
