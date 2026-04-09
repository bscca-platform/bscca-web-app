use serde::{Deserialize, Serialize};
// No unused imports
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Team {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub location: Option<String>,
    pub initials: Option<String>,
    pub description: Option<String>,
    pub image: Option<String>,
    pub achievements: Option<String>, // JSON string
    pub played: i32,
    pub won: i32,
    pub lost: i32,
    pub nrr: String,
    pub total_runs_scored: i32,
    pub total_balls_faced: i32,
    pub total_runs_conceded: i32,
    pub total_balls_bowled: i32,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Player {
    pub id: String,
    pub team_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub role: Option<String>,
    pub specialization: Option<String>,
    pub dob: Option<String>,
    pub style_batting: Option<String>,
    pub style_bowling: Option<String>,
    pub image: Option<String>,
    pub bio: Option<String>,
    pub matches_played: i32,
    pub total_runs: i32,
    pub total_balls_faced: i32,
    pub strike_rate: String,
    pub highest_score: i32,
    pub fifties: i32,
    pub wickets: i32,
    pub overs_bowled: String,
    pub runs_conceded: i32,
    pub economy: String,
    pub last_updated: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Match {
    pub id: String,
    pub slug: String,
    pub team1_id: Option<String>,
    pub team2_id: Option<String>,
    pub t1: Option<String>,
    pub t2: Option<String>,
    pub i1: Option<String>,
    pub i2: Option<String>,
    pub date: Option<String>,
    pub time: Option<String>,
    pub venue: Option<String>,
    pub status: String,
    pub match_number: Option<String>,
    pub stage: Option<String>,
    pub team1_score: Option<String>,
    pub team2_score: Option<String>,
    pub result_text: Option<String>,
    pub pom_text: Option<String>,
    pub winner_id: Option<String>,
    pub match_type: String,
    pub tournament_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LiveMatchDetails {
    pub id: String,
    pub match_id: String,
    pub team1_id: Option<String>,
    pub team1_score: String,
    pub team1_overs: String,
    pub team1_status: String,
    pub team2_id: Option<String>,
    pub team2_score: String,
    pub team2_overs: String,
    pub team2_status: String,
    pub toss_winner_id: Option<String>,
    pub match_status_text: Option<String>,
    pub current_batter_1_id: Option<String>,
    pub current_batter_1_runs: i32,
    pub current_batter_1_balls: i32,
    pub current_batter_2_id: Option<String>,
    pub current_batter_2_runs: i32,
    pub current_batter_2_balls: i32,
    pub current_bowler_id: Option<String>,
    pub current_bowler_wickets: i32,
    pub current_bowler_runs: i32,
    pub current_bowler_overs: String,
    pub last_updated: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScorecardBatting {
    pub id: String,
    pub match_id: String,
    pub team_id: Option<String>,
    pub player_id: Option<String>,
    pub player_name: Option<String>,
    pub team_name: Option<String>,
    pub runs: i32,
    pub balls: i32,
    pub fours: i32,
    pub sixes: i32,
    pub out_info: Option<String>,
    pub is_not_out: bool,
    pub order_index: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScorecardBowling {
    pub id: String,
    pub match_id: String,
    pub team_id: Option<String>,
    pub player_id: Option<String>,
    pub player_name: Option<String>,
    pub team_name: Option<String>,
    pub overs_balls: i32,
    pub runs: i32,
    pub wickets: i32,
    pub order_index: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct News {
    pub id: String,
    pub title: String,
    pub time_label: Option<String>,
    pub content: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Tournament {
    pub id: String,
    pub name: String,
    pub slug: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub description: Option<String>,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub teams: Option<Vec<Team>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TournamentTeam {
    pub tournament_id: String,
    pub team_id: String,
}
