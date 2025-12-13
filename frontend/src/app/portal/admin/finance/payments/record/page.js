"use client";

import AdminHeader from "@/components/AdminHeader";

export default function RecordPaymentPage() {
  return (
    <>
      <AdminHeader />
      <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors">
        <div className="w-full px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Record Payment</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">Record new payment - Coming soon</p>
          </div>
        </div>
      </main>
    </>
  );
}

