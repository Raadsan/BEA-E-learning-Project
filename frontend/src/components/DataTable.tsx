"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useDarkMode } from "@/context/ThemeContext";
const DEFAULT_MIN_COLUMN_WIDTH = "120px";

const DataTable = ({
  title = "",
  columns = [],
  data = [],
  onAddClick = undefined,
  showAddButton = true,
  customActions = null,
  emptyMessage = "No data found.",
  customHeaderLeft = null,
  filters = null,
  selectable = false,
  onSelectionChange = undefined,
  selectedItems = [],
  compact = false,
  rowsPerPage = 10,
  onRowsPerPageChange = undefined,
  getRowId = undefined,
  isLoading = false,
  searchKey = undefined,
  onRowClick = undefined,
  isDark: propIsDark = undefined
}) => {
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

  const { isDark: contextIsDark } = useDarkMode();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [entriesPerPage, setEntriesPerPage] = useState(rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const getRowIdHelper = (item: any) => {
    if (getRowId) return getRowId(item);
    return item.id || item._id || item.student_id;
  };

  // Sync entriesPerPage with rowsPerPage prop changes
  useEffect(() => {
    setEntriesPerPage(rowsPerPage);
  }, [rowsPerPage]);

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

  // Selection Logic
  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      // Select all filtered data
      const allIds = filteredData.map(item => getRowIdHelper(item));
      // Merge with existing selection to avoid losing selections from other pages/searches if desired? 
      // Usually "Select All" on a table selects visible.
      // But if we want to support accumulation, we should merge.
      // However, usually "Select All" checkbox in header reflects current view.
      // Let's simpler: Select all filtered items.
      // But we should probably keep existing selections that are NOT in current view?
      // For now, let's just replacing selection with all filtered IDs might be unexpected if user wants to accumulate.
      // Better: Add filtered IDs to selectedItems (deduplicated).
      const newSelected = [...new Set([...selectedItems, ...allIds])];
      onSelectionChange(newSelected);
    } else {
      // Deselect all filtered data
      const filteredIds = filteredData.map(item => getRowIdHelper(item));
      const newSelected = selectedItems.filter(id => !filteredIds.includes(id));
      onSelectionChange(newSelected);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectionChange) return;
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedItems.includes(getRowIdHelper(item)));
  const isIndeterminate = filteredData.some(item => selectedItems.includes(getRowIdHelper(item))) && !isAllSelected;



  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const totalPages = Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / entriesPerPage);

  return (
    <div className={`p-5 rounded-xl shadow-sm border w-full max-w-full min-w-0 ${isDark ? 'bg-[#0f172a] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
      {/* Table Header Section - Fixed at top of card */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="header">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            {customActions && (
              <div className="flex gap-2">
                {customActions}
              </div>
            )}
            {showAddButton && onAddClick && (
              <button
                onClick={onAddClick}
                className={`${isDark ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-[#010080] hover:bg-[#010080]/90 text-white'} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            )}
          </div>


        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Left Side: Entries selector & customHeaderLeft (Filters, Sort, Show All) */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 h-[32px]">
              <span className="text-[11px] text-gray-500 font-semibold">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEntriesPerPage(val);
                  setCurrentPage(1);
                  if (onRowsPerPageChange) {
                    onRowsPerPageChange(val);
                  }
                }}
                className="bg-transparent text-[11px] font-bold text-gray-700 dark:text-white outline-none cursor-pointer focus:ring-0 border-none p-0 h-full"
              >
                {[5, 10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 font-semibold">entries</span>
            </div>

            {customHeaderLeft && (
              <div className="flex flex-wrap items-center gap-2">
                {customHeaderLeft}
              </div>
            )}

            {filters && (
              <div className="flex flex-wrap items-center gap-2">
                {filters}
              </div>
            )}
          </div>

          {/* Right Side: Search Box */}
          <div className="w-full md:w-auto flex-shrink-0">
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-1 text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none transition-all shadow-xs h-[32px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-800/50">
        <div ref={tableRef} className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm" style={{ minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead className={`${isDark ? 'bg-[#0f172a] text-white border-b border-gray-800' : 'bg-[#010080] text-white'} sticky top-0 z-30`}>
              <tr>
                {selectable && (
                  <th className={`${compact ? 'px-3 py-2' : 'px-5 py-4'} w-12`} style={{ backgroundColor: isDark ? '#0f172a' : '#010080', color: '#ffffff' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {Array.isArray(columns) && columns.map((col, i) => {
                  return (
                    <th
                      key={col.key || i}
                      className={`${compact ? 'px-3 py-2 text-[10px]' : 'px-5 py-4 text-sm'} uppercase font-semibold tracking-wide ${col.className || ''}`}
                      style={{
                        ...(col.width ? { width: col.width, minWidth: col.width } : { minWidth: DEFAULT_MIN_COLUMN_WIDTH }),
                        backgroundColor: isDark ? '#0f172a' : '#010080',
                        color: '#ffffff',
                      }}
                    >
                      {col.label ?? ""}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={(Array.isArray(columns) ? columns.length : 1) + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                Array.isArray(filteredData) && filteredData.slice(startIdx, endIdx).map((row, idx) => (
                  <tr
                    key={getRowIdHelper(row) || idx}
                    className={`${idx % 2 === 0
                      ? "bg-white dark:bg-[#0f172a]"
                      : "bg-gray-50 dark:bg-[#111827]"
                      } text-black dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors`}
                  >
                    {selectable && (
                      <td className={`${compact ? 'px-3 py-2' : 'px-5 py-4'} border-b border-gray-200 dark:border-gray-700`}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(getRowIdHelper(row))}
                          onChange={() => handleSelectRow(getRowIdHelper(row))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {Array.isArray(columns) && columns.map((col, i) => {
                      const cellValue = col.key
                        ? col.key.split(".").reduce((obj, key) => obj?.[key], row)
                        : undefined;

                      const rawValue = col.render
                        ? col.render(cellValue, row, idx)
                        : cellValue;

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

                      const isIdField = col.key?.toLowerCase().includes("id") || col.key?.toLowerCase() === "student_id";

                      return (
                        <td
                          key={col.key || i}
                          className={`${compact ? 'px-3 py-2 text-[11px]' : 'px-5 py-4 text-sm'} border-b border-gray-200 dark:border-gray-700 text-black dark:text-white ${isIdField ? 'font-bold' : 'font-normal'} ${col.className || ''}`}
                          style={{
                            ...(col.width ? { width: col.width, minWidth: col.width } : { minWidth: DEFAULT_MIN_COLUMN_WIDTH }),
                            backgroundColor: idx % 2 === 0
                              ? (isDark ? '#0f172a' : '#ffffff')
                              : (isDark ? '#111827' : '#f9fafb')
                          }}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
              {!isLoading && (!Array.isArray(filteredData) || filteredData.length === 0) && (
                <tr>
                  <td
                    colSpan={(Array.isArray(columns) ? columns.length : 1) + (selectable ? 1 : 0)}
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
            {(!Array.isArray(filteredData) || filteredData.length === 0)
              ? "0 entries"
              : `${startIdx + 1}–${Math.min(endIdx, filteredData.length)} of ${filteredData.length}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-[#1e293b] dark:hover:bg-[#334155] border dark:border-gray-700 text-black dark:text-white disabled:bg-gray-200 dark:disabled:bg-[#0f172a] disabled:cursor-not-allowed transition-all"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ‹
            </button>
            <span className="px-2">
              {currentPage} of {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-[#1e293b] dark:hover:bg-[#334155] border dark:border-gray-700 text-black dark:text-white disabled:bg-gray-200 dark:disabled:bg-[#0f172a] disabled:cursor-not-allowed transition-all"
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
