"use client";

import AdminHeader from "@/components/AdminHeader";
import { useGetAllPaymentsQuery } from "@/redux/api/paymentApi";
import { useGetAllPlacementResultsQuery } from "@/redux/api/placementTestApi";
import DataTable from "@/components/DataTable";
import UpcomingEventsList from "@/components/UpcomingEventsList";

export default function AdminDashboard() {
  // Fetch data from APIs
  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentsQuery();
  const { data: teachersData, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();
  const { data: paymentsData, isLoading: paymentsLoading } = useGetAllPaymentsQuery();
  const { data: resultsData, isLoading: resultsLoading } = useGetAllPlacementResultsQuery();

  // Extract counts
  const totalPrograms = Array.isArray(programsData) ? programsData.length : 0;

  const studentsArray = studentsData?.students || (Array.isArray(studentsData) ? studentsData : []);
  const totalStudents = studentsArray.length;

  const teachersArray = Array.isArray(teachersData) ? teachersData : [];
  const totalTeachers = teachersArray.length;

  const classesArray = Array.isArray(classesData) ? classesData : [];
  const totalClasses = classesArray.length;

  const paymentsArray = Array.isArray(paymentsData) ? paymentsData : [];
  const resultsArray = Array.isArray(resultsData) ? resultsData : [];

  // New Admin metrics
  const pendingStudents = studentsArray.filter(s => s.approval_status !== 'approved');
  const totalPending = pendingStudents.length;

  const unpaidStudents = studentsArray.filter(s => {
    const hasPaid = paymentsArray.some(p => p.student_id === s.student_id && (p.status === 'paid' || p.status === 'completed'));
    return !hasPaid;
  });
  const totalUnpaid = unpaidStudents.length;

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
      <AdminHeader />

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-20">
        <div className="w-full px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white  mb-2">Dashboard Overview</h1>

          {/* Summary Cards with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-full">
            {/* Total Students Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Students</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
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

            {/* Pending Students Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Pending Students</p>
                  <h3 className="text-3xl font-bold text-orange-600 mb-2">
                    {studentsLoading ? "..." : totalPending}
                  </h3>
                  <p className="text-xs text-gray-400">Waiting for approval</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.223 0 2.39.218 3.476.618M12 12a3 3 0 100-6 3 3 0 000 6zm6.203 1.951A10.005 10.005 0 0112 21c-4.478 0-8.268-2.943-9.542-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Unpaid Students Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Unpaid Admissions</p>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">
                    {studentsLoading ? "..." : totalUnpaid}
                  </h3>
                  <p className="text-xs text-gray-400">Payment not confirmed</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Total Attendance Chart */}
            <WeeklyAttendanceChart programs={programsData} classes={classesData} />

            {/* Gender Distribution */}
            <GenderDistributionChart programs={programsData} classes={classesData} />
          </div>

          {/* Learning Hours and Assignment Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LearningHoursChart programs={programsData} classes={classesData} />
            <AssignmentCompletionChart programs={programsData} classes={classesData} />
          </div>

          {/* Performance Clusters and Student Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceClustersChart programs={programsData} classes={classesData} />
            <StudentLocationsMap programs={programsData} students={studentsData} />
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
          {/* Recent Registrations & Progress Tracking */}
          <div className="mb-8 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Recent Registrations</h2>
                <p className="text-sm text-gray-500 mt-1">Status of new students, payments and placement tests</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                columns={[
                  {
                    key: "full_name",
                    label: "Student Name",
                    render: (row) => (
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{row.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{row.student_id}</span>
                      </div>
                    )
                  },
                  {
                    key: "chosen_program",
                    label: "Program",
                    render: (row) => <span className="text-sm font-medium text-gray-600">{row.chosen_program || "N/A"}</span>
                  },
                  {
                    key: "payment_status",
                    label: "Payment",
                    render: (row) => {
                      const payment = paymentsArray.find(p => p.student_id === row.student_id);
                      const isPaid = payment && (payment.status === 'paid' || payment.status === 'completed');
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      );
                    }
                  },
                  {
                    key: "placement_test",
                    label: "Placement Test",
                    render: (row) => {
                      const result = resultsArray.find(r => r.student_id === row.student_id);
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${result ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {result ? `Completed (${result.total_score} pts)` : 'Not Started'}
                        </span>
                      );
                    }
                  },
                  {
                    key: "approval",
                    label: "Approval",
                    render: (row) => (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.approval_status === 'approved' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                        {row.approval_status}
                      </span>
                    )
                  },
                  {
                    key: "created_at",
                    label: "Date",
                    render: (row) => <span className="text-xs text-gray-500">{new Date(row.created_at).toLocaleDateString()}</span>
                  }
                ]}
                data={studentsArray.slice(0, 10)} // Show latest 10
                searchPlaceholder="Filter registrations..."
              />
            </div>
          </div>

          {/* Star Students - Full Width */}
          <div className="mb-6">
            <StarStudentsList programs={programsData} classes={classesData} />
          </div>
        </div>
      </main>
    </>
  );
}
