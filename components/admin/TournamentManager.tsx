"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Plus, Calendar, Users, X, CheckCircle2, Clock, Save, AlertTriangle, RotateCcw } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useTournaments } from "@/hooks/useTournaments";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TournamentManager() {
    const { teams, loading: teamsLoading, mutate: mutateTeams } = useTeams();
    const { tournaments, loading: tournamentsLoading, mutate: mutateTournaments } = useTournaments();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTournament, setEditingTournament] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", start_date: "", end_date: "", description: "" });
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Standings editor state
    const [standings, setStandings] = useState<any[]>([]);
    const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

    const activeTournament = tournaments.find(t => t.status === 'active');

    useEffect(() => {
        if (activeTournament && activeTournament.teams) {
            const sorted = ([...activeTournament.teams] as any[]).sort((a, b) => {
                const ptDiff = ((b.won || 0) * 2) - ((a.won || 0) * 2);
                if (ptDiff !== 0) return ptDiff;
                return parseFloat(b.nrr || "0") - parseFloat(a.nrr || "0");
            });
            setStandings(sorted);
            setActiveTournamentId(activeTournament.id || null);
        }
    }, [activeTournament]);

    const openCreateModal = (tournament: any = null) => {
        if (tournament) {
            setEditingTournament(tournament);
            setFormData({
                name: tournament.name,
                start_date: tournament.start_date || "",
                end_date: tournament.end_date || "",
                description: tournament.description || "",
            });
            setSelectedTeams(tournament.teams?.map((t: any) => t.id) || []);
        } else {
            setEditingTournament(null);
            setFormData({ name: "", start_date: "", end_date: "", description: "" });
            setSelectedTeams([]);
        }
        setShowCreateModal(true);
    };

    const toggleTeam = (teamId: string) => {
        setSelectedTeams(prev =>
            prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || selectedTeams.length < 2) {
            alert("Tournament name and at least 2 teams required.");
            return;
        }
        setSaving(true);
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        const payload = {
            name: formData.name,
            slug,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            description: formData.description || null,
            status: editingTournament ? editingTournament.status : 'scheduled',
        };

        try {
            let tId = editingTournament?.id;
            if (editingTournament) {
                await api.updateTournament(editingTournament.id, payload);
            } else {
                const res = await api.createTournament(payload);
                tId = res.id;
            }
            
            // Sync teams
            await api.syncTournamentTeams(tId, selectedTeams);
            
            mutateTournaments();
            setShowCreateModal(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (!confirm(`Change tournament status to "${newStatus}"?`)) return;
        try {
            const t = tournaments.find(x => x.id === id);
            await api.updateTournament(id, { ...t, status: newStatus });
            mutateTournaments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteTournament = async (id: string) => {
        if (!confirm("Delete this tournament? This action cannot be undone.")) return;
        try {
            await api.deleteTournament(id);
            mutateTournaments();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleUpdateStanding = (id: string, field: string, value: any) => {
        setStandings(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleCommitStandings = async () => {
        if (!confirm("Commit standings changes?")) return;
        try {
            for (const team of standings) {
                await api.updateTeam(team.id, {
                    ...team,
                    played: team.played, 
                    won: team.won, 
                    lost: team.lost, 
                    nrr: team.nrr
                });
            }
            mutateTeams();
            alert("Standings updated!");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const ic = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-accent/50 outline-none transition-all placeholder:text-white/20 text-white";
    const lc = "text-[11px] font-medium uppercase tracking-wide text-white/50 ml-0.5";
    const sic = "w-14 bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-center text-sm font-semibold outline-none focus:border-accent/50 transition-all text-white";

    const loading = teamsLoading || tournamentsLoading;

    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
        scheduled: { color: "bg-amber-500/10 text-amber-400", icon: Clock, label: "Scheduled" },
        active: { color: "bg-emerald-500/10 text-emerald-400", icon: Zap, label: "Active" },
        completed: { color: "bg-white/5 text-white/40", icon: CheckCircle2, label: "Completed" },
    };

    return (
        <div className="space-y-8">
            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b border-white/5 p-6 flex flex-row justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold">{editingTournament ? 'Edit' : 'Create'} Tournament</h3>
                                <p className="text-xs text-white/40 mt-1">Configure tournament details and teams</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/40">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className={lc}>Tournament Name</label>
                                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={ic} placeholder="BSCCA Season 01" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={lc}>Start Date</label>
                                        <input type="date" value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} className={ic} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={lc}>End Date</label>
                                        <input type="date" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} className={ic} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={lc}>Description (Optional)</label>
                                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={`${ic} h-20 resize-none`} placeholder="Brief description..." />
                                </div>

                                {/* Team Selection */}
                                <div className="space-y-3">
                                    <label className={lc}>Select Teams ({selectedTeams.length} selected)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {teams.map(team => (
                                            <button
                                                type="button"
                                                key={team.id}
                                                onClick={() => toggleTeam(team.id!)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                                                    selectedTeams.includes(team.id!)
                                                        ? "border-accent bg-accent/10 text-accent"
                                                        : "border-white/10 text-white/50 hover:border-white/20"
                                                )}
                                            >
                                                <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                                                    {team.image ? <img src={team.image} alt="" className="w-full h-full object-cover" /> : team.initials}
                                                </div>
                                                <span className="truncate text-xs">{team.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <Button type="button" onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1 border border-white/10 text-white/50 rounded-xl h-11">Cancel</Button>
                                    <Button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-xl h-11">
                                        {saving ? "Saving..." : editingTournament ? "Update" : "Create Tournament"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header + Create Button */}
            <div className="flex justify-between items-center">
                <div />
                <Button onClick={() => openCreateModal()} className="bg-accent hover:bg-accent/90 text-white rounded-xl px-5 h-10 text-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> New Tournament
                </Button>
            </div>

            {/* Tournament Cards */}
            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
            ) : tournaments.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center">
                    <Trophy className="w-12 h-12 text-white/10" />
                    <div>
                        <p className="text-sm font-medium text-white/40">No tournaments yet</p>
                        <p className="text-xs text-white/20 mt-1">Create your first tournament to get started</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(t => {
                        const sc = statusConfig[t.status] || statusConfig.scheduled;
                        return (
                            <Card key={t.id} className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                                                <Trophy className="w-7 h-7 text-accent" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-xl font-bold text-white">{t.name}</h3>
                                                    <Badge className={cn("border-none text-[10px] rounded-full px-2.5 flex items-center gap-1", sc.color)}>
                                                        <sc.icon className="w-3 h-3" /> {sc.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
                                                    {t.start_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {t.start_date}
                                                            {t.end_date && ` — ${t.end_date}`}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {t.teams?.length || 0} Teams
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {t.status === 'scheduled' && (
                                                <Button onClick={() => handleStatusChange(t.id!, 'active')} className="h-8 px-4 bg-emerald-500/10 text-emerald-400 text-[11px] rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                                                    <Zap className="w-3 h-3 mr-1" /> Start
                                                </Button>
                                            )}
                                            {t.status === 'active' && (
                                                <Button onClick={() => handleStatusChange(t.id!, 'completed')} className="h-8 px-4 bg-white/5 text-white/50 text-[11px] rounded-lg hover:bg-white/10 transition-all">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> End
                                                </Button>
                                            )}
                                            <Button onClick={() => openCreateModal(t)} variant="outline" className="h-8 px-4 border border-white/10 text-white/50 text-[11px] rounded-lg">Edit</Button>
                                            <Button onClick={() => handleDeleteTournament(t.id!)} variant="outline" className="h-8 px-4 border border-red-500/20 text-red-400 text-[11px] rounded-lg hover:bg-red-500/10">Delete</Button>
                                        </div>
                                    </div>

                                    {/* Teams mini-grid */}
                                    {t.teams && t.teams.length > 0 && (
                                        <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                            {t.teams.map((team: any) => (
                                                <div key={team.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                                                    <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white/60 overflow-hidden">
                                                        {team.image ? <img src={team.image} alt="" className="w-full h-full object-cover" /> : team.initials}
                                                    </div>
                                                    <span className="text-[11px] font-medium text-white/60">{team.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Active Tournament Standings Editor */}
            {activeTournament && standings.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-accent" /> Standings — {activeTournament.name}
                        </h3>
                        <Button onClick={handleCommitStandings} className="bg-accent hover:bg-accent/90 text-white rounded-xl px-5 h-10 text-sm">
                            <Save className="w-4 h-4 mr-1.5" /> Save
                        </Button>
                    </div>

                    <Card className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-white/5 text-[11px] font-medium uppercase tracking-wide text-white/40 border-b border-white/5">
                                        <th className="py-4 px-5 w-16">#</th>
                                        <th className="py-4 px-5">Team</th>
                                        <th className="py-4 px-4 text-center">GP</th>
                                        <th className="py-4 px-4 text-center">W</th>
                                        <th className="py-4 px-4 text-center">L</th>
                                        <th className="py-4 px-4 text-center">NRR</th>
                                        <th className="py-4 px-5 text-center">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {standings.map((team, i) => (
                                        <tr key={team.id || i} className="hover:bg-white/[0.03] transition-all">
                                            <td className="py-5 px-5 text-lg font-bold text-white/15">{String(i + 1).padStart(2, '0')}</td>
                                            <td className="py-5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center font-semibold text-sm text-white/40 border border-white/5 overflow-hidden">
                                                        {team.image ? <img src={team.image} alt="" className="w-full h-full object-cover" /> : team.initials || team.name[0]}
                                                    </div>
                                                    <span className="font-semibold text-white">{team.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center"><input type="number" value={team.played || 0} onChange={e => handleUpdateStanding(team.id, 'played', parseInt(e.target.value))} className={sic} /></td>
                                            <td className="py-5 px-4 text-center"><input type="number" value={team.won || 0} onChange={e => handleUpdateStanding(team.id, 'won', parseInt(e.target.value))} className={cn(sic, "text-emerald-400")} /></td>
                                            <td className="py-5 px-4 text-center"><input type="number" value={team.lost || 0} onChange={e => handleUpdateStanding(team.id, 'lost', parseInt(e.target.value))} className={cn(sic, "text-red-400")} /></td>
                                            <td className="py-5 px-4 text-center"><input type="text" value={team.nrr || "0.000"} onChange={e => handleUpdateStanding(team.id, 'nrr', e.target.value)} className={cn(sic, "w-20")} /></td>
                                            <td className="py-5 px-5 text-center"><Badge className="bg-accent/10 text-accent border-none text-lg font-bold px-4 py-1 rounded-lg">{(team.won || 0) * 2}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.03] flex items-start gap-4">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-red-400">Override Warning</h4>
                            <p className="text-xs text-white/40 mt-1">Manual edits override automated rankings. Changes are logged.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
