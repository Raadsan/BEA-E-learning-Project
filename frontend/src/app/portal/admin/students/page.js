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
        full_name: "", email: "", phone: "", age: "", sex: "Male", residency_country: "",
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

    // Merge and format students
    const mergedStudents = [
        ...(backendStudents || []).map(s => ({
            ...s, id: s.student_id, type: 'regular',
            approval_status: (s.approval_status || 'pending').toLowerCase()
        })),
        ...ieltsStudents.map(s => ({
            ...s, full_name: `${s.first_name} ${s.last_name}`, chosen_program: s.exam_type,
            approval_status: (s.status || 'pending').toLowerCase(), original_id: s.id,
            id: s.id, type: 'ielts', class_name: s.class_id ? classes.find(c => c.id == s.class_id)?.class_name : null
        }))
    ];

    // Event Handlers
    const handleAddStudent = () => {
        setEditingStudent(null);
        setFormData({
            full_name: "", email: "", phone: "", age: "", sex: "Male", residency_country: "",
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
        });
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            full_name: student.full_name || "", email: student.email || "", phone: student.phone || "",
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
            submitData.age = submitData.age ? parseInt(submitData.age) : null;
            if (!submitData.password || submitData.password.trim() === "") delete submitData.password;
            if (submitData.chosen_subprogram === "") submitData.chosen_subprogram = null;

            if (editingStudent) {
                const updateId = editingStudent.type === 'ielts' ? editingStudent.original_id : editingStudent.student_id;
                if (editingStudent.type === 'ielts') await updateIeltsStudent({ id: updateId, ...submitData }).unwrap();
                else await updateStudent({ id: updateId, ...submitData }).unwrap();
                showToast("Student updated successfully!", "success");
            } else {
                if (!submitData.password) { showToast("Password is required", "error"); return; }

                const isIeltsToefl = submitData.chosen_program && (submitData.chosen_program.toUpperCase().includes("IELTS") || submitData.chosen_program.toUpperCase().includes("TOEFL"));

                if (isIeltsToefl) {
                    // Map full_name to first/last name for IELTS model
                    const names = submitData.full_name.trim().split(" ");
                    const first_name = names[0];
                    const last_name = names.slice(1).join(" ") || "Student";

                    await createIeltsStudent({
                        ...submitData,
                        first_name,
                        last_name,
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
            if (targetStudent.type === 'ielts') await updateIeltsStudent({ id: targetStudent.original_id, status: 'approved' }).unwrap();
            else await approveStudent(targetStudent.id).unwrap();
            showToast("Student approved!", "success");
            setIsApprovalModalOpen(false);
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

    const handleDelete = async (id) => {
        const studentToDelete = mergedStudents.find(s => s.id === id);
        if (!studentToDelete) return;
        if (window.confirm("Are you sure?")) {
            try {
                if (studentToDelete.type === 'ielts') await deleteIeltsStudent(studentToDelete.original_id).unwrap();
                else await deleteStudent(id).unwrap();
                showToast("Deleted successfully!", "success");
                refetch(); refetchIelts();
            } catch (error) { showToast("Failed to delete.", "error"); }
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

    const columns = [
        { key: "student_id", label: "Student ID", render: (row) => <span className="font-bold">{row.student_id || "N/A"}</span> },
        { key: "full_name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone", render: (row) => row.phone || "N/A" },
        { key: "age", label: "Age", render: (row) => row.age || "N/A" },
        { key: "sex", label: "Sex" },
        { key: "chosen_program", label: "Program" },
        {
            key: "approval_status", label: "Status",
            render: (row) => {
                const s = row.approval_status || 'pending';
                return s === 'pending' ? (
                    <button onClick={() => { setStudentToApprove(row); setIsApprovalModalOpen(true); }} className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</button>
                ) : (
                    <span className={`px-3 py-1 text-xs rounded-full ${s === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s}</span>
                );
            }
        },
        {
            key: "actions", label: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => handleView(row)} className="text-green-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                    <button onClick={() => handleEdit(row)} className="text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    {/* <button onClick={() => { setAssigningStudent(row); setSelectedClassId(row.class_id || ""); setIsAssignClassModalOpen(true); }} className="text-indigo-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></button> */}
                    <button onClick={() => handleDelete(row.id)} className="text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            ),
        },
    ];

    if (isLoading) return <main className="flex-1 flex items-center justify-center p-20 p-6"><p>Loading students...</p></main>;

    return (
        <>
            <main className="flex-1 min-w-0 flex flex-col bg-gray-50 px-4 sm:px-8 py-6 ">
                <DataTable title="Student Management" columns={columns} data={mergedStudents} onAddClick={handleAddStudent} showAddButton={true} />
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
            <StudentApprovalModal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} student={studentToApprove} onApprove={handleApprove} onReject={handleReject} isApproving={isApproving} isRejecting={isRejecting} isDark={isDark} />
            <AssignClassModal isOpen={isAssignClassModalOpen} onClose={() => setIsAssignClassModalOpen(false)} assigningStudent={assigningStudent} selectedClassId={selectedClassId} setSelectedClassId={setSelectedClassId} handleSubmit={handleAssignClassSubmit} isUpdating={isUpdating} isUpdatingIelts={isUpdatingIelts} classes={classes} isDark={isDark} />
            <AssignSubprogramModal isOpen={isAssignSubprogramModalOpen} onClose={() => setIsAssignSubprogramModalOpen(false)} assigningStudent={assigningStudent} programs={programs} allSubprograms={allSubprograms} handleSubmit={handleAssignSubprogramSubmit} isUpdating={isUpdating} isDark={isDark} />
            {isSubprogramsModalOpen && <SubprogramsModal program={selectedProgramForSubprograms} onClose={() => setIsSubprogramsModalOpen(false)} isDark={isDark} />}
        </>
    );
}
