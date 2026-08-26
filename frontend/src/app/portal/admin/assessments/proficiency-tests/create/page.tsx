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
import RichTextEditor from "@/components/assessments/RichTextEditor";
import SectionMetadataFields, { attachSectionMetadata, defaultSectionMeta } from "@/components/admin/assessments/SectionMetadataFields";
import {
    ensureQuestionNumbers,
    formatQuestionLabel,
    renumberQuestionsByPart,
    sortByQuestionNumber,
} from "@/utils/testQuestions";

const PROFICIENCY_MAX_PART = 4;


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
    const [selectedType, setSelectedType] = useState("mcq");

    const steps = [
        { title: "Section A: Listening", defaultType: "mcq" },
        { title: "Section B: Reading", defaultType: "passage" },
        { title: "Section C: Writing", defaultType: "essay" },
        { title: "Section D: Speaking", defaultType: "audio" },
    ];

    const [testData, setTestData] = useState({
        title: "",
        description: "",
        duration_minutes: 150,
        status: "active",
    });

    const [questions, setQuestions] = useState([]);
    const [sectionMetadata, setSectionMetadata] = useState({
        1: {
            sectionName: "Section A — Listening",
            questions: 20,
            format: "Listening (MCQs & Short Answer)",
            marks: 20,
            targetScore: "15/20",
            skillsAssessed: "Listening Comprehension & Note Taking",
            instructions: "You will hear each part of this section read aloud TWICE by your invigilator at normal speaking speed."
        },
        2: {
            sectionName: "Section B — Reading",
            questions: 30,
            format: "Reading Passages & Questions",
            marks: 30,
            targetScore: "20/30",
            skillsAssessed: "Reading Comprehension, Skimming & Scanning",
            instructions: "You have 60 minutes to complete this section, which contains 3 passages and 30 questions in total."
        },
        3: {
            sectionName: "Section C — Writing",
            questions: 2,
            format: "Task 1 Data Summary & Task 2 Essay",
            marks: 50,
            targetScore: "35/50",
            skillsAssessed: "Academic Data Analysis & Argumentative Essay",
            instructions: "You have 60 minutes to complete this section. Spend 20 minutes on Task 1 and 40 minutes on Task 2."
        },
        4: {
            sectionName: "Section D — Speaking / Oral Interview",
            questions: 1,
            format: "Interview Assessment",
            marks: 20,
            targetScore: "15/20",
            skillsAssessed: "Spoken English & Fluency",
            instructions: "A separate spoken Interview Assessment will be scheduled after the written test."
        }
    });

    // Sync default type when step changes
    useEffect(() => {
        if (editingIndex === null) {
            if (currentStep === 1) setSelectedType("mcq");
            else if (currentStep === 2) setSelectedType("passage");
            else if (currentStep === 3) setSelectedType("essay");
            else if (currentStep === 4) setSelectedType("audio");
        }
    }, [currentStep]);

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
        title: "",
        instructions: "",
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

    // Form-fill state (Listening Part 1 style — fill form blanks)
    const [currentFormFill, setCurrentFormFill] = useState({
        id: uuidv4(),
        type: "form-fill",
        title: "",
        instructions: "Complete the form below. Write NO MORE THAN THREE WORDS OR A NUMBER for each answer.",
        fields: [{ label: "", answer: "" }],
        points: 5,
    });

    // Sentence completion state (gap-fill in sentences)
    const [currentSentenceCompletion, setCurrentSentenceCompletion] = useState({
        id: uuidv4(),
        type: "sentence-completion",
        instructions: "Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.",
        sentences: [{ stem: "", answer: "" }],
        points: 5,
    });

    // TFNG state (True/False/Not Given)
    const [currentTFNG, setCurrentTFNG] = useState({
        id: uuidv4(),
        type: "tfng",
        passageContext: "",
        statements: [{ text: "", answer: "TRUE" }],
        points: 5,
    });

    // Heading match state
    const [currentHeadingMatch, setCurrentHeadingMatch] = useState({
        id: uuidv4(),
        type: "heading-match",
        instructions: "Choose the correct heading for each paragraph from the list below.",
        headings: [""],
        paragraphs: [{ label: "A", correctHeading: 0 }],
        points: 5,
    });

    // Word-box fill state (summary cloze from word bank)
    const [currentWordBoxFill, setCurrentWordBoxFill] = useState({
        id: uuidv4(),
        type: "word-box-fill",
        instructions: "Complete the summary below using words from the box. There are more words than you need.",
        wordBank: "",
        summaryText: "",
        answers: [{ number: 1, answer: "" }],
        points: 10,
    });

    // Table essay state (Writing Task 1)
    const [currentTableEssay, setCurrentTableEssay] = useState({
        id: uuidv4(),
        type: "table-essay",
        title: "",
        instructions: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        tableHeaders: ["Column 1", "Column 2"],
        tableRows: [["Row 1 Col 1", "Row 1 Col 2"]],
        minWords: 150,
        points: 25,
    });

    // Optional voice material is shared by every question type.
    const [questionSupport, setQuestionSupport] = useState({ voiceUrl: "" });

    const handleTestChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const addToTestList = () => {
        let q = null;
        const type = selectedType;
        const currentCount = questions.filter((item) => item.part === currentStep).length;
        const nextCount = editingIndex === null ? currentCount + 1 : currentCount;
        const currentMeta = sectionMetadata[currentStep] || defaultSectionMeta();
        const updatedMeta = {
            ...currentMeta,
            questions: Math.max(currentMeta.questions || 1, nextCount),
        };
        if (updatedMeta.questions !== currentMeta.questions) {
            setSectionMetadata((prev) => ({ ...prev, [currentStep]: updatedMeta }));
        }

        if (type === "mcq") {
            if (!currentMCQ.questionText || currentMCQ.options.some(o => !o)) {
                return showToast("Fill all MCQ fields", "error");
            }
            q = { ...currentMCQ, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "passage") {
            if (!currentPassage.passageText || currentPassage.subQuestions.length === 0) {
                return showToast("Add passage text and sub-questions", "error");
            }
            const totalPoints = currentPassage.subQuestions.reduce((acc, sq) => acc + (parseInt(sq.points) || 0), 0);
            q = { ...currentPassage, ...questionSupport, points: totalPoints, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "essay") {
            if (!currentEssay.title) {
                return showToast("Add essay title", "error");
            }
            q = { ...currentEssay, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "audio") {
            if (!currentAudio.title) return showToast("Add audio title", "error");
            q = { ...currentAudio, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "form-fill") {
            if (!currentFormFill.title) return showToast("Add form title", "error");
            if (currentFormFill.fields.some(f => !f.label)) return showToast("All field labels are required", "error");
            q = { ...currentFormFill, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "sentence-completion") {
            if (currentSentenceCompletion.sentences.length === 0) return showToast("Add at least one sentence", "error");
            q = { ...currentSentenceCompletion, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "tfng") {
            if (currentTFNG.statements.length === 0) return showToast("Add at least one statement", "error");
            q = { ...currentTFNG, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "heading-match") {
            if (currentHeadingMatch.headings.length === 0 || currentHeadingMatch.paragraphs.length === 0)
                return showToast("Add headings and paragraphs", "error");
            q = { ...currentHeadingMatch, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "word-box-fill") {
            if (!currentWordBoxFill.wordBank || !currentWordBoxFill.summaryText)
                return showToast("Add word bank and summary text", "error");
            q = { ...currentWordBoxFill, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        } else if (type === "table-essay") {
            if (!currentTableEssay.title) return showToast("Add task title", "error");
            q = { ...currentTableEssay, ...questionSupport, part: currentStep, sectionMeta: updatedMeta };
        }

        // Do not retain the removed code fields when an existing question is updated.
        delete q.codeSnippet;
        delete q.codeLanguage;

        const nextQuestions =
            editingIndex !== null
                ? questions.map((item, idx) => (idx === editingIndex ? q : item))
                : [...questions, q];

        setQuestions(renumberQuestionsByPart(nextQuestions, PROFICIENCY_MAX_PART));
        setQuestionSupport({ voiceUrl: "" });
        if (editingIndex !== null) {
            setEditingIndex(null);
            showToast("Question updated", "success");
        } else {
            showToast("Question added", "success");
        }

        // Reset
        if (type === "mcq") setCurrentMCQ({ id: uuidv4(), type: "mcq", questionText: "", options: ["", ""], correctOption: 0, points: 5 });
        else if (type === "passage") setCurrentPassage({ id: uuidv4(), type: "passage", title: "", instructions: "", passageText: "", subQuestions: [], points: 0 });
        else if (type === "essay") setCurrentEssay({ id: uuidv4(), type: "essay", title: "", description: "", maxWords: 250, points: 10 });
        else if (type === "audio") setCurrentAudio({ id: uuidv4(), type: "audio", audioUrl: "", title: "", description: "Listen to the audio and write what you understood.", points: 15 });
        else if (type === "form-fill") setCurrentFormFill({ id: uuidv4(), type: "form-fill", title: "", instructions: "Complete the form below. Write NO MORE THAN THREE WORDS OR A NUMBER for each answer.", fields: [{ label: "", answer: "" }], points: 5 });
        else if (type === "sentence-completion") setCurrentSentenceCompletion({ id: uuidv4(), type: "sentence-completion", instructions: "Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.", sentences: [{ stem: "", answer: "" }], points: 5 });
        else if (type === "tfng") setCurrentTFNG({ id: uuidv4(), type: "tfng", passageContext: "", statements: [{ text: "", answer: "TRUE" }], points: 5 });
        else if (type === "heading-match") setCurrentHeadingMatch({ id: uuidv4(), type: "heading-match", instructions: "Choose the correct heading for each paragraph from the list below.", headings: [""], paragraphs: [{ label: "A", correctHeading: 0 }], points: 5 });
        else if (type === "word-box-fill") setCurrentWordBoxFill({ id: uuidv4(), type: "word-box-fill", instructions: "Complete the summary below using words from the box. There are more words than you need.", wordBank: "", summaryText: "", answers: [{ number: 1, answer: "" }], points: 10 });
        else if (type === "table-essay") setCurrentTableEssay({ id: uuidv4(), type: "table-essay", title: "", instructions: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.", tableHeaders: ["Column 1", "Column 2"], tableRows: [["Row 1 Col 1", "Row 1 Col 2"]], minWords: 150, points: 25 });
    };

    const handleEdit = (idx) => {
        const q = questions[idx];
        setSelectedType(q.type || "mcq");
        setQuestionSupport({ voiceUrl: q.voiceUrl || "" });
        if (q.type === "mcq") {
            setCurrentMCQ({ ...q, options: Array.isArray(q.options) ? [...q.options] : ["", ""] });
        } else if (q.type === "passage") {
            setCurrentPassage({ ...q, title: q.title || "", instructions: q.instructions || "", subQuestions: Array.isArray(q.subQuestions) ? [...q.subQuestions] : [] });
        } else if (q.type === "essay") setCurrentEssay({ ...q });
        else if (q.type === "audio") setCurrentAudio({ ...q });
        else if (q.type === "form-fill") setCurrentFormFill({ ...q, fields: Array.isArray(q.fields) ? [...q.fields] : [{ label: "", answer: "" }] });
        else if (q.type === "sentence-completion") setCurrentSentenceCompletion({ ...q, sentences: Array.isArray(q.sentences) ? [...q.sentences] : [{ stem: "", answer: "" }] });
        else if (q.type === "tfng") setCurrentTFNG({ ...q, statements: Array.isArray(q.statements) ? [...q.statements] : [{ text: "", answer: "TRUE" }] });
        else if (q.type === "heading-match") setCurrentHeadingMatch({ ...q, headings: Array.isArray(q.headings) ? [...q.headings] : [""], paragraphs: Array.isArray(q.paragraphs) ? [...q.paragraphs] : [] });
        else if (q.type === "word-box-fill") setCurrentWordBoxFill({ ...q, answers: Array.isArray(q.answers) ? [...q.answers] : [] });
        else if (q.type === "table-essay") setCurrentTableEssay({ ...q });
        setEditingIndex(idx);
    };

    const nextStep = () => {
        if (currentStep < steps.length) setCurrentStep(currentStep + 1);
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
        if (questions.length === 0) return showToast("Please add at least one question to your proficiency test", "error");

        try {
            const payload = {
                ...testData,
                questions: attachSectionMetadata(renumberQuestionsByPart(questions, PROFICIENCY_MAX_PART), sectionMetadata),
                status: testData.status || "active",
            };
            if (testId) {
                await updateTest({ id: testId, ...payload }).unwrap();
            } else {
                await createTest(payload).unwrap();
            }
            showToast("Proficiency Test Saved Successfully!", "success");
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
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
                                <h1 className="text-3xl font-bold text-gray-900">{testId ? 'Edit Proficiency Test' : 'Create Proficiency Test'}</h1>
                                <p className="mt-2 text-gray-600">Complete the {steps.length}-section process to build a professional proficiency test.</p>
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
                                        <RichTextEditor value={testData.description} onChange={(description) => setTestData({ ...testData, description })} placeholder="Enter test description..." />
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
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {editingIndex !== null ? `Edit Question` : `Add Question to ${steps[currentStep - 1].title}`}
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        Step {currentStep} of {steps.length}
                                    </span>
                                </div>

                                {/* Question Type Selector Bar */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        Select Question Type for this Section:
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                        {[
                                            { key: "mcq", label: "MCQ / Choice", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                                            { key: "passage", label: "Reading Passage", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                                            { key: "essay", label: "Essay / Writing", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
                                            { key: "audio", label: "Audio / Listening", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
                                            { key: "form-fill", label: "Form Fill", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                                            { key: "sentence-completion", label: "Fill Blanks", icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
                                            { key: "tfng", label: "True/False/NG", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                                            { key: "heading-match", label: "Match Headings", icon: "M4 6h16M4 12h8m-8 6h16" },
                                            { key: "word-box-fill", label: "Word Box Fill", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" },
                                            { key: "table-essay", label: "Table + Essay", icon: "M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" },
                                        ].map(({ key, label, icon }) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setSelectedType(key)}
                                                className={`py-2 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                                                    selectedType === key
                                                        ? "bg-[#010080] text-white shadow-sm"
                                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                                </svg>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">

                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-gray-700">Voice / Audio <span className="font-normal text-gray-400">(optional; available for every question type)</span></label>
                                        <div className="flex gap-2">
                                            <input value={questionSupport.voiceUrl} onChange={(e) => setQuestionSupport({ ...questionSupport, voiceUrl: e.target.value })} placeholder="Audio URL or upload an audio file" className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#010080]" />
                                            <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100"><input type="file" accept="audio/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const formData = new FormData(); formData.append("file", file); try { showToast("Uploading audio...", "info"); const res = await uploadFile(formData).unwrap(); setQuestionSupport({ ...questionSupport, voiceUrl: res.url }); showToast("Audio uploaded successfully!", "success"); } catch { showToast("Audio upload failed", "error"); } }} />{uploading ? "Uploading..." : "Upload voice"}</label>
                                        </div>
                                        {questionSupport.voiceUrl && <audio controls className="mt-2 h-8 w-full"><source src={resolveMediaUrl(questionSupport.voiceUrl) || ""} /></audio>}
                                    </div>
                                </div>

                                {selectedType === 'mcq' && (
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
                                                    Add Question to Step {currentStep}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {selectedType === 'passage' && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                                    Passage Title <span className="text-gray-400 font-normal">(e.g. Passage 3 — The Rise of AI...)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={currentPassage.title || ""}
                                                    onChange={e => setCurrentPassage({ ...currentPassage, title: e.target.value })}
                                                    placeholder="e.g. Passage 1 — The History of Coffee"
                                                    className="w-full text-sm font-bold border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                                    Passage Instructions <span className="text-gray-400 font-normal">(Optional Timing/Guidance)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={currentPassage.instructions || ""}
                                                    onChange={e => setCurrentPassage({ ...currentPassage, instructions: e.target.value })}
                                                    placeholder="e.g. You have 20 minutes to read this passage and answer Questions 1–10."
                                                    className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Reading Passage Content / Text
                                            </label>
                                            <RichTextEditor value={currentPassage.passageText} onChange={(passageText) => setCurrentPassage({ ...currentPassage, passageText })} placeholder="Paste your text passage here..." minHeight={180} />
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
                                            {editingIndex !== null ? "Update Passage" : `Add Passage to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {selectedType === 'essay' && (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Essay Prompt Title</label>
                                            <input
                                                value={currentEssay.title}
                                                onChange={e => setCurrentEssay({ ...currentEssay, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                                                placeholder="e.g., Task 2: Free University Education Essay"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Essay Instructions</label>
                                            <RichTextEditor value={currentEssay.description} onChange={(description) => setCurrentEssay({ ...currentEssay, description })} placeholder="Detail the task..." />
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
                                            {editingIndex !== null ? "Update Essay" : `Add Essay to Step ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {selectedType === 'audio' && (
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
                                            {editingIndex !== null ? "Update Audio" : `Add Audio to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── FORM FILL (Listening Part 1) ── */}
                                {selectedType === 'form-fill' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentFormFill.points}
                                                onChange={e => setCurrentFormFill({ ...currentFormFill, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Form Title <span className="text-gray-400 font-normal">(e.g. STUDENT ACCOMMODATION APPLICATION)</span></label>
                                            <input type="text" value={currentFormFill.title}
                                                onChange={e => setCurrentFormFill({ ...currentFormFill, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none"
                                                placeholder="Form title..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                                            <input type="text" value={currentFormFill.instructions}
                                                onChange={e => setCurrentFormFill({ ...currentFormFill, instructions: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Form Fields <span className="text-gray-400 font-normal">(label + answer key)</span></label>
                                            {currentFormFill.fields.map((field, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#010080] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                                                    <input type="text" value={field.label}
                                                        onChange={e => { const n = [...currentFormFill.fields]; n[idx] = { ...n[idx], label: e.target.value }; setCurrentFormFill({ ...currentFormFill, fields: n }); }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" placeholder="Field label (e.g. Full Name)" />
                                                    <input type="text" value={field.answer}
                                                        onChange={e => { const n = [...currentFormFill.fields]; n[idx] = { ...n[idx], answer: e.target.value }; setCurrentFormFill({ ...currentFormFill, fields: n }); }}
                                                        className="w-32 border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" placeholder="Answer key" />
                                                    <button type="button" onClick={() => { const n = currentFormFill.fields.filter((_, i) => i !== idx); setCurrentFormFill({ ...currentFormFill, fields: n }); }}
                                                        className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentFormFill({ ...currentFormFill, fields: [...currentFormFill.fields, { label: "", answer: "" }] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Add Field
                                            </button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update Form Fill" : `Add Form Fill to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── SENTENCE COMPLETION ── */}
                                {selectedType === 'sentence-completion' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentSentenceCompletion.points}
                                                onChange={e => setCurrentSentenceCompletion({ ...currentSentenceCompletion, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                                            <input type="text" value={currentSentenceCompletion.instructions}
                                                onChange={e => setCurrentSentenceCompletion({ ...currentSentenceCompletion, instructions: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Sentences <span className="text-gray-400 font-normal">(use ___ for the blank, add answer key)</span></label>
                                            {currentSentenceCompletion.sentences.map((s, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#010080] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-2">{idx + 1}</span>
                                                    <textarea value={s.stem}
                                                        onChange={e => { const n = [...currentSentenceCompletion.sentences]; n[idx] = { ...n[idx], stem: e.target.value }; setCurrentSentenceCompletion({ ...currentSentenceCompletion, sentences: n }); }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" rows={2}
                                                        placeholder="Solar and wind power are described as being ___ compared to fossil fuels." />
                                                    <input type="text" value={s.answer}
                                                        onChange={e => { const n = [...currentSentenceCompletion.sentences]; n[idx] = { ...n[idx], answer: e.target.value }; setCurrentSentenceCompletion({ ...currentSentenceCompletion, sentences: n }); }}
                                                        className="w-28 border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none mt-0" placeholder="Answer" />
                                                    <button type="button" onClick={() => setCurrentSentenceCompletion({ ...currentSentenceCompletion, sentences: currentSentenceCompletion.sentences.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600 p-1 mt-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentSentenceCompletion({ ...currentSentenceCompletion, sentences: [...currentSentenceCompletion.sentences, { stem: "", answer: "" }] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Sentence
                                            </button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update Sentence Completion" : `Add Sentence Completion to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── TRUE / FALSE / NOT GIVEN ── */}
                                {selectedType === 'tfng' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentTFNG.points}
                                                onChange={e => setCurrentTFNG({ ...currentTFNG, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Passage Context <span className="text-gray-400 font-normal">(optional reference)</span></label>
                                            <textarea value={currentTFNG.passageContext}
                                                onChange={e => setCurrentTFNG({ ...currentTFNG, passageContext: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" rows={3}
                                                placeholder="Refer to Passage 1 — The History of Coffee..." />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Statements <span className="text-gray-400 font-normal">(set correct answer: TRUE / FALSE / NOT GIVEN)</span></label>
                                            {currentTFNG.statements.map((s, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-[#010080] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                                                    <input type="text" value={s.text}
                                                        onChange={e => { const n = [...currentTFNG.statements]; n[idx] = { ...n[idx], text: e.target.value }; setCurrentTFNG({ ...currentTFNG, statements: n }); }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" placeholder="Statement text..." />
                                                    <select value={s.answer}
                                                        onChange={e => { const n = [...currentTFNG.statements]; n[idx] = { ...n[idx], answer: e.target.value }; setCurrentTFNG({ ...currentTFNG, statements: n }); }}
                                                        className="w-32 border border-green-300 rounded-lg px-2 py-2 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none">
                                                        <option value="TRUE">TRUE</option>
                                                        <option value="FALSE">FALSE</option>
                                                        <option value="NOT GIVEN">NOT GIVEN</option>
                                                    </select>
                                                    <button type="button" onClick={() => setCurrentTFNG({ ...currentTFNG, statements: currentTFNG.statements.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentTFNG({ ...currentTFNG, statements: [...currentTFNG.statements, { text: "", answer: "TRUE" }] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Statement
                                            </button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update TFNG" : `Add TFNG to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── HEADING MATCH ── */}
                                {selectedType === 'heading-match' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentHeadingMatch.points}
                                                onChange={e => setCurrentHeadingMatch({ ...currentHeadingMatch, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                                            <input type="text" value={currentHeadingMatch.instructions}
                                                onChange={e => setCurrentHeadingMatch({ ...currentHeadingMatch, instructions: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">List of Headings</label>
                                            {currentHeadingMatch.headings.map((h, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 w-5">i{idx + 1}.</span>
                                                    <input type="text" value={h}
                                                        onChange={e => { const n = [...currentHeadingMatch.headings]; n[idx] = e.target.value; setCurrentHeadingMatch({ ...currentHeadingMatch, headings: n }); }}
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" placeholder={`Heading ${idx + 1}...`} />
                                                    <button type="button" onClick={() => setCurrentHeadingMatch({ ...currentHeadingMatch, headings: currentHeadingMatch.headings.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentHeadingMatch({ ...currentHeadingMatch, headings: [...currentHeadingMatch.headings, ""] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Heading
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Paragraphs <span className="text-gray-400 font-normal">(label + correct heading number)</span></label>
                                            {currentHeadingMatch.paragraphs.map((p, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <input type="text" value={p.label}
                                                        onChange={e => { const n = [...currentHeadingMatch.paragraphs]; n[idx] = { ...n[idx], label: e.target.value }; setCurrentHeadingMatch({ ...currentHeadingMatch, paragraphs: n }); }}
                                                        className="w-12 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" placeholder="A" />
                                                    <span className="text-xs text-gray-400">→ Heading</span>
                                                    <select value={p.correctHeading}
                                                        onChange={e => { const n = [...currentHeadingMatch.paragraphs]; n[idx] = { ...n[idx], correctHeading: parseInt(e.target.value) }; setCurrentHeadingMatch({ ...currentHeadingMatch, paragraphs: n }); }}
                                                        className="w-24 border border-green-300 rounded-lg px-2 py-2 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none">
                                                        {currentHeadingMatch.headings.map((_, hIdx) => (
                                                            <option key={hIdx} value={hIdx}>i{hIdx + 1}</option>
                                                        ))}
                                                    </select>
                                                    <button type="button" onClick={() => setCurrentHeadingMatch({ ...currentHeadingMatch, paragraphs: currentHeadingMatch.paragraphs.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentHeadingMatch({ ...currentHeadingMatch, paragraphs: [...currentHeadingMatch.paragraphs, { label: String.fromCharCode(65 + currentHeadingMatch.paragraphs.length), correctHeading: 0 }] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Paragraph
                                            </button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update Heading Match" : `Add Heading Match to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── WORD BOX FILL ── */}
                                {selectedType === 'word-box-fill' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentWordBoxFill.points}
                                                onChange={e => setCurrentWordBoxFill({ ...currentWordBoxFill, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                                            <input type="text" value={currentWordBoxFill.instructions}
                                                onChange={e => setCurrentWordBoxFill({ ...currentWordBoxFill, instructions: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Word Bank <span className="text-gray-400 font-normal">(space-separated)</span></label>
                                            <input type="text" value={currentWordBoxFill.wordBank}
                                                onChange={e => setCurrentWordBoxFill({ ...currentWordBoxFill, wordBank: e.target.value })}
                                                className="w-full border border-dashed border-[#010080]/40 bg-blue-50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none font-mono text-sm"
                                                placeholder="bias  transparency  replace  diagnoses  error  diversity" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Summary Text <span className="text-gray-400 font-normal">(use (25) ___ for numbered blanks)</span></label>
                                            <textarea value={currentWordBoxFill.summaryText}
                                                onChange={e => setCurrentWordBoxFill({ ...currentWordBoxFill, summaryText: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" rows={5}
                                                placeholder="AI systems now play a role in decisions... including medical (25) ___. Supporters argue such systems can reduce (26) ___..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Answer Key</label>
                                            {currentWordBoxFill.answers.map((a, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-500 w-8">({a.number})</span>
                                                    <input type="text" value={a.answer}
                                                        onChange={e => { const n = [...currentWordBoxFill.answers]; n[idx] = { ...n[idx], answer: e.target.value }; setCurrentWordBoxFill({ ...currentWordBoxFill, answers: n }); }}
                                                        className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" placeholder="Correct word" />
                                                    <button type="button" onClick={() => setCurrentWordBoxFill({ ...currentWordBoxFill, answers: currentWordBoxFill.answers.filter((_, i) => i !== idx) })}
                                                        className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setCurrentWordBoxFill({ ...currentWordBoxFill, answers: [...currentWordBoxFill.answers, { number: currentWordBoxFill.answers.length + 1, answer: "" }] })}
                                                className="text-[#010080] text-sm font-bold flex items-center gap-1 hover:underline">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Answer Slot
                                            </button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update Word Box Fill" : `Add Word Box Fill to Section ${currentStep}`}
                                        </button>
                                    </div>
                                )}

                                {/* ── TABLE ESSAY (Writing Task 1) ── */}
                                {selectedType === 'table-essay' && (
                                    <div className="space-y-5">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <label className="text-xs font-semibold text-gray-500">Total Marks</label>
                                            <input type="number" value={currentTableEssay.points}
                                                onChange={e => setCurrentTableEssay({ ...currentTableEssay, points: parseInt(e.target.value) || 0 })}
                                                className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" min="1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title / Context</label>
                                            <textarea value={currentTableEssay.title}
                                                onChange={e => setCurrentTableEssay({ ...currentTableEssay, title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" rows={2}
                                                placeholder="The table below shows the percentage of households with access to home internet in four countries..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                                            <input type="text" value={currentTableEssay.instructions}
                                                onChange={e => setCurrentTableEssay({ ...currentTableEssay, instructions: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Table</label>
                                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                <div className="bg-[#010080] p-2 flex gap-2">
                                                    {currentTableEssay.tableHeaders.map((h, idx) => (
                                                        <input key={idx} type="text" value={h}
                                                            onChange={e => { const n = [...currentTableEssay.tableHeaders]; n[idx] = e.target.value; setCurrentTableEssay({ ...currentTableEssay, tableHeaders: n }); }}
                                                            className="flex-1 bg-white/10 text-white placeholder-white/50 rounded px-2 py-1 text-xs font-bold outline-none border border-white/20" placeholder={`Header ${idx + 1}`} />
                                                    ))}
                                                    <button type="button" onClick={() => setCurrentTableEssay({ ...currentTableEssay, tableHeaders: [...currentTableEssay.tableHeaders, ""], tableRows: currentTableEssay.tableRows.map(r => [...r, ""]) })}
                                                        className="text-white/70 hover:text-white text-xs font-bold px-2">+ Col</button>
                                                </div>
                                                {currentTableEssay.tableRows.map((row, rIdx) => (
                                                    <div key={rIdx} className="flex gap-2 p-2 border-b border-gray-100 bg-white">
                                                        {row.map((cell, cIdx) => (
                                                            <input key={cIdx} type="text" value={cell}
                                                                onChange={e => { const n = currentTableEssay.tableRows.map((r, ri) => ri === rIdx ? r.map((c, ci) => ci === cIdx ? e.target.value : c) : r); setCurrentTableEssay({ ...currentTableEssay, tableRows: n }); }}
                                                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#010080]" placeholder={`Cell`} />
                                                        ))}
                                                        <button type="button" onClick={() => setCurrentTableEssay({ ...currentTableEssay, tableRows: currentTableEssay.tableRows.filter((_, i) => i !== rIdx) })}
                                                            className="text-red-300 hover:text-red-500 text-xs">✕</button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setCurrentTableEssay({ ...currentTableEssay, tableRows: [...currentTableEssay.tableRows, currentTableEssay.tableHeaders.map(() => "")] })}
                                                    className="w-full text-[#010080] text-xs font-bold py-2 hover:bg-blue-50 transition-colors">+ Add Row</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Words Required</label>
                                            <input type="number" value={currentTableEssay.minWords}
                                                onChange={e => setCurrentTableEssay({ ...currentTableEssay, minWords: parseInt(e.target.value) || 150 })}
                                                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none" />
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                            {editingIndex !== null ? "Update Table Essay" : `Add Table Essay to Section ${currentStep}`}
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

                                {currentStep < steps.length ? (
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
                        </div>{/* end lg:col-span-3 */}

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 border-l border-gray-100 pl-6">
                            <div className="sticky top-8 flex flex-col h-[calc(100vh-120px)]">
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Test Overview</h2>
                                    <p className="text-[10px] text-[#010080]/60 font-semibold uppercase tracking-widest mt-1">Summary by Section</p>
                                </div>

                                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 space-y-4 mb-6">
                                    {steps.map((step, stepIdx) => {
                                        const partNum = stepIdx + 1;
                                        const partQuestions = sortByQuestionNumber(
                                            questions.filter((q) => q.part === partNum)
                                        );
                                        const isActivePart = currentStep === partNum;
                                        return (
                                            <div key={partNum} className={`bg-white rounded-xl border transition-all p-4 shadow-sm ${isActivePart ? 'border-[#010080] ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-50">
                                                    <h3 className={`text-[10px] font-bold uppercase tracking-wide ${isActivePart ? 'text-[#010080]' : 'text-gray-400'}`}>
                                                        {step.title}
                                                    </h3>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isActivePart ? 'bg-[#010080] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {partQuestions.length}
                                                    </span>
                                                </div>
                                                {partQuestions.length === 0 ? (
                                                    <p className="text-[9px] text-gray-300 italic">No questions yet</p>
                                                ) : partQuestions.map((q, idx) => {
                                                    const originalIndex = questions.indexOf(q);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => { setCurrentStep(partNum); handleEdit(originalIndex); }}
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

                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="bg-[#010080] rounded-xl p-4 flex flex-col gap-1 shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-6 -mt-6"></div>
                                        <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest relative z-10">Total Marks</span>
                                        <span className="text-2xl font-black text-white leading-none relative z-10">{totalMarks}</span>
                                        <span className="text-[9px] text-blue-300 relative z-10">{questions.length} questions · {steps.length} sections</span>
                                    </div>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={isCreating || isUpdating}
                                        className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-amber-200/50 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {isCreating || isUpdating ? 'Saving...' : 'Save as Draft'}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isCreating || isUpdating || questions.length === 0}
                                        className="w-full bg-[#010080] hover:bg-[#000066] text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isCreating || isUpdating ? 'Processing...' : testId ? 'Update & Publish' : 'Save & Publish'}
                                    </button>
                                </div>
                            </div>
                        </div>{/* end sidebar */}
                    </div>{/* end grid */}
                </div>
            </div>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
        </div>
    );
}
