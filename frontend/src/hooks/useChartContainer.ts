"use client";

import { useEffect, useRef, useState } from "react";

export function useChartContainer() {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            setSize({ width, height, });
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, width: size.width, height: size.height };
}

export function getDynamicBarSize(
    containerWidth: number,
    itemCount: number,
    barsPerGroup = 2
) {
    if (!containerWidth || !itemCount) return 28;
    const slotWidth = containerWidth / itemCount;
    const size = Math.floor(slotWidth * 0.28 / barsPerGroup);
    return Math.min(40, Math.max(14, size));
}

export function getDynamicPieRadius(containerWidth: number, containerHeight: number) {
    const min = Math.min(containerWidth, containerHeight);
    if (!min) return 90;
    return Math.min(130, Math.max(55, Math.floor(min * 0.32)));
}

export function getDynamicCategoryGap(itemCount: number) {
    if (itemCount <= 2) return "8%";
    if (itemCount <= 4) return "12%";
    return "18%";
}

export function getAssignmentBarSize(containerWidth: number, itemCount: number) {
    if (!containerWidth || !itemCount) return 36;
    const slotWidth = containerWidth / itemCount;
    const size = Math.floor(slotWidth * 0.42);
    return Math.min(52, Math.max(24, size));
}

export function getAssignmentCategoryGap(itemCount: number) {
    if (itemCount <= 2) return "6%";
    if (itemCount <= 4) return "10%";
    return "14%";
}
