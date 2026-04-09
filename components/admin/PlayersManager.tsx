"use client";

import { usePlayers } from "@/hooks/usePlayers";
import { api } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { Search, Edit2, Trash2, UserPlus, Zap, X, Upload, Camera, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader } from "@/components/ui/card";
import { useTeams } from "@/hooks/useTeams";

function CustomSelect({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(option => option.value === value) || { value: "", label: placeholder };

    return (
        <div className="relative" ref={selectRef}>
            <div
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium outline-none transition-all cursor-pointer flex items-center justify-between text-white hover:border-white/20"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption.label}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors text-white/80 first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PlayersManager() {
    const { players: livePlayers, loading } = usePlayers();
    const { teams } = useTeams();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "", slug: "", team_id: "", role: "Batsman", specialization: "General",
        dob: "", style_batting: "Right Hand", style_bowling: "Right Arm Fast",
        bio: "", image: "", matches_played: 0, total_runs: 0, strike_rate: "0.00",
        highest_score: 0, fifties: 0, wickets: 0, overs_bowled: "0.0", runs_conceded: 0, economy: "0.00"
    });

    const handleOpenModal = (player: any = null) => {
        if (player) {
            setEditingPlayer(player);
            setFormData({
                name: player.name, slug: player.slug, team_id: player.team_id || "",
                role: player.role || "Batsman", specialization: player.specialization || "General",
                dob: player.dob || "", style_batting: player.style_batting || "Right Hand",
                style_bowling: player.style_bowling || "Right Arm Fast", bio: player.bio || "",
                image: player.image || "", matches_played: player.matches_played || 0,
                total_runs: player.total_runs || 0, strike_rate: player.strike_rate || "0.00",
                highest_score: player.highest_score || 0, fifties: player.fifties || 0,
                wickets: player.wickets || 0, overs_bowled: player.overs_bowled || "0.0",
                runs_conceded: player.runs_conceded || 0, economy: player.economy || "0.00"
            });
        } else {
            setEditingPlayer(null);
            setFormData({
                name: "", slug: "", team_id: "", role: "Batsman", specialization: "General",
                dob: "", style_batting: "Right Hand", style_bowling: "Right Arm Fast",
                bio: "", image: "", matches_played: 0, total_runs: 0, strike_rate: "0.00",
                highest_score: 0, fifties: 0, wickets: 0, overs_bowled: "0.0", runs_conceded: 0, economy: "0.00"
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

    const handleSavePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, slug, team_id, role, specialization, dob, style_batting, style_bowling, bio, image, matches_played, total_runs, strike_rate, highest_score, fifties, wickets, overs_bowled, runs_conceded, economy } = formData;
        if (!name || !slug) return alert("Name and Slug are required.");
        const payload = {
            name, slug, team_id: team_id || null, role, specialization, dob, style_batting, style_bowling, bio, image,
            matches_played: Number(matches_played), total_runs: Number(total_runs), strike_rate: strike_rate.toString(),
            highest_score: Number(highest_score), fifties: Number(fifties), wickets: Number(wickets),
            overs_bowled, runs_conceded: Number(runs_conceded), economy: economy.toString()
        };
        try {
            if (editingPlayer) {
                await api.updatePlayer(editingPlayer.id, payload);
                setIsModalOpen(false);
            } else {
                await api.createPlayer(payload);
                setIsModalOpen(false);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeletePlayer = async (id: string) => {
        if (confirm("Are you sure you want to release this player?")) {
            try {
                await api.deletePlayer(id);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const filteredPlayers = livePlayers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <PlayerDraftModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} player={editingPlayer} teams={teams}
                formData={formData} setFormData={setFormData} onSave={handleSavePlayer} onUpload={handleImageUpload} uploading={uploading} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Search players..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-10 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white" />
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-5 h-10 text-sm">
                    <UserPlus className="w-4 h-4 mr-1.5" /> Draft Player
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <Card className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[11px] font-medium uppercase tracking-wide text-white/40 border-b border-white/5">
                                    <th className="py-4 px-5">Player</th>
                                    <th className="py-4 px-5">Team</th>
                                    <th className="py-4 px-5 text-center">Role</th>
                                    <th className="py-4 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center text-xs font-semibold text-white/60">
                                                    {player.image ? <img src={player.image} alt={player.name} className="w-full h-full object-cover" /> : player.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{player.name}</p>
                                                    <p className="text-[10px] text-white/30 font-medium">{player.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-white/5 flex items-center justify-center text-[10px] font-medium text-white/40 rounded-md border border-white/5">
                                                    {player.teams?.initials || "?"}
                                                </div>
                                                <span className="text-xs font-medium text-white/50">{player.teams?.name || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <Badge className="bg-white/5 text-white/60 border-none text-[10px] font-medium px-2.5 py-0.5 rounded-md">
                                                {player.specialization || "General"}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex justify-end gap-1.5">
                                                <button onClick={() => handleOpenModal(player)} className="p-2 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent transition-all text-white/40">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeletePlayer(player.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-white/40">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center gap-4">
                <Zap className="w-5 h-5 text-accent/50" />
                <div>
                    <h4 className="text-sm font-semibold text-white">Stats Sync Active</h4>
                    <p className="text-[11px] text-white/40 font-medium">Player stats synchronized with season logs every 6 hours.</p>
                </div>
            </div>
        </div>
    );
}

function PlayerDraftModal({ isOpen, onClose, player, teams, formData, setFormData, onSave, onUpload, uploading }: any) {
    if (!isOpen) return null;

    const years = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => (1990 + i).toString());
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

    const currentDob = formData.dob || "";
    const parts = currentDob.split(" ");
    let initialDay = "1", initialMonth = "JAN", initialYear = "1990";
    if (parts.length === 3) { initialDay = parts[0].replace(/[^0-9]/g, ''); initialMonth = parts[1].toUpperCase(); initialYear = parts[2]; }

    const handleDobChange = (field: 'day' | 'month' | 'year', value: string) => {
        let d = initialDay, m = initialMonth, y = initialYear;
        if (field === 'day') d = value; if (field === 'month') m = value; if (field === 'year') y = value;
        setFormData({ ...formData, dob: `${d} ${m} ${y}` });
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const labelClass = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl overflow-y-auto max-h-[95vh]">
                <CardHeader className="border-b border-white/5 p-6 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-white">{player ? 'Edit Player' : 'Draft Player'}</h3>
                        <p className="text-xs text-white/40 font-medium mt-1">Player management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/40">
                        <X className="w-5 h-5" />
                    </button>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={onSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wide">Identity</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className={labelClass}>Full Name</label>
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. Rohit Sharma" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelClass}>Slug</label>
                                        <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={inputClass} placeholder="e.g. rohit-sharma" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelClass}>Team</label>
                                        <CustomSelect value={formData.team_id} onChange={(value) => setFormData({ ...formData, team_id: value })}
                                            options={[{ value: "", label: "Free Agent" }, ...teams.map((team: any) => ({ value: team.id, label: team.name }))]} placeholder="Select a team" />
                                    </div>

                                    {/* Avatar Upload */}
                                    <div className="space-y-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                        <label className={labelClass}>Player Photo</label>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative border border-white/10 shrink-0">
                                                {formData.image ? <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-white/30" />}
                                                {uploading && <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center"><div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className={inputClass} placeholder="Image URL..." />
                                                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white/70 text-xs font-medium cursor-pointer hover:bg-white/10 transition-all rounded-xl border border-white/10">
                                                    <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload'}
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, 'players')} disabled={uploading} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="text-xs font-medium text-white/40 uppercase tracking-wide">Technical</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Role</label>
                                            <CustomSelect value={formData.role} onChange={(value) => setFormData({ ...formData, role: value })}
                                                options={[{ value: "Batsman", label: "Batsman" }, { value: "Bowler", label: "Bowler" }, { value: "All-Rounder", label: "All-Rounder" }, { value: "WK-Batsman", label: "WK-Batsman" }, { value: "WK-Bowler", label: "WK-Bowler" }]} placeholder="Select role" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Specialization</label>
                                            <CustomSelect value={formData.specialization} onChange={(value) => setFormData({ ...formData, specialization: value })}
                                                options={[{ value: "General", label: "General" }, { value: "Opening Batsman", label: "Opening Batsman" }, { value: "Anchor Batsman", label: "Anchor Batsman" }, { value: "Finisher Batsman", label: "Finisher Batsman" }, { value: "Right Arm Fast", label: "Right Arm Fast" }, { value: "Right Arm Medium", label: "Right Arm Medium" }, { value: "Right Arm Spin", label: "Right Arm Spin" }, { value: "Off Spin", label: "Off Spin" }, { value: "Leg Spin", label: "Leg Spin" }, { value: "Left Arm Fast", label: "Left Arm Fast" }, { value: "Left Arm Medium", label: "Left Arm Medium" }, { value: "Left Arm Spin", label: "Left Arm Spin" }]} placeholder="Select specialization" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Batting Style</label>
                                            <CustomSelect value={formData.style_batting} onChange={(value) => setFormData({ ...formData, style_batting: value })}
                                                options={[{ value: "Right Hand", label: "Right Hand" }, { value: "Left Hand", label: "Left Hand" }]} placeholder="Select" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Bowling Style</label>
                                            <CustomSelect value={formData.style_bowling} onChange={(value) => setFormData({ ...formData, style_bowling: value })}
                                                options={[{ value: "Right Arm Fast", label: "Right Arm Fast" }, { value: "Right Arm Medium", label: "Right Arm Medium" }, { value: "Right Arm Spin", label: "Right Arm Spin" }, { value: "Left Arm Fast", label: "Left Arm Fast" }, { value: "Left Arm Medium", label: "Left Arm Medium" }, { value: "Left Arm Spin", label: "Left Arm Spin" }, { value: "General", label: "General" }]} placeholder="Select" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelClass}>Date of Birth</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <CustomSelect value={initialDay} onChange={(value) => handleDobChange('day', value)} options={days.map(d => ({ value: d, label: d }))} placeholder="DD" />
                                            <CustomSelect value={initialMonth} onChange={(value) => handleDobChange('month', value)} options={months.map(m => ({ value: m, label: m }))} placeholder="MMM" />
                                            <CustomSelect value={initialYear} onChange={(value) => handleDobChange('year', value)} options={years.map(y => ({ value: y, label: y }))} placeholder="YYYY" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-white/5">
                            <label className={labelClass}>Bio</label>
                            <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className={`${inputClass} min-h-[80px] resize-none`} placeholder="Player bio..." />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5">
                            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border border-white/10 text-white/50 hover:text-white rounded-xl font-medium h-11">Cancel</Button>
                            <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium h-11">{player ? 'Save Changes' : 'Draft Player'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
