"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import {
    useGetCandidatesQuery,
    useUpdateCandidateStatusMutation,
    useExtendCandidateDeadlineMutation,
    useDeleteCandidateMutation,
    useUpdateCandidateMutation,
} from "@/redux/api/proficiencyTestStudentsApi";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";

// Reusing the Live Timer Component logic for consistency
const LiveAdminTimer = ({ expiryDate, label, colorClass, onClick }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!expiryDate) return;
        const calculate = () => {
            const diff = Math.max(0, Math.floor((new Date(expiryDate) - new Date()) / 1000));
            setTimeLeft(diff);
        };
        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [expiryDate]);

    const format = (s) => {
        if (s === null) return "--:--";
        if (s <= 0) return "00:00";
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const showCountdown = label === "Active" || label === "Pending Time";

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 cursor-pointer rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border flex flex-col items-center min-w-[100px] ${colorClass}`}
        >
            <span>{label}</span>
            {showCountdown && timeLeft > 0 && (
                <span className="font-mono text-[9px] opacity-80 mt-0.5">
                    {format(timeLeft)} left
                </span>
            )}
        </button>
    );
};

export default function ProficiencyCandidatesPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    const { data: candidates, isLoading } = useGetCandidatesQuery();
    const [updateStatus] = useUpdateCandidateStatusMutation();
    const [extendWindow] = useExtendCandidateDeadlineMutation();
    const [deleteCandidate] = useDeleteCandidateMutation();
    const [updateCandidate] = useUpdateCandidateMutation();

    const [essayModalOpen, setEssayModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [extensionModalOpen, setExtensionModalOpen] = useState(false);
    const [extraTime, setExtraTime] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [statusFilter, setStatusFilter] = useState("all");
    const [verificationFilter, setVerificationFilter] = useState("all");


    const handleUpdateStatus = async (id, status) => {
        try {
            await updateStatus({ id, status }).unwrap();
            showToast(`Candidate ${status} successfully`, 'success');
        } catch (err) {
            showToast("Failed to update status", 'error');
        }
    };

    const handleExtendSubmit = async () => {
        if (!extraTime || isNaN(extraTime)) {
            showToast("Please enter a valid number", 'error');
            return;
        }
        try {
            await extendWindow({ id: selectedCandidate.student_id, durationMinutes: parseInt(extraTime) }).unwrap();
            showToast("Entry window updated!", 'success');
            setExtensionModalOpen(false);
            setExtraTime("");
            setSelectedCandidate(null);
        } catch (err) {
            showToast("Failed to extend window", 'error');
        }
    };

    const handleEditClick = (student) => {
        setSelectedCandidate(student);
        setEditFormData({
            first_name: student.first_name || "",
            last_name: student.last_name || "",
            email: student.email || "",
            phone: student.phone || "",
            age: student.age || "",
            sex: student.sex || "",
            residency_country: student.residency_country || "",
            residency_city: student.residency_city || "",
            password: "",
            confirmPassword: "",
            date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
            place_of_birth: student.place_of_birth || ""
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (editFormData.password) {
            if (editFormData.password !== editFormData.confirmPassword) {
                showToast("Passwords do not match", 'error');
                return;
            }
            if (editFormData.password.length < 6) {
                showToast("Password must be at least 6 characters", 'error');
                return;
            }
        }

        const { confirmPassword, ...dataToSubmit } = editFormData;
        // Sanitize age
        dataToSubmit.age = dataToSubmit.age === "" ? null : parseInt(dataToSubmit.age);

        // If password is empty, remove it from submission so it doesn't get hashed as empty string
        if (!dataToSubmit.password) delete dataToSubmit.password;

        try {
            await updateCandidate({ id: selectedCandidate.student_id, data: dataToSubmit }).unwrap();
            showToast("Candidate info updated", 'success');
            setEditModalOpen(false);
        } catch (err) {
            showToast("Failed to update candidate", 'error');
        }
    };



    const [infoModalOpen, setInfoModalOpen] = useState(false);

    const columns = [
        {
            key: "student_id",
            label: "Student ID",
            render: (val) => <span className="font-bold text-gray-900">{val}</span>
        },
        {
            key: "full_name",
            label: "Full Name",
            render: (_, row) => <span className="font-bold text-sm">{row.first_name} {row.last_name}</span>
        },

        {
            key: "email",
            label: "Email",
            render: (val) => <span className="text-sm text-gray-600">{val}</span>
        },
        {
            key: "phone",
            label: "Phone",
            render: (val) => <span className="text-sm text-gray-600">{val}</span>
        },
        {
            key: "age",
            label: "Age",
            render: (val) => <span className="text-sm text-gray-600">{val || '-'}</span>
        },
        {
            key: "sex",
            label: "Sex",
            render: (val) => <span className="text-sm text-gray-600">{val || '-'}</span>
        },
        {
            key: "address",
            label: "Address",
            render: (val, row) => {
                const city = row.residency_city;
                const country = row.residency_country;
                if (city && country) return <span className="text-sm text-gray-600">{`${city}, ${country}`}</span>;
                return <span className="text-sm text-gray-600">{city || country || '-'}</span>;
            }
        },

        {
            key: "date_of_birth",
            label: "Date Of Birth",
            render: (val) => <span className="text-sm text-gray-600">{val ? new Date(val).toLocaleDateString() : '-'}</span>
        },
        {
            key: "place_of_birth",
            label: "Place Of Birth",
            render: (val) => <span className="text-sm text-gray-600">{val || '-'}</span>
        },
        {
            key: "program",
            label: "Program",
            render: () => <span className="text-sm text-gray-600">Proficiency Test</span>
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'Approved' ? 'bg-green-100 text-green-800' :
                    val === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {val || 'Pending'}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedCandidate(row);
                            setInfoModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Info"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedCandidate(row);
                            setExtensionModalOpen(true);
                        }}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Manage Access/Time"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    <button
                        onClick={async () => {
                            if (confirm("Are you sure you want to delete this candidate?")) {
                                await deleteCandidate(row.student_id);
                                showToast("Candidate deleted", 'success');
                            }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    const filteredCandidates = (candidates || []).filter(candidate => {
        // Filter by status
        if (statusFilter !== "all" && candidate.status?.toLowerCase() !== statusFilter.toLowerCase()) {
            return false;
        }
        // Verification filter - all proficiency candidates are "Proficiency Test Only"
        // This filter is mainly for UI consistency with IELTS/TOEFL page
        if (verificationFilter !== "all" && verificationFilter !== "proficiency_test") {
            return false;
        }
        return true;
    });

    if (isLoading) return <main className="flex-1 flex items-center justify-center p-20 p-6"><p>Loading candidates...</p></main>;

    return (
        <main className="flex-1 min-w-0 flex flex-col bg-gray-50 px-4 sm:px-8 py-6 ">
            <DataTable
                title="Proficiency Candidates (Test Only)"
                columns={columns}
                data={filteredCandidates}
                isLoading={isLoading}
                isDark={isDark}
                itemsPerPage={10}
                customHeaderLeft={
                    <div className="flex gap-3 flex-wrap">
                        {/* Status Filter */}
                        <div className="relative group min-w-[180px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer"
                            >
                                <option value="all">Everywhere</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Verification Filter */}
                        <div className="relative group min-w-[180px]">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer"
                            >
                                <option value="all">All Verification</option>
                                <option value="proficiency_test">Proficiency Test</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Edit Modal (Styled like Student Management) */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Candidate"
                size="xl"
            >

                <form onSubmit={handleEditSubmit} className="flex flex-col h-full max-h-[85vh]">
                    <div className="p-1 space-y-6 flex-grow overflow-y-auto">

                        {/* Student Information Section */}
                        <div className={`p-5 rounded-xl border-2 ${isDark ? 'bg-gray-700/20 border-gray-700' : 'bg-blue-50/30 border-blue-100'}`}>
                            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Student Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.first_name || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.last_name || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={editFormData.email || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={editFormData.age || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.date_of_birth || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Place of Birth
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.place_of_birth || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, place_of_birth: e.target.value })}
                                            placeholder="City of birth"
                                            className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Sex
                                    </label>
                                    <select
                                        value={editFormData.sex || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-600'}`}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Residency Country
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.residency_country || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, residency_country: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Residency City
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.residency_city || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, residency_city: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.phone || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <h4 className={`text-md font-bold mt-4 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Security</h4>
                                </div>

                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        New Password <span className="text-gray-400 font-normal text-xs">(optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep current"
                                        value={editFormData.password || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Repeat new password"
                                        value={editFormData.confirmPassword || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-600'}`}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end pt-6 border-t mt-4 gap-3">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Update Candidate
                        </button>
                    </div>
                </form>
            </Modal>


            {/* View Info Modal */}
            <Modal
                isOpen={infoModalOpen}
                onClose={() => { setInfoModalOpen(false); setSelectedCandidate(null); }}

                title="Candidate Information"
            >
                {selectedCandidate && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Student ID</p>
                                <p className="text-lg font-mono font-bold text-blue-600">{selectedCandidate.student_id}</p>
                            </div>
                            <div className="h-10 w-1 bg-blue-600 rounded-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Full Name</p>
                                <p className="text-sm font-medium">{selectedCandidate.first_name} {selectedCandidate.last_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedCandidate.status === 'Approved' ? 'bg-green-100 text-green-700' : selectedCandidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedCandidate.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                                <p className="text-sm font-medium break-all">{selectedCandidate.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone</p>
                                <p className="text-sm font-medium">{selectedCandidate.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Location</p>
                                <p className="text-sm font-medium">{selectedCandidate.residency_city}, {selectedCandidate.residency_country}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Education</p>
                                <p className="text-sm font-medium">{selectedCandidate.educational_level}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Age / Sex</p>
                                <p className="text-sm font-medium">{selectedCandidate.age} / {selectedCandidate.sex}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date of Birth</p>
                                <p className="text-sm font-medium">{selectedCandidate.date_of_birth ? new Date(selectedCandidate.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Place of Birth</p>
                                <p className="text-sm font-medium">{selectedCandidate.place_of_birth || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setInfoModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Essay Modal */}
            <Modal
                isOpen={essayModalOpen}
                onClose={() => { setEssayModalOpen(false); setSelectedCandidate(null); }}
                title="Candidate Intent Essay"
            >
                {selectedCandidate && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-bold text-gray-700 mb-2">Why are you asking for an English Proficiency Certificate?</h4>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {selectedCandidate.reason_essay}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    // Simple text download simulation
                                    const element = document.createElement("a");
                                    const file = new Blob([selectedCandidate.reason_essay], { type: 'text/plain' });
                                    element.href = URL.createObjectURL(file);
                                    element.download = `Essay_${selectedCandidate.first_name}_${selectedCandidate.last_name}.txt`;
                                    document.body.appendChild(element); // Required for this to work in FireFox
                                    element.click();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Download Text
                            </button>
                            <button
                                onClick={() => setEssayModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Extension Modal */}
            <Modal
                isOpen={extensionModalOpen}
                onClose={() => { setExtensionModalOpen(false); setSelectedCandidate(null); }}
                title="Manage Entry Access"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Granting time will strictly set the student's entry window to the duration you specify below, starting from NOW.
                    </p>
                    <input
                        type="number"
                        placeholder="Enter minutes (e.g. 30)"
                        value={extraTime}
                        onChange={(e) => setExtraTime(e.target.value)}
                        className="w-full border p-3 rounded"
                    />
                    <button
                        onClick={handleExtendSubmit}
                        className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                    >
                        Start/Restart Timer
                    </button>
                </div>
            </Modal>
        </main>
    );


}

