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
use crate::cricket;

pub struct AppState {
    pub db: Arc<Database>,
    pub tx: broadcast::Sender<String>,
    pub http: reqwest::Client,
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
            total_balls_faced: row.get(13).unwrap_or(0),
            total_runs_conceded: row.get(14).unwrap_or(0),
            total_balls_bowled: row.get(15).unwrap_or(0),
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
            status: row.get(6).unwrap_or_else(|_| "scheduled".to_string()),
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
                    total_balls_faced: 0,
                    total_runs_conceded: 0,
                    total_balls_bowled: 0,
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
    let sql = "UPDATE matches SET slug=?, team1_id=?, team2_id=?, t1=?, t2=?, i1=?, i2=?, date=?, time=?, venue=?, status=?, match_number=?, stage=?, team1_score=?, team2_score=?, result_text=?, pom_text=?, winner_id=?, match_type=?, tournament_id=? WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.slug, payload.team1_id, payload.team2_id, payload.t1, payload.t2, payload.i1, payload.i2, payload.date, payload.time, payload.venue, payload.status, payload.match_number, payload.stage, payload.team1_score, payload.team2_score, payload.result_text.unwrap_or_default(), payload.pom_text.unwrap_or_default(), payload.winner_id, payload.match_type, payload.tournament_id,
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
    let sql = "INSERT INTO live_match_details (id, match_id, team1_id, team2_id, team1_score, team1_overs, team2_score, team2_overs, team1_status, team2_status, toss_winner_id, match_status_text, current_batter_1_id, current_batter_1_runs, current_batter_1_balls, current_batter_2_id, current_batter_2_runs, current_batter_2_balls, current_bowler_id, current_bowler_wickets, current_bowler_runs, current_bowler_overs) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
               ON CONFLICT(match_id) DO UPDATE SET 
               team1_score=excluded.team1_score, team1_overs=excluded.team1_overs, 
               team2_score=excluded.team2_score, team2_overs=excluded.team2_overs, 
               team1_status=excluded.team1_status, team2_status=excluded.team2_status, 
               toss_winner_id=excluded.toss_winner_id, 
               match_status_text=excluded.match_status_text,
               current_batter_1_id=excluded.current_batter_1_id, 
               current_batter_1_runs=excluded.current_batter_1_runs, 
               current_batter_1_balls=excluded.current_batter_1_balls,
               current_batter_2_id=excluded.current_batter_2_id, 
               current_batter_2_runs=excluded.current_batter_2_runs, 
               current_batter_2_balls=excluded.current_batter_2_balls,
               current_bowler_id=excluded.current_bowler_id, 
               current_bowler_wickets=excluded.current_bowler_wickets, 
               current_bowler_runs=excluded.current_bowler_runs, 
               current_bowler_overs=excluded.current_bowler_overs,
               last_updated=CURRENT_TIMESTAMP";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };

    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id.clone(), payload.team1_id, payload.team2_id, payload.team1_score, payload.team1_overs, payload.team2_score, payload.team2_overs, payload.team1_status, payload.team2_status, payload.toss_winner_id, payload.match_status_text,
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
    pub pom_text: Option<String>,
}

