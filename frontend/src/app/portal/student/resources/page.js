"use client";

import { useMemo } from "react";
import { useGetStudentMaterialsQuery } from "@/redux/api/materialApi";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";
import Loader from "@/components/Loader";
import DataTable from "@/components/DataTable";

export default function ResourcesPage() {
  const { isDark } = useDarkMode();
  const { data: resources = [], isLoading: materialsLoading } = useGetStudentMaterialsQuery();
  const { data: authData, isLoading: userLoading } = useGetCurrentUserQuery();
  const currentUser = authData?.user;

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {row.title}
        </span>
      ),
      width: "280px"
    },
    {
      key: "type",
      label: "Type",
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.type === 'Drive'
            ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
          }`}>
          {row.type}
        </span>
      ),
      width: "120px"
    },
    {
      key: "subprogram_name",
      label: "Level / Subprogram",
      render: (row) => (
        <span className={isDark ? 'text-gray-300' : 'text-black'}>
          {row.subprogram_name || "General"}
        </span>
      ),
      width: "220px"
    },
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <span className={isDark ? 'text-gray-300' : 'text-black'}>
          {row.subject || "-"}
        </span>
      ),
      width: "150px"
    },
    {
      key: "url",
      label: "Access Link",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-1.5 rounded text-sm transition-colors ${row.type === 'Drive'
              ? isDark
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              : isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-[#010080] hover:bg-blue-700 text-white'
            }`}
        >
          {row.type === 'Drive' ? 'Open Drive' : 'Access'}
        </a>
      ),
      width: "160px"
    }
  ];

  if (materialsLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-[#010080]"}`}>
            Learning Resources
          </h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-black"}`}>
            Explore academic materials specifically curated for your subprogram.
          </p>
        </div>

        {/* Table Section */}
        <DataTable
          title={`${currentUser?.subprogram_name || "Assigned"} Resources`}
          columns={columns}
          data={resources}
          showAddButton={false}
        />

        {resources.length === 0 && (
          <div className={`mt-8 p-12 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-[#010080]"}`}>
              Awaiting Your Materials
            </h3>
            <p className={`text-base ${isDark ? "text-gray-400" : "text-black"}`}>
              Your teachers are currently preparing your learning resources. As soon as materials for your subprogram are uploaded, they will appear in the table above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
