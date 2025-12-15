"use client";

import { useRouter, useParams } from "next/navigation";
import { useGetPlacementTestByIdQuery } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import Loader from "@/components/Loader";

export default function PlacementTestDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: test, isLoading, error } = useGetPlacementTestByIdQuery(id);

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-100"><Loader /></div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-gray-100 min-h-screen">Error loading test details.</div>;
    if (!test) return null;

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <div className="flex flex-col min-h-screen">
                <AdminHeader />
                <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-12 animate-in fade-in duration-300">

                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium hover:-translate-x-1 transform duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Tests
                        </button>
                    </div>

                    <div className="space-y-8">

                        {/* Header Section - Google Layout */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 border-t-[10px] border-t-[#673ab7]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-3xl font-normal text-gray-900 tracking-tight">{test.title}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${test.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {test.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {test.duration_minutes} Mins
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            {test.questions?.length} Questions
                                        </div>
                                    </div>

                                    {test.description && (
                                        <p className="text-gray-600 text-base leading-relaxed mt-6 max-w-4xl border-t border-gray-100 pt-6">
                                            {test.description}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => router.push(`/portal/admin/assessments/placement-tests/${id}/edit`)}
                                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-3 rounded-full transition-colors"
                                    title="Edit Test"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Questions List - Card Style */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-normal text-gray-900 ml-1">Questions Breakdown</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {test.questions?.map((q, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col border-l-4 border-l-transparent hover:border-l-[#673ab7]">
                                        <div className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-purple-50 text-[#673ab7] rounded-lg flex items-center justify-center text-sm font-bold">
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 w-full">
                                                <h3 className="text-gray-900 font-medium text-lg mb-4 break-words">
                                                    {q.questionText}
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {q.options?.map((opt, oid) => (
                                                        <div key={oid} className={`flex items-center gap-3 p-3 rounded-lg border ${oid === q.correctOption
                                                            ? 'bg-green-50 border-green-200'
                                                            : 'bg-white border-gray-200'
                                                            }`}>
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                                                                ${oid === q.correctOption
                                                                    ? 'border-green-600'
                                                                    : 'border-gray-300'
                                                                }`}
                                                            >
                                                                {oid === q.correctOption && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                                                            </div>
                                                            <span className={`text-base flex-1 break-words ${oid === q.correctOption ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                                                                {opt}
                                                            </span>
                                                            {oid === q.correctOption && (
                                                                <span className="ml-auto flex-shrink-0 text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                                    Correct
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>
            </div >
        </div >
    );
}
