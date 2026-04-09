"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Team } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import CricketBallLoader from "@/components/ui/CricketBallLoader";

interface TeamsScrollProps {
    teams: Team[];
}

export default function TeamsScroll({ teams: initialTeams }: TeamsScrollProps) {
    const { teams: liveTeams, loading } = useTeams();
    const teams = loading ? initialTeams : liveTeams;
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 230;
        scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    if (loading && !initialTeams.length) {
        return (
            <div className="flex items-center justify-center p-12">
                <CricketBallLoader size="lg" />
            </div>
        );
    }

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Teams</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth">
                {teams.map((team, index) => (
                    <Link key={index} href={`/teams/${team.slug}`} className="snap-start flex-shrink-0 group">
                        <Card className="w-[180px] sm:w-[220px] rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 overflow-hidden">
                            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary flex items-center justify-center text-2xl sm:text-3xl font-bold text-white group-hover:scale-105 transition-transform overflow-hidden">
                                    {team.image ? (
                                        <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        team.initials
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-semibold text-foreground text-sm tracking-tight leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                                        {team.name}
                                    </h5>
                                    <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[140px]">
                                        {team.location}
                                    </p>
                                </div>

                                {team.played !== undefined && (
                                    <div className="mt-1 pt-2 border-t border-border/50 w-full">
                                        <div className="flex justify-around text-center">
                                            <div>
                                                <span className="block text-[10px] text-muted-foreground">P</span>
                                                <span className="text-xs font-semibold">{team.played}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-muted-foreground">W/L</span>
                                                <span className="text-xs font-semibold">{team.won}/{team.lost}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-muted-foreground">NRR</span>
                                                <span className="text-xs font-semibold">{team.nrr}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
