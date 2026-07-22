"use client";

import { useEffect, useState } from "react";
import { useGetContactsQuery, useDeleteContactMutation, useGetContactPageQuery, useUpdateContactPageMutation } from "@/lib/api/contactApi";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import AdminTableActions from "@/components/admin/AdminTableActions";

export default function ContactsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { canView, canDelete } = usePagePermissions("inquiries", "contact_messages");
    const { data: contacts = [], isLoading, isError, error, refetch } = useGetContactsQuery();
    const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();
    const { data: contactPage } = useGetContactPageQuery();
    const [updateContactPage, { isLoading: isSavingPage }] = useUpdateContactPageMutation();
    const [pageForm, setPageForm] = useState<any>(null);

    useEffect(() => { if (contactPage) setPageForm(contactPage); }, [contactPage]);

    const updatePageField = (key, value) => setPageForm((prev) => ({ ...prev, [key]: value }));
    const updateSchedule = (index, key, value) => setPageForm((prev) => ({
        ...prev,
        schedule: prev.schedule.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row),
    }));
    const savePageContent = async (event) => {
        event.preventDefault();
        try {
            await updateContactPage(pageForm).unwrap();
            showToast("Contact page content updated successfully", "success");
        } catch (error) {
            showToast(error?.data?.error || "Failed to update contact page", "error");
        }
    };

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
                <AdminTableActions
                    canView={canView}
                    canEdit={false}
                    canDelete={canDelete}
                    onView={() => handleOpenViewModal(row)}
                    onDelete={() => handleOpenDeleteModal(row)}
                    viewTitle="View Full Message"
                />
            )
        }
    ];

    if (isLoading) return <div className="p-8 text-center">Loading messages...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error: {(error as any)?.data?.error || "Failed to load"}</div>;

    return (
        <main className="flex-1 min-w-0 flex flex-col items-center bg-gray-50 transition-colors">
            <div className="w-full max-w-full px-4 sm:px-8 py-6 min-w-0 flex flex-col">
                {pageForm && (
                    <form onSubmit={savePageContent} className={`mb-6 border p-6 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div><h2 className="font-serif text-2xl font-bold text-[#010080] dark:text-white">Contact Page Content & Schedule</h2><p className="mt-1 text-sm text-gray-500">Everything saved here appears dynamically on the public Contact Us page.</p></div>
                            <button type="submit" disabled={isSavingPage} className="bg-[#010080] px-5 py-2.5 font-semibold text-white disabled:opacity-50">{isSavingPage ? "Saving..." : "Save Changes"}</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[['hero_title','Hero Title'],['hero_subtitle','Hero Subtitle'],['address','Address'],['phone','Phone'],['email','Email'],['schedule_title','Schedule Title']].map(([key,label]) => (
                                <label key={key} className="text-sm font-semibold">{label}<input value={pageForm[key] || ''} onChange={(e) => updatePageField(key, e.target.value)} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-[#010080]" required /></label>
                            ))}
                            <label className="text-sm font-semibold md:col-span-2">Hero Description<textarea value={pageForm.hero_description || ''} onChange={(e) => updatePageField('hero_description', e.target.value)} rows={3} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-[#010080]" required /></label>
                            <label className="text-sm font-semibold md:col-span-2">Schedule Description<textarea value={pageForm.schedule_description || ''} onChange={(e) => updatePageField('schedule_description', e.target.value)} rows={2} className="mt-1 w-full border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-[#010080]" required /></label>
                        </div>
                        <h3 className="mb-3 mt-6 font-serif text-xl font-bold text-[#010080] dark:text-white">Operational Days & Hours</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {(pageForm.schedule || []).map((row, index) => (
                                <div key={index} className="grid grid-cols-2 gap-2 border border-gray-200 p-3">
                                    <input value={row.day} onChange={(e) => updateSchedule(index, 'day', e.target.value)} className="border px-3 py-2 text-gray-900" required />
                                    <input value={row.hours} onChange={(e) => updateSchedule(index, 'hours', e.target.value)} className="border px-3 py-2 text-gray-900" placeholder="Closed or 9:00 AM - 6:00 PM" required />
                                </div>
                            ))}
                        </div>
                        <h3 className="mb-3 mt-6 font-serif text-xl font-bold text-[#010080] dark:text-white">Social Links</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {['facebook','instagram','twitter','youtube','linkedin','telegram','tiktok'].map((network) => (
                                <label key={network} className="text-sm font-semibold capitalize">{network}<input type="url" value={pageForm.social_links?.[network] || ''} onChange={(e) => updatePageField('social_links', { ...(pageForm.social_links || {}), [network]: e.target.value })} className="mt-1 w-full border px-3 py-2 text-gray-900" placeholder={`https://${network}.com/...`} /></label>
                            ))}
                        </div>
                    </form>
                )}
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
