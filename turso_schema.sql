-- ============================================================
-- BSCCA App - Turso (LibSQL) Schema
-- ============================================================

-- ── 1. DROP EXISTING TABLES ──
DROP TABLE IF EXISTS scorecard_bowling;
DROP TABLE IF EXISTS scorecard_batting;
DROP TABLE IF EXISTS live_match_details;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

-- ── 2. CREATE TABLES ──

-- Teams Table
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    location TEXT,
    initials TEXT,
    description TEXT,
    image TEXT,
    achievements TEXT, -- Store as JSON array string
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    nrr TEXT DEFAULT '0.000',
    total_runs_scored INTEGER DEFAULT 0,
    total_overs_faced REAL DEFAULT 0,
    total_runs_conceded INTEGER DEFAULT 0,
    total_overs_bowled REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'Batsman',
    specialization TEXT DEFAULT 'General',
    dob TEXT,
    style_batting TEXT DEFAULT 'Right-Handed',
    style_bowling TEXT DEFAULT 'Right-Arm Medium',
    image TEXT,
    bio TEXT,
    matches_played INTEGER DEFAULT 0,
    total_runs INTEGER DEFAULT 0,
    total_balls_faced INTEGER DEFAULT 0,
    strike_rate TEXT DEFAULT '0.00',
    highest_score INTEGER DEFAULT 0,
    fifties INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    overs_bowled TEXT DEFAULT '0.0',
    runs_conceded INTEGER DEFAULT 0,
    economy TEXT DEFAULT '0.00',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    team1_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    team2_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    t1 TEXT,
    t2 TEXT,
    i1 TEXT,
    i2 TEXT,
    date TEXT,
    time TEXT,
    venue TEXT,
    status TEXT DEFAULT 'upcoming',
    match_number TEXT,
    stage TEXT DEFAULT 'League',
    team1_score TEXT,
    team2_score TEXT,
    result_text TEXT,
    pom_text TEXT,
    winner_id TEXT REFERENCES teams(id),
    match_type TEXT DEFAULT 'tournament', -- Added from component logic
    tournament_id TEXT, -- Added from component logic
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('upcoming', 'live', 'finished'))
);

-- Live Match Details
CREATE TABLE live_match_details (
    id TEXT PRIMARY KEY,
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
    team1_id TEXT REFERENCES teams(id),
    team2_id TEXT REFERENCES teams(id),
    team1_score TEXT DEFAULT '0/0',
    team1_overs TEXT DEFAULT '0.0',
    team2_score TEXT DEFAULT '0/0',
    team2_overs TEXT DEFAULT '0.0',
    team1_status TEXT DEFAULT 'Batting', -- Added for clarity
    team2_status TEXT DEFAULT 'Yet to Bat',
    toss_winner_id TEXT REFERENCES teams(id),
    match_status_text TEXT,
    current_batter_1_id TEXT REFERENCES players(id),
    current_batter_1_runs INTEGER DEFAULT 0,
    current_batter_1_balls INTEGER DEFAULT 0,
    current_batter_2_id TEXT REFERENCES players(id),
    current_batter_2_runs INTEGER DEFAULT 0,
    current_batter_2_balls INTEGER DEFAULT 0,
    current_bowler_id TEXT REFERENCES players(id),
    current_bowler_wickets INTEGER DEFAULT 0,
    current_bowler_runs INTEGER DEFAULT 0,
    current_bowler_overs TEXT DEFAULT '0.0',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scorecard Batting
CREATE TABLE scorecard_batting (
    id TEXT PRIMARY KEY,
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES teams(id),
    player_id TEXT REFERENCES players(id),
    runs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    out_info TEXT,
    is_not_out BOOLEAN DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    UNIQUE(match_id, player_id)
);

-- Scorecard Bowling
CREATE TABLE scorecard_bowling (
    id TEXT PRIMARY KEY,
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES teams(id),
    player_id TEXT REFERENCES players(id),
    overs TEXT DEFAULT '0.0',
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    UNIQUE(match_id, player_id)
);

-- News Table
CREATE TABLE news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    time_label TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments Table (Inferred from component usage)
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
