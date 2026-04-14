"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopPlayer } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopPlayersScrollProps {
    players: any[];
    teams?: any[];
}

export default function TopPlayersScroll({ players, teams = [] }: TopPlayersScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Build team ID → slug map
    const teamSlugMap: Record<string, string> = {};
    teams.forEach((t: any) => { teamSlugMap[t.id] = t.slug; });

    const getPlayerHref = (player: any) => {
        const teamSlug = player.team_id ? (teamSlugMap[player.team_id] || "freeagent") : "freeagent";
        return `/players/${teamSlug}/${player.slug}`;
    };

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 230;
        scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Top Players</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth">
                {players.map((player) => (
                    <Link key={player.id} href={getPlayerHref(player)} className="snap-start flex-shrink-0 group">
                        <Card className="w-[180px] sm:w-[220px] rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-5 flex flex-col items-center text-center gap-4">
                                {/* Player Avatar */}
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-primary flex items-center justify-center text-2xl sm:text-3xl font-bold text-white group-hover:scale-105 transition-transform overflow-hidden shadow-lg shadow-primary/10">
                                    {player.image ? (
                                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        player.name.split(' ').map((n: string) => n[0]).join('')
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <h5 className="font-semibold text-foreground text-sm tracking-tight group-hover:text-accent transition-colors">
                                            {player.name}
                                        </h5>
                                        <Badge className="bg-muted text-muted-foreground border-none text-[10px] font-medium px-2 py-0.5 rounded-md">
                                            {player.team || player.teams?.name || "Independent"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-muted-foreground">
                                            {player.role}
                                        </p>
                                        <p className="text-xs font-semibold text-accent">
                                            {player.stats || `${player.total_runs || 0} Runs · ${player.matches_played || 0} Matches`}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
