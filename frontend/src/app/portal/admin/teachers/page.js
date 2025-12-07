"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { createTeacher, validateTeacher, getTeacherFullName, getTeacherDisplayName } from "@/models/teacherModel";

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  
  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery();
  const programs = Array.isArray(programsData) ? programsData : [];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    subject: "",
    specialization: "",
    status: "Active",
    joinDate: "",
    portfolio: "",
    bio: "",
    qualifications: "",
    experience_years: 0,
  });

  const [assignmentData, setAssignmentData] = useState({
    selectedCourses: [],
  });

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      first_name: "Ahmed",
      last_name: "Hassan",
      email: "ahmed.hassan@bea.academy",
      phone: "+252 61 123 4567",
      subject: "General English",
      specialization: "ESL Teaching",
      status: "Active",
      joinDate: "2023-01-15",
      portfolio: "https://portfolio.example.com/ahmed",
      bio: "Experienced ESL teacher with 10+ years of experience",
      qualifications: "MA in TESOL, CELTA Certified",
      experience_years: 10,
      assignedCourses: [1, 2],
      created_at: "2023-01-15T00:00:00Z",
      updated_at: "2023-01-15T00:00:00Z"
    },
    {
      id: 2,
      first_name: "Amina",
      last_name: "Mohamed",
      email: "amina.mohamed@bea.academy",
      phone: "+252 61 234 5678",
      subject: "IELTS/TOEFL",
      specialization: "Exam Preparation",
      status: "Active",
      joinDate: "2023-02-20",
      portfolio: "https://portfolio.example.com/amina",
      bio: "IELTS and TOEFL specialist",
      qualifications: "MA in Applied Linguistics, IELTS Examiner",
      experience_years: 8,
      assignedCourses: [2],
      created_at: "2023-02-20T00:00:00Z",
      updated_at: "2023-02-20T00:00:00Z"
    },
    {
      id: 3,
      first_name: "Omar",
      last_name: "Abdullahi",
      email: "omar.abdullahi@bea.academy",
      phone: "+252 61 345 6789",
      subject: "Academic Writing",
      specialization: "Academic English",
      status: "Active",
      joinDate: "2023-03-10",
      portfolio: "https://portfolio.example.com/omar",
      bio: "Academic writing expert",
      qualifications: "PhD in English Literature, TESOL Certified",
      experience_years: 12,
      assignedCourses: [3],
      created_at: "2023-03-10T00:00:00Z",
      updated_at: "2023-03-10T00:00:00Z"
    },
    {
      id: 4,
      first_name: "Khadija",
      last_name: "Ali",
      email: "khadija.ali@bea.academy",
      phone: "+252 61 456 7890",
      subject: "ESP Programs",
      specialization: "Business English",
      status: "Active",
      joinDate: "2023-04-05",
      portfolio: "https://portfolio.example.com/khadija",
      bio: "ESP and Business English specialist",
      qualifications: "MBA, TEFL Certified",
      experience_years: 7,
      assignedCourses: [],
      created_at: "2023-04-05T00:00:00Z",
      updated_at: "2023-04-05T00:00:00Z"
    },
  ]);

  // Don't prevent body scroll - let content stay visible
  // useEffect(() => {
  //   if (isModalOpen) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "unset";
  //   }
  //   return () => {
  //     document.body.style.overflow = "unset";
  //   };
  // }, [isModalOpen]);

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFormData(createTeacher());
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData(createTeacher());
    setFormErrors([]);
  };

  const handleOpenAssignModal = (teacher) => {
    setSelectedTeacherForAssign(teacher);
    const currentAssigned = teacher.assignedCourses || [];
    setAssignmentData({
      selectedCourses: currentAssigned,
    });
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedTeacherForAssign(null);
    setAssignmentData({
      selectedCourses: [],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate form data
    const validation = validateTeacher(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return false;
    }
    
    setFormErrors([]);
    
    if (editingTeacher) {
      // Update existing teacher
      setTeachers(teachers.map(t => 
        t.id === editingTeacher.id 
          ? { 
              ...t, 
              ...formData, 
              joinDate: formData.joinDate || t.joinDate,
              updated_at: new Date().toISOString()
            }
          : t
      ));
    } else {
      // Add new teacher
      const newTeacher = createTeacher({
        id: teachers.length > 0 ? Math.max(...teachers.map((t) => t.id)) + 1 : 1,
        ...formData,
        joinDate: formData.joinDate || new Date().toISOString().split("T")[0],
        assignedCourses: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setTeachers([...teachers, newTeacher]);
    }
    
    handleCloseModal();
    return false;
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      first_name: teacher.first_name || teacher.name?.split(' ')[0] || "",
      last_name: teacher.last_name || teacher.name?.split(' ').slice(1).join(' ') || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      specialization: teacher.specialization || "",
      status: teacher.status || "Active",
      joinDate: teacher.joinDate || "",
      portfolio: teacher.portfolio || "",
      bio: teacher.bio || "",
      qualifications: teacher.qualifications || "",
      experience_years: teacher.experience_years || 0,
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleAssignCourses = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedTeacherForAssign) {
      setTeachers(teachers.map(t => 
        t.id === selectedTeacherForAssign.id 
          ? { ...t, assignedCourses: assignmentData.selectedCourses }
          : t
      ));
    }
    
    handleCloseAssignModal();
    return false;
  };

  const handleCourseToggle = (courseId) => {
    setAssignmentData(prev => {
      const current = prev.selectedCourses || [];
      const isSelected = current.includes(courseId);
      return {
        selectedCourses: isSelected
          ? current.filter(id => id !== courseId)
          : [...current, courseId]
      };
    });
  };


  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => getTeacherDisplayName(row),
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "subject",
      label: "Subject",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {row.status}
        </span>
      ),
    },
    {
      key: "joinDate",
      label: "Join Date",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      render: (row) => (
        row.portfolio ? (
          <a
            href={row.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          >
            View Portfolio
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: "assignedCourses",
      label: "Assigned Courses",
      render: (row) => {
        const assigned = row.assignedCourses || [];
        if (assigned.length === 0) {
          return <span className="text-gray-400">No courses assigned</span>;
        }
        const courseNames = assigned.map(courseId => {
          const course = programs.find(p => p.id === courseId);
          return course ? course.title : `Course ${courseId}`;
        });
        return (
          <div className="flex flex-wrap gap-1">
            {courseNames.map((name, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleOpenAssignModal(row)}
            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
            title="Assign Courses"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <DataTable
            title="Teachers"
            columns={columns}
            data={teachers}
            onAddClick={handleAddTeacher}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Light backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-50"
            onClick={handleBackdropClick}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Modal content */}
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 transition-colors"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Please fix the following errors:</h3>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {formErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Subject</option>
                    <option value="General English">General English</option>
                    <option value="IELTS/TOEFL">IELTS/TOEFL</option>
                    <option value="Academic Writing">Academic Writing</option>
                    <option value="ESP Programs">ESP Programs</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., ESL Teaching, Exam Preparation"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Join Date
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief biography about the teacher"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qualifications
                </label>
                <input
                  type="text"
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="e.g., MA in TESOL, CELTA Certified"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience_years"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://portfolio.example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  {editingTeacher ? "Update Teacher" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Courses Modal */}
      {isAssignModalOpen && selectedTeacherForAssign && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Light backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-50"
            onClick={handleCloseAssignModal}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Modal content */}
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 transition-colors"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Assign Courses</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Assign courses to {getTeacherDisplayName(selectedTeacherForAssign)}
                </p>
              </div>
              <button
                onClick={handleCloseAssignModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAssignCourses} className="p-6 space-y-4">
              {programsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading courses...</div>
              ) : programs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No courses available</div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Courses <span className="text-red-500">*</span>
                  </label>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {programs.map((program) => {
                      const isSelected = assignmentData.selectedCourses.includes(program.id);
                      return (
                        <label
                          key={program.id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCourseToggle(program.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {program.title}
                            </div>
                            {program.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {program.description}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                >
                  Assign Courses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
