"use client";

import StudentHeader from "../../../StudentHeader";
import { useRouter } from "next/navigation";

export default function PlacementTestResultsPage() {
  const router = useRouter();

  return (
    <>
      <StudentHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="w-full px-8 pt-6 pb-6 flex items-center justify-center min-h-full">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Submitted Successfully!</h1>
              <p className="text-gray-600 mb-8">
                Your placement test has been submitted. Results will be available within 24 hours.
              </p>

              <button
                onClick={() => router.push("/portal/student")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

