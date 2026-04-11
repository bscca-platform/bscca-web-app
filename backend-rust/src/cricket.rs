/// BSCCA Cricket Logic Library
/// Handles complex cricket math and statistics on the backend.

pub fn calculate_nrr(
    total_runs_scored: i32,
    total_balls_faced: i32,
    total_runs_conceded: i32,
    total_balls_bowled: i32,
) -> String {
    if total_balls_faced == 0 || total_balls_bowled == 0 {
        return "0.000".to_string();
    }

    let faced_overs = total_balls_faced as f64 / 6.0;
    let bowled_overs = total_balls_bowled as f64 / 6.0;

    let nrr = (total_runs_scored as f64 / faced_overs) - (total_runs_conceded as f64 / bowled_overs);
    
    let sign = if nrr > 0.0 { "+" } else { "" };
    format!("{}{:.3}", sign, nrr)
}

#[allow(dead_code)]
pub fn balls_to_overs_string(balls: i32) -> String {
    let overs = balls / 6;
    let rem = balls % 6;
    format!("{}.{}", overs, rem)
}

pub fn overs_string_to_balls(overs: &str) -> i32 {
    let parts: Vec<&str> = overs.split('.').collect();
    if parts.is_empty() { return 0; }
    
    let overs_val: i32 = parts[0].parse().unwrap_or(0);
    let balls_val: i32 = if parts.len() > 1 {
        parts[1].parse().unwrap_or(0)
    } else {
        0
    };
    
    overs_val * 6 + balls_val
}
