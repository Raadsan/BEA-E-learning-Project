"use client";

import { useGetAllStudentReviewsQuery } from "@/redux/api/reviewApi";
import { useState } from "react";
import { format, isValid } from "date-fns";
import DataTable from "@/components/DataTable"; // Assuming this is confirmed path

export default function StudentReviewsPage() {
    const { data: reviews, isLoading } = useGetAllStudentReviewsQuery();
    const [selectedReview, setSelectedReview] = useState(null);

    const columns = [
        { key: "student_id", label: "Student ID", sortable: true },
        { key: "student_name", label: "Student Name", sortable: true },
        { key: "program_name", label: "Program Name", sortable: true },
        { key: "teacher_name", label: "Teacher", sortable: true },
        {
            key: "rating",
            label: "Rating",
            render: (value) => (
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            className={`w-4 h-4 ${i < value ? "fill-current" : "text-gray-300 dark:text-gray-600"}`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.24.588-1.24h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
            ),
            sortable: true
        },
        {
            key: "created_at",
            label: "Date",
            render: (value) => {
                const date = new Date(value);
                return isValid(date) ? format(date, 'MMM d, yyyy') : "N/A";
            },
            sortable: true
        },
        {
            key: "comment",
            label: "Comment",
            render: (value) => <span className="truncate max-w-xs block">{value}</span>,
            sortable: false
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <button
                    onClick={() => setSelectedReview(row)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="View Details"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            ),
            sortable: false
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Student Reviews</h1>

            <DataTable
                columns={columns}
                data={reviews || []}
                isLoading={isLoading}
                searchPlaceholder="Search reviews..."
                itemsPerPage={10}
            />

            {/* Details Modal */}
            {selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Review Details</h3>
                            <button onClick={() => setSelectedReview(null)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {/* Student Info Section */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Student Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Student Name</span>
                                        <p className="font-semibold">{selectedReview.student_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Student ID</span>
                                        <p className="font-mono text-sm">{selectedReview.student_id}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Program</span>
                                        <p className="text-sm">{selectedReview.program_name || "-"}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Subprogram</span>
                                        <p className="text-sm">{selectedReview.subprogram_name || "-"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs text-gray-500 block">Class</span>
                                        <p className="text-sm">{selectedReview.class_name || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Teacher</span>
                                    <p className="font-semibold text-lg">{selectedReview.teacher_name}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</span>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {(() => {
                                            const date = new Date(selectedReview.created_at);
                                            return isValid(date) ? format(date, 'PPP') : "N/A";
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rating</span>
                                    <div className="flex text-yellow-400 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-5 h-5 ${i < selectedReview.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.24.588-1.24h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Comment</span>
                                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300">
                                    {selectedReview.comment || "No comment provided."}
                                </div>
                            </div>

                            {selectedReview.answers && selectedReview.answers.length > 0 && (
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Detailed Answers</span>
                                    <div className="mt-2 space-y-3">
                                        {selectedReview.answers.map((ans, idx) => (
                                            <div key={idx} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                                                <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                                                    Question ID: {ans.question_id}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className={`w-4 h-4 ${i < ans.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`}
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.24.588-1.24h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
