"use client";

import Link from "next/link";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export default function AssignmentsPage() {
  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="w-full pt-4 pb-6 px-6 sm:px-10">
          <StudentPageHeader
            title="Assignments & Assessments"
            description="Access placement tests, proficiency tests, and other academic assessments."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placement Test Card */}
            <Link href="/portal/student/placement-test" className="block">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Placement Test</h3>
                    <p className="text-sm text-gray-600">English proficiency assessment</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">Take the placement test to determine your English level and get course recommendations.</p>
              </div>
            </Link>

            {/* Other assignment cards can be added here */}
          </div>
        </div>
      </main>
    </>
  );
}

