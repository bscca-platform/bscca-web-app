import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function usePlayer(slug: string) {
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!slug) return;

        const fetchPlayer = async () => {
            try {
                const data = await api.getPlayerBySlug(slug);
                if (data) {
                    setPlayer(data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayer();
    }, [slug]);

    return { player, loading, error };
}
