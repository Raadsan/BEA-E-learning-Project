"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import {
    useGetPaymentPackagesQuery,
    useCreatePaymentPackageMutation,
    useUpdatePaymentPackageMutation,
    useDeletePaymentPackageMutation,
    useAssignPackageToProgramMutation,
    useRemovePackageFromProgramMutation
} from "@/redux/api/paymentPackageApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";

// Components
import PaymentPackageForm from "./components/PaymentPackageForm";
import ProgramAssignmentModal from "./components/ProgramAssignmentModal";

export default function PaymentPackagesPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    // API Queries/Mutations
    const { data: packages = [], isLoading, isError } = useGetPaymentPackagesQuery();
    const { data: programs = [] } = useGetProgramsQuery();

    const [createPackage, { isLoading: isCreating }] = useCreatePaymentPackageMutation();
    const [updatePackage, { isLoading: isUpdating }] = useUpdatePaymentPackageMutation();
    const [deletePackage] = useDeletePaymentPackageMutation();
    const [assignPackage, { isLoading: isAssigning }] = useAssignPackageToProgramMutation();
    const [removePackage] = useRemovePackageFromProgramMutation();

    // States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const [formData, setFormData] = useState({
        package_name: "",
        description: "",
        amount: "",
        currency: "USD",
        duration_months: "",
        status: "active"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setEditingPackage(null);
        setFormData({
            package_name: "",
            description: "",
            amount: "",
            currency: "USD",
            duration_months: "",
            status: "active"
        });
        setIsFormOpen(true);
    };

    const handleEditClick = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            package_name: pkg.package_name || "",
            description: pkg.description || "",
            amount: pkg.amount || "",
            currency: pkg.currency || "USD",
            duration_months: pkg.duration_months || "",
            status: pkg.status || "active"
        });
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure amount is handled correctly for both create and update
            const submissionData = {
                ...formData,
                amount: formData.amount === "" ? null : formData.amount
            };

            if (editingPackage) {
                await updatePackage({ id: editingPackage.id, ...submissionData }).unwrap();
                showToast("Package updated successfully!", "success");
            } else {
                await createPackage(submissionData).unwrap();
                showToast("Package created successfully!", "success");
            }
            setIsFormOpen(false);
        } catch (error) {
            showToast("Failed to save package: " + (error.data?.message || error.message), "error");
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this payment package?")) {
            try {
                await deletePackage(id).unwrap();
                showToast("Package deleted successfully!", "success");
            } catch (error) {
                showToast("Failed to delete package: " + (error.data?.message || error.message), "error");
            }
        }
    };

    const handleAssignClick = (pkg) => {
        setSelectedPackage(pkg);
        setIsAssignModalOpen(true);
    };

    const handleAssignProgram = async (packageId, programId) => {
        try {
            await assignPackage({ packageId, programId }).unwrap();
            showToast("Program assigned successfully!", "success");
            // Refresh local selected package state to show new assignment
            const updatedPkg = packages.find(p => p.id === packageId);
            if (updatedPkg) setSelectedPackage(updatedPkg);
        } catch (error) {
            showToast("Failed to assign program: " + (error.data?.message || error.message), "error");
        }
    };

    const handleRemoveProgram = async (packageId, programId) => {
        if (window.confirm("Remove this program from this package?")) {
            try {
                await removePackage({ packageId, programId }).unwrap();
                showToast("Program removed successfully!", "success");
                // Refresh local selected package state
                const updatedPkg = packages.find(p => p.id === packageId);
                if (updatedPkg) setSelectedPackage(updatedPkg);
            } catch (error) {
                showToast("Failed to remove program: " + (error.data?.message || error.message), "error");
            }
        }
    };

    return (
        <>
            <AdminHeader />
            <main className={`flex-1 overflow-y-auto mt-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-full px-8 py-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Payment Packages
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Manage billing cycles and dynamic program pricing
                            </p>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-blue-900 text-white'} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Package
                        </button>
                    </div>

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 min-h-[480px] ${isDark
                                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                    : 'bg-white border-gray-100 hover:border-[#010080]'
                                    }`}
                            >
                                {pkg.status === 'inactive' && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full border border-red-200 uppercase">
                                        Inactive
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#010080]'}`}>
                                        {pkg.package_name}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-6xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {pkg.duration_months}
                                        </span>
                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Months
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex-1 mb-8 space-y-4 border-t border-b py-6 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                    {pkg.description?.split('\n').filter(line => line.trim()).map((line, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {line.replace(/^[•*-]\s*/, '').trim()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Pricing Summary */}
                                <div className="mb-8">
                                    <h4 className={`text-xs font-semibold mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Assigned Programs
                                    </h4>
                                    <div className="space-y-2">
                                        {pkg.programs && pkg.programs.length > 0 ? (
                                            pkg.programs.map((prog) => (
                                                <div key={prog.id} className="flex justify-between items-center py-1">
                                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {prog.title}
                                                    </span>
                                                    <div className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-[#010080]'}`}>
                                                        ${(parseFloat(prog.price || 0) * (pkg.duration_months || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-gray-400 font-medium italic">No programs assigned</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1 pt-6 border-t dark:border-gray-700 border-gray-50">
                                    <button
                                        onClick={() => handleAssignClick(pkg)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 group`}
                                        title="Assign Program"
                                    >
                                        <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="text-[10px] font-bold mt-1 text-gray-400 group-hover:text-blue-500">Assign</span>
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(pkg)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group`}
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-[10px] font-bold mt-1 text-gray-400 group-hover:text-indigo-500">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(pkg.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20 group`}
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="text-[10px] font-bold mt-1 text-gray-400 group-hover:text-red-500">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </main>

            <PaymentPackageForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editingPackage={editingPackage}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleFormSubmit}
                isDark={isDark}
                isLoading={isCreating || isUpdating}
                closeOnClickOutside={false}
            />

            <ProgramAssignmentModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                selectedPackage={selectedPackage}
                programs={programs}
                handleAssign={handleAssignProgram}
                handleRemove={handleRemoveProgram}
                isDark={isDark}
                isAssigning={isAssigning}
                closeOnClickOutside={false}
            />
        </>
    );
}
