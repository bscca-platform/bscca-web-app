import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Tournament } from "@/lib/types";

export function useTournaments() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const data = await api.getTournaments();
            setTournaments(data);
        } catch (err) {
            console.error("Fetch tournaments failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    return { tournaments, loading, mutate: fetchTournaments };
}
