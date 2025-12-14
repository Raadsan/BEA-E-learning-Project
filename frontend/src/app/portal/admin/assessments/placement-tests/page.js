"use client";

import { useState } from "react";
import { useGetPlacementTestsQuery, useDeletePlacementTestMutation } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";

export default function PlacementTestsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { data: tests, isLoading, error } = useGetPlacementTestsQuery();
    const [deleteTest] = useDeletePlacementTestMutation();


    const handleCreateClick = () => {
        router.push("/portal/admin/assessments/placement-tests/create");
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening modal
        if (confirm("Are you sure you want to delete this test?")) {
            try {
                await deleteTest(id).unwrap();
                showToast("Test deleted successfully", "success");
                if (selectedTest?.id === id) {
                    setSelectedTest(null);
                }
            } catch (err) {
                showToast("Failed to delete test", "error");
            }
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-gray-50 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 md:p-8">
                {/* Header Section - Always visible */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Placement Tests View</h1>
                        {error && <p className="text-sm text-red-500 mt-1">Status: Offline / Error</p>}
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-[#010080] hover:bg-[#000066] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                    </button>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-red-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tests</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            We couldn't connect to the server. Please check your connection or restart the backend.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[#010080] font-medium hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : tests?.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-[#010080] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Placement Tests Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first placement test to start assessing student levels.</p>
                        <button
                            onClick={handleCreateClick}
                            className="bg-[#010080] hover:bg-[#000066] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Test
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {tests.map((test) => (
                            <div
                                key={test.id}
                                onClick={() => setSelectedTest(test)}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group relative hover:border-blue-100"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#010080] transition-colors">
                                            {test.title}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${test.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {test.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/portal/admin/assessments/placement-tests/${test.id}/edit`);
                                            }}
                                            className="p-2 text-blue-400 hover:text-[#010080] hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Test"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, test.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Test"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 max-w-3xl">
                                    {test.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {test.duration_minutes} Minutes
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {test.questions?.length || 0} Questions
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/portal/admin/assessments/placement-tests/${test.id}`);
                                        }}
                                        className="text-sm font-semibold text-[#010080] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                    >
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
