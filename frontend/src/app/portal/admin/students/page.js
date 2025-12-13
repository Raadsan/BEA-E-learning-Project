"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation } from "@/redux/api/studentApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery, useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function StudentsPage() {
  const { isDark } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubprogramsModalOpen, setIsSubprogramsModalOpen] = useState(false);
  const [selectedProgramForSubprograms, setSelectedProgramForSubprograms] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const { data: backendStudents, isLoading, isError, error } = useGetStudentsQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const students = backendStudents || [];

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    residency_country: "",
    residency_city: "",
    chosen_program: "",
    chosen_subprogram: "",
    password: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "",
    parent_res_county: "",
    parent_res_city: "",
  });

  // Get selected program ID (after formData is initialized)
  const selectedProgram = programs.find(p => p.title === formData.chosen_program);
  const selectedProgramId = selectedProgram?.id;
  
  // Get subprograms for selected program
  const { data: programSubprograms = [] } = useGetSubprogramsByProgramIdQuery(selectedProgramId, {
    skip: !selectedProgramId
  });

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      residency_country: "",
      residency_city: "",
      chosen_program: "",
      chosen_subprogram: "",
      password: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relation: "",
      parent_res_county: "",
      parent_res_city: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      age: student.age || "",
      residency_country: student.residency_country || "",
      residency_city: student.residency_city || "",
      chosen_program: student.chosen_program || "",
      chosen_subprogram: student.chosen_subprogram || "",
      password: "", // Don't pre-fill password
      parent_name: student.parent_name || "",
      parent_email: student.parent_email || "",
      parent_phone: student.parent_phone || "",
      parent_relation: student.parent_relation || "",
      parent_res_county: student.parent_res_county || "",
      parent_res_city: student.parent_res_city || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id).unwrap();
      } catch (error) {
        console.error("Failed to delete student:", error);
        alert("Failed to delete student. Please try again.");
      }
    }
  };

  const handleViewProgramSubprograms = (programName) => {
    // Find the program by name to get its ID
    const program = programs.find(p => p.title === programName);
    if (program) {
      setSelectedProgramForSubprograms({ name: programName, id: program.id });
      setIsSubprogramsModalOpen(true);
    } else {
      alert(`Program "${programName}" not found`);
    }
  };

  const handleCloseSubprogramsModal = () => {
    setIsSubprogramsModalOpen(false);
    setSelectedProgramForSubprograms(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      age: "",
      residency_country: "",
      residency_city: "",
      chosen_program: "",
      chosen_subprogram: "",
      password: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relation: "",
      parent_res_county: "",
      parent_res_city: "",
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show parent information if age is less than 18
  const showParentInfo = formData.age && parseInt(formData.age) < 18;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };

      // Only include password if it's provided (for updates)
      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      if (editingStudent) {
        await updateStudent({ id: editingStudent.id, ...submitData }).unwrap();
      } else {
        // Password is required for new students
        if (!submitData.password || submitData.password.trim() === "") {
          alert("Password is required for new students");
          return;
        }
        await createStudent(submitData).unwrap();
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save student:", error);
      alert(error?.data?.error || "Failed to save student. Please try again.");
    }

    return false;
  };

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => row.phone || "N/A",
    },
    {
      key: "age",
      label: "Age",
      render: (row) => row.age || "N/A",
    },
    {
      key: "residency_country",
      label: "Country",
      render: (row) => row.residency_country || "N/A",
    },
    {
      key: "residency_city",
      label: "City",
      render: (row) => row.residency_city || "N/A",
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => {
        if (!row.chosen_program || row.chosen_program === "Not assigned") {
          return <span className="text-gray-500">Not assigned</span>;
        }
        return (
          <button
            onClick={() => handleViewProgramSubprograms(row.chosen_program)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium transition-colors"
            title="Click to view subprograms"
          >
            {row.chosen_program}
          </button>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
            disabled={isDeleting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-6 py-6">
            <div className="text-center py-12">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading students...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-6 py-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">Error loading students: {error?.data?.error || "Unknown error"}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <DataTable
              title="Student Management"
              columns={columns}
              data={students}
              onAddClick={handleAddStudent}
              showAddButton={true}
            />
        </div>
      </main>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />
          
          <div 
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
              isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
          >
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student Information Section */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50/50 border-blue-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_country" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Residency Country
                    </label>
                    <input
                      type="text"
                      id="residency_country"
                      name="residency_country"
                      value={formData.residency_country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="residency_city" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Residency City
                    </label>
                    <input
                      type="text"
                      id="residency_city"
                      name="residency_city"
                      value={formData.residency_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="chosen_program" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Chosen Program
                    </label>
                    <select
                      id="chosen_program"
                      name="chosen_program"
                      value={formData.chosen_program}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.title}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProgramId && programSubprograms.length > 0 && (
                    <div>
                      <label htmlFor="chosen_subprogram" className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Chosen Subprogram
                      </label>
                      <select
                        id="chosen_subprogram"
                        name="chosen_subprogram"
                        value={formData.chosen_subprogram}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Subprogram</option>
                        {programSubprograms.map((subprogram) => (
                          <option key={subprogram.id} value={subprogram.subprogram_name}>
                            {subprogram.subprogram_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!editingStudent && (
                    <div>
                      <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingStudent}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  )}

                  {editingStudent && (
                    <div>
                      <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        New Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Information Section - Only show if age < 18 */}
              {showParentInfo && (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-purple-50/50 border-purple-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    Parent/Guardian Information <span className="text-sm font-normal text-gray-500">(Required for students under 18)</span>
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent_name" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Name
                    </label>
                    <input
                      type="text"
                      id="parent_name"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="parent_email" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Email
                    </label>
                    <input
                      type="email"
                      id="parent_email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="parent_phone" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Phone
                    </label>
                    <input
                      type="tel"
                      id="parent_phone"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="parent_relation" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Relation
                    </label>
                    <input
                      type="text"
                      id="parent_relation"
                      name="parent_relation"
                      value={formData.parent_relation}
                      onChange={handleInputChange}
                      placeholder="e.g., Father, Mother, Guardian"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="parent_res_county" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Residency Country
                    </label>
                    <input
                      type="text"
                      id="parent_res_county"
                      name="parent_res_county"
                      value={formData.parent_res_county}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="parent_res_city" className={`block text-sm font-medium mb-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Parent Residency City
                    </label>
                    <input
                      type="text"
                      id="parent_res_city"
                      name="parent_res_city"
                      value={formData.parent_res_city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Subprograms Modal */}
      {isSubprogramsModalOpen && selectedProgramForSubprograms && (
        <SubprogramsModal 
          program={selectedProgramForSubprograms}
          onClose={handleCloseSubprogramsModal}
          isDark={isDark}
        />
      )}
    </>
  );
}

// Subprograms Modal Component
function SubprogramsModal({ program, onClose, isDark }) {
  const { data: subprograms, isLoading, isError } = useGetSubprogramsByProgramIdQuery(program.id);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      <div 
        className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 ${
          isDark ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-gray-300'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto', backdropFilter: 'blur(2px)' }}
      >
        <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Subprograms for {program.name}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading subprograms...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Error loading subprograms</p>
            </div>
          ) : !subprograms || subprograms.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No subprograms found for this program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subprograms.map((subprogram) => (
                <div 
                  key={subprogram.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`font-semibold text-lg mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {subprogram.subprogram_name}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {subprogram.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      subprogram.status === 'active'
                        ? isDark 
                          ? 'bg-green-900/30 text-green-300 border border-green-700'
                          : 'bg-green-100 text-green-800'
                        : isDark
                          ? 'bg-gray-700 text-gray-400 border border-gray-600'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {subprogram.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
