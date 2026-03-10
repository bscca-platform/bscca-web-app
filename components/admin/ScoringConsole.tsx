import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, User, Target, ChevronRight, UserPlus, AlertCircle } from "lucide-react";
import { usePlayers } from "@/hooks/usePlayers";
import { calculateNRR, incrementOvers, parseScore, strikeRate, economy, runRate } from "@/lib/cricket-math";

interface ScoringConsoleProps {
    matchId: string;
    liveData: any;
}

export default function ScoringConsole({ matchId, liveData }: ScoringConsoleProps) {
    const { players } = usePlayers();
    const [loading, setLoading] = useState(false);
    // Modal states
    const [showBatterModal, setShowBatterModal] = useState<number | null>(null); // 1 or 2
    const [showBowlerModal, setShowBowlerModal] = useState(false);

    // Filter players by teams (assuming team1 is batting for now, logic can be more complex)
    const battingTeamPlayers = players.filter(p => p.team_id === liveData.team1.id);
    const bowlingTeamPlayers = players.filter(p => p.team_id === liveData.team2.id);

    const updatePersonnel = async (type: 'batter1' | 'batter2' | 'bowler', playerId: string) => {
        setLoading(true);
        const updates: any = {};
        if (type === 'batter1') updates.current_batter_1_id = playerId;
        if (type === 'batter2') updates.current_batter_2_id = playerId;
        if (type === 'bowler') updates.current_bowler_id = playerId;

        try {
            await api.upsertLiveDetails({
                match_id: matchId,
                ...updates
            });
            setShowBatterModal(null);
            setShowBowlerModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRuns = async (runs: number, isExtra: boolean = false, extraType?: string) => {
        setLoading(true);
        try {
            let [score, wickets] = liveData.team1.score.split('/').map(Number);
            let currentOvers = liveData.team1.overs;

            score += runs;
            const isLegalBall = !extraType || (extraType !== 'WD' && extraType !== 'NB');
            if (isLegalBall) {
                currentOvers = incrementOvers(currentOvers);
            }

            const updates: any = {
                match_id: matchId,
                team1_score: `${score}/${wickets}`,
                team1_overs: currentOvers,
            };

            const striker = liveData.currentBatters[0];
            if (striker && isLegalBall) {
                updates.current_batter_1_runs = (striker.runs || 0) + runs;
                updates.current_batter_1_balls = (striker.balls || 0) + 1;
            }

            await api.upsertLiveDetails(updates);

            // Sync with scorecard_batting
            if (striker && striker.id) {
                await api.upsertBattingScorecard({
                    match_id: matchId,
                    player_id: striker.id,
                    team_id: liveData.team1.id,
                    runs: (striker.runs || 0) + runs,
                    balls: (striker.balls || 0) + (isLegalBall ? 1 : 0),
                    fours: (striker.fours || 0) + (runs === 4 ? 1 : 0),
                    sixes: (striker.sixes || 0) + (runs === 6 ? 1 : 0),
                    is_not_out: true,
                    order_index: 0 // Simplification
                });
            }

            const bowler = liveData.currentBowler;
            if (bowler && bowler.id) {
                await api.upsertBowlingScorecard({
                    match_id: matchId,
                    player_id: bowler.id,
                    team_id: liveData.team2.id,
                    runs: (bowler.runs_conceded || 0) + runs + (extraType === 'WD' || extraType === 'NB' ? 1 : 0),
                    overs: isLegalBall ? incrementOvers(bowler.overs || '0.0') : (bowler.overs || '0.0'),
                    wickets: bowler.wickets || 0,
                    order_index: 0 // Simplification
                });
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWicket = async () => {
        setLoading(true);
        try {
            let [score, wickets] = liveData.team1.score.split('/').map(Number);
            wickets += 1;
            const newScore = `${score}/${wickets}`;
            const currentOvers = incrementOvers(liveData.team1.overs);

            const striker = liveData.currentBatters[0];
            const bowler = liveData.currentBowler;

            // 1. Update live_match_details
            await api.upsertLiveDetails({
                match_id: matchId,
                team1_score: newScore,
                team1_overs: currentOvers,
                current_batter_1_id: null, // Striker is out
            });

            // 2. Update scorecard_batting (mark as out)
            if (striker && striker.id) {
                await api.upsertBattingScorecard({
                    match_id: matchId,
                    player_id: striker.id,
                    team_id: liveData.team1.id,
                    runs: striker.runs || 0,
                    balls: striker.balls || 0,
                    fours: striker.fours || 0,
                    sixes: striker.sixes || 0,
                    is_not_out: false,
                    out_info: 'Caught/Bowled (Static Placeholder)',
                    order_index: 0
                });
            }

            // 3. Update bowler wickets
            if (bowler && bowler.id) {
                await api.upsertBowlingScorecard({
                    match_id: matchId,
                    player_id: bowler.id,
                    team_id: liveData.team2.id,
                    overs: currentOvers,
                    wickets: (bowler.wickets || 0) + 1,
                    runs: bowler.runs_conceded || 0,
                    order_index: 0
                });
            }

            setShowBatterModal(1); // Prompt to select new batter
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishMatch = async () => {
        const confirmFinish = confirm("ARE YOU SURE? This will terminate the live engagement and finalize standings.");
        if (!confirmFinish) return;

        setLoading(true);
        try {
            const [t1Runs, t1Wickets] = liveData.team1.score.split('/').map(Number);
            const [t2Runs, t2Wickets] = (liveData.team2.score || '0/0').split('/').map(Number);

            const winnerId = t1Runs > t2Runs ? liveData.team1.id : (t2Runs > t1Runs ? liveData.team2.id : null);
            const winnerName = winnerId === liveData.team1.id ? liveData.team1.name : (winnerId === liveData.team2.id ? liveData.team2.name : null);
            const resultText = winnerName
                ? `${winnerName} won by ${winnerId === liveData.team1.id ? `${t1Runs - t2Runs} runs` : `${10 - t2Wickets} wickets`}`
                : "Match Tied";

            await api.finishMatch({
                match_id: matchId,
                team1_score: liveData.team1.score,
                team2_score: liveData.team2.score || '0/0',
                winner_id: winnerId || "",
                result_text: resultText
            });

            alert("MATCH TERMINATED. STANDINGS & PERSONNEL DOSSIERS SYNCHRONIZED.");
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="rounded-none border-8 border-white/10 bg-primary text-white shadow-[15px_15px_60px_rgba(0,0,0,0.5)] overflow-hidden relative">
            {/* Personnel Selection Modals */}
            {(showBatterModal !== null || showBowlerModal) && (
                <div className="absolute inset-0 bg-primary/95 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                    <Card className="max-w-md w-full rounded-none border-4 border-white/20 bg-primary shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/10 p-6">
                            <h5 className="text-xl font-black italic uppercase text-white">
                                Select {showBowlerModal ? 'Bowler' : `Batter ${showBatterModal}`}
                            </h5>
                        </CardHeader>
                        <CardContent className="p-6 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                            {(showBowlerModal ? bowlingTeamPlayers : battingTeamPlayers).map(player => (
                                <button
                                    key={player.id}
                                    onClick={() => updatePersonnel(showBowlerModal ? 'bowler' : (showBatterModal === 1 ? 'batter1' : 'batter2'), player.id)}
                                    className="w-full p-4 bg-white/5 hover:bg-white hover:text-black text-left font-black italic uppercase text-xs transition-all border border-white/5 active:scale-95"
                                >
                                    {player.name}
                                </button>
                            ))}
                            <Button
                                onClick={() => { setShowBatterModal(null); setShowBowlerModal(false); }}
                                className="w-full mt-6 h-12 rounded-none bg-white/10 text-white font-black italic uppercase text-xs hover:bg-red-600 transition-all"
                            >
                                Abort Mission
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
            <CardHeader className="bg-white/5 p-4 border-b-4 border-white/10 flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#001226]">
                        <Zap className="w-5 h-5 text-white animate-pulse fill-white/20" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black italic uppercase text-secondary leading-none">Tactical Scoring Terminal</h4>
                        <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1">Real-time Data Uplink Active</p>
                    </div>
                </div>
                <Badge variant="outline" className="border-2 border-secondary text-secondary font-black italic rounded-none">V 2.0.4</Badge>
            </CardHeader>

            <CardContent className="p-8 space-y-10">
                {/* Score Pulse */}
                <div className="flex justify-between items-center bg-black/20 p-6 border-l-8 border-white">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">{liveData.team1.name}</p>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white">{liveData.team1.score} <span className="text-xl text-white/30 NOT-ITALIC ml-2">({liveData.team1.overs})</span></h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Current RR</p>
                        <p className="text-2xl font-black italic text-white">8.42</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Side: Dynamic Controls */}
                    <div className="space-y-8">
                        {/* Rapid Run Entry */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <ChevronRight className="w-3 h-3" /> Execute Run Payload
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[0, 1, 2, 3, 4, 6].map((run) => (
                                    <button
                                        key={run}
                                        onClick={() => handleAddRuns(run)}
                                        disabled={loading}
                                        className="h-16 bg-white/5 border-4 border-white/10 hover:border-white hover:bg-white hover:text-black transition-all font-black italic text-2xl"
                                    >
                                        {run}
                                    </button>
                                ))}
                                <button onClick={handleWicket} className="col-span-2 h-16 bg-red-600 border-4 border-red-900 hover:bg-red-500 transition-all font-black italic text-xl uppercase italic">
                                    Wicket
                                </button>
                            </div>
                        </div>

                        {/* Extras Entry */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <ChevronRight className="w-3 h-3" /> Extra Discrepancies
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {['WD', 'NB', 'B', 'LB'].map((extra) => (
                                    <button
                                        key={extra}
                                        disabled={loading}
                                        className="h-12 bg-white/5 border-2 border-white/5 hover:border-white transition-all font-black italic text-xs uppercase"
                                    >
                                        {extra}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Personnel Status */}
                    <div className="space-y-8">
                        {/* Current Personnel */}
                        <div className="space-y-4 bg-white/5 p-6 border-2 border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <User className="w-3 h-3" /> Active Personnel
                            </label>
                            <div className="space-y-3">
                                <div onClick={() => setShowBatterModal(1)} className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 hover:bg-white/5 p-2 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="font-black italic text-sm text-white">{liveData.currentBatters[0]?.name || 'Select Striker'}*</span>
                                    </div>
                                    <span className="font-black italic text-white text-sm">{liveData.currentBatters[0]?.runs ?? 0} ({liveData.currentBatters[0]?.balls ?? 0})</span>
                                </div>
                                <div onClick={() => setShowBatterModal(2)} className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-3 hover:bg-white/5 p-2 transition-all">
                                    <div className="flex items-center gap-3 opacity-40">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                        <span className="font-black italic text-sm">{liveData.currentBatters[1]?.name || 'Select Non-Striker'}</span>
                                    </div>
                                    <span className="font-black italic text-white/40 text-sm">{liveData.currentBatters[1]?.runs ?? 0} ({liveData.currentBatters[1]?.balls ?? 0})</span>
                                </div>
                                <div onClick={() => setShowBowlerModal(true)} className="flex justify-between items-center pt-2 hover:bg-white/5 p-2 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-4 h-4 text-white" />
                                        <span className="font-black italic text-sm text-white uppercase">{liveData.currentBowler?.name || 'Select Bowler'}</span>
                                    </div>
                                    <span className="font-black italic text-white text-sm">{liveData.currentBowler?.wickets ?? 0}-{liveData.currentBowler?.overs ?? '0.0'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Management Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => setShowBatterModal(1)} variant="outline" className="border-4 border-white/10 rounded-none h-12 font-black italic uppercase text-[10px] items-center gap-2 hover:bg-white hover:text-primary transition-all">
                                <UserPlus className="w-3 h-3" /> Swap Batter
                            </Button>
                            <Button variant="outline" className="border-4 border-white/10 rounded-none h-12 font-black italic uppercase text-[10px] items-center gap-2 hover:bg-white hover:text-primary transition-all">
                                <AlertCircle className="w-3 h-3" /> Undo Delivery
                            </Button>
                            <Button onClick={() => handleFinishMatch()} className="col-span-2 mt-4 bg-green-600 text-white rounded-none h-14 font-black italic uppercase shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                Terminate Match & Log Results
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
