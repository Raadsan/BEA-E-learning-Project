"use client";

import { v4 as uuidv4 } from "uuid";

export type PassageSubQuestion = {
  id?: string;
  questionText: string;
  options: string[];
  correctOption: number;
  points: number;
};

type PassageSubQuestionsEditorProps = {
  subQuestions: PassageSubQuestion[];
  onChange: (subQuestions: PassageSubQuestion[]) => void;
};

export default function PassageSubQuestionsEditor({
  subQuestions,
  onChange,
}: PassageSubQuestionsEditorProps) {
  const updateAt = (index: number, patch: Partial<PassageSubQuestion>) => {
    onChange(
      subQuestions.map((sq, i) => (i === index ? { ...sq, ...patch } : sq))
    );
  };

  const addSubQuestion = () => {
    onChange([
      ...subQuestions,
      {
        id: uuidv4(),
        questionText: "",
        options: ["", ""],
        correctOption: 0,
        points: 2,
      },
    ]);
  };

  const removeSubQuestion = (index: number) => {
    onChange(subQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">
          MCQ Sub-questions
        </span>
        <button
          type="button"
          onClick={addSubQuestion}
          className="text-sm text-[#010080] font-semibold hover:underline"
        >
          + Add MCQ Question
        </button>
      </div>

      {subQuestions.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
          No sub-questions yet. Click &quot;+ Add MCQ Question&quot; to add one.
        </p>
      ) : (
        subQuestions.map((sq, i) => (
          <div
            key={sq.id || i}
            className="p-5 rounded-xl border border-gray-200 bg-white space-y-5 shadow-sm"
          >
            <div className="flex justify-between items-center gap-3">
              <span className="text-sm font-bold text-[#010080]">
                Sub-question {i + 1}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={sq.points}
                    onChange={(e) =>
                      updateAt(i, { points: parseInt(e.target.value) || 0 })
                    }
                    className="w-14 h-8 text-sm text-center border border-gray-300 rounded-lg px-2 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-colors"
                    min="1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubQuestion(i)}
                  className="text-sm text-red-400 font-semibold hover:text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={sq.questionText}
                onChange={(e) => updateAt(i, { questionText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                rows={2}
                placeholder="Type your question here..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Options{" "}
                <span className="text-gray-400 font-normal">
                  (Mark the correct answer)
                </span>
              </label>
              {sq.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={sq.correctOption === oi}
                    onChange={() => updateAt(i, { correctOption: oi })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const nextOptions = [...sq.options];
                      nextOptions[oi] = e.target.value;
                      updateAt(i, { options: nextOptions });
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-colors"
                    placeholder={`Option ${oi + 1}`}
                  />
                  {sq.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextOptions = sq.options.filter(
                          (_, idx) => idx !== oi
                        );
                        const nextCorrect =
                          sq.correctOption >= nextOptions.length
                            ? 0
                            : sq.correctOption;
                        updateAt(i, {
                          options: nextOptions,
                          correctOption: nextCorrect,
                        });
                      }}
                      className="text-red-400 font-bold px-2 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateAt(i, { options: [...sq.options, ""] })
                }
                className="text-sm text-[#010080] font-semibold hover:underline"
              >
                + Add Option
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
