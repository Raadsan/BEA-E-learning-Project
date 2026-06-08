"use client";

import React from "react";

export const CHART_CARD_CLASS =
    "bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 min-w-0 w-full h-full flex flex-col overflow-hidden";

export const CHART_FOOTER_CLASS = "mt-3 shrink-0";

export const CHART_TITLE_CLASS =
    "text-lg font-bold text-[#010080] dark:text-blue-400 whitespace-nowrap shrink-0";

export const CHART_FILTERS_CLASS = "flex flex-wrap gap-2 w-full";

export const CHART_FILTER_SELECT_CLASS =
    "min-w-0 w-full sm:w-auto sm:min-w-[150px] sm:max-w-[220px] px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate";

export const CHART_AREA_CLASS = "w-full flex-1 min-h-[300px]";

type ChartFilterSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function ChartFilterSelect({ className = "", ...props }: ChartFilterSelectProps) {
    return (
        <select
            {...props}
            className={`${CHART_FILTER_SELECT_CLASS} ${className}`.trim()}
        />
    );
}

type ChartHeaderProps = {
    title: React.ReactNode;
    icon?: React.ReactNode;
    filters?: React.ReactNode;
};

export function ChartHeader({ title, icon, filters }: ChartHeaderProps) {
    return (
        <div className="flex flex-col gap-3 mb-4 min-w-0">
            <h3 className={`${CHART_TITLE_CLASS} flex items-center gap-2`}>
                {icon}
                {title}
            </h3>
            {filters ? <div className={CHART_FILTERS_CLASS}>{filters}</div> : null}
        </div>
    );
}

type ChartCanvasProps = {
    children: React.ReactNode;
    className?: string;
    chartRef?: React.Ref<HTMLDivElement>;
};

export function ChartCanvas({ children, className = "", chartRef }: ChartCanvasProps) {
    return (
        <div ref={chartRef} className={`${CHART_AREA_CLASS} ${className}`.trim()}>
            {children}
        </div>
    );
}

export function ChartLoading() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#010080]" />
        </div>
    );
}

export function ChartEmpty({ message = "No data available" }: { message?: string }) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm sm:text-base">{message}</p>
        </div>
    );
}

export function ChartError({ message = "Failed to load data" }: { message?: string }) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-red-500 text-sm sm:text-base">{message}</p>
        </div>
    );
}
