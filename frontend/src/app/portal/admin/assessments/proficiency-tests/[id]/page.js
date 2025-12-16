"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetProficiencyTestByIdQuery, useDeleteProficiencyTestMutation } from "@/redux/api/proficiencyTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { useDarkMode } from "@/context/ThemeContext";

export default function ViewProficiencyTestPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();
    const { data: test, isLoading, error } = useGetProficiencyTestByIdQuery(params.id);
    const [deleteTest] = useDeleteProficiencyTestMutation();

    const handleEdit = () => {
        router.push(`/portal/admin/assessments/proficiency-tests/${params.id}/edit`);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this proficiency test? This action cannot be undone.")) {
            try {
                await deleteTest(params.id).unwrap();
                showToast("Proficiency test deleted successfully", "success");
                router.push("/portal/admin/assessments/proficiency-tests");
            } catch (err) {
                showToast("Failed to delete test", "error");
            }
        }
    };

    const handleBack = () => {
        router.push("/portal/admin/assessments/proficiency-tests");
    };

    if (isLoading) {
        return (
            <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <AdminHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader />
                </main>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <AdminHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Test Not Found
                        </h2>
                        <button
                            onClick={handleBack}
                            className="bg-[#010080] hover:bg-[#000066] text-white px-6 py-2 rounded-lg"
                        >
                            Back to Tests
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Parse questions if they're stored as JSON string
    const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
    const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

    return (
        <div className={`flex-1 min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <AdminHeader />
            <main className="flex-1 overflow-y-auto mt-6 pt-20">
                <div className="w-full px-8 py-6 max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className={`flex items-center gap-2 mb-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Proficiency Tests
                        </button>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {test.title}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${test.status === 'active'
                                            ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')
                                            : (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')
                                        }`}>
                                        {test.status === 'active' ? 'Active' : test.status === 'inactive' ? 'Inactive' : 'Archived'}
                                    </span>
                                </div>
                                {test.description && (
                                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {test.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Test
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {questions?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {test.duration_minutes} min
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Points</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {totalPoints}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created</p>
                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {new Date(test.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className={`rounded-xl shadow-md p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Test Questions
                        </h2>

                        <div className="space-y-6">
                            {questions?.map((question, index) => (
                                <div
                                    key={index}
                                    className={`p-6 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
                                >
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                                Question {index + 1}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                                {question.type === 'multiple_choice' && 'Multiple Choice'}
                                                {question.type === 'direct_answer' && 'Direct Answer'}
                                                {question.type === 'essay' && 'Essay'}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                            {question.points} {question.points === 1 ? 'point' : 'points'}
                                        </span>
                                    </div>

                                    {/* Question Text */}
                                    <p className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {question.question}
                                    </p>

                                    {/* Multiple Choice Options */}
                                    {question.type === 'multiple_choice' && (
                                        <div className="space-y-2">
                                            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Options:
                                            </p>
                                            {question.options?.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`flex items-center gap-3 p-3 rounded-lg ${option === question.correct_answer
                                                            ? (isDark ? 'bg-green-900/20 border-2 border-green-600' : 'bg-green-50 border-2 border-green-500')
                                                            : (isDark ? 'bg-gray-700' : 'bg-white border border-gray-300')
                                                        }`}
                                                >
                                                    {option === question.correct_answer && (
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span className={`${option === question.correct_answer ? 'font-semibold' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {option}
                                                    </span>
                                                    {option === question.correct_answer && (
                                                        <span className="ml-auto text-xs font-semibold text-green-600">
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Direct Answer */}
                                    {question.type === 'direct_answer' && question.correct_answer && (
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-2 border-green-600' : 'bg-green-50 border-2 border-green-500'}`}>
                                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Expected Answer:
                                            </p>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {question.correct_answer}
                                            </p>
                                        </div>
                                    )}

                                    {/* Essay Note */}
                                    {question.type === 'essay' && (
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-600' : 'bg-blue-50 border border-blue-300'}`}>
                                            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                                📝 This is an essay question. Students will write a paragraph response that will be manually graded.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
