"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/lib/types";
import Link from "next/link";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface MatchesScrollProps {
    matches: Match[];
}

export default function MatchesScroll({ matches }: MatchesScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 350;
        scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Upcoming Matches</h2>
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
                {matches.length > 0 ? (
                    matches.map((match, i) => (
                        <Link key={i} href={`/matches/${match.slug}`} className="snap-start text-inherit no-underline flex-shrink-0 group">
                            <Card className="w-[280px] sm:w-[340px] rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 overflow-hidden">
                                <CardContent className="p-6 flex flex-col items-center gap-5">
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-2xl text-white flex items-center justify-center text-2xl sm:text-3xl font-bold">
                                            {match.i1}
                                        </div>
                                        <span className="text-lg font-semibold text-muted-foreground/40">vs</span>
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-2xl text-white flex items-center justify-center text-2xl sm:text-3xl font-bold">
                                            {match.i2}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2 w-full">
                                        <h5 className="font-semibold text-foreground text-base tracking-tight group-hover:text-accent transition-colors">
                                            {match.t1} <span className="text-muted-foreground/40 mx-1">vs</span> {match.t2}
                                        </h5>
                                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border/50">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-accent" />
                                                <Badge className="bg-muted text-foreground border-none font-medium text-[11px] px-2 py-0.5 rounded-md">{match.date}</Badge>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-[11px] text-muted-foreground font-medium">{match.time}</span>
                                            </div>
                                            {match.venue && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[80px]">{match.venue}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="w-full py-16 text-center border border-dashed border-border/60 rounded-2xl bg-white/5 mx-1">
                        <p className="text-muted-foreground text-sm font-medium">No upcoming matches right now</p>
                    </div>
                )}
            </div>
        </section>
    );
}
