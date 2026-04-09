"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, Target, Award, ChevronDown } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from "recharts";

// ─── Types ──────────────────────────────────────────────────
interface MatchPerformance {
    match: string;        // "M1", "M2", etc.
    opponent: string;     // Opponent team name
    runsScored: number;
    runsConceded: number;
    overs: number;        // Overs batted
    oversBowled: number;  // Overs bowled
    result: "W" | "L" | "NR";
    runRate: number;
}

interface TopPerformer {
    name: string;
    value: number;
    label: string;        // "runs" | "wickets"
}

interface TeamAnalyticsProps {
    teamSlug: string;
    teamName: string;
    matchData: MatchPerformance[];
    topBatters: TopPerformer[];
    topBowlers: TopPerformer[];
    stats: {
        played: number;
        won: number;
        lost: number;
        nrr: string;
    };
}

// ─── Colors ─────────────────────────────────────────────────
const COLORS = {
    win: "#10b981",
    loss: "#ef4444",
    nr: "#94a3b8",
    accent: "#10b981",
    primary: "#0f172a",
    muted: "#64748b",
    grid: "#f1f5f9",
    area: "rgba(16, 185, 129, 0.1)",
};

const PIE_COLORS = [COLORS.win, COLORS.loss, COLORS.nr];

// ─── Custom Tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-md border border-border/60 rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────
export default function TeamAnalytics({
    teamSlug,
    teamName,
    matchData,
    topBatters,
    topBowlers,
    stats
}: TeamAnalyticsProps) {
    const [activeChart, setActiveChart] = useState<"runs" | "rate" | "compare">("runs");

    // Prepare pie data
    const pieData = [
        { name: "Won", value: stats.won },
        { name: "Lost", value: stats.lost },
        { name: "NR", value: Math.max(0, stats.played - stats.won - stats.lost) },
    ].filter(d => d.value > 0);

    // Calculate cumulative NRR trend
    const nrrTrend = matchData.map((m, i) => {
        const runDiff = m.runsScored - m.runsConceded;
        const overDiff = m.overs > 0 ? m.overs : 1;
        const nrr = (runDiff / overDiff).toFixed(3);
        return {
            match: m.match,
            nrr: parseFloat(nrr),
            runRate: m.runRate,
        };
    });

    const chartTabs = [
        { key: "runs" as const, label: "Runs / Match", icon: BarChart3 },
        { key: "rate" as const, label: "Run Rate Trend", icon: TrendingUp },
        { key: "compare" as const, label: "Scored vs Conceded", icon: Target },
    ];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" /> Performance Analytics
                </h3>
            </div>

            {/* Top Row: Win/Loss Donut + Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Win/Loss Donut */}
                <Card className="rounded-2xl border border-border/60 overflow-hidden">
                    <CardContent className="p-5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-3">
                            Win / Loss Ratio
                        </p>
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        iconSize={8}
                                        iconType="circle"
                                        formatter={(value: string) => (
                                            <span className="text-[10px] text-muted-foreground font-medium ml-1">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Batting Stats */}
                <Card className="rounded-2xl border border-border/60 overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Batting Overview
                        </p>
                        {[
                            { label: "Avg Score", value: matchData.length > 0 ? Math.round(matchData.reduce((s, m) => s + m.runsScored, 0) / matchData.length) : 0 },
                            { label: "Highest", value: matchData.length > 0 ? Math.max(...matchData.map(m => m.runsScored)) : 0 },
                            { label: "Lowest", value: matchData.length > 0 ? Math.min(...matchData.map(m => m.runsScored)) : 0 },
                            { label: "Avg Run Rate", value: matchData.length > 0 ? (matchData.reduce((s, m) => s + m.runRate, 0) / matchData.length).toFixed(2) : "0.00" },
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                                <span className="text-sm font-bold text-foreground">{s.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Key Bowling Stats */}
                <Card className="rounded-2xl border border-border/60 overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Bowling Overview
                        </p>
                        {[
                            { label: "Avg Conceded", value: matchData.length > 0 ? Math.round(matchData.reduce((s, m) => s + m.runsConceded, 0) / matchData.length) : 0 },
                            { label: "Best Defense", value: matchData.length > 0 ? Math.min(...matchData.map(m => m.runsConceded)) : 0 },
                            { label: "Worst Conceded", value: matchData.length > 0 ? Math.max(...matchData.map(m => m.runsConceded)) : 0 },
                            { label: "NRR", value: stats.nrr },
                        ].map((s, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                                <span className="text-sm font-bold text-foreground">{s.value}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Chart Tabs + Main Chart */}
            <Card className="rounded-2xl border border-border/60 overflow-hidden">
                {/* Tabs */}
                <div className="bg-muted/30 border-b border-border/50 px-4 py-2 flex gap-1 overflow-x-auto">
                    {chartTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveChart(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeChart === tab.key
                                    ? "bg-white shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <CardContent className="p-5">
                    <div className="h-[300px] w-full">
                        {activeChart === "runs" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={matchData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                                    <XAxis
                                        dataKey="match"
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="runsScored"
                                        name="Runs Scored"
                                        radius={[6, 6, 0, 0]}
                                    >
                                        {matchData.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.result === "W" ? COLORS.win : entry.result === "L" ? COLORS.loss : COLORS.nr}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {activeChart === "rate" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={nrrTrend}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                                    <XAxis
                                        dataKey="match"
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="runRate"
                                        name="Run Rate"
                                        stroke={COLORS.accent}
                                        strokeWidth={2.5}
                                        fill="url(#colorRate)"
                                        dot={{ fill: COLORS.accent, strokeWidth: 0, r: 4 }}
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}

                        {activeChart === "compare" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={matchData} barGap={4} barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                                    <XAxis
                                        dataKey="match"
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: COLORS.muted }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="top"
                                        iconSize={8}
                                        iconType="circle"
                                        formatter={(value: string) => (
                                            <span className="text-[11px] text-muted-foreground font-medium ml-1">{value}</span>
                                        )}
                                    />
                                    <Bar dataKey="runsScored" name="Scored" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="runsConceded" name="Conceded" fill={COLORS.loss} radius={[4, 4, 0, 0]} opacity={0.6} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Batters */}
                <Card className="rounded-2xl border border-border/60 overflow-hidden">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border/50 flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Top Run Scorers</span>
                    </div>
                    <CardContent className="p-0">
                        {topBatters.length > 0 ? topBatters.map((player, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground/50 w-5">{i + 1}</span>
                                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-xs font-bold text-accent">
                                        {player.name[0]}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{player.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-foreground">{player.value}</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">{player.label}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-5 text-sm text-muted-foreground text-center">No data yet</div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Bowlers */}
                <Card className="rounded-2xl border border-border/60 overflow-hidden">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border/50 flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Top Wicket Takers</span>
                    </div>
                    <CardContent className="p-0">
                        {topBowlers.length > 0 ? topBowlers.map((player, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-muted-foreground/50 w-5">{i + 1}</span>
                                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-xs font-bold text-red-500">
                                        {player.name[0]}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{player.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-foreground">{player.value}</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">{player.label}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-5 text-sm text-muted-foreground text-center">No data yet</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
