export interface Tournament {
    id?: string;
    name: string;
    slug: string;
    status: 'scheduled' | 'active' | 'completed';
    start_date?: string;
    end_date?: string;
    description?: string;
    created_at?: string;
    teams?: Team[];
}

export interface Team {
    id?: string;
    name: string;
    slug: string;
    location: string;
    initials: string;
    description?: string;
    image?: string;
    played?: number;
    won?: number;
    lost?: number;
    nrr?: string;
    achievements?: string[];
    squad?: string[]; // Array of player names or slugs
}

export interface Match {
    id?: string;
    slug: string;
    team1_id?: string;
    team2_id?: string;
    t1: string;
    t2: string;
    i1: string;
    i2: string;
    date: string;
    time: string;
    venue?: string;
    status?: "upcoming" | "finished" | "live";
    match_number?: string;
    stage?: string;
    match_type?: "tournament" | "normal";
    tournament_id?: string;
    team1_score?: string;
    team2_score?: string;
    result_text?: string;
    winner_id?: string;
    team1?: { name: string; initials: string };
    team2?: { name: string; initials: string };
}

export interface PlayerStat {
    name: string;
    team: string;
    value: string;
    label: string;
}

export interface PointTableEntry {
    t: string;
    p: number;
    w: number;
    l: number;
    nr: number;
    nrr: string;
    pt: number;
    form: ("W" | "L" | "N")[];
}

export interface NewsItem {
    id: number;
    title: string;
    time: string;
}

export interface ScorecardBattingPlayer {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    outInfo?: string;
    isNotOut?: boolean;
}

export interface ScorecardBowlingPlayer {
    name: string;
    overs: string;
    runs: number;
    wickets: number;
}

export interface CurrentBatter {
    name: string;
    runs: number;
    balls: number;
    isStriker: boolean;
}

export interface CurrentBowler {
    name: string;
    wickets: number;
    runs: number;
    overs: string;
}

export interface LiveMatchData {
    matchNumber: string;
    stage: string;
    venue: string;
    team1: {
        initials: string;
        name: string;
        score: string;
        overs: string;
        batting?: ScorecardBattingPlayer[];
        bowling?: ScorecardBowlingPlayer[];
        yetToBat?: string[];
    };
    team2: {
        initials: string;
        name: string;
        score: string;
        status: string;
        batting?: ScorecardBattingPlayer[];
        bowling?: ScorecardBowlingPlayer[];
        yetToBat?: string[];
    };
    toss: string;
    details: string;
    currentBatters: CurrentBatter[];
    currentBowler: CurrentBowler;
}
export interface Highlight {
    id: number;
    slug: string;
    title: string;
    description: string;
    match: string;
    thumbnail: string;
    videoUrl: string;
}
export interface TopPlayer {
    id: number;
    name: string;
    slug: string;
    team: string;
    role: string;
    specialization: string;
    dob: string;
    matches: number;
    style: {
        batting: string;
        bowling: string;
    };
    stats: string;
    image: string;
    bio?: string;
    statsDetail?: {
        label: string;
        value: string;
    }[];
}

export interface LastMatchData {
    matchNumber: string;
    stage: string;
    venue: string;
    team1: {
        initials: string;
        name: string;
        score: string;
    };
    team2: {
        initials: string;
        name: string;
        score: string;
    };
    result: string;
    mom: {
        name: string;
        stats: string;
    };
}

export interface Player {
    id: string;
    team_id?: string;
    name: string;
    slug: string;
    role?: string;
    specialization?: string;
    dob?: string;
    style_batting?: string;
    style_bowling?: string;
    image?: string;
    bio?: string;
    matches_played?: number;
    total_runs?: number;
    strike_rate?: string | number;
    highest_score?: number;
    fifties?: number;
    wickets?: number;
    overs_bowled?: string;
    runs_conceded?: number;
    economy?: string;
    teams?: {
        name: string;
        initials: string;
    };
}
