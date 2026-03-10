"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeams";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

export default function TeamsPage() {
    const { teams: rawTeams, loading } = useTeams();

    // Sort by performance: points (wins×2) desc, then NRR desc
    const teams = [...rawTeams].sort((a: any, b: any) => {
        const ptDiff = ((b.won || 0) * 2) - ((a.won || 0) * 2);
        if (ptDiff !== 0) return ptDiff;
        return parseFloat(b.nrr || "0") - parseFloat(a.nrr || "0");
    });

    return (
        <DelayedPageLoader isLoading={loading}>
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Tournament Teams</h1>
                    <p className="text-muted-foreground text-sm">BSCCA Season 1 · Official Participants</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {teams.map((team, i) => (
                        <Link key={i} href={`/teams/${team.slug}`} className="group h-full">
                            <Card className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 overflow-hidden h-full">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-primary rounded-2xl text-white flex items-center justify-center text-4xl sm:text-5xl font-bold group-hover:scale-105 transition-transform overflow-hidden">
                                        {team.image ? (
                                            <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                                        ) : (
                                            team.initials
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-foreground text-lg tracking-tight group-hover:text-accent transition-colors line-clamp-2 min-h-[3rem] flex items-center justify-center">
                                            {team.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium">{team.location}</p>
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
