"use client";

import { useMatches } from "@/hooks/useMatches";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Calendar, MapPin, Edit2, Zap, Settings2, X, Trophy, Swords, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ScoringConsole from "./ScoringConsole";
import { useTeams } from "@/hooks/useTeams";
import { useTournaments } from "@/hooks/useTournaments";

export default function MatchesManager() {
    const { matches, loading: matchesLoading } = useMatches();
    const { data: liveMatch, loading: liveLoading } = useLiveMatch();
    const { teams } = useTeams();
    const { tournaments } = useTournaments();
    const [matchTab, setMatchTab] = useState<"tournament" | "normal">("tournament");
    const [setupMatchId, setSetupMatchId] = useState<string | null>(null);
    const [tossWinnerId, setTossWinnerId] = useState<string>("");
    const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [team1Score, setTeam1Score] = useState("");
    const [team2Score, setTeam2Score] = useState("");
    const [team1Overs, setTeam1Overs] = useState("");
    const [statusText, setStatusText] = useState("");
    const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<any>(null);
    const [scheduleData, setScheduleData] = useState({
        team1_id: "", team2_id: "", date: "", time: "", venue: "Supreme Arena", match_number: "", stage: "League Phase", match_type: "tournament" as "tournament" | "normal", tournament_id: "", highlights_url: ""
    });

    // Normal match finish modal
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [finishMatchId, setFinishMatchId] = useState<string | null>(null);
    const [finishData, setFinishData] = useState({ team1_score: "", team2_score: "", winner_id: "", result_text: "" });

    // Filter matches by tab
    const filteredMatches = matches.filter((m: any) =>
        matchTab === "tournament" ? (!m.match_type || m.match_type === "tournament") : m.match_type === "normal"
    );

    const handleOpenSchedulingModal = (match: any = null) => {
        if (match) {
            setEditingMatch(match);
            setScheduleData({
                team1_id: match.team1_id || "", team2_id: match.team2_id || "", date: match.date || "",
                time: match.time || "", venue: match.venue || "Supreme Arena", match_number: match.match_number || "",
                stage: match.stage || "League Phase", match_type: match.match_type || matchTab, tournament_id: match.tournament_id || "",
                highlights_url: match.highlights_url || ""
            });
        } else {
            setEditingMatch(null);
            setScheduleData({
                team1_id: "", team2_id: "", date: "", time: "", venue: "Supreme Arena", match_number: "",
                stage: matchTab === "normal" ? "Friendly" : "League Phase", match_type: matchTab, tournament_id: "", highlights_url: ""
            });
        }
        setIsSchedulingModalOpen(true);
    };

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        const { team1_id, team2_id, date, time, venue, match_number, stage, match_type, tournament_id, highlights_url } = scheduleData;
        if (!team1_id || !team2_id || !date) return alert("Teams and Date are required.");
        const t1 = teams.find(t => t.id === team1_id);
        const t2 = teams.find(t => t.id === team2_id);
        const slug = `${t1?.slug}-vs-${t2?.slug}-${date.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const payload: any = {
            team1_id, team2_id, t1: t1?.name, t2: t2?.name, i1: t1?.initials, i2: t2?.initials,
            date, time, venue, match_number, stage, slug, match_type, highlights_url,
            status: editingMatch?.status || 'upcoming'
        };
        if (tournament_id) payload.tournament_id = tournament_id;
        if (editingMatch) {
            try {
                await api.updateMatch(editingMatch.id, payload);
                setIsSchedulingModalOpen(false);
            } catch (err: any) {
                alert(err.message);
            }
        } else {
            try {
                await api.createMatch(payload);
                setIsSchedulingModalOpen(false);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    useEffect(() => {
        if (liveMatch) {
            setTeam1Score(liveMatch.team1.score);
            setTeam2Score(liveMatch.team2.score || "");
            setTeam1Overs(liveMatch.team1.overs);
            setStatusText(liveMatch.details);
        }
    }, [liveMatch]);

    const handleUpdateLiveFeed = async () => {
        if (!liveMatch) return;
        try {
            await api.upsertLiveDetails({
                match_id: liveMatch.matchNumber, // Assuming matchNumber is used as ID here or we need the actual UUID
                team1_score: team1Score,
                team2_score: team2Score,
                team1_overs: team1Overs,
                match_status_text: statusText,
            });
            alert("Live Feed Updated!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleInitializeMatch = async () => {
        if (!setupMatchId || !tossWinnerId) return;
        const match = matches.find(m => m.id === setupMatchId);
        if (!match) return;

        try {
            await api.initializeMatch({
                match_id: setupMatchId,
                toss_winner_id: tossWinnerId,
                toss_decision: tossDecision,
            });
            setSetupMatchId(null);
            alert("Match Initialized!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Normal Match: Open finish modal
    const openFinishModal = (match: any) => {
        setFinishMatchId(match.id);
        setFinishData({ team1_score: "", team2_score: "", winner_id: "", result_text: "" });
        setShowFinishModal(true);
    };

    // Normal Match: Submit final scores and update team/player stats
    const handleFinishNormalMatch = async () => {
        if (!finishMatchId || !finishData.team1_score || !finishData.team2_score || !finishData.winner_id) {
            alert("Fill all fields and select winner."); return;
        }

        try {
            await api.finishMatch({
                match_id: finishMatchId,
                team1_score: finishData.team1_score,
                team2_score: finishData.team2_score,
                winner_id: finishData.winner_id,
                result_text: finishData.result_text,
            });
            setShowFinishModal(false);
            alert("Match finished!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";

    return (
        <div className="space-y-8">
            <MatchSchedulingModal
                isOpen={isSchedulingModalOpen}
                onClose={() => setIsSchedulingModalOpen(false)}
                match={editingMatch}
                teams={teams}
                tournaments={tournaments}
                formData={scheduleData}
                setFormData={setScheduleData}
                onSave={handleSaveSchedule}
                matchTab={matchTab}
            />

            {/* Finish Normal Match Modal */}
            {showFinishModal && finishMatchId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
                        <CardHeader className="border-b border-white/5 p-6 flex flex-row justify-between items-center">
                            <div><h3 className="text-xl font-semibold">Finish Match</h3><p className="text-xs text-white/40 mt-1">Enter final scores</p></div>
                            <button onClick={() => setShowFinishModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/40"><X className="w-5 h-5" /></button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {(() => {
                                const match = matches.find(m => m.id === finishMatchId);
                                if (!match) return null;
                                return (<>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">{match.team1?.name || match.t1} Score</label>
                                            <input value={finishData.team1_score} onChange={e => setFinishData(p => ({ ...p, team1_score: e.target.value }))} className={inputClass} placeholder="156/6 (20)" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">{match.team2?.name || match.t2} Score</label>
                                            <input value={finishData.team2_score} onChange={e => setFinishData(p => ({ ...p, team2_score: e.target.value }))} className={inputClass} placeholder="140/8 (20)" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">Winner</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => setFinishData(p => ({ ...p, winner_id: match.team1_id }))}
                                                className={cn("p-3 rounded-xl border text-sm font-medium transition-all", finishData.winner_id === match.team1_id ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50")}>
                                                {match.team1?.name || match.t1}
                                            </button>
                                            <button type="button" onClick={() => setFinishData(p => ({ ...p, winner_id: match.team2_id }))}
                                                className={cn("p-3 rounded-xl border text-sm font-medium transition-all", finishData.winner_id === match.team2_id ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50")}>
                                                {match.team2?.name || match.t2}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">Result Summary (Optional)</label>
                                        <input value={finishData.result_text} onChange={e => setFinishData(p => ({ ...p, result_text: e.target.value }))} className={inputClass} placeholder="Team won by 16 runs" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" onClick={() => setShowFinishModal(false)} variant="outline" className="flex-1 border border-white/10 text-white/50 rounded-xl h-11">Cancel</Button>
                                        <Button onClick={handleFinishNormalMatch} className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl h-11">Finish Match</Button>
                                    </div>
                                </>);
                            })()}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Setup Overlay */}
            {setupMatchId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <Card className="max-w-xl w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
                        <CardHeader className="border-b border-white/5 p-6">
                            <h3 className="text-xl font-semibold">Match Setup</h3>
                            <p className="text-xs text-white/40 mt-1">Configure toss and start match</p>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">Toss Winner</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {matches.find(m => m.id === setupMatchId) && (<>
                                        <button onClick={() => setTossWinnerId(matches.find(m => m.id === setupMatchId).team1_id)} className={cn("p-4 rounded-xl border font-medium text-sm transition-all", tossWinnerId === matches.find(m => m.id === setupMatchId).team1_id ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50 hover:border-white/20")}>
                                            {matches.find(m => m.id === setupMatchId).team1?.name}
                                        </button>
                                        <button onClick={() => setTossWinnerId(matches.find(m => m.id === setupMatchId).team2_id)} className={cn("p-4 rounded-xl border font-medium text-sm transition-all", tossWinnerId === matches.find(m => m.id === setupMatchId).team2_id ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50 hover:border-white/20")}>
                                            {matches.find(m => m.id === setupMatchId).team2?.name}
                                        </button>
                                    </>)}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-medium uppercase tracking-wide text-white/50">Decision</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setTossDecision("bat")} className={cn("p-3 rounded-xl border font-medium text-sm transition-all", tossDecision === "bat" ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50")}>Bat First</button>
                                    <button onClick={() => setTossDecision("bowl")} className={cn("p-3 rounded-xl border font-medium text-sm transition-all", tossDecision === "bowl" ? "border-accent bg-accent/10 text-accent" : "border-white/10 text-white/50")}>Bowl First</button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => setSetupMatchId(null)} variant="outline" className="flex-1 border border-white/10 text-white/50 rounded-xl h-11">Cancel</Button>
                                <Button onClick={handleInitializeMatch} className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl h-11">Start Match</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Match Type Tabs */}
            <div className="flex gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/5 w-fit">
                <button onClick={() => setMatchTab("tournament")} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all", matchTab === "tournament" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60")}>
                    <Trophy className="w-4 h-4" /> Tournament
                </button>
                <button onClick={() => setMatchTab("normal")} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all", matchTab === "normal" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60")}>
                    <Swords className="w-4 h-4" /> Normal
                </button>
            </div>

            {/* Live Controller — only for tournament */}
            {matchTab === "tournament" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-accent animate-pulse" />
                        <h3 className="text-lg font-semibold text-white">Live Scoreboard</h3>
                    </div>

                    {liveLoading ? (
                        <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
                    ) : liveMatch ? (
                        showAdvanced ? (
                            <div className="space-y-4">
                                <Button onClick={() => setShowAdvanced(false)} variant="outline" className="border border-white/10 text-white/50 rounded-xl h-9 px-4 text-xs">Exit Advanced</Button>
                                <ScoringConsole matchId={liveMatch.matchNumber} liveData={liveMatch} />
                            </div>
                        ) : (
                            <Card className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                <CardHeader className="bg-white/[0.03] p-5 border-b border-white/5 flex flex-row justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-white/50">Match #{liveMatch.matchNumber}</span>
                                        <Badge className="bg-red-500/10 text-red-400 border-none text-[10px] font-medium rounded-full px-2.5 animate-pulse">LIVE</Badge>
                                    </div>
                                    <Button onClick={() => setShowAdvanced(true)} variant="outline" className="border border-white/10 text-white/50 rounded-xl h-8 px-3 text-[11px]">Advanced</Button>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                                        <div className="space-y-4 text-center">
                                            <div className="w-16 h-16 bg-accent/10 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-accent">{liveMatch.team1.initials}</div>
                                            <p className="text-xs font-medium text-white/50">{liveMatch.team1.name}</p>
                                            <input type="text" value={team1Score} onChange={(e) => setTeam1Score(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-3xl font-bold text-accent text-center outline-none focus:border-accent/50" />
                                            <div className="flex justify-between items-center text-xs px-2">
                                                <span className="text-white/30">Overs</span>
                                                <input type="text" value={team1Overs} onChange={(e) => setTeam1Overs(e.target.value)} className="bg-transparent text-accent text-right w-16 outline-none font-semibold" />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-4">
                                            <div className="bg-white/[0.03] p-5 rounded-xl border border-white/5 space-y-3">
                                                <p className="text-[10px] font-medium uppercase tracking-wide text-white/30">Status</p>
                                                <textarea value={statusText} onChange={(e) => setStatusText(e.target.value)} className="w-full bg-transparent text-xs font-medium text-white outline-none resize-none h-16 text-center" />
                                            </div>
                                            <Button onClick={handleUpdateLiveFeed} className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl h-11 font-medium">Update Live Feed</Button>
                                        </div>
                                        <div className="space-y-4 text-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold text-white/30">{liveMatch.team2.initials}</div>
                                            <p className="text-xs font-medium text-white/30">{liveMatch.team2.name}</p>
                                            <input type="text" value={team2Score} onChange={(e) => setTeam2Score(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-2xl font-bold text-white text-center outline-none focus:border-accent/50" />
                                            <p className="text-[10px] font-medium text-white/20">{liveMatch.team2.status}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    ) : (
                        <div className="py-16 flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center">
                            <Settings2 className="w-10 h-10 text-white/15" />
                            <p className="text-xs font-medium text-white/30">No live match detected</p>
                        </div>
                    )}
                </div>
            )}

            {/* Fixtures */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                        {matchTab === "tournament" ? "Tournament Fixtures" : "Normal Matches"}
                    </h3>
                    <Button onClick={() => handleOpenSchedulingModal()} className="bg-accent hover:bg-accent/90 text-white rounded-xl px-5 h-10 text-sm">
                        <Plus className="w-4 h-4 mr-1.5" /> {matchTab === "tournament" ? "Schedule Match" : "New Match"}
                    </Button>
                </div>

                {filteredMatches.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center">
                        <Swords className="w-10 h-10 text-white/10" />
                        <p className="text-sm font-medium text-white/30">No {matchTab} matches yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredMatches.map((match) => (
                            <Card key={match.id} className="rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all group overflow-hidden">
                                <CardHeader className="bg-white/[0.02] p-4 border-b border-white/5 flex flex-row justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-white/30" />
                                        <span className="text-[11px] font-medium text-white/40">{match.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {match.status === 'upcoming' && matchTab === "tournament" && (
                                            <Button onClick={() => setSetupMatchId(match.id)} className="h-6 px-3 bg-accent/10 text-accent text-[10px] font-medium rounded-lg hover:bg-accent hover:text-white transition-all">
                                                <Play className="w-2 h-2 mr-1 fill-current" /> Go Live
                                            </Button>
                                        )}
                                        {match.status === 'upcoming' && matchTab === "normal" && (
                                            <Button onClick={() => openFinishModal(match)} className="h-6 px-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                                Finish
                                            </Button>
                                        )}
                                        <Badge className={cn("text-[10px] font-medium rounded-full border-none px-2.5",
                                            match.status === 'live' ? "bg-red-500/10 text-red-400 animate-pulse" :
                                                match.status === 'finished' ? "bg-emerald-500/10 text-emerald-400" :
                                                    "bg-white/5 text-white/40"
                                        )}>{match.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <div className="flex justify-around items-center gap-4 py-3">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-sm font-semibold text-white/50 border border-white/5">{match.team1?.initials}</div>
                                            <span className="text-[10px] font-medium text-white/30 truncate max-w-[80px]">{match.team1?.name}</span>
                                        </div>
                                        <div className="text-center">
                                            {match.status === 'finished' ? (
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold text-white">{match.team1_score} — {match.team2_score}</div>
                                                    <p className="text-[9px] text-white/30">{match.result_text}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-semibold text-white/20">VS</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-sm font-semibold text-white/50 border border-white/5">{match.team2?.initials}</div>
                                            <span className="text-[10px] font-medium text-white/30 truncate max-w-[80px]">{match.team2?.name}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/25">
                                            <MapPin className="w-3 h-3" /> {match.venue}
                                        </div>
                                        <button onClick={() => handleOpenSchedulingModal(match)} className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/30 transition-all">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MatchSchedulingModal({ isOpen, onClose, match, teams, tournaments, formData, setFormData, onSave, matchTab }: any) {
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const result = await api.uploadFile(file);
            setFormData({ ...formData, highlights_url: result.url });
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const ic = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const lc = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
                <CardHeader className="border-b border-white/5 p-6 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold">
                            {match ? 'Edit' : 'Schedule'} {matchTab === 'normal' ? 'Normal' : 'Tournament'} Match
                        </h3>
                        <p className="text-xs text-white/40 mt-1">Match configuration</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/40"><X className="w-5 h-5" /></button>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={onSave} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={lc}>Home Team</label>
                                <select value={formData.team1_id} onChange={(e) => setFormData({ ...formData, team1_id: e.target.value })} className={ic} style={{ colorScheme: 'dark' }}>
                                    <option value="">Select Team</option>
                                    {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={lc}>Away Team</label>
                                <select value={formData.team2_id} onChange={(e) => setFormData({ ...formData, team2_id: e.target.value })} className={ic} style={{ colorScheme: 'dark' }}>
                                    <option value="">Select Team</option>
                                    {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5"><label className={lc}>Date</label><input type="text" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={ic} placeholder="FEB 20, 2026" /></div>
                            <div className="space-y-1.5"><label className={lc}>Time</label><input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className={ic} placeholder="10:00 AM" /></div>
                            <div className="space-y-1.5"><label className={lc}>Venue</label><input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={ic} /></div>
                            <div className="space-y-1.5"><label className={lc}>Match #</label><input type="text" value={formData.match_number} onChange={(e) => setFormData({ ...formData, match_number: e.target.value })} className={ic} placeholder="12" /></div>
                        </div>
                        {matchTab === 'tournament' && tournaments && tournaments.length > 0 && (
                            <div className="space-y-1.5">
                                <label className={lc}>Tournament</label>
                                <select value={formData.tournament_id} onChange={(e) => setFormData({ ...formData, tournament_id: e.target.value })} className={ic} style={{ colorScheme: 'dark' }}>
                                    <option value="">Select Tournament</option>
                                    {tournaments.filter((t: any) => t.status !== 'completed').map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="space-y-1.5"><label className={lc}>Stage</label><input type="text" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className={ic} placeholder={matchTab === 'normal' ? "Friendly" : "League Phase"} /></div>
                        
                        <div className="space-y-1.5 pt-2">
                             <label className={lc}>Match Highlights (Video)</label>
                             <div className="flex gap-4 items-center">
                                 <div className="flex-1 relative">
                                     <input 
                                         type="text" 
                                         value={formData.highlights_url} 
                                         onChange={(e) => setFormData({ ...formData, highlights_url: e.target.value })} 
                                         className={ic} 
                                         placeholder="https://..." 
                                     />
                                     <Video className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                 </div>
                                 <Button 
                                     type="button" 
                                     disabled={isUploading}
                                     onClick={() => document.getElementById('highlights-upload')?.click()}
                                     className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl h-11 px-6 text-xs"
                                 >
                                     {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                                 </Button>
                                 <input 
                                     id="highlights-upload" 
                                     type="file" 
                                     accept="video/*" 
                                     className="hidden" 
                                     onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) handleUpload(file);
                                     }} 
                                 />
                             </div>
                             <p className="text-[10px] text-white/20 mt-1 pl-1">Supports MP4, WebM up to 100MB directly to HF Dataset</p>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border border-white/10 text-white/50 rounded-xl h-11">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl h-11">{match ? 'Update' : 'Schedule'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// In the component body, I need to add isUploading state and handleUpload function.
// I'll add them to the parent and pass down or just add to the modal if it's separate.
// Actually, MatchSchedulingModal is a separate function. I'll add the logic inside it.
