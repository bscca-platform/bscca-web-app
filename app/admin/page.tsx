"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users, Trophy, ClipboardList, Database, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import AdminLockScreen from "@/components/admin/AdminLockScreen";
import AdminSidebar, { AdminSection } from "@/components/admin/AdminSidebar";
import TeamsManager from "@/components/admin/TeamsManager";
import PlayersManager from "@/components/admin/PlayersManager";
import TournamentManager from "@/components/admin/TournamentManager";
import MatchesManager from "@/components/admin/MatchesManager";
import ContentManager from "@/components/admin/ContentManager";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeSection, setActiveSection] = useState<AdminSection>("overview");

    if (!isAuthenticated) {
        return <AdminLockScreen onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex overflow-x-hidden relative">
            {/* Subtle gradient bg */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.04)_0%,transparent_50%)] pointer-events-none"></div>

            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                onSignOut={() => setIsAuthenticated(false)}
            />

            <main className="flex-grow lg:ml-72 min-h-screen p-6 sm:p-10 transition-all duration-300">
                <div className="max-w-6xl mx-auto space-y-10">
                    <header className="space-y-3 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3 text-white/30">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-medium uppercase tracking-widest">BSCCA Control Center</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white capitalize">
                            {activeSection}
                        </h1>
                    </header>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeSection === "overview" && <OverviewModule />}
                        {activeSection === "teams" && <TeamsManager />}
                        {activeSection === "players" && <PlayersManager />}
                        {activeSection === "tournaments" && <TournamentManager />}
                        {activeSection === "matches" && <MatchesManager />}
                        {activeSection === "content" && <ContentManager />}
                    </div>
                </div>
            </main>
        </div>
    );
}

function OverviewModule() {
    const [stats, setStats] = useState({ players: 0, teams: 0, matches: 0, revenue: "₹45K" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAdminStats().then(data => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch stats:", err);
            setLoading(false);
        });
    }, []);

    const statItems = [
        { label: "Active Players", value: stats.players.toString(), icon: Users, trend: "+12", trendUp: true },
        { label: "Total Teams", value: stats.teams.toString().padStart(2, '0'), icon: Shield, trend: "Stable", trendUp: false },
        { label: "Match Count", value: stats.matches.toString(), icon: ClipboardList, trend: "Season 1", trendUp: false },
        { label: "Total Revenue", value: stats.revenue, icon: Trophy, trend: "+15%", trendUp: true },
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat, i) => (
                    <Card key={i} className={cn(
                        "rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all group cursor-default",
                        loading && "animate-pulse"
                    )}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-accent/10 transition-colors">
                                    <stat.icon className="w-5 h-5 text-white/50 group-hover:text-accent transition-colors" />
                                </div>
                                <span className={cn("text-[10px] font-medium", stat.trendUp ? "text-emerald-400" : "text-white/30")}>{stat.trend}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold text-white tracking-tight">{loading ? "..." : stat.value}</p>
                                <p className="text-[11px] text-white/40 font-medium">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-5">
                <h3 className="text-xl font-semibold text-white tracking-tight">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="rounded-2xl border border-white/5 bg-white/[0.03] group cursor-pointer hover:bg-accent/10 hover:border-accent/20 transition-all">
                        <CardContent className="p-10 flex flex-col items-center gap-5">
                            <PlusCircle className="w-12 h-12 text-white/30 group-hover:text-accent group-hover:rotate-90 transition-all" />
                            <div className="text-center">
                                <span className="block text-lg font-semibold text-white">Initialize Match</span>
                                <span className="text-xs text-white/30 font-medium">Start a new match session</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border border-white/5 bg-white/[0.03] group cursor-pointer hover:bg-white/[0.06] transition-all">
                        <CardContent className="p-10 flex flex-col items-center gap-5">
                            <Database className="w-12 h-12 text-white/20 group-hover:text-white/50 transition-all" />
                            <div className="text-center">
                                <span className="block text-lg font-semibold text-white">Database</span>
                                <span className="text-xs text-white/30 font-medium">Sync & manage data</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
