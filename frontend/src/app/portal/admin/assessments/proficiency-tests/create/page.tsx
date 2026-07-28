"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    useCreateProficiencyTestMutation,
    useGetProficiencyTestByIdQuery,
    useUpdateProficiencyTestMutation
} from "@/lib/api/proficiencyTestApi";
import { useUploadFileMutation } from "@/lib/api/uploadApi";
import { resolveMediaUrl } from "@/constants";

import { useToast } from "@/components/Toast";
import { v4 as uuidv4 } from "uuid";
import { useDarkMode } from "@/context/ThemeContext";
import PassageSubQuestionsEditor from "@/components/admin/assessments/PassageSubQuestionsEditor";
import SectionMetadataFields, { attachSectionMetadata, defaultSectionMeta } from "@/components/admin/assessments/SectionMetadataFields";
import {
    ensureQuestionNumbers,
    formatQuestionLabel,
    renumberQuestionsByPart,
    sortByQuestionNumber,
} from "@/utils/testQuestions";

const PROFICIENCY_MAX_PART = 5;


export default function CreateProficiencyTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get('id');
    const { showToast } = useToast();
    const { isDark } = useDarkMode();

    const { data: existingTest, isLoading: isLoadingTest } = useGetProficiencyTestByIdQuery(testId, { skip: !testId });
    const [createTest, { isLoading: isCreating }] = useCreateProficiencyTestMutation();
    const [updateTest, { isLoading: isUpdating }] = useUpdateProficiencyTestMutation();
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

    const [currentStep, setCurrentStep] = useState(1);

    const [testData, setTestData] = useState({
        title: "",
        description: "",
        duration_minutes: 60,
        status: "active",
    });

    const [questions, setQuestions] = useState([]);
    const [sectionMetadata, setSectionMetadata] = useState({
        1: defaultSectionMeta("MCQs"), 2: defaultSectionMeta("Reading passage"),
        3: defaultSectionMeta("Essay"), 4: defaultSectionMeta("MCQs"),
        5: defaultSectionMeta("Audio"),
    });

    // Load existing test data if it's a draft
    useEffect(() => {
        if (existingTest) {
            setTestData({
                title: existingTest.title || '',
                description: existingTest.description || '',
                duration_minutes: existingTest.duration_minutes || 60,
                status: existingTest.status || 'active'
            });
            const parsedQuestions = typeof existingTest.questions === 'string'
                ? JSON.parse(existingTest.questions)
                : existingTest.questions;
            setQuestions(ensureQuestionNumbers(parsedQuestions || [], PROFICIENCY_MAX_PART));
            setSectionMetadata((previous) => {
                const next = { ...previous };
                const loadedParts = new Set();
                (parsedQuestions || []).forEach((q) => {
                    if (q.sectionMeta && q.part && !loadedParts.has(q.part)) {
                        next[q.part] = q.sectionMeta;
                        loadedParts.add(q.part);
                    }
                });
                return next;
            });
        }
    }, [existingTest]);
    const [editingIndex, setEditingIndex] = useState(null);

    // MCQ state
    const [currentMCQ, setCurrentMCQ] = useState({
        id: uuidv4(),
        type: "mcq",
        questionText: "",
        options: ["", ""],
        correctOption: 0,
        points: 5,
    });

    // Passage state
    const [currentPassage, setCurrentPassage] = useState({
        id: uuidv4(),
        type: "passage",
        passageText: "",
        subQuestions: [],
        points: 0,
    });

    // Essay state
    const [currentEssay, setCurrentEssay] = useState({
        id: uuidv4(),
        type: "essay",
        title: "",
        description: "",
        maxWords: 250,
        points: 10,
    });

    // Audio state
    const [currentAudio, setCurrentAudio] = useState({
        id: uuidv4(),
        type: "audio",
        audioUrl: "",
        title: "",
        description: "Listen to the audio and write what you understood.",
        points: 15,
    });

    const steps = [
        { title: "Part 1: MCQ", type: "mcq" },
        { title: "Part 2: Passage", type: "passage" },
        { title: "Part 3: Essay", type: "essay" },
        { title: "Part 4: Final MCQ", type: "mcq" },
        { title: "Part 5: Audio", type: "audio" },
    ];

    const handleTestChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const addToTestList = () => {
        let q = null;
        const type = steps[currentStep - 1].type;
        const currentCount = questions.filter((item) => item.part === currentStep).length;
        if (editingIndex === null && currentCount >= sectionMetadata[currentStep].questions) {
            return showToast(`Part ${currentStep} cannot exceed ${sectionMetadata[currentStep].questions} questions`, "error");
        }
        if (type === "mcq") {
            if (!currentMCQ.questionText || currentMCQ.options.some(o => !o)) {
                return showToast("Fill all MCQ fields", "error");
            }
            q = { ...currentMCQ, part: currentStep, sectionMeta: sectionMetadata[currentStep] };
        } else if (type === "passage") {
            if (!currentPassage.passageText || currentPassage.subQuestions.length === 0) {
                return showToast("Add passage text and sub-questions", "error");
            }
            const totalPoints = currentPassage.subQuestions.reduce((acc, sq) => acc + (parseInt(sq.points) || 0), 0);
            q = { ...currentPassage, points: totalPoints, part: currentStep, sectionMeta: sectionMetadata[currentStep] };
        } else if (type === "essay") {
            if (!currentEssay.title) {
                return showToast("Add essay title", "error");
            }
            q = { ...currentEssay, part: currentStep, sectionMeta: sectionMetadata[currentStep] };
        } else if (type === "audio") {
            if (!currentAudio.title || !currentAudio.audioUrl) {
                return showToast("Add audio title and URL", "error");
            }
            q = { ...currentAudio, part: currentStep, sectionMeta: sectionMetadata[currentStep] };
        }

        const nextQuestions =
            editingIndex !== null
                ? questions.map((item, idx) => (idx === editingIndex ? q : item))
                : [...questions, q];

        setQuestions(renumberQuestionsByPart(nextQuestions, PROFICIENCY_MAX_PART));
        if (editingIndex !== null) {
            setEditingIndex(null);
            showToast("Question updated", "success");
        } else {
            showToast("Question added", "success");
        }

        // Reset
        if (type === "mcq") setCurrentMCQ({ id: uuidv4(), type: "mcq", questionText: "", options: ["", ""], correctOption: 0, points: 5 });
        else if (type === "passage") setCurrentPassage({ id: uuidv4(), type: "passage", passageText: "", subQuestions: [], points: 0 });
        else if (type === "essay") setCurrentEssay({ id: uuidv4(), type: "essay", title: "", description: "", maxWords: 250, points: 10 });
        else if (type === "audio") setCurrentAudio({ id: uuidv4(), type: "audio", audioUrl: "", title: "", description: "Listen to the audio and write what you understood.", points: 15 });
    };

    const handleEdit = (idx) => {
        const q = questions[idx];
        if (q.type === "mcq") {
            setCurrentMCQ({
                ...q,
                options: Array.isArray(q.options) ? [...q.options] : ["", ""],
            });
        } else if (q.type === "passage") {
            setCurrentPassage({
                ...q,
                subQuestions: Array.isArray(q.subQuestions)
                    ? q.subQuestions.map((sq) => ({
                        ...sq,
                        options: Array.isArray(sq.options) ? [...sq.options] : ["", ""],
                    }))
                    : [],
            });
        } else if (q.type === "essay") setCurrentEssay({ ...q });
        else if (q.type === "audio") setCurrentAudio({ ...q });
        setEditingIndex(idx);
    };

    const nextStep = () => {
        const stepQuestions = questions.filter(q => q.part === currentStep);
        if (stepQuestions.length === 0) {
            return showToast(`Please add at least one question for ${steps[currentStep - 1].title}`, "error");
        }
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSaveDraft = async () => {
        const draftTitle =
            testData.title?.trim() || `Proficiency Test Draft ${new Date().toLocaleDateString()}`;
        if (!testData.title?.trim()) {
            setTestData((prev) => ({ ...prev, title: draftTitle }));
        }

        try {
            const payload = {
                ...testData,
                title: draftTitle,
                questions: attachSectionMetadata(renumberQuestionsByPart(questions, PROFICIENCY_MAX_PART), sectionMetadata),
                status: "draft",
            };
            if (testId) {
                await updateTest({ id: testId, ...payload }).unwrap();
                showToast("Draft updated successfully", "success");
            } else {
                const result = await createTest(payload).unwrap();
                showToast("Saved as draft", "success");
                // Update URL to current draft ID
                router.replace(`/portal/admin/assessments/proficiency-tests/create?id=${result.id}`);
            }
        } catch (err) {
            showToast("Failed to save draft", "error");
        }
    };

    const handleSubmit = async () => {
        if (!testData.title) return showToast("Title is required", "error");
        if (questions.filter(q => q.part === 5).length === 0) return showToast("Please add at least one question for Part 5", "error");

        try {
            const payload = {
                ...testData,
                questions: attachSectionMetadata(renumberQuestionsByPart(questions, PROFICIENCY_MAX_PART), sectionMetadata),
                status: "active",
            };
            if (testId) {
                await updateTest({ id: testId, ...payload }).unwrap();
            } else {
                await createTest(payload).unwrap();
            }
            showToast("Proficiency Test Published Successfully!", "success");
            router.push("/portal/admin/assessments/proficiency-tests");
        } catch (err) {
            showToast("Failed to finalize test", "error");
        }
    };

    const totalMarks = questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);

    const StepIndicator = () => (
        <div className="bg-white py-20 px-10 rounded-2xl shadow-sm border border-gray-200 mb-12">
            <div className="flex items-center justify-between max-w-6xl mx-auto px-4">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;

                    return (
                        <div key={stepNum} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' :
                                    isActive ? 'bg-[#010080] text-white shadow-lg shadow-blue-900/20' :
                                        'bg-gray-100 text-gray-400 border border-gray-200'
                                    }`}>
                                    {isCompleted ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : stepNum}
                                </div>
                                <span className={`absolute -bottom-10 text-[11px] font-bold uppercase tracking-wide transform -translate-x-1/2 left-1/2 whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#010080]' : 'text-gray-300'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 bg-gray-100 relative">
                                    <div className={`absolute left-0 top-0 h-full bg-[#010080] transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'
                                        }`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex-1 min-h-screen bg-gray-100 flex flex-col text-gray-800">
            <div className="flex-1 overflow-y-auto bg-gray-50 transition-colors mt-6">
                <div className="w-full px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-20">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="text-gray-500 hover:text-gray-900 mb-3 flex items-center gap-2 transition-colors font-medium hover:-translate-x-1 transform duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Tests
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{testId ? 'Continue Draft' : 'Create Proficiency Test'}</h1>
                                <p className="mt-2 text-gray-600">Complete the 5-part process to build a professional proficiency test.</p>
                            </div>
                        </div>
                    </div>

                    <StepIndicator />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-6">

                            {/* 1. Test Info - Persistent across steps */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <div className="w-1.5 h-6 bg-[#010080] rounded-full"></div>
                                    Test General Information
                                </h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Test Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={testData.title}
                                            onChange={handleTestChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                            placeholder="e.g., BEA English Proficiency Test"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={testData.description}
                                            onChange={handleTestChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                            rows={3}
                                            placeholder="Enter test description..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="duration_minutes"
                                                    value={testData.duration_minutes}
                                                    onChange={handleTestChange}
                                                    className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                                    min="1"
                                                />
                                                <span className="absolute right-4 top-2.5 text-gray-500 text-sm pointer-events-none">min</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                            <select
                                                name="status"
                                                value={testData.status}
                                                onChange={handleTestChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SectionMetadataFields
                                value={sectionMetadata[currentStep]}
                                currentCount={questions.filter((q) => q.part === currentStep).length}
                                onChange={(value) => setSectionMetadata({ ...sectionMetadata, [currentStep]: value })}
                            />

                            {/* 2. Question Form Box */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {editingIndex !== null ? `Edit Question` : `Add ${steps[currentStep - 1].title} Question`}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        Step {currentStep} of 5
                                    </span>
                                </h2>

                                {steps[currentStep - 1].type === 'mcq' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                                                Marks for this question
                                            </label>
                                            <input
                                                type="number"
                                                value={currentMCQ.points}
                                                onChange={e => setCurrentMCQ({ ...currentMCQ, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                                min="1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                                            <textarea
                                                value={currentMCQ.questionText}
                                                onChange={e => setCurrentMCQ({ ...currentMCQ, questionText: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                rows={2}
                                                placeholder="Type your question here..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Options <span className="text-gray-400 font-normal">(Mark the correct answer)</span></label>
                                            {currentMCQ.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        checked={currentMCQ.correctOption === idx}
                                                        onChange={() => setCurrentMCQ({ ...currentMCQ, correctOption: idx })}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => {
                                                            const next = [...currentMCQ.options];
                                                            next[idx] = e.target.value;
                                                            setCurrentMCQ({ ...currentMCQ, options: next });
                                                        }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                        placeholder={`Option ${idx + 1}`}
                                                    />
                                                    {currentMCQ.options.length > 2 && (
                                                        <button
                                                            onClick={() => {
                                                                const next = currentMCQ.options.filter((_, i) => i !== idx);
                                                                setCurrentMCQ({ ...currentMCQ, options: next, correctOption: currentMCQ.correctOption >= next.length ? 0 : currentMCQ.correctOption });
                                                            }}
                                                            className="text-red-400 font-bold px-2 hover:bg-red-50 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setCurrentMCQ({ ...currentMCQ, options: [...currentMCQ.options, ""] })}
                                                className="text-sm text-[#010080] font-semibold hover:underline"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                        <button
                                            onClick={addToTestList}
                                            className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            {editingIndex !== null ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Update Question
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                    Add Question to Part {currentStep}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'passage' && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reading Passage</label>
                                            <textarea
                                                value={currentPassage.passageText}
                                                onChange={e => setCurrentPassage({ ...currentPassage, passageText: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                rows={4}
                                                placeholder="Paste your text passage here..."
                                            />
                                        </div>
                                        <PassageSubQuestionsEditor
                                            subQuestions={currentPassage.subQuestions}
                                            onChange={(subQuestions) =>
                                                setCurrentPassage({ ...currentPassage, subQuestions })
                                            }
                                        />
                                        <button
                                            onClick={addToTestList}
                                            className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            {editingIndex !== null ? "Update Passage" : `Add Passage to Part ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'essay' && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Essay Prompt Title</label>
                                            <input
                                                value={currentEssay.title}
                                                onChange={e => setCurrentEssay({ ...currentEssay, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                placeholder="e.g., The Future of Artificial Intelligence"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Essay Instructions</label>
                                            <textarea
                                                value={currentEssay.description}
                                                onChange={e => setCurrentEssay({ ...currentEssay, description: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                rows={3}
                                                placeholder="Detail the task..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Word Limit</label>
                                                <input
                                                    type="number"
                                                    value={currentEssay.maxWords}
                                                    onChange={e => setCurrentEssay({ ...currentEssay, maxWords: parseInt(e.target.value) || 0 })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Marks</label>
                                                <input
                                                    type="number"
                                                    value={currentEssay.points}
                                                    onChange={e => setCurrentEssay({ ...currentEssay, points: parseInt(e.target.value) || 0 })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={addToTestList}
                                            className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            {editingIndex !== null ? "Update Essay" : `Add Essay to Part ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'audio' && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Audio Title</label>
                                            <input
                                                value={currentAudio.title}
                                                onChange={e => setCurrentAudio({ ...currentAudio, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                placeholder="e.g., Listening Section: Interview"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Audio URL / Upload</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={currentAudio.audioUrl}
                                                    onChange={e => setCurrentAudio({ ...currentAudio, audioUrl: e.target.value })}
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                    placeholder="https://example.com/audio.mp3"
                                                />
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="audio/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            try {
                                                                showToast("Uploading audio...", "info");
                                                                const res = await uploadFile(formData).unwrap();
                                                                setCurrentAudio({ ...currentAudio, audioUrl: res.url });
                                                                showToast("Audio uploaded successfully!", "success");
                                                            } catch (err) {
                                                                showToast("Upload failed", "error");
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <button type="button" className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                        {uploading ? "..." : "Upload"}
                                                    </button>
                                                </div>
                                            </div>
                                            {currentAudio.audioUrl && (
                                                <div className="mt-2 text-xs flex items-center gap-2">
                                                    <audio controls className="h-8 flex-1">
                                                        <source src={resolveMediaUrl(currentAudio.audioUrl) || ""} />
                                                    </audio>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions/Prompt</label>
                                            <textarea
                                                value={currentAudio.description}
                                                onChange={e => setCurrentAudio({ ...currentAudio, description: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                rows={3}
                                                placeholder="Listen and write what you understood..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Marks</label>
                                            <input
                                                type="number"
                                                value={currentAudio.points}
                                                onChange={e => setCurrentAudio({ ...currentAudio, points: parseInt(e.target.value) || 0 })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                                            />
                                        </div>
                                        <button
                                            onClick={addToTestList}
                                            className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            {editingIndex !== null ? "Update Audio" : `Add Audio to Part ${currentStep}`}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous Part
                                </button>

                                {currentStep < 5 ? (
                                    <button
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white bg-[#010080] hover:bg-[#000066] transition-all shadow-md shadow-blue-900/10 active:scale-95"
                                    >
                                        Next Part
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Ready to Submit
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1 border-l border-gray-100 pl-6">
                            <div className="sticky top-8 flex flex-col h-[calc(100vh-100px)]">
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Test Overview</h2>
                                    <p className="text-[10px] text-[#010080]/60 font-semibold uppercase tracking-widest mt-1">Summary by Section</p>
                                </div>

                                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 space-y-4 mb-6">

                                    {[1, 2, 3, 4, 5].map(partNum => {
                                        const partQuestions = sortByQuestionNumber(
                                            questions.filter((q) => q.part === partNum)
                                        );
                                        const isActivePart = currentStep === partNum;

                                        return (
                                            <div key={partNum} className={`bg-white rounded-xl border transition-all p-5 shadow-sm ${isActivePart ? 'border-[#010080] ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-50">
                                                    <h3 className={`text-[10px] font-bold uppercase tracking-wide ${isActivePart ? 'text-[#010080]' : 'text-gray-400'}`}>
                                                        Part {partNum}: {steps[partNum - 1].title.split(': ')[1]}
                                                    </h3>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isActivePart ? 'bg-[#010080] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {partQuestions.length}
                                                    </span>
                                                </div>
                                                {partQuestions.map((q, idx) => {
                                                    const originalIndex = questions.indexOf(q);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => {
                                                                setCurrentStep(partNum);
                                                                handleEdit(originalIndex);
                                                            }}
                                                            className={`p-2.5 rounded-lg border mb-2 cursor-pointer transition-all ${editingIndex === originalIndex ? 'bg-[#010080]/5 border-[#010080]' : 'bg-gray-50/50 border-gray-100 hover:bg-white'}`}
                                                        >
                                                            <p className="text-[10px] font-bold text-gray-800 line-clamp-1">
                                                                {formatQuestionLabel(q, idx + 1)}
                                                            </p>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-[7px] font-bold text-gray-300 uppercase italic">{q.type}</span>
                                                                <span className="text-[9px] font-bold text-[#010080]">{q.points} PTS</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}

                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                                    {/* Total Summary Card */}
                                    <div className="bg-[#010080] rounded-2xl p-5 flex flex-col gap-1 shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700"></div>
                                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest relative z-10">Growth Weight</span>
                                        <div className="flex items-baseline gap-2 relative z-10">
                                            <span className="text-2xl font-bold text-white leading-none">{totalMarks}</span>
                                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider relative z-10">Total Marks</span>
                                        </div>
                                    </div>

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

                                    {currentStep === 5 && (
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transform animate-in slide-in-from-bottom-4 transition-all hover:shadow-lg">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isCreating || isUpdating || questions.filter(q => q.part === 5).length === 0}
                                                className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3.5 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                                            >
                                                {isCreating || isUpdating ? 'Processing...' : testId ? 'Update & Publish' : 'Save Final Test'}
                                            </button>
                                            {questions.filter(q => q.part === 5).length === 0 && (
                                                <p className="text-[10px] text-red-500 font-bold text-center mt-3 uppercase tracking-tighter">
                                                    Add audio comprehension to finish
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
        </div>
    );
}
