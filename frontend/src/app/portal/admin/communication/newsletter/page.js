"use client";

import { useState } from "react";
import { useGetSubscribersQuery, useDeleteSubscriberMutation } from "@/redux/api/newsletterApi";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function NewsletterPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data, isLoading, isError, error, refetch } = useGetSubscribersQuery();
    const [deleteSubscriber, { isLoading: isDeleting }] = useDeleteSubscriberMutation();

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState(null);

    const handleOpenDeleteModal = (subscriber) => {
        setSubscriberToDelete(subscriber);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSubscriberToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!subscriberToDelete) return;
        try {
            await deleteSubscriber(subscriberToDelete.id).unwrap();
            showToast("Subscriber deleted successfully", "success");
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Delete failed:", err);
            showToast(err?.data?.error || "Failed to delete subscriber", "error");
        }
    };

    // The backend returns { success: true, subscribers: [...] }
    const subscribers = data?.subscribers || [];

    const columns = [
        {
            key: "email",
            label: "Subscriber Email",
            width: "300px",
            render: (val) => <span className="font-semibold text-blue-600 dark:text-blue-400">{val}</span>
        },
        {
            key: "created_at",
            label: "Subscription Date",
            width: "200px",
            render: (val) => val ? new Date(val).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            }) : "N/A"
        },
        {
            key: "actions",
            label: "ACTIONS",
            width: "180px",
            className: "text-center",
            render: (_, row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => handleOpenDeleteModal(row)}
                        className="px-6 py-2 bg-[#fee2e2] text-[#dc2626] font-bold rounded-lg hover:bg-red-200 transition-colors text-sm shadow-sm"
                    >
                        Remove Subscriber
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="p-8 text-center">Loading subscribers...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error: {error?.data?.error || "Failed to load"}</div>;

    return (
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
            <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                <DataTable
                    title="Newsletter Subscribers"
                    columns={columns}
                    data={subscribers}
                    showAddButton={false}
                    description="Manage your audience and review recently joined newsletter subscribers."
                />
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && subscriberToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseDeleteModal} />
                    <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Remove Subscriber</h3>
                        <p className={`mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Are you sure you want to remove <span className="font-bold text-red-500">{subscriberToDelete.email}</span> from the newsletter list?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={handleCloseDeleteModal} className={`flex-1 px-4 py-3 rounded-xl font-bold border transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50">
                                {isDeleting ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
