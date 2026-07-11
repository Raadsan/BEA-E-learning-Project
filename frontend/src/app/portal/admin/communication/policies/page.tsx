"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import { useRouter, useSearchParams } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import { policyWebsitePath, isSystemPolicy, slugifyPolicyTitle } from "@/constants/policies";
import PolicyForm, { defaultPolicyForm } from "@/components/admin/policies/PolicyForm";
import { useGetPoliciesQuery, useGetPolicyByIdQuery, useDeletePolicyMutation, useCreatePolicyMutation, useUpdatePolicyMutation } from "@/lib/api/policyApi";
import { createDefaultStructuredPolicyContent, parseStructuredPolicyContent, stringifyStructuredPolicyContent } from "@/utils/policyContent";

const buildPolicyFormData = (policy: {
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    status?: string | null;
    sort_order?: number | null;
    content?: string | null;
}) => ({
    title: policy.title || "",
    slug: policy.slug || "",
    description: policy.description || "",
    status: policy.status || "active",
    sort_order: policy.sort_order ?? 0,
    structuredContent: parseStructuredPolicyContent(policy.content) || createDefaultStructuredPolicyContent(),
});

export default function AdminPoliciesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { canAdd, canEdit, canDelete } = usePagePermissions("communication", "policies");

    const { data: policies = [], isLoading } = useGetPoliciesQuery({ all: true });
    const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
    const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
    const [deletePolicy] = useDeletePolicyMutation();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState(defaultPolicyForm);
    const [editFormData, setEditFormData] = useState(defaultPolicyForm);
    const [slugTouched, setSlugTouched] = useState(false);
    const [editSlugTouched, setEditSlugTouched] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<{ id: number; slug: string } | null>(null);
    const { data: editingPolicyFull, isLoading: isLoadingEditPolicy } = useGetPolicyByIdQuery(editingPolicy?.id as number, {
        skip: !editingPolicy?.id || !isEditOpen,
    });

    const filtered = policies.filter((p) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return [p.title, p.slug, p.description, p.status].join(" ").toLowerCase().includes(q);
    });

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this policy? This cannot be undone.")) return;
        try {
            await deletePolicy(id).unwrap();
            showToast("Policy deleted", "success");
        } catch {
            showToast("Failed to delete policy", "error");
        }
    };

    const openCreate = () => {
        setCreateFormData(defaultPolicyForm());
        setSlugTouched(false);
        setIsCreateOpen(true);
    };

    const openEdit = (policy: { id: number; slug: string }) => {
        setEditingPolicy({ id: policy.id, slug: policy.slug });
        setEditSlugTouched(true);
        setIsEditOpen(true);
    };

    useEffect(() => {
        if (!editingPolicyFull || !isEditOpen) return;
        setEditFormData(buildPolicyFormData(editingPolicyFull));
    }, [editingPolicyFull, isEditOpen]);

    useEffect(() => {
        if (searchParams.get("openCreate") === "1") {
            openCreate();
            router.replace("/portal/admin/communication/policies");
        }
    }, [searchParams, router]);

    useEffect(() => {
        const editId = searchParams.get("edit");
        if (!editId || policies.length === 0) return;

        const target = policies.find((policy: any) => String(policy.id) === String(editId));
        if (target) {
            openEdit(target);
            router.replace("/portal/admin/communication/policies");
        }
    }, [searchParams, policies, router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createFormData.title.trim()) {
            showToast("Name is required", "error");
            return;
        }
        if (!createFormData.structuredContent.policyName.trim()) {
            showToast("Policy heading is required", "error");
            return;
        }
        if (createFormData.structuredContent.sections.some((section) => !section.title.trim() || !section.body.trim())) {
            showToast("Please complete all sub sections", "error");
            return;
        }

        try {
            await createPolicy({
                title: createFormData.title,
                slug: slugifyPolicyTitle(createFormData.slug || createFormData.title),
                description: createFormData.description,
                content: stringifyStructuredPolicyContent(createFormData.structuredContent),
                status: createFormData.status,
                sort_order: Number(createFormData.sort_order) || 0,
            }).unwrap();
            showToast("Policy created!", "success");
            setIsCreateOpen(false);
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to create policy", "error");
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPolicy) return;

        const isSystem = isSystemPolicy(editingPolicy.slug);

        if (!editFormData.title.trim()) {
            showToast("Name is required", "error");
            return;
        }
        if (!editFormData.slug.trim()) {
            showToast("Slug is required", "error");
            return;
        }
        if (!editFormData.structuredContent.policyName.trim()) {
            showToast("Policy heading is required", "error");
            return;
        }
        if (editFormData.structuredContent.sections.some((section) => !section.title.trim() || !section.body.trim())) {
            showToast("Please complete all sub sections", "error");
            return;
        }

        try {
            await updatePolicy({
                id: editingPolicy.id,
                title: editFormData.title,
                slug: isSystem ? editFormData.slug : slugifyPolicyTitle(editFormData.slug),
                description: editFormData.description,
                status: editFormData.status,
                sort_order: Number(editFormData.sort_order) || 0,
                content: stringifyStructuredPolicyContent(editFormData.structuredContent),
            }).unwrap();
            showToast("Policy updated!", "success");
            setIsEditOpen(false);
            setEditingPolicy(null);
        } catch (err: any) {
            showToast(err?.data?.error || "Failed to update policy", "error");
        }
    };

    return (
        <main className={`flex-1 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="w-full px-6 sm:px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Policies</h1>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Manage all BEA policies. System policies appear on the website and all portals. Custom policies appear in admin, student, and teacher portals only.
                        </p>
                    </div>
                    {canAdd && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="px-4 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 text-sm font-semibold"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Policy
                        </button>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search policies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full max-w-md px-4 py-2 rounded-lg border text-sm ${
                            isDark ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300"
                        }`}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={`p-8 rounded-xl border text-center ${isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200"}`}>
                        No policies found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map((policy) => (
                            <div
                                key={policy.id}
                                className={`rounded-2xl border p-5 flex flex-col ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            policy.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                            {policy.status}
                                        </span>
                                        {isSystemPolicy(policy.slug) ? (
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#010080]/10 text-[#010080]">
                                                System
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                                Custom
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>#{policy.sort_order ?? 0}</span>
                                </div>
                                <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{policy.title}</h3>
                                <p className={`text-xs mb-2 font-mono ${isDark ? "text-gray-500" : "text-gray-400"}`}>/{policy.slug}</p>
                                <p className={`text-sm flex-1 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {policy.description || "No description"}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <Link
                                        href={`/portal/admin/communication/policies/${policy.slug}`}
                                        className="flex-1 text-center py-2 rounded-lg bg-[#010080] text-white text-xs font-bold hover:bg-blue-900"
                                    >
                                        Preview
                                    </Link>
                                    {isSystemPolicy(policy.slug) && (
                                        <Link
                                            href={policyWebsitePath(policy.slug)}
                                            target="_blank"
                                            className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
                                                isDark ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-600"
                                            }`}
                                        >
                                            Website ↗
                                        </Link>
                                    )}
                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => openEdit(policy)}
                                            className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete && !isSystemPolicy(policy.slug) && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(policy.id)}
                                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Policy" size="lg">
                <PolicyForm
                    mode="create"
                    formData={createFormData}
                    setFormData={setCreateFormData}
                    slugTouched={slugTouched}
                    setSlugTouched={setSlugTouched}
                    onSubmit={handleCreate}
                    isSaving={isCreating}
                    onCancel={() => setIsCreateOpen(false)}
                />
            </Modal>
            <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingPolicy(null); }} title="Edit Policy" size="lg">
                {isLoadingEditPolicy ? (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner />
                    </div>
                ) : (
                <PolicyForm
                    mode="edit"
                    formData={editFormData}
                    setFormData={setEditFormData}
                    slugTouched={editSlugTouched}
                    setSlugTouched={setEditSlugTouched}
                    isSystem={editingPolicy ? isSystemPolicy(editingPolicy.slug) : false}
                    onSubmit={handleEdit}
                    isSaving={isUpdating}
                    onCancel={() => { setIsEditOpen(false); setEditingPolicy(null); }}
                />
                )}
            </Modal>
        </main>
    );
}
