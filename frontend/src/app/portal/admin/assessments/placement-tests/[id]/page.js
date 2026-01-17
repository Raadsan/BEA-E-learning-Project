"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetPlacementTestByIdQuery } from "@/redux/api/placementTestApi";

import Loader from "@/components/Loader";

export default function PlacementTestDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: test, isLoading, error } = useGetPlacementTestByIdQuery(id);

    // Normalize and Group Questions
    const questionsByPart = useMemo(() => {
        if (!test || !test.questions) return { 1: [], 2: [], 3: [], 4: [] };

        const fetchedQuestions = Array.isArray(test.questions) ? test.questions.map((q, idx) => {
            let normalized = { ...q };

            // Normalize Passage
            if (normalized.type === 'passage') {
                normalized.passageText = normalized.passageText || normalized.passage || normalized.questionText || normalized.question || "";
                if (!normalized.part) normalized.part = 2;
            }

            // Normalize Essay
            if (normalized.type === 'essay') {
                normalized.title = normalized.title || normalized.questionText || normalized.question || "";
                if (!normalized.part) normalized.part = 3;
            }

            // Normalize MCQ & Handle Parts
            if (normalized.type === 'mcq') {
                normalized.questionText = normalized.questionText || normalized.question || "";
                if (!normalized.part) {
                    normalized.part = (idx > 5 && test.questions?.length > 10) ? 4 : 1;
                }
            }

            return normalized;
        }) : [];

        return {
            1: fetchedQuestions.filter(q => q.part === 1),
            2: fetchedQuestions.filter(q => q.part === 2),
            3: fetchedQuestions.filter(q => q.part === 3),
            4: fetchedQuestions.filter(q => q.part === 4)
        };
    }, [test]);

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-100"><Loader /></div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-gray-100 min-h-screen">Error loading test details.</div>;
    if (!test) return null;

    const totalMarks = (Array.isArray(test.questions) ? test.questions : []).reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="w-full px-4 md:px-12 py-6 animate-in fade-in duration-500">

                {/* Back Button & Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-[#010080] flex items-center gap-2 transition-all font-medium text-xs mb-3"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to List
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                        <p className="text-gray-500 mt-1 text-sm">{test.description || "Placement Test Assessment"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/portal/admin/assessments/placement-tests/${id}/edit`)}
                            className="bg-[#010080] hover:bg-[#000066] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-semibold text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Test
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Test Specifications Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                            Test Specifications
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${test.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {test.status}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Duration</p>
                                <p className="text-base font-bold text-gray-900">{test.duration_minutes} <span className="text-xs font-normal text-gray-400">Min</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Questions</p>
                                <p className="text-base font-bold text-gray-900">{test.questions?.length || 0} <span className="text-xs font-normal text-gray-400">Items</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Points</p>
                                <p className="text-base font-bold text-[#010080]">{totalMarks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Parts Breakdown */}
                    {[1, 2, 3, 4].map((partNum) => (
                        <div key={partNum} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#010080] text-white flex items-center justify-center font-bold text-sm">
                                    {partNum}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {partNum === 1 ? 'Part 1: Basic Structure (MCQ)' :
                                        partNum === 2 ? 'Part 2: Comprehension (Passage)' :
                                            partNum === 3 ? 'Part 3: Written Ability (Essay)' :
                                                'Part 4: Final Assessment (MCQ)'}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {questionsByPart[partNum].length === 0 ? (
                                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs font-medium">
                                        No items configured for this section.
                                    </div>
                                ) : (
                                    questionsByPart[partNum].map((q, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-[#010080] bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wide border border-blue-100">
                                                        {q.type}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Item {idx + 1}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-[#010080]">{q.points} pt{q.points !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>

                                            {/* MCQ Rendering */}
                                            {q.type === 'mcq' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-base font-bold text-gray-900 leading-snug">{q.questionText}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {q.options?.map((opt, oid) => (
                                                            <div key={oid} className={`flex items-center gap-3 p-3.5 rounded-lg border transition-all ${oid === q.correctOption ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${oid === q.correctOption ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'}`}>
                                                                    {oid === q.correctOption && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <span className={`text-sm font-semibold ${oid === q.correctOption ? 'text-green-900' : 'text-gray-600'}`}>{opt}</span>
                                                                {oid === q.correctOption && <span className="ml-auto text-[8px] font-bold uppercase text-green-700 bg-green-200 px-1.5 py-0.5 rounded">Correct</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Passage Rendering */}
                                            {q.type === 'passage' && (
                                                <div className="space-y-6">
                                                    <div className="bg-gray-50 border border-gray-100 p-5 rounded-lg leading-relaxed text-gray-600 text-sm italic">
                                                        "{q.passageText}"
                                                    </div>
                                                    <div className="space-y-5">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-50 pb-1">Questions:</p>
                                                        {q.subQuestions?.map((sq, si) => (
                                                            <div key={si} className="pl-4 border-l-2 border-blue-100 space-y-3">
                                                                <p className="text-sm font-bold text-gray-800">{si + 1}. {sq.questionText}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {sq.options?.map((opt, oi) => (
                                                                        <span key={oi} className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border ${oi === sq.correctOption ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-100 text-gray-500'}`}>
                                                                            {opt} {oi === sq.correctOption && "✓"}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Essay Rendering */}
                                            {q.type === 'essay' && (
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold text-gray-900">{q.title}</h4>
                                                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-700 leading-relaxed italic">{q.description || "No instructions provided."}</p>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                            Limit: {q.maxWords || 250} words
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                `}</style>
            </div>

        </div>
    );
}
