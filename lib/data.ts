/**
 * ── BSCCA Data Defaults ──
 * Empty defaults used as initial state before Supabase data loads.
 * No hardcoded mock data — everything comes from the database.
 */

import { Team, Match, PlayerStat, PointTableEntry, NewsItem, LiveMatchData, Highlight, TopPlayer, LastMatchData } from "./types";

// Empty defaults
export const TEAMS: Team[] = [];
export const UPCOMING_MATCHES: Match[] = [];
export const HIGHLIGHTS: Highlight[] = [];
export const TOP_PLAYERS: TopPlayer[] = [];
export const NEWS: NewsItem[] = [];
export const POINTS_TABLE: PointTableEntry[] = [];

export const TOP_SCORER: PlayerStat = { name: "—", team: "—", value: "0 Runs", label: "Top Scorer" };
export const TOP_BOWLER: PlayerStat = { name: "—", team: "—", value: "0 Wkts", label: "Top Bowler" };

export const LIVE_MATCH: LiveMatchData = {
    matchNumber: "0",
    stage: "—",
    venue: "—",
    team1: { initials: "—", name: "—", score: "0/0", overs: "0.0", batting: [], bowling: [] },
    team2: { initials: "—", name: "—", score: "0/0", status: "No Live Match", batting: [], bowling: [] },
    toss: "—",
    details: "No live match at the moment",
    currentBatters: [],
    currentBowler: { name: "—", wickets: 0, runs: 0, overs: "0.0" },
};

export const LAST_MATCH: LastMatchData = {
    matchNumber: "0",
    stage: "—",
    venue: "—",
    team1: { initials: "—", name: "—", score: "0/0" },
    team2: { initials: "—", name: "—", score: "0/0" },
    result: "No matches played yet",
    mom: { name: "—", stats: "—" },
};
