"use client";

export default function PortalNavProgress({ show }: { show: boolean }) {
    if (!show) return null;

    return (
        <div className="h-1 w-full bg-[#010080]/10 overflow-hidden shrink-0" aria-hidden="true">
            <div className="h-full w-1/3 bg-[#f40606] animate-pulse" />
        </div>
    );
}