pub async fn finish_match(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<FinishMatchPayload>,
) -> impl IntoResponse {
    // 1. Fetch live details first to get the final balls/runs
    let mut rows = match state.db.client.query("SELECT * FROM live_match_details WHERE match_id = ?", libsql::params![payload.match_id.clone()]).await {
        Ok(rows) => rows,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch live details").into_response(),
    };

    let live_details = if let Ok(Some(row)) = rows.next().await {
        row
    } else {
        return (StatusCode::NOT_FOUND, "Live details not found").into_response();
    };

    let team1_id: String = live_details.get(2).unwrap_or_default();
    let team2_id: String = live_details.get(3).unwrap_or_default();
    let team1_score_str: String = live_details.get(4).unwrap_or_default();
    let team1_overs_str: String = live_details.get(5).unwrap_or_default();
    let team2_score_str: String = live_details.get(6).unwrap_or_default();
    let team2_overs_str: String = live_details.get(7).unwrap_or_default();

    let team1_runs = team1_score_str.split('/').next().unwrap_or("0").parse::<i32>().unwrap_or(0);
    let team1_balls = cricket::overs_string_to_balls(&team1_overs_str);
    let team2_runs = team2_score_str.split('/').next().unwrap_or("0").parse::<i32>().unwrap_or(0);
    let team2_balls = cricket::overs_string_to_balls(&team2_overs_str);

    // 2. Update match status
    let _ = state.db.client.execute(
        "UPDATE matches SET status = 'finished', team1_score = ?, team2_score = ?, winner_id = ?, result_text = ?, pom_text = ? WHERE id = ?",
        libsql::params![payload.team1_score, payload.team2_score, payload.winner_id.clone(), payload.result_text.unwrap_or_default(), payload.pom_text.unwrap_or_default(), payload.match_id.clone()]
    ).await;

    // 3. Update Team Stats (Automation)
    async fn update_team(state: &Arc<AppState>, team_id: &str, runs_scored: i32, balls_faced: i32, runs_conceded: i32, balls_bowled: i32, is_win: bool) {
        let mut rows = state.db.client.query("SELECT * FROM teams WHERE id = ?", libsql::params![team_id]).await.unwrap();
        if let Ok(Some(row)) = rows.next().await {
            let mut played: i32 = row.get(8).unwrap_or(0);
            let mut won: i32 = row.get(9).unwrap_or(0);
            let mut lost: i32 = row.get(10).unwrap_or(0);
            let mut total_runs_scored: i32 = row.get(12).unwrap_or(0);
            let mut total_balls_faced: i32 = row.get(13).unwrap_or(0);
            let mut total_runs_conceded: i32 = row.get(14).unwrap_or(0);
            let mut total_balls_bowled: i32 = row.get(15).unwrap_or(0);

            played += 1;
            if is_win { won += 1; } else { lost += 1; }
            total_runs_scored += runs_scored;
            total_balls_faced += balls_faced;
            total_runs_conceded += runs_conceded;
            total_balls_bowled += balls_bowled;

            let nrr = cricket::calculate_nrr(total_runs_scored, total_balls_faced, total_runs_conceded, total_balls_bowled);

            let _ = state.db.client.execute(
                "UPDATE teams SET played=?, won=?, lost=?, nrr=?, total_runs_scored=?, total_balls_faced=?, total_runs_conceded=?, total_balls_bowled=? WHERE id=?",
                libsql::params![played, won, lost, nrr, total_runs_scored, total_balls_faced, total_runs_conceded, total_balls_bowled, team_id]
            ).await;
        }
    }

    update_team(&state, &team1_id, team1_runs, team1_balls, team2_runs, team2_balls, payload.winner_id == team1_id).await;
    update_team(&state, &team2_id, team2_runs, team2_balls, team1_runs, team1_balls, payload.winner_id == team2_id).await;

    // 4. Update Player Stats (Automation)
    // Batting stats
    let mut batting_rows = state.db.client.query("SELECT * FROM scorecard_batting WHERE match_id = ?", libsql::params![payload.match_id.clone()]).await.unwrap();
    while let Ok(Some(row)) = batting_rows.next().await {
        let p_id: String = row.get(3).unwrap_or_default();
        let p_runs: i32 = row.get(6).unwrap_or(0);
        let p_balls: i32 = row.get(7).unwrap_or(0);
        let p_is_not_out: i32 = row.get(11).unwrap_or(0);
        
        let _ = state.db.client.execute(
            "UPDATE players SET matches_played = matches_played + 1, total_runs = total_runs + ?, total_balls_faced = total_balls_faced + ?, highest_score = MAX(highest_score, ?), fifties = fifties + (CASE WHEN ? >= 50 THEN 1 ELSE 0 END) WHERE id = ?",
            libsql::params![p_runs, p_balls, p_runs, p_runs, p_id]
        ).await;
    }
    
    // Bowling stats
    let mut bowling_rows = state.db.client.query("SELECT * FROM scorecard_bowling WHERE match_id = ?", libsql::params![payload.match_id.clone()]).await.unwrap();
    while let Ok(Some(row)) = bowling_rows.next().await {
        let p_id: String = row.get(3).unwrap_or_default();
        let p_balls: i32 = row.get(6).unwrap_or(0);
        let p_runs: i32 = row.get(7).unwrap_or(0);
        let p_wickets: i32 = row.get(8).unwrap_or(0);
        
        // We'll calculate economy later in a getter or here. Let's just update raw totals.
        let _ = state.db.client.execute(
            "UPDATE players SET wickets = wickets + ?, runs_conceded = runs_conceded + ?, matches_played = matches_played + 1 WHERE id = ?",
            libsql::params![p_wickets, p_runs, p_id]
        ).await;
    }

    broadcast_update(&state, &payload.match_id).await;
    StatusCode::OK.into_response()
}

