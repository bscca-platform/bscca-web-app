"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share2, Award, Zap, TrendingUp, User, Target, Instagram, Twitter, Facebook } from "lucide-react";
import Link from "next/link";
import { usePlayer } from "@/hooks/usePlayer";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

interface PlayerPageProps {
    params: Promise<{
        teamSlug: string;
        slug: string;
    }>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
    const { teamSlug, slug } = use(params);
    const { player, loading, error } = usePlayer(slug);

    if (error) {
        notFound();
    }

    const statsDetail = player ? [
        { label: "Matches", value: (player.matches_played || 0).toString(), icon: <Zap className="w-4 h-4" /> },
        { label: "Strike Rate", value: (player.strike_rate || "0.00").toString(), icon: <TrendingUp className="w-4 h-4" /> },
        { label: "Highest", value: (player.highest_score || 0).toString(), icon: <Target className="w-4 h-4" /> },
        { label: "Fifties", value: (player.fifties || 0).toString(), icon: <Award className="w-4 h-4" /> }
    ] : [];

    const teamName = player?.teams?.name || "Free Agent";
    const isTeamKnown = teamSlug !== "freeagent";

    return (
        <DelayedPageLoader isLoading={loading}>
            {player && (
                <div className="min-h-screen bg-background pb-20">
                    {/* Hero */}
                    <section className="relative rounded-3xl overflow-hidden bg-white border-b border-border py-12 sm:py-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>

                        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <Link href="/players" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back to Players
                                </Link>

                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge className="bg-primary text-white font-medium px-3 py-1 rounded-full text-xs border-none">
                                        {teamName}
                                    </Badge>
                                    <Badge variant="outline" className="font-medium px-3 py-1 rounded-full text-xs">
                                        {player.role || player.specialization || "Player"}
                                    </Badge>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[0.95]">
                                    {player.name}
                                </h1>

                                <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4 border-t border-border/50">
                                    {[
                                        { label: "Date of Birth", value: player.dob || "Unknown" },
                                        { label: "Matches", value: player.matches_played || 0 },
                                        { label: "Specialization", value: player.role || "Professional" },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">{item.label}</span>
                                            <span className="text-lg font-semibold text-foreground">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="w-64 h-64 md:w-80 md:h-96 bg-muted rounded-3xl overflow-hidden shadow-xl border border-border/50">
                                {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                                        <User className="w-24 h-24 opacity-20" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Stat Dashboard */}
                    <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
                        <div className="bg-white rounded-2xl shadow-lg border border-border/60 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {statsDetail.map((s, i) => (
                                <div key={i} className="flex flex-col items-center md:items-start space-y-1.5 group">
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-accent transition-colors">
                                        {s.icon}
                                        <span className="text-[10px] font-medium uppercase tracking-wide">{s.label}</span>
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{s.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <main className="max-w-7xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-10">
                                {/* Bio */}
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">About</h2>
                                    <div className="bg-white border border-border/60 rounded-2xl p-8 sm:p-10 shadow-sm">
                                        <p className="text-base text-muted-foreground leading-[1.8] first-letter:text-5xl first-letter:font-bold first-letter:text-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                                            {player.bio || "No tactical data available for this player. Intelligence gathering is currently in progress."}
                                        </p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-primary rounded-2xl p-8 text-white space-y-3 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2.5 bg-white/10 rounded-xl">
                                                <Target className="w-5 h-5 text-white/80" />
                                            </div>
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">Batting</span>
                                        </div>
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-white/50">Offensive Style</span>
                                        <p className="text-2xl font-bold">{player.style_batting || "Aggressive"}</p>
                                    </div>

                                    <div className="bg-white border border-border/60 rounded-2xl p-8 space-y-3 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2.5 bg-accent/10 rounded-xl">
                                                <Zap className="w-5 h-5 text-accent" />
                                            </div>
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Bowling</span>
                                        </div>
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tactical Delivery</span>
                                        <p className="text-2xl font-bold text-foreground">{player.style_bowling || "Strategic"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Affiliation */}
                                <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Primary Affiliation</span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                                                {(teamName)[0]}
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-foreground">{teamName}</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">
                                                    {isTeamKnown ? "Official BSCCA Franchise" : "Unaffiliated Player"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isTeamKnown && (
                                        <Link href={`/teams/${teamSlug}`} className="block w-full py-3 bg-primary text-white text-center font-medium text-sm rounded-xl hover:bg-primary/90 transition-all">
                                            View Team
                                        </Link>
                                    )}
                                </div>

                                {/* Social */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-foreground">Social</h3>
                                    <div className="flex gap-2">
                                        {[Instagram, Twitter, Facebook, Share2].map((Icon, i) => (
                                            <button key={i} className="p-3 rounded-xl bg-white border border-border/60 hover:border-accent/40 hover:text-accent transition-all">
                                                <Icon className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Field Intel */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-foreground">Recent</h3>
                                    <div className="space-y-3">
                                        {[1, 2].map((n) => (
                                            <div key={n} className="p-5 bg-white border border-border/60 rounded-2xl hover:border-accent/30 transition-all group">
                                                <span className="text-[10px] text-accent font-medium uppercase tracking-wide">Match Day</span>
                                                <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">
                                                    {player.name} displayed exceptional performance in the latest powerplay.
                                                </p>
                                                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>Feb 13, 2026</span>
                                                    <Badge className="bg-muted text-muted-foreground text-[9px] border-none px-2 py-0.5 rounded-md">Verified</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </DelayedPageLoader>
    );
}
