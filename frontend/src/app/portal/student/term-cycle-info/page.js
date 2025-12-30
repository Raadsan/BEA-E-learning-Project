"use client";

import { useDarkMode } from "@/context/ThemeContext";
import DataTable from "@/components/DataTable";

export default function TermCycleInfoPage() {
  const { isDark } = useDarkMode();

  const termData = [
    { serial: "BEA-01", start: "31/01/2026", end: "25/02/2026", holiday: "" },
    { serial: "BEA-02", start: "07/03/2026", end: "08/04/2026", holiday: "19th to the 20th of March 2026 — Eid-Alfitr Celebration" },
    { serial: "BEA-03", start: "18/04/2026", end: "06/05/2026", holiday: "26th of May 2026 Eid-Al-adha Celebration" },
    { serial: "BEA-04", start: "16/05/2026", end: "10/06/2026", holiday: "" },
    { serial: "BEA-05", start: "20/06/2026", end: "18/07/2026", holiday: "26th of June to the 1st of July 2026 — Somali Independence Week" },
    { serial: "BEA-06", start: "25/07/2026", end: "12/08/2026", holiday: "" },
    { serial: "BEA-07", start: "22/08/2026", end: "16/09/2026", holiday: "" },
    { serial: "BEA-08", start: "23/09/2026", end: "21/10/2026", holiday: "" },
    { serial: "BEA-09", start: "31/10/2026", end: "25/11/2026", holiday: "21st of November 2026 — Somali Teachers' Day" },
    { serial: "BEA-10", start: "5/12/2026", end: "30/12/2026", holiday: "" },
  ];

  const columns = [
    {
      label: "Term Serial Number",
      key: "serial",
      render: (row) => <span className="font-bold text-[#010080] dark:text-blue-400">{row.serial}</span>
    },
    {
      label: "Start Date",
      key: "start",
      render: (row) => (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {row.start}
        </div>
      )
    },
    {
      label: "End Date",
      key: "end",
      render: (row) => (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {row.end}
        </div>
      )
    },
    {
      label: "Holidays",
      key: "holiday",
      render: (row) => row.holiday || <span className="text-gray-400">-</span>
    },
  ];

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Term Cycle Information
          </h1>
          <p className={`text-lg font-medium opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Academic calendar and important dates for the 2026 academic year.
          </p>
        </div>

        {/* Use the shared DataTable component for consistent design */}
        <DataTable
          title="2026 Exam Cycles"
          columns={columns}
          data={termData}
          showAddButton={false}
        />

        {/* Footer Note */}
        <div className={`mt-6 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          * Specific holiday dates may vary based on lunar sightings for Eid celebrations.
        </div>
      </div>
    </div>
  );
}
