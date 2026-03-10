"use client";

import { useState, useEffect, useCallback } from "react";
import { api, getSSEUrl } from "@/lib/api";
import { useMatches } from "@/hooks/useMatches";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayers";
import {
    incrementOvers, parseScore, buildScore, strikeRate,
    economy, runRate, oversToBalls, ballsToOvers, calculateNRR
} from "@/lib/cricket-math";
import {
    Zap, ChevronLeft, RotateCcw, ArrowLeftRight,
    UserPlus, Target, Trophy, AlertCircle, Radio
} from "lucide-react";

// ─── Types ───
interface BallEvent {
    runs: number;
    extras: string | null; // "WD" | "NB" | "B" | "LB" | null
    isWicket: boolean;
    batter: string;
    bowler: string;
    overNum: number;
    ballNum: number;
    scoreAfter: string;
}

type Step = "select" | "toss" | "scoring";

export default function AdminUpdatesPage() {
    const { matches, loading: matchesLoading } = useMatches();
    const { teams } = useTeams();
    const { players } = usePlayers();

    const [step, setStep] = useState<Step>("select");
    const [matchId, setMatchId] = useState<string | null>(null);
    const [matchData, setMatchData] = useState<any>(null);
    const [liveDetails, setLiveDetails] = useState<any>(null);

    // Toss state
    const [tossWinner, setTossWinner] = useState<string>("");
    const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");

    // Scoring state
    const [loading, setLoading] = useState(false);
    const [ballLog, setBallLog] = useState<BallEvent[]>([]);
    const [showBatterPicker, setShowBatterPicker] = useState<1 | 2 | null>(null);
    const [showBowlerPicker, setShowBowlerPicker] = useState(false);

    const upcomingMatches = matches.filter((m: any) => m.status === "upcoming");
    const liveMatches = matches.filter((m: any) => m.status === "live");

    // ─── Fetch Live Details ───
    const fetchLive = useCallback(async () => {
        if (!matchId) return;
        try {
            const data = await api.getLiveMatch();
            if (data && data.match_id === matchId) {
                setLiveDetails(data);
            }
        } catch (err) {
            console.error("Fetch live failed:", err);
        }
    }, [matchId]);

    useEffect(() => {
        fetchLive();
        if (!matchId) return;

        const eventSource = new EventSource(getSSEUrl('/events'));
        eventSource.onmessage = (event) => {
            if (event.data === "error") return;
            try {
                const msg = JSON.parse(event.data);
                if (msg.match_id === matchId) {
                    fetchLive();
                }
            } catch (err) {
                console.error("SSE parse error:", err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [matchId, fetchLive]);

    // ─── Step 1: Select Match ───
    const handleSelectMatch = (match: any) => {
        setMatchId(match.id);
        setMatchData(match);
        if (match.status === "live") {
            setStep("scoring");
        } else {
            setStep("toss");
        }
    };

    // ─── Step 2: Initialize Match ───
    const handleInitialize = async () => {
        if (!matchId || !tossWinner) return;
        setLoading(true);

        try {
            await api.initializeMatch({
                match_id: matchId,
                toss_winner_id: tossWinner,
                toss_decision: tossDecision,
            });
        } catch (err) {
            console.error("Initialize failed:", err);
        }

        setLoading(false);
        setStep("scoring");
        fetchLive();
    };

    // ─── Step 3: Scoring Functions ───
    const addRuns = async (runs: number, extra: string | null = null) => {
        if (!liveDetails || loading) return;
        setLoading(true);

        const { runs: score, wickets } = parseScore(liveDetails.team1_score);
        const newScore = score + runs + (extra === "WD" || extra === "NB" ? 1 : 0);
        const isLegal = !extra || (extra !== "WD" && extra !== "NB");
        const newOvers = isLegal ? incrementOvers(liveDetails.team1_overs) : liveDetails.team1_overs;

        const updates: any = {
            team1_score: buildScore(newScore, wickets),
            team1_overs: newOvers,
            last_updated: new Date().toISOString(),
        };

        // Update striker stats
        if (liveDetails.batter1 && isLegal) {
            updates.current_batter_1_runs = (liveDetails.current_batter_1_runs || 0) + runs;
            updates.current_batter_1_balls = (liveDetails.current_batter_1_balls || 0) + 1;
        }

        // Auto-rotate strike on odd runs
        if (isLegal && runs % 2 === 1) {
            const temp1Id = liveDetails.current_batter_1_id;
            const temp1Runs = liveDetails.current_batter_1_runs || 0;
            const temp1Balls = (liveDetails.current_batter_1_balls || 0);
            updates.current_batter_1_id = liveDetails.current_batter_2_id;
            updates.current_batter_1_runs = liveDetails.current_batter_2_runs || 0;
            updates.current_batter_1_balls = liveDetails.current_batter_2_balls || 0;
            updates.current_batter_2_id = temp1Id;
            updates.current_batter_2_runs = temp1Runs + runs;
            updates.current_batter_2_balls = temp1Balls + 1;
        }

        // Auto end-of-over detection: rotate strike + prompt new bowler
        if (isLegal) {
            const ballsInOver = oversToBalls(newOvers) % 6;
            if (ballsInOver === 0 && oversToBalls(newOvers) > 0) {
                // End of over — swap strike
                const temp1Id = updates.current_batter_1_id || liveDetails.current_batter_1_id;
                const temp1Runs = updates.current_batter_1_runs ?? liveDetails.current_batter_1_runs ?? 0;
                const temp1Balls = updates.current_batter_1_balls ?? liveDetails.current_batter_1_balls ?? 0;
                updates.current_batter_1_id = updates.current_batter_2_id || liveDetails.current_batter_2_id;
                updates.current_batter_1_runs = updates.current_batter_2_runs ?? liveDetails.current_batter_2_runs ?? 0;
                updates.current_batter_1_balls = updates.current_batter_2_balls ?? liveDetails.current_batter_2_balls ?? 0;
                updates.current_batter_2_id = temp1Id;
                updates.current_batter_2_runs = temp1Runs;
                updates.current_batter_2_balls = temp1Balls;

                // Clear bowler — prompt for new one after save
                updates.current_bowler_id = null;
                updates.current_bowler_runs = 0;
                updates.current_bowler_overs = "0.0";
                updates.current_bowler_wickets = 0;
            }
        }

        try {
            await api.upsertLiveDetails({
                ...liveDetails,
                ...updates,
                id: liveDetails.id || "",
            });
        } catch (err) {
            console.error("Update scoring failed:", err);
        }

        // Log the ball
        setBallLog(prev => [...prev, {
            runs, extras: extra, isWicket: false,
            batter: liveDetails.batter1?.name || "?",
            bowler: liveDetails.bowler?.name || "?",
            overNum: Math.floor(oversToBalls(newOvers) / 6),
            ballNum: oversToBalls(newOvers) % 6 || 6,
            scoreAfter: buildScore(newScore, wickets),
        }]);

        await fetchLive();
        setLoading(false);

        // Prompt new bowler after over
        if (isLegal) {
            const ballsAfter = oversToBalls(newOvers) % 6;
            if (ballsAfter === 0 && oversToBalls(newOvers) > 0) {
                setShowBowlerPicker(true);
            }
        }
    };

    const handleWicket = async () => {
        if (!liveDetails || loading) return;
        setLoading(true);

        const { runs: score, wickets } = parseScore(liveDetails.team1_score);
        const newWickets = wickets + 1;
        const newOvers = incrementOvers(liveDetails.team1_overs);

        try {
            await api.upsertLiveDetails({
                ...liveDetails,
                team1_score: buildScore(score, newWickets),
                team1_overs: newOvers,
                current_batter_1_id: "", // Clear striker
                current_batter_1_runs: 0,
                current_batter_1_balls: 0,
            });
        } catch (err) {
            console.error("Wicket update failed:", err);
        }

        setBallLog(prev => [...prev, {
            runs: 0, extras: null, isWicket: true,
            batter: liveDetails.batter1?.name || "?",
            bowler: liveDetails.bowler?.name || "?",
            overNum: Math.floor(oversToBalls(newOvers) / 6),
            ballNum: oversToBalls(newOvers) % 6 || 6,
            scoreAfter: buildScore(score, newWickets),
        }]);

        await fetchLive();
        setLoading(false);
        setShowBatterPicker(1); // Prompt new batter
    };

    const selectPersonnel = async (type: "batter1" | "batter2" | "bowler", playerId: string) => {
        setLoading(true);
        const updates: any = {};
        if (type === "batter1") { updates.current_batter_1_id = playerId; updates.current_batter_1_runs = 0; updates.current_batter_1_balls = 0; }
        if (type === "batter2") { updates.current_batter_2_id = playerId; updates.current_batter_2_runs = 0; updates.current_batter_2_balls = 0; }
        if (type === "bowler") { updates.current_bowler_id = playerId; updates.current_bowler_runs = 0; updates.current_bowler_overs = "0.0"; updates.current_bowler_wickets = 0; }
        try {
            await api.upsertLiveDetails({
                ...liveDetails,
                ...updates,
            });
        } catch (err) {
            console.error("Select personnel failed:", err);
        }
        setShowBatterPicker(null);
        setShowBowlerPicker(false);
        await fetchLive();
        setLoading(false);
    };

    const handleSwapStrike = async () => {
        if (!liveDetails) return;
        try {
            await api.upsertLiveDetails({
                ...liveDetails,
                current_batter_1_id: liveDetails.current_batter_2_id,
                current_batter_1_runs: liveDetails.current_batter_2_runs,
                current_batter_1_balls: liveDetails.current_batter_2_balls,
                current_batter_2_id: liveDetails.current_batter_1_id,
                current_batter_2_runs: liveDetails.current_batter_1_runs,
                current_batter_2_balls: liveDetails.current_batter_1_balls,
            });
        } catch (err) {
            console.error("Swap strike failed:", err);
        }
        await fetchLive();
    };

    const handleFinishMatch = async () => {
        if (!confirm("Finish this match and finalize standings?")) return;
        if (!liveDetails) return;
        setLoading(true);

        const { runs: t1R, wickets: t1W } = parseScore(liveDetails.team1_score);
        const { runs: t2R, wickets: t2W } = parseScore(liveDetails.team2_score || "0/0");
        const winnerId = t1R > t2R ? liveDetails.team1_id : (t2R > t1R ? liveDetails.team2_id : null);

        const t1Name = teams.find((t: any) => t.id === liveDetails.team1_id)?.name || "Team 1";
        const t2Name = teams.find((t: any) => t.id === liveDetails.team2_id)?.name || "Team 2";
        const winnerName = winnerId === liveDetails.team1_id ? t1Name : (winnerId === liveDetails.team2_id ? t2Name : null);
        const resultText = winnerName
            ? `${winnerName} won by ${winnerId === liveDetails.team1_id ? `${t1R - t2R} runs` : `${10 - t2W} wickets`}`
            : "Match Tied";

        try {
            await api.finishMatch({
                match_id: matchId,
                team1_score: liveDetails.team1_score,
                team2_score: liveDetails.team2_score || "0/0",
                winner_id: winnerId || "",
                result_text: resultText,
            });
        } catch (err) {
            console.error("Finish match failed:", err);
        }

        alert("Match finished! Standings updated.");
        window.location.reload();
    };

    // Helper: get players for a team
    const getTeamPlayers = (teamId: string) => players.filter((p: any) => p.team_id === teamId);

    // ─── RENDER ───

    // Personnel Picker Modal
    if (showBatterPicker !== null || showBowlerPicker) {
        const isBowler = showBowlerPicker;
        const teamId = isBowler ? liveDetails?.team2_id : liveDetails?.team1_id;
        const roster = getTeamPlayers(teamId);
        const label = isBowler ? "Select New Bowler" : `Select Batter ${showBatterPicker}`;

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-xl">
                            {isBowler ? <Target className="w-5 h-5 text-accent" /> : <UserPlus className="w-5 h-5 text-accent" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{label}</h3>
                            <p className="text-xs text-white/40">Tap to select</p>
                        </div>
                    </div>
                    <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                        {roster.map((p: any) => (
                            <button
                                key={p.id}
                                onClick={() => selectPersonnel(isBowler ? "bowler" : (showBatterPicker === 1 ? "batter1" : "batter2"), p.id)}
                                className="w-full p-4 bg-white/5 hover:bg-accent/20 text-left text-white font-medium rounded-xl transition-all active:scale-95 flex justify-between items-center"
                            >
                                <span>{p.name}</span>
                                <span className="text-xs text-white/30">{p.role}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => { setShowBatterPicker(null); setShowBowlerPicker(false); }}
                            className="w-full p-3 text-white/40 hover:text-red-400 font-medium text-sm rounded-xl hover:bg-red-500/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Step 1: Match Selection ───
    if (step === "select") {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <header className="p-6 border-b border-white/5 flex items-center gap-4">
                    <a href="/admin" className="p-2 hover:bg-white/5 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-white/50" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Match Updates</h1>
                        <p className="text-xs text-white/40">Select a match to score</p>
                    </div>
                </header>

                <div className="p-6 space-y-8 max-w-lg mx-auto">
                    {/* Live matches */}
                    {liveMatches.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Live Now</h2>
                            </div>
                            {liveMatches.map((m: any) => (
                                <button key={m.id} onClick={() => handleSelectMatch(m)}
                                    className="w-full p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-left hover:bg-red-500/20 transition-all active:scale-[0.98]">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-sm">{m.i1}</div>
                                            <span className="text-white/30 text-sm">vs</span>
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-sm">{m.i2}</div>
                                        </div>
                                        <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                                    </div>
                                    <p className="mt-3 text-sm text-white/50">{m.t1} vs {m.t2}</p>
                                </button>
                            ))}
                        </section>
                    )}

                    {/* Upcoming matches */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide">Upcoming</h2>
                        {upcomingMatches.length === 0 && (
                            <p className="text-white/20 text-sm">No upcoming matches scheduled.</p>
                        )}
                        {upcomingMatches.map((m: any) => (
                            <button key={m.id} onClick={() => handleSelectMatch(m)}
                                className="w-full p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-left hover:bg-white/[0.06] transition-all active:scale-[0.98]">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-sm">{m.i1}</div>
                                        <span className="text-white/30 text-sm">vs</span>
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-sm">{m.i2}</div>
                                    </div>
                                    <Zap className="w-4 h-4 text-white/20" />
                                </div>
                                <p className="mt-3 text-sm text-white/50">{m.t1} vs {m.t2} · {m.date}</p>
                            </button>
                        ))}
                    </section>
                </div>
            </div>
        );
    }

    // ─── Step 2: Toss ───
    if (step === "toss") {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <header className="p-6 border-b border-white/5 flex items-center gap-4">
                    <button onClick={() => setStep("select")} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-white/50" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Initialize Match</h1>
                        <p className="text-xs text-white/40">{matchData?.t1} vs {matchData?.t2}</p>
                    </div>
                </header>

                <div className="p-6 space-y-8 max-w-lg mx-auto">
                    {/* Toss Winner */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wide">Toss Winner</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[matchData?.team1_id, matchData?.team2_id].map((id: string, i: number) => {
                                const team = teams.find((t: any) => t.id === id);
                                return (
                                    <button key={id} onClick={() => setTossWinner(id)}
                                        className={`p-5 rounded-2xl border-2 transition-all text-center font-semibold active:scale-95 ${tossWinner === id ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"}`}>
                                        <div className="w-14 h-14 mx-auto mb-3 bg-white/10 rounded-xl flex items-center justify-center text-xl font-bold">
                                            {i === 0 ? matchData?.i1 : matchData?.i2}
                                        </div>
                                        {team?.name || (i === 0 ? matchData?.t1 : matchData?.t2)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Toss Decision */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/40 uppercase tracking-wide">Elected to</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["bat", "bowl"] as const).map((d) => (
                                <button key={d} onClick={() => setTossDecision(d)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center font-semibold capitalize active:scale-95 ${tossDecision === d ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"}`}>
                                    {d} First
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleInitialize}
                        disabled={!tossWinner || loading}
                        className="w-full p-4 bg-accent text-white font-bold rounded-2xl text-lg hover:bg-accent/90 transition-all disabled:opacity-30 active:scale-95"
                    >
                        {loading ? "Initializing..." : "Start Match"}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Step 3: Live Scoring ───
    if (!liveDetails) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { runs: currentRuns, wickets: currentWickets } = parseScore(liveDetails.team1_score);
    const currentOvers = liveDetails.team1_overs || "0.0";
    const crr = runRate(currentRuns, currentOvers);
    const batter1SR = strikeRate(liveDetails.current_batter_1_runs || 0, liveDetails.current_batter_1_balls || 0);
    const bowlerEcon = economy(liveDetails.current_bowler_runs || 0, liveDetails.current_bowler_overs || "0.0");

    // Get last 6 balls for over summary
    const lastOverBalls = ballLog.slice(-6);
    const lastOverRuns = lastOverBalls.reduce((s, b) => s + b.runs, 0);

    const t1Name = teams.find((t: any) => t.id === liveDetails.team1_id)?.name || "Team 1";
    const t2Name = teams.find((t: any) => t.id === liveDetails.team2_id)?.name || "Team 2";

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep("select")} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-white/40" />
                    </button>
                    <div>
                        <p className="text-sm font-bold text-white">{matchData?.t1} vs {matchData?.t2}</p>
                        <p className="text-[10px] text-white/30">Match {matchData?.match_number} · {matchData?.stage}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-400 font-semibold uppercase">Live</span>
                </div>
            </header>

            {/* Score Display */}
            <div className="px-6 py-8 text-center border-b border-white/5 bg-white/[0.02]">
                <p className="text-xs text-white/30 font-medium mb-2">{t1Name} Batting</p>
                <div className="flex items-baseline justify-center gap-3">
                    <span className="text-6xl font-black tracking-tighter">{liveDetails.team1_score}</span>
                    <span className="text-xl text-white/30">({currentOvers})</span>
                </div>
                <p className="text-sm text-white/40 mt-2">CRR: <span className="text-accent font-semibold">{crr}</span></p>
            </div>

            {/* Active Personnel */}
            <div className="px-6 py-4 border-b border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <span className="text-sm font-semibold">{liveDetails.batter1?.name || "Select Striker"} *</span>
                    </div>
                    <span className="text-sm font-bold">{liveDetails.current_batter_1_runs || 0}<span className="text-white/30 text-xs"> ({liveDetails.current_batter_1_balls || 0})</span> <span className="text-[10px] text-white/30">SR {batter1SR}</span></span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white/30 rounded-full" />
                        <span className="text-sm">{liveDetails.batter2?.name || "Select Non-Striker"}</span>
                    </div>
                    <span className="text-sm">{liveDetails.current_batter_2_runs || 0}<span className="text-white/30 text-xs"> ({liveDetails.current_batter_2_balls || 0})</span></span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-sm text-white/60">{liveDetails.bowler?.name || "Select Bowler"}</span>
                    </div>
                    <span className="text-sm text-white/60">{liveDetails.current_bowler_wickets || 0}-{liveDetails.current_bowler_overs || "0.0"} <span className="text-[10px] text-white/30">Econ {bowlerEcon}</span></span>
                </div>
            </div>

            {/* Scoring Buttons */}
            <div className="flex-grow px-4 py-6 space-y-4">
                {/* Runs */}
                <div className="grid grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((r) => (
                        <button key={r} onClick={() => addRuns(r)} disabled={loading}
                            className="h-16 bg-white/5 border border-white/10 rounded-2xl font-bold text-2xl hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
                            {r}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                    <button onClick={() => addRuns(4)} disabled={loading}
                        className="h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl font-bold text-2xl text-blue-400 hover:bg-blue-500/20 active:scale-90 transition-all disabled:opacity-30">
                        4
                    </button>
                    <button onClick={() => addRuns(6)} disabled={loading}
                        className="h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl font-bold text-2xl text-purple-400 hover:bg-purple-500/20 active:scale-90 transition-all disabled:opacity-30">
                        6
                    </button>
                    <button onClick={() => addRuns(1, "WD")} disabled={loading}
                        className="h-16 bg-yellow-500/10 border border-yellow-500/10 rounded-2xl font-bold text-sm text-yellow-400 hover:bg-yellow-500/20 active:scale-90 transition-all disabled:opacity-30">
                        WD
                    </button>
                    <button onClick={() => addRuns(1, "NB")} disabled={loading}
                        className="h-16 bg-yellow-500/10 border border-yellow-500/10 rounded-2xl font-bold text-sm text-yellow-400 hover:bg-yellow-500/20 active:scale-90 transition-all disabled:opacity-30">
                        NB
                    </button>
                </div>

                {/* Wicket + Extras */}
                <div className="grid grid-cols-3 gap-2.5">
                    <button onClick={handleWicket} disabled={loading}
                        className="col-span-2 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl font-bold text-base text-red-400 hover:bg-red-500/20 active:scale-90 transition-all disabled:opacity-30">
                        WICKET
                    </button>
                    <button onClick={() => addRuns(0, "LB")} disabled={loading}
                        className="h-14 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm text-white/40 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
                        LB/B
                    </button>
                </div>

                {/* Over Summary */}
                {ballLog.length > 0 && (
                    <div className="mt-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/30 uppercase font-semibold tracking-wide">This Over</span>
                            <span className="text-xs text-white/30">{lastOverRuns} runs</span>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {lastOverBalls.map((b, i) => (
                                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${b.isWicket ? "bg-red-500/20 text-red-400" : b.runs === 4 ? "bg-blue-500/20 text-blue-400" : b.runs === 6 ? "bg-purple-500/20 text-purple-400" : b.extras ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/60"}`}>
                                    {b.isWicket ? "W" : b.extras ? `${b.runs}${b.extras}` : b.runs}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="px-4 py-4 border-t border-white/5 space-y-2.5 shrink-0 bg-slate-950">
                <div className="grid grid-cols-3 gap-2.5">
                    <button onClick={() => setShowBatterPicker(1)} className="p-3 bg-white/5 rounded-xl text-[10px] font-semibold text-white/40 hover:bg-white/10 transition-all flex flex-col items-center gap-1">
                        <UserPlus className="w-4 h-4" /> Batter
                    </button>
                    <button onClick={handleSwapStrike} className="p-3 bg-white/5 rounded-xl text-[10px] font-semibold text-white/40 hover:bg-white/10 transition-all flex flex-col items-center gap-1">
                        <ArrowLeftRight className="w-4 h-4" /> Swap
                    </button>
                    <button onClick={() => setShowBowlerPicker(true)} className="p-3 bg-white/5 rounded-xl text-[10px] font-semibold text-white/40 hover:bg-white/10 transition-all flex flex-col items-center gap-1">
                        <Target className="w-4 h-4" /> Bowler
                    </button>
                </div>
                <button onClick={handleFinishMatch} disabled={loading}
                    className="w-full p-4 bg-emerald-600/80 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-30">
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Finish Match
                </button>
            </div>
        </div>
    );
}
