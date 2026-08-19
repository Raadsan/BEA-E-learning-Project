"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useCreateAssignmentMutation,
    useUpdateAssignmentMutation,
    useGetAssignmentsQuery
} from "@/lib/api/assignmentApi";
import { useGetTeacherClassesQuery } from "@/lib/api/teacherApi";
import { useUploadFileMutation } from "@/lib/api/uploadApi";

import { useToast } from "@/components/Toast";
import RichTextEditor from "@/components/assessments/RichTextEditor";
import {
    formatDatetimeLocalValue,
    syncAssignmentSchedule,
    splitDurationMinutes
} from "@/utils/assignmentSchedule";
import { useDarkMode } from "@/context/ThemeContext";
import { v4 as uuidv4 } from "uuid";
import SectionMetadataFields, { defaultSectionMeta } from "@/components/admin/assessments/SectionMetadataFields";

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

export default function CreateExamPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const { showToast } = useToast();
    const { isDark } = useDarkMode();

    const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    // Queries
    const { data: classes } = useGetTeacherClassesQuery();

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        instructions: "",
        start_date: "",
        end_date: "",
        class_id: "",
        program_id: "",
        subprogram_id: "", // Level
        total_points: 100,
        status: "active",
        duration: 60,
        duration_hours: 1,
        duration_minutes: 0,
    });

    // Derived Data for Cascading Dropdowns
    const uniquePrograms = useMemo(() => {
        if (!classes) return [];
        const programsMap = new Map();
        classes.forEach(c => {
            const pId = c.program_id || c.subprograms?.program_id;
            const pName = c.program_name || c.subprograms?.programs?.title;
            if (pId && pName) {
                programsMap.set(pId, { id: pId, title: pName });
            }
        });
        return Array.from(programsMap.values());
    }, [classes]);

    const filteredSubprograms = useMemo(() => {
        if (!classes || !basicInfo.program_id) return [];
        const subprogramsMap = new Map();
        classes.forEach(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            const spName = c.subprogram_name || c.subprograms?.subprogram_name;
            const pId = c.program_id || c.subprograms?.program_id;
            if (pId == basicInfo.program_id && spId && spName) {
                subprogramsMap.set(spId, { id: spId, title: spName });
            }
        });
        return Array.from(subprogramsMap.values());
    }, [classes, basicInfo.program_id]);

    const filteredClasses = useMemo(() => {
        if (!classes || !basicInfo.subprogram_id) return [];
        return classes.filter(c => {
            const spId = c.subprogram_id || c.subprograms?.id;
            return spId == basicInfo.subprogram_id;
        });
    }, [classes, basicInfo.subprogram_id]);

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
            instructions: "Answer the grammar editing questions and complete the essay prompt.",
            sectionMeta: {
                sectionName: "Paper 1: Writing & Grammar",
                questions: 6,
                format: "Grammar MCQs & Essay",
                marks: 30,
                targetScore: "24/30",
                skillsAssessed: "Grammar, Sentence Structure, Written Expression",
                instructions: "Answer all grammar editing questions and complete the essay prompt."
            },
            editing: [] as any[], // { id, text, options, correctOption, correction, points }
            essay: { id: uuidv4(), prompt: "", points: 20, wordCount: 300 }
        },
        paper2: {
            title: "Comprehension/Reading [Paper 2]",
            instructions: "Read the passage carefully and answer the comprehension questions below.",
            sectionMeta: {
                sectionName: "Paper 2: Reading Comprehension",
                questions: 5,
                format: "Reading Passage & Questions",
                marks: 25,
                targetScore: "20/25",
                skillsAssessed: "Reading comprehension, inference, vocabulary in context",
                instructions: "Read the passage carefully and answer the comprehension questions below."
            },
            passage: "",
            questions: [] as any[] // { id, type, questionText, options, correctOption, points }
        },
        paper3: {
            title: "Listening [Paper 3]",
            instructions: "Listen to the audio recording and answer the questions below.",
            sectionMeta: {
                sectionName: "Paper 3: Listening Comprehension",
                questions: 5,
                format: "Audio Track & MCQs",
                marks: 25,
                targetScore: "20/25",
                skillsAssessed: "Listening comprehension, detail extraction, spoken context",
                instructions: "Listen carefully to the audio recording and answer all listening questions."
            },
            audioFile: null as any,
            audioUrl: "",
            questions: [] as any[]
        },
        paper4: {
            title: "Oral/Speaking [Paper 4]",
            instructions: "Record your voice reading this passage clearly.",
            sectionMeta: {
                sectionName: "Paper 4: Oral Reading / Speaking",
                questions: 1,
                format: "Voice Recording / Oral Passage",
                marks: 20,
                targetScore: "16/20",
                skillsAssessed: "Pronunciation, fluency, intonation, clarity",
                instructions: "Read the oral passage aloud clearly and submit your voice recording."
            },
            passage: "",
            timeLimit: 10, // Minutes
            points: "" as number | "" // Teacher enters the oral marks
        }
    });

    // Temporary Inputs (Buffer before adding to list)
    const emptyEditingQuestion = () => ({
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
        points: 2,
    });
    const [tempEditing, setTempEditing] = useState(emptyEditingQuestion());
    const [editingItemId, setEditingItemId] = useState(null); // Track which item is being edited
    const [tempReadingQ, setTempReadingQ] = useState({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, correctAnswer: '', points: 2 });
    const [tempListeningQ, setTempListeningQ] = useState({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, correctAnswer: '', points: 2 });
    const [editingReadingId, setEditingReadingId] = useState(null);
    const [editingListeningId, setEditingListeningId] = useState(null);

    // Fetch existing if editing
    const { data: assignments } = useGetAssignmentsQuery({ type: 'exam' }, { skip: !editId });
    const editingAssignment = assignments?.find(a => a.id === parseInt(editId));

    useEffect(() => {
        if (editingAssignment) {
            setBasicInfo({
                title: editingAssignment.title,
                description: editingAssignment.description,
                instructions: editingAssignment.instructions || "",
                start_date: editingAssignment.start_date ? formatDatetimeLocalValue(new Date(editingAssignment.start_date)) : "",
                end_date: editingAssignment.end_date ? formatDatetimeLocalValue(new Date(editingAssignment.end_date))
                    : editingAssignment.due_date ? formatDatetimeLocalValue(new Date(editingAssignment.due_date)) : "",
                class_id: editingAssignment.class_id,
                program_id: editingAssignment.program_id,
                subprogram_id: editingAssignment.subprogram_id || "",
                total_points: editingAssignment.total_points,
                status: editingAssignment.status || "active",
                duration: editingAssignment.duration || 60,
                duration_hours: splitDurationMinutes(editingAssignment.duration || 60).hours,
                duration_minutes: splitDurationMinutes(editingAssignment.duration || 60).minutes,
            });
            if (editingAssignment.questions) {
                try {
                    const parsed = typeof editingAssignment.questions === 'string'
                        ? JSON.parse(editingAssignment.questions)
                        : editingAssignment.questions;
                    if (parsed.paper1 || parsed.paper2) {
                        setPapers(prev => ({
                            paper1: {
                                ...prev.paper1,
                                ...(parsed.paper1 || {}),
                                sectionMeta: parsed.paper1?.sectionMeta || {
                                    ...prev.paper1.sectionMeta,
                                    sectionName: parsed.paper1?.title || prev.paper1.sectionMeta.sectionName,
                                    instructions: parsed.paper1?.instructions || prev.paper1.sectionMeta.instructions,
                                },
                            },
                            paper2: {
                                ...prev.paper2,
                                ...(parsed.paper2 || {}),
                                sectionMeta: parsed.paper2?.sectionMeta || {
                                    ...prev.paper2.sectionMeta,
                                    sectionName: parsed.paper2?.title || prev.paper2.sectionMeta.sectionName,
                                    instructions: parsed.paper2?.instructions || prev.paper2.sectionMeta.instructions,
                                },
                            },
                            paper3: {
                                ...prev.paper3,
                                ...(parsed.paper3 || {}),
                                sectionMeta: parsed.paper3?.sectionMeta || {
                                    ...prev.paper3.sectionMeta,
                                    sectionName: parsed.paper3?.title || prev.paper3.sectionMeta.sectionName,
                                    instructions: parsed.paper3?.instructions || prev.paper3.sectionMeta.instructions,
                                },
                            },
                            paper4: {
                                ...prev.paper4,
                                ...(parsed.paper4 || {}),
                                sectionMeta: parsed.paper4?.sectionMeta || {
                                    ...prev.paper4.sectionMeta,
                                    sectionName: parsed.paper4?.title || prev.paper4.sectionMeta.sectionName,
                                    instructions: parsed.paper4?.instructions || prev.paper4.sectionMeta.instructions,
                                },
                            },
                        }));
                    }
                } catch (e) {
                    console.error("Failed to parse existing questions", e);
                }
            }
        }
    }, [editingAssignment]);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;

        if (["start_date", "end_date", "duration", "duration_hours", "duration_minutes"].includes(name)) {
            setBasicInfo((prev) => syncAssignmentSchedule(prev, name, value, "end_date") as typeof prev);
            return;
        }

        if (name === 'program_id') {
            setBasicInfo(prev => ({ ...prev, program_id: value, subprogram_id: "", class_id: "" }));
        } else if (name === 'subprogram_id') {
            setBasicInfo(prev => ({ ...prev, subprogram_id: value, class_id: "" }));
        } else {
            setBasicInfo(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Actions ---

    const buildEditingPayload = () => ({
        ...tempEditing,
        correction: tempEditing.options[tempEditing.correctOption] || "",
    });

    const handleSaveEditingItem = () => {
        if (!tempEditing.text?.trim()) return showToast("Question text is required", "error");
        if (tempEditing.options.some((opt) => !String(opt || "").trim())) {
            return showToast("Please fill all 4 options (A, B, C, D)", "error");
        }

        const payload = buildEditingPayload();

        if (editingItemId) {
            setPapers(prev => ({
                ...prev,
                paper1: {
                    ...prev.paper1,
                    editing: prev.paper1.editing.map(item =>
                        item.id === editingItemId ? { ...payload, id: editingItemId } : item
                    )
                }
            }));
            setEditingItemId(null);
            showToast("Question updated", "success");
        } else {
            setPapers(prev => ({
                ...prev,
                paper1: {
                    ...prev.paper1,
                    editing: [...prev.paper1.editing, { ...payload, id: uuidv4() }]
                }
            }));
            showToast("Question added", "success");
        }
        setTempEditing(emptyEditingQuestion());
    };

    const startEditing = (item) => {
        if (item.options?.length) {
            setTempEditing({
                text: item.text || "",
                options: [...item.options],
                correctOption: item.correctOption ?? 0,
                points: item.points ?? 2,
            });
        } else {
            const options = ["", "", "", ""];
            if (item.correction) options[0] = item.correction;
            setTempEditing({
                text: item.text || "",
                options,
                correctOption: 0,
                points: item.points ?? 2,
            });
        }
        setEditingItemId(item.id);
    };

    const handleEditingOptionChange = (index, value) => {
        const options = [...tempEditing.options];
        options[index] = value;
        setTempEditing({ ...tempEditing, options });
    };

    const removeEditingItem = (id) => {
        setPapers(prev => ({
            ...prev,
            paper1: { ...prev.paper1, editing: prev.paper1.editing.filter(x => x.id !== id) }
        }));
    };

    const addReadingItem = () => {
        if (!tempReadingQ.questionText.trim()) return showToast("Question text is required", "error");
        setPapers(prev => ({ ...prev, paper2: { ...prev.paper2, questions: editingReadingId
            ? prev.paper2.questions.map(q => q.id === editingReadingId ? { ...tempReadingQ, id: editingReadingId } : q)
            : [...prev.paper2.questions, { ...tempReadingQ, id: uuidv4() }] } }));
        showToast(editingReadingId ? "Reading question updated" : "Reading question added", "success");
        setEditingReadingId(null);
        setTempReadingQ({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, correctAnswer: '', points: 2 });
    };

    const editReadingItem = (question) => {
        setEditingReadingId(question.id);
        setTempReadingQ({ type: question.type || 'mcq', questionText: question.questionText || "", options: [...(question.options || ["", "", "", ""])], correctOption: question.correctOption ?? 0, correctAnswer: question.correctAnswer || '', points: Number(question.points) || 1 });
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
            const message =
                err?.data?.error ||
                err?.error ||
                (typeof err?.status === "number" ? `Upload failed (${err.status})` : "Upload failed");
            console.error("Audio upload failed:", message, err);
            showToast(message, "error");
        } finally {
            e.target.value = "";
        }
    };

    const addListeningItem = () => {
        if (!tempListeningQ.questionText.trim()) return showToast("Question text is required", "error");
        setPapers(prev => ({ ...prev, paper3: { ...prev.paper3, questions: editingListeningId
            ? prev.paper3.questions.map(q => q.id === editingListeningId ? { ...tempListeningQ, id: editingListeningId } : q)
            : [...prev.paper3.questions, { ...tempListeningQ, id: uuidv4() }] } }));
        showToast(editingListeningId ? "Listening question updated" : "Listening question added", "success");
        setEditingListeningId(null);
        setTempListeningQ({ type: 'mcq', questionText: "", options: ["", "", "", ""], correctOption: 0, correctAnswer: '', points: 2 });
    };

    const editListeningItem = (question) => {
        setEditingListeningId(question.id);
        setTempListeningQ({ type: question.type || 'mcq', questionText: question.questionText || "", options: [...(question.options || ["", "", "", ""])], correctOption: question.correctOption ?? 0, correctAnswer: question.correctAnswer || '', points: Number(question.points) || 1 });
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
        total += papers.paper1.editing.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
        // Only count essay points if prompt is set
        if (papers.paper1.essay.prompt) {
            total += Number(papers.paper1.essay.points) || 0;
        }

        // P2
        total += papers.paper2.questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
        // P3
        total += papers.paper3.questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
        // P4 - Count only when the oral section has been configured
        if (papers.paper4.passage?.trim()) {
            total += Number(papers.paper4.points) || 0;
        }

        return total;
    };

    const handleSaveDraft = async () => {
        if (!basicInfo.title || !basicInfo.program_id) {
            showToast("Title and Program are required to save a draft.", "error");
            return;
        }

        const payload = {
            ...(() => {
                const { duration_hours, duration_minutes, ...rest } = basicInfo;
                return rest;
            })(),
            type: 'exam',
            status: 'draft',
            questions: JSON.stringify(papers),
            total_points: calculateTotal()
        };

        try {
            if (editId) {
                await updateAssignment({ id: editId, ...payload }).unwrap();
                showToast("Draft updated successfully!", "success");
            } else {
                await createAssignment(payload).unwrap();
                showToast("Draft saved successfully!", "success");
            }
            router.push("/portal/teacher/exams");
        } catch (err) {
            showToast("Failed to save draft.", "error");
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        if (!basicInfo.title || !basicInfo.program_id) {
            showToast("Title and Program are required.", "error");
            return;
        }

        if (papers.paper4.passage?.trim() && Number(papers.paper4.points) <= 0) {
            showToast("Enter the marks for Part 4 Oral before publishing.", "error");
            setCurrentStep(4);
            return;
        }

        const payload = {
            ...(() => {
                const { duration_hours, duration_minutes, ...rest } = basicInfo;
                return rest;
            })(),
            type: 'exam',
            status: 'active', // Ensure it's active when publishing
            questions: JSON.stringify(papers),
            total_points: calculateTotal()
        };

        try {
            if (editId) {
                await updateAssignment({ id: editId, ...payload }).unwrap();
                showToast("Exam published successfully!", "success");
            } else {
                await createAssignment(payload).unwrap();
                showToast("Exam published successfully!", "success");
            }
            router.push("/portal/teacher/exams");
        } catch (err) {
            showToast("Failed to publish exam.", "error");
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
                <div className="flex justify-between items-center mb-10 w-full px-4 lg:px-8">
                    <div>
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-[#010080] mb-2 flex items-center gap-2 text-sm font-semibold transition-colors">
                            ← Back to Exams
                        </button>
                        <h1 className="text-3xl font-bold text-[#010080] dark:text-blue-400">Create Exam</h1>
                        <p className="text-gray-500 mt-1">Setup the 4-part Standard Assessment</p>
                    </div>
                </div>

                <div className="w-full px-4 lg:px-8 pb-10">
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
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Program & Level</label>
                                        <div className="flex gap-2">
                                            <select
                                                name="program_id"
                                                value={basicInfo.program_id}
                                                onChange={handleInfoChange}
                                                className="flex-1 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                            >
                                                <option value="">Select Program...</option>
                                                {uniquePrograms?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                            <select
                                                name="subprogram_id"
                                                value={basicInfo.subprogram_id}
                                                onChange={handleInfoChange}
                                                className="flex-1 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                                disabled={!basicInfo.program_id}
                                            >
                                                <option value="">Select Level...</option>
                                                {filteredSubprograms?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                            </select>
                                            {basicInfo.subprogram_id && (
                                                <select
                                                    name="class_id"
                                                    value={basicInfo.class_id}
                                                    onChange={handleInfoChange}
                                                    className="flex-1 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                                                >
                                                    <option value="">Select Class (optional)...</option>
                                                    {filteredClasses.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.class_name || c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                name="start_date"
                                                value={basicInfo.start_date}
                                                onChange={handleInfoChange}
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#010080]/20 outline-none"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">End Date / Due Date</label>
                                            <input
                                                type="datetime-local"
                                                name="end_date"
                                                value={basicInfo.end_date}
                                                onChange={handleInfoChange}
                                                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#010080]/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                                            Duration (Hours & Minutes)
                                            <span className="font-normal normal-case text-gray-400"> — auto-filled from start/end</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 max-w-md">
                                            <input
                                                type="number"
                                                name="duration_hours"
                                                placeholder="Hours"
                                                value={basicInfo.duration_hours ?? ""}
                                                readOnly
                                                className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 cursor-not-allowed"
                                            />
                                            <input
                                                type="number"
                                                name="duration_minutes"
                                                placeholder="Minutes"
                                                value={basicInfo.duration_minutes ?? ""}
                                                readOnly
                                                className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                                            Exam Instructions
                                            <span className="font-normal normal-case text-gray-400"> — shown to students before starting</span>
                                        </label>
                                        <textarea
                                            name="instructions"
                                            value={basicInfo.instructions}
                                            onChange={handleInfoChange}
                                            rows={4}
                                            placeholder="e.g. Read all questions carefully before answering. You have 2 hours to complete this exam. No external materials allowed."
                                            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#010080]/20 outline-none resize-none"
                                        />
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
                                        <SectionMetadataFields
                                            value={papers.paper1.sectionMeta}
                                            currentCount={papers.paper1.editing.length + (papers.paper1.essay?.prompt ? 1 : 0)}
                                            showInstructionsField={true}
                                            onChange={(val) => setPapers(prev => ({
                                                ...prev,
                                                paper1: {
                                                    ...prev.paper1,
                                                    instructions: val.instructions || prev.paper1.instructions,
                                                    sectionMeta: val
                                                }
                                            }))}
                                        />

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
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                                                                <span className="font-bold text-[#010080] mr-1">{i + 1}:</span>
                                                                {item.text}
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {(item.options?.length ? item.options : [item.correction]).filter(Boolean).map((opt, optIdx) => {
                                                                    const labels = ["A", "B", "C", "D"];
                                                                    const isCorrect = item.options?.length
                                                                        ? optIdx === item.correctOption
                                                                        : optIdx === 0;
                                                                    return (
                                                                        <div
                                                                            key={optIdx}
                                                                            className={`text-xs px-3 py-2 rounded-lg border ${isCorrect ? "bg-green-50 border-green-300 text-green-800 font-semibold" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                                                                        >
                                                                            <span className="font-bold mr-1">{labels[optIdx] || optIdx + 1}.</span>
                                                                            {opt}
                                                                            {isCorrect && <span className="ml-1 text-[10px]">✓</span>}
                                                                        </div>
                                                                    );
                                                                })}
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
                                                            onClick={() => { setEditingItemId(null); setTempEditing(emptyEditingQuestion()); }}
                                                            className="text-xs text-gray-500 underline hover:text-gray-700"
                                                        >
                                                            Cancel Edit
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <input
                                                        className="w-full font-semibold border-b pb-2 outline-none"
                                                        placeholder="Type the question / sentence (e.g. He go home every day)"
                                                        value={tempEditing.text}
                                                        onChange={(e) => setTempEditing({ ...tempEditing, text: e.target.value })}
                                                    />
                                                    <div className="space-y-2 mt-2">
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Select the correct answer ↓</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {tempEditing.options.map((opt, idx) => {
                                                                const labels = ["A", "B", "C", "D"];
                                                                return (
                                                                    <label
                                                                        key={idx}
                                                                        className={`flex gap-2 items-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${tempEditing.correctOption === idx ? "bg-green-50 border-green-400 ring-1 ring-green-300" : "border-gray-200 hover:bg-gray-50"}`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name="correctEditing"
                                                                            checked={tempEditing.correctOption === idx}
                                                                            onChange={() => setTempEditing({ ...tempEditing, correctOption: idx })}
                                                                            className="accent-green-600"
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-500 shrink-0 w-6">{labels[idx]}.</span>
                                                                        <input
                                                                            className="flex-1 text-sm outline-none bg-transparent min-w-0"
                                                                            placeholder="Enter answer choice"
                                                                            value={opt}
                                                                            onChange={(e) => handleEditingOptionChange(idx, e.target.value)}
                                                                        />
                                                                        {tempEditing.correctOption === idx && (
                                                                            <span className="text-[10px] font-bold text-green-600 shrink-0">✓ Correct</span>
                                                                        )}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 justify-between mt-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-500">Points:</span>
                                                            <input
                                                                type="number"
                                                                className="w-16 p-1 border rounded text-center text-sm font-bold"
                                                                value={tempEditing.points}
                                                                onChange={(e) => setTempEditing({ ...tempEditing, points: parseInt(e.target.value) || 1 })}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={handleSaveEditingItem}
                                                            className={`py-2 px-6 text-white rounded-lg font-bold text-sm transition-colors ${editingItemId ? "bg-orange-600 hover:bg-orange-700" : "bg-[#010080] hover:opacity-90"}`}
                                                        >
                                                            {editingItemId ? "Update Question" : "+ Add Question"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Part B: Essay */}
                                        <div>
                                            <h3 className="font-bold text-[#010080] mb-2">
                                                B. Essay Writing
                                                {papers.paper1.essay.prompt && (
                                                    <span className="ml-2 text-sm font-bold text-gray-500">
                                                        ({papers.paper1.editing.length + 1}: Essay)
                                                    </span>
                                                )}
                                            </h3>
                                            <textarea
                                                className="w-full p-4 border rounded-xl focus:ring-2 ring-blue-500/20 outline-none"
                                                rows={4}
                                                placeholder="Enter the essay prompt or topic..."
                                                value={papers.paper1.essay.prompt}
                                                onChange={(e) => setPapers(prev => ({ ...prev, paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, prompt: e.target.value } } }))}
                                            />
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <label className="text-sm font-bold">Word Count:</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="w-24 p-2 border rounded-lg text-center font-bold"
                                                        value={papers.paper1.essay.wordCount ?? 300}
                                                        onChange={(e) => setPapers(prev => ({
                                                            ...prev,
                                                            paper1: {
                                                                ...prev.paper1,
                                                                essay: {
                                                                    ...prev.paper1.essay,
                                                                    wordCount: Math.max(1, parseInt(e.target.value, 10) || 1)
                                                                }
                                                            }
                                                        }))}
                                                        onBlur={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!val || val < 1) {
                                                                setPapers(prev => ({
                                                                    ...prev,
                                                                    paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, wordCount: 300 } }
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-500">words</span>
                                                    <span className="text-xs text-gray-400 hidden sm:inline">| Quick:</span>
                                                    {[200, 300, 500].map((count) => (
                                                        <button
                                                            key={count}
                                                            type="button"
                                                            onClick={() => setPapers(prev => ({
                                                                ...prev,
                                                                paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, wordCount: count } }
                                                            }))}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${(papers.paper1.essay.wordCount || 300) === count
                                                                ? "bg-[#010080] text-white border-[#010080]"
                                                                : "bg-white text-gray-600 border-gray-200 hover:border-[#010080]/40"
                                                                }`}
                                                        >
                                                            {count}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold mr-2">Essay Points:</label>
                                                    <input type="number" className="w-20 p-2 border rounded-lg text-center"
                                                        value={papers.paper1.essay.points}
                                                        onChange={(e) => setPapers(prev => ({ ...prev, paper1: { ...prev.paper1, essay: { ...prev.paper1.essay, points: parseInt(e.target.value) || 0 } } }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: READING */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SectionMetadataFields
                                            value={papers.paper2.sectionMeta}
                                            currentCount={papers.paper2.questions.length}
                                            showInstructionsField={true}
                                            onChange={(val) => setPapers(prev => ({
                                                ...prev,
                                                paper2: {
                                                    ...prev.paper2,
                                                    instructions: val.instructions || prev.paper2.instructions,
                                                    sectionMeta: val
                                                }
                                            }))}
                                        />

                                        <div>
                                            <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Reading Passage</label>
                                            <RichTextEditor value={papers.paper2.passage} onChange={(passage) => setPapers(prev => ({ ...prev, paper2: { ...prev.paper2, passage } }))} placeholder="Paste the passage here..." minHeight={220} />
                                        </div>
                                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                            <h3 className="font-bold text-gray-800 mb-4">Add Comprehension Question</h3>
                                            <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex justify-between items-start gap-2">
                                                    <input
                                                        className="flex-1 font-semibold border-b pb-2 outline-none"
                                                        placeholder="Question text?"
                                                        value={tempReadingQ.questionText}
                                                        onChange={(e) => setTempReadingQ({ ...tempReadingQ, questionText: e.target.value })}
                                                    />
                                                    <select
                                                        className="text-xs border rounded px-2 py-1 bg-gray-50 shrink-0"
                                                        value={tempReadingQ.type}
                                                        onChange={(e) => setTempReadingQ({ ...tempReadingQ, type: e.target.value, correctOption: 0, correctAnswer: '' })}
                                                    >
                                                        <option value="mcq">MCQ</option>
                                                        <option value="true_false">True / False</option>
                                                        <option value="short_answer">Fill-in</option>
                                                    </select>
                                                </div>
                                                {(tempReadingQ.type === 'mcq' || tempReadingQ.type === 'true_false') && (
                                                    <div className="space-y-2 mt-2">
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Select the correct answer ↓</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {(tempReadingQ.type === 'true_false' ? ['True', 'False'] : tempReadingQ.options).map((opt, idx) => (
                                                                <label key={idx} className={`flex gap-2 items-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${tempReadingQ.correctOption === idx ? 'bg-green-50 border-green-400 ring-1 ring-green-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name="correctReading"
                                                                        checked={tempReadingQ.correctOption === idx}
                                                                        onChange={() => setTempReadingQ({ ...tempReadingQ, correctOption: idx })}
                                                                        className="accent-green-600"
                                                                    />
                                                                    {tempReadingQ.type === 'true_false' ? (
                                                                        <span className={`font-bold text-sm ${tempReadingQ.correctOption === idx ? 'text-green-700' : 'text-gray-600'}`}>{opt}</span>
                                                                    ) : (
                                                                        <input
                                                                            className="flex-1 text-sm outline-none bg-transparent"
                                                                            placeholder={`Option ${idx + 1}`}
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const n = [...tempReadingQ.options];
                                                                                n[idx] = e.target.value;
                                                                                setTempReadingQ({ ...tempReadingQ, options: n });
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {tempReadingQ.correctOption === idx && <span className="text-[10px] font-bold text-green-600 shrink-0">✓ Correct</span>}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {tempReadingQ.type === 'short_answer' && (
                                                    <div className="mt-2">
                                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Correct Answer</label>
                                                        <input
                                                            className="w-full text-sm p-2 border rounded-lg bg-green-50 border-green-200"
                                                            placeholder="Type the correct answer..."
                                                            value={tempReadingQ.correctAnswer || ''}
                                                            onChange={(e) => setTempReadingQ({ ...tempReadingQ, correctAnswer: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-500">Points:</span>
                                                        <input
                                                            type="number"
                                                            className="w-16 p-1 border rounded text-center text-sm font-bold"
                                                            value={tempReadingQ.points}
                                                            onChange={(e) => setTempReadingQ({ ...tempReadingQ, points: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                    <button onClick={addReadingItem} className="py-2 px-6 bg-[#010080] text-white rounded-lg font-bold text-sm hover:opacity-90">
                                                        {editingReadingId ? "Update Question" : "+ Add Question"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {papers.paper2.questions.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold uppercase text-gray-400">Added Questions ({papers.paper2.questions.length})</p>
                                                {papers.paper2.questions.map((q, i) => (
                                                    <div key={q.id} className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-800 flex-1">
                                                            <span className="font-bold text-[#010080] mr-1">{i + 1}:</span>
                                                            {q.questionText}
                                                        </p>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{Number(q.points) || 0} pts</span>
                                                            <button type="button" onClick={() => editReadingItem(q)} className="text-gray-400 hover:text-blue-600" title="Edit question"><PencilSquareIcon className="w-4 h-4" /></button>
                                                            <button type="button" onClick={() => removeReadingItem(q.id)} className="text-gray-400 hover:text-red-500" title="Delete question"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3: LISTENING */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SectionMetadataFields
                                            value={papers.paper3.sectionMeta}
                                            currentCount={papers.paper3.questions.length}
                                            showInstructionsField={true}
                                            onChange={(val) => setPapers(prev => ({
                                                ...prev,
                                                paper3: {
                                                    ...prev.paper3,
                                                    instructions: val.instructions || prev.paper3.instructions,
                                                    sectionMeta: val
                                                }
                                            }))}
                                        />

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
                                                {/* Question text + type selector */}
                                                <div className="flex justify-between items-start gap-2">
                                                    <input
                                                        className="flex-1 font-semibold border-b pb-2 outline-none"
                                                        placeholder="Question?"
                                                        value={tempListeningQ.questionText}
                                                        onChange={(e) => setTempListeningQ({ ...tempListeningQ, questionText: e.target.value })}
                                                    />
                                                    <select
                                                        className="text-xs border rounded px-2 py-1 bg-gray-50 shrink-0"
                                                        value={tempListeningQ.type}
                                                        onChange={(e) => setTempListeningQ({ ...tempListeningQ, type: e.target.value, correctOption: 0, correctAnswer: '' })}
                                                    >
                                                        <option value="mcq">MCQ</option>
                                                        <option value="true_false">True / False</option>
                                                        <option value="short_answer">Fill-in</option>
                                                    </select>
                                                </div>

                                                {/* MCQ / True-False options */}
                                                {(tempListeningQ.type === 'mcq' || tempListeningQ.type === 'true_false') && (
                                                    <div className="space-y-2 mt-2">
                                                        <p className="text-[10px] font-bold uppercase text-gray-400">Select the correct answer ↓</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {(tempListeningQ.type === 'true_false' ? ['True', 'False'] : tempListeningQ.options).map((opt, idx) => (
                                                                <label key={idx} className={`flex gap-2 items-center px-3 py-2 rounded-lg border cursor-pointer transition-all ${tempListeningQ.correctOption === idx ? 'bg-green-50 border-green-400 ring-1 ring-green-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name="correctListening"
                                                                        checked={tempListeningQ.correctOption === idx}
                                                                        onChange={() => setTempListeningQ({ ...tempListeningQ, correctOption: idx })}
                                                                        className="accent-green-600"
                                                                    />
                                                                    {tempListeningQ.type === 'true_false' ? (
                                                                        <span className={`font-bold text-sm ${tempListeningQ.correctOption === idx ? 'text-green-700' : 'text-gray-600'}`}>{opt}</span>
                                                                    ) : (
                                                                        <input
                                                                            className="flex-1 text-sm outline-none bg-transparent"
                                                                            placeholder={`Option ${idx + 1}`}
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const n = [...tempListeningQ.options];
                                                                                n[idx] = e.target.value;
                                                                                setTempListeningQ({ ...tempListeningQ, options: n });
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {tempListeningQ.correctOption === idx && <span className="text-[10px] font-bold text-green-600 shrink-0">✓ Correct</span>}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Short answer correct answer */}
                                                {tempListeningQ.type === 'short_answer' && (
                                                    <div className="mt-2">
                                                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Correct Answer</label>
                                                        <input
                                                            className="w-full text-sm p-2 border rounded-lg bg-green-50 border-green-200"
                                                            placeholder="Type the correct answer..."
                                                            value={tempListeningQ.correctAnswer || ''}
                                                            onChange={(e) => setTempListeningQ({ ...tempListeningQ, correctAnswer: e.target.value })}
                                                        />
                                                    </div>
                                                )}

                                                {/* Points + Add button */}
                                                <div className="flex items-center gap-2 justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-500">Points:</span>
                                                        <input
                                                            type="number"
                                                            className="w-16 p-1 border rounded text-center text-sm font-bold"
                                                            value={tempListeningQ.points}
                                                            onChange={(e) => setTempListeningQ({ ...tempListeningQ, points: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                    <button onClick={addListeningItem} className="py-2 px-6 bg-[#010080] text-white rounded-lg font-bold text-sm hover:opacity-90">
                                                        {editingListeningId ? "Update Question" : "+ Add Question"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Added questions list */}
                                        {papers.paper3.questions.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold uppercase text-gray-400">Added Questions ({papers.paper3.questions.length})</p>
                                                {papers.paper3.questions.map((q, i) => (
                                                    <div key={q.id} className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-800 flex-1">
                                                            <span className="font-bold text-[#010080] mr-1">{i + 1}:</span>
                                                            {q.questionText}
                                                        </p>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{Number(q.points) || 0} pts</span>
<button type="button" onClick={() => editListeningItem(q)} className="text-gray-400 hover:text-blue-600" title="Edit question"><PencilSquareIcon className="w-4 h-4" /></button>
                                                                                                                        <button
                                                                type="button"
                                                                onClick={() => removeListeningItem(q.id)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: ORAL */}
                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SectionMetadataFields
                                            value={papers.paper4.sectionMeta}
                                            currentCount={papers.paper4.passage?.trim() ? 1 : 0}
                                            showInstructionsField={true}
                                            onChange={(val) => setPapers(prev => ({
                                                ...prev,
                                                paper4: {
                                                    ...prev.paper4,
                                                    instructions: val.instructions || prev.paper4.instructions,
                                                    sectionMeta: val
                                                }
                                            }))}
                                        />

                                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                            <h3 className="font-bold text-orange-900 mb-2">Oral Examination</h3>
                                            <p className="text-sm text-orange-800 mb-4">Paste the passage below. Students will be prompted to record themselves reading it.</p>
                                            <RichTextEditor value={papers.paper4.passage} onChange={(passage) => setPapers(prev => ({ ...prev, paper4: { ...prev.paper4, passage } }))} placeholder="Oral passage text..." minHeight={190} />
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
                                                    className="w-24 bg-transparent font-bold text-center border-b border-blue-300 focus:border-blue-500 outline-none"
                                                    min="1"
                                                    step="1"
                                                    placeholder="Enter marks"
                                                    value={papers.paper4.points}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value)) setPapers(prev => ({ ...prev, paper4: { ...prev.paper4, points: value === "" ? ("" as const) : Number(value) } }));
                                                    }}
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

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {/* <button
                                        onClick={handleSaveDraft}
                                        disabled={isCreating || isUpdating}
                                        className="w-full py-3 px-4 bg-white dark:bg-gray-800 text-[#010080] dark:text-blue-400 border-2 border-[#010080] dark:border-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                        Save to Draft
                                    </button> */}

                                    <button
                    onClick={handleSaveDraft}
                    disabled={isCreating || isUpdating}
                    className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-amber-200/50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {isCreating || isUpdating ? 'Saving...' : 'Save to Draft'}
                  </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isCreating || isUpdating}
                                        className="w-full py-3 px-4 bg-[#010080] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Publish Exam
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
