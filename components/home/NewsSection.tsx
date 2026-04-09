import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsItem } from "@/lib/types";

interface NewsSectionProps {
    news: NewsItem[];
}

export default function NewsSection({ news }: NewsSectionProps) {
    return (
        <section className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground px-1">Latest News</h2>
            <div className="space-y-4">
                {news.slice(0, 3).map((item) => (
                    <Card key={item.id} className="rounded-2xl border border-border/60 bg-white shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 overflow-hidden cursor-pointer group">
                        <div className="p-5 space-y-3">
                            <Badge className="bg-accent/10 text-accent border-none text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">News</Badge>
                            <h3 className="text-sm font-semibold text-foreground leading-snug tracking-tight group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-accent/40 rounded-full"></div>
                                <p className="text-[11px] text-muted-foreground font-medium">{item.time}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
