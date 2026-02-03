"use client";


import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery } from "@/redux/api/sessionRequestApi";
import { useGetFreezingRequestsQuery } from "@/redux/api/freezingApi";
import { useGetLevelUpRequestsQuery, useUpdateLevelUpRequestStatusMutation } from "@/redux/api/levelUpApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { useState } from "react";

export default function AdminStudentsRequestsPage() {
    const { isDark } = useDarkMode();
    const { data: sessionRequests = [], isLoading: sessionLoading } = useGetSessionRequestsQuery();
    const { data: freezingRequests = [], isLoading: freezingLoading } = useGetFreezingRequestsQuery();
    const { data: levelUpRequests = [], isLoading: levelUpLoading } = useGetLevelUpRequestsQuery();
    const { data: allClasses = [] } = useGetClassesQuery();
    const { data: subprograms = [] } = useGetSubprogramsQuery();
    const [updateLevelUpStatus] = useUpdateLevelUpRequestStatusMutation();
    const { showToast } = useToast();

    const [reviewRequest, setReviewRequest] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState("");

    const handleLevelUpAction = async (id, status, extraData = {}) => {
        try {
            await updateLevelUpStatus({ id, status, ...extraData }).unwrap();
            showToast(`Level-up request ${status} successfully!`, "success");
            setReviewRequest(null);
            setSelectedClassId("");
        } catch (err) {
            showToast("Failed to update level-up request", "error");
        }
    };

    const sessionColumns = [
        {
            key: "student_name", label: "Student", width: "250px",
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase font-bold">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "current_class_name", label: "Current Class", width: "150px" },
        {
            key: "requested_session_type", label: "Requested Session", width: "180px",
            render: (val) => (
                <div className="font-medium text-sm text-blue-600 dark:text-blue-400">{val}</div>
            ),
        },
        {
            key: "status", label: "Status", width: "120px",
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${val === 'approved' ? 'bg-green-100 text-green-700' :
                    val === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {val}
                </span>
            )
        },
    ];

    const freezingColumns = [
        {
            key: "student_name", label: "Student", width: "250px",
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase font-bold">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "duration", label: "Duration", width: "150px", render: (val) => <span>{val} Days</span> },
        { key: "start_date", label: "Start Date", width: "150px", render: (val) => <span>{new Date(val).toLocaleDateString()}</span> },
        {
            key: "status", label: "Status", width: "120px",
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${val === 'approved' ? 'bg-green-100 text-green-700' :
                    val === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {val}
                </span>
            )
        },
    ];

    const levelUpColumns = [
        {
            key: "student_name", label: "Student", width: "250px",
            render: (_, row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase font-bold">{row.student_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.student_email}</div>
                </div>
            ),
        },
        { key: "requested_subprogram_name", label: "Requested Level", width: "200px" },
        {
            key: "status", label: "Status", width: "120px",
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${val === 'approved' ? 'bg-green-100 text-green-700' :
                    val === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: "actions", label: "Actions", width: "200px",
            render: (_, row) => row.status === 'pending' && (
                <button
                    onClick={() => {
                        setReviewRequest(row);
                        setSelectedClassId("");
                    }}
                    className="px-4 py-2 bg-[#010080] hover:bg-[#010080]/90 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                    Review Eligibility
                </button>
            )
        }
    ];

    return (
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="w-full px-8 py-6 space-y-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#010080] dark:text-white">Admin: Level-Up Requests</h2>
                            <p className="text-gray-500 text-sm">Overview of students ready for promotion to their next level.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <DataTable
                                columns={levelUpColumns}
                                data={levelUpRequests}
                                isLoading={levelUpLoading}
                                showAddButton={false}
                            />
                        </div>
                    </section>

                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#010080] dark:text-white">Admin: Session Change Requests</h2>
                            <p className="text-gray-500 text-sm">Overview of all student session change requests.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <DataTable
                                columns={sessionColumns}
                                data={sessionRequests}
                                isLoading={sessionLoading}
                                showAddButton={false}
                            />
                        </div>
                    </section>

                    <section>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#010080] dark:text-white">Admin: Freezing Requests</h2>
                            <p className="text-gray-500 text-sm">Overview of all student freezing requests.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <DataTable
                                columns={freezingColumns}
                                data={freezingRequests}
                                isLoading={freezingLoading}
                                showAddButton={false}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Level Up Review Modal */}
            <Modal
                isOpen={!!reviewRequest}
                onClose={() => setReviewRequest(null)}
                title="Level-Up Request Review"
                size="lg"
            >
                {reviewRequest && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white uppercase">{reviewRequest.student_name}</h4>
                                <p className="text-sm text-gray-500">{reviewRequest.student_email}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Target Level</span>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                                    {reviewRequest.requested_subprogram_name}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-gray-500 uppercase font-bold mb-1">Academic Status</span>
                                <span className="text-2xl font-bold text-[#010080] dark:text-white">Ready for Review</span>
                                <p className="text-[10px] text-gray-400 mt-2 italic px-4">Admin should verify student's performance manually before making the final decision.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign to Class</label>
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#010080]"
                                    >
                                        <option value="">Select a class...</option>
                                        {allClasses.filter(c =>
                                            // Show next subprogram classes if considering approval
                                            // Show current subprogram classes if considering rejection (for reassignment)
                                            Number(c.subprogram_id) === Number(reviewRequest.requested_subprogram_id) ||
                                            // Logic to find current subprogram would be better if passed from backend
                                            true
                                        ).map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.class_name} ({subprograms.find(sp => sp.id === cls.subprogram_id)?.subprogram_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => {
                                    if (!selectedClassId) return showToast("Please select a new class", "warning");
                                    handleLevelUpAction(reviewRequest.id, 'approved', {
                                        new_class_id: selectedClassId,
                                        new_subprogram_id: reviewRequest.requested_subprogram_id
                                    });
                                }}
                                disabled={!selectedClassId}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Approve & Promote
                            </button>
                            <button
                                onClick={() => {
                                    if (!selectedClassId) return showToast("Please select a reassignment class", "warning");
                                    handleLevelUpAction(reviewRequest.id, 'rejected', {
                                        new_class_id: selectedClassId,
                                        admin_response: "Not recommended for promotion yet. Reassigned to a different class for improvement."
                                    });
                                }}
                                disabled={!selectedClassId}
                                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                Re-assign (Reject)
                            </button>
                            <button
                                onClick={() => handleLevelUpAction(reviewRequest.id, 'rejected', { admin_response: "Request rejected by administrator." })}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                                Direct Reject
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </main>

    );
}
