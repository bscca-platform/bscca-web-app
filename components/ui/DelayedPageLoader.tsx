"use client";

import { useEffect, useState } from "react";
import CricketBallLoader from "./CricketBallLoader";

interface DelayedPageLoaderProps {
    children: React.ReactNode;
    isLoading?: boolean;
    minDelay?: number;
}

export default function DelayedPageLoader({
    children,
    isLoading = false,
    minDelay = 2000
}: DelayedPageLoaderProps) {
    const [showContent, setShowContent] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimerFinished(true);
        }, minDelay);

        return () => clearTimeout(timer);
    }, [minDelay]);

    // Safety: force show content after max 5 seconds regardless of loading state
    useEffect(() => {
        const maxTimer = setTimeout(() => {
            setShowContent(true);
        }, 5000);
        return () => clearTimeout(maxTimer);
    }, []);

    useEffect(() => {
        if (!isLoading && timerFinished) {
            setShowContent(true);
        }
    }, [isLoading, timerFinished]);

    if (!showContent) {
        return <CricketBallLoader fullPage />;
    }

    return <>{children}</>;
}
