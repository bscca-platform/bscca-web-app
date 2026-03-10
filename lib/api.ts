const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    getTeams: () => apiFetch<any[]>('/teams'),
    getPlayers: () => apiFetch<any[]>('/players'),
    getMatches: () => apiFetch<any[]>('/matches'),
    getLiveMatch: () => apiFetch<any>('/matches/live'),
    getTournaments: () => apiFetch<any[]>('/tournaments'),
    createTournament: (data: any) => apiFetch<any>('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
    updateTournament: (id: string, data: any) => apiFetch<any>(`/tournaments/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    deleteTournament: (id: string) => apiFetch<any>(`/tournaments/${id}`, { method: 'DELETE' }),
    syncTournamentTeams: (id: string, teamIds: string[]) => apiFetch<any>(`/tournaments/${id}/teams`, { method: 'POST', body: JSON.stringify({ team_ids: teamIds }) }),
    getTeamBySlug: (slug: string) => apiFetch<any>(`/teams/slug/${slug}`),
    getPlayerBySlug: (slug: string) => apiFetch<any>(`/players/slug/${slug}`),
    getScorecardBatting: (matchId: string) => apiFetch<any[]>(`/scorecards/batting/${matchId}`),
    getScorecardBowling: (matchId: string) => apiFetch<any[]>(`/scorecards/bowling/${matchId}`),
    upsertBattingScorecard: (data: any) => apiFetch<any>('/scorecards/batting/upsert', { method: 'POST', body: JSON.stringify(data) }),
    upsertBowlingScorecard: (data: any) => apiFetch<any>('/scorecards/bowling/upsert', { method: 'POST', body: JSON.stringify(data) }),
    getTeamPlayers: (teamId: string) => apiFetch<any[]>(`/teams/${teamId}/players`),
    getTeamMatches: (teamId: string) => apiFetch<any[]>(`/teams/${teamId}/matches`),
    getTeamScorecardBatting: (teamId: string) => apiFetch<any[]>(`/teams/${teamId}/scorecards/batting`),
    getTeamScorecardBowling: (teamId: string) => apiFetch<any[]>(`/teams/${teamId}/scorecards/bowling`),
    createMatch: (data: any) => apiFetch<any>('/matches', { method: 'POST', body: JSON.stringify(data) }),
    updateMatch: (id: string, data: any) => apiFetch<any>(`/matches/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    upsertLiveDetails: (data: any) => apiFetch<any>('/live_match_details', { method: 'POST', body: JSON.stringify(data) }),
    initializeMatch: (data: any) => apiFetch<any>('/matches/initialize', { method: 'POST', body: JSON.stringify(data) }),
    finishMatch: (data: any) => apiFetch<any>('/matches/finish', { method: 'POST', body: JSON.stringify(data) }),
    createTeam: (data: any) => apiFetch<any>('/teams', { method: 'POST', body: JSON.stringify(data) }),
    updateTeam: (id: string, data: any) => apiFetch<any>(`/teams/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    deleteTeam: (id: string) => apiFetch<any>(`/teams/${id}`, { method: 'DELETE' }),
    createPlayer: (data: any) => apiFetch<any>('/players', { method: 'POST', body: JSON.stringify(data) }),
    updatePlayer: (id: string, data: any) => apiFetch<any>(`/players/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    deletePlayer: (id: string) => apiFetch<any>(`/players/${id}`, { method: 'DELETE' }),
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch<{ url: string }>('/upload', {
            method: 'POST',
            body: formData,
            headers: {}, // Let the browser set Content-Type with boundary
        });
    },
    // SSE will be handled in a custom hook
};

export const getSSEUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
