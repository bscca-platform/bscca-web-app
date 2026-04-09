"use client";

import dynamic from "next/dynamic";

// Dynamically import TeamAnalytics to avoid SSR issues with Recharts
const TeamAnalytics = dynamic(() => import("./TeamAnalytics"), {
    ssr: false,
    loading: () => (
        <div className="space-y-6">
            <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-muted/30 rounded-2xl animate-pulse border border-border/40" />
                ))}
            </div>
            <div className="h-[380px] bg-muted/30 rounded-2xl animate-pulse border border-border/40" />
        </div>
    ),
});

interface TeamAnalyticsWrapperProps {
    teamSlug: string;
    teamName: string;
    matchData: any[];
    topBatters: any[];
    topBowlers: any[];
    stats: {
        played: number;
        won: number;
        lost: number;
        nrr: string;
    };
}

export default function TeamAnalyticsWrapper(props: TeamAnalyticsWrapperProps) {
    return <TeamAnalytics {...props} />;
}
