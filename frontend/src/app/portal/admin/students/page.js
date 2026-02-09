"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useApproveStudentMutation, useRejectStudentMutation } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetPaymentPackagesQuery } from "@/redux/api/paymentPackageApi";
import {
    useGetIeltsToeflStudentsQuery,
    useDeleteIeltsToeflStudentMutation,
    useUpdateIeltsToeflStudentMutation,
    useRejectIeltsToeflStudentMutation,
    useCreateIeltsToeflStudentMutation
} from "@/redux/api/ieltsToeflApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { Country, City } from "country-state-city";

// Extracted Components
import StudentForm from "./components/StudentForm";
import StudentViewModal from "./components/StudentViewModal";
import StudentApprovalModal from "./components/StudentApprovalModal";
import SubprogramsModal from "./components/SubprogramsModal";
import AssignClassModal from "./components/AssignClassModal";
import AssignSubprogramModal from "./components/AssignSubprogramModal";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function StudentsPage() {
    const { isDark } = useDarkMode();
    const { showToast } = useToast();

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSubprogramsModalOpen, setIsSubprogramsModalOpen] = useState(false);
    const [isAssignSubprogramModalOpen, setIsAssignSubprogramModalOpen] = useState(false);
    const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);

    // Bulk Actions States
    const [bulkActions, setBulkActions] = useState({
        changeStatus: false,
        delete: false
    });
    const [bulkStatusValue, setBulkStatusValue] = useState("approved");

    // Selection States
    const [selectedProgramForSubprograms, setSelectedProgramForSubprograms] = useState(null);
    const [assigningStudent, setAssigningStudent] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingPayments, setViewingPayments] = useState([]);
    const [studentToApprove, setStudentToApprove] = useState(null);

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "", first_name: "", last_name: "", email: "", phone: "", age: "", sex: "Male", residency_country: "",
        residency_city: "", chosen_program: "", chosen_subprogram: "", password: "",
        confirmPassword: "", parent_name: "", parent_email: "", parent_phone: "",
        parent_relation: "", parent_res_county: "", parent_res_city: "",
        funding_status: "Paid", sponsorship_package: "",
        funding_amount: "", funding_month: "", scholarship_percentage: "",
        sponsor_name: "",
        verification_method: "Proficiency Exam",
        certificate_institution: "",
        certificate_date: "",
        certificate_document: "",
        date_of_birth: "",
        place_of_birth: "",
    });

    // API Hooks
    const { data: backendStudents = [], isLoading, isError, error, refetch } = useGetStudentsQuery();
    const { data: ieltsStudents = [], refetch: refetchIelts } = useGetIeltsToeflStudentsQuery();
    const { data: programs = [] } = useGetProgramsQuery();
    const { data: allSubprograms = [] } = useGetSubprogramsQuery();
    const { data: classes = [] } = useGetClassesQuery();
    const { data: paymentPackages = [] } = useGetPaymentPackagesQuery();

    // Mutations
    const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
    const [approveStudent, { isLoading: isApproving }] = useApproveStudentMutation();
    const [rejectStudent, { isLoading: isRejecting }] = useRejectStudentMutation();

    const [deleteIeltsStudent, { isLoading: isDeletingIelts }] = useDeleteIeltsToeflStudentMutation();
    const [updateIeltsStudent, { isLoading: isUpdatingIelts }] = useUpdateIeltsToeflStudentMutation();
    const [rejectIeltsStudent, { isLoading: isRejectingIelts }] = useRejectIeltsToeflStudentMutation();
    const [createIeltsStudent, { isLoading: isCreatingIelts }] = useCreateIeltsToeflStudentMutation();

    // Helper values
    const cities = (() => {
        if (!formData.residency_country) return [];
        const country = Country.getAllCountries().find(c => c.name === formData.residency_country);
        return country ? City.getCitiesOfCountry(country.isoCode) : [];
    })();

    const parentCities = (() => {
        if (!formData.parent_res_county) return [];
        const country = Country.getAllCountries().find(c => c.name === formData.parent_res_county);
        return country ? City.getCitiesOfCountry(country.isoCode) : [];
    })();
    const showParentInfo = formData.age && parseInt(formData.age) < 18;

    // Filter States
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Selection State
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Merge and format students
    const mergedStudents = [
        ...(backendStudents || []).map(s => ({
            ...s, id: s.student_id, type: 'regular',
            approval_status: (s.approval_status || 'pending').toLowerCase()
        })),
        ...ieltsStudents.map(s => ({
            ...s, full_name: `${s.first_name} ${s.last_name}`,
            chosen_program: s.chosen_program || s.exam_type,
            approval_status: (s.status || 'pending').toLowerCase(),
            original_id: s.student_id, // Use student_id instead of id
            id: s.student_id,           // Consistent with regular students
            type: 'ielts',
            class_name: s.class_id ? classes.find(c => c.id == s.class_id)?.class_name : null
        }))
    ];

    // Filter Logic
    const filteredStudents = mergedStudents.filter(student => {
        const matchesProgram = selectedProgram ? (student.chosen_program === selectedProgram || student.exam_type === selectedProgram) : true;
        const matchesStatus = selectedStatus ? student.approval_status === selectedStatus : true;
        return matchesProgram && matchesStatus;
    });


    // Event Handlers
    const handleAddStudent = () => {
        setEditingStudent(null);
        setFormData({
            full_name: "", first_name: "", last_name: "", email: "", phone: "", age: "", sex: "Male", residency_country: "",
            residency_city: "", chosen_program: "", chosen_subprogram: "", password: "",
            confirmPassword: "", parent_name: "", parent_email: "", parent_phone: "",
            parent_relation: "", parent_res_county: "", parent_res_city: "",
            funding_status: "Paid", sponsorship_package: "",
            funding_amount: "", funding_month: "", scholarship_percentage: "",
            sponsor_name: "",
            verification_method: "Proficiency Exam",
            certificate_institution: "",
            certificate_date: "",
            certificate_document: "",
            date_of_birth: "",
            place_of_birth: "",
        });
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            full_name: student.full_name || "",
            first_name: student.first_name || (student.full_name ? student.full_name.split(' ')[0] : ""),
            last_name: student.last_name || (student.full_name ? student.full_name.split(' ').slice(1).join(' ') : ""),
            email: student.email || "", phone: student.phone || "",
            age: student.age || "", sex: student.sex || "Male", residency_country: student.residency_country || "",
            residency_city: student.residency_city || "", chosen_program: student.chosen_program || "",
            chosen_subprogram: student.chosen_subprogram || "", password: "", confirmPassword: "",
            parent_name: student.parent_name || "", parent_email: student.parent_email || "",
            parent_phone: student.parent_phone || "", parent_relation: student.parent_relation || "",
            parent_res_county: student.parent_res_county || "", parent_res_city: student.parent_res_city || "",
            funding_status: student.funding_status || "Paid",
            sponsorship_package: student.sponsorship_package || "",
            funding_amount: student.funding_amount || "",
            funding_month: student.funding_month || "",
            scholarship_percentage: student.scholarship_percentage || "",
            sponsor_name: student.sponsor_name || "",
            verification_method: student.verification_method || "Proficiency Exam",
            certificate_institution: student.certificate_institution || "",
            certificate_date: student.certificate_date || "",
            certificate_document: student.certificate_document || "",
            date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : "",
            place_of_birth: student.place_of_birth || "",
        });
        setIsModalOpen(true);
    };

    const handleView = async (student) => {
        setViewingStudent(student);
        setIsViewModalOpen(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
            const searchId = student.original_id || student.id;
            const res = await fetch(`${baseUrl}/api/payments/student/${searchId}`);
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.success) setViewingPayments(json.payments || []);
        } catch (err) { console.error('Failed to fetch payments', err); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.password && formData.password !== formData.confirmPassword) {
                showToast("Passwords do not match", "error");
                return;
            }

            if (formData.password && editingStudent) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
                if (!passwordRegex.test(formData.password)) {
                    showToast("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol", "error");
                    return;
                }
            }
            const { confirmPassword, ...submitData } = formData;

            // Sanitize numeric fields: convert "" to null or parse to number
            submitData.age = submitData.age === "" ? null : parseInt(submitData.age);
            submitData.funding_amount = submitData.funding_amount === "" ? null : parseFloat(submitData.funding_amount);
            submitData.funding_month = submitData.funding_month === "" ? null : parseInt(submitData.funding_month);
            submitData.scholarship_percentage = submitData.scholarship_percentage === "" ? null : parseInt(submitData.scholarship_percentage);

            if (!submitData.password || submitData.password.trim() === "") delete submitData.password;
            if (submitData.chosen_subprogram === "") submitData.chosen_subprogram = null;

            if (editingStudent) {
                const updateId = editingStudent.type === 'ielts' ? editingStudent.original_id : editingStudent.student_id;
                if (editingStudent.type === 'ielts') {
                    const ieltsUpdateData = {
                        ...submitData,
                        exam_type: submitData.chosen_program ? submitData.chosen_program.toUpperCase() : undefined
                    };
                    await updateIeltsStudent({ id: updateId, ...ieltsUpdateData }).unwrap();
                } else {
                    await updateStudent({ id: updateId, ...submitData }).unwrap();
                }
                showToast("Student updated successfully!", "success");
            } else {
                if (!submitData.password) { showToast("Password is required", "error"); return; }

                const isIeltsToefl = submitData.chosen_program && (submitData.chosen_program.toUpperCase().includes("IELTS") || submitData.chosen_program.toUpperCase().includes("TOEFL"));

                if (isIeltsToefl) {
                    await createIeltsStudent({
                        ...submitData,
                        first_name: submitData.first_name || (submitData.full_name ? submitData.full_name.split(" ")[0] : ""),
                        last_name: submitData.last_name || (submitData.full_name ? submitData.full_name.split(" ").slice(1).join(" ") : "Student"),
                        exam_type: submitData.chosen_program.toUpperCase(),
                        status: 'Pending'
                    }).unwrap();
                } else {
                    await createStudent(submitData).unwrap();
                }
                showToast("Student created successfully!", "success");
            }
            setIsModalOpen(false);
        } catch (error) { showToast(error?.data?.error || "Failed to save student.", "error"); }
    };

    const handleApprove = async (student) => {
        const targetStudent = student || studentToApprove;
        if (!targetStudent) return;
        try {
            if (targetStudent.type === 'ielts') {
                if (selectedClassId) {
                    await updateIeltsStudent({ id: targetStudent.original_id, class_id: selectedClassId, status: 'approved' }).unwrap();
                } else {
                    await updateIeltsStudent({ id: targetStudent.original_id, status: 'approved' }).unwrap();
                }
            } else {
                if (selectedClassId) {
                    await updateStudent({ id: targetStudent.id, class_id: selectedClassId, approval_status: 'approved' }).unwrap();
                } else {
                    await approveStudent(targetStudent.id).unwrap();
                }
            }
            showToast("Student approved!", "success");
            setIsApprovalModalOpen(false);
            setStudentToApprove(null);
            setSelectedClassId(""); // Reset selection
            refetch(); refetchIelts();
        } catch (error) { showToast("Failed to approve.", "error"); }
    };

    const handleReject = async (student) => {
        const targetStudent = student || studentToApprove;
        if (!targetStudent) return;
        try {
            if (targetStudent.type === 'ielts') await rejectIeltsStudent(targetStudent.original_id).unwrap();
            else await rejectStudent(targetStudent.id).unwrap();
            showToast("Student rejected.", "success");
            setIsApprovalModalOpen(false);
            refetch(); refetchIelts();
        } catch (error) { showToast("Failed to reject.", "error"); }
    };

    const handleDeleteClick = (id) => {
        const student = mergedStudents.find(s => s.id === id);
        if (student) {
            setStudentToDelete(student);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        try {
            if (studentToDelete.type === 'ielts') {
                await deleteIeltsStudent(studentToDelete.original_id).unwrap();
            } else {
                await deleteStudent(studentToDelete.id).unwrap();
            }
            showToast("Deleted successfully!", "success");
            refetch();
            refetchIelts();
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        } catch (error) {
            showToast("Failed to delete.", "error");
        }
    };

    const handleAssignSubprogramSubmit = async (e) => {
        e.preventDefault();
        if (!assigningStudent) return;
        const formData = new FormData(e.target);
        const subprogramName = formData.get("subprogram_name");
        try {
            await updateStudent({ id: assigningStudent.id, chosen_subprogram: subprogramName || null }).unwrap();
            showToast("Assigned successfully!", "success");
            refetch(); setIsAssignSubprogramModalOpen(false);
        } catch (error) { showToast("Failed to assign.", "error"); }
    };

    const handleAssignClassSubmit = async (e) => {
        e.preventDefault();
        if (!assigningStudent) return;
        try {
            if (assigningStudent.type === 'ielts') await updateIeltsStudent({ id: assigningStudent.original_id, class_id: selectedClassId || null }).unwrap();
            else await updateStudent({ id: assigningStudent.id, class_id: selectedClassId || null }).unwrap();
            showToast("Class assigned!", "success");
            refetch(); refetchIelts(); setIsAssignClassModalOpen(false);
        } catch (error) { showToast("Failed to assign.", "error"); }
    };

    const handleBulkActions = async () => {
        if (selectedStudents.length === 0) {
            showToast("No students selected", "error");
            return;
        }

        if (!bulkActions.changeStatus && !bulkActions.delete) {
            showToast("Please select at least one action", "error");
            return;
        }

        try {
            const studentsToProcess = mergedStudents.filter(s => selectedStudents.includes(s.id));

            // Handle status change
            if (bulkActions.changeStatus) {
                for (const student of studentsToProcess) {
                    if (student.type === 'ielts') {
                        await updateIeltsStudent({ id: student.original_id, status: bulkStatusValue }).unwrap();
                    } else {
                        await updateStudent({ id: student.id, approval_status: bulkStatusValue }).unwrap();
                    }
                }
            }

            // Handle delete
            if (bulkActions.delete) {
                for (const student of studentsToProcess) {
                    if (student.type === 'ielts') {
                        await deleteIeltsStudent(student.original_id).unwrap();
                    } else {
                        await deleteStudent(student.id).unwrap();
                    }
                }
            }

            showToast(`Bulk actions completed successfully!`, "success");
            setIsBulkActionsModalOpen(false);
            setBulkActions({ changeStatus: false, delete: false });
            setSelectedStudents([]);
            refetch();
            refetchIelts();
        } catch (error) {
            showToast("Failed to complete bulk actions", "error");
        }
    };

    const columns = [
        { key: "student_id", label: "Student ID", render: (_, row) => <span className="font-bold">{row.student_id || "N/A"}</span> },
        { key: "full_name", label: "Full Name" },

        { key: "email", label: "Email" },
        { key: "phone", label: "Phone", render: (val) => val || "N/A" },
        { key: "age", label: "Age", render: (val) => val || "N/A" },
        { key: "sex", label: "Sex" },
        { key: "date_of_birth", label: "Date Of Birth", render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-gray-400">-</span> },
        { key: "place_of_birth", label: "Place Of Birth", render: (val) => val || <span className="text-gray-400">-</span> },
        {
            key: "address",
            label: "Address",
            render: (_, row) => {
                const city = row.residency_city;
                const country = row.residency_country;
                if (city && country) return <span className="text-black font-semibold text-xs">{`${city}, ${country}`}</span>;
                return <span className="text-black font-semibold text-xs">{city || country || '-'}</span>;
            }
        },
        { key: "chosen_program", label: "Program" },
        {
            key: "approval_status", label: "Status",
            render: (val, row) => {
                const s = val || 'pending';
                return s === 'pending' ? (
                    <button onClick={() => { setStudentToApprove(row); setIsApprovalModalOpen(true); }} className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</button>
                ) : (
                    <span className={`px-3 py-1 text-xs rounded-full ${s === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s}</span>
                );
            }
        },
        {
            key: "actions", label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-green-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    {/* <button onClick={() => { setAssigningStudent(row); setSelectedClassId(row.class_id || ""); setIsAssignClassModalOpen(true); }} className="text-indigo-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></button> */}
                    <button onClick={() => handleDeleteClick(row.id)} className="text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            ),
        },
    ];

    if (isLoading) return <main className="flex-1 flex items-center justify-center p-20 p-6"><p>Loading students...</p></main>;

    return (
        <>
            <main className="flex-1 min-w-0 flex flex-col bg-gray-50 px-4 sm:px-8 py-6 ">
                <DataTable
                    title="Student Management"
                    columns={columns}
                    data={filteredStudents}
                    onAddClick={handleAddStudent}
                    customActions={
                        <>
                            <button
                                onClick={() => setIsBulkActionsModalOpen(true)}
                                disabled={selectedStudents.length === 0}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${selectedStudents.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
                                    }`}
                                title={selectedStudents.length === 0 ? "Select students to perform actions" : "Perform bulk actions"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Actions
                            </button>
                            <button
                                onClick={handleAddStudent}
                                className="bg-[#010080] hover:bg-[#010080]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add
                            </button>
                        </>
                    }
                    showAddButton={false}
                    customHeaderLeft={
                        <div className="flex gap-3 flex-wrap items-center">
                            {/* Selection Counter Box */}
                            {selectedStudents.length > 0 && (
                                <div className="px-3 py-1.5 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold text-[13px]">{selectedStudents.length} selected</span>
                                    <button
                                        onClick={() => setSelectedStudents([])}
                                        className="ml-1 text-white hover:text-gray-200 transition-colors"
                                        title="Clear selection"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Program Filter */}
                            <div className="relative group min-w-[180px]">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <select
                                    value={selectedProgram}
                                    onChange={(e) => setSelectedProgram(e.target.value)}
                                    className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer"
                                >
                                    <option value="">All Programs</option>
                                    {programs.map(prog => (
                                        <option key={prog.id} value={prog.title}>{prog.title}</option>
                                    ))}
                                    <option value="IELTS">IELTS</option>
                                    <option value="TOEFL">TOEFL</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="relative group min-w-[180px]">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#010080] transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full pl-10 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-[13px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
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
                        </div>
                    }
                    selectable={true}
                    selectedItems={selectedStudents}
                    onSelectionChange={setSelectedStudents}
                />
            </main>

            <StudentForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingStudent={editingStudent}
                formData={formData}
                handleInputChange={handleInputChange}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                isDark={isDark}
                programs={programs}
                paymentPackages={paymentPackages}
                cities={cities}
                showParentInfo={showParentInfo}
                parentCities={parentCities}
                viewingPayments={viewingPayments}
                isUpdating={isUpdating}
                isUpdatingIelts={isUpdatingIelts}
                isCreatingIelts={isCreatingIelts}
            />
            <StudentViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} viewingStudent={viewingStudent} viewingPayments={viewingPayments} isDark={isDark} />
            <StudentApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => { setIsApprovalModalOpen(false); setStudentToApprove(null); setSelectedClassId(""); }}
                student={studentToApprove}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={isApproving}
                isRejecting={isRejecting}
                isDark={isDark}
                classes={classes}
                selectedClassId={selectedClassId}
                setSelectedClassId={setSelectedClassId}
            />
            <AssignClassModal isOpen={isAssignClassModalOpen} onClose={() => setIsAssignClassModalOpen(false)} assigningStudent={assigningStudent} selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId} handleSubmit={handleAssignClassSubmit} isUpdating={isUpdating} isUpdatingIelts={isUpdatingIelts} classes={classes} isDark={isDark} />
            <AssignSubprogramModal isOpen={isAssignSubprogramModalOpen} onClose={() => setIsAssignSubprogramModalOpen(false)} assigningStudent={assigningStudent} programs={programs} allSubprograms={allSubprograms} handleSubmit={handleAssignSubprogramSubmit} isUpdating={isUpdating} isDark={isDark} />
            {isSubprogramsModalOpen && <SubprogramsModal program={selectedProgramForSubprograms} onClose={() => setIsSubprogramsModalOpen(false)} isDark={isDark} />}

            {/* Bulk Actions Modal */}
            {isBulkActionsModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsBulkActionsModalOpen(false)}
                    />
                    <div className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Bulk Actions
                            </h3>
                            <button
                                onClick={() => setIsBulkActionsModalOpen(false)}
                                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className={`p-4 rounded-lg mb-6 text-sm border ${isDark ? 'bg-gray-700/30 border-gray-600 text-gray-300' : 'bg-blue-50/50 border-blue-100 text-blue-800'}`}>
                                <p className="font-semibold">{selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected</p>
                                <p className="text-xs mt-1 opacity-80">Select the actions you want to perform on the selected students</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Change Status Action */}
                                <div className={`p-4 rounded-lg border-2 transition-all ${bulkActions.changeStatus ? (isDark ? 'border-[#010080] bg-[#010080]/10' : 'border-[#010080] bg-[#010080]/5') : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={bulkActions.changeStatus}
                                            onChange={(e) => setBulkActions({ changeStatus: e.target.checked, delete: false })}
                                            className="mt-1 w-5 h-5 text-[#010080] border-gray-300 rounded focus:ring-[#010080]"
                                        />
                                        <div className="flex-1">
                                            <div className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Status</div>
                                            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update the approval status for selected students</p>
                                            {bulkActions.changeStatus && (
                                                <select
                                                    value={bulkStatusValue}
                                                    onChange={(e) => setBulkStatusValue(e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#010080] outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                                >
                                                    <option value="approved">Approved</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Delete Action */}
                                <div className={`p-4 rounded-lg border-2 transition-all ${bulkActions.delete ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : (isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300')}`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={bulkActions.delete}
                                            onChange={(e) => setBulkActions({ changeStatus: false, delete: e.target.checked })}
                                            className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-red-600 mb-1">Delete Students</div>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>⚠️ This action cannot be undone</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsBulkActionsModalOpen(false);
                                        setBulkActions({ changeStatus: false, delete: false });
                                    }}
                                    className={`flex-1 px-4 py-2.5 rounded-lg border font-semibold transition-all active:scale-95 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkActions}
                                    disabled={!bulkActions.changeStatus && !bulkActions.delete}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-lg ${!bulkActions.changeStatus && !bulkActions.delete
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[#010080]/20'
                                        }`}
                                >
                                    Apply Actions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Student"
                message={`Are you sure you want to delete ${studentToDelete?.full_name}? This action cannot be undone.`}
                confirmText="Delete"
                isDanger={true}
                isLoading={isDeleting || isDeletingIelts}
            />
        </>
    );
}
