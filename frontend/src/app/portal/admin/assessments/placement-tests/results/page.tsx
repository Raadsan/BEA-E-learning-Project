"use client";
 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
 
import DataTable from "@/components/DataTable";
import { useGetAllPlacementResultsQuery, useUnlockPlacementAttemptMutation, useDeletePlacementResultMutation } from "@/lib/api/placementTestApi";
import { useExtendStudentDeadlineMutation } from "@/lib/api/studentApi";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";
 
const LiveAdminTimer = ({ expiryDate, label, colorClass, onClick }) => {
    const [timeLeft, setTimeLeft] = useState("");
 
    useEffect(() => {
        if (!expiryDate) return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const exp = new Date(expiryDate).getTime();
            const diff = exp - now;
 
            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
            } else {
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiryDate]);
 
    const showCountdown = label === "Active";
 
    return (
        <span
            onClick={onClick}
            className={`px-2 py-1 rounded text-xs font-bold border ${onClick ? 'cursor-pointer hover:opacity-80 transition-all' : 'cursor-default'} ${colorClass}`}
        >
            {label} {showCountdown && timeLeft && timeLeft !== "Expired" && `(${timeLeft})`}
        </span>
    );
};

// ─── Reusable Confirm Delete Modal ───────────────────────────────────────────
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, studentName, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Result</h3>
                        <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete the placement result record for{" "}
                    <span className="font-bold text-gray-900 dark:text-white">{studentName}</span>?
                </p>
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Reusable Confirm Retake Modal ────────────────────────────────────────────
function ConfirmRetakeModal({ isOpen, onClose, onConfirm, studentName, isLoading }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Allow Retake</h3>
                        <p className="text-xs text-gray-500 mt-0.5">The student will be able to retake the test.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Allow <span className="font-bold text-gray-900 dark:text-white">{studentName}</span> to retake this placement test?
                </p>
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : "Allow Retake"}
                    </button>
                </div>
            </div>
        </div>
    );
}
 
