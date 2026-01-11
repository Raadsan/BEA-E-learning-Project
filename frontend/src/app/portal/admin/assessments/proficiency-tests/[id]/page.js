"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetProficiencyTestByIdQuery } from "@/redux/api/proficiencyTestApi";
import AdminHeader from "@/components/AdminHeader";
import Loader from "@/components/Loader";

export default function ProficiencyTestDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: test, isLoading, error } = useGetProficiencyTestByIdQuery(id);

    // Normalize and Group Questions into 5 Parts
    const questionsByPart = useMemo(() => {
        if (!test || !test.questions) return { 1: [], 2: [], 3: [], 4: [], 5: [] };

        const fetchedQuestions = Array.isArray(test.questions) ? test.questions.map((q, idx) => {
            let normalized = { ...q };
            if (normalized.type === 'multiple_choice') normalized.type = 'mcq';

            // Support legacy MCQ property names
            if (normalized.type === 'mcq') {
                normalized.questionText = normalized.questionText || normalized.question || "";
                if (normalized.correct_answer && normalized.options) {
                    normalized.correctOption = normalized.options.indexOf(normalized.correct_answer);
                    if (normalized.correctOption === -1) normalized.correctOption = 0;
                }
            }

            // Normalizing Passage
            if (normalized.type === 'passage') {
                normalized.passageText = normalized.passageText || normalized.passage || normalized.questionText || normalized.question || "";
                if (!normalized.part) normalized.part = 2;
            }

            // Normalizing Essay
            if (normalized.type === 'essay') {
                normalized.title = normalized.title || normalized.questionText || normalized.question || "";
                if (!normalized.part) normalized.part = 3;
            }

            // Normalizing Audio
            if (normalized.type === 'audio') {
                normalized.title = normalized.title || normalized.question || "Listening Exercise";
                if (!normalized.part) normalized.part = 5;
            }

            // Handle Parts for MCQ if missing
            if (normalized.type === 'mcq' && !normalized.part) {
                normalized.part = (idx > (test.questions.length / 2)) ? 4 : 1;
            }

            return normalized;
        }) : [];

        return {
            1: fetchedQuestions.filter(q => q.part === 1),
            2: fetchedQuestions.filter(q => q.part === 2),
            3: fetchedQuestions.filter(q => q.part === 3),
            4: fetchedQuestions.filter(q => q.part === 4),
            5: fetchedQuestions.filter(q => q.part === 5)
        };
    }, [test]);

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-white"><Loader /></div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-gray-50 min-h-screen pt-28 font-bold uppercase tracking-widest">Error loading test details.</div>;
    if (!test) return null;

    const totalMarks = (Array.isArray(test.questions) ? test.questions : []).reduce((acc, q) => acc + (parseInt(q.points) || 1), 0);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <AdminHeader />
            <main className="w-full px-4 md:px-12 pt-28 pb-12 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-[#010080] flex items-center gap-2 transition-all font-medium text-xs mb-3"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to List
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                            <span className="bg-[#010080] text-white px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider">{test.level}</span>
                        </div>
                        <p className="text-gray-500 mt-1 text-sm">{test.description || "Proficiency Test Assessment"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/portal/admin/assessments/proficiency-tests/${id}/edit`)}
                            className="bg-[#010080] hover:bg-[#000066] text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-semibold text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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

                    {/* All 5 Parts Rendering */}
                    {[1, 2, 3, 4, 5].map((pNum) => (
                        <div key={pNum} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#010080] text-white flex items-center justify-center font-bold text-sm">
                                    {pNum}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {pNum === 1 ? 'Part 1: Basic Structure (MCQ)' :
                                        pNum === 2 ? 'Part 2: Comprehension (Passage)' :
                                            pNum === 3 ? 'Part 3: Written Ability (Essay)' :
                                                pNum === 4 ? 'Part 4: Final Assessment (MCQ)' :
                                                    'Part 5: Audio Interpretation (Listening)'}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {questionsByPart[pNum].length === 0 ? (
                                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs font-medium">
                                        No items configured for this section.
                                    </div>
                                ) : (
                                    questionsByPart[pNum].map((q, idx) => (
                                        <div key={q.id || idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group overflow-hidden">
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
                                                        {q.options?.map((opt, oIdx) => (
                                                            <div key={oIdx} className={`flex items-center gap-3 p-3.5 rounded-lg border transition-all ${oIdx === q.correctOption ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${oIdx === q.correctOption ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'}`}>
                                                                    {oIdx === q.correctOption && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <span className={`text-sm font-semibold ${oIdx === q.correctOption ? 'text-green-900' : 'text-gray-600'}`}>{opt}</span>
                                                                {oIdx === q.correctOption && <span className="ml-auto text-[8px] font-bold uppercase text-green-700 bg-green-200 px-1.5 py-0.5 rounded">Correct</span>}
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
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1">Questions:</p>
                                                        {q.subQuestions?.map((sq, sIdx) => (
                                                            <div key={sIdx} className="pl-4 border-l-2 border-blue-100 space-y-3">
                                                                <p className="text-sm font-bold text-gray-900">{sIdx + 1}. {sq.questionText}</p>
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
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                                                        <span>Subjective Grading</span>
                                                        <span>Limit: <span className="text-[#010080]">{q.maxWords || 250} words</span></span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Audio Rendering */}
                                            {q.type === 'audio' && (
                                                <div className="space-y-5">
                                                    <h4 className="text-lg font-bold text-gray-900">{q.title}</h4>
                                                    <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#010080] flex items-center justify-center text-white shrink-0">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                                                        </div>
                                                        <audio controls className="h-8 flex-1 opacity-90">
                                                            <source src={q.audioUrl?.startsWith('/') ? `http://localhost:5000${q.audioUrl}` : q.audioUrl} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    </div>
                                                    <div className="p-5 bg-white border border-gray-100 rounded-lg">
                                                        <p className="text-xs text-gray-800 italic text-center">"{q.description || "Listen and summarize."}"</p>
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
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                `}</style>
            </main>
        </div>
    );
}
