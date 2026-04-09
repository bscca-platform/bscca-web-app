"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface CricketBallLoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    fullPage?: boolean;
}

export default function CricketBallLoader({
    size = "md",
    className,
    fullPage = false
}: CricketBallLoaderProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-20 h-20",
        xl: "w-32 h-32"
    };

    const loader = (
        <div className={cn("relative flex items-center justify-center", className)}>
            <div className={cn(
                "animate-cricket-spin",
                sizeClasses[size]
            )}>
                <Image
                    src="/cricket-ball.svg"
                    alt="Loading..."
                    fill
                    className="object-contain"
                />
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4">
                {loader}
                <p className="text-primary font-black italic uppercase tracking-widest animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    return loader;
}
