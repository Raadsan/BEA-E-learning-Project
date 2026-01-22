"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useGetAssignmentsQuery
} from "@/redux/api/assignmentApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useUploadFileMutation } from "@/redux/api/uploadApi";

import { useToast } from "@/components/Toast";
import { useDarkMode } from "@/context/ThemeContext";
import { v4 as uuidv4 } from "uuid";

// Icons
import {
    DocumentTextIcon,
    BookOpenIcon,
    SpeakerWaveIcon,
    MicrophoneIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function CreateTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const { showToast } = useToast();
    const { isDark } = useDarkMode();

    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    // Queries
    const { data: classes } = useGetClassesQuery();
    const { data: programs } = useGetProgramsQuery();

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        class_id: "", // Not used
        program_id: "",
        subprogram_id: "", // Level
        total_points: 100,
        status: "active",
        duration: 60,
    });

    // Conditional Query for Subprograms (Levels)
    const { data: subprograms } = useGetSubprogramsByProgramIdQuery(basicInfo.program_id, {
        skip: !basicInfo.program_id
    });

    // Validations & Steps
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, title: "Paper 1: Writing", icon: <PencilSquareIcon className="w-5 h-5" />, type: 'writing' },
        { id: 2, title: "Paper 2: Reading", icon: <BookOpenIcon className="w-5 h-5" />, type: 'reading' },
        { id: 3, title: "Paper 3: Listening", icon: <SpeakerWaveIcon className="w-5 h-5" />, type: 'listening' },
        { id: 4, title: "Paper 4: Oral", icon: <MicrophoneIcon className="w-5 h-5" />, type: 'oral' }
    ];

    // Data Structure for Papers
    const [papers, setPapers] = useState({
        paper1: {
            title: "Writing [Paper 1]",
            editing: [], // { id, text, correction, points }
            essay: { id: uuidv4(), prompt: "", points: 20 }
        },
        paper2: {
            title: "Comprehension/Reading [Paper 2]",
            passage: "",
            questions: [] // { id, type, questionText, options, correctOption, points }
        },
        paper3: {
            title: "Listening [Paper 3]",
            audioFile: null, // "filename.mp3" after upload or object if pending? 
            // We will upload immediately upon selection for better UX in wizard
            audioUrl: "",
            questions: []
        },
        paper4: {
            title: "Oral/Speaking [Paper 4]",
            passage: "",
            instructions: "Record your voice reading this passage.",
            timeLimit: 10, // Minutes
            points: 20 // Default points
        }
    });

    // Temporary Inputs (Buffer before adding to list)
    const [tempEditing, setTempEditing] = useState({ text: "", correction: "", points: 2 });
    const [editingItemId, setEditingItemId] = useState(null); // Track which item is being edited
    const [tempReadingQ, setTempReadingQ] = useState({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, points: 2 });
    const [tempListeningQ, setTempListeningQ] = useState({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, points: 2 });

    // Fetch existing if editing
    const { data: assignments } = useGetAssignmentsQuery({ type: 'test' }, { skip: !editId });
    const editingAssignment = assignments?.find(a => a.id === parseInt(editId));

    useEffect(() => {
        if (editingAssignment) {
            setBasicInfo({
                title: editingAssignment.title,
                description: editingAssignment.description,
                start_date: editingAssignment.start_date ? new Date(editingAssignment.start_date).toISOString().split('T')[0] : "",
                end_date: editingAssignment.end_date ? new Date(editingAssignment.end_date).toISOString().split('T')[0]
                    : editingAssignment.due_date ? new Date(editingAssignment.due_date).toISOString().split('T')[0] : "",
                class_id: editingAssignment.class_id,
                program_id: editingAssignment.program_id,
                subprogram_id: editingAssignment.subprogram_id || "",
                total_points: editingAssignment.total_points,
                status: editingAssignment.status || "active",
                duration: editingAssignment.duration || 60,
            });
            if (editingAssignment.questions) {
                try {
                    const parsed = typeof editingAssignment.questions === 'string'
                        ? JSON.parse(editingAssignment.questions)
                        : editingAssignment.questions;
                    if (parsed.paper1 || parsed.paper2) {
                        setPapers(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse existing questions", e);
                }
            }
        }
    }, [editingAssignment]);

    const handleInfoChange = (e) => {
        setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    };

    // --- Actions ---

    const handleSaveEditingItem = () => {
        if (!tempEditing.text || !tempEditing.correction) return showToast("Please fill all fields", "error");

        if (editingItemId) {
            // Update existing
            setPapers(prev => ({
                ...prev,
                paper1: {
                    ...prev.paper1,
                    editing: prev.paper1.editing.map(item =>
                        item.id === editingItemId ? { ...tempEditing, id: editingItemId } : item
                    )
                }
            }));
            setEditingItemId(null);
            showToast("Question updated", "success");
        } else {
            // Add new
            setPapers(prev => ({
                ...prev,
                paper1: {
                    ...prev.paper1,
                    editing: [...prev.paper1.editing, { ...tempEditing, id: uuidv4() }]
                }
            }));
        }
        setTempEditing({ text: "", correction: "", points: 2 });
    };

    const startEditing = (item) => {
        setTempEditing({ text: item.text, correction: item.correction, points: item.points });
        setEditingItemId(item.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Optional scroll hint or just letting them see the form
    };

    const removeEditingItem = (id) => {
        setPapers(prev => ({
            ...prev,
            paper1: { ...prev.paper1, editing: prev.paper1.editing.filter(x => x.id !== id) }
        }));
    };

    const addReadingItem = () => {
        if (!tempReadingQ.questionText) return showToast("Question text is required", "error");
        setPapers(prev => ({
            ...prev,
            paper2: {
                ...prev.paper2,
                questions: [...prev.paper2.questions, { ...tempReadingQ, id: uuidv4() }]
            }
        }));
        // Reset
        setTempReadingQ({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, points: 2 });
    };

    const removeReadingItem = (id) => {
        setPapers(prev => ({ ...prev, paper2: { ...prev.paper2, questions: prev.paper2.questions.filter(x => x.id !== id) } }));
    };

    const handleAudioUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Direct upload to backend
        const formData = new FormData();
        formData.append('file', file);

        try {
            showToast("Uploading audio...", "info");
            const res = await uploadFile(formData).unwrap(); // Expecting { url: '/uploads/...' }
            setPapers(prev => ({
                ...prev,
                paper3: { ...prev.paper3, audioUrl: res.url, audioFile: res.url } // Store URL
            }));
            showToast("Audio uploaded!", "success");
        } catch (err) {
            console.error(err);
            showToast("Upload failed", "error");
        }
    };

    const addListeningItem = () => {
        if (!tempListeningQ.questionText) return showToast("Question text is required", "error");
        setPapers(prev => ({
            ...prev,
            paper3: {
                ...prev.paper3,
                questions: [...prev.paper3.questions, { ...tempListeningQ, id: uuidv4() }]
            }
        }));
        setTempListeningQ({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, points: 2 });
    };

    const removeListeningItem = (id) => {
        setPapers(prev => ({ ...prev, paper3: { ...prev.paper3, questions: prev.paper3.questions.filter(x => x.id !== id) } }));
    };


    // --- Total Marks Calculation ---
    // P1: Editing (sum) + Essay (points)
    // P2: Questions (sum)
    // P3: Questions (sum)
    // P4: Reading (0 usually, maybe pronunciation points? Let's assume 0 marks or manual grading) -> Actually usually 10-20 marks.
    // Let's add points to Paper 4 structure? Assuming 20 for logic.

    // We didn't have points in oral structure before, adding now.
    const calculateTotal = () => {
        let total = 0;
        // P1
        total += papers.paper1.editing.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);
        // Only count essay points if prompt is set
        if (papers.paper1.essay.prompt) {
            total += parseInt(papers.paper1.essay.points) || 0;
        }

        // P2
        total += papers.paper2.questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);
        // P3
        total += papers.paper3.questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);
        // P4
        // Only count oral points if passage is set
        if (papers.paper4.passage) {
            total += parseInt(papers.paper4.points) || 0;
        }

        return total;
    };

    const handleSubmit = async () => {
        if (!basicInfo.title || !basicInfo.program_id) {
            showToast("Title and Program are required.", "error");
            return;
        }

        // Prepare Questions JSON
        // Since we are now uploading files directly via `uploadFile` mutation (implied requirement for "design like proficiency"),
        // we don't need to send FormData for the main create request if audio is already URL.
        // CHECK: Standard `createAssignment` handles JSON.
        // My previous edit to assignmentController handles uploaded files in `req.files` OR JSON.
        // If I use the `uploadFile` API (from proficiency test flow), I get a URL.
        // I should stick to that pattern as it's cleaner for the Wizard UI.

        const payload = {
            ...basicInfo,
            type: 'test',
            questions: JSON.stringify(papers),
            total_points: calculateTotal()
        };

        try {
            if (editId) {
                await updateAssignment({ id: editId, ...payload }).unwrap();
                showToast("Test updated successfully!", "success");
            } else {
                await createAssignment(payload).unwrap(); // Ensure assignmentApi accepts JSON if no file is stuck in Body
                showToast("Exam created successfully!", "success");
            }
            router.push("/portal/teacher/assessments/tests");
        } catch (err) {
            showToast("Failed to save exam.", "error");
            console.error(JSON.stringify(err, null, 2));
        }
    };


    // UI Helpers
    const StepIndicator = () => (
        <div className="bg-white py-12 px-6 rounded-2xl shadow-sm border border-gray-200 mb-8 w-full">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="relative flex flex-col items-center z-10">
                                <div
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                        isActive ? 'bg-[#010080] border-[#010080] text-white shadow-xl shadow-blue-900/20 scale-110' :
                                            'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
                                        }`}>
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : step.id}
                                </div>
                                <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[#010080]' : 'text-gray-400'
                                    }`}>
                                    {step.title.split(":")[0]}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 bg-gray-100 relative">
                                    <div className={`absolute left-0 top-0 h-full bg-green-500 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="flex-1 overflow-y-auto p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto w-full">
                    <div>
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-[#010080] mb-2 flex items-center gap-2 text-sm font-semibold transition-colors">
                            ← Back to Exams
                        </button>
                        <h1 className="text-3xl font-bold text-[#010080] dark:text-blue-400">Create Exam</h1>
                        <p className="text-gray-500 mt-1">Setup the 4-part Standard Assessment</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <StepIndicator />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* LEFT COLUMN: FORM */}
                        <div className="lg:col-span-3 space-y-8">

                            {/* Section: General Info (Always Visible at Top of content or just Step 1? Layout suggests Step 1 could be Info, or Info is above. Let's put Info in a collapsible or always visible top card. Reference uses "Test General Information" as first card inside the 3-col area.) */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#010080]"></div>
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-[#010080]" />
                                    Exam Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Exam Title</label>
                                        <input
                                            name="title"
                                            value={basicInfo.title}
                                            onChange={handleInfoChange}
                                            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#010080]/20 outline-none"
                                            placeholder="e.g. Midterm Spring 2026"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Program & Level</label>
                                        <div className="flex gap-2">
                                            <select
                                                name="program_id"
                                                value={basicInfo.program_id}
                                                onChange={handleInfoChange}
                                                className="w-1/2 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                            >
                                                <option value="">Select Program...</option>
                                                {programs?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                            <select
                                                name="subprogram_id"
                                                value={basicInfo.subprogram_id}
                                                onChange={handleInfoChange}
                                                className="w-1/2 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                                disabled={!basicInfo.program_id}
                                            >
                                                <option value="">Select Level...</option>
                                                {subprograms?.map(s => <option key={s.id} value={s.id}>{s.subprogram_name} {s.title}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Start Date</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={basicInfo.start_date}
                                                onChange={handleInfoChange}
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">End Date</label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={basicInfo.end_date}
                                                onChange={handleInfoChange}
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Dynamic Steps */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                                    <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                                        <div className="p-2 bg-[#010080]/10 rounded-lg text-[#010080]">
                                            {steps[currentStep - 1].icon}
                                        </div>
                                        {steps[currentStep - 1].title}
                                    </h2>
                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full uppercase tracking-wider text-gray-500">
                                        Step {currentStep} of 4
                                    </span>
                                </div>

                                {/* STEP 1: WRITING */}
                                {currentStep === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Part A: Editing */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-[#010080]">Part A: Editing / Grammar Correction</h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{papers.paper1.editing.length} Questions</span>
                                            </div>

                                            {/* List of Added Questions */}
                                            <div className="space-y-3 mb-6">
                                                {papers.paper1.editing.map((item, i) => (
                                                    <div
                                                        key={item.id || i}
                                                        onClick={() => startEditing(item)}
                                                        className={`flex gap-4 items-start bg-white p-4 rounded-xl border shadow-sm group hover:border-[#010080]/30 transition-all cursor-pointer ${editingItemId === item.id ? 'ring-2 ring-[#010080] bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${editingItemId === item.id ? 'bg-[#010080] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-bold uppercase text-gray-400">Incorrect Sentence</label>
                                                                <div className="text-red-500 line-through font-medium">{item.text}</div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold uppercase text-gray-400">Correct Answer</label>
                                                                <div className="text-green-600 font-bold">{item.correction}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{item.points} pts</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeEditingItem(item.id); }}
                                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {papers.paper1.editing.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400 italic">
                                                        No grammar questions added yet.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add New Question Form */}
                                            <div className={`p-5 rounded-xl border transition-colors duration-300 ${editingItemId ? 'bg-orange-50 border-orange-200' : 'bg-blue-50/50 border-blue-100'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className={`text-xs font-bold uppercase mb-0 block ${editingItemId ? 'text-orange-700' : 'text-[#010080]'}`}>
                                                        {editingItemId ? 'Edit Grammar Question' : 'Add New Grammar Question'}
                                                    </label>
                                                    {editingItemId && (
                                                        <button
                                                            onClick={() => { setEditingItemId(null); setTempEditing({ text: "", correction: "", points: 2 }); }}
                                                            className="text-xs text-gray-500 underline hover:text-gray-700"
                                                        >
                                                            Cancel Edit
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <input
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#010080]/20 outline-none"
                                                        placeholder="Type the Incorrect Sentence (e.g. He go home)"
                                                        value={tempEditing.text}
                                                        onChange={(e) => setTempEditing({ ...tempEditing, text: e.target.value })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 p-3 border rounded-lg bg-green-50/50 focus:ring-2 focus:ring-green-500/20 outline-none"
                                                            placeholder="Type the Correct Sentence (e.g. He goes home)"
                                                            value={tempEditing.correction}
                                                            onChange={(e) => setTempEditing({ ...tempEditing, correction: e.target.value })}
                                                        />
                                                        <div className="w-24 relative">
                                                            <span className="absolute right-8 top-3.5 text-xs font-bold text-gray-400">pts</span>
                                                            <input
                                                                type="number" className="w-full p-3 border rounded-lg text-center font-bold"
                                                                value={tempEditing.points}
                                                                onChange={(e) => setTempEditing({ ...tempEditing, points: parseInt(e.target.value) })}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handleSaveEditingItem}
                                                            className={`px-6 py-2 text-white rounded-lg font-bold shadow-md flex items-center gap-2 whitespace-nowrap transition-colors ${editingItemId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#010080] hover:bg-blue-900'}`}
                                                        >
                                                            <span>{editingItemId ? 'Update' : '+ Add Question'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Part B: Essay */}
                                        <div>
                                            <h3 className="font-bold text-[#010080] mb-2">B. Essay Writing</h3>
                                            <textarea
                                                className="w-full p-4 border rounded-xl focus:ring-2 ring-blue-500/20 outline-none"
                                                rows="4"
                                                placeholder="Enter the essay prompt or topic..."
                                                value={papers.paper1.essay.prompt}
                                                onChange={(e) => setPapers(prev => ({ ...prev, paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, prompt: e.target.value } } }))}
                                            />
                                            <div className="mt-2 text-right">
                                                <label className="text-sm font-bold mr-2">Essay Points:</label>
                                                <input type="number" className="w-20 p-2 border rounded-lg text-center"
                                                    value={papers.paper1.essay.points}
                                                    onChange={(e) => setPapers(prev => ({ ...prev, paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, points: parseInt(e.target.value) || 0 } } }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: READING */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div>
                                            <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Reading Passage</label>
                                            <textarea
                                                className="w-full p-4 border rounded-xl bg-gray-50 min-h-[200px]"
                                                placeholder="Paste the passage here..."
                                                value={papers.paper2.passage}
                                                onChange={(e) => setPapers(prev => ({ ...prev, paper2: { ...prev.paper2, passage: e.target.value } }))}
                                            />
                                        </div>
                                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                            <h3 className="font-bold text-gray-800 mb-4">Add Comprehension Component</h3>
                                            <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <input
                                                    className="w-full font-semibold border-b pb-2 outline-none"
                                                    placeholder="Question?"
                                                    value={tempReadingQ.questionText}
                                                    onChange={(e) => setTempReadingQ({ ...tempReadingQ, questionText: e.target.value })}
                                                />
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                    {tempReadingQ.options.map((opt, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <input
                                                                type="radio"
                                                                name="correctReading"
                                                                checked={tempReadingQ.correctOption === idx}
                                                                onChange={() => setTempReadingQ({ ...tempReadingQ, correctOption: idx })}
                                                            />
                                                            <input
                                                                className="flex-1 text-sm p-1 border rounded"
                                                                placeholder={`Option ${idx + 1}`}
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const n = [...tempReadingQ.options];
                                                                    n[idx] = e.target.value;
                                                                    setTempReadingQ({ ...tempReadingQ, options: n });
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={addReadingItem} className="w-full py-2 bg-[#010080] text-white rounded-lg font-bold mt-2 text-sm hover:opacity-90">
                                                    + Add Question
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: LISTENING */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-purple-900">Audio Track</h3>
                                                <p className="text-xs text-purple-600">Upload the listening MP3 file.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {papers.paper3.audioUrl && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Uploaded</span>}
                                                <label className="cursor-pointer bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-purple-50">
                                                    {isUploading ? "Uploading..." : "Select File"}
                                                    <input type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h3 className="font-bold text-gray-800 mb-4">Listening Questions</h3>
                                            <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex justify-between">
                                                    <input
                                                        className="w-full font-semibold border-b pb-2 outline-none"
                                                        placeholder="Question?"
                                                        value={tempListeningQ.questionText}
                                                        onChange={(e) => setTempListeningQ({ ...tempListeningQ, questionText: e.target.value })}
                                                    />
                                                    <select
                                                        className="text-xs border rounded ml-2"
                                                        value={tempListeningQ.type}
                                                        onChange={(e) => setTempListeningQ({ ...tempListeningQ, type: e.target.value })}
                                                    >
                                                        <option value="mcq">MCQ</option>
                                                        <option value="true_false">True/False</option>
                                                        <option value="short_answer">Fill-in</option>
                                                    </select>
                                                </div>
                                                {/* Options Logic */}
                                                {(tempListeningQ.type === 'mcq' || tempListeningQ.type === 'true_false') && (
                                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                                        {(tempListeningQ.type === 'true_false' ? ['True', 'False'] : tempListeningQ.options).map((opt, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="correctListening"
                                                                    checked={tempListeningQ.correctOption === idx}
                                                                    onChange={() => setTempListeningQ({ ...tempListeningQ, correctOption: idx })}
                                                                />
                                                                <input
                                                                    className="flex-1 text-sm p-1 border rounded disabled:bg-gray-50"
                                                                    placeholder={`Option ${idx + 1}`}
                                                                    value={tempListeningQ.type === 'true_false' ? (idx === 0 ? "True" : "False") : opt}
                                                                    onChange={(e) => {
                                                                        if (tempListeningQ.type === 'true_false') return;
                                                                        const n = [...tempListeningQ.options];
                                                                        n[idx] = e.target.value;
                                                                        setTempListeningQ({ ...tempListeningQ, options: n });
                                                                    }}
                                                                    disabled={tempListeningQ.type === 'true_false'}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <button onClick={addListeningItem} className="w-full py-2 bg-[#010080] text-white rounded-lg font-bold mt-2 text-sm hover:opacity-90">
                                                    + Add To List
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: ORAL */}
                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                            <h3 className="font-bold text-orange-900 mb-2">Oral Examination</h3>
                                            <p className="text-sm text-orange-800 mb-4">Paste the passage below. Students will be prompted to record themselves reading it.</p>
                                            <textarea
                                                className="w-full p-4 border border-orange-200 rounded-xl bg-white shadow-sm h-48 focus:ring-2 ring-orange-200 outline-none"
                                                placeholder="Oral passage text..."
                                                value={papers.paper4.passage}
                                                onChange={(e) => setPapers(prev => ({ ...prev, paper4: { ...prev.paper4, passage: e.target.value } }))}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-4 mt-4">
                                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                                                <span className="text-xs font-bold uppercase text-gray-500">Max Time</span>
                                                <input
                                                    type="number"
                                                    className="w-16 bg-transparent font-bold text-center"
                                                    value={papers.paper4.timeLimit}
                                                    onChange={(e) => setPapers(prev => ({ ...prev, paper4: { ...prev.paper4, timeLimit: parseInt(e.target.value) } }))}
                                                />
                                                <span className="text-xs font-bold text-gray-500">mins</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg text-blue-900 border border-blue-200">
                                                <span className="text-xs font-bold uppercase text-blue-700">Total Marks</span>
                                                <input
                                                    type="number"
                                                    className="w-16 bg-transparent font-bold text-center border-b border-blue-300 focus:border-blue-500 outline-none"
                                                    value={papers.paper4.points}
                                                    onChange={(e) => setPapers(prev => ({ ...prev, paper4: { ...prev.paper4, points: parseInt(e.target.value) || 0 } }))}
                                                />
                                                <span className="text-xs font-bold text-blue-700">pts</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Footer */}
                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">

                                    {currentStep > 1 ? (
                                        <button onClick={() => setCurrentStep(c => c - 1)} className="px-6 py-2 rounded-lg border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">
                                            Previous Step
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {currentStep < 4 ? (
                                        <button onClick={() => setCurrentStep(c => c + 1)} className="px-8 py-2 rounded-lg bg-[#010080] text-white font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/20 transform transition hover:-translate-y-1">
                                            Next Part →
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmit} disabled={isCreating || isUpdating} className="px-8 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-900/20 transform transition hover:-translate-y-1">
                                            {isCreating || isUpdating ? "Saving..." : "Publish Exam"}
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* RIGHT COLUMN: OVERVIEW */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-4">
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm uppercase tracking-wider">Exam Overview</h3>

                                    {/* Paper Status Cards */}
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map(pId => {
                                            const count = pId === 1 ? papers.paper1.editing.length + (papers.paper1.essay.prompt ? 1 : 0)
                                                : pId === 2 ? papers.paper2.questions.length
                                                    : pId === 3 ? papers.paper3.questions.length
                                                        : papers.paper4.passage ? 1 : 0; // Oral only counts if active

                                            const isActive = currentStep === pId;

                                            return (
                                                <div
                                                    key={pId}
                                                    onClick={() => setCurrentStep(pId)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${isActive ? 'bg-[#010080]/5 border-[#010080] ring-1 ring-[#010080]' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-xs font-bold uppercase ${isActive ? 'text-[#010080]' : 'text-gray-500'}`}>Paper {pId}</span>
                                                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-mono">
                                                            {count} Items
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-[#010080] p-5 rounded-xl shadow-xl shadow-blue-900/20 text-white">
                                    <span className="text-[10px] uppercase tracking-widest text-blue-200 font-bold">Total Score</span>
                                    <div className="text-3xl font-bold mt-1">{calculateTotal()}</div>
                                    <div className="text-xs text-blue-200 mt-2 border-t border-blue-800 pt-2 flex justify-between">
                                        <span>Passing Score</span>
                                        <span>{Math.round(calculateTotal() * 0.5)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
