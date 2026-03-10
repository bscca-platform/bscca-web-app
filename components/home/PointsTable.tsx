"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PointTableEntry } from "@/lib/types";
import { useTeams } from "@/hooks/useTeams";

interface PointsTableProps {
    entries: PointTableEntry[];
}

export default function PointsTable({ entries: initialEntries }: PointsTableProps) {
    const { teams, loading } = useTeams();

    const entries: PointTableEntry[] = loading ? initialEntries : teams.map(t => ({
        t: t.name,
        p: t.played || 0,
        w: t.won || 0,
        l: t.lost || 0,
        nr: 0,
        nrr: t.nrr || "0.000",
        pt: (t.won || 0) * 2,
        form: []
    })).sort((a, b) => b.pt - a.pt || parseFloat(b.nrr) - parseFloat(a.nrr));

    return (
        <section className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground px-1">Points Table</h2>
            <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden bg-white">
                <div className="bg-muted/60 text-muted-foreground p-3 text-[10px] font-semibold uppercase tracking-wide grid grid-cols-12 gap-1">
                    <span className="col-span-4">Team</span>
                    <span className="text-center">P</span>
                    <span className="text-center">W</span>
                    <span className="text-center">L</span>
                    <span className="text-center">NR</span>
                    <span className="text-center col-span-3">NRR</span>
                    <span className="text-center">Pts</span>
                </div>
                <div className="divide-y divide-border/30">
                    {entries.map((row) => (
                        <div key={row.t} className="p-3 text-xs font-medium grid grid-cols-12 gap-1 hover:bg-muted/30 transition-colors items-center">
                            <span className="col-span-4 flex items-center gap-2">
                                <span className="w-5 h-5 bg-primary text-[8px] flex items-center justify-center text-white rounded-md shrink-0 font-semibold">{row.t[0]}</span>
                                <span className="truncate text-foreground">{row.t}</span>
                            </span>
                            <span className="text-center text-muted-foreground">{row.p}</span>
                            <span className="text-center text-emerald-600 font-semibold">{row.w}</span>
                            <span className="text-center text-red-500/70">{row.l}</span>
                            <span className="text-center text-muted-foreground">{row.nr}</span>
                            <span className="text-center col-span-3 text-muted-foreground">{row.nrr}</span>
                            <span className="text-center text-foreground font-bold">{row.pt}</span>
                        </div>
                    ))}
                </div>
                <Link href="/stats" className="block text-center p-3 bg-muted/40 text-xs font-medium text-muted-foreground hover:text-accent hover:bg-muted/60 transition-all border-t border-border/30">
                    Full Standings →
                </Link>
            </Card>
        </section>
    );
}
