import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useMatch(slug: string) {
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const fetchMatch = async () => {
            try {
                setLoading(true);
                const data = await api.getMatchBySlug(slug);
                setMatch(data);
                setError(null);
            } catch (err: any) {
                console.error('Fetch match failed:', err);
                setError(err.message);
                setMatch(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [slug]);

    return { match, loading, error };
}
