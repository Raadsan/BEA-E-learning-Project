"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
const DEFAULT_MIN_COLUMN_WIDTH = "120px";

const DataTable = ({ title, columns, data = [], onAddClick, showAddButton = true, customActions, emptyMessage }) => {
  const tableRef = useRef(null);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  // Detect if table overflows horizontally
  useLayoutEffect(() => {
    const el = tableRef.current;
    if (el) {
      const checkOverflow = () => {
        setHasHorizontalScroll(el.scrollWidth > el.clientWidth);
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }
  }, []);

  const { isDark } = useDarkMode();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (Array.isArray(data)) {
      const filtered = data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData([]); // Fallback if data is undefined or not an array
    }
  }, [search, data]);

  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  return (
    <div className="p-4 bg-white dark:bg-[#1a2035] text-gray-900 dark:text-white rounded-xl shadow-md w-full max-w-full min-w-0">
      {/* Table Header Section - Fixed at top of card */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="header">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {customActions ? (
            <div className="flex gap-2">
              {customActions}
            </div>
          ) : (
            showAddButton && onAddClick && (
              <button
                onClick={onAddClick}
                className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )
          )}
        </div>

        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <div className="flex items-center">
            <label className="text-sm text-gray-600 dark:text-gray-300">Show&nbsp;</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
            >
              {[5, 10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1"> entries</span>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-1 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#010080]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700">
        <div ref={tableRef} className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm" style={{ minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead className={`${isDark ? 'bg-white text-gray-900' : 'bg-[#010080] text-white'} sticky top-0 z-30`}>
              <tr>
                {columns.map((col, i) => {
                  const isLast = i === columns.length - 1;
                  return (
                    <th
                      key={col.key || i}
                      className={`px-5 py-4 uppercase text-xs font-medium tracking-wide ${col.className || ''}`}
                      style={{
                        ...(col.width ? { width: col.width, minWidth: col.width } : { minWidth: DEFAULT_MIN_COLUMN_WIDTH }),
                        backgroundColor: isDark ? '#ffffff' : '#010080'
                      }}
                    >
                      {col.label ?? ""}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(startIdx, endIdx).map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className={`${idx % 2 === 0
                    ? "bg-white dark:bg-[#1a2035]"
                    : "bg-gray-50 dark:bg-[#252b40]"
                    } text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2d3447] transition-colors`}
                >
                  {columns.map((col, i) => {
                    const isLast = i === columns.length - 1;
                    const rawValue = col.render
                      ? col.render(row, idx)
                      : col.key
                        ? col.key.split(".").reduce((obj, key) => obj?.[key], row)
                        : undefined;

                    let cellContent = rawValue;

                    if (rawValue === undefined || rawValue === null || rawValue === "") {
                      cellContent = "-";
                    } else if (Array.isArray(rawValue)) {
                      cellContent = rawValue.join(", ");
                    } else if (
                      typeof rawValue === "object" &&
                      rawValue !== null &&
                      !React.isValidElement(rawValue)
                    ) {
                      cellContent = rawValue._id || JSON.stringify(rawValue);
                    }

                    const rowBgClass = idx % 2 === 0
                      ? "bg-white dark:bg-[#1a2035]"
                      : "bg-gray-50 dark:bg-[#252b40]";

                    return (
                      <td
                        key={col.key || i}
                        className={`px-5 py-4 border-b border-gray-200 dark:border-gray-700 ${col.className || ''}`}
                        style={{
                          ...(col.width ? { width: col.width, minWidth: col.width } : { minWidth: DEFAULT_MIN_COLUMN_WIDTH }),
                          backgroundColor: idx % 2 === 0
                            ? (isDark ? '#1a2035' : '#ffffff')
                            : (isDark ? '#252b40' : '#f9fafb')
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-300"
                  >
                    {emptyMessage || "No data found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer Section - Fixed at bottom of card */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 flex-wrap gap-4">
          <span>
            {filteredData.length === 0
              ? "0 entries"
              : `${startIdx + 1}–${Math.min(endIdx, filteredData.length)} of ${filteredData.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ‹
            </button>
            <span className="px-2">
              {currentPage} of {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;

