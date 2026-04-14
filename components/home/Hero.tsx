import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="relative rounded-none sm:rounded-t-[40px] min-h-[420px] sm:min-h-[520px] flex items-center justify-center overflow-hidden text-white px-6 py-24 text-center">
            {/* Background image */}
            <img src="/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-primary/70"></div>
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-primary/20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>

            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <Badge className="bg-white/10 text-white/90 border-white/20 backdrop-blur-sm font-medium px-4 py-1.5 text-xs tracking-wide rounded-full">
                    Est. 2026 · Season 01
                </Badge>
                <h1 className="text-4xl sm:text-6xl text-white/90 md:text-7xl font-bold tracking-tight leading-[1.05]">
                    Beltala Supreme Council of Cricket Authority
                </h1>
                <p className="text-base sm:text-lg max-w-xl mx-auto text-white/70 leading-relaxed font-normal">
                    The ultimate cricket authority in the heart of Beltala.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold h-12 px-8 rounded-xl shadow-lg shadow-white/10 transition-all hover:shadow-xl hover:shadow-white/20">
                        Explore Schedule
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold h-12 px-8 rounded-xl backdrop-blur-sm transition-all">
                        Latest Match
                    </Button>
                </div>
            </div>
        </section>
    );
}
