"use client";

import AdminHeader from "@/components/AdminHeader";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";

export default function AdminDashboard() {
  // Fetch data from APIs
  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery();

  // Extract counts
  // Programs API returns array directly
  const totalPrograms = Array.isArray(programsData) ? programsData.length : 0;
  
  // Students API returns { success: true, students: [...] }
  const studentsArray = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);
  const totalStudents = studentsArray.length;
  const activeStudents = studentsArray.filter(
    (student) => student.status === "Active" || !student.status
  ).length;
  
  // For teachers, we'll use a placeholder since there's no API yet
  const totalTeachers = 0; // TODO: Add teacher API when available

  return (
    <>
      <AdminHeader />

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Students Card */}
              <div className="rounded-lg shadow-sm p-6 transition-colors" style={{ backgroundColor: '#f95150' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-white">
                      {studentsLoading ? "..." : totalStudents}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Teachers Card */}
              <div className="rounded-lg shadow-sm p-6 transition-colors" style={{ backgroundColor: '#010080' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">Total Teachers</p>
                    <p className="text-3xl font-bold text-white">{totalTeachers}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Programs Card */}
              <div className="rounded-lg shadow-sm p-6 text-white transition-colors" style={{ backgroundColor: '#4b47a4' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">Total Programs</p>
                    <p className="text-3xl font-bold">
                      {programsLoading ? "..." : totalPrograms}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section - Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Statistics Weekly Attendance</h2>
                <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  Chart placeholder - Weekly Attendance
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Statistics Course Completion Rate</h2>
                  <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  Chart placeholder - Course Completion Rate
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}

