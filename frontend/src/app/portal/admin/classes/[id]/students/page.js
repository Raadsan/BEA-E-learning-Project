"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetClassesQuery } from "@/redux/api/classApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery } from "@/redux/api/subprogramApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassStudentsPage() {
  const { isDark } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const classId = params.id;

  const { data: allStudents, isLoading: studentsLoading, isError: studentsError } = useGetStudentsQuery();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();

  // Find the current class
  const currentClass = classes?.find(cls => cls.id == classId);

  // Filter students in this class
  const classStudents = useMemo(() => {
    if (!allStudents || !classId) return [];
    return allStudents.filter(student => student.class_id == classId);
  }, [allStudents, classId]);

  // Get subprogram name for display
  const getSubprogramName = (subprogramId) => {
    if (!subprogramId) return "N/A";
    const subprogram = subprograms.find(sp => sp.id == subprogramId);
    return subprogram ? subprogram.subprogram_name : "N/A";
  };

  // Get program name for display
  const getProgramName = (programId) => {
    if (!programId) return "N/A";
    const program = programs.find(p => p.id == programId);
    return program ? program.title : "N/A";
  };

  // Custom table columns for students
  const columns = [
    {
      key: "full_name",
      label: "Student Name",
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
      key: "gender",
      label: "Gender",
      render: (row) => row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : "N/A",
    },
    {
      key: "age",
      label: "Age",
    },
    {
      key: "chosen_program",
      label: "Program",
      render: (row) => getProgramName(row.chosen_program_id || row.chosen_program),
    },
    {
      key: "chosen_subprogram",
      label: "Subprogram",
      render: (row) => getSubprogramName(row.chosen_subprogram),
    },
    {
      key: "approval_status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
          row.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.approval_status ? row.approval_status.charAt(0).toUpperCase() + row.approval_status.slice(1) : 'Pending'}
        </span>
      ),
    },
  ];

  if (classesLoading || studentsLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading class students...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!currentClass) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-20">
          <div className="w-full px-8 py-6">
            <div className="text-center py-12">
              <p className="text-red-600">Class not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
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
          {/* Class Info Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Students in {currentClass.class_name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentClass.subprogram_name} • {currentClass.program_name}
                  {currentClass.type && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      currentClass.type === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                      currentClass.type === 'afternoon' ? 'bg-orange-100 text-orange-800' :
                      currentClass.type === 'night' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentClass.type.charAt(0).toUpperCase() + currentClass.type.slice(1)} Shift
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Classes
              </button>
            </div>

            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{classStudents.length}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-600">
                  {classStudents.filter(s => s.approval_status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved Students</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-yellow-600">
                  {classStudents.filter(s => s.approval_status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Students</div>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <DataTable
            title={`Students in ${currentClass.class_name}`}
            columns={columns}
            data={classStudents}
            showAddButton={false}
          />
        </div>
      </main>
    </>
  );
}