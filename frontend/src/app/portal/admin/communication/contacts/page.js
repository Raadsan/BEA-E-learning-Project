"use client";

import { useState } from "react";
import { useGetContactsQuery, useDeleteContactMutation } from "@/redux/api/contactApi";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

export default function ContactsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: contacts = [], isLoading, isError, error, refetch } = useGetContactsQuery();
    const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingContact, setViewingContact] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);

    const handleOpenViewModal = (contact) => {
        setViewingContact(contact);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingContact(null);
    };

    const handleOpenDeleteModal = (contact) => {
        setContactToDelete(contact);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setContactToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;
        try {
            await deleteContact(contactToDelete.id).unwrap();
            showToast("Contact message deleted successfully", "success");
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Delete failed:", err);
            showToast(err?.data?.error || "Failed to delete contact message", "error");
        }
    };

    const columns = [
        {
            key: "name",
            label: "Name",
            width: "180px",
            render: (val) => <span className="font-semibold">{val}</span>
        },
        {
            key: "email",
            label: "Email",
            width: "200px"
        },
        {
            key: "phone",
            label: "Phone",
            width: "150px",
            render: (val) => val || <span className="text-gray-400">-</span>
        },
        {
            key: "message",
            label: "Message Snippet",
            width: "300px",
            render: (val) => (
                <span className="truncate block max-w-[280px]" title={val}>
                    {val}
                </span>
            )
        },
        {
            key: "created_at",
            label: "Date",
            width: "150px",
            render: (val) => val ? new Date(val).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            }) : "N/A"
        },
        {
            key: "actions",
            label: "Actions",
            width: "120px",
            render: (_, row) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleOpenViewModal(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="View Full Message"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleOpenDeleteModal(row)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Message"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m12 0H5" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="p-8 text-center">Loading messages...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error: {error?.data?.error || "Failed to load"}</div>;

    return (
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
            <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                <DataTable
                    title="Contact Messages"
                    columns={columns}
                    data={contacts}
                    showAddButton={false}
                />
            </div>

            {/* View Message Modal */}
            {isViewModalOpen && viewingContact && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseViewModal} />
                    <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Message Details</h3>
                            <button onClick={handleCloseViewModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Sender Name</label>
                                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingContact.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Email Address</label>
                                    <p className="text-base font-semibold text-blue-600 dark:text-blue-400">{viewingContact.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Phone Number</label>
                                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingContact.phone || "Not provided"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Received On</label>
                                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {new Date(viewingContact.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-blue-50/30 border-blue-100'}`}>
                                <label className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">Message Body</label>
                                <div className={`text-base leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {viewingContact.message}
                                </div>
                            </div>
                        </div>
                        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                            <a href={`mailto:${viewingContact.email}`} className="px-6 py-2 bg-[#010080] text-white rounded-lg font-semibold hover:bg-blue-800 transition-all active:scale-95 shadow-lg">
                                Reply via Email
                            </a>
                            <button onClick={handleCloseViewModal} className={`px-6 py-2 rounded-lg font-semibold border transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && contactToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseDeleteModal} />
                    <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Deletion</h3>
                        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Are you sure you want to delete the message from <span className="font-bold text-red-500">{contactToDelete.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={handleCloseDeleteModal} className={`flex-1 px-4 py-2.5 rounded-xl font-semibold border transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50">
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
