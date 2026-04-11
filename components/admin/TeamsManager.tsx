"use client";

import { useTeams } from "@/hooks/useTeams";
import { api } from "@/lib/api";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Shield, MapPin, Users, Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamsManager() {
    const { teams: liveTeams, loading } = useTeams();
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        location: "",
        initials: "",
        description: "",
        image: "",
        squadRoster: "",
        played: 0,
        won: 0,
        lost: 0,
        nrr: "0.000"
    });

    const handleOpenModal = (team: any = null) => {
        if (team) {
            setEditingTeam(team);
            setFormData({
                name: team.name,
                slug: team.slug,
                location: team.location || "",
                initials: team.initials || "",
                description: team.description || "",
                image: team.image || "",
                squadRoster: "",
                played: team.played || 0,
                won: team.won || 0,
                lost: team.lost || 0,
                nrr: team.nrr || "0.000"
            });
        } else {
            setEditingTeam(null);
            setFormData({
                name: "",
                slug: "",
                location: "",
                initials: "",
                description: "",
                image: "",
                squadRoster: "",
                played: 0,
                won: 0,
                lost: 0,
                nrr: "0.000"
            });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { url } = await api.uploadFile(file);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSaveTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, slug, location, initials, description, image, played, won, lost, nrr } = formData;
        if (!name || !slug) return alert("Name and Slug are required.");

        const payload = {
            name, slug, location, initials, description, image,
            played: Number(played), won: Number(won), lost: Number(lost), nrr
        };

        try {
            if (editingTeam) {
                await api.updateTeam(editingTeam.id, payload);
                setIsModalOpen(false);
            } else {
                const teamId = await api.createTeam(payload);
                if (teamId && formData.squadRoster) {
                    const playerNames = formData.squadRoster.split(',').map(n => n.trim()).filter(n => n !== "");
                    for (const playerName of playerNames) {
                        await api.createPlayer({
                            name: playerName,
                            slug: playerName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                            team_id: teamId,
                            role: "Batsman",
                            specialization: "General"
                        });
                    }
                }
                setIsModalOpen(false);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteTeam = async (id: string) => {
        if (confirm("Are you sure you want to delete this franchise?")) {
            try {
                await api.deleteTeam(id);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const filteredTeams = liveTeams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.initials?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <TeamEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                team={editingTeam}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveTeam}
                onUpload={handleImageUpload}
                uploading={uploading}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-10 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white"
                    />
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-5 h-10 text-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> Register Team
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map((team) => (
                        <Card key={team.slug} className="rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all group overflow-hidden">
                            <CardContent className="p-6 space-y-5 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                                        {team.image ? <img src={team.image} alt={team.initials} className="w-full h-full object-cover" /> : team.initials}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleOpenModal(team)} className="p-2 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent transition-all text-white/40">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => (team as any).id && handleDeleteTeam((team as any).id)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-white/40"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-base font-semibold text-white">{team.name}</h3>
                                    <div className="flex items-center gap-1.5 text-white/30">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-[11px] font-medium">{team.location}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] text-white/30 font-medium">P / W</p>
                                        <p className="text-sm font-semibold text-white">{team.played || 0} / {team.won || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 font-medium">NRR</p>
                                        <p className="text-sm font-semibold text-white">{team.nrr || "0.000"}</p>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-xl text-xs font-medium transition-all h-9">
                                    Manage Roster
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function TeamEditModal({ isOpen, onClose, team, formData, setFormData, onSave, onUpload, uploading }: any) {
    if (!isOpen) return null;

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const labelClass = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl overflow-y-auto max-h-[95vh]">
                <CardHeader className="border-b border-white/5 p-6 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-white">{team ? 'Update Team' : 'Register Team'}</h3>
                        <p className="text-xs text-white/40 font-medium mt-1">Team management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/40">
                        <X className="w-5 h-5" />
                    </button>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={onSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelClass}>Team Name</label>
                                <input type="text" value={formData.name} onChange={(e) => {
                                    const name = e.target.value;
                                    const autoSlug = !editingTeam
                                        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)
                                        : formData.slug;
                                    setFormData({ ...formData, name, slug: autoSlug });
                                }} className={inputClass} placeholder="e.g. Beltala Tigers" />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Slug</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={inputClass} placeholder="e.g. beltala-tigers" />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Initials</label>
                                <input type="text" value={formData.initials} onChange={(e) => setFormData({ ...formData, initials: e.target.value })} className={inputClass} placeholder="e.g. BT" />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Location</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="e.g. Beltala North" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wide">Performance Stats</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Played</label>
                                    <input type="number" value={formData.played} onChange={(e) => setFormData({ ...formData, played: e.target.value })} className={inputClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Wins</label>
                                    <input type="number" value={formData.won} onChange={(e) => setFormData({ ...formData, won: e.target.value })} className={inputClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Losses</label>
                                    <input type="number" value={formData.lost} onChange={(e) => setFormData({ ...formData, lost: e.target.value })} className={inputClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>NRR</label>
                                    <input type="text" value={formData.nrr} onChange={(e) => setFormData({ ...formData, nrr: e.target.value })} className={inputClass} placeholder="0.000" />
                                </div>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-3 p-5 bg-white/[0.02] rounded-xl border border-white/5">
                            <label className={labelClass}>Team Logo</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative border border-white/10">
                                    {formData.image && /^https?:\/\/.+\..+/.test(formData.image) ? (
                                        <img src={formData.image} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white/30" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className={inputClass} placeholder="Image URL..." />
                                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 text-white/70 text-xs font-medium cursor-pointer hover:bg-white/10 transition-all rounded-xl border border-white/10">
                                        <Upload className="w-3.5 h-3.5" />
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'teams')} disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} min-h-[80px] resize-none`} placeholder="Team description..." />
                        </div>

                        {!team && (
                            <div className="space-y-2 p-5 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                                <label className={labelClass}>Squad Roster (comma-separated)</label>
                                <textarea value={formData.squadRoster} onChange={(e) => setFormData({ ...formData, squadRoster: e.target.value })} className={`${inputClass} min-h-[80px] resize-none`} placeholder="e.g. Player One, Player Two, Player Three..." />
                                <p className="text-[10px] text-white/30 font-medium">Player profiles will be auto-created.</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border border-white/10 text-white/50 hover:text-white rounded-xl font-medium h-11">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium h-11">
                                {team ? 'Save Changes' : 'Create Team'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
