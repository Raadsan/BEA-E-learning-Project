"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from "@/redux/api/classApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useGetShiftsQuery } from "@/redux/api/shiftApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";

// Extracted Components
import ClassForm from "./components/ClassForm";
import AssignTeacherModal from "./components/AssignTeacherModal";
import ClassConfirmationModal from "./components/ClassConfirmationModal";

export default function ClassesPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red"
  });

  const { data: backendClasses, isLoading, isError, error } = useGetClassesQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: allSubprograms = [] } = useGetSubprogramsQuery();
  const { data: shifts = [] } = useGetShiftsQuery();

  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  const classes = backendClasses || [];

  const [formData, setFormData] = useState({
    class_name: "", description: "", program_id: "", subprogram_id: "", teacher_id: "", shift_id: "",
  });

  const filteredSubprograms = useMemo(() => {
    if (!formData.program_id) return [];
    return allSubprograms.filter(sub => sub.program_id === parseInt(formData.program_id));
  }, [allSubprograms, formData.program_id]);

  const handleAddClass = useCallback(() => {
    setEditingClass(null);
    setFormData({ class_name: "", description: "", program_id: "", subprogram_id: "", teacher_id: "", shift_id: "" });
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((classItem) => {
    setEditingClass(classItem);
    setFormData({
      class_name: classItem.class_name || "",
      description: classItem.description || "",
      program_id: classItem.program_id || "",
      subprogram_id: classItem.subprogram_id || "",
      teacher_id: classItem.teacher_id || "",
      shift_id: classItem.shift_id || "",
    });
    setIsModalOpen(true);
  }, []);

  const handleAssign = useCallback((classItem) => {
    setSelectedClassForAssign(classItem);
    setIsAssignModalOpen(true);
  }, []);

  const handleView = useCallback((classItem) => {
    router.push(`/portal/admin/classes/${classItem.id}/students`);
  }, [router]);

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setSelectedClassForAssign(null);
  }, []);

  const handleDelete = useCallback((id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Class", message: "Are you sure? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteClass(id).unwrap();
          showToast("Class deleted successfully!", "success");
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast(error?.data?.error || "Failed to delete class.", "error");
        }
      },
      isLoading: false, confirmButtonColor: "red"
    });
  }, [deleteClass, showToast]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false); setEditingClass(null);
    setFormData({ class_name: "", description: "", program_id: "", subprogram_id: "", teacher_id: "", shift_id: "" });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        class_name: formData.class_name, description: formData.description,
        subprogram_id: formData.subprogram_id ? parseInt(formData.subprogram_id) : null,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        shift_id: formData.shift_id ? parseInt(formData.shift_id) : null,
      };
      if (editingClass) {
        await updateClass({ id: editingClass.id, ...submitData }).unwrap();
        showToast("Class updated successfully!", "success");
      } else {
        await createClass(submitData).unwrap();
        showToast("Class created successfully!", "success");
      }
      handleCloseModal();
    } catch (error) {
      showToast(error?.data?.error || "Failed to save class.", "error");
    }
  }, [formData, editingClass, updateClass, createClass, showToast, handleCloseModal]);

  const handleAssignTeacher = useCallback(async (teacherId) => {
    try {
      await updateClass({ id: selectedClassForAssign.id, teacher_id: teacherId }).unwrap();
      showToast("Teacher assigned successfully!", "success");
      handleCloseAssignModal();
    } catch (error) {
      showToast(error?.data?.error || "Failed to assign.", "error");
    }
  }, [selectedClassForAssign, updateClass, showToast, handleCloseAssignModal]);

  const columns = useMemo(() => [
    { key: "class_name", label: "Class Name" },
    { key: "description", label: "Description", render: (row) => row.description || "No description" },
    { key: "subprogram_name", label: "Subprogram", render: (row) => row.subprogram_name || "Not assigned" },
    { key: "program_name", label: "Program", render: (row) => row.program_name || "Not assigned" },
    { key: "teacher_name", label: "Assigned Teacher", render: (row) => row.teacher_name || "No assigned teacher" },
    {
      key: "shift_info", label: "Shift & Session", render: (row) => (
        row.shift_name ? (
          <div className="flex flex-col">
            <span className="font-semibold text-blue-600">{row.shift_name}</span>
            <span className="text-xs text-gray-500">{row.shift_session}</span>
          </div>
        ) : "Not assigned"
      )
    },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="View Students"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
          <button onClick={() => handleAssign(row)} className="text-purple-600 p-1 hover:bg-purple-50 rounded" title="Assign Teacher"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></button>
          <button onClick={() => handleEdit(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Delete" disabled={isDeleting}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      ),
    },
  ], [isDeleting]);

  if (isLoading) return <><AdminHeader /><main className="flex-1 mt-20 pt-12 text-center text-gray-600">Loading classes...</main></>;
  if (isError) return <><AdminHeader /><main className="flex-1 mt-20 pt-12 text-center text-red-600">Error: {error?.data?.error || "Unknown error"}</main></>;

  return (
    <>
      <AdminHeader />
      <main className="flex-1 mt-20 bg-gray-50"><div className="w-full px-8 py-6"><DataTable title="Class Management" columns={columns} data={classes} onAddClick={handleAddClass} showAddButton={true} /></div></main>
      <ClassForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingClass={editingClass}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isDark={isDark}
        isCreating={isCreating}
        isUpdating={isUpdating}
        programs={programs}
        filteredSubprograms={filteredSubprograms}
        teachers={teachers}
        shifts={shifts}
      />
      <AssignTeacherModal isOpen={isAssignModalOpen} onClose={handleCloseAssignModal} selectedClass={selectedClassForAssign} teachers={teachers} onAssign={handleAssignTeacher} isUpdating={isUpdating} isDark={isDark} />
      <ClassConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} confirmButtonColor={confirmationModal.confirmButtonColor} isDark={isDark} />
    </>
  );
}
