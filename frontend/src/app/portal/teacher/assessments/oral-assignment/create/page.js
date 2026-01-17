"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import {
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useGetAssignmentsQuery
} from "@/redux/api/assignmentApi";
import { useToast } from "@/components/Toast";

import { useDarkMode } from "@/context/ThemeContext";

function OralAssignmentCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    // Queries
    const { data: classes } = useGetClassesQuery();
    const { data: programs } = useGetProgramsQuery();
    // Fetch if editing, but simpler to just fetch all assignments and find by ID locally for now or modify API to get single
    // For simplicity, we assume we can fetch list and find, or just build form. 
    // Ideally we should have useGetAssignmentByIdQuery.
    // We will use existing getAssignments and find it.
    const { data: allOralAssignments } = useGetAssignmentsQuery({ type: 'oral_assignment' }, { skip: !id });

    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        class_id: "",
        program_id: "",
        due_date: "",
        total_points: 100,
        status: "active",
        duration: 30, // Default 30 mins
        audioUrl: ""
    });

    const [audioFile, setAudioFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (id && allOralAssignments) {
            const assignment = allOralAssignments.find(a => a.id == id);
            if (assignment) {
                // Parse audio URL from questions if stored there
                let loadedAudioUrl = "";
                try {
                    const parsedQuestions = typeof assignment.questions === 'string'
                        ? JSON.parse(assignment.questions)
                        : assignment.questions;

                    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0 && parsedQuestions[0].audioUrl) {
                        loadedAudioUrl = parsedQuestions[0].audioUrl;
                    }
                    // Fallback: check if description contains it or separate field?
                    // Implementation plan said store in questions.
                } catch (e) {
                    console.error("Failed to parse existing audio url", e);
                }

                setFormData({
                    title: assignment.title,
                    description: assignment.description || "",
                    class_id: assignment.class_id,
                    program_id: assignment.program_id,
                    due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : "",
                    total_points: assignment.total_points,
                    status: assignment.status || "active",
                    duration: assignment.duration || 30,
                    audioUrl: loadedAudioUrl
                });
            }
        }
    }, [id, allOralAssignments]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            showToast("Please upload an audio file (MP3, WAV, etc.)", "error");
            return;
        }

        setAudioFile(file);

        // Auto-upload immediately to get URL
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setIsUploading(true);
            const token = localStorage.getItem('token'); // Assuming standard token storage
            const res = await fetch('http://localhost:5000/api/uploads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, audioUrl: data.url }));
            showToast("Audio uploaded successfully!", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to upload audio file", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.class_id || !formData.duration) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        if (!formData.audioUrl) {
            showToast("Please upload an audio prompt for the oral assignment", "error");
            return;
        }

        // We store the Audio URL inside the 'questions' column as a JSON array
        // This mimics the structure used by generic assignments but tailored for oral
        const questionsData = [
            {
                type: 'audio_prompt',
                audioUrl: formData.audioUrl,
                questionText: formData.description // Use description as the text prompt
            }
        ];

        const payload = {
            title: formData.title,
            description: formData.description,
            class_id: formData.class_id,
            program_id: formData.program_id,
            due_date: formData.due_date,
            total_points: formData.total_points,
            status: formData.status,
            duration: formData.duration,
            type: 'oral_assignment',
            questions: JSON.stringify(questionsData)
        };

        try {
            if (id) {
                await updateAssignment({ id, ...payload }).unwrap();
                showToast("Oral Assignment updated successfully!", "success");
            } else {
                await createAssignment(payload).unwrap();
                showToast("Oral Assignment created successfully!", "success");
            }
            router.push('/portal/teacher/assessments/oral-assignment');
        } catch (err) {
            console.error(err);
            showToast(err.data?.error || "Failed to save assignment", "error");
        }
    };

    return (
        <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="w-full pb-20 px-6 sm:px-10 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{id ? 'Edit' : 'Create'} Oral Assignment</h1>
                        <p className="text-gray-500 dark:text-gray-400">Upload an audio prompt for students to respond to.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Card */}
                    <div className={`p-8 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-blue-600"></span>
                            Assignment Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    placeholder="e.g. Week 1 Speaking Task"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Instructions / Prompt</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 min-h-[100px] resize-none ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    placeholder="Describe what the student should do..."
                                />
                            </div>

                            {/* Audio Upload Section */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">
                                    Audio Prompt (Max 50MB)
                                </label>

                                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDark ? 'border-gray-700 hover:border-blue-500 bg-gray-900/50' : 'border-gray-300 hover:border-blue-500 bg-gray-50'}`}>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={isUploading}
                                    />

                                    <div className="space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            {isUploading ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            ) : (
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            {formData.audioUrl ? (
                                                <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Audio Uploaded Successfully!
                                                </div>
                                            ) : (
                                                <div className="text-gray-500">
                                                    <span className="text-blue-600 font-bold">Click to upload</span> or drag and drop
                                                    <p className="text-xs mt-1">MP3, WAV, M4A supported</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {formData.audioUrl && (
                                    <div className="mt-4 p-4 rounded-xl flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Preview Uploaded Audio</p>
                                            <audio controls className="w-full mt-2 h-8">
                                                <source src={`http://localhost:5000${formData.audioUrl}`} />
                                            </audio>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Class</label>
                                <select
                                    value={formData.class_id}
                                    onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    required
                                >
                                    <option value="">Select a Class</option>
                                    {classes?.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Program</label>
                                <select
                                    value={formData.program_id}
                                    onChange={e => setFormData({ ...formData, program_id: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <option value="">Select a Program</option>
                                    {programs?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    placeholder="e.g. 30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Points</label>
                                <input
                                    type="number"
                                    value={formData.total_points}
                                    onChange={e => setFormData({ ...formData, total_points: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wide opacity-70 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all focus:border-blue-500 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end gap-4 pb-20">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border-2 hover:bg-gray-50'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className={`px-8 py-3 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${isCreating || isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {(isCreating || isUpdating) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {id ? 'Update Assignment' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateOralAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OralAssignmentCreateContent />
        </Suspense>
    );
}
