"use client";

import { useState } from "react";
import { useGetPlacementTestsQuery, useDeletePlacementTestMutation } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { useDarkMode } from "@/context/ThemeContext";
import Modal from "@/components/Modal";

const InfoCard = ({ title, description, details, topActions, isDark, onClick, status }) => (
    <div
        onClick={onClick}
        className={`rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border flex flex-col h-full cursor-pointer group ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${status === 'active'
                            ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')
                            : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')
                            }`}>
                            {status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {description || "No description available."}
                    </p>
                </div>
                {topActions && (
                    <div className="flex items-center gap-1">
                        {topActions}
                    </div>
                )}
            </div>

            <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
                {details.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-gray-500`}>
                            {item.icon}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default function PlacementTestsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();
    const { data: tests, isLoading, error } = useGetPlacementTestsQuery();
    const [deleteTest, { isLoading: isDeleting }] = useDeletePlacementTestMutation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState(null);

    const handleCreateClick = () => {
        router.push("/portal/admin/assessments/placement-tests/create");
    };

    const handleDelete = (e, test) => {
        e.stopPropagation();
        setTestToDelete(test);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!testToDelete) return;
        try {
            await deleteTest(testToDelete.id).unwrap();
            showToast("Test deleted successfully", "success");
            setIsDeleteModalOpen(false);
            setTestToDelete(null);
        } catch (err) {
            showToast("Failed to delete test", "error");
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        router.push(`/portal/admin/assessments/placement-tests/${id}/edit`);
    };

    const handleView = (e, id) => {
        e?.stopPropagation(); // Optional chaining in case it's called directly
        router.push(`/portal/admin/assessments/placement-tests/${id}`);
    };

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto mt-6">
                <div className="w-full px-8 py-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-20">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Placement Tests</h1>
                            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Manage and view all available placement tests.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-sm`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Placement Test
                        </button>
                    </div>

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader />
                        </div>
                    ) : error ? (
                        <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-100 shadow-sm'}`}>
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error Loading Tests</h3>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-[#010080] font-medium hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : tests?.length === 0 ? (
                        <div className={`text-center py-20 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="w-16 h-16 bg-blue-50 text-[#010080] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Placement Tests Yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first placement test to start assessing student levels.</p>
                            <button
                                onClick={handleCreateClick}
                                className="text-[#010080] font-medium hover:underline"
                            >
                                Create Test
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {tests.map((test) => (
                                <InfoCard
                                    key={test.id}
                                    isDark={isDark}
                                    status={test.status}
                                    title={test.title}
                                    description={test.description}
                                    onClick={() => handleView(null, test.id)}
                                    topActions={
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleView(e, test.id)}
                                                className="text-green-600 hover:text-green-800 transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleEdit(e, test.id)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Edit Test"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, test)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete Test"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    }
                                    details={[
                                        {
                                            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                            text: `${test.duration_minutes} Minutes Duration`
                                        },
                                        {
                                            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                            text: `${test.questions?.length || 0} Questions`
                                        }
                                    ]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete"
                size="sm"
            >
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg bg-red-50 text-red-700 border border-red-100`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-semibold">Are you sure?</span>
                        </div>
                        <p className="mt-2 text-sm">
                            You are about to delete <strong>{testToDelete?.title}</strong>. This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className={`px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Test'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
