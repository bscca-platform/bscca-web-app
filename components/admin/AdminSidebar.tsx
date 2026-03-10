"use client";

import {
    LayoutDashboard,
    Users,
    Shield,
    Trophy,
    ClipboardList,
    LogOut,
    Menu,
    X,
    Database,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type AdminSection = "overview" | "teams" | "players" | "tournaments" | "matches" | "content";

interface AdminSidebarProps {
    activeSection: AdminSection;
    onSectionChange: (section: AdminSection) => void;
    onSignOut: () => void;
}

export default function AdminSidebar({ activeSection, onSectionChange, onSignOut }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "teams", label: "Teams", icon: Shield },
        { id: "players", label: "Players", icon: Users },
        { id: "tournaments", label: "Tournaments", icon: Trophy },
        { id: "matches", label: "Matches", icon: ClipboardList },
        { id: "content", label: "Content", icon: FileText },
    ] as const;

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="outline"
                size="icon"
                className="fixed top-4 left-4 z-[60] lg:hidden bg-slate-900 text-white border-white/10 shadow-lg rounded-xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[50] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 z-[55] w-72 bg-slate-950 border-r border-white/5 text-white transition-transform duration-300 lg:translate-x-0 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            B
                        </div>
                        <div>
                            <h2 className="text-base font-semibold tracking-tight leading-none">BSCCA</h2>
                            <p className="text-[10px] text-white/40 font-medium mt-0.5">Control Center</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onSectionChange(item.id);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 font-medium text-sm tracking-tight transition-all rounded-xl group relative",
                                activeSection === item.id
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-colors",
                                activeSection === item.id ? "text-accent" : "text-white/40 group-hover:text-white/70"
                            )} />
                            {item.label}
                            {activeSection === item.id && (
                                <div className="absolute right-3 w-1.5 h-1.5 bg-accent rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 space-y-3">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 font-medium text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl group"
                        onClick={onSignOut}
                    >
                        <LogOut className="w-4 h-4 text-red-400/60 group-hover:text-red-400" />
                        Sign Out
                    </button>
                    <div className="flex items-center gap-2.5 px-4 opacity-20">
                        <Database className="w-3 h-3" />
                        <span className="text-[9px] font-medium tracking-wide">v2.1.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
