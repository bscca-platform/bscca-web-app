import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { TEAMS as fallbackData } from "@/lib/data";

export function useTeams() {
    const [teams, setTeams] = useState<Team[]>(fallbackData);
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const data = await api.getTeams();
            setTeams(data);
        } catch (err) {
            console.error("Fetch teams failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    return { teams, loading, mutate: fetchTeams };
}
