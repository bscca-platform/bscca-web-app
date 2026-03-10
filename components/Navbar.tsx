"use client"

import Link from "next/link"
import { Trophy, Home, ClipboardList, Users, ChartNoAxesCombined, Shield, Play } from "lucide-react"

export default function Navbar() {
    return (
        <>
            {/* Desktop Navbar — Frosted Glass */}
            <nav className="hidden sm:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 h-16 items-center px-8 shadow-sm">
                <Link href="/" className="mr-8 flex items-center gap-3 group flex-shrink-0">
                    <img
                        src="/logo.png"
                        alt="BSCCA Logo"
                        className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
                    />
                    <span className="text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
                        BSCCA
                    </span>
                </Link>
                <div className="flex gap-8 ml-auto items-center">
                    {[
                        { href: "/", label: "Home" },
                        { href: "/teams", label: "Teams" },
                        { href: "/players", label: "Players" },
                        { href: "/highlights", label: "Highlights" },
                        { href: "/matches", label: "Matches" },
                        { href: "/stats", label: "Stats" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile Bottom Navbar — Frosted Glass */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-16 px-2">
                    {[
                        { href: "/", icon: Home, label: "Home" },
                        { href: "/teams", icon: Shield, label: "Teams" },
                        { href: "/players", icon: Users, label: "Players" },
                        { href: "/matches", icon: ClipboardList, label: "Matches" },
                        { href: "/highlights", icon: Play, label: "Highlights" },
                        { href: "/stats", icon: ChartNoAxesCombined, label: "Stats" },
                    ].map((item) => (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 active:scale-95 transition-transform group">
                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    )
}
