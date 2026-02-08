"use client";


import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useGetTeachersQuery } from "@/redux/api/teacherApi";
import { useGetClassesQuery } from "@/redux/api/classApi";


import UpcomingEventsList from "@/components/UpcomingEventsList";
import WeeklyAttendanceChart from "@/components/WeeklyAttendanceChart";
import SexDistributionChart from "@/components/GenderDistributionChart";
import LearningHoursChart from "@/components/LearningHoursChart";
import AssignmentCompletionChart from "@/components/AssignmentCompletionChart";
import PerformanceClustersChart from "@/components/PerformanceClustersChart";
import StudentLocationsMap from "@/components/StudentLocationsMap";
import ProgramPieChart from "@/components/ProgramPieChart";
import StarStudentsList from "@/components/StarStudentsList";

export default function AdminDashboard() {
  // Fetch data from APIs
  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery();
  const { data: teachersData, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();

  // Extract counts
  const totalPrograms = Array.isArray(programsData) ? programsData.length : 0;

  const studentsArray = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);
  const totalStudents = studentsArray.length;

  const teachersArray = Array.isArray(teachersData) ? teachersData : [];
  const totalTeachers = teachersArray.length;

  const classesArray = Array.isArray(classesData) ? classesData : [];
  const totalClasses = classesArray.length;

  // New Admin metrics

  // Calculate Growth Logic
  const calculateGrowth = (data) => {
    if (!data || !Array.isArray(data)) return { value: 0, trend: 'neutral', sign: '+' };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const createdThisMonth = data.filter(item => {
      if (!item.created_at) return false;
      const date = new Date(item.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const totalNow = data.length;
    // Assuming un-dated items are old/existing, so last month total is current - new
    const totalLastMonth = totalNow - createdThisMonth;

    if (totalLastMonth === 0) {
      return {
        value: totalNow > 0 ? 100 : 0,
        trend: 'up',
        sign: '+'
      };
    }

    const growth = ((createdThisMonth / totalLastMonth) * 100);
    return {
      value: Math.abs(growth).toFixed(1),
      trend: growth >= 0 ? 'up' : 'down',
      sign: growth >= 0 ? '+' : '-'
    };
  };

  const studentGrowth = calculateGrowth(studentsArray);
  const teacherGrowth = calculateGrowth(teachersArray);
  const programGrowth = calculateGrowth(programsData);
  const classGrowth = calculateGrowth(classesArray);

  // Calculate Program Stats (Students per Program)
  let programStats = (programsData || []).map(program => {
    // Count students directly in this program
    // OR linked via class -> program
    const count = studentsArray.reduce((acc, student) => {
      let inProgram = false;

      // Check direct program link
      if (student.chosen_program == program.id) {
        inProgram = true;
      }
      // fallback to class link if direct link missing (safeguard)
      else if (student.class_id) {
        const cls = classesArray.find(c => c.id === student.class_id);
        // cls.program_id is now available from backend
        if (cls && cls.program_id == program.id) {
          inProgram = true;
        }
      }

      return inProgram ? acc + 1 : acc;
    }, 0);

    return { name: program.title, value: 1, studentCount: count };
  });

  // Calculate total students just for reference if needed, though we use studentCount now
  const totalStudentsInPrograms = programStats.reduce((acc, item) => acc + item.studentCount, 0);



  return (
    <>
      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-2">
        <div className="w-full px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white  mb-2">Dashboard Overview</h1>

          {/* Summary Cards with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-full">
            {/* Total Students Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Students</p>
                  <h3 className="text-5xl font-black text-gray-900 mb-2">
                    {studentsLoading ? "..." : totalStudents}
                  </h3>
                  <div className={`flex items-center gap-1 text-sm font-medium ${studentGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {studentGrowth.trend === 'up' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span>{studentGrowth.sign}{studentGrowth.value}% last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Teachers Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Teachers</p>
                  <h3 className="text-5xl font-black text-gray-900 mb-2">
                    {teachersLoading ? "..." : totalTeachers}
                  </h3>
                  <div className={`flex items-center gap-1 text-sm font-medium ${teacherGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {teacherGrowth.trend === 'up' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span>{teacherGrowth.sign}{teacherGrowth.value}% last month</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Programs Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Programs</p>
                  <h3 className="text-5xl font-black text-gray-900 mb-2">
                    {programsLoading ? "..." : totalPrograms}
                  </h3>
                  <div className={`flex items-center gap-1 text-sm font-medium ${programGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {programGrowth.trend === 'up' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span>{programGrowth.sign}{programGrowth.value}% last month</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Classes Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Classes</p>
                  <h3 className="text-5xl font-black text-gray-900 mb-2">
                    {classesLoading ? "..." : totalClasses}
                  </h3>
                  <div className={`flex items-center gap-1 text-sm font-medium ${classGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {classGrowth.trend === 'up' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span>{classGrowth.sign}{classGrowth.value}% last month</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Total Attendance Chart */}
            <WeeklyAttendanceChart programs={programsData} classes={classesData} />

            {/* Sex Distribution */}
            <SexDistributionChart programs={programsData} classes={classesData} />
          </div>

          {/* Learning Hours and Assignment Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LearningHoursChart programs={programsData} classes={classesData} />
            <AssignmentCompletionChart programs={programsData} classes={classesData} students={studentsArray} />
          </div>

          {/* Performance Clusters and Student Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceClustersChart programs={programsData} classes={classesData} />
            <StudentLocationsMap programs={programsData} students={studentsData} classes={classesData} />
          </div>

          {/* Programs Pie Chart and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Programs</h2>
              </div>
              <div className="h-96 flex-1">
                <ProgramPieChart
                  data={programStats}
                  unit="Programs"
                />
              </div>
            </div>

            <UpcomingEventsList />
          </div>

          {/* Star Students - Full Width */}
          <div className="mb-6">
            <StarStudentsList programs={programsData} classes={classesData} />
          </div>
        </div>
      </div>
    </>
  );
}
