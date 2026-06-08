"use client";

import { useCallback, useEffect, useState } from "react";

export function usePortalNavFeedback(
    pathname: string | null,
    onNavigate?: () => void
) {
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setPendingHref(null);
        if (!pathname) return;
        setIsNavigating(true);
        const timer = window.setTimeout(() => setIsNavigating(false), 500);
        return () => window.clearTimeout(timer);
    }, [pathname]);

    const activePath = pendingHref || pathname;

    const handleNavClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            const link = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
            if (!link) return;
            const href = link.getAttribute("href");
            if (!href?.startsWith("/portal")) return;
            setPendingHref(href);
            setIsNavigating(true);
            onNavigate?.();
        },
        [onNavigate]
    );

    const startNavigation = useCallback(() => {
        setIsNavigating(true);
    }, []);

    return { activePath, handleNavClick, isNavigating, startNavigation };
}
