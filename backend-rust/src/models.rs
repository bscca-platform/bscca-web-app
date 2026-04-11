use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Team {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub slug: String,
    pub location: Option<String>,
    pub initials: Option<String>,
    pub description: Option<String>,
    pub image: Option<String>,
    pub achievements: Option<String>,
    #[serde(default)]
    pub played: i32,
    #[serde(default)]
    pub won: i32,
    #[serde(default)]
    pub lost: i32,
    #[serde(default = "default_nrr")]
    pub nrr: String,
    #[serde(default)]
    pub total_runs_scored: i32,
    #[serde(default)]
    pub total_balls_faced: i32,
    #[serde(default)]
    pub total_runs_conceded: i32,
    #[serde(default)]
    pub total_balls_bowled: i32,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Player {
    #[serde(default)]
    pub id: String,
    pub team_id: Option<String>,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub slug: String,
    pub role: Option<String>,
    pub specialization: Option<String>,
    pub dob: Option<String>,
    pub style_batting: Option<String>,
    pub style_bowling: Option<String>,
    pub image: Option<String>,
    pub bio: Option<String>,
    #[serde(default)]
    pub matches_played: i32,
    #[serde(default)]
    pub total_runs: i32,
    #[serde(default)]
    pub total_balls_faced: i32,
    #[serde(default = "default_strike_rate")]
    pub strike_rate: String,
    #[serde(default)]
    pub highest_score: i32,
    #[serde(default)]
    pub fifties: i32,
    #[serde(default)]
    pub wickets: i32,
    #[serde(default = "default_overs_bowled")]
    pub overs_bowled: String,
    #[serde(default)]
    pub runs_conceded: i32,
    #[serde(default = "default_economy")]
    pub economy: String,
    pub last_updated: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Match {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
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
    #[serde(default = "default_status_upcoming")]
    pub status: String,
    pub match_number: Option<String>,
    pub stage: Option<String>,
    pub team1_score: Option<String>,
    pub team2_score: Option<String>,
    pub result_text: Option<String>,
    pub pom_text: Option<String>,
    pub winner_id: Option<String>,
    #[serde(default = "default_match_type")]
    pub match_type: String,
    pub tournament_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LiveMatchDetails {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub match_id: String,
    pub team1_id: Option<String>,
    #[serde(default)]
    pub team1_score: String,
    #[serde(default)]
    pub team1_overs: String,
    #[serde(default)]
    pub team1_status: String,
    pub team2_id: Option<String>,
    #[serde(default)]
    pub team2_score: String,
    #[serde(default)]
    pub team2_overs: String,
    #[serde(default)]
    pub team2_status: String,
    pub toss_winner_id: Option<String>,
    pub match_status_text: Option<String>,
    pub current_batter_1_id: Option<String>,
    #[serde(default)]
    pub current_batter_1_runs: i32,
    #[serde(default)]
    pub current_batter_1_balls: i32,
    pub current_batter_2_id: Option<String>,
    #[serde(default)]
    pub current_batter_2_runs: i32,
    #[serde(default)]
    pub current_batter_2_balls: i32,
    pub current_bowler_id: Option<String>,
    #[serde(default)]
    pub current_bowler_wickets: i32,
    #[serde(default)]
    pub current_bowler_runs: i32,
    #[serde(default)]
    pub current_bowler_overs: String,
    pub last_updated: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScorecardBatting {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub match_id: String,
    pub team_id: Option<String>,
    pub player_id: Option<String>,
    pub player_name: Option<String>,
    pub team_name: Option<String>,
    #[serde(default)]
    pub runs: i32,
    #[serde(default)]
    pub balls: i32,
    #[serde(default)]
    pub fours: i32,
    #[serde(default)]
    pub sixes: i32,
    pub out_info: Option<String>,
    #[serde(default)]
    pub is_not_out: bool,
    #[serde(default)]
    pub order_index: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScorecardBowling {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub match_id: String,
    pub team_id: Option<String>,
    pub player_id: Option<String>,
    pub player_name: Option<String>,
    pub team_name: Option<String>,
    #[serde(default)]
    pub overs_balls: i32,
    #[serde(default)]
    pub runs: i32,
    #[serde(default)]
    pub wickets: i32,
    #[serde(default)]
    pub order_index: i32,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct News {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub title: String,
    pub time_label: Option<String>,
    pub content: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Tournament {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    pub slug: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub description: Option<String>,
    #[serde(default = "default_status_scheduled")]
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub teams: Option<Vec<Team>>,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct TournamentTeam {
    #[serde(default)]
    pub tournament_id: String,
    #[serde(default)]
    pub team_id: String,
}

// Serde default functions
fn default_nrr() -> String { "0.000".to_string() }
fn default_strike_rate() -> String { "0.00".to_string() }
fn default_economy() -> String { "0.00".to_string() }
fn default_overs_bowled() -> String { "0.0".to_string() }
fn default_status_upcoming() -> String { "upcoming".to_string() }
fn default_match_type() -> String { "tournament".to_string() }
fn default_status_scheduled() -> String { "scheduled".to_string() }
