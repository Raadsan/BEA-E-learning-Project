"use client";

import { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetReviewWindowQuery,
    useUpdateReviewWindowMutation,
} from "@/lib/api/reviewApi";
import { useToast } from "@/components/Toast";

type ReviewType = "teacher" | "student";

const REVIEW_LABELS: Record<ReviewType, { title: string; description: string }> = {
    teacher: {
        title: "Teacher Review Period",
        description: "Controls when students can submit evaluations for their teachers.",
    },
    student: {
        title: "Student Review Period",
        description: "Controls when teachers can submit evaluations for their students.",
    },
};

const REASON_MESSAGES: Record<string, string> = {
    admin_inactive: "Inactive — submissions are closed until you set status to Active.",
    before_start: "Scheduled — review opens at the start date.",
    after_end: "Closed — the end date has passed.",
    open: "Open — students/teachers can submit reviews now.",
    not_configured: "Not configured.",
};

function toDateTimeLocalValue(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (!isValid(date)) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusBadgeClass(effectiveStatus: string, isDark: boolean) {
    if (effectiveStatus === "active") {
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    }
    if (effectiveStatus === "upcoming") {
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    }
    if (effectiveStatus === "closed") {
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    }
    return isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700";
}

export default function ReviewPeriodControl({
    reviewType,
    canEdit = true,
}: {
    reviewType: ReviewType;
    canEdit?: boolean;
}) {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data, isLoading, refetch } = useGetReviewWindowQuery(reviewType);
    const [updateWindow, { isLoading: isSaving }] = useUpdateReviewWindowMutation();

    const [status, setStatus] = useState<"active" | "inactive">("inactive");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!data) return;
        setStatus(data.status === "active" ? "active" : "inactive");
        setStartDate(toDateTimeLocalValue(data.start_date));
        setEndDate(toDateTimeLocalValue(data.end_date));
    }, [data]);

    const labels = REVIEW_LABELS[reviewType];
    const effectiveStatus = data?.effective_status || "inactive";
    const isOpen = data?.is_open === true;

    const handleSave = async () => {
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            showToast("End date must be after start date.", "error");
            return;
        }

        try {
            await updateWindow({
                type: reviewType,
                status,
                start_date: startDate ? new Date(startDate).toISOString() : null,
                end_date: endDate ? new Date(endDate).toISOString() : null,
            }).unwrap();
            showToast("Review period updated.", "success");
            refetch();
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to update review period.", "error");
        }
    };

    return (
        <div
            className={`mb-6 rounded-xl border p-5 ${
                isDark ? "bg-gray-800/60 border-gray-700" : "bg-white border-gray-200 shadow-sm"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{labels.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{labels.description}</p>
                </div>
                {!isLoading && (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass(
                            effectiveStatus,
                            isDark
                        )}`}
                    >
                        {isOpen ? "Open" : effectiveStatus === "upcoming" ? "Upcoming" : effectiveStatus === "closed" ? "Closed" : "Inactive"}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className={`h-24 rounded-lg animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
            ) : (
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {REASON_MESSAGES[data?.reason || "not_configured"]}
                        {data?.start_date && (
                            <span className="block mt-1 text-xs text-gray-500">
                                Start: {format(new Date(data.start_date), "PPp")}
                                {data.end_date ? ` · End: ${format(new Date(data.end_date), "PPp")}` : ""}
                            </span>
                        )}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                                disabled={!canEdit}
                                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                                    isDark
                                        ? "bg-gray-900 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-800"
                                }`}
                            >
                                <option value="inactive">Inactive</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Start date & time</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={!canEdit}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                    isDark
                                        ? "bg-gray-900 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-800"
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">End date & time</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={!canEdit}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                    isDark
                                        ? "bg-gray-900 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-800"
                                }`}
                            />
                        </div>
                    </div>

                    {canEdit && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2 rounded-lg bg-[#010080] text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save period"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
