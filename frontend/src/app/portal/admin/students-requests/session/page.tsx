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
import { resolveStudentSubprogramId } from "@/utils/resolveStudentSubprogram";

function getMatchingClassesForRequest(
    req: {
        current_class_id?: number | null;
        requested_class_id?: number | null;
        subprogram_name?: string;
        requested_shift_name?: string;
        requested_class_type?: string;
        requested_session_type?: string;
    } | null | undefined,
    student: {
        class_id?: number | null;
        chosen_subprogram?: string | number | null;
        subprogram_id?: number | string | null;
    },
    allClasses: Array<{
        id: number;
        subprogram_id?: number | null;
        subprogram_name?: string;
        shift_name?: string;
        shift_session?: string;
    }>,
    allSubprograms: Array<{ id: number; subprogram_name?: string }>
) {
    if (!req) return [];

    if (req.requested_class_id) {
        const direct = allClasses.find((c) => c.id === Number(req.requested_class_id));
        if (direct) return [direct];
    }

    const currentClass = allClasses.find(
        (c) => c.id === Number(req.current_class_id) || c.id === Number(student?.class_id)
    );
    const subprogramId = resolveStudentSubprogramId(
        {
            chosen_subprogram: req.subprogram_name || student?.chosen_subprogram,
            subprogram_id: student?.subprogram_id,
        },
        currentClass,
        allSubprograms
    );

    const reqShift = req.requested_shift_name;
    const reqSess = req.requested_class_type || req.requested_session_type;

    return allClasses.filter((c) => {
        if (subprogramId) {
            if (Number(c.subprogram_id) !== Number(subprogramId)) return false;
        } else if (req.subprogram_name) {
            const subName = String(req.subprogram_name).toLowerCase();
            if (c.subprogram_name?.toLowerCase() !== subName) return false;
        } else {
            return false;
        }
        if (reqShift && c.shift_name?.toLowerCase() !== reqShift.toLowerCase()) return false;
        if (reqSess && c.shift_session?.toLowerCase() !== reqSess.toLowerCase()) return false;
        return true;
    });
}

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
            // Set public response admin note if already processed
            setAdminNote(selectedRequest.admin_response || "");

            if (selectedRequest.status === "pending") {
                const matching = getMatchingClassesForRequest(
                    selectedRequest,
                    studentDetail,
                    classes,
                    subprograms
                );
                const currentClass = classes.find(
                    (c) =>
                        c.id === Number(selectedRequest.current_class_id) ||
                        c.id === Number(studentDetail.class_id)
                );
                const subprogramId = resolveStudentSubprogramId(
                    {
                        chosen_subprogram:
                            selectedRequest.subprogram_name || studentDetail.chosen_subprogram,
                        subprogram_id: studentDetail.subprogram_id,
                    },
                    currentClass,
                    subprograms
                );

                if (matching.length > 0) {
                    const target =
                        matching.find((c) => c.id === Number(selectedRequest.requested_class_id)) ||
                        matching[0];
                    setSelectedLevelId(String(target.subprogram_id || subprogramId || ""));
                    setSelectedShiftName(target.shift_name || "");
                    setSelectedSessionType(target.shift_session || "");
                    setSelectedClassId(
                        selectedRequest.requested_class_id
                            ? String(selectedRequest.requested_class_id)
                            : matching.length === 1
                                ? String(target.id)
                                : ""
                    );
                } else if (subprogramId) {
                    setSelectedLevelId(String(subprogramId));
                    setSelectedShiftName(selectedRequest.requested_shift_name || "");
                    setSelectedSessionType(
                        selectedRequest.requested_class_type ||
                            selectedRequest.requested_session_type ||
                            ""
                    );
                    setSelectedClassId("");
                } else {
                    setSelectedLevelId("");
                    setSelectedShiftName("");
                    setSelectedSessionType("");
                    setSelectedClassId("");
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

        const student = allStudents.find((s) => s.student_id === req.student_id) || {};
        const matching = getMatchingClassesForRequest(req, student, classes, subprograms);
        const targetClass = matching[0];

        if (targetClass) {
            const enrolledCount = allStudents.filter(s => s.class_id === targetClass.id).length;
            if (enrolledCount >= 20) {
                warnings.push(`Capacity alert: "${targetClass.class_name}" is full (${enrolledCount}/20 students).`);
            } else if (enrolledCount >= 18) {
                warnings.push(`Near capacity: "${targetClass.class_name}" has ${enrolledCount}/20 students.`);
            }
        } else {
            warnings.push("No class found for the requested level, shift, and session combination.");
        }

        if (req.current_shift_name?.toLowerCase() === req.requested_shift_name?.toLowerCase()) {
            warnings.push(`Student is already in shift "${req.requested_shift_name}".`);
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

    const matchingClassesForRequest = selectedRequest
        ? getMatchingClassesForRequest(selectedRequest, studentDetail, classes, subprograms)
        : [];
    const hasAvailableClass = matchingClassesForRequest.length > 0;

    const statusSteps = selectedRequest
        ? [
            { label: "Submitted", done: true, active: false, neutral: true },
            {
                label: "Admin Review",
                done: selectedRequest.status !== "pending",
                active: selectedRequest.status === "pending",
            },
            {
                label: selectedRequest.status === "rejected" ? "Rejected" : "Approved",
                done: selectedRequest.status !== "pending",
                active: false,
                error: selectedRequest.status === "rejected",
            },
        ]
        : [];

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
        <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
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
                                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
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
                                className={`py-1 text-xs font-bold rounded-md ${
                                    queueFilter === "pending"
                                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                }`}
                            >
                                Inbox ({requests.filter(r => r.status === "pending").length})
                            </button>
                            <button
                                onClick={() => setQueueFilter("processed")}
                                className={`py-1 text-xs font-bold rounded-md ${
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
                                        className={`p-3 rounded-xl border cursor-pointer ${
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
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 text-2xl border dark:border-blue-800">
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

                            {/* Request Status */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Request Status</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
                                    {statusSteps.map((step, idx) => (
                                        <div
                                            key={step.label}
                                            className={`px-4 py-3 flex items-center gap-3 ${
                                                step.error
                                                    ? "bg-red-50 dark:bg-red-950/20"
                                                    : step.active
                                                        ? "bg-blue-50 dark:bg-blue-950/20"
                                                        : step.done && step.neutral
                                                            ? "bg-gray-50 dark:bg-gray-800/50"
                                                            : step.done
                                                                ? "bg-green-50 dark:bg-green-950/20"
                                                                : "bg-white dark:bg-gray-900"
                                            }`}
                                        >
                                            <span
                                                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    step.error
                                                        ? "bg-red-600 text-white"
                                                        : step.done && step.neutral
                                                            ? "bg-[#010080] text-white"
                                                            : step.done
                                                                ? "bg-green-600 text-white"
                                                                : step.active
                                                                    ? "bg-[#010080] text-white"
                                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                                }`}
                                            >
                                                {step.done ? "✓" : idx + 1}
                                            </span>
                                            <div>
                                                <p
                                                    className={`text-sm font-semibold ${
                                                        step.error
                                                            ? "text-red-700 dark:text-red-300"
                                                            : step.active
                                                                ? "text-[#010080]"
                                                                : step.done && step.neutral
                                                                    ? "text-gray-700 dark:text-gray-200"
                                                                    : step.done
                                                                        ? "text-green-700 dark:text-green-300"
                                                                        : "text-gray-500"
                                                    }`}
                                                >
                                                    {step.label}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {step.done ? "Complete" : step.active ? "In progress" : "Waiting"}
                                                </p>
                                            </div>
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

                            {selectedRequest.status === "pending" && (
                                <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Security & Capacity Check</h3>
                                    {!hasAvailableClass ? (
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg px-4 py-3">
                                            No class is available for this session. Create a matching class or reject the request.
                                        </p>
                                    ) : checkConflicts(selectedRequest).length === 0 ? (
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg px-4 py-3">
                                            No conflicts detected. Target shift has available capacity.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {checkConflicts(selectedRequest).map((warn, wIdx) => (
                                                <li
                                                    key={wIdx}
                                                    className="text-sm text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg px-4 py-3"
                                                >
                                                    {warn}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Action Form & notification preview */}
                            {selectedRequest.status === "pending" ? (
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-5">
                                    {hasAvailableClass ? (
                                        <>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                                                Class Transfer & Resolution Panel
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Level (Subprogram)
                                                        </label>
                                                        <select
                                                            value={selectedLevelId}
                                                            onChange={(e) => {
                                                                setSelectedLevelId(e.target.value);
                                                                setSelectedShiftName("");
                                                                setSelectedSessionType("");
                                                                setSelectedClassId("");
                                                            }}
                                                            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#010080] ${
                                                                isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                                                            }`}
                                                        >
                                                            <option value="">Select Level</option>
                                                            {availableLevels.map((lvl) => (
                                                                <option key={lvl.id} value={lvl.id}>
                                                                    {lvl.subprogram_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
                                                            <select
                                                                value={selectedShiftName}
                                                                disabled={!selectedLevelId}
                                                                onChange={(e) => {
                                                                    setSelectedShiftName(e.target.value);
                                                                    setSelectedSessionType("");
                                                                    setSelectedClassId("");
                                                                }}
                                                                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#010080] disabled:opacity-50 ${
                                                                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                                                                }`}
                                                            >
                                                                <option value="">Shift</option>
                                                                {uniqueShiftNames.map((name) => (
                                                                    <option key={name} value={name}>{name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session</label>
                                                            <select
                                                                value={selectedSessionType}
                                                                disabled={!selectedShiftName}
                                                                onChange={(e) => {
                                                                    setSelectedSessionType(e.target.value);
                                                                    setSelectedClassId("");
                                                                }}
                                                                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#010080] disabled:opacity-50 ${
                                                                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                                                                }`}
                                                            >
                                                                <option value="">Session</option>
                                                                {availableSessions.map((sess) => (
                                                                    <option key={sess} value={sess}>{sess}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Target Class
                                                    </label>
                                                    <select
                                                        value={selectedClassId}
                                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                                        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-[#010080] ${
                                                            isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                                                        }`}
                                                    >
                                                        <option value="">Select Target Class</option>
                                                        {filteredClasses.map((cls) => (
                                                            <option key={cls.id} value={cls.id}>
                                                                {cls.class_name} ({allStudents.filter((s) => s.class_id === cls.id).length}/20 Students)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-4 py-4">
                                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                                No Class Available
                                            </h3>
                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                No class exists for this student&apos;s subprogram and requested session.
                                                Create the class first, or reject this request with a note to the student.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            Resolution
                                        </h3>

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
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                disabled={isStatusUpdating || isStudentUpdating || !adminNote.trim()}
                                                onClick={() => handleProcessRequest("rejected")}
                                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm disabled:opacity-50"
                                            >
                                                {isStatusUpdating ? "Processing..." : "Reject Request"}
                                            </button>
                                            {hasAvailableClass && (
                                                <button
                                                    disabled={isStatusUpdating || isStudentUpdating || !selectedClassId}
                                                    onClick={() => handleProcessRequest("approved")}
                                                    className="flex-1 py-2.5 bg-[#010080] hover:bg-[#000066] text-white font-bold rounded-lg text-sm disabled:opacity-50"
                                                >
                                                    {isStatusUpdating ? "Processing..." : "Assign & Approve"}
                                                </button>
                                            )}
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
