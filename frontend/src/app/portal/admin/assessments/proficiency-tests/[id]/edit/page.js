"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProficiencyTestByIdQuery, useUpdateProficiencyTestMutation } from "@/redux/api/proficiencyTestApi";
import { useUploadFileMutation } from "@/redux/api/uploadApi";

import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { v4 as uuidv4 } from "uuid";
import { useDarkMode } from "@/context/ThemeContext";

export default function EditProficiencyTestPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const { isDark } = useDarkMode();
    const { data: test, isLoading: loadingTest } = useGetProficiencyTestByIdQuery(id);
    const [updateTest, { isLoading: updating }] = useUpdateProficiencyTestMutation();
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

    const [currentStep, setCurrentStep] = useState(1);
    const [testData, setTestData] = useState({
        title: "",
        description: "",
        duration_minutes: 60,
        status: "active",
        level: "Intermediate"
    });

    const [questions, setQuestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    // MCQ state
    const [currentMCQ, setCurrentMCQ] = useState({ id: uuidv4(), type: "mcq", questionText: "", options: ["", ""], correctOption: 0, points: 5 });
    // Passage state
    const [currentPassage, setCurrentPassage] = useState({ id: uuidv4(), type: "passage", passageText: "", subQuestions: [], points: 0 });
    // Essay state
    const [currentEssay, setCurrentEssay] = useState({ id: uuidv4(), type: "essay", title: "", description: "", maxWords: 250, points: 10 });
    // Audio state
    const [currentAudio, setCurrentAudio] = useState({ id: uuidv4(), type: "audio", audioUrl: "", title: "", description: "Listen to the audio and write what you understood.", points: 15 });

    const steps = [
        { title: "Part 1: MCQ", type: "mcq" },
        { title: "Part 2: Passage", type: "passage" },
        { title: "Part 3: Essay", type: "essay" },
        { title: "Part 4: Final MCQ", type: "mcq" },
        { title: "Part 5: Audio", type: "audio" },
    ];

    useEffect(() => {
        if (test) {
            setTestData({
                title: test.title || "",
                description: test.description || "",
                duration_minutes: test.duration_minutes || 60,
                status: test.status || "active",
                level: test.level || "Intermediate"
            });

            const rawQuestions = Array.isArray(test.questions) ? test.questions : [];
            const normalized = rawQuestions.map((q, idx) => {
                let norm = { ...q, id: q.id || uuidv4() };
                if (norm.type === 'multiple_choice') norm.type = 'mcq';

                // Compatibility for legacy property names
                if (norm.type === 'mcq') {
                    norm.questionText = norm.questionText || norm.question || "";
                    if (norm.correct_answer && norm.options) {
                        norm.correctOption = norm.options.indexOf(norm.correct_answer);
                        if (norm.correctOption === -1) norm.correctOption = 0;
                    }
                }
                if (norm.type === 'essay') {
                    norm.title = norm.title || norm.question || "";
                }

                // Auto-assign parts if missing
                if (!norm.part) {
                    if (norm.type === 'passage') norm.part = 2;
                    else if (norm.type === 'essay') norm.part = 3;
                    else if (norm.type === 'audio') norm.part = 5;
                    else norm.part = (idx > rawQuestions.length / 2) ? 4 : 1;
                }
                return norm;
            });
            setQuestions(normalized);
        }
    }, [test]);

    const handleTestChange = (e) => {
        setTestData({ ...testData, [e.target.name]: e.target.value });
    };

    const addToTestList = () => {
        let q = null;
        const type = steps[currentStep - 1].type;

        if (type === "mcq") {
            if (!currentMCQ.questionText || currentMCQ.options.some(o => !o)) return showToast("Fill all MCQ fields", "error");
            q = { ...currentMCQ, part: currentStep };
        } else if (type === "passage") {
            if (!currentPassage.passageText || currentPassage.subQuestions.length === 0) return showToast("Add passage text and sub-questions", "error");
            const totalPoints = currentPassage.subQuestions.reduce((acc, sq) => acc + (parseInt(sq.points) || 0), 0);
            q = { ...currentPassage, points: totalPoints, part: currentStep };
        } else if (type === "essay") {
            if (!currentEssay.title) return showToast("Add essay title", "error");
            q = { ...currentEssay, part: currentStep };
        } else if (type === "audio") {
            if (!currentAudio.title || !currentAudio.audioUrl) return showToast("Add audio title and URL", "error");
            q = { ...currentAudio, part: currentStep };
        }

        if (editingIndex !== null) {
            const updated = [...questions];
            updated[editingIndex] = q;
            setQuestions(updated);
            setEditingIndex(null);
            showToast("Question updated", "success");
        } else {
            setQuestions([...questions, q]);
            showToast("Question added", "success");
        }

        // Reset current form state
        if (type === "mcq") setCurrentMCQ({ id: uuidv4(), type: "mcq", questionText: "", options: ["", ""], correctOption: 0, points: 5 });
        else if (type === "passage") setCurrentPassage({ id: uuidv4(), type: "passage", passageText: "", subQuestions: [], points: 0 });
        else if (type === "essay") setCurrentEssay({ id: uuidv4(), type: "essay", title: "", description: "", maxWords: 250, points: 10 });
        else if (type === "audio") setCurrentAudio({ id: uuidv4(), type: "audio", audioUrl: "", title: "", description: "Listen to the audio and write what you understood.", points: 15 });
    };

    const handleEdit = (idx) => {
        const q = questions[idx];
        if (q.type === "mcq") setCurrentMCQ(q);
        else if (q.type === "passage") setCurrentPassage(q);
        else if (q.type === "essay") setCurrentEssay(q);
        else if (q.type === "audio") setCurrentAudio(q);
        setEditingIndex(idx);
    };

    const removeQuestionFromList = (idx) => {
        const updated = questions.filter((_, i) => i !== idx);
        setQuestions(updated);
        if (editingIndex === idx) setEditingIndex(null);
        showToast("Question removed", "info");
    };

    const nextStep = () => {
        if (questions.filter(q => q.part === currentStep).length === 0) {
            return showToast(`Please add at least one question for ${steps[currentStep - 1].title}`, "error");
        }
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!testData.title) return showToast("Title is required", "error");
        if (questions.filter(q => q.part === 5).length === 0) return showToast("Please add at least for Part 5", "error");

        try {
            await updateTest({ id, ...testData, questions }).unwrap();
            showToast("Proficiency Test Updated Successfully!", "success");
            router.push(`/portal/admin/assessments/proficiency-tests/${id}`);
        } catch (err) {
            showToast("Failed to update test", "error");
        }
    };

    const totalMarks = questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);

    if (loadingTest) return (
        <div className="flex-1 min-h-screen flex flex-col bg-gray-50">
            <div className="flex-1 flex items-center justify-center"><Loader /></div>
        </div>
    );

    return (
        <div className="flex-1 min-h-screen bg-gray-100 flex flex-col text-gray-800">
            <div className="flex-1 overflow-y-auto bg-gray-50 transition-colors mt-6">
                <div className="w-full px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-20">
                        <div>
                            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 mb-3 flex items-center gap-2 transition-colors font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to Details
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Proficiency Test</h1>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="bg-white py-16 px-10 rounded-2xl shadow-sm border border-gray-200 mb-10">
                        <div className="flex items-center justify-between max-w-6xl mx-auto">
                            {steps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const isActive = currentStep === stepNum;
                                const isCompleted = currentStep > stepNum;
                                return (
                                    <div key={idx} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center relative">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-[#010080] text-white shadow-lg' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                                {isCompleted ? "✓" : stepNum}
                                            </div>
                                            <span className={`absolute -bottom-8 text-[10px] font-bold uppercase whitespace-nowrap ${isActive ? 'text-[#010080]' : 'text-gray-400'}`}>{step.title}</span>
                                        </div>
                                        {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-100'}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-6">

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                                    <div className="w-1.5 h-6 bg-[#010080] rounded-full"></div>
                                    General Test Settings
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                        <input type="text" name="title" value={testData.title} onChange={handleTestChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                        <textarea name="description" value={testData.description} onChange={handleTestChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="2" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label><input type="number" name="duration_minutes" value={testData.duration_minutes} onChange={handleTestChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Level</label><select name="level" value={testData.level} onChange={handleTestChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="Elementary">Elementary</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Status</label><select name="status" value={testData.status} onChange={handleTestChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-50 pb-4">{editingIndex !== null ? 'Edit Current Question' : `Add ${steps[currentStep - 1].title} Question`}</h2>

                                {steps[currentStep - 1].type === 'mcq' && (
                                    <div className="space-y-5">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label><textarea value={currentMCQ.questionText} onChange={e => setCurrentMCQ({ ...currentMCQ, questionText: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="2" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Points</label><input type="number" value={currentMCQ.points} onChange={e => setCurrentMCQ({ ...currentMCQ, points: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Options</label>
                                            {currentMCQ.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <input type="radio" checked={currentMCQ.correctOption === idx} onChange={() => setCurrentMCQ({ ...currentMCQ, correctOption: idx })} className="w-4 h-4 text-blue-600" />
                                                    <input type="text" value={opt} onChange={e => { const next = [...currentMCQ.options]; next[idx] = e.target.value; setCurrentMCQ({ ...currentMCQ, options: next }); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                                </div>
                                            ))}
                                            <button onClick={() => setCurrentMCQ({ ...currentMCQ, options: [...currentMCQ.options, ""] })} className="text-xs text-[#010080] font-bold">+ ADD OPTION</button>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] text-white py-3 rounded-lg font-bold">{editingIndex !== null ? 'Update Question' : '+ Add Question to List'}</button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'passage' && (
                                    <div className="space-y-5">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Passage Text</label><textarea value={currentPassage.passageText} onChange={e => setCurrentPassage({ ...currentPassage, passageText: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="6" /></div>
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-gray-700 uppercase">Sub-Questions</span><button onClick={() => { const sub = { id: uuidv4(), questionText: "", options: ["", ""], correctOption: 0, points: 2 }; setCurrentPassage({ ...currentPassage, subQuestions: [...currentPassage.subQuestions, sub] }); }} className="bg-[#010080] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all active:scale-95">+ Add MCQ sub</button></div>
                                            {currentPassage.subQuestions.map((sq, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-white border border-blue-100 space-y-3 mb-3">
                                                    <input value={sq.questionText} onChange={e => { const next = [...currentPassage.subQuestions]; next[i].questionText = e.target.value; setCurrentPassage({ ...currentPassage, subQuestions: next }); }} className="w-full text-sm font-bold outline-none border-b border-gray-50 pb-2" placeholder="Sub-question text..." />
                                                    <div className="space-y-2">
                                                        {sq.options.map((o, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <input type="radio" checked={sq.correctOption === oi} onChange={() => { const next = [...currentPassage.subQuestions]; next[i].correctOption = oi; setCurrentPassage({ ...currentPassage, subQuestions: next }); }} className="accent-[#010080]" />
                                                                <input value={o} onChange={e => { const next = [...currentPassage.subQuestions]; const upd = [...next[i].options]; upd[oi] = e.target.value; next[i].options = upd; setCurrentPassage({ ...currentPassage, subQuestions: next }); }} className="flex-1 text-xs border-b border-gray-50 outline-none" placeholder={`Op ${oi + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2">
                                                        <div className="flex items-center gap-2 font-bold text-[10px]"><span className="text-gray-400">PTS:</span><input type="number" value={sq.points} onChange={e => { const next = [...currentPassage.subQuestions]; next[i].points = parseInt(e.target.value) || 0; setCurrentPassage({ ...currentPassage, subQuestions: next }); }} className="w-10 border-b border-gray-200 text-center outline-none" /></div>
                                                        <button onClick={() => { const next = currentPassage.subQuestions.filter((_, idx) => idx !== i); setCurrentPassage({ ...currentPassage, subQuestions: next }); }} className="text-[10px] text-red-500 font-bold">REMOVE</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] text-white py-3 rounded-lg font-bold">{editingIndex !== null ? 'Update Passage' : '+ Add Passage to List'}</button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'essay' && (
                                    <div className="space-y-5">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Title</label><input value={currentEssay.title} onChange={e => setCurrentEssay({ ...currentEssay, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Prompt</label><textarea value={currentEssay.description} onChange={e => setCurrentEssay({ ...currentEssay, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="4" /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Max Words</label><input type="number" value={currentEssay.maxWords} onChange={e => setCurrentEssay({ ...currentEssay, maxWords: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Points</label><input type="number" value={currentEssay.points} onChange={e => setCurrentEssay({ ...currentEssay, points: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        </div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] text-white py-3 rounded-lg font-bold">Save Essay</button>
                                    </div>
                                )}

                                {steps[currentStep - 1].type === 'audio' && (
                                    <div className="space-y-5">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Audio Title</label><input value={currentAudio.title} onChange={e => setCurrentAudio({ ...currentAudio, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Audio MP3/Stream URL / Upload</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={currentAudio.audioUrl}
                                                    onChange={e => setCurrentAudio({ ...currentAudio, audioUrl: e.target.value })}
                                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
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
                                                        <source src={`http://localhost:5000${currentAudio.audioUrl}`} />
                                                    </audio>
                                                </div>
                                            )}
                                        </div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Writing Instructions</label><textarea value={currentAudio.description} onChange={e => setCurrentAudio({ ...currentAudio, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" rows="3" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Points</label><input type="number" value={currentAudio.points} onChange={e => setCurrentAudio({ ...currentAudio, points: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
                                        <button onClick={addToTestList} className="w-full bg-[#010080] text-white py-3 rounded-lg font-bold">Save Audio</button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-6">
                                <button onClick={prevStep} disabled={currentStep === 1} className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-500 disabled:opacity-30">Previous Part</button>
                                {currentStep < 5 ? (
                                    <button onClick={nextStep} className="px-10 py-3 bg-[#010080] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 active:scale-95">Next Part</button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={updating} className="px-12 py-3 bg-[#010080] text-white rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-blue-900/40 active:scale-95">Update All Content</button>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
                                <h3 className="text-lg font-bold text-gray-900 px-2 tracking-tight">Part Overview</h3>
                                {[1, 2, 3, 4, 5].map(pNum => {
                                    const pQs = questions.filter(q => q.part === pNum);
                                    const isActive = currentStep === pNum;
                                    return (
                                        <div key={pNum} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${isActive ? 'border-[#010080] ring-1 ring-[#010080]' : 'border-gray-200'}`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#010080]' : 'text-gray-400'}`}>Part {pNum}</span>
                                                <span className="text-[10px] font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{pQs.length}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {pQs.map((q, qIdx) => {
                                                    const realIdx = questions.indexOf(q);
                                                    return (
                                                        <div key={qIdx} className={`group p-2.5 rounded-lg border text-[10px] font-bold relative transition-all cursor-pointer ${editingIndex === realIdx ? 'bg-[#010080] text-white border-[#010080]' : 'bg-gray-50 border-gray-50 hover:border-blue-200'}`} onClick={() => { setCurrentStep(pNum); handleEdit(realIdx); }}>
                                                            <span className="line-clamp-1">{q.type === 'passage' ? "Reading Passage" : q.type === 'mcq' ? (q.questionText || "MCQ Question") : (q.title || "Subjective Q")}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); removeQuestionFromList(realIdx); }} className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">✕</button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="bg-[#010080] rounded-2xl p-5 text-white shadow-xl shadow-blue-900/30">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Total Marks</p>
                                    <p className="text-3xl font-bold">{totalMarks} <span className="text-xs text-blue-300">PTS</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
