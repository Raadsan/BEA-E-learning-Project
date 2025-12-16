"use client";

import { useState } from "react";
import { useGetProficiencyTestsQuery, useDeleteProficiencyTestMutation } from "@/redux/api/proficiencyTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { useDarkMode } from "@/context/ThemeContext";

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

export default function ProficiencyTestsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();
    const { data: tests, isLoading, error } = useGetProficiencyTestsQuery();
    const [deleteTest] = useDeleteProficiencyTestMutation();

    const handleCreateClick = () => {
        router.push("/portal/admin/assessments/proficiency-tests/create");
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this test?")) {
            try {
                await deleteTest(id).unwrap();
                showToast("Test deleted successfully", "success");
            } catch (err) {
                showToast("Failed to delete test", "error");
            }
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        router.push(`/portal/admin/assessments/proficiency-tests/${id}/edit`);
    };

    const handleView = (e, id) => {
        e?.stopPropagation();
        router.push(`/portal/admin/assessments/proficiency-tests/${id}`);
    };

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto mt-6">
                <div className="w-full px-8 py-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Proficiency Tests</h1>
                            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Manage and view all English proficiency tests.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="bg-[#010080] hover:bg-[#000066] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Proficiency Test
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
                            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Proficiency Tests Yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first proficiency test to assess English language skills.</p>
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
                                        <>
                                            <button
                                                onClick={(e) => handleView(e, test.id)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'text-green-400 hover:bg-green-900/20'
                                                    : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleEdit(e, test.id)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'text-blue-400 hover:bg-blue-900/20'
                                                    : 'text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                title="Edit Test"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, test.id)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? 'text-red-400 hover:bg-red-900/20'
                                                    : 'text-red-600 hover:bg-red-50'
                                                    }`}
                                                title="Delete Test"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </>
                                    }
                                    details={[
                                        {
                                            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                            text: `${test.duration_minutes} Minutes Duration`
                                        },
                                        {
                                            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                            text: `${test.questions?.length || 0} Questions`
                                        },
                                        {
                                            icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                                            text: (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${test.level === 'Advanced'
                                                        ? (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700')
                                                        : (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700')
                                                    }`}>
                                                    {test.level || 'Intermediate'}
                                                </span>
                                            )
                                        }
                                    ]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
