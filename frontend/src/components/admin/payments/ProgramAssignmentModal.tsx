"use client";

import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import { getPackageProgramMonthlyPrice } from "@/utils/studentPayment";

function formatDiscountLabel(program: any) {
    if (!program?.discount_type || program.discount_value == null) return "No discount";
    if (program.discount_type === "percentage") return `${program.discount_value}% off`;
    return `$${Number(program.discount_value).toFixed(2)} off / month`;
}

export default function ProgramAssignmentModal({
    isOpen,
    onClose,
    selectedPackage,
    programs,
    handleAssign,
    handleUpdate,
    handleRemove,
    isDark,
    isAssigning,
    closeOnClickOutside = true
}) {
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [discountType, setDiscountType] = useState("none");
    const [discountValue, setDiscountValue] = useState("");
    const [editingProgramId, setEditingProgramId] = useState<string | number | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedProgramId("");
            setDiscountType("none");
            setDiscountValue("");
            setEditingProgramId(null);
        }
    }, [isOpen]);

    if (!selectedPackage) return null;

    const assignedProgramIds = selectedPackage.programs?.map((p: any) => p.id) || [];
    const availablePrograms = programs.filter((p: any) => !assignedProgramIds.includes(p.id));
    const months = Number(selectedPackage.duration_months || 1);

    const previewProgram = programs.find((p: any) => String(p.id) === String(selectedProgramId));
    const previewMonthly = previewProgram
        ? getPackageProgramMonthlyPrice({
              ...previewProgram,
              discount_type: discountType === "none" ? null : discountType,
              discount_value: discountValue === "" ? null : Number(discountValue),
          })
        : 0;

    const onAssignClick = () => {
        if (!selectedProgramId) return;
        handleAssign(selectedPackage.id, selectedProgramId, {
            discount_type: discountType === "none" ? null : discountType,
            discount_value: discountValue === "" ? null : Number(discountValue),
        });
        setSelectedProgramId("");
        setDiscountType("none");
        setDiscountValue("");
    };

    const startEditDiscount = (program: any) => {
        setEditingProgramId(program.id);
        setDiscountType(program.discount_type || "none");
        setDiscountValue(program.discount_value != null ? String(program.discount_value) : "");
    };

    const saveEditDiscount = (programId: number | string) => {
        handleUpdate(selectedPackage.id, programId, {
            discount_type: discountType === "none" ? null : discountType,
            discount_value: discountValue === "" ? null : Number(discountValue),
        });
        setEditingProgramId(null);
        setDiscountType("none");
        setDiscountValue("");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Programs to ${selectedPackage.package_name}`}
            size="lg"
            closeOnClickOutside={closeOnClickOutside}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Select Program
                        </label>
                        <select
                            value={selectedProgramId}
                            onChange={(e) => setSelectedProgramId(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        >
                            <option value="">-- Choose a Program --</option>
                            {availablePrograms.map((program: any) => (
                                <option key={program.id} value={program.id}>
                                    {program.title} (${Number(program.price || 0).toFixed(2)}/mo)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Discount Type
                        </label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:ring-2 focus:ring-[#010080] outline-none transition-all`}
                        >
                            <option value="none">No discount</option>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed amount ($)</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Discount Value
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={discountType === "percentage" ? "100" : undefined}
                            step="0.01"
                            disabled={discountType === "none"}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 25"}
                            className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:ring-2 focus:ring-[#010080] outline-none transition-all disabled:opacity-50`}
                        />
                    </div>
                </div>

                {selectedProgramId && (
                    <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                        Package total for this program:{" "}
                        <strong>${(previewMonthly * months).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        {" "}({months} month{months > 1 ? "s" : ""} × ${previewMonthly.toFixed(2)}/mo)
                    </p>
                )}

                <div>
                    <h4 className={`text-md font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Currently Assigned Programs
                    </h4>
                    {selectedPackage.programs && selectedPackage.programs.length > 0 ? (
                        <div className="space-y-3">
                            {selectedPackage.programs.map((program: any) => {
                                const monthly = getPackageProgramMonthlyPrice(program);
                                const total = monthly * months;
                                const isEditing = editingProgramId === program.id;

                                return (
                                    <div
                                        key={program.id}
                                        className={`p-4 rounded-lg border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                                                    {program.title}
                                                </p>
                                                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                    {formatDiscountLabel(program)} · ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} total
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => (isEditing ? setEditingProgramId(null) : startEditDiscount(program))}
                                                    className="text-indigo-500 hover:text-indigo-700 text-xs font-bold"
                                                >
                                                    {isEditing ? "Cancel" : "Edit discount"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(selectedPackage.id, program.id)}
                                                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                                    title="Remove Assignment"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t dark:border-gray-700 border-gray-200">
                                                <select
                                                    value={discountType}
                                                    onChange={(e) => setDiscountType(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                                >
                                                    <option value="none">No discount</option>
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed">Fixed amount ($)</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={discountType === "percentage" ? "100" : undefined}
                                                    step="0.01"
                                                    disabled={discountType === "none"}
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(e.target.value)}
                                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-gray-900 border-gray-600 text-white" : "bg-white border-gray-300"} disabled:opacity-50`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => saveEditDiscount(program.id)}
                                                    className="px-4 py-2 bg-[#010080] text-white rounded-lg text-sm font-semibold"
                                                >
                                                    Save discount
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} italic`}>
                            No programs assigned yet.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700 border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg border ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"} transition-all`}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={onAssignClick}
                        disabled={!selectedProgramId || isAssigning}
                        className="px-8 py-2 bg-[#010080] text-white rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50 font-medium"
                    >
                        {isAssigning ? "Assigning..." : "Assign Program"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
