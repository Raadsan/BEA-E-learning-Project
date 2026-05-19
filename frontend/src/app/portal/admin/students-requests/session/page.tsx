"use client";

import { useState, useEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetSessionRequestsQuery, useUpdateSessionRequestStatusMutation } from "@/lib/api/sessionRequestApi";
import { useGetClassesQuery } from "@/lib/api/classApi";
import { useUpdateStudentMutation, useGetStudentsQuery } from "@/lib/api/studentApi";
import { useToast } from "@/components/Toast";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetShiftsQuery } from "@/lib/api/shiftApi";
import AdminConfirmationModal from "@/components/admin/admins/AdminConfirmationModal";

export default function AdminSessionRequestsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();
    
    // API Queries
    const { data: requests = [], isLoading, refetch } = useGetSessionRequestsQuery(undefined);
    const { data: classes = [] } = useGetClassesQuery();
    const { data: allStudents = [] } = useGetStudentsQuery();
    const { data: subprograms = [] } = useGetSubprogramsQuery();
    const { data: programs = [] } = useGetProgramsQuery();
    const { data: shifts = [] } = useGetShiftsQuery();
    
    const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateSessionRequestStatusMutation();
    const [updateStudent, { isLoading: isStudentUpdating }] = useUpdateStudentMutation();

    // Workspace state
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [queueFilter, setQueueFilter] = useState<"pending" | "processed">("pending");

    // Form states inside the workspace
    const [selectedLevelId, setSelectedLevelId] = useState("");
    const [selectedShiftName, setSelectedShiftName] = useState("");
    const [selectedSessionType, setSelectedSessionType] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [internalNote, setInternalNote] = useState("");
    const [activeNotificationTab, setActiveNotificationTab] = useState<"email" | "sms">("email");

    // Confirmation modal state
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null as (() => void) | null
    });

    // Get selected request object
    const selectedRequest = requests.find(r => r.id === selectedRequestId);
    const studentDetail = allStudents.find(s => s.student_id === selectedRequest?.student_id) || {};

    // Auto-select target request class configurations when active request changes
    useEffect(() => {
        if (selectedRequest) {
            // Load saved internal note
            const savedInternal = localStorage.getItem(`session_change_internal_note_${selectedRequest.id}`);
            setInternalNote(savedInternal || "");
            
            // Set public response admin note if already processed
            setAdminNote(selectedRequest.admin_response || "");

            if (selectedRequest.status === "pending") {
                const studentProgramName = selectedRequest.program_name || studentDetail.chosen_program;
                const targetSubName = selectedRequest.subprogram_name || studentDetail.chosen_subprogram_name;
                const reqShift = selectedRequest.requested_shift_name;
                const reqSess = selectedRequest.requested_class_type || selectedRequest.requested_session_type;

                const exactMatch = classes.find(c => {
                    const programMatch = c.program_name === studentProgramName;
                    const subprogramMatch = c.subprogram_name === targetSubName;
                    const shiftMatch = c.shift_name?.toLowerCase() === reqShift?.toLowerCase();
                    const sessionMatch = c.shift_session?.toLowerCase() === reqSess?.toLowerCase();
                    return programMatch && subprogramMatch && shiftMatch && sessionMatch;
                });

                if (exactMatch) {
                    setSelectedLevelId(exactMatch.subprogram_id?.toString() || "");
                    setSelectedShiftName(exactMatch.shift_name || "");
                    setSelectedSessionType(exactMatch.shift_session || "");
                    setSelectedClassId(exactMatch.id?.toString() || "");
                } else {
                    const levelMatch = subprograms.find(l => l.subprogram_name === targetSubName);
                    if (levelMatch) {
                        setSelectedLevelId(levelMatch.id.toString());
                        if (reqShift) setSelectedShiftName(reqShift);
                        if (reqSess) setSelectedSessionType(reqSess);
                    }
                }
            } else {
                // If processed, display historical class data if any
                setSelectedLevelId("");
                setSelectedShiftName("");
                setSelectedSessionType("");
                setSelectedClassId("");
            }
        }
    }, [selectedRequestId, selectedRequest, classes, studentDetail, subprograms]);

    // Handle saving internal note
    const handleSaveInternalNote = () => {
        if (!selectedRequest) return;
        localStorage.setItem(`session_change_internal_note_${selectedRequest.id}`, internalNote);
        
        // Log action in audit history
        const logEntry = {
            id: Date.now(),
            requestId: selectedRequest.id,
            studentName: selectedRequest.student_name,
            action: "Internal Note Saved",
            details: "Administrator updated private internal notes.",
            timestamp: new Date().toISOString()
        };
        const existingLogs = JSON.parse(localStorage.getItem("session_request_audit_logs") || "[]");
        localStorage.setItem("session_request_audit_logs", JSON.stringify([logEntry, ...existingLogs]));

        showToast("Internal notes updated successfully!", "success");
    };

    // Process approval/rejection
    const handleProcessRequest = async (status: "approved" | "rejected") => {
        if (!selectedRequest) return;

        if (status === "approved" && !selectedClassId) {
            showToast("Please assign a class before approving.", "error");
            return;
        }
        if (status === "rejected" && !adminNote.trim()) {
            showToast("Please provide a rejection note for the student.", "error");
            return;
        }

        setConfirmationModal({
            isOpen: true,
            title: status === "approved" ? "Approve Session Change Request" : "Reject Session Change Request",
            message: status === "approved"
                ? `Are you sure you want to approve ${selectedRequest.student_name}'s request and transfer them to the selected class?`
                : `Are you sure you want to reject this request and notify the student with the reason?`,
            onConfirm: async () => {
                try {
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                    
                    // 1. Update Request Status in DB
                    await updateStatus({ id: selectedRequest.id, status, admin_response: adminNote }).unwrap();

                    // 2. If approved, update Student's class in DB
                    if (status === "approved") {
                        const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
                        const subprogramId = selectedClass?.subprogram_id || null;

                        await updateStudent({
                            id: selectedRequest.student_id,
                            class_id: parseInt(selectedClassId),
                            chosen_subprogram: subprogramId
                        }).unwrap();
                    }

                    // 3. Log into historical audit logs (Requirement 1.55)
                    const logEntry = {
                        id: Date.now(),
                        requestId: selectedRequest.id,
                        studentName: selectedRequest.student_name,
                        action: status === "approved" ? "Request Approved" : "Request Rejected",
                        details: status === "approved"
                            ? `Class placement updated to class ID ${selectedClassId}.`
                            : `Rejection explanation: "${adminNote}"`,
                        timestamp: new Date().toISOString()
                    };
                    const existingLogs = JSON.parse(localStorage.getItem("session_request_audit_logs") || "[]");
                    localStorage.setItem("session_request_audit_logs", JSON.stringify([logEntry, ...existingLogs]));

                    showToast(`Request ${status} successfully!`, "success");
                    refetch();
                } catch (err: any) {
                    console.error("Action failed:", err);
                    showToast(err?.data?.error || "Failed to update status.", "error");
                }
            }
        });
    };

    // Calculate Conflict Detections (Requirement 1.56)
    const checkConflicts = (req: any) => {
        const warnings: string[] = [];
        if (!req) return warnings;

        // Conflict 1: Class Capacity (Limit 20 students)
        const targetClass = classes.find(c => {
            const levelMatch = c.subprogram_name === req.subprogram_name;
            const shiftMatch = c.shift_name?.toLowerCase() === req.requested_shift_name?.toLowerCase();
            const sessionMatch = c.shift_session?.toLowerCase() === (req.requested_class_type || req.requested_session_type)?.toLowerCase();
            return levelMatch && shiftMatch && sessionMatch;
        });

        if (targetClass) {
            const enrolledCount = allStudents.filter(s => s.class_id === targetClass.id).length;
            if (enrolledCount >= 20) {
                warnings.push(`⚠️ Capacity Alert: Target class "${targetClass.class_name}" is at maximum capacity (${enrolledCount}/20). Assigning this student will exceed capacity.`);
            } else if (enrolledCount >= 18) {
                warnings.push(`⚠️ Near Limit: Target class "${targetClass.class_name}" is near maximum capacity (${enrolledCount}/20).`);
            }
        } else {
            warnings.push("⚠️ Missing Target Class: No active configured class fits this level, shift, and session combination yet.");
        }

        // Conflict 2: Time Overlap / Same Shift Request
        if (req.current_shift_name?.toLowerCase() === req.requested_shift_name?.toLowerCase()) {
            warnings.push(`⚠️ Redundant Shift Request: Student is already in the requested shift "${req.requested_shift_name}".`);
        }

        return warnings;
    };

    // Populate filtered requests for the queue
    const filteredRequests = requests.filter(req => {
        const matchesSearch = 
            (req.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.student_id || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = queueFilter === "pending" 
            ? req.status === "pending" 
            : req.status === "approved" || req.status === "rejected";
            
        return matchesSearch && matchesFilter;
    });

    // Get current audited events for active request (Requirement 1.55)
    const getAuditHistory = () => {
        if (!selectedRequest) return [];
        const logs = JSON.parse(localStorage.getItem("session_request_audit_logs") || "[]");
        const specificLogs = logs.filter((l: any) => l.requestId === selectedRequest.id);
        
        // Add initial submission log
        const submissionLog = {
            id: "initial",
            action: "Request Submitted",
            details: `Student submitted request to transition from ${selectedRequest.current_shift_name || "N/A"} to ${selectedRequest.requested_shift_name}.`,
            timestamp: selectedRequest.created_at
        };
        return [...specificLogs, submissionLog];
    };

    // Class selection lookups for rendering inside the right pane form
    const studentProgramName = selectedRequest?.program_name || studentDetail.chosen_program;
    const studentProgram = programs.find(p => p.title === studentProgramName);
    const availableLevels = studentProgram ? subprograms.filter(sp => sp.program_id === studentProgram.id) : [];
    const shiftsForLevel = selectedLevelId ? classes.filter(cls => cls.subprogram_id == selectedLevelId) : [];
    const uniqueShiftNames = [...new Set(shiftsForLevel.map(cls => cls.shift_name))].filter(Boolean) as string[];
    const sessionsForShift = selectedShiftName ? shiftsForLevel.filter(cls => cls.shift_name === selectedShiftName) : [];
    const availableSessions = [...new Set(sessionsForShift.map(cls => cls.shift_session))].filter(Boolean) as string[];
    const filteredClasses = selectedSessionType ? sessionsForShift.filter(cls => cls.shift_session === selectedSessionType) : [];

    // Pending counts for sidebar indicators
    const pendingCount = requests.filter(r => r.status === "pending").length;

    if (isLoading) {
        return (
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[70vh]">
                <div className="text-center font-bold text-gray-500">Loading Session Change Workspace...</div>
            </main>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-6 transition-colors duration-300`}>
            {/* Header Title Banner */}
            <div className="mb-6 flex justify-between items-center border-b border-gray-250 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Student Session Change Request Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Review inbound schedule transfer requests, assess time conflicts, and assign student placements.</p>
                </div>
            </div>

            {/* Main Split Pane Layout Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* 1. LEFT PANE: INBOUND QUEUE (Requirement 1.58) */}
                <div className={`md:col-span-4 lg:col-span-3 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-gray-850' : 'bg-white border-gray-200'} p-4 flex flex-col space-y-4 shadow-sm h-[calc(100vh-160px)] sticky top-6 overflow-y-auto`}>
                    <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                        <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500">Inbound Queue</h2>
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendingCount} Pending
                        </span>
                    </div>

                    {/* Filter and Search Box (Requirement 1.3) */}
                    <div className="space-y-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by student name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                                    isDark 
                                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                                        : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                                }`}
                            />
                        </div>

                        {/* Status Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg">
                            <button
                                onClick={() => setQueueFilter("pending")}
                                className={`py-1 text-xs font-bold rounded-md transition-all ${
                                    queueFilter === "pending"
                                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Inbox ({requests.filter(r => r.status === "pending").length})
                            </button>
                            <button
                                onClick={() => setQueueFilter("processed")}
                                className={`py-1 text-xs font-bold rounded-md transition-all ${
                                    queueFilter === "processed"
                                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Processed
                            </button>
                        </div>
                    </div>

                    {/* Queue Card List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {filteredRequests.length === 0 ? (
                            <div className="text-center text-xs text-gray-400 py-8 font-semibold">No requests found.</div>
                        ) : (
                            filteredRequests.map(req => {
                                const hasConflicts = checkConflicts(req).length > 0;
                                const isSelected = req.id === selectedRequestId;
                                
                                return (
                                    <div
                                        key={req.id}
                                        onClick={() => setSelectedRequestId(req.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                                            isSelected
                                                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 shadow-sm"
                                                : isDark
                                                    ? "bg-[#111827] border-gray-800 hover:bg-gray-800"
                                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-1">
                                            <h4 className="font-bold text-xs truncate max-w-[150px]">{req.student_name}</h4>
                                            {/* Conflict Detected Badge indicator */}
                                            {hasConflicts && req.status === "pending" && (
                                                <span className="text-amber-500 shrink-0" title="Conflicts or Class Overload Detected!">
                                                    ⚠️
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold truncate mt-1">ID: {req.student_id}</p>
                                        
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-800 p-1.5 rounded border dark:border-gray-700">
                                            <span className="font-medium truncate max-w-[70px]">{req.current_shift_name || "N/A"}</span>
                                            <span className="text-blue-500 font-bold">➡️</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[70px]">{req.requested_shift_name}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2.5">
                                            <span className="text-[9px] text-gray-400 font-semibold">{new Date(req.created_at).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                                                req.status === "approved"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                                    : req.status === "rejected"
                                                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                                            }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. RIGHT PANE: DETAIL & WORKSPACE (Requirement 1.58) */}
                <div className={`md:col-span-8 lg:col-span-9 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-gray-850' : 'bg-white border-gray-200'} p-6 shadow-sm min-h-[calc(100vh-160px)] flex flex-col`}>
                    
                    {!selectedRequest ? (
                        /* Beautiful Blank State View */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 text-2xl shadow-sm border dark:border-blue-800 animate-pulse">
                                📬
                            </div>
                            <h3 className="text-lg font-bold">Select a request to begin review</h3>
                            <p className="text-sm text-gray-400 max-w-md">
                                Choose a student request from the inbound queue in the left pane to assess time conflicts, check class capacities, write private audit notes, and approve or deny transfers.
                            </p>
                        </div>
                    ) : (
                        /* Active Workspace Details */
                        <div className="space-y-6 flex-1 flex flex-col">
                            
                            {/* Request Header */}
                            <div className="flex justify-between items-start flex-wrap gap-4 border-b dark:border-gray-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold border dark:border-blue-800">
                                        {selectedRequest.student_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">{selectedRequest.student_name}</h2>
                                        <p className="text-xs text-gray-500">Student ID: <span className="font-bold text-gray-700 dark:text-gray-300">{selectedRequest.student_id}</span> | Email: {selectedRequest.student_email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold ${
                                        selectedRequest.status === "approved"
                                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border border-green-200"
                                            : selectedRequest.status === "rejected"
                                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-200"
                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 border border-yellow-200"
                                    }`}>
                                        {selectedRequest.status}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-2 font-semibold">Submitted: {new Date(selectedRequest.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* 1.54. SMART STATUS PROGRESS TRACKER (Requirement 1.54) */}
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Smart Status Progress Tracker</h3>
                                <div className="flex items-center justify-between relative">
                                    {/* Progress background line */}
                                    <div className="absolute left-0 right-0 h-0.5 bg-gray-250 dark:bg-gray-750 top-1/2 -translate-y-1/2 z-0" />
                                    
                                    {/* Dynamic Progress fill line */}
                                    <div className={`absolute left-0 h-0.5 bg-green-500 top-1/2 -translate-y-1/2 z-0 transition-all duration-500`} 
                                        style={{ 
                                            width: selectedRequest.status === "approved" 
                                                ? "100%" 
                                                : selectedRequest.status === "rejected" 
                                                    ? "100%" 
                                                    : "50%" 
                                        }} 
                                    />

                                    {/* Tracker Steps */}
                                    {[
                                        { label: "Submitted", active: true, done: true },
                                        { label: "Faculty Review", active: true, done: selectedRequest.status !== "pending" },
                                        { label: "Review Committee", active: true, done: selectedRequest.status !== "pending" },
                                        { label: "Registrar Phase", active: true, done: selectedRequest.status !== "pending" },
                                        { 
                                            label: selectedRequest.status === "rejected" ? "Rejected" : "Completed", 
                                            active: selectedRequest.status !== "pending", 
                                            done: selectedRequest.status !== "pending", 
                                            error: selectedRequest.status === "rejected" 
                                        }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center z-10 space-y-1.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                                                step.error 
                                                    ? "bg-red-500 border-red-600 text-white"
                                                    : step.done 
                                                        ? "bg-green-500 border-green-600 text-white" 
                                                        : step.active 
                                                            ? "bg-blue-600 border-blue-700 text-white animate-pulse" 
                                                            : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500"
                                            }`}>
                                                {step.error ? "❌" : step.done ? "✓" : idx + 1}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center">{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Session Detail Grid Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Placement</p>
                                    <h4 className="text-sm font-bold mt-1 text-gray-800 dark:text-white">{selectedRequest.current_class_name || "Unassigned"}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Shift: <span className="font-semibold">{selectedRequest.current_shift_name || "N/A"}</span> | Session: {selectedRequest.current_session_type || "N/A"}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-950/20 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Requested Placement</p>
                                    <h4 className="text-sm font-extrabold mt-1 text-blue-800 dark:text-blue-300">{selectedRequest.requested_class_name || "Any Available"}</h4>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                        Requested Shift: <span className="font-bold">{selectedRequest.requested_shift_name}</span> | Level: {selectedRequest.subprogram_name || "-"}
                                    </p>
                                </div>
                            </div>

                            {/* Student Reason */}
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Student Statement & Reason</p>
                                <blockquote className={`p-3 rounded-lg border italic text-xs leading-relaxed ${
                                    isDark ? 'bg-gray-800/40 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                                }`}>
                                    "{selectedRequest.reason || 'No specific reason provided'}"
                                </blockquote>
                            </div>

                            {/* 1.56. CONFLICT DETECTION INDICATORS (Requirement 1.56) */}
                            {selectedRequest.status === "pending" && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Security & Capacity Check</h3>
                                    
                                    {checkConflicts(selectedRequest).length === 0 ? (
                                        <div className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 text-xs text-green-700 dark:text-green-400 flex items-center gap-2 font-bold">
                                            <span>🛡️</span>
                                            <span>Conflict check passed: No schedule time conflicts or capacity overloads detected for this target shift.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {checkConflicts(selectedRequest).map((warn, wIdx) => (
                                                <div key={wIdx} className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2 font-bold animate-pulse">
                                                    <span>⚠️</span>
                                                    <span>{warn}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 1.59. INTERNAL AUDIT NOTES (Admins Only - Requirement 1.59) */}
                            <div className="p-4 rounded-xl border border-gray-250 dark:border-gray-800 bg-slate-50 dark:bg-slate-900/50 space-y-3 shadow-xs">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-blue-500 font-bold">🔒</span>
                                        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Internal Audit notes (Hidden from Students)</label>
                                    </div>
                                    {selectedRequest.status === "pending" && (
                                        <button
                                            onClick={handleSaveInternalNote}
                                            className="px-2.5 py-1 bg-[#010080] hover:bg-[#010080]/90 text-white rounded text-[10px] font-bold transition-all shadow-xs"
                                        >
                                            Save Notes
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                    placeholder="Leave administrative or assessment notes here. This is fully locked away from students..."
                                    rows={3}
                                    disabled={selectedRequest.status !== "pending"} // Locked and not editable after processing (Requirement 1.60)
                                    className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 ${
                                        selectedRequest.status !== "pending"
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : isDark
                                                ? 'bg-gray-800 border-gray-700 text-white'
                                                : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                />
                                {selectedRequest.status !== "pending" && (
                                    <p className="text-[10px] text-gray-400 italic">🔒 Requirement 1.60: Request processed. Internal notes are archived and cannot be edited.</p>
                                )}
                            </div>

                            {/* Action Form & notification preview */}
                            {selectedRequest.status === "pending" ? (
                                <div className="space-y-6 pt-4 border-t dark:border-gray-800">
                                    <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Class Transfer & Resolution Panel</h3>
                                    
                                    <div className="space-y-4">
                                        {/* Class selection mapping */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">1. Choose Level (Subprogram)</label>
                                                <select
                                                    value={selectedLevelId}
                                                    onChange={(e) => {
                                                        setSelectedLevelId(e.target.value);
                                                        setSelectedShiftName("");
                                                        setSelectedSessionType("");
                                                        setSelectedClassId("");
                                                    }}
                                                    className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 ${
                                                        isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Select Level</option>
                                                    {availableLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.subprogram_name}</option>)}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">2. Shift</label>
                                                    <select
                                                        value={selectedShiftName}
                                                        disabled={!selectedLevelId}
                                                        onChange={(e) => {
                                                            setSelectedShiftName(e.target.value);
                                                            setSelectedSessionType("");
                                                            setSelectedClassId("");
                                                        }}
                                                        className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${
                                                            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        <option value="">Shift</option>
                                                        {uniqueShiftNames.map(name => <option key={name} value={name}>{name}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">3. Session</label>
                                                    <select
                                                        value={selectedSessionType}
                                                        disabled={!selectedShiftName}
                                                        onChange={(e) => {
                                                            setSelectedSessionType(e.target.value);
                                                            setSelectedClassId("");
                                                        }}
                                                        className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${
                                                            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        <option value="">Session</option>
                                                        {availableSessions.map(sess => <option key={sess} value={sess}>{sess}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">4. Target Class Placement</label>
                                            <select
                                                value={selectedClassId}
                                                disabled={!selectedSessionType}
                                                onChange={(e) => setSelectedClassId(e.target.value)}
                                                className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 font-bold ${
                                                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                                }`}
                                            >
                                                <option value="">Select Target Class</option>
                                                {filteredClasses.map(cls => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.class_name} ({allStudents.filter(s => s.class_id === cls.id).length}/20 Students)
                                                    </option>
                                                ))}
                                            </select>
                                            {filteredClasses.length === 0 && selectedSessionType && (
                                                <p className="text-xs text-red-500 mt-1 italic">No active classes match this criteria.</p>
                                            )}
                                        </div>

                                        {/* Public Admin Note explanation */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Public Resolution Note (Shared with Student)</label>
                                            <textarea
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                                placeholder="Provide the reason for approval or rejection..."
                                                rows={3}
                                                className={`w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 ${
                                                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
                                                }`}
                                            />
                                        </div>

                                        {/* 1.57. AUTOMATED STUDENT NOTIFICATION PREVIEW (Requirement 1.57) */}
                                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#0f172a] space-y-3 shadow-xs">
                                            <div className="flex justify-between items-center border-b pb-2 dark:border-gray-800">
                                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Automated Notification Previews</h4>
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setActiveNotificationTab("email")}
                                                        className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                            activeNotificationTab === "email"
                                                                ? "bg-blue-600 text-white shadow-xs"
                                                                : "text-gray-400 hover:text-gray-200"
                                                        }`}
                                                    >
                                                        Email Preview
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveNotificationTab("sms")}
                                                        className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                            activeNotificationTab === "sms"
                                                                ? "bg-blue-600 text-white shadow-xs"
                                                                : "text-gray-400 hover:text-gray-200"
                                                        }`}
                                                    >
                                                        SMS Preview
                                                    </button>
                                                </div>
                                            </div>

                                            {activeNotificationTab === "email" ? (
                                                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-lg text-xs space-y-1.5 shadow-2xs font-mono">
                                                    <p className="text-gray-400"><strong className="text-gray-700 dark:text-white font-bold">To:</strong> {selectedRequest.student_email}</p>
                                                    <p className="text-gray-400"><strong className="text-gray-700 dark:text-white font-bold">Subject:</strong> Session Change Request Resolution</p>
                                                    <hr className="dark:border-gray-800" />
                                                    <div className="text-gray-650 dark:text-gray-300 space-y-1">
                                                        <p>Dear {selectedRequest.student_name},</p>
                                                        <p>Your session change request has been reviewed. Standard evaluation parameters have been assessed.</p>
                                                        <p className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded border dark:border-blue-800">
                                                            Status: [Process Pending Approval/Rejection]
                                                        </p>
                                                        {adminNote && <p className="italic text-gray-500">"Notes: {adminNote}"</p>}
                                                        <p className="text-[10px] text-gray-400 mt-4">BEA Academic Registry Department</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-3 rounded-lg text-xs shadow-2xs font-mono max-w-sm">
                                                    <p className="text-blue-500 font-bold mb-1">💬 SMS Notification Preview</p>
                                                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg border dark:border-gray-750 text-gray-750 dark:text-gray-300">
                                                        BEA E-Learning: Hi {selectedRequest.student_name.split(" ")[0]}, your session request from {selectedRequest.current_shift_name || "N/A"} to {selectedRequest.requested_shift_name} is reviewed. Notes: {adminNote || "Evaluated by Academic registry"}.
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Process Buttons */}
                                        <div className="flex gap-4 pt-2">
                                            <button
                                                disabled={isStatusUpdating || isStudentUpdating || !adminNote.trim()}
                                                onClick={() => handleProcessRequest("rejected")}
                                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-md text-xs disabled:opacity-50"
                                            >
                                                {isStatusUpdating ? "Processing..." : "Reject request"}
                                            </button>
                                            <button
                                                disabled={isStatusUpdating || isStudentUpdating || !selectedClassId}
                                                onClick={() => handleProcessRequest("approved")}
                                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-md text-xs disabled:opacity-50"
                                            >
                                                {isStatusUpdating ? "Processing..." : "Assign & Approve request"}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                /* Processed permanently and locked (Requirement 1.60) */
                                <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                                    <div className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center space-y-2 shadow-xs ${
                                        selectedRequest.status === "approved"
                                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                            : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                    }`}>
                                        <span className="text-2xl">
                                            {selectedRequest.status === "approved" ? "✅" : "❌"}
                                        </span>
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider">
                                            {selectedRequest.status === "approved"
                                                ? "Request Approved & Class Placement Completed"
                                                : "Request Rejected & Archived"
                                            }
                                        </h3>
                                        <p className="text-xs text-gray-500 max-w-md">
                                            This request has been resolved, and student notifications have been automatically delivered. Per Requirement 1.60, processed logs are permanent and cannot be modified.
                                        </p>
                                    </div>

                                    {/* Display saved note */}
                                    {selectedRequest.admin_response && (
                                        <div className="p-3 rounded-lg border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Historical Resolution Response</p>
                                            <p className="text-xs mt-1 text-gray-700 dark:text-gray-300 font-medium">"{selectedRequest.admin_response}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 1.55. ACTION HISTORY AUDIT LOG (Requirement 1.55) */}
                            <div className="space-y-3 pt-6 border-t dark:border-gray-800 mt-auto">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Request Action Audit trail</h3>
                                <div className="space-y-3">
                                    {getAuditHistory().map((log: any, logIdx) => (
                                        <div key={logIdx} className="flex gap-3 text-xs">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                                                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-1" />
                                            </div>
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{log.action}</span>
                                                    <span className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500">{log.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* Confirmation Modals */}
            <AdminConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm || (() => {})}
                isDark={isDark}
            />
        </div>
    );
}
