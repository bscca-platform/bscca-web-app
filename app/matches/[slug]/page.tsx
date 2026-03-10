import { notFound } from "next/navigation";
import { UPCOMING_MATCHES, TEAMS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Trophy, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MatchDetailPageProps {
    params: {
        slug: string;
    };
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
    const match = UPCOMING_MATCHES.find((m) => m.slug === params.slug);

    if (!match) {
        notFound();
    }

    const team1 = TEAMS.find(t => t.name.includes(match.t1) || t.initials === match.i1);
    const team2 = TEAMS.find(t => t.name.includes(match.t2) || t.initials === match.i2);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden bg-primary py-16 sm:py-24">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link href="/matches" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-10">
                        <ArrowLeft className="w-4 h-4" /> Back to Schedule
                    </Link>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl">
                                {match.i1}
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-white text-center">{match.t1}</h2>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <span className="text-5xl sm:text-7xl font-bold text-white/10">vs</span>
                            <Badge className="bg-white/10 text-white border-white/20 font-medium px-4 py-1.5 rounded-full text-xs backdrop-blur-sm">Upcoming</Badge>
                        </div>

                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl">
                                {match.i2}
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-white text-center">{match.t2}</h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Match Info */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Date/Time/Venue */}
                    <Card className="rounded-2xl border border-border/60 bg-white shadow-lg p-6 space-y-5">
                        {[
                            { icon: Calendar, label: "Match Date", value: `${match.date}, 2024` },
                            { icon: Clock, label: "Start Time", value: match.time },
                            { icon: MapPin, label: "Stadium", value: match.venue },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="p-2.5 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                                    <item.icon className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</span>
                                    <span className="block text-base font-semibold text-foreground">{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* Team 1 Squad */}
                    <Card className="rounded-2xl border border-border/60 bg-primary text-white shadow-lg p-6 overflow-hidden relative">
                        <div className="absolute -right-6 -bottom-6 text-7xl font-bold opacity-5">{match.i1}</div>
                        <h3 className="text-lg font-semibold mb-4 pb-3 border-b border-white/10">{match.t1} Squad</h3>
                        <ul className="space-y-2.5 relative z-10">
                            {team1?.squad?.map((player, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors group cursor-pointer">
                                    <Shield className="w-3.5 h-3.5 text-accent/60 group-hover:text-accent" /> {player}
                                </li>
                            )) || <li className="text-sm text-white/40">Squad not announced</li>}
                        </ul>
                    </Card>

                    {/* Team 2 Squad */}
                    <Card className="rounded-2xl border border-border/60 bg-primary text-white shadow-lg p-6 overflow-hidden relative">
                        <div className="absolute -right-6 -bottom-6 text-7xl font-bold opacity-5">{match.i2}</div>
                        <h3 className="text-lg font-semibold mb-4 pb-3 border-b border-white/10">{match.t2} Squad</h3>
                        <ul className="space-y-2.5 relative z-10">
                            {team2?.squad?.map((player, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors group cursor-pointer">
                                    <Shield className="w-3.5 h-3.5 text-accent/60 group-hover:text-accent" /> {player}
                                </li>
                            )) || <li className="text-sm text-white/40">Squad not announced</li>}
                        </ul>
                    </Card>
                </div>

                {/* Preview */}
                <Card className="rounded-2xl border border-border/60 bg-white shadow-sm mt-8 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
                        <h3 className="text-xl font-semibold text-foreground">Match Preview</h3>
                        <Trophy className="w-6 h-6 text-accent" />
                    </div>
                    <CardContent className="p-6 sm:p-10">
                        <p className="text-base text-muted-foreground leading-[1.8]">
                            Both teams are coming off strong performances in their previous matches. {match.t1} will look to leverage their dominant batting lineup, while {match.t2} will rely on their disciplined bowling attack. The pitch at {match.venue} is expected to favor both batsmen and bowlers, promising a thrilling encounter.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