export default function PlacementResultsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { canView } = usePagePermissions("assessments", "placement_results");
    
    // States for access time extension
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
    const [studentToExtend, setStudentToExtend] = useState<any>(null);
    const [extraTime, setExtraTime] = useState("");
    const [timeUnit, setTimeUnit] = useState("minutes");

    // States for delete modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<any>(null);

    // States for retake modal
    const [retakeModalOpen, setRetakeModalOpen] = useState(false);
    const [rowToRetake, setRowToRetake] = useState<any>(null);
 
    const { data: results, isLoading, error, refetch } = useGetAllPlacementResultsQuery();
    const [extendStudentDeadline] = useExtendStudentDeadlineMutation();
    const [unlockPlacementAttempt, { isLoading: isUnlocking }] = useUnlockPlacementAttemptMutation();
    const [deletePlacementResult, { isLoading: isDeletingResult }] = useDeletePlacementResultMutation();

    // Determine the delete key for a given row
    const getDeleteKey = (row: any): string | null => {
        if (row.has_submitted && typeof row.id === 'number') {
            // Submitted result — delete by result ID
            return String(row.id);
        }
        if (row.attempt_id && (row.status === 'started_not_submitted' || row.is_locked)) {
            // Exited / time-end attempt — delete by attempt lock ID
            return `attempt-${row.attempt_id}`;
        }
        if (row.status === 'not_taken' && row.student_id) {
            // Not Taken virtual row — dismiss by student_id
            return `student-${row.student_id}`;
        }
        return null;
    };

    const handleDeleteClick = (row: any) => {
        setRowToDelete(row);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const key = getDeleteKey(rowToDelete);
        if (!key) {
            showToast("No deletable record found for this row", "error");
            return;
        }
        try {
            await deletePlacementResult(key).unwrap();
            showToast("Record deleted successfully", "success");
            setDeleteModalOpen(false);
            setRowToDelete(null);
            refetch();
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to delete record", "error");
        }
    };

    const handleRetakeClick = (row: any) => {
        setRowToRetake(row);
        setRetakeModalOpen(true);
    };

    const handleRetakeConfirm = async () => {
        try {
            await unlockPlacementAttempt(rowToRetake.attempt_id).unwrap();
            showToast("Student can now retake the placement test", "success");
            setRetakeModalOpen(false);
            setRowToRetake(null);
            refetch();
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to allow retake", "error");
        }
    };

    const columns = [
        {
            key: "student_name",
            label: "Student Name",
        },
        {
            key: "submitted_at",
            label: "Test Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-gray-400">-</span>,
        },
        {
            key: "percentage",
            label: "Score",
            render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {val === null || val === undefined ? "-" : `${Math.round(val)}%`}
                    </span>
                    {row.status === 'pending_review' && (
                        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-tight">Partial</span>
                    )}
                </div>
            ),
        },
        {
            key: "recommended_level",
            label: "Level",
            render: (val) => {
                const level = val;

                if (!level) return <span className="text-xs text-gray-400 font-medium italic">-</span>;

                const levelColors = {
                    "Advanced": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                    "Intermediate": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                    "Beginner": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                };
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${levelColors[level] || "bg-gray-100 text-gray-800"}`}>
                        {level}
                    </span>
                );
            },
        },
        {
            key: "recommended_course",
            label: "Recommended Course",
            render: (_, row) => {
                const level = row.recommended_level;
                if (!level) return <span className="text-gray-400">-</span>;
                return `${level} English`;
            }
        },
        {
            key: "time_status",
            label: "Life Status",
            width: "160px",
            render: (_, row) => {
                const isDroppedOut = row.approval_status === 'inactive';
                const isExpired = row.expiry_date ? new Date(row.expiry_date) < new Date() : false;
                const hasSubmitted = row.has_submitted === true;
                const exitedTest = row.status === 'started_not_submitted';
                const isActive = !hasSubmitted && !isExpired && !isDroppedOut;

                let label = "Active";
                let colorClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";

                if (isDroppedOut) {
                    label = "Dropped Out";
                    colorClass = "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
                } else if (exitedTest) {
                    label = "Exited Test";
                    colorClass = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
                } else if (hasSubmitted) {
                    label = row.status === 'completed' ? "Completed" : "Submitted";
                    colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
                } else if (isExpired) {
                    label = "Time End";
                    colorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
                } else if (isActive) {
                    label = "Active";
                    colorClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
                } else {
                    label = "Pending";
                    colorClass = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
                }

                if (isDroppedOut) {
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span
                                className={`px-2 py-1 rounded text-xs font-bold border cursor-default ${colorClass}`}
                            >
                                {label}
                            </span>
                            {row.expiry_date && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 pl-0.5">
                                    {new Date(row.expiry_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    );
                }

                return (
                    <LiveAdminTimer
                        expiryDate={row.expiry_date}
                        label={label}
                        colorClass={colorClass}
                        onClick={isExpired && !hasSubmitted && !isDroppedOut ? () => {
                            setStudentToExtend(row);
                            setExtraTime("");
                            setTimeUnit("minutes");
                            setIsExtensionModalOpen(true);
                        } : undefined}
                    />
                );
            }
        },
        {
            key: "status",
            label: "Status",
            render: (val) => {
                const isPending = val === 'pending_review';
                const isNotTaken = val === 'not_taken';
                const exitedTest = val === 'started_not_submitted';
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exitedTest ? 'bg-orange-100 text-orange-800' : isNotTaken ? 'bg-gray-100 text-gray-600' : isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {exitedTest ? 'Not Submitted' : isNotTaken ? 'Not Taken' : isPending ? 'Pending Review' : (val || 'Completed')}
                    </span>
                )
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => {
                const deleteKey = getDeleteKey(row);
                return (
                    <div className="flex items-center gap-2">
                        {/* Allow Retake — only for exited/locked attempts */}
                        {row.is_locked && row.attempt_id && (
                            <button
                                disabled={isUnlocking}
                                onClick={() => handleRetakeClick(row)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 transition-colors"
                                title="Allow Retake"
                            >
                                Allow Retake
                            </button>
                        )}
                        {/* View Details — only for submitted rows */}
                        {canView && row.has_submitted && (
                            <button
                                onClick={() => router.push(`/portal/admin/assessments/placement-tests/results/${row.id}`)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="View Details"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        )}
                        {/* Delete — for submitted results + exited attempts (not pure "not-taken" virtual rows) */}
                        {deleteKey && (
                            <button
                                disabled={isDeletingResult}
                                onClick={() => handleDeleteClick(row)}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                                title="Delete Record"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];
 
    return (
        <>
            <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors min-h-screen">
                <div className="w-full px-8 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Test Results</h1>
                        <p className="text-sm text-gray-500 mt-1">Monitor student performance and level assignments.</p>
                    </div>
 
                    <DataTable
                        columns={columns}
                        data={results || []}
                        isLoading={isLoading}
                        showAddButton={false}
                    />
                </div>
            </main>

            {/* ── Delete Confirmation Modal ── */}
            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setRowToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                studentName={rowToDelete?.student_name}
                isLoading={isDeletingResult}
            />

            {/* ── Allow Retake Confirmation Modal ── */}
            <ConfirmRetakeModal
                isOpen={retakeModalOpen}
                onClose={() => { setRetakeModalOpen(false); setRowToRetake(null); }}
                onConfirm={handleRetakeConfirm}
                studentName={rowToRetake?.student_name}
                isLoading={isUnlocking}
            />
 
            {/* ── Access Time Extension Modal ── */}
            {isExtensionModalOpen && studentToExtend && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsExtensionModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#010080] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                Manage Life Status
                            </h3>
                            <button onClick={() => setIsExtensionModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                Student <span className="font-bold">{studentToExtend.student_name}</span>'s time to enter the exam has expired. You can grant them extra time to reactivate their access.
                            </p>
                        </div>

                        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Add Extra Time
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Amount..."
                                    value={extraTime}
                                    onChange={(e) => setExtraTime(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#010080] outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                                <select
                                    value={timeUnit}
                                    onChange={(e) => setTimeUnit(e.target.value)}
                                    className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#010080]"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsExtensionModalOpen(false)}
                                className="px-6 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!extraTime || isNaN(Number(extraTime))) {
                                        showToast("Please enter a valid number", "error");
                                        return;
                                    }
                                    const durationMinutes = timeUnit === "hours" ? parseInt(extraTime) * 60 : parseInt(extraTime);
                                    try {
                                        await extendStudentDeadline({
                                            id: studentToExtend.student_id,
                                            durationMinutes: durationMinutes
                                        }).unwrap();
                                        showToast("Extra time added successfully!", "success");
                                        setIsExtensionModalOpen(false);
                                        refetch();
                                    } catch (err: any) {
                                        console.error("Failed to extend deadline:", err);
                                        showToast(err?.data?.error || "Failed to extend access time", "error");
                                    }
                                }}
                                className="px-8 py-2.5 bg-[#010080] hover:bg-[#010080]/90 text-white rounded-lg font-bold shadow-md shadow-[#010080]/20 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
