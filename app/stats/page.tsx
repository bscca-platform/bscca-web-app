"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POINTS_TABLE } from "@/lib/data";
import { cn } from "@/lib/utils";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

export default function StatsPage() {
    return (
        <DelayedPageLoader>
            <div className="container mx-auto px-6 py-10 space-y-8 bg-background">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Tournament Table</h1>
                    <p className="text-muted-foreground text-sm">BSCCA Season 1 · League Standings</p>
                </div>

                <section>
                    <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-sm bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-muted/60 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                        <th className="py-4 px-5">Rank</th>
                                        <th className="py-4 px-5">Team Franchise</th>
                                        <th className="py-4 px-3 text-center">P</th>
                                        <th className="py-4 px-3 text-center">W</th>
                                        <th className="py-4 px-3 text-center">L</th>
                                        <th className="py-4 px-3 text-center">NR</th>
                                        <th className="py-4 px-3 text-center">NRR</th>
                                        <th className="py-4 px-5 text-center">PTS</th>
                                        <th className="py-4 px-5 text-right">Recent Form</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {POINTS_TABLE.map((row, i) => (
                                        <tr key={row.t} className={cn(
                                            "text-sm font-medium transition-all group hover:bg-muted/30",
                                            i < 2 ? "bg-accent/[0.03]" : ""
                                        )}>
                                            <td className="py-5 px-5 text-lg font-bold text-muted-foreground/50">
                                                {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                            </td>
                                            <td className="py-5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary text-white flex items-center justify-center font-semibold rounded-lg shrink-0 text-sm group-hover:scale-105 transition-transform">
                                                        {row.t[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-foreground font-semibold group-hover:text-accent transition-colors">{row.t}</span>
                                                        <span className="text-[10px] text-muted-foreground">Official Franchise</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-3 text-center text-muted-foreground">{row.p}</td>
                                            <td className="py-5 px-3 text-center font-semibold text-emerald-600">{row.w}</td>
                                            <td className="py-5 px-3 text-center text-red-500/70">{row.l}</td>
                                            <td className="py-5 px-3 text-center text-muted-foreground">{row.nr}</td>
                                            <td className="py-5 px-3 text-center">
                                                <span className={cn(
                                                    "text-xs font-semibold px-2 py-0.5 rounded-md",
                                                    row.nrr.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"
                                                )}>{row.nrr}</span>
                                            </td>
                                            <td className="py-5 px-5 text-center">
                                                <Badge className="bg-primary text-white text-sm px-3 py-1 font-bold border-none rounded-lg group-hover:bg-accent transition-colors">
                                                    {row.pt}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-5">
                                                <div className="flex justify-end gap-1">
                                                    {row.form.map((res, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "w-6 h-6 flex items-center justify-center text-[10px] font-semibold text-white rounded-md",
                                                                res === "W" ? "bg-emerald-500" : res === "L" ? "bg-red-500" : "bg-muted text-muted-foreground"
                                                            )}
                                                        >
                                                            {res}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>
            </div>
        </DelayedPageLoader>
    );
}
