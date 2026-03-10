"use client";

import "@/styles/confetti.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";
import { LastMatchData } from "@/lib/types";

interface LastMatchOverviewProps {
    data: LastMatchData;
}

function Confetti() {
    const colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

    return (
        <div className="confetti-container">
            {Array.from({ length: 16 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${5 + (i * 6) % 90}%`,
                        width: `${4 + (i % 3) * 2}px`,
                        height: `${4 + (i % 3) * 2}px`,
                        backgroundColor: colors[i % colors.length],
                        borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
                        animationDuration: `${1.5 + (i % 5) * 0.3}s`,
                        animationDelay: `${(i * 0.2) % 1.5}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function LastMatchOverview({ data }: LastMatchOverviewProps) {
    const resultLower = data.result.toLowerCase();
    const team2Won = resultLower.includes(data.team2.name.toLowerCase());
    const team1Won = !team2Won && resultLower.includes(data.team1.name.toLowerCase());

    return (
        <section className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Last Match</h2>

            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/40 py-3 px-5 border-b border-border/50 flex flex-row justify-between items-center">
                    <span className="text-xs text-muted-foreground font-medium">
                        Match {data.matchNumber} · {data.stage} · {data.venue}
                    </span>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-medium px-2.5 py-0.5 rounded-full">Recent</Badge>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-row justify-between items-center gap-4 sm:gap-8">
                        {/* Team 1 */}
                        <div className="flex-1 flex flex-col items-center gap-3">
                            <div className="relative">
                                {team1Won && <Confetti />}
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${team1Won ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-2" : "bg-primary text-white"}`}>
                                    {data.team1.initials}
                                </div>
                                {team1Won && (
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                        <Trophy className="w-3.5 h-3.5 text-accent" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{data.team1.name}</span>
                            <span className="text-xl sm:text-2xl font-bold text-foreground">{data.team1.score}</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground/40">vs</span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex-1 flex flex-col items-center gap-3">
                            <div className="relative">
                                {team2Won && <Confetti />}
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${team2Won ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-2" : "bg-muted text-muted-foreground"}`}>
                                    {data.team2.initials}
                                </div>
                                {team2Won && (
                                    <div className="absolute -top-2 -right-2 bg-white rounded-xl p-1 shadow-sm">
                                        <Trophy className="w-4 h-4 text-accent" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{data.team2.name}</span>
                            <span className="text-xl sm:text-2xl font-bold text-foreground">{data.team2.score}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/50 text-center space-y-3">
                        <Badge className="bg-accent/10 text-accent border-none font-medium px-4 py-1.5 rounded-full text-xs">
                            {data.result}
                        </Badge>

                        <div className="flex items-center justify-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-xl">
                                <Star className="w-4 h-4 text-accent" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Player of the Match</span>
                                <span className="block text-sm font-semibold text-foreground">{data.mom.name} · {data.mom.stats}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
