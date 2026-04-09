import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function usePlayers() {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const data = await api.getPlayers();
            setPlayers(data);
        } catch (err) {
            console.error("Fetch players failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    return { players, loading, mutate: fetchPlayers };
}
