import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useMatches() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await api.getMatches();
                setMatches(data);
            } catch (err) {
                console.error("Fetch matches failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    return { matches, loading };
}
