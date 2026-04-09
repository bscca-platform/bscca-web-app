"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, MapPin, Clock } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

export default function MatchesPage() {
    const { matches, loading } = useMatches();

    const liveMatches = matches.filter(m => m.status === "live");
    const upcomingMatches = matches.filter(m => m.status === "upcoming");
    const results = matches.filter(m => m.status === "finished");

    return (
        <DelayedPageLoader isLoading={loading}>
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Schedule & Results</h1>
                    <p className="text-muted-foreground text-sm">BSCCA Season 01 · Match Fixtures</p>
                </div>

                <Tabs defaultValue="live" className="w-full">
                    <TabsList className="flex w-full sm:w-auto h-auto bg-muted/60 p-1 rounded-xl sm:inline-flex">
                        <TabsTrigger value="live" className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm transition-all">Live</TabsTrigger>
                        <TabsTrigger value="upcoming" className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm transition-all">Upcoming</TabsTrigger>
                        <TabsTrigger value="results" className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm transition-all">Results</TabsTrigger>
                    </TabsList>

                    <TabsContent value="live" className="mt-8 space-y-5">
                        {liveMatches.length > 0 ? (
                            liveMatches.map((match) => (
                                <Card key={match.id} className="rounded-2xl border border-border/60 shadow-md overflow-hidden bg-white max-w-4xl">
                                    <CardHeader className="bg-muted/40 py-3 px-5 flex flex-row justify-between items-center border-b border-border/50">
                                        <span className="text-xs text-muted-foreground font-medium">Match {match.match_number} · {match.stage} · {match.venue}</span>
                                        <Badge className="bg-red-500 text-white animate-pulse border-none font-medium text-[10px] rounded-full px-2.5">LIVE</Badge>
                                    </CardHeader>
                                    <CardContent className="p-8 sm:p-10">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                                                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold">{match.team1?.initials || 'T1'}</div>
                                                <div>
                                                    <span className="block text-xs text-muted-foreground font-medium">{match.team1?.name}</span>
                                                    <span className="text-3xl font-bold text-foreground">{match.team1_score || '---'}</span>
                                                </div>
                                            </div>
                                            <span className="text-lg font-medium text-muted-foreground/30">vs</span>
                                            <div className="flex flex-col sm:flex-row-reverse items-center gap-4 flex-1 opacity-60">
                                                <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center text-xl font-bold">{match.team2?.initials || 'T2'}</div>
                                                <div className="sm:text-right">
                                                    <span className="block text-xs text-muted-foreground font-medium">{match.team2?.name}</span>
                                                    <span className="text-3xl font-bold text-muted-foreground">{match.team2_score || '---'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    {match.match_status_text && (
                                        <div className="bg-muted/40 p-3 text-center text-xs font-medium text-muted-foreground border-t border-border/50">
                                            {match.match_status_text}
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <div className="py-16 text-center border border-dashed border-border/100 rounded-2xl">
                                <p className="text-muted-foreground text-sm">No live matches at the moment</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl">
                            {upcomingMatches.length > 0 ? (
                                upcomingMatches.map((match) => (
                                    <Card key={match.id} className="rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                                        <CardHeader className="bg-muted/40 p-4 border-b border-border/50 flex flex-row justify-between items-center">
                                            <span className="text-[11px] text-muted-foreground font-medium">Match {match.match_number} · {match.stage}</span>
                                            <div className="flex gap-1.5 items-center text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[11px] font-medium">{match.time}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="flex justify-around items-center gap-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform">{match.team1?.initials || 'T1'}</div>
                                                    <span className="text-[11px] text-muted-foreground font-medium">{match.team1?.name}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs text-muted-foreground/30 font-medium">vs</span>
                                                    <Badge className="bg-muted text-muted-foreground border-none text-[10px] font-medium px-2 py-0.5 rounded-md">{match.date}</Badge>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform">{match.team2?.initials || 'T2'}</div>
                                                    <span className="text-[11px] text-muted-foreground font-medium">{match.team2?.name}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <div className="bg-muted/40 p-2.5 text-center text-[10px] text-muted-foreground font-medium border-t border-border/50 flex items-center justify-center gap-1.5">
                                            <MapPin className="w-3 h-3" /> {match.venue || "Supreme Arena Ground"}
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="py-16 text-center border border-dashed border-border/100 rounded-2xl">
                                    <p className="text-muted-foreground text-sm">No upcoming matches at the moment</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="results" className="mt-8 space-y-4">
                        {upcomingMatches.length > 0 ? (
                            results.map((match) => (
                                <Card key={match.id} className="rounded-2xl border border-border/60 shadow-sm overflow-hidden max-w-4xl bg-white">
                                    <CardContent className="p-0">
                                        <div className="bg-muted/40 p-3 px-5 flex justify-between items-center text-[11px] text-muted-foreground font-medium border-b border-border/50">
                                            <span>Match {match.match_number} · {match.date}, 2026</span>
                                            <span className="flex items-center gap-1.5">{match.result_text} <Trophy className="w-3 h-3 text-accent" /></span>
                                        </div>
                                        <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                                            <div className="text-center sm:text-left space-y-1">
                                                <span className="text-xs text-muted-foreground">Team 1</span>
                                                <div className="text-xl font-semibold text-foreground">{match.team1?.name}</div>
                                                <div className="text-lg font-bold text-foreground">{match.team1_score}</div>
                                            </div>
                                            <span className="text-sm text-muted-foreground/30 font-medium">vs</span>
                                            <div className="text-center sm:text-right space-y-1 opacity-60">
                                                <span className="text-xs text-muted-foreground">Team 2</span>
                                                <div className="text-xl font-semibold text-muted-foreground">{match.team2?.name}</div>
                                                <div className="text-lg font-bold text-muted-foreground">{match.team2_score}</div>
                                            </div>
                                        </div>
                                        {match.pom_text && (
                                            <div className="bg-muted/30 p-3 text-center text-xs text-muted-foreground border-t border-border/50">
                                                Player of the Match: <span className="font-semibold text-foreground">{match.pom_text}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="py-16 text-center border border-dashed border-border/100 rounded-2xl">
                                <p className="text-muted-foreground text-sm">No results at the moment</p>
                            </div>)}
                    </TabsContent>
                </Tabs>
            </div>
        </DelayedPageLoader>
    );
}