// TEAM HANDLERS
pub async fn create_team(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Team>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO teams (id, name, slug, location, initials, description, image, played, won, lost, nrr, total_runs_scored, total_balls_faced, total_runs_conceded, total_balls_bowled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.name, payload.slug, payload.location, payload.initials, payload.description, payload.image, payload.played, payload.won, payload.lost, payload.nrr,
        payload.total_runs_scored, payload.total_balls_faced, payload.total_runs_conceded, payload.total_balls_bowled
    ]).await;

    match res {
        Ok(_) => Json(id).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

pub async fn update_team(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<Team>,
) -> impl IntoResponse {
    let sql = "UPDATE teams SET name=?, slug=?, location=?, initials=?, description=?, image=?, played=?, won=?, lost=?, nrr=?, total_runs_scored=?, total_balls_faced=?, total_runs_conceded=?, total_balls_bowled=? WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.name, payload.slug, payload.location, payload.initials, payload.description, payload.image, payload.played, payload.won, payload.lost, payload.nrr,
        payload.total_runs_scored, payload.total_balls_faced, payload.total_runs_conceded, payload.total_balls_bowled, id.clone()
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
    // Also clean up players referencing this team
    let _ = state.db.client.execute("UPDATE players SET team_id = NULL WHERE team_id = ?", libsql::params![id.clone()]).await;
    let _ = state.db.client.execute("DELETE FROM tournament_teams WHERE team_id = ?", libsql::params![id.clone()]).await;
    let res = state.db.client.execute("DELETE FROM teams WHERE id = ?", libsql::params![id]).await;

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
            total_balls_faced: row.get(13).unwrap_or(0),
            total_runs_conceded: row.get(14).unwrap_or(0),
            total_balls_bowled: row.get(15).unwrap_or(0),
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
                "name": row.get::<Option<String>>(22).unwrap_or_default(),
                "initials": row.get::<Option<String>>(23).unwrap_or_default(),
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
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let res = state.db.client.execute("DELETE FROM players WHERE id = ?", libsql::params![id]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn create_player(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Player>,
) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let sql = "INSERT INTO players (id, team_id, name, slug, role, specialization, dob, style_batting, style_bowling, image, bio, matches_played, total_runs, total_balls_faced, strike_rate, highest_score, fifties, wickets, overs_bowled, runs_conceded, economy) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let res = state.db.client.execute(sql, libsql::params![
        id.clone(), payload.team_id, payload.name, payload.slug, payload.role, payload.specialization,
        payload.dob, payload.style_batting, payload.style_bowling, payload.image, payload.bio,
        payload.matches_played, payload.total_runs, payload.total_balls_faced, payload.strike_rate,
        payload.highest_score, payload.fifties, payload.wickets, payload.overs_bowled, payload.runs_conceded, payload.economy
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
    let sql = "UPDATE players SET team_id=?, name=?, slug=?, role=?, specialization=?, dob=?, style_batting=?, style_bowling=?, image=?, bio=?, matches_played=?, total_runs=?, total_balls_faced=?, strike_rate=?, highest_score=?, fifties=?, wickets=?, overs_bowled=?, runs_conceded=?, economy=?, last_updated=CURRENT_TIMESTAMP WHERE id=?";
    let res = state.db.client.execute(sql, libsql::params![
        payload.team_id, payload.name, payload.slug, payload.role, payload.specialization,
        payload.dob, payload.style_batting, payload.style_bowling, payload.image, payload.bio,
        payload.matches_played, payload.total_runs, payload.total_balls_faced, payload.strike_rate,
        payload.highest_score, payload.fifties, payload.wickets, payload.overs_bowled, payload.runs_conceded, payload.economy,
        id
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

// UPLOAD HANDLER
pub async fn upload_handler(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let mut file_data = Vec::new();
    let mut file_name = String::new();

    while let Ok(Some(field)) = multipart.next_field().await {
        let field_name = field.name().unwrap_or_default().to_string();
        if field_name == "file" {
            file_name = field.file_name().unwrap_or("upload.jpg").to_string();
            file_data = field.bytes().await.unwrap_or_default().to_vec();
        }
    }

    if file_data.is_empty() {
        return (StatusCode::BAD_REQUEST, "No file provided").into_response();
    }

    // Modern "Guru" Logic: Upload to Hugging Face Hub (Private Dataset)
    let hf_token = std::env::var("HF_TOKEN").unwrap_or_default();
    let repo_id = std::env::var("HF_REPO_ID").unwrap_or_else(|_| "bscca-platform/bscca-app-backend".to_string());
    
    // Generate a unique path: uploads/UUID_filename
    let unique_name = format!("{}_{}", Uuid::new_v4(), file_name);
    let path = format!("uploads/{}", unique_name);
    
    let url = format!("https://huggingface.co/api/datasets/{}/upload/main/{}", repo_id, path);

    let res = state.http.post(url)
        .header("Authorization", format!("Bearer {}", hf_token))
        .body(file_data)
        .send()
        .await;

    match res {
        Ok(resp) if resp.status().is_success() => {
            // New persistent URL (via resolve for direct image access)
            let public_url = format!("https://huggingface.co/datasets/{}/resolve/main/{}", repo_id, path);
            Json(serde_json::json!({ "url": public_url })).into_response()
        },
        _ => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to upload to Hugging Face").into_response(),
    }
}

pub async fn upsert_scorecard_batting(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ScorecardBatting>,
) -> impl IntoResponse {
    let sql = "INSERT INTO scorecard_batting (id, match_id, team_id, player_id, player_name, team_name, runs, balls, fours, sixes, out_info, is_not_out, order_index) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
               ON CONFLICT(match_id, player_id) DO UPDATE SET 
               runs=excluded.runs, balls=excluded.balls, fours=excluded.fours, sixes=excluded.sixes, 
               out_info=excluded.out_info, is_not_out=excluded.is_not_out, 
               player_name=excluded.player_name, team_name=excluded.team_name";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };
    
    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id, payload.team_id, payload.player_id, payload.player_name, payload.team_name,
        payload.runs, payload.balls, payload.fours, payload.sixes, 
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
    let sql = "INSERT INTO scorecard_bowling (id, match_id, team_id, player_id, player_name, team_name, overs_balls, runs, wickets, order_index) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
               ON CONFLICT(match_id, player_id) DO UPDATE SET 
               overs_balls=excluded.overs_balls, runs=excluded.runs, wickets=excluded.wickets,
               player_name=excluded.player_name, team_name=excluded.team_name";
    
    let id = if payload.id.is_empty() { Uuid::new_v4().to_string() } else { payload.id };
    
    let res = state.db.client.execute(sql, libsql::params![
        id, payload.match_id, payload.team_id, payload.player_id, payload.player_name, payload.team_name,
        payload.overs_balls, payload.runs, payload.wickets, payload.order_index
    ]).await;

    match res {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("DB Error: {}", e)).into_response(),
    }
}

pub async fn get_admin_stats(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let players_count = match state.db.client.query("SELECT COUNT(*) FROM players", ()).await {
        Ok(mut rows) => rows.next().await.ok().flatten().map(|r| r.get::<i64>(0).unwrap_or(0)).unwrap_or(0),
        Err(_) => 0,
    };

    let teams_count = match state.db.client.query("SELECT COUNT(*) FROM teams", ()).await {
        Ok(mut rows) => rows.next().await.ok().flatten().map(|r| r.get::<i64>(0).unwrap_or(0)).unwrap_or(0),
        Err(_) => 0,
    };

    let matches_count = match state.db.client.query("SELECT COUNT(*) FROM matches", ()).await {
        Ok(mut rows) => rows.next().await.ok().flatten().map(|r| r.get::<i64>(0).unwrap_or(0)).unwrap_or(0),
        Err(_) => 0,
    };

    Json(serde_json::json!({
        "players": players_count,
        "teams": teams_count,
        "matches": matches_count,
        "revenue": "₹45K" // Kept hardcoded as per plan until revenue table exists
    }))
}
