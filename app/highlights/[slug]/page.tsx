import { notFound } from "next/navigation";
import { HIGHLIGHTS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Trophy, Share2, Info, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HighlightDetailPageProps {
    params: {
        slug: string;
    };
}

export default function HighlightDetailPage({ params }: HighlightDetailPageProps) {
    const highlight = HIGHLIGHTS.find((h) => h.slug === params.slug);

    if (!highlight) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Nav */}
            <div className="bg-white border-b border-border/50 py-3 px-6 sticky top-0 z-50 backdrop-blur-xl bg-white/90">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <span className="text-xs text-muted-foreground font-medium hidden sm:block">BSCCA Season 1 · Official Highlights</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Video */}
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl relative">
                            <iframe
                                src={highlight.videoUrl}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Info Card */}
                        <Card className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
                            <CardContent className="p-6 sm:p-8 space-y-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-accent/10 text-accent border-none font-medium text-xs px-3 py-1 rounded-full">{highlight.match}</Badge>
                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Season 1 · 2024
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{highlight.title}</h1>

                                <p className="text-base text-muted-foreground leading-relaxed">
                                    {highlight.description}
                                </p>

                                <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                                    <Button className="bg-primary text-white font-medium rounded-xl px-6 hover:bg-primary/90 transition-all">
                                        <Play className="w-4 h-4 mr-2" /> Play Now
                                    </Button>
                                    <Button variant="outline" className="rounded-xl font-medium">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-red-500">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        {/* Related */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Related Action</h3>
                            <div className="space-y-4">
                                {HIGHLIGHTS.filter(h => h.id !== highlight.id).map((h) => (
                                    <Link key={h.id} href={`/highlights/${h.slug}`} className="block group">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-24 h-20 bg-primary rounded-xl shrink-0 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                    <Play className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <h4 className="text-sm font-semibold text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-2">
                                                    {h.title}
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground font-medium">{h.match}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Info Widget */}
                        <div className="bg-primary rounded-2xl p-6 text-white space-y-4">
                            <Info className="w-6 h-6 text-accent" />
                            <h4 className="text-lg font-semibold">BSCCA Digital</h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                All match highlights are officially recorded at the Supreme Arena. High-definition replays and ball-by-ball analysis available for registered teams.
                            </p>
                            <Link href="/teams" className="block w-full py-3 bg-white text-primary text-center font-medium text-sm rounded-xl hover:bg-white/90 transition-all">
                                Join the League
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
