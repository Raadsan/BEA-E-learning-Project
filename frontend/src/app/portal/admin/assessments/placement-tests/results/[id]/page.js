"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { useGetAllPlacementResultsQuery, useGetPlacementTestByIdQuery, useGradePlacementTestMutation } from "@/redux/api/placementTestApi";
import { useToast } from "@/components/Toast";

export default function AdminResultDetailsPage() {
    const router = useRouter();
    const { id } = useParams();

    // In a real optimized app, we would have a getResultById endpoint.
    // Here we filter from all results for simplicity as per current API capabilities.
    const { data: allResults, isLoading: resultsLoading } = useGetAllPlacementResultsQuery();
    const result = allResults?.find(r => r.id.toString() === id);

    const { data: test, isLoading: testLoading } = useGetPlacementTestByIdQuery(result?.test_id, {
        skip: !result?.test_id
    });

    const [gradePlacementTest] = useGradePlacementTestMutation();
    const [essayMarks, setEssayMarks] = useState({});
    const [feedbackFile, setFeedbackFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/uploads", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            if (data.url) {
                setFeedbackFile(data.url);
                showToast("File uploaded successfully", "success");
            }
        } catch (err) {
            console.error("Upload failed", err);
            showToast("File upload failed. Please try again.", "error");
        }
    };

    const handleGradeSubmit = async () => {
        // Validation: Check if any essay mark exceeds the question's points
        const essayQuestions = questions.filter(q => q.type === 'essay');
        for (const q of essayQuestions) {
            const mark = parseInt(essayMarks[q.id]);
            if (mark > q.points) {
                showToast(`Mark for "${q.title}" cannot exceed ${q.points} points.`, "error");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Calculate total essay marks awarded
            const totalEssayMarks = Object.values(essayMarks).reduce((a, b) => a + (parseInt(b) || 0), 0);

            await gradePlacementTest({
                resultId: id,
                essayMarks: totalEssayMarks,
                feedbackFile
            }).unwrap();

            showToast("Grading completed successfully!", "success");
        } catch (err) {
            console.error("Grading failed", err);
            showToast("Grading failed. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (resultsLoading || testLoading) {
        return <div className="flex h-screen items-center justify-center text-[#010080]">Loading details...</div>;
    }

    if (!result || !test) {
        return <div className="p-10 text-center">Result not found.</div>;
    }

    const studentAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : (result.answers || {});
    // Test questions might need parsing if string
    const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;

    const handleDownloadDoc = (questionTitle, answerContent) => {
        const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Essay Response</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #010080;">${test.title} - Essay Response</h1>
                <p><strong>Student:</strong> ${result.student_name}</p>
                <p><strong>Date:</strong> ${new Date(result.submitted_at).toLocaleDateString()}</p>
                <hr/>
                <h2 style="font-size: 16px;">Question: ${questionTitle}</h2>
                <br/>
                <h3>Student Answer:</h3>
                <div style="white-space: pre-wrap;">${answerContent}</div>
            </body>
            </html>
        `;

        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.student_name.replace(/\s+/g, '_')}_Essay.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-6 px-8 w-full">

                {/* Header Actions */}
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-[#010080] flex items-center gap-2 transition-all font-medium text-xs mb-6"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Results
                </button>

                {/* Summary Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{result.student_name}</h1>
                            <p className="text-gray-500 font-medium text-sm mt-1">{test.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${result.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {result.status === 'pending_review' ? 'Pending Review' : result.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                            <p className="text-xl font-bold text-[#010080]">{result.score} <span className="text-sm font-normal text-gray-400">/ {result.total_questions}</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accuracy</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(result.percentage)}%</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted</p>
                            <p className="text-sm font-semibold text-gray-700">{new Date(result.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rec. Level</p>
                            <p className="text-sm font-semibold text-gray-700">{result.recommended_level || "Evaluating..."}</p>
                        </div>
                    </div>
                </div>

                {/* Grading Section - ONLY for Pending Review */}
                {result.status === 'pending_review' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Manual Grading
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Review & Upload */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">1. Review Student Responses</label>
                                    <div className="flex flex-wrap gap-2">
                                        {questions.filter(q => q.type === 'essay').map((q, idx) => (
                                            <button
                                                key={q.id}
                                                onClick={() => handleDownloadDoc(q.title, studentAnswers[q.id] || "No response.")}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                                Download Essay {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">2. Upload Corrected File</label>
                                    <input
                                        type="file"
                                        accept=".doc,.docx,.pdf"
                                        onChange={handleFileUpload}
                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    {feedbackFile && (
                                        <div className="mt-2 flex items-center gap-2 text-green-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                            <span className="text-xs font-bold">File link updated</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Marks */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">3. Assign Marks</label>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                    {questions.filter(q => q.type === 'essay').map((q) => (
                                        <div key={q.id} className="flex items-center justify-between gap-4">
                                            <span className="text-xs text-gray-600 font-medium truncate flex-1">{q.title}</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={q.points}
                                                    placeholder="0"
                                                    className="w-16 p-1.5 text-sm border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                    value={essayMarks[q.id] || ''}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (val > q.points) {
                                                            showToast(`Maximum for this question is ${q.points}`, "warning");
                                                            setEssayMarks(prev => ({ ...prev, [q.id]: q.points }));
                                                        } else {
                                                            setEssayMarks(prev => ({ ...prev, [q.id]: e.target.value }));
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-gray-700 font-bold w-12"> / {q.points} pt</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleGradeSubmit}
                                        disabled={isSubmitting}
                                        className={`w-full md:w-auto px-6 py-2.5 bg-[#010080] text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Grades'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grading Result - ONLY for Completed tests with essay marks */}
                {result.status === 'completed' && result.feedback_file && (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm mb-8 flex justify-between items-center">
                        <div>
                            <h3 className="text-green-800 font-bold">Grading Completed</h3>
                            <p className="text-sm text-green-700 mt-1">Manual marks added: <strong>{result.essay_marks || 0}</strong></p>
                        </div>
                        <a
                            href={`http://localhost:5000${result.feedback_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-bold hover:bg-green-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Corrected File
                        </a>
                    </div>
                )}

                {/* Detailed Answers */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Answer Breakdown</h2>

                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{q.type}</span>
                                    <span className="text-xs font-semibold text-gray-900">Question {idx + 1}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">{q.points || 0} pts</span>
                            </div>

                            {/* MCQ Logic */}
                            {q.type === 'mcq' && (
                                <div className="space-y-3">
                                    <p className="text-base font-medium text-gray-900">{q.questionText}</p>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Student Answer:</p>
                                        {(() => {
                                            const studentAns = studentAnswers[q.id];
                                            const correctAns = q.options[q.correctOption];
                                            const isCorrect = studentAns === correctAns;
                                            return (
                                                <div className={`p-3 rounded border text-sm font-medium ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                    {studentAns || <span className="italic opacity-50">No Answer</span>}
                                                    {isCorrect ?
                                                        <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 text-[10px] rounded uppercase font-bold">Correct</span> :
                                                        <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-[10px] rounded uppercase font-bold">Incorrect</span>
                                                    }
                                                </div>
                                            )
                                        })()}

                                        {studentAnswers[q.id] !== q.options[q.correctOption] && (
                                            <div className="pt-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Correct Answer:</p>
                                                <p className="text-sm text-gray-700 font-medium">{q.options[q.correctOption]}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Passage Logic */}
                            {q.type === 'passage' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded text-sm text-gray-600 italic line-clamp-3">
                                        {q.passageText}
                                    </div>
                                    <div className="space-y-4 pl-4 border-l-2 border-blue-50">
                                        {q.subQuestions?.map((sq, si) => (
                                            <div key={si} className="space-y-2">
                                                <p className="text-sm font-bold text-gray-800">{si + 1}. {sq.questionText}</p>
                                                {(() => {
                                                    const studentAns = studentAnswers[sq.id];
                                                    const correctAns = sq.options[sq.correctOption];
                                                    const isCorrect = studentAns === correctAns;
                                                    return (
                                                        <div className="flex gap-4 text-xs">
                                                            <span className={`${isCorrect ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}`}>
                                                                Your: {studentAns || 'N/A'}
                                                            </span>
                                                            <span className="text-gray-500">
                                                                Correct: {correctAns}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Essay Logic */}
                            {q.type === 'essay' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{q.title}</p>
                                            <p className="text-sm text-gray-500">{q.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadDoc(q.title, studentAnswers[q.id] || "No response.")}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200"
                                            title="Download as Word Document"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                            Download Word
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-[#010080] uppercase mb-2">Student Response:</p>
                                        <div className="p-5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed font-serif shadow-inner min-h-[100px]">
                                            {studentAnswers[q.id] || <span className="italic text-gray-400">No response submitted.</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 justify-between border-t border-gray-100 pt-4">
                                        {result.status === 'pending_review' ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                                    <span className="text-xs font-bold text-yellow-600 uppercase">Pending Review</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-50">
                                                    {/* Marks input moved to top section */}
                                                    <span className="text-xs text-gray-400 italic">Enter marks in grading section above</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                <span className="text-xs font-bold text-green-600 uppercase">Graded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
