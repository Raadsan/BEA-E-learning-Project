
"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

export default function IeltsProficiencyExamPage() {
    const { isDark } = useDarkMode();
    const { data: user } = useGetCurrentUserQuery();

    return (
        <div className={`min-h-screen pt-20 px-6 sm:px-10 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">IELTS/TOEFL Proficiency Exam</h1>
                <div className={`p-8 rounded-2xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="text-lg mb-6">
                        Welcome, <strong>{user?.full_name}</strong>. This is your proficiency assessment for the {user?.chosen_program} program.
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    Placeholder: The actual exam content will be integrated here.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-[#010080] text-white rounded-xl font-bold hover:bg-blue-900 transition-all">
                        Start Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
