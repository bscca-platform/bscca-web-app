"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Highlight } from "@/lib/types";
import Link from "next/link";

interface HighlightsScrollProps {
    highlights: Highlight[];
}

export default function HighlightsScroll({ highlights }: HighlightsScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 330;
        scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Match Highlights</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center hover:bg-muted/60 hover:border-accent/30 transition-all shadow-sm active:scale-95">
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth">
                {highlights.map((highlight) => (
                    <Link key={highlight.id} href={`/highlights/${highlight.slug}`} className="snap-start text-inherit no-underline flex-shrink-0 group">
                        <Card className="w-[260px] sm:w-[320px] rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-muted relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/10 transition-colors z-10 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 z-20">
                                    <Badge className="bg-black/60 text-white border-none text-[10px] rounded-md px-2 py-0.5">02:45</Badge>
                                </div>
                            </div>

                            <CardContent className="p-4 space-y-1.5">
                                <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">{highlight.match}</span>
                                <h5 className="font-semibold text-foreground text-sm tracking-tight leading-snug group-hover:text-accent transition-colors line-clamp-1">
                                    {highlight.title}
                                </h5>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                    {highlight.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
