"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import Link from "next/link";
import { HIGHLIGHTS } from "@/lib/data";
import DelayedPageLoader from "@/components/ui/DelayedPageLoader";

export default function HighlightsPage() {
    return (
        <DelayedPageLoader>
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Match Highlights</h1>
                    <p className="text-muted-foreground text-sm">BSCCA Season 01 · Official Replays & Action</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {HIGHLIGHTS.map((highlight) => (
                        <Link key={highlight.id} href={`/highlights/${highlight.slug}`} className="group">
                            <Card className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/10 transition-colors z-10 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                            <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 z-20">
                                        <Badge className="bg-black/60 text-white border-none text-[10px] rounded-md px-2 py-0.5">02:45</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-5 space-y-2">
                                    <Badge className="bg-accent/10 text-accent border-none text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                        {highlight.match}
                                    </Badge>
                                    <h3 className="font-semibold text-foreground text-base tracking-tight leading-snug group-hover:text-accent transition-colors line-clamp-2">
                                        {highlight.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{highlight.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DelayedPageLoader>
    );
}
