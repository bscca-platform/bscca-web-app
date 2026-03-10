import { useEffect, useState } from "react";
import { api, getSSEUrl } from "@/lib/api";
import { LiveMatchData } from "@/lib/types";
import { LIVE_MATCH as fallbackData } from "@/lib/data";

export function useLiveMatch() {
    const [data, setData] = useState<LiveMatchData>(fallbackData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiveMatch = async () => {
            try {
                const liveMatch = await api.getLiveMatch();
                if (liveMatch) {
                    setData(liveMatch);
                }
            } catch (err) {
                console.error("Fetch live match failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMatch();

        // SSE Subscription
        const eventSource = new EventSource(getSSEUrl('/events'));

        eventSource.onmessage = (event) => {
            try {
                const updatedData = JSON.parse(event.data);
                if (updatedData.match_id) {
                    fetchLiveMatch(); // Simple refresh on update
                }
            } catch (e) {
                console.error("Failed to parse SSE data:", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return { data, loading };
}
