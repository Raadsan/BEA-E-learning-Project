"use client";

import { useState } from "react";

import DataTable from "@/components/DataTable";
import {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useBulkActionTeachersMutation
} from "@/lib/api/teacherApi";
import { useGetClassesQuery } from "@/lib/api/classApi";
import { useDarkMode } from "@/context/ThemeContext";
import { useToast } from "@/components/Toast";
import { Country, City } from "country-state-city";

// Extracted Components
import TeacherForm from "@/components/admin/teachers/TeacherForm";
import TeacherViewModal from "@/components/admin/teachers/TeacherViewModal";
import TeacherConfirmationModal from "@/components/admin/teachers/TeacherConfirmationModal";

export default function TeachersPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false, title: "", message: "", onConfirm: null, isLoading: false
  });

  const { data: backendTeachers, isLoading, isError, error } = useGetTeachersQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  const [bulkActionTeachers, { isLoading: isBulkLoading }] = useBulkActionTeachersMutation();

  const teachers = backendTeachers || [];

  // Selection & Filter States
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [bulkModal, setBulkModal] = useState({ isOpen: false, type: "", confirmText: "" });

  const getAssignedClasses = (teacherId) => {
    return classes.filter(c => c.teacher_id === teacherId);
  };

  // Filter & Sort Logic
  const filteredTeachers = teachers.filter(teacher => {
    const matchesStatus = selectedStatus ? teacher.status === selectedStatus : true;
    const matchesClass = selectedClass ? getAssignedClasses(teacher.id).some(c => c.id === parseInt(selectedClass)) : true;
    return matchesStatus && matchesClass;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (sortBy === "name_asc") {
      return (a.full_name || "").localeCompare(b.full_name || "");
    }
    if (sortBy === "name_desc") {
      return (b.full_name || "").localeCompare(a.full_name || "");
    }
    if (sortBy === "newest") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0; // default order
  });

  // Show All Button Action
  const handleShowAll = () => {
    setSelectedStatus("");
    setSelectedClass("");
    setSortBy("");
    setSelectedTeachers([]);
  };

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", country: "", city: "", specialization: "",
    highest_qualification: "", years_experience: "", bio: "", portfolio_link: "",
    skills: "", hire_date: "", password: "", confirmPassword: "",
  });

  const cities = (() => {
    if (!formData.country) return [];
    const country = Country.getAllCountries().find(c => c.name === formData.country);
    return country ? City.getCitiesOfCountry(country.isoCode) : [];
  })();

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFormData({
      full_name: "", email: "", phone: "", country: "", city: "", specialization: "",
      highest_qualification: "", years_experience: "", bio: "", portfolio_link: "",
      skills: "", hire_date: "", password: "", confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      full_name: teacher.full_name || "", email: teacher.email || "", phone: teacher.phone || "",
      country: teacher.country || "", city: teacher.city || "", specialization: teacher.specialization || "",
      highest_qualification: teacher.highest_qualification || "", years_experience: teacher.years_experience || "",
      bio: teacher.bio || "", portfolio_link: teacher.portfolio_link || "", skills: teacher.skills || "",
      hire_date: teacher.hire_date ? new Date(teacher.hire_date).toISOString().split('T')[0] : "",
      password: "", confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active';
    setConfirmationModal({
      isOpen: true, title: "Confirm Status Change", message: `Do you want to change status of ${teacher.full_name} to ${newStatus}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await updateTeacher({ id: teacher.id, status: newStatus }).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast(error?.data?.error || "Failed to update status.", "error");
        }
      },
      isLoading: false
    });
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Teacher", message: "Are you sure? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteTeacher(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          showToast("Failed to delete teacher.", "error");
        }
      },
      isLoading: false
    });
  };

  const handleView = (teacher) => { setViewingTeacher(teacher); setIsViewModalOpen(true); };
  const handleCloseViewModal = () => { setIsViewModalOpen(false); setViewingTeacher(null); };

  const handleCloseModal = () => {
    setIsModalOpen(false); setEditingTeacher(null);
    setFormData({
      full_name: "", email: "", phone: "", country: "", city: "", specialization: "",
      highest_qualification: "", years_experience: "", bio: "", portfolio_link: "",
      skills: "", hire_date: "", password: "", confirmPassword: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        showToast("Passwords do not match", "error"); return;
      }

      if (formData.password && editingTeacher) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(formData.password)) {
          showToast("Password must be at least 6 characters and include uppercase, lowercase, number, and symbol", "error");
          return;
        }
      }
      const submitData: any = { ...formData }; delete submitData.confirmPassword;
      if (submitData.hire_date) submitData.hire_date = new Date(submitData.hire_date).toISOString().split('T')[0];
      if (submitData.years_experience) submitData.years_experience = parseInt(submitData.years_experience);
      if (!submitData.password || submitData.password.trim() === "") delete submitData.password;

      if (editingTeacher) {
        await updateTeacher({ id: editingTeacher.id, ...submitData }).unwrap();
        showToast("Teacher updated successfully", "success");
      } else {
        if (!submitData.password) { showToast("Password is required", "error"); return; }
        await createTeacher(submitData).unwrap();
        showToast("Teacher created successfully", "success");
      }
      handleCloseModal();
    } catch (error) { showToast(error?.data?.error || "Failed to save teacher.", "error"); }
  };

  const openBulkModal = (type) => {
    setBulkModal({ isOpen: true, type, confirmText: "" });
  };

  const handleBulkAction = async () => {
    if (bulkModal.confirmText !== "CONFIRM") {
      showToast("Please type CONFIRM to proceed", "error");
      return;
    }

    try {
      await bulkActionTeachers({
        teacherIds: selectedTeachers,
        action: bulkModal.type
      }).unwrap();

      showToast(`Selected teachers successfully ${bulkModal.type}d!`, "success");
      setSelectedTeachers([]);
      setBulkModal({ isOpen: false, type: "", confirmText: "" });
    } catch (error) {
      showToast(error?.data?.error || "Failed to execute bulk action", "error");
    }
  };

  // Bulk Action Buttons (Clean borderless style with count, matching add button size)
  const customActions = selectedTeachers.length > 0 ? (
    <>
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-1.5 self-center">
        {selectedTeachers.length} selected
      </span>
      <button
        onClick={() => openBulkModal("activate")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
      >
        Activate
      </button>
      <button
        onClick={() => openBulkModal("deactivate")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
      >
        Deactivate
      </button>
      <button
        onClick={() => openBulkModal("delete")}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
      >
        Delete
      </button>
    </>
  ) : null;

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={selectedTeachers.length === sortedTeachers.length && sortedTeachers.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTeachers(sortedTeachers.map(t => t.id));
            } else {
              setSelectedTeachers([]);
            }
          }}
          className="w-4 h-4 rounded text-[#010080] focus:ring-[#010080] border-gray-300 transition-colors cursor-pointer"
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedTeachers.includes(row.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTeachers(prev => [...prev, row.id]);
            } else {
              setSelectedTeachers(prev => prev.filter(id => id !== row.id));
            }
          }}
          className="w-4 h-4 rounded text-[#010080] focus:ring-[#010080] border-gray-300 transition-colors cursor-pointer"
        />
      )
    },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "country", label: "Country" },
    { key: "hire_date", label: "Hired Date", render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { key: "years_experience", label: "Years Experience" },
    {
      key: "status",
      label: "Status",
      render: (val, row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            val === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {val?.charAt(0).toUpperCase() + val?.slice(1)}
        </button>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="View">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button onClick={() => handleEdit(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Edit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Delete" disabled={isDeleting}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <main className="flex-1 p-6 text-center text-gray-600">Loading teachers...</main>;
  if (isError) return <main className="flex-1 p-6 text-center text-red-600">Error: {(error as any)?.data?.error || "Unknown error"}</main>;

  return (
    <>
      <main className="flex-1 bg-gray-50 dark:bg-[#03002e] transition-colors min-h-screen">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Teachers"
            columns={columns}
            data={sortedTeachers}
            onAddClick={handleAddTeacher}
            showAddButton={true}
            customActions={customActions}
            filters={
              <div className="flex flex-wrap gap-3 items-center">
                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#010080] ${
                    isDark ? 'bg-slate-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="">Filter by Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Class Dropdown */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#010080] ${
                    isDark ? 'bg-slate-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="">Filter by Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>

                {/* Sorting Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#010080] ${
                    isDark ? 'bg-slate-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="">Sort By</option>
                  <option value="name_asc">Name: A–Z</option>
                  <option value="name_desc">Name: Z–A</option>
                  <option value="newest">Newest to Oldest</option>
                </select>

                {/* Show All Button */}
                <button
                  onClick={handleShowAll}
                  className={`px-4 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-gray-700 text-white hover:bg-slate-700'
                      : 'bg-white border-gray-300 text-[#010080] hover:bg-gray-50'
                  }`}
                >
                  Show All
                </button>
              </div>
            }
          />
        </div>
      </main>
      
      {/* Bulk Action Confirmation Modal */}
      {bulkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900'}`}>
            <h3 className="text-lg font-bold mb-2 capitalize">
              Bulk {bulkModal.type} Teachers
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to {bulkModal.type} the {selectedTeachers.length} selected teachers? 
              This action cannot be undone. To confirm, please type <strong className="text-red-500 font-bold">CONFIRM</strong> in the box below.
            </p>
            <input
              type="text"
              placeholder="Type CONFIRM here..."
              value={bulkModal.confirmText}
              onChange={(e) => setBulkModal(prev => ({ ...prev, confirmText: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-lg border mb-6 focus:outline-none focus:ring-2 focus:ring-[#010080] ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkModal({ isOpen: false, type: "", confirmText: "" })}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={bulkModal.confirmText !== "CONFIRM" || isBulkLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors bg-[#010080] hover:bg-[#010080]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkLoading ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TeacherForm isOpen={isModalOpen} onClose={handleCloseModal} editingTeacher={editingTeacher} formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} cities={cities} />
      <TeacherViewModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} teacher={viewingTeacher} isDark={isDark} getAssignedClasses={getAssignedClasses} />
      <TeacherConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} isDark={isDark} />
    </>
  );
}
