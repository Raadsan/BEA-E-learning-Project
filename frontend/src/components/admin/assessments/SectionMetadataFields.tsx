"use client";

type SectionMeta = {
  sectionName: string;
  questions: number;
  format: string;
  marks: number;
  targetScore: string;
  skillsAssessed: string;
};

export const defaultSectionMeta = (format = "MCQs"): SectionMeta => ({
  sectionName: "",
  questions: 1,
  format,
  marks: 1,
  targetScore: "",
  skillsAssessed: "",
});

export const attachSectionMetadata = (questions: any[], sectionMetadata: Record<number, SectionMeta>) =>
  questions.map((question) => ({
    ...question,
    sectionMeta: sectionMetadata[question.part || 1],
  }));

export default function SectionMetadataFields({
  value,
  onChange,
  currentCount,
}: {
  value: SectionMeta;
  onChange: (value: SectionMeta) => void;
  currentCount: number;
}) {
  const set = (key: keyof SectionMeta, nextValue: string | number) =>
    onChange({ ...value, [key]: nextValue });

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#010080]">Section Information</h3>
          <p className="text-xs text-gray-500">Shown to the student when this section starts.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${currentCount >= value.questions ? "bg-amber-100 text-amber-700" : "bg-white text-[#010080]"}`}>
          {currentCount}/{value.questions} questions
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-semibold text-gray-700">Section Name
          <input value={value.sectionName || ""} onChange={(e) => set("sectionName", e.target.value)} placeholder="e.g. Basic English Grammar Questions" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-700">Questions
          <input type="number" min="1" value={value.questions} onChange={(e) => set("questions", Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-700">Format
          <input value={value.format} onChange={(e) => set("format", e.target.value)} placeholder="e.g. MCQs" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-700">Marks
          <input type="number" min="1" value={value.marks} onChange={(e) => set("marks", Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-700">Target Score
          <input value={value.targetScore} onChange={(e) => set("targetScore", e.target.value)} placeholder="e.g. 20/25" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-700">Skills Assessed
          <input value={value.skillsAssessed} onChange={(e) => set("skillsAssessed", e.target.value)} placeholder="Grammar, vocabulary..." className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
        </label>
      </div>
    </div>
  );
}
