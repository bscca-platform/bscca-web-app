import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp, Zap, Target, Award } from "lucide-react";
import Link from "next/link";
import TeamAnalyticsWrapper from "@/components/teams/TeamAnalyticsWrapper";

interface TeamPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    try {
        const teams = await api.getTeams();
        return (teams || []).map((team: any) => ({
            slug: team.slug,
        }));
    } catch (err) {
        console.error("Static params failed:", err);
        return [];
    }
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { slug } = await params;

    let team;
    try {
        team = await api.getTeamBySlug(slug);
    } catch (err) {
        notFound();
    }

    if (!team) {
        notFound();
    }

    // Fetch related data in parallel
    let squad: any[] = [];
    let matches: any[] = [];
    let battingData: any[] = [];
    let bowlingData: any[] = [];

    try {
        [squad, matches, battingData, bowlingData] = await Promise.all([
            api.getTeamPlayers(team.id),
            api.getTeamMatches(team.id),
            api.getTeamScorecardBatting(team.id),
            api.getTeamScorecardBowling(team.id),
        ]);
    } catch (err) {
        console.error("Fetch related data failed:", err);
    }

    // Filter finished matches for stats
    const finishedMatches = (matches || []).filter((m: any) => m.status === 'finished');

    // Transform match data into analytics format
    const allMatches = finishedMatches.map((m: any, i: number) => {
        const isTeam1 = m.team1_id === team.id;
        const scored = parseScore(isTeam1 ? m.team1_score : m.team2_score);
        const conceded = parseScore(isTeam1 ? m.team2_score : m.team1_score);
        const overs = parseOvers(isTeam1 ? (m.team1_overs || m.team1_score) : (m.team2_overs || m.team2_score));
        const oversBowled = parseOvers(isTeam1 ? (m.team2_overs || m.team2_score) : (m.team1_overs || m.team1_score));
        
        return {
            match: `M${i + 1}`,
            opponent: isTeam1 ? (m.t2 || "Unknown") : (m.t1 || "Unknown"),
            runsScored: scored,
            runsConceded: conceded,
            overs: overs,
            oversBowled: oversBowled,
            result: getResult(m, team.id) as "W" | "L" | "NR",
            runRate: overs > 0 ? parseFloat((scored / overs).toFixed(2)) : 0,
            date: m.date,
        };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m, i) => ({ ...m, match: `M${i + 1}` }));

    // Aggregate top batters
    const batterMap = new Map<string, number>();
    (battingData || []).forEach((b: any) => {
        const name = b.player?.name || "Unknown";
        batterMap.set(name, (batterMap.get(name) || 0) + (b.runs || 0));
    });
    const topBatters = Array.from(batterMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, label: "runs" }));

    // Aggregate top bowlers
    const bowlerMap = new Map<string, number>();
    (bowlingData || []).forEach((b: any) => {
        const name = b.player?.name || "Unknown";
        bowlerMap.set(name, (bowlerMap.get(name) || 0) + (b.wickets || 0));
    });
    const topBowlers = Array.from(bowlerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value, label: "wkts" }));

    // Demo data for Beltala Tigers (only if no real data exists)
    const useDemoData = allMatches.length === 0 && team.slug === "beltala-tigers";

    const demoMatchData = [
        { match: "M1", opponent: "Jadavpur Kings", runsScored: 156, runsConceded: 132, overs: 20, oversBowled: 18.4, result: "W" as const, runRate: 7.80 },
        { match: "M2", opponent: "Salt Lake Royals", runsScored: 143, runsConceded: 147, overs: 20, oversBowled: 19.2, result: "L" as const, runRate: 7.15 },
        { match: "M3", opponent: "Behala Warriors", runsScored: 178, runsConceded: 140, overs: 20, oversBowled: 17.3, result: "W" as const, runRate: 8.90 },
        { match: "M4", opponent: "Tollygunge Titans", runsScored: 165, runsConceded: 160, overs: 20, oversBowled: 20, result: "W" as const, runRate: 8.25 },
        { match: "M5", opponent: "Howrah Strikers", runsScored: 120, runsConceded: 124, overs: 18.2, oversBowled: 20, result: "L" as const, runRate: 6.55 },
        { match: "M6", opponent: "Baranagar Blasters", runsScored: 189, runsConceded: 155, overs: 20, oversBowled: 20, result: "W" as const, runRate: 9.45 },
    ];

    const demoBatters = [
        { name: "Arjun Mitra", value: 312, label: "runs" },
        { name: "Soham Ghosh", value: 245, label: "runs" },
        { name: "Rayan Das", value: 198, label: "runs" },
        { name: "Kunal Sen", value: 156, label: "runs" },
        { name: "Anik Roy", value: 120, label: "runs" },
    ];

    const demoBowlers = [
        { name: "Rishav Paul", value: 12, label: "wkts" },
        { name: "Debayan Saha", value: 9, label: "wkts" },
        { name: "Tanmoy Kar", value: 7, label: "wkts" },
        { name: "Anik Roy", value: 5, label: "wkts" },
        { name: "Soham Ghosh", value: 3, label: "wkts" },
    ];

    const demoStats = { played: 6, won: 4, lost: 2, nrr: "+0.856" };

    const teamStats = {
        played: team.played || (useDemoData ? demoStats.played : 0),
        won: team.won || (useDemoData ? demoStats.won : 0),
        lost: team.lost || (useDemoData ? demoStats.lost : 0),
        nrr: team.nrr || (useDemoData ? demoStats.nrr : "0.000"),
    };

    const finalMatchData = useDemoData ? demoMatchData : allMatches;
    const finalBatters = topBatters.length > 0 ? topBatters : (useDemoData ? demoBatters : []);
    const finalBowlers = topBowlers.length > 0 ? topBowlers : (useDemoData ? demoBowlers : []);

    // Parse achievements if it's a JSON string
    let achievements = [];
    if (team.achievements) {
        try {
            achievements = typeof team.achievements === 'string' ? JSON.parse(team.achievements) : team.achievements;
        } catch (e) {
            achievements = [team.achievements];
        }
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Team Hero */}
            <section className="relative overflow-hidden bg-primary py-16 sm:py-24">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-center md:text-left space-y-5">
                        <Badge className="bg-white/10 text-white/80 border-white/20 font-medium px-3 py-1 text-xs rounded-full backdrop-blur-sm">
                            {team.location}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95]">
                            {team.name}
                        </h1>
                        <p className="text-base text-white/60 max-w-xl leading-relaxed">
                            {team.description || `The official BSCCA franchise representing ${team.location}.`}
                        </p>
                    </div>

                    <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center text-6xl md:text-8xl font-bold text-white/80 shadow-2xl overflow-hidden">
                        {team.image ? (
                            <img src={team.image} alt={team.initials} className="w-full h-full object-cover" />
                        ) : (
                            team.initials
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg border border-border/60 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Played", value: teamStats.played },
                        { label: "Won", value: teamStats.won },
                        { label: "Lost", value: teamStats.lost },
                        { label: "NRR", value: teamStats.nrr },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">{stat.label}</span>
                            <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Analytics Section */}
                <TeamAnalyticsWrapper
                    teamSlug={team.slug}
                    teamName={team.name}
                    matchData={finalMatchData}
                    topBatters={finalBatters}
                    topBowlers={finalBowlers}
                    stats={teamStats}
                />

                {/* Squad + Side Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Squad */}
                        <section className="space-y-4">
                            <h3 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                                <Users className="w-5 h-5 text-accent" /> Current Squad
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {squad?.map((player: any, i: any) => (
                                    <Link key={i} href={`/players/${slug}/${player.slug}`} className="bg-white border border-border/60 rounded-xl p-4 flex items-center gap-4 hover:border-accent/40 hover:shadow-sm transition-all group">
                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-semibold text-foreground group-hover:bg-accent group-hover:text-white transition-colors overflow-hidden">
                                            {player.image ? (
                                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                player.name[0]
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{player.name}</span>
                                    </Link>
                                ))}
                                {(!squad || squad.length === 0) && (
                                    <p className="text-sm text-muted-foreground">Roster synchronization in progress...</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        {/* Achievements */}
                        <Card className="rounded-2xl border border-border/60 overflow-hidden">
                            <div className="p-5 border-b border-border/50">
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-accent" /> Achievements
                                </h4>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                {achievements?.map((ach: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Award className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                        <span className="text-sm text-muted-foreground">{ach}</span>
                                    </div>
                                ))}
                                {(achievements.length === 0) && (
                                    <p className="text-sm text-muted-foreground">Chasing history in Season 1...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location Widget */}
                        <div className="bg-accent/10 rounded-2xl p-6 space-y-4">
                            <h4 className="text-lg font-semibold text-foreground">Home Base</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Target className="w-4 h-4 text-accent" /> {team.location}
                            </p>
                            <Link href="/matches" className="block w-full py-3 bg-primary text-white text-center font-medium text-sm rounded-xl hover:bg-primary/90 transition-all">
                                View Schedule
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Utility Functions ──────────────────────────────────────
function parseScore(score: string | null): number {
    if (!score) return 0;
    // Handle formats like "156/6" or "156-6" or just "156"
    const match = score.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function parseOvers(scoreOrOvers: string | null): number {
    if (!scoreOrOvers) return 20; // default to 20 overs
    // Handle formats like "18.4" overs
    const match = scoreOrOvers.match(/(\d+\.?\d*)\s*ov/i);
    if (match) return parseFloat(match[1]);
    // If it's a score like "156/6 (18.4)", extract overs from parenthesis
    const parenMatch = scoreOrOvers.match(/\((\d+\.?\d*)\)/);
    if (parenMatch) return parseFloat(parenMatch[1]);
    return 20;
}

function getResult(match: any, teamId: string): string {
    if (!match.winner_id) return "NR";
    return match.winner_id === teamId ? "W" : "L";
}
