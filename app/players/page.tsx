"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlayers } from "@/hooks/usePlayers";
import { useTeams } from "@/hooks/useTeams";
import { Shield } from "lucide-react";
import Link from "next/link";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

export default function PlayersPage() {
    const { players, loading } = usePlayers();
    const { teams } = useTeams();

    // Build team ID → slug map for URL generation
    const teamSlugMap: Record<string, string> = {};
    teams.forEach((t: any) => { teamSlugMap[t.id] = t.slug; });

    const getPlayerHref = (player: any) => {
        const teamSlug = player.team_id ? (teamSlugMap[player.team_id] || "freeagent") : "freeagent";
        return `/players/${teamSlug}/${player.slug}`;
    };

    return (
        <DelayedPageLoader isLoading={loading}>
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Players</h1>
                    <p className="text-muted-foreground text-sm">BSCCA Season 01 · Official Player Profiles</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {players.map((player) => (
                        <Link key={player.id} href={getPlayerHref(player)} className="group">
                            <Card className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 overflow-hidden h-full">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                                    <div className="w-24 h-24 bg-primary rounded-2xl text-white flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition-transform overflow-hidden">
                                        {player.image ? (
                                            <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            player.name.split(' ').map((n: string) => n[0]).join('')
                                        )}
                                    </div>

                                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1.5">
                                            <h3 className="font-semibold text-foreground text-lg tracking-tight group-hover:text-accent transition-colors">
                                                {player.name}
                                            </h3>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Shield className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    {player.teams?.name || (player.team_id ? teams.find((t: any) => t.id === player.team_id)?.name : null) || "Free Agent"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Badge className="bg-muted text-muted-foreground border-none text-[10px] font-medium px-2.5 py-0.5 rounded-md">
                                                {player.role || player.specialization}
                                            </Badge>
                                            <div className="p-2.5 bg-muted/50 rounded-xl">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {player.total_runs || 0} Runs · {player.matches_played || 0} Matches
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DelayedPageLoader>
    );
}
