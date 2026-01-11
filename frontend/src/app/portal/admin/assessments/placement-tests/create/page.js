"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePlacementTestMutation } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/components/Toast";
import { v4 as uuidv4 } from "uuid";
import { useDarkMode } from "@/context/ThemeContext";

export default function CreatePlacementTestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isDark } = useDarkMode();
  const [createTest, { isLoading }] = useCreatePlacementTestMutation();

  const [currentStep, setCurrentStep] = useState(1);

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    status: "active",
  });

  const [questions, setQuestions] = useState([]);
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

  const steps = [
    { title: "Part 1: MCQ", type: "mcq" },
    { title: "Part 2: Passage", type: "passage" },
    { title: "Part 3: Essay", type: "essay" },
    { title: "Part 4: Final MCQ", type: "mcq" },
  ];

  const handleTestChange = (e) => {
    setTestData({ ...testData, [e.target.name]: e.target.value });
  };

  const addToTestList = () => {
    let q = null;
    const type = steps[currentStep - 1].type;
    if (type === "mcq") {
      if (!currentMCQ.questionText || currentMCQ.options.some(o => !o)) {
        return showToast("Fill all MCQ fields", "error");
      }
      q = { ...currentMCQ, part: currentStep };
    } else if (type === "passage") {
      if (!currentPassage.passageText || currentPassage.subQuestions.length === 0) {
        return showToast("Add passage text and sub-questions", "error");
      }
      const totalPoints = currentPassage.subQuestions.reduce((acc, sq) => acc + (parseInt(sq.points) || 0), 0);
      q = { ...currentPassage, points: totalPoints, part: currentStep };
    } else if (type === "essay") {
      if (!currentEssay.title) {
        return showToast("Add essay title", "error");
      }
      q = { ...currentEssay, part: currentStep };
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

    // Reset
    if (type === "mcq") setCurrentMCQ({ id: uuidv4(), type: "mcq", questionText: "", options: ["", ""], correctOption: 0, points: 5 });
    else if (type === "passage") setCurrentPassage({ id: uuidv4(), type: "passage", passageText: "", subQuestions: [], points: 0 });
    else setCurrentEssay({ id: uuidv4(), type: "essay", title: "", description: "", maxWords: 250, points: 10 });
  };

  const handleEdit = (idx) => {
    const q = questions[idx];
    if (q.type === "mcq") setCurrentMCQ(q);
    else if (q.type === "passage") setCurrentPassage(q);
    else setCurrentEssay(q);
    setEditingIndex(idx);
  };

  const nextStep = () => {
    // Validate current step has at least one question
    const stepQuestions = questions.filter(q => q.part === currentStep);
    if (stepQuestions.length === 0) {
      return showToast(`Please add at least one question for ${steps[currentStep - 1].title}`, "error");
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!testData.title) return showToast("Title is required", "error");
    if (questions.filter(q => q.part === 4).length === 0) return showToast("Please add at least one question for Part 4", "error");

    try {
      await createTest({ ...testData, questions }).unwrap();
      showToast("Placement Test Created Successfully!", "success");
      router.push("/portal/admin/assessments/placement-tests");
    } catch (err) {
      showToast("Failed to create test", "error");
    }
  };

  const totalMarks = questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);

  // Step Progress Component
  const StepIndicator = () => (
    <div className="bg-white py-20 px-10 rounded-2xl shadow-sm border border-gray-200 mb-12">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4">
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
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors mt-6">
        <div className="w-full px-8 py-6">
          {/* Header Section */}
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
              <h1 className="text-3xl font-bold text-gray-900">Create Placement Test</h1>
              <p className="mt-2 text-gray-600">Complete the 4-part process to build a comprehensive placement test.</p>
            </div>
          </div>

          <StepIndicator />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Test Details & Question Form */}
            <div className="lg:col-span-3 space-y-6">

              {/* 1. Test Details (Persistent across steps) */}
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
                      placeholder="e.g., General English Placement Test"
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
                      rows="3"
                      placeholder="Enter a brief description..."
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Marks ({steps[currentStep - 1].title})</label>
                      <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-[#010080] font-bold">
                        {questions.filter(q => q.part === currentStep).reduce((acc, q) => acc + (parseInt(q.points) || 0), 0)} Points
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Question Forms */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {editingIndex !== null ? `Edit Question` : `Add ${steps[currentStep - 1].title} Question`}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    Step {currentStep} of 4
                  </span>
                </h2>

                {/* MCQ Form (Steps 1 and 4) */}
                {steps[currentStep - 1].type === 'mcq' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                      <textarea
                        value={currentMCQ.questionText}
                        onChange={e => setCurrentMCQ({ ...currentMCQ, questionText: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                        rows="2"
                        placeholder="Type your question here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Marks for this question</label>
                      <input
                        type="number"
                        value={currentMCQ.points}
                        onChange={e => setCurrentMCQ({ ...currentMCQ, points: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                        min="1"
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

                {/* Passage Form (Step 2) */}
                {steps[currentStep - 1].type === 'passage' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reading Passage</label>
                      <textarea
                        value={currentPassage.passageText}
                        onChange={e => setCurrentPassage({ ...currentPassage, passageText: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                        rows="4"
                        placeholder="Paste your text passage here..."
                      />
                    </div>

                    <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-700">MCQ Sub-questions</span>
                        <button
                          onClick={() => {
                            const sub = { id: uuidv4(), questionText: "", options: ["", ""], correctOption: 0, points: 2 };
                            setCurrentPassage({ ...currentPassage, subQuestions: [...currentPassage.subQuestions, sub] });
                          }}
                          className="bg-[#010080] text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider shadow-sm hover:opacity-90 transition-all active:scale-95"
                        >
                          Add MCQ Question
                        </button>
                      </div>
                      {currentPassage.subQuestions.map((sq, i) => (
                        <div key={i} className="p-4 rounded-lg bg-white border border-blue-100 space-y-3 mb-3 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-[#010080] uppercase">Question {i + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Marks</span>
                              <input
                                type="number"
                                value={sq.points}
                                onChange={e => {
                                  const next = [...currentPassage.subQuestions];
                                  next[i].points = parseInt(e.target.value) || 0;
                                  setCurrentPassage({ ...currentPassage, subQuestions: next });
                                }}
                                className="w-10 text-xs font-medium text-center border-b border-blue-200 bg-transparent outline-none"
                              />
                            </div>
                          </div>
                          <input
                            value={sq.questionText}
                            onChange={e => {
                              const next = [...currentPassage.subQuestions];
                              next[i].questionText = e.target.value;
                              setCurrentPassage({ ...currentPassage, subQuestions: next });
                            }}
                            className="w-full text-sm font-medium outline-none border-b border-gray-100 py-1"
                            placeholder="Type sub-question here..."
                          />
                          <div className="space-y-2">
                            {sq.options.map((o, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sq.correctOption === oi}
                                  onChange={() => {
                                    const next = [...currentPassage.subQuestions];
                                    next[i] = { ...next[i], correctOption: oi };
                                    setCurrentPassage({ ...currentPassage, subQuestions: next });
                                  }}
                                  className="accent-[#010080]"
                                />
                                <input
                                  value={o}
                                  onChange={e => {
                                    const next = [...currentPassage.subQuestions];
                                    const updatedOptions = [...next[i].options];
                                    updatedOptions[oi] = e.target.value;
                                    next[i] = { ...next[i], options: updatedOptions };
                                    setCurrentPassage({ ...currentPassage, subQuestions: next });
                                  }}
                                  className="flex-1 text-xs border-b border-gray-50 outline-none py-1 font-normal"
                                  placeholder={`Option ${oi + 1}`}
                                />
                                {sq.options.length > 2 && (
                                  <button
                                    onClick={() => {
                                      const next = [...currentPassage.subQuestions];
                                      const updatedOptions = next[i].options.filter((_, idx) => idx !== oi);
                                      next[i] = { ...next[i], options: updatedOptions, correctOption: next[i].correctOption >= updatedOptions.length ? 0 : next[i].correctOption };
                                      setCurrentPassage({ ...currentPassage, subQuestions: next });
                                    }}
                                    className="text-red-300 hover:text-red-500 font-medium text-xs"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const next = [...currentPassage.subQuestions];
                                const updatedOptions = [...next[i].options, ""];
                                next[i] = { ...next[i], options: updatedOptions };
                                setCurrentPassage({ ...currentPassage, subQuestions: next });
                              }}
                              className="text-xs text-[#010080] font-semibold"
                            >
                              + ADD OPTION
                            </button>
                          </div>
                          <div className="flex justify-end pt-1 border-t border-gray-50">
                            <button
                              onClick={() => {
                                const next = currentPassage.subQuestions.filter((_, idx) => idx !== i);
                                setCurrentPassage({ ...currentPassage, subQuestions: next });
                              }}
                              className="text-xs text-red-400 font-medium hover:text-red-600"
                            >
                              Remove Question
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addToTestList}
                      className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {editingIndex !== null ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Update Passage
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Add Passage to Part {currentStep}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Essay Form (Step 3) */}
                {steps[currentStep - 1].type === 'essay' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Essay Prompt Title</label>
                      <input
                        value={currentEssay.title}
                        onChange={e => setCurrentEssay({ ...currentEssay, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                        placeholder="e.g., My Career Aspirations"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                      <textarea
                        value={currentEssay.description}
                        onChange={e => setCurrentEssay({ ...currentEssay, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                        rows="3"
                        placeholder="Describe the task..."
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
                      {editingIndex !== null ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Update Essay
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Add Essay to Part {currentStep}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
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

                {currentStep < 4 ? (
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

            {/* Right Column: Independent Question Boxes */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar pr-2">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Test Overview</h2>
                  <p className="text-[10px] text-[#010080]/60 font-semibold uppercase tracking-widest mt-1">Independent Sections</p>
                </div>

                {[1, 2, 3, 4].map(partNum => {
                  const partQuestions = questions.filter(q => q.part === partNum);
                  const isActivePart = currentStep === partNum;

                  return (
                    <div
                      key={partNum}
                      className={`bg-white rounded-xl border transition-all p-6 shadow-sm relative ${isActivePart ? 'border-[#010080] ring-2 ring-blue-100 shadow-md z-10' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                        <h3 className={`text-[11px] font-bold uppercase tracking-wide ${isActivePart ? 'text-[#010080]' : 'text-gray-400'}`}>
                          {partNum === 1 ? 'Part 1: MCQ' : partNum === 2 ? 'Part 2: Passage' : partNum === 3 ? 'Part 3: Essay' : 'Part 4: Final MCQ'}
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${isActivePart ? 'bg-[#010080] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {partQuestions.length}
                        </span>
                      </div>

                      {partQuestions.length === 0 ? (
                        <p className="text-[10px] text-gray-300 italic py-2">No questions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {partQuestions.map((q, idx) => {
                            const originalIndex = questions.indexOf(q);
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setCurrentStep(partNum);
                                  handleEdit(originalIndex);
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${editingIndex === originalIndex ? 'bg-[#010080]/5 border-[#010080] shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-blue-200'}`}
                              >
                                <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-2">
                                  {q.type === 'passage'
                                    ? (q.passageText || q.passage || q.questionText || "Passage Content")
                                    : q.type === 'mcq'
                                      ? (q.questionText || q.question || "MCQ Question")
                                      : (q.title || q.questionText || q.question || "Essay Prompt")}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">{q.type}</span>
                                  <span className="text-[10px] font-bold text-[#010080]">{q.points} PTS</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total Summary Card */}
                <div className="bg-[#010080] rounded-2xl border-none p-5 flex flex-col gap-1 shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700"></div>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] relative z-10">Calculated Weight</span>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-2xl font-bold text-white leading-none">{totalMarks}</span>
                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Total Marks</span>
                  </div>
                </div>

                {/* Final Submit Button (Only in Step 4) */}
                {currentStep === 4 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transform animate-in slide-in-from-bottom-4 transition-all hover:shadow-lg">
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || questions.filter(q => q.part === 4).length === 0}
                      className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3.5 rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                      {isLoading ? 'Finalizing...' : 'Save Final Test'}
                    </button>
                    {questions.filter(q => q.part === 4).length === 0 && (
                      <p className="text-[10px] text-red-500 font-bold text-center mt-3 uppercase tracking-tighter">
                        Add at least one MCQ to Part 4 to finish
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}
