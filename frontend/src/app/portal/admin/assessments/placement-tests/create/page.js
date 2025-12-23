"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePlacementTestMutation } from "@/redux/api/placementTestApi";
import AdminHeader from "@/components/AdminHeader";
import { useToast } from "@/components/Toast";

export default function CreatePlacementTestPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [createTest, { isLoading }] = useCreatePlacementTestMutation();

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    status: "active",
  });

  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
    points: 1,
  });

  const handleTestChange = (e) => {
    setTestData({ ...testData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, questionText: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some((opt) => !opt)) {
      showToast("Please fill in the question and all options.", "error");
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
      showToast("Question updated successfully", "success");
    } else {
      setQuestions([...questions, currentQuestion]);
      showToast("Question added successfully", "success");
    }

    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctOption: 0,
      points: 1,
    });
    setEditingIndex(null);
  };

  const handleSelectQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
  };

  const removeQuestion = (e, index) => {
    e.stopPropagation();
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetQuestionForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      showToast("Please add at least one question.", "error");
      return;
    }

    try {
      await createTest({ ...testData, questions }).unwrap();
      showToast("Placement Test Created Successfully!", "success");
      router.push("/portal/admin/assessments/placement-tests");
    } catch (err) {
      showToast("Failed to create test.", "error");
      console.error(err);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-6 pt-20">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Placement Test</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Test Details & Question Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Test Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-[#010080]">Test Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                  <input
                    type="text"
                    name="title"
                    value={testData.title}
                    onChange={handleTestChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                    placeholder="e.g., General English Placement Test"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={testData.description}
                    onChange={handleTestChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                    rows="3"
                    placeholder="Brief description of the test..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration_minutes"
                      value={testData.duration_minutes}
                      onChange={handleTestChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={testData.status}
                      onChange={handleTestChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Add/Edit Question Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-[#010080]">
                {editingIndex !== null ? `Edit Question #${editingIndex + 1}` : "Add Question"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={currentQuestion.questionText}
                    onChange={handleQuestionChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                    rows="2"
                    placeholder="Enter the question here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Marks / Points</label>
                  <input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#010080] focus:border-[#010080]"
                    min="1"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Options (Select the correct answer)</label>
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={currentQuestion.correctOption === idx}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                        className="w-4 h-4 text-[#010080] focus:ring-[#010080]"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#010080] focus:border-[#010080]"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    className={`flex-1 ${editingIndex !== null ? 'bg-[#010080] text-white hover:bg-[#000066]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} py-2.5 rounded-lg font-medium transition-colors`}
                  >
                    {editingIndex !== null ? 'Update Question' : '+ Add Question'}
                  </button>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={resetQuestionForm}
                      className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Preview & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#010080]">Questions ({questions.length})</h2>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No questions added yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectQuestion(i)}
                      className={`p-3 rounded-lg border cursor-pointer relative group transition-all ${editingIndex === i
                          ? 'bg-blue-50 border-[#010080] shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <button
                        onClick={(e) => removeQuestion(e, i)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Question"
                      >
                        ✕
                      </button>
                      <p className="font-medium text-sm text-gray-900 mb-2">
                        {i + 1}. {q.questionText}
                        <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">{q.points || 1} pts</span>
                      </p>
                      <ul className="pl-4 space-y-1">
                        {q.options.map((opt, oid) => (
                          <li
                            key={oid}
                            className={`text-xs ${oid === q.correctOption ? 'text-green-600 font-semibold' : 'text-gray-500'}`}
                          >
                            {String.fromCharCode(65 + oid)}. {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || questions.length === 0}
                  className="w-full bg-[#010080] hover:bg-[#000066] text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? "Creating..." : "Save & Create Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
