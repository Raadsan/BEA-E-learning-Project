"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type SubQuestionType = "mcq" | "tfng" | "fill_blank" | "word_box_fill" | "heading_match";

export type PassageSubQuestion = {
  id?: string;
  type?: SubQuestionType;
  groupInstruction?: string; // e.g. "Questions 21–24: Choose the correct letter, A, B, C or D."
  questionText: string;
  options?: string[];
  correctOption?: number;
  // For TFNG:
  tfngAnswer?: "TRUE" | "FALSE" | "NOT GIVEN";
  // For Fill Blank / Short Answer:
  blankAnswer?: string;
  // For Word Box Fill:
  wordBank?: string;
  summaryText?: string;
  wordBoxAnswers?: { number: number; answer: string }[];
  // For Heading Match:
  headingsList?: string[];
  paragraphLabel?: string;
  correctHeadingIdx?: number;
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
  const [activeTypeToAdd, setActiveTypeToAdd] = useState<SubQuestionType>("mcq");

  const updateAt = (index: number, patch: Partial<PassageSubQuestion>) => {
    onChange(
      subQuestions.map((sq, i) => (i === index ? { ...sq, ...patch } : sq))
    );
  };

  const addSubQuestion = (type: SubQuestionType = activeTypeToAdd) => {
    const newId = uuidv4();
    let newSq: PassageSubQuestion = {
      id: newId,
      type,
      questionText: "",
      points: 1,
    };

    if (type === "mcq") {
      newSq = {
        ...newSq,
        groupInstruction: "Choose the correct letter, A, B, C or D.",
        options: ["", "", "", ""],
        correctOption: 0,
      };
    } else if (type === "tfng") {
      newSq = {
        ...newSq,
        groupInstruction: "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
        questionText: "",
        tfngAnswer: "TRUE",
      };
    } else if (type === "fill_blank") {
      newSq = {
        ...newSq,
        groupInstruction: "Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
        questionText: "",
        blankAnswer: "",
      };
    } else if (type === "word_box_fill") {
      newSq = {
        ...newSq,
        groupInstruction: "Complete the summary below using words from the box. There are more words than you need.",
        wordBank: "bias transparency replace diagnoses error diversity regulation invisible",
        summaryText: "AI systems now play a role in decisions once made only by humans, including medical (1) ___.",
        wordBoxAnswers: [{ number: 1, answer: "" }],
        points: 5,
      };
    } else if (type === "heading_match") {
      newSq = {
        ...newSq,
        groupInstruction: "Choose the correct heading for each paragraph from the list of headings below.",
        headingsList: ["i. Heading 1", "ii. Heading 2", "iii. Heading 3"],
        paragraphLabel: "Paragraph A",
        correctHeadingIdx: 0,
      };
    }

    onChange([...subQuestions, newSq]);
  };

  const removeSubQuestion = (index: number) => {
    onChange(subQuestions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Add Selector */}
      <div className="bg-blue-50/70 dark:bg-gray-800/60 p-4 rounded-xl border border-blue-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#010080]" />
              Passage Sub-Questions ({subQuestions.length})
            </h4>
            <p className="text-xs text-gray-500">
              Add multiple question types (MCQs, True/False/Not Given, Blanks, Word-Box Summary) directly attached to this passage.
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded bg-[#010080] text-white">
            Total: {subQuestions.reduce((a, b) => a + (parseInt(b.points as any) || 0), 0)} Marks
          </span>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-100/60 dark:border-gray-700">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mr-1">+ Add Question:</span>
          {[
            { type: "mcq" as SubQuestionType, label: "MCQ (A/B/C/D)", icon: "🔘" },
            { type: "tfng" as SubQuestionType, label: "True / False / NG", icon: "⚖️" },
            { type: "fill_blank" as SubQuestionType, label: "Fill in Blanks", icon: "✏️" },
            { type: "word_box_fill" as SubQuestionType, label: "Summary Word-Box", icon: "📦" },
            { type: "heading_match" as SubQuestionType, label: "Heading Match", icon: "📑" },
          ].map((btn) => (
            <button
              key={btn.type}
              type="button"
              onClick={() => addSubQuestion(btn.type)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-gray-700 text-[#010080] dark:text-blue-300 border border-gray-200 dark:border-gray-600 hover:border-[#010080] hover:bg-[#010080] hover:text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {subQuestions.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-sm font-semibold text-gray-500 mb-2">No sub-questions added yet to this passage.</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
            Passages in proficiency tests usually have multiple question groups like Questions 1–5 (True/False/NG) and Questions 6–10 (MCQs).
          </p>
          <button
            type="button"
            onClick={() => addSubQuestion("mcq")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#010080] text-white shadow-sm hover:bg-[#000066]"
          >
            + Add First Sub-Question
          </button>
        </div>
      ) : (
        subQuestions.map((sq, i) => {
          const type = sq.type || "mcq";

          return (
            <div
              key={sq.id || i}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-4 shadow-sm hover:border-blue-200 transition-all"
            >
              {/* Top Bar of Sub Question */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#010080] text-white text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                    Question {i + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#010080] uppercase">
                    {type === "tfng" ? "True/False/NG" : type.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Marks:</label>
                    <input
                      type="number"
                      value={sq.points || 1}
                      onChange={(e) => updateAt(i, { points: parseInt(e.target.value) || 0 })}
                      className="w-14 h-8 text-xs font-bold text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#010080]/20"
                      min="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubQuestion(i)}
                    className="text-xs text-red-500 font-bold hover:underline px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Group Instruction Header */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Instruction / Booklet Prompt Header
                </label>
                <input
                  type="text"
                  value={sq.groupInstruction || ""}
                  onChange={(e) => updateAt(i, { groupInstruction: e.target.value })}
                  placeholder="e.g. Questions 21–24: Choose the correct letter, A, B, C or D."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-amber-900 placeholder-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
                />
              </div>

              {/* MCQ TYPE */}
              {type === "mcq" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={sq.questionText || ""}
                      onChange={(e) => updateAt(i, { questionText: e.target.value })}
                      rows={2}
                      placeholder="e.g. According to the passage, AI systems in medicine are best viewed by advocates as:"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none focus:border-[#010080]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600">
                      Options <span className="text-gray-400 font-normal">(Select the radio button for the correct answer)</span>
                    </label>
                    {(sq.options || ["", "", "", ""]).map((opt, oi) => {
                      const letters = ["A", "B", "C", "D", "E", "F"];
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`sub_mcq_correct_${sq.id || i}`}
                            checked={sq.correctOption === oi}
                            onChange={() => updateAt(i, { correctOption: oi })}
                            className="w-4 h-4 accent-[#010080] cursor-pointer"
                          />
                          <span className="w-5 text-xs font-bold text-gray-500">{letters[oi] || oi + 1}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const next = [...(sq.options || [])];
                              next[oi] = e.target.value;
                              updateAt(i, { options: next });
                            }}
                            placeholder={`Option ${letters[oi] || oi + 1}`}
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none"
                          />
                          {(sq.options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = (sq.options || []).filter((_, idx) => idx !== oi);
                                updateAt(i, { options: next, correctOption: Math.min(sq.correctOption || 0, next.length - 1) });
                              }}
                              className="text-gray-400 hover:text-red-500 text-xs px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => updateAt(i, { options: [...(sq.options || []), ""] })}
                      className="text-xs text-[#010080] font-bold hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* TRUE / FALSE / NOT GIVEN TYPE */}
              {type === "tfng" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Statement Text
                    </label>
                    <textarea
                      value={sq.questionText || ""}
                      onChange={(e) => updateAt(i, { questionText: e.target.value })}
                      rows={2}
                      placeholder="e.g. Historians are confident that the story of Kaldi the goat herder is entirely accurate."
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none focus:border-[#010080]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                      Correct Answer Key:
                    </label>
                    <div className="flex items-center gap-3">
                      {(["TRUE", "FALSE", "NOT GIVEN"] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => updateAt(i, { tfngAnswer: choice })}
                          className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                            (sq.tfngAnswer || "TRUE") === choice
                              ? "bg-[#010080] text-white border-[#010080] shadow-sm"
                              : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FILL IN THE BLANKS / SENTENCE COMPLETION */}
              {type === "fill_blank" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Sentence / Stem <span className="text-gray-400 font-normal">(use ___ for the missing gap)</span>
                    </label>
                    <textarea
                      value={sq.questionText || ""}
                      onChange={(e) => updateAt(i, { questionText: e.target.value })}
                      rows={2}
                      placeholder="e.g. Trees and plants help to reduce ___ in areas with heavy vehicle traffic."
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none focus:border-[#010080]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Target Answer Key:
                    </label>
                    <input
                      type="text"
                      value={sq.blankAnswer || ""}
                      onChange={(e) => updateAt(i, { blankAnswer: e.target.value })}
                      placeholder="e.g. airborne pollutants"
                      className="w-full sm:w-80 text-xs font-bold px-3 py-2 rounded-lg border border-green-300 bg-green-50/50 text-green-900 outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              )}

              {/* SUMMARY WORD BOX FILL */}
              {type === "word_box_fill" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Word Bank <span className="text-gray-400 font-normal">(space or comma separated words)</span>
                    </label>
                    <input
                      type="text"
                      value={sq.wordBank || ""}
                      onChange={(e) => updateAt(i, { wordBank: e.target.value })}
                      placeholder="bias transparency replace diagnoses error diversity regulation invisible"
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-dashed border-[#010080]/50 bg-blue-50/40 text-[#010080] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Summary Text <span className="text-gray-400 font-normal">(use (25) ___, (26) ___ for gaps)</span>
                    </label>
                    <textarea
                      value={sq.summaryText || ""}
                      onChange={(e) => updateAt(i, { summaryText: e.target.value })}
                      rows={4}
                      placeholder="AI systems now play a role in decisions once made only by humans, including medical (25) ___..."
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none focus:border-[#010080]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600">
                      Answer Key for Each Numbered Blank
                    </label>
                    {(sq.wordBoxAnswers || [{ number: 1, answer: "" }]).map((ans, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 w-10">({ans.number}):</span>
                        <input
                          type="text"
                          value={ans.answer}
                          onChange={(e) => {
                            const next = [...(sq.wordBoxAnswers || [])];
                            next[aIdx] = { ...next[aIdx], answer: e.target.value };
                            updateAt(i, { wordBoxAnswers: next });
                          }}
                          placeholder="Correct word"
                          className="flex-1 max-w-xs text-xs font-bold px-3 py-1.5 rounded-lg border border-green-300 bg-green-50/50 text-green-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (sq.wordBoxAnswers || []).filter((_, idx) => idx !== aIdx);
                            updateAt(i, { wordBoxAnswers: next });
                          }}
                          className="text-red-400 hover:text-red-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const current = sq.wordBoxAnswers || [];
                        updateAt(i, {
                          wordBoxAnswers: [...current, { number: current.length + 1, answer: "" }],
                        });
                      }}
                      className="text-xs text-[#010080] font-bold hover:underline"
                    >
                      + Add Another Blank Number
                    </button>
                  </div>
                </div>
              )}

              {/* HEADING MATCH TYPE */}
              {type === "heading_match" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Paragraph Identifier (e.g. Paragraph A, Paragraph C)
                    </label>
                    <input
                      type="text"
                      value={sq.paragraphLabel || ""}
                      onChange={(e) => updateAt(i, { paragraphLabel: e.target.value })}
                      placeholder="e.g. Paragraph A"
                      className="w-full sm:w-60 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      List of Headings (Available Options)
                    </label>
                    <div className="space-y-1.5">
                      {(sq.headingsList || [""]).map((h, hi) => (
                        <div key={hi} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-6">i{hi + 1}.</span>
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => {
                              const next = [...(sq.headingsList || [])];
                              next[hi] = e.target.value;
                              updateAt(i, { headingsList: next });
                            }}
                            placeholder={`Heading ${hi + 1}`}
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (sq.headingsList || []).filter((_, idx) => idx !== hi);
                              updateAt(i, { headingsList: next });
                            }}
                            className="text-red-400 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateAt(i, { headingsList: [...(sq.headingsList || []), ""] })}
                        className="text-xs text-[#010080] font-bold hover:underline"
                      >
                        + Add Heading Option
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Correct Heading for this Paragraph:
                    </label>
                    <select
                      value={sq.correctHeadingIdx ?? 0}
                      onChange={(e) => updateAt(i, { correctHeadingIdx: parseInt(e.target.value) || 0 })}
                      className="text-xs font-bold px-3 py-2 rounded-lg border border-green-300 bg-green-50 text-green-900 outline-none"
                    >
                      {(sq.headingsList || []).map((h, hi) => (
                        <option key={hi} value={hi}>
                          i{hi + 1}: {h || `Heading ${hi + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
