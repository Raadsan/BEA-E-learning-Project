"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    coursename: "",
    description: "",
    program: "",
    teachername: "",
    status: "Active",
  });

  const [courses, setCourses] = useState([
    {
      id: 1,
      coursename: "Level 1 - Beginner",
      description: "Introduction to English basics",
      program: "General English",
      teachername: "Ahmed Hassan",
      status: "Active"
    },
    {
      id: 2,
      coursename: "Level 2 - Elementary",
      description: "Building foundational English skills",
      program: "General English",
      teachername: "Ahmed Hassan",
      status: "Active"
    },
    {
      id: 3,
      coursename: "IELTS Preparation Course",
      description: "Comprehensive IELTS exam preparation",
      program: "IELTS/TOEFL",
      teachername: "Amina Mohamed",
      status: "Active"
    },
  ]);

  const handleAddCourse = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      coursename: "",
      description: "",
      program: "",
      teachername: "",
      status: "Active",
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
    
    const newCourse = {
      id: courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1,
      ...formData,
    };
    setCourses([...courses, newCourse]);
    handleCloseModal();
    
    return false;
  };

  const handleEdit = (course) => {
    console.log("Edit course:", course);
  };

  const columns = [
    {
      key: "coursename",
      label: "Course Name",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "program",
      label: "Program",
    },
    {
      key: "teachername",
      label: "Teacher Name",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.status === "Active" 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminHeader />
      
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <DataTable
            title="Course Management"
            columns={columns}
            data={courses}
            onAddClick={handleAddCourse}
            showAddButton={true}
          />
        </div>
      </main>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {/* Light backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20"
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Course</h2>
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
              <div>
                <label htmlFor="coursename" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="coursename"
                  name="coursename"
                  value={formData.coursename}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter course description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Program</option>
                  <option value="General English">General English</option>
                  <option value="IELTS/TOEFL">IELTS/TOEFL</option>
                  <option value="Academic Writing">Academic Writing</option>
                  <option value="ESP Programs">ESP Programs</option>
                </select>
              </div>

              <div>
                <label htmlFor="teachername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  id="teachername"
                  name="teachername"
                  value={formData.teachername}
                  onChange={handleInputChange}
                  placeholder="Enter teacher name"
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
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

