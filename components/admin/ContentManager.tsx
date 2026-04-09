"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Play, Plus, Edit2, Trash2, Video, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContentManager() {
    return (
        <div className="space-y-8">
            <Tabs defaultValue="news" className="w-full">
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl inline-flex mb-8">
                    <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium text-sm gap-2 px-5 py-2.5 text-white/50 transition-all">
                        <Newspaper className="w-4 h-4" /> News
                    </TabsTrigger>
                    <TabsTrigger value="highlights" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium text-sm gap-2 px-5 py-2.5 text-white/50 transition-all">
                        <Video className="w-4 h-4" /> Highlights
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="news" className="space-y-8"><NewsModule /></TabsContent>
                <TabsContent value="highlights" className="space-y-8"><HighlightsModule /></TabsContent>
            </Tabs>
        </div>
    );
}

function NewsModule() {
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const labelClass = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">News Editor</h3>
                <Button className="bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-5 h-10 text-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> New Post
                </Button>
            </div>

            <Card className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Headline</label>
                            <input type="text" placeholder="Enter headline..." className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Category</label>
                            <select className={`${inputClass} appearance-none`}>
                                <option>News</option><option>Update</option><option>Alert</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClass}>Content</label>
                        <textarea rows={4} placeholder="Type news content..." className={`${inputClass} resize-none`} />
                    </div>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-xl h-11">Publish</Button>
                </div>
            </Card>

            <div className="space-y-3">
                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wide">Recent Posts</h4>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/[0.03] border-l-2 border-accent/40 rounded-lg p-4 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">League Match 12 rescheduled for tomorrow</p>
                            <p className="text-[10px] text-white/30 font-medium">Feb 12 · Updates</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button className="p-2 rounded-lg hover:bg-white/10 hover:text-accent text-white/30 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HighlightsModule() {
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const labelClass = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Media Library</h3>
                <Button className="bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-5 h-10 text-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> Upload Highlight
                </Button>
            </div>

            <Card className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Match Reference</label>
                            <select className={`${inputClass} appearance-none`}>
                                <option>Match 12: Tigers vs Stars</option><option>Match 11: Warriors vs Gladiators</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Title</label>
                            <input type="text" placeholder="e.g. Explosive Batting by Tigers" className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Video URL</label>
                            <input type="text" placeholder="https://youtube.com/..." className={inputClass} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="aspect-video bg-white/[0.03] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 group hover:border-accent/30 transition-all cursor-pointer">
                            <Video className="w-10 h-10 text-white/20 group-hover:text-accent/50 transition-colors" />
                            <p className="text-[11px] font-medium text-white/30">Drop thumbnail here</p>
                        </div>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-xl h-11">Save Highlight</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] group hover:border-white/10 transition-all overflow-hidden">
                        <div className="aspect-video bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-10 h-10 text-white/10 group-hover:text-accent/50 group-hover:scale-110 transition-all fill-current" />
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-white/80">Match 12 Highlights</p>
                                <p className="text-[10px] text-white/30 font-medium mt-0.5">45,230 Views</p>
                            </div>
                            <button className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
