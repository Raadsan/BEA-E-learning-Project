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
        <div className="min-h-screen bg-gray-100">
            <div className="flex flex-col min-h-screen">
                <AdminHeader />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-12 animate-in fade-in duration-300">

                    {/* Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-[#010080] flex items-center gap-2 transition-colors font-medium hover:translate-x-[-4px] transform duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                    </div>

                    <div className="space-y-6">

                        {/* Header Card (Google Forms Style) - Full Width */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-[10px] border-t-[#673ab7] overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-3xl font-normal text-gray-900 mb-2">{test.title}</h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {test.duration_minutes} Mins
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {test.questions?.length} Questions
                                            </span>
                                            <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${test.status === 'active'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {test.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/portal/admin/assessments/placement-tests/${id}/edit`)}
                                        className="text-gray-400 hover:text-[#673ab7] hover:bg-purple-50 p-2 rounded-full transition-all"
                                        title="Edit Form"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>

                                {test.description && (
                                    <p className="text-gray-600 text-base leading-relaxed mt-6 pt-6 border-t border-gray-100">
                                        {test.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Questions Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {test.questions?.map((q, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-purple-50 text-[#673ab7] rounded-lg flex items-center justify-center text-sm font-bold border border-purple-100">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-900 font-medium text-lg leading-snug pt-0.5">
                                            {q.questionText}
                                        </span>
                                    </div>

                                    <div className="space-y-2.5 mt-auto pt-2 pl-11">
                                        {q.options?.map((opt, oid) => (
                                            <div key={oid} className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${oid === q.correctOption
                                                ? 'bg-green-50 border-green-200'
                                                : 'border-transparent hover:bg-white/50'
                                                }`}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                                    ${oid === q.correctOption
                                                        ? 'border-green-600'
                                                        : 'border-gray-300'
                                                    }`}
                                                >
                                                    {oid === q.correctOption && <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>}
                                                </div>
                                                <span className={`text-sm ${oid === q.correctOption ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                                                    {opt}
                                                </span>
                                                {oid === q.correctOption && (
                                                    <span className="ml-auto text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200 shadow-sm">
                                                        Correct
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
