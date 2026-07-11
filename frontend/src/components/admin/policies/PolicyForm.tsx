"use client";

import Link from "next/link";
import { useDarkMode } from "@/context/ThemeContext";
import { isSystemPolicy, policyWebsitePath, slugifyPolicyTitle } from "@/constants/policies";
import {
    createDefaultStructuredPolicyContent,
    createEmptyPolicySection,
    type PolicySection,
    type StructuredPolicyContent,
} from "@/utils/policyContent";

export type PolicyFormData = {
    title: string;
    slug: string;
    description: string;
    status: string;
    sort_order: number;
    structuredContent: StructuredPolicyContent;
};

type PolicyFormProps = {
    mode: "create" | "edit";
    formData: PolicyFormData;
    setFormData: React.Dispatch<React.SetStateAction<PolicyFormData>>;
    slugTouched: boolean;
    setSlugTouched: (v: boolean) => void;
    isSystem?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    isSaving?: boolean;
    backHref?: string;
    cancelLabel?: string;
    hideSlugField?: boolean;
    onCancel?: () => void;
};

export default function PolicyForm({
    mode,
    formData,
    setFormData,
    slugTouched,
    setSlugTouched,
    isSystem = false,
    onSubmit,
    isSaving = false,
    backHref = "/portal/admin/communication/policies",
    cancelLabel = "Cancel",
    hideSlugField = false,
    onCancel,
}: PolicyFormProps) {
    const { isDark } = useDarkMode();

    const inputClass = `w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-[#010080]/30 focus:border-[#010080] outline-none ${
        isDark ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
    }`;

    const labelClass = `block text-sm font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`;
    const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm";
    const softCardClass = isDark ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200";

    const handleTitleChange = (title: string) => {
        setFormData((prev) => ({
            ...prev,
            title,
            slug: !slugTouched && mode === "create" ? slugifyPolicyTitle(title) : prev.slug,
            structuredContent:
                mode === "create" && !prev.structuredContent.policyName.trim()
                    ? { ...prev.structuredContent, policyName: title }
                    : prev.structuredContent,
        }));
    };

    const updateSection = (sectionId: string, field: keyof Omit<PolicySection, "id">, value: string) => {
        setFormData((prev) => ({
            ...prev,
            structuredContent: {
                ...prev.structuredContent,
                sections: prev.structuredContent.sections.map((section) =>
                    section.id === sectionId ? { ...section, [field]: value } : section
                ),
            },
        }));
    };

    const addSection = () => {
        setFormData((prev) => ({
            ...prev,
            structuredContent: {
                ...prev.structuredContent,
                sections: [...prev.structuredContent.sections, createEmptyPolicySection(prev.structuredContent.sections.length)],
            },
        }));
    };

    const removeSection = (sectionId: string) => {
        setFormData((prev) => {
            const nextSections = prev.structuredContent.sections.filter((section) => section.id !== sectionId);
            return {
                ...prev,
                structuredContent: {
                    ...prev.structuredContent,
                    sections: nextSections.length > 0 ? nextSections : [createEmptyPolicySection()],
                },
            };
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
            {mode === "create" && (
                <div className={`rounded-xl border p-4 ${softCardClass}`}>
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#010080]/10 text-[#010080] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Create Custom Policy</h2>
                            <p className={`text-xs leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                Add a new policy using the same structured style as the website pages. Custom policies appear in admin, student, and teacher portals — not on the public website.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {mode === "edit" && isSystem && (
                <div className={`rounded-xl border p-4 ${isDark ? "bg-blue-950/40 border-blue-800 text-blue-100" : "bg-blue-50 border-blue-200 text-blue-900"}`}>
                    <p className="font-semibold mb-1">System Policy</p>
                    <p>
                        Full policy content displays automatically on website and all portals.
                        You can edit all fields below except the slug.
                    </p>
                </div>
            )}

            <div className={`rounded-xl border p-4 ${cardClass}`}>
                <div className="mb-4">
                    <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Basic Information</h2>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Start with the policy name and a short introduction.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Name *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className={inputClass}
                            placeholder="Policy name"
                            required
                        />
                    </div>

                    {!hideSlugField && (
                    <div>
                        <label className={labelClass}>Slug *</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setFormData((prev) => ({ ...prev, slug: e.target.value }));
                            }}
                            className={`${inputClass} ${isSystem ? "opacity-60 cursor-not-allowed" : ""}`}
                            placeholder="e.g. data-policy"
                            required
                            disabled={isSystem}
                        />
                        <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {isSystem
                                ? `Website: ${policyWebsitePath(formData.slug)}`
                                : "Portal URL only — not published on website"}
                        </p>
                    </div>
                    )}

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className={inputClass}
                            placeholder="Short summary shown on the policy card before users open the full policy"
                        />
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border p-4 space-y-4 ${cardClass}`}>
                <div>
                    <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Policy Body Builder</h2>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {isSystem
                            ? "Edit the live website and portal content for this system policy."
                            : "Add the main policy heading and as many sub sections as you need. All details are saved to the database."}
                    </p>
                </div>

                <div>
                    <label className={labelClass}>Policy Heading *</label>
                    <input
                        type="text"
                        value={formData.structuredContent.policyName}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                structuredContent: {
                                    ...prev.structuredContent,
                                    policyName: e.target.value,
                                },
                            }))
                        }
                        className={inputClass}
                        placeholder="e.g. Student Support Policy"
                        required
                    />
                </div>

                <div className="space-y-4">
                    {formData.structuredContent.sections.map((section, index) => (
                        <div
                            key={section.id}
                            className={`rounded-xl border p-4 space-y-3 ${softCardClass}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#010080]/10 text-[#010080] flex items-center justify-center text-xs font-bold">
                                        {section.numberLabel?.trim() || index + 1}
                                    </div>
                                    <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Sub {index + 1}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSection(section.id)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    Remove
                                </button>
                            </div>

                            <div>
                                <label className={labelClass}>Number Label</label>
                                <input
                                    type="text"
                                    value={section.numberLabel || ""}
                                    onChange={(e) => updateSection(section.id, "numberLabel", e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. 1 or 2.1"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Sub Name *</label>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateSection(section.id, "title", e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Attendance Rules"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Notes / Section Details *</label>
                                <textarea
                                    value={section.body}
                                    onChange={(e) => updateSection(section.id, "body", e.target.value)}
                                    rows={6}
                                    className={inputClass}
                                    placeholder="Write full details here..."
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Optional Note</label>
                                <textarea
                                    value={section.note || ""}
                                    onChange={(e) => updateSection(section.id, "note", e.target.value)}
                                    rows={3}
                                    className={inputClass}
                                    placeholder="Add a short note or warning if needed..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addSection}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border text-sm font-semibold text-[#010080] border-[#010080]/30 hover:bg-[#010080]/5 transition-colors"
                >
                    Add Sub
                </button>
            </div>

            <div className={`rounded-xl border p-4 ${cardClass}`}>
                <div className="mb-4">
                    <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Settings</h2>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Control visibility and ordering.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Status (Active)</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                            className={inputClass}
                        >
                            <option value="active">Active — visible to users</option>
                            <option value="inactive">Inactive — hidden from users</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Sort Order</label>
                        <input
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))
                            }
                            className={inputClass}
                            min={0}
                        />
                        <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Lower numbers appear first
                        </p>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border p-4 ${cardClass}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-lg bg-[#010080] text-white text-sm font-semibold hover:bg-blue-900 disabled:opacity-60 transition-colors"
                    >
                        {isSaving ? "Saving..." : mode === "create" ? "Create Policy" : "Save Changes"}
                    </button>
                    {onCancel ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            className={`px-5 py-2.5 rounded-lg border text-sm font-semibold ${
                                isDark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {cancelLabel}
                        </button>
                    ) : (
                        <Link
                            href={backHref}
                            className={`px-5 py-2.5 rounded-lg border text-sm font-semibold ${
                                isDark ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {cancelLabel}
                        </Link>
                    )}
                </div>
            </div>
        </form>
    );
}

export const defaultPolicyForm = (): PolicyFormData => ({
    title: "",
    slug: "",
    description: "",
    status: "active",
    sort_order: 0,
    structuredContent: createDefaultStructuredPolicyContent(),
});
