"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, Target, Activity } from "lucide-react";
import { LiveMatchData } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useLiveMatch } from "@/hooks/useLiveMatch";
import CricketBallLoader from "@/components/ui/CricketBallLoader";

interface LiveMatchProps {
    data: LiveMatchData;
}

export default function LiveMatch({ data: initialData }: LiveMatchProps) {
    const { data: liveData, loading } = useLiveMatch();
    const [activeTeam, setActiveTeam] = useState<"team1" | "team2">("team1");

    const data = loading ? initialData : liveData;

    if (loading && !initialData) {
        return (
            <div className="flex items-center justify-center p-16 rounded-2xl bg-muted/50">
                <CricketBallLoader size="xl" />
            </div>
        );
    }

    const team = activeTeam === "team1" ? data.team1 : data.team2;
    const oppositeTeam = activeTeam === "team1" ? data.team2 : data.team1;

    return (
        <section className="space-y-5">
            <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-3 text-foreground">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    Live Match
                </h2>
                <Link href="/matches" className="text-sm font-medium text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors">
                    View Schedule <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <Card className="rounded-2xl border border-border/60 shadow-lg overflow-hidden bg-white">
                {/* Team Selector Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTeam("team1")}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium tracking-tight transition-all relative",
                            activeTeam === "team1" ? "text-foreground bg-white" : "text-muted-foreground bg-muted/30 hover:bg-muted/50"
                        )}
                    >
                        {data.team1.name}
                        {activeTeam === "team1" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                    <div className="w-px bg-border"></div>
                    <button
                        onClick={() => setActiveTeam("team2")}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium tracking-tight transition-all relative",
                            activeTeam === "team2" ? "text-foreground bg-white" : "text-muted-foreground bg-muted/30 hover:bg-muted/50"
                        )}
                    >
                        {data.team2.name}
                        {activeTeam === "team2" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                </div>

                <CardContent className="p-0">
                    {/* Score Summary */}
                    <div className="bg-primary p-6 sm:p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        <div className="flex justify-between items-center relative z-10 w-full gap-4">
                            {/* Team 1 */}
                            <div className="flex flex-col items-center gap-2 w-1/3">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm text-white flex items-center justify-center font-bold text-xl sm:text-2xl border border-white/10">
                                    {data.team1.initials}
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{data.team1.score}</div>
                                    <span className="text-xs text-white/50 font-medium">{data.team1.name}</span>
                                    <span className="text-[10px] text-white/30 font-medium block">{data.team1.overs}</span>
                                </div>
                            </div>

                            {/* Center */}
                            <div className="flex flex-col items-center justify-center space-y-2 w-1/3">
                                <Badge className="bg-red-500/90 text-white text-[10px] font-semibold px-3 py-1 rounded-full border-none animate-pulse">LIVE</Badge>
                                <p className="text-[10px] text-white/30 font-medium">Match {data.matchNumber}</p>
                            </div>

                            {/* Team 2 */}
                            <div className="flex flex-col items-center gap-2 w-1/3">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 text-white/50 flex items-center justify-center font-bold text-xl sm:text-2xl border border-white/5">
                                    {data.team2.initials}
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white/50">{data.team2.score}</div>
                                    <span className="text-xs text-white/40 font-medium">{data.team2.name}</span>
                                    <span className="text-[10px] text-white/20 font-medium block">{data.team2.status}</span>
                                </div>
                            </div>
                        </div>

                        {data.details && (
                            <div className="text-center mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-white/60 font-medium">{data.details}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 sm:p-8 space-y-8 bg-white">
                        {/* Current Players */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-3 p-5 rounded-xl bg-muted/40 border border-border/50 hover:border-accent/30 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-border/50">
                                    <Users className="w-4 h-4" />
                                    <h5 className="text-xs font-semibold tracking-wide uppercase">In the Middle</h5>
                                </div>
                                <div className="space-y-3 pt-1">
                                    {data.currentBatters.map((batter, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className={cn(
                                                "text-sm font-medium transition-colors flex items-center gap-2",
                                                batter.isStriker ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {batter.name}
                                                {batter.isStriker && <Target className="w-3 h-3 text-accent" />}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-foreground">{batter.runs}</span>
                                                <span className="text-xs text-muted-foreground">({batter.balls})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 p-5 rounded-xl bg-muted/40 border border-border/50 hover:border-accent/30 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground pb-2 border-b border-border/50">
                                    <Activity className="w-4 h-4" />
                                    <h5 className="text-xs font-semibold tracking-wide uppercase">Bowling</h5>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm font-medium text-foreground">{data.currentBowler.name}</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-foreground">{data.currentBowler.wickets}/{data.currentBowler.runs}</span>
                                        <span className="text-xs text-muted-foreground">({data.currentBowler.overs})</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 gap-1.5 mt-3">
                                    {/* Recent balls will appear here during live match */}
                                </div>
                            </div>
                        </div>

                        {/* Scorecards */}
                        <div className="space-y-8">
                            {/* Batting */}
                            <div className="space-y-3">
                                <h5 className="text-sm font-semibold text-foreground">{team.name} — Batting</h5>
                                <div className="overflow-x-auto rounded-xl border border-border/50">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/60 text-xs text-muted-foreground font-medium">
                                                <th className="py-3 px-4">Batter</th>
                                                <th className="py-3 px-3 text-center">R</th>
                                                <th className="py-3 px-3 text-center">B</th>
                                                <th className="py-3 px-3 text-center">4s</th>
                                                <th className="py-3 px-3 text-center">6s</th>
                                                <th className="py-3 px-3 text-center">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {team.batting?.map((player, i) => (
                                                <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{player.name}</span>
                                                            {player.outInfo && <span className="text-[10px] text-muted-foreground mt-0.5">{player.outInfo}</span>}
                                                            {player.isNotOut && <span className="text-[10px] text-accent font-medium mt-0.5">not out</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-semibold text-foreground">{player.runs}</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">{player.balls}</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">{player.fours}</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">{player.sixes}</td>
                                                    <td className="py-3 px-3 text-center font-medium text-accent">
                                                        {player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : "0.0"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bowling */}
                            <div className="space-y-3">
                                <h5 className="text-sm font-semibold text-foreground">{oppositeTeam.name} — Bowling</h5>
                                <div className="overflow-x-auto rounded-xl border border-border/50">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/60 text-xs text-muted-foreground font-medium">
                                                <th className="py-3 px-4">Bowler</th>
                                                <th className="py-3 px-3 text-center">O</th>
                                                <th className="py-3 px-3 text-center">M</th>
                                                <th className="py-3 px-3 text-center">R</th>
                                                <th className="py-3 px-3 text-center">W</th>
                                                <th className="py-3 px-3 text-center">ECO</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {oppositeTeam.bowling?.map((player, i) => (
                                                <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-foreground">{player.name}</td>
                                                    <td className="py-3 px-3 text-center font-semibold">{player.overs}</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">0</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">{player.runs}</td>
                                                    <td className="py-3 px-3 text-center font-semibold text-accent">{player.wickets}</td>
                                                    <td className="py-3 px-3 text-center text-muted-foreground">
                                                        {parseFloat(player.overs) > 0 ? (player.runs / parseFloat(player.overs)).toFixed(2) : "0.00"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
