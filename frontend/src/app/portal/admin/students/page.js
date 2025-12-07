"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    sex: "",
    country: "",
    city: "",
    program: "",
    subprogram: "",
    status: "Active",
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      fullname: "Hassan Abdullahi",
      email: "hassan.abdullahi@student.bea.academy",
      phone: "+252 61 111 2222",
      sex: "Male",
      country: "Somalia",
      city: "Mogadishu",
      program: "General English",
      subprogram: "B1",
      status: "Active"
    },
    {
      id: 2,
      fullname: "Aisha Mohamed",
      email: "aisha.mohamed@student.bea.academy",
      phone: "+252 61 222 3333",
      sex: "Female",
      country: "Somalia",
      city: "Hargeisa",
      program: "IELTS/TOEFL",
      subprogram: "IELTS Academic",
      status: "Active"
    },
    {
      id: 3,
      fullname: "Omar Yusuf",
      email: "omar.yusuf@student.bea.academy",
      phone: "+252 61 333 4444",
      sex: "Male",
      country: "Somalia",
      city: "Bosaso",
      program: "Academic Writing",
      subprogram: "Essay Writing",
      status: "Inactive"
    },
    {
      id: 4,
      fullname: "Fatima Hassan",
      email: "fatima.hassan@student.bea.academy",
      phone: "+252 61 444 5555",
      sex: "Female",
      country: "Somalia",
      city: "Kismayo",
      program: "ESP Programs",
      subprogram: "Business English",
      status: "Active"
    },
  ]);

  const handleAddStudent = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      fullname: "",
      email: "",
      phone: "",
      sex: "",
      country: "",
      city: "",
      program: "",
      subprogram: "",
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
    
    const newStudent = {
      id: students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
      ...formData,
    };
    setStudents([...students, newStudent]);
    handleCloseModal();
    
    return false;
  };

  const handleEdit = (student) => {
    console.log("Edit student:", student);
  };

  const columns = [
    {
      key: "fullname",
      label: "Full Name",
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
      key: "sex",
      label: "Sex",
    },
    {
      key: "country",
      label: "Country",
    },
    {
      key: "city",
      label: "City",
    },
    {
      key: "program",
      label: "Program",
    },
    {
      key: "subprogram",
      label: "Subprogram",
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
            title="Students"
            columns={columns}
            data={students}
            showAddButton={false}
          />
        </div>
      </main>

      {/* Add Student Modal */}
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
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Add New Student</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    <option value="General English">General English</option>
                    <option value="IELTS/TOEFL">IELTS/TOEFL</option>
                    <option value="Academic Writing">Academic Writing</option>
                    <option value="ESP Programs">ESP Programs</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subprogram" className="block text-sm font-medium text-gray-700 mb-1">
                    Subprogram
                  </label>
                  <input
                    type="text"
                    id="subprogram"
                    name="subprogram"
                    value={formData.subprogram}
                    onChange={handleInputChange}
                    placeholder="A1, A1+, B1, B2, C1, C2 (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter subprogram(s) separated by commas (e.g., A1, B1, B2)
                  </p>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

