"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Zap, Clock, ChevronRight } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TournamentBanner() {
    const { tournaments, loading } = useTournaments();

    if (loading || tournaments.length === 0) return null;

    // Show the most relevant tournament: active first, then scheduled
    const activeTournament = tournaments.find(t => t.status === 'active');
    const scheduledTournament = tournaments.find(t => t.status === 'scheduled');
    const tournament = activeTournament || scheduledTournament;

    if (!tournament) return null;

    const isActive = tournament.status === 'active';
    const isScheduled = tournament.status === 'scheduled';

    return (
        <Card className={cn(
            "rounded-2xl border overflow-hidden",
            isActive ? "border-accent/30 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" : "border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5"
        )}>
            <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            isActive ? "bg-accent/10" : "bg-amber-500/10"
                        )}>
                            <Trophy className={cn("w-6 h-6", isActive ? "text-accent" : "text-amber-500")} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-foreground">{tournament.name}</h3>
                                {isActive && (
                                    <Badge className="bg-accent/10 text-accent border-none text-[10px] rounded-full px-2.5 flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Live
                                    </Badge>
                                )}
                                {isScheduled && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] rounded-full px-2.5 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Scheduled
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                {tournament.start_date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {tournament.start_date}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {tournament.teams?.length || 0} Teams
                                </span>
                            </div>
                        </div>
                    </div>

                    {tournament.teams && tournament.teams.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {tournament.teams.slice(0, 5).map((team: any) => (
                                <div key={team.id} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-border/50 overflow-hidden" title={team.name}>
                                    {team.image ? <img src={team.image} alt="" className="w-full h-full object-cover" /> : team.initials}
                                </div>
                            ))}
                            {tournament.teams.length > 5 && (
                                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center text-[9px] font-semibold text-muted-foreground">
                                    +{tournament.teams.length - 5}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
