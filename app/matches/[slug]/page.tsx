import { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Trophy, Shield, ArrowLeft, Play, Info } from "lucide-react";
import Link from "next/link";
import JsonLd from "@/components/SEO/JsonLd";
import Breadcrumbs from "@/components/SEO/Breadcrumbs";

interface MatchDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const match = await api.getMatchBySlug(slug);
        if (!match) return { title: "Match Not Found" };

        return {
            title: `${match.t1} vs ${match.t2} - Match Details & Highlights`,
            description: `Official details for ${match.t1} vs ${match.t2} at ${match.venue}. Get scores, highlights, and match summary on BSCCA.`,
            openGraph: {
                title: `${match.t1} vs ${match.t2} | BSCCA Cricket`,
                description: `Live updates and highlights for ${match.t1} vs ${match.t2}.`,
                images: match.highlights_url ? [{ url: match.highlights_url }] : [],
            },
        };
    } catch (err) {
        return { title: "Match Details" };
    }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
    const { slug } = await params;
    
    let match, teams;
    try {
        [match, teams] = await Promise.all([
            api.getMatchBySlug(slug),
            api.getTeams()
        ]);
    } catch (err) {
        notFound();
    }

    if (!match || !teams) {
        notFound();
    }

    const team1Data = teams.find((t: any) => t.id === match.team1_id);
    const team2Data = teams.find((t: any) => t.id === match.team2_id);

    // Proxy the video URL if it's from Hugging Face
    const videoUrl = match.highlights_url?.startsWith('https://huggingface.co/') 
        ? `/api/proxy-image?url=${encodeURIComponent(match.highlights_url)}` 
        : match.highlights_url;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${match.t1} vs ${match.t2}`,
        "description": `${match.t1} vs ${match.t2} match at ${match.venue}`,
        "startDate": match.date,
        "location": {
            "@type": "Place",
            "name": match.venue,
            "address": "Beltala, West Bengal, India"
        },
        "competitor": [
            { "@type": "SportsTeam", "name": match.t1 },
            { "@type": "SportsTeam", "name": match.t2 }
        ],
        "image": videoUrl,
        "eventStatus": match.status === 'finished' ? "https://schema.org/EventPostponed" : "https://schema.org/EventScheduled"
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <JsonLd data={jsonLd} />
            {/* Hero */}
            <section className="relative overflow-hidden bg-primary py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-6 relative z-10 mb-8">
                    <Breadcrumbs items={[
                        { label: "Matches", href: "/matches" },
                        { label: `${match.t1} vs ${match.t2}`, href: `/matches/${slug}` }
                    ]} />
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link href="/matches" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Schedule
                    </Link>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl overflow-hidden">
                                {team1Data?.image ? (
                                    <img src={`/api/proxy-image?url=${encodeURIComponent(team1Data.image)}`} alt={match.t1} className="w-full h-full object-cover" />
                                ) : (
                                    match.i1
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-white text-center">{match.t1}</h2>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <span className="text-5xl sm:text-7xl font-bold text-white/10">vs</span>
                            <Badge className={`font-medium px-4 py-1.5 rounded-full text-xs backdrop-blur-sm uppercase ${
                                match.status === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                match.status === 'finished' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                'bg-white/10 text-white border-white/20'
                            }`}>
                                {match.status}
                            </Badge>
                        </div>

                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl overflow-hidden">
                                {team2Data?.image ? (
                                    <img src={`/api/proxy-image?url=${encodeURIComponent(team2Data.image)}`} alt={match.t2} className="w-full h-full object-cover" />
                                ) : (
                                    match.i2
                                )}
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
                    <Card className="rounded-2xl border border-border/60 bg-white shadow-lg p-6 flex flex-col justify-center space-y-6">
                        {[
                            { icon: Calendar, label: "Match Date", value: match.date },
                            { icon: Clock, label: "Start Time", value: match.time || "TBD" },
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

                    {/* Result Card (If finished) */}
                    <Card className="rounded-2xl border border-border/60 bg-emerald-600 text-white shadow-lg p-8 md:col-span-2 overflow-hidden relative">
                         <div className="relative z-10 flex flex-col h-full justify-center text-center sm:text-left">
                            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/60 mb-2">Match Result</h3>
                            <div className="text-3xl sm:text-5xl font-black mb-4">
                                {match.status === 'finished' ? match.result_text : 'Match Preview'}
                            </div>
                            <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                    <Trophy className="w-4 h-4 text-emerald-300" />
                                    <span className="text-sm font-bold uppercase tracking-wider">{match.winner_id ? 'Winner Announced' : 'Fixture Pending'}</span>
                                </div>
                                {match.pom_text && (
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <Shield className="w-4 h-4 text-emerald-300" />
                                        <span className="text-sm font-medium">{match.pom_text}</span>
                                    </div>
                                )}
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Trophy className="w-48 h-48 -mr-12 -mt-12" />
                         </div>
                    </Card>
                </div>

                {/* Highlights Section */}
                {match.highlights_url && (
                    <Card className="rounded-3xl border border-border/60 bg-white shadow-xl mt-8 overflow-hidden">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-lg">
                                    <Play className="w-5 h-5 text-white fill-current" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Match Highlights</h3>
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                4K ULTRA HD
                            </div>
                        </div>
                        <CardContent className="p-0 bg-slate-950 aspect-video relative group">
                            <video 
                                controls 
                                className="w-full h-full"
                                poster={team1Data?.image || team2Data?.image || "/hero-bg.jpg"}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </CardContent>
                    </Card>
                )}

                {/* Preview / Detailed Info */}
                <Card className="rounded-2xl border border-border/60 bg-white shadow-sm mt-8 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
                        <h3 className="text-xl font-semibold text-foreground">Match Summary</h3>
                        <Info className="w-6 h-6 text-accent" />
                    </div>
                    <CardContent className="p-6 sm:p-10">
                        <p className="text-lg text-muted-foreground leading-[1.8] font-medium">
                            {match.status === 'finished' ? (
                                <>This was an incredible encounter between {match.t1} and {match.t2}. {match.result_text}. The match was played with great spirit and provided an unforgettable experience for the fans at {match.venue}.</>
                            ) : (
                                <>Both teams are coming off strong performances in their previous matches. {match.t1} will look to leverage their dominant batting lineup, while {match.t2} will rely on their disciplined bowling attack. The pitch at {match.venue} is expected to favor both batsmen and bowlers, promising a thrilling encounter.</>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
