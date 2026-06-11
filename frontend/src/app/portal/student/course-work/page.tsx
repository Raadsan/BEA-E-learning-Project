"use client";

import { useState } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetAssignmentsQuery } from "@/lib/api/assignmentApi";
import { useGetCurrentUserQuery } from "@/lib/api/authApi";
import { useToast } from "@/components/Toast";
import SubmissionModal from "@/components/student/course-work/SubmissionModal";
import SubmissionDetailsModal from "@/components/student/course-work/SubmissionDetailsModal";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export default function StudentCourseWorkPage() {
  const { isDark } = useDarkMode();
  const { data: user } = useGetCurrentUserQuery();

  // Fetch assignments for the student's class
  const { data: assignments, isLoading } = useGetAssignmentsQuery({
    class_id: user?.class_id,
    type: 'course_work'
  }, { skip: !user?.class_id });

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenSubmission = (assignment) => {
    setSelectedAssignment(assignment);

    // If already submitted or graded, open details view
    if (assignment.submission_status === 'submitted' || assignment.submission_status === 'graded') {
      setIsDetailsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmissionSuccess = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-4 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <StudentPageHeader
        title="My Course Work"
        description="View and submit your assignments."
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(() => {
          const now = new Date();
          const visibleAssignments = assignments?.filter(a => {
            if (a.status !== 'active') return false;
            if (a.start_date) {
              const start = new Date(a.start_date);
              if (now < start) return false;
            }
            return true;
          }) || [];

          if (visibleAssignments.length === 0) {
            return (
              <div className="col-span-full py-20 text-center opacity-50">
                <p className="text-xl">No course work assigned yet.</p>
              </div>
            );
          }

          return visibleAssignments.map((assignment) => {
            const isSubmitted = assignment.submission_status === 'submitted';
            const isGraded = assignment.submission_status === 'graded';
            const isClosed = assignment.due_date && now > new Date(assignment.due_date);

            const handleBtnClick = () => {
              if (isClosed && !isSubmitted && !isGraded) {
                return;
              }
              handleOpenSubmission(assignment);
            };

            return (
              <div
                key={assignment.id}
                className={`flex flex-col rounded-lg p-5 border transition-all ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
              >
                {/* Header: Status Only */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wide opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {assignment.unit || "General"}
                  </span>
                  {isGraded ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      Graded
                    </span>
                  ) : isSubmitted ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                      Submitted
                    </span>
                  ) : isClosed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                      Closed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      Pending
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold mb-1.5 line-clamp-1">{assignment.title}</h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {assignment.description || "No description provided."}
                </p>

                {/* Meta Details */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">

                  {/* Marks & Date Row */}
                  <div className={`flex items-center justify-between text-xs font-medium opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {/* Marks */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      <span>{assignment.total_points || 0} Marks</span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No Due Date'}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleBtnClick}
                    disabled={isClosed && !isSubmitted && !isGraded}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${isGraded || isSubmitted
                      ? (isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700')
                      : isClosed
                        ? 'bg-gray-400 cursor-not-allowed text-white opacity-70'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {isGraded
                      ? `View Grade (${assignment.score}/${assignment.total_points})`
                      : isSubmitted
                        ? 'View Submission'
                        : isClosed
                          ? 'Deadline Expired'
                          : 'Submit Work'}
                  </button>
                </div>
              </div>
            );
          });
        })()}</div>

      {/* Submission Modal (For submitting) */}
      {isModalOpen && selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {/* Submission Details Modal (For viewing) */}
      {isDetailsModalOpen && selectedAssignment && (
        <SubmissionDetailsModal
          assignment={selectedAssignment}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

    </div>
  );
}
