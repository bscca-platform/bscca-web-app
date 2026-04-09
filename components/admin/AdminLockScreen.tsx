"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, ChevronRight, Delete, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLockScreenProps {
    onSuccess: () => void;
}

export default function AdminLockScreen({ onSuccess }: AdminLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const correctPin = "11023021";

    const handleNumberClick = (num: string) => {
        if (pin.length < 8) {
            setPin((prev) => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
        setError(false);
    };

    const handleSubmit = () => {
        if (pin === correctPin) {
            onSuccess();
        } else {
            setError(true);
            setPin("");
        }
    };

    useEffect(() => {
        if (pin.length === 8) {
            handleSubmit();
        }
    }, [pin]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none"></div>

            <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden">
                <CardContent className="p-8 sm:p-12 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex p-4 bg-accent/10 rounded-2xl mb-2">
                            <Lock className="w-7 h-7 text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h2>
                        <p className="text-xs text-white/40 font-medium">
                            BSCCA Control Center · Enter Security PIN
                        </p>
                    </div>

                    {/* PIN Display */}
                    <div className="flex justify-center gap-2.5">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-10 sm:w-9 sm:h-11 rounded-xl border-2 transition-all flex items-center justify-center ${error ? "border-red-500/50 bg-red-500/10" :
                                    i < pin.length ? "border-accent bg-accent/20" : "border-white/10 bg-white/5"
                                    }`}
                            >
                                {i < pin.length && <div className="w-2 h-2 bg-accent rounded-full"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                className="h-14 rounded-xl bg-white/5 border border-white/10 text-xl font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleDelete}
                            className="h-14 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleNumberClick("0")}
                            className="h-14 rounded-xl bg-white/5 border border-white/10 text-xl font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={() => setPin("")}
                            className="h-14 rounded-xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <p className="text-center text-xs font-medium text-red-400">
                            Incorrect PIN · Please try again
                        </p>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 opacity-30">
                        <Shield className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9px] font-medium uppercase tracking-widest text-white">Secure Terminal</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
