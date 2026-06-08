"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation
} from "@/lib/api/materialApi";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { useGetSubprogramsQuery } from "@/lib/api/subprogramApi";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { API_URL, resolveMediaUrl } from "@/constants";

export default function CourseMaterialsPage() {
  const { showToast } = useToast();
  const { data: materialsData, isLoading: materialsLoading } = useGetMaterialsQuery();
  const { data: programs = [] } = useGetProgramsQuery();
  const { data: subprograms = [] } = useGetSubprogramsQuery();

  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters, Pagination and Selection States
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedSubprogramId, setSelectedSubprogramId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isBulkActionsModalOpen, setIsBulkActionsModalOpen] = useState(false);

  // Pinning State (persisted per admin in localStorage)
  const [pinnedMaterialIds, setPinnedMaterialIds] = useState([]);

  // Drag and Drop Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    program_id: "",
    subprogram_id: "",
    subject: "",
    level: "All",
    description: "",
    url: "",
    status: "Published",
  });

  // Load pinned materials from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pinned_materials");
      if (stored) {
        setPinnedMaterialIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading pinned materials:", e);
    }
  }, []);

  // Sync pinned materials to localStorage
  const togglePinMaterial = (id) => {
    const numericId = Number(id);
    let updated;
    if (pinnedMaterialIds.includes(numericId)) {
      updated = pinnedMaterialIds.filter(x => x !== numericId);
      showToast("Material unpinned successfully!", "success");
    } else {
      updated = [...pinnedMaterialIds, numericId];
      showToast("Material pinned successfully!", "success");
    }
    setPinnedMaterialIds(updated);
    localStorage.setItem("pinned_materials", JSON.stringify(updated));
  };

  // Filter subprograms based on selected program in form
  const filteredSubprograms = subprograms?.filter(sp =>
    !formData.program_id || String(sp.program_id) === String(formData.program_id)
  ) || [];

  // Filter materials based on search & selectors
  const filteredMaterials = (materialsData || []).filter(mat => {
    const matchesSearch = searchQuery
      ? (mat.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mat.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesProgram = selectedProgramId
      ? String(mat.program_id) === String(selectedProgramId)
      : true;

    const matchesSubprogram = selectedSubprogramId
      ? String(mat.subprogram_id) === String(selectedSubprogramId)
      : true;

    const matStatus = mat.status === 'Active' || mat.status === 'Published' ? 'Published' : 'Draft';
    const matchesStatus = selectedStatus
      ? matStatus === selectedStatus
      : true;

    return matchesSearch && matchesProgram && matchesSubprogram && matchesStatus;
  });

  // Sort/Rank Materials: Pinned items first, then by selected sort option
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const aPinned = pinnedMaterialIds.includes(Number(a.id));
    const bPinned = pinnedMaterialIds.includes(Number(b.id));

    // Pinned files always ranked first (Requirement 1.46)
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // Secondarily sort by selected sort option (Requirement 1.45 default is Newest to Oldest)
    if (sortBy === "name-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "name-desc") {
      return (b.title || "").localeCompare(a.title || "");
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at || a.createdAt || 0).getTime() - new Date(b.created_at || b.createdAt || 0).getTime();
    }
    // "newest" or default rank newest to oldest (Requirement 1.45)
    return new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime();
  });

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      title: "",
      type: "",
      program_id: "",
      subprogram_id: "",
      subject: "",
      level: "All",
      description: "",
      url: "",
      status: "Published",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      type: material.type,
      program_id: material.program_id || "",
      subprogram_id: material.subprogram_id || "",
      subject: material.subject || "",
      level: material.level || "All",
      description: material.description || "",
      url: material.url,
      status: material.status === 'Active' || material.status === 'Published' ? 'Published' : 'Draft',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setIsDragging(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === 'program_id') {
        newState.subprogram_id = "";
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingMaterial) {
        await updateMaterial({ id: editingMaterial.id, ...formData }).unwrap();
        showToast("Material updated successfully!", "success");
      } else {
        await createMaterial(formData).unwrap();
        showToast("Material created successfully!", "success");
      }
      handleCloseModal();
      // Refresh the page immediately so the table reflects the new data
      window.location.reload();
    } catch (err) {
      showToast(err.data?.error || "Failed to save material", "error");
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial(id).unwrap();
        showToast("Material deleted successfully!", "success");
      } catch (err) {
        showToast("Failed to delete material", "error");
      }
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(selectedMaterials.map(async (id) => {
        await updateMaterial({ id, status: newStatus }).unwrap();
      }));
      showToast(`Status of ${selectedMaterials.length} materials updated to ${newStatus}`, "success");
      setSelectedMaterials([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      showToast("Failed to bulk update status.", "error");
    }
  };

  const handleBulkPinChange = (shouldPin) => {
    let updated = [...pinnedMaterialIds];
    selectedMaterials.forEach(id => {
      const numericId = Number(id);
      if (shouldPin && !updated.includes(numericId)) {
        updated.push(numericId);
      } else if (!shouldPin) {
        updated = updated.filter(x => x !== numericId);
      }
    });
    setPinnedMaterialIds(updated);
    localStorage.setItem("pinned_materials", JSON.stringify(updated));
    showToast(`Bulk pinning action completed successfully!`, "success");
    setSelectedMaterials([]);
    setIsBulkActionsModalOpen(false);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedMaterials.map(async (id) => {
        await deleteMaterial(id).unwrap();
      }));
      showToast(`${selectedMaterials.length} materials deleted successfully`, "success");
      setSelectedMaterials([]);
      setIsBulkActionsModalOpen(false);
    } catch (error) {
      showToast("Failed to bulk delete materials.", "error");
    }
  };

  // Smart Drag and Drop Upload Handlers (Requirement 1.48)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadDroppedFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadDroppedFile(files[0]);
    }
  };

  const uploadDroppedFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(20);

    const token = localStorage.getItem("token");
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setUploadProgress(45);
      const response = await fetch(`${API_URL}/materials/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "File type upload invalid");
      }

      setUploadProgress(85);
      const result = await response.json();
      setUploadProgress(100);

      // Autofill form
      setFormData(prev => {
        return {
          ...prev,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ""), // Strip extension
          url: result.url,
          type: "Document"
        };
      });

      showToast("File uploaded successfully! Details auto-filled.", "success");
    } catch (err) {
      showToast(err.message || "Failed to upload file.", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Color-coded icons based on material type (Requirement 1.49)
  const getFileTypeIcon = (type) => {
    const normalized = (type || "").toLowerCase();
    if (normalized.includes("pdf")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-200 flex-shrink-0" title="PDF Document">
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-5h2v5z" />
          </svg>
        </div>
      );
    }
    if (normalized.includes("word") || normalized.includes("doc")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-200 flex-shrink-0" title="Word Document">
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        </div>
      );
    }
    if (normalized.includes("video") || normalized.includes("mp4") || normalized.includes("youtube")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-200 flex-shrink-0" title="Video File">
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </div>
      );
    }
    if (normalized.includes("presentation") || normalized.includes("ppt") || normalized.includes("powerpoint")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200 flex-shrink-0" title="Presentation Slide">
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </div>
      );
    }
    if (normalized.includes("drive")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-200 flex-shrink-0" title="Google Drive Link">
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-200 flex-shrink-0" title="Other Material">
        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        </svg>
      </div>
    );
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (_, row) => {
        const isPinned = pinnedMaterialIds.includes(Number(row.id));
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                {row.title}
              </span>
              {isPinned && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[9px] font-extrabold flex items-center gap-0.5 shadow-sm border border-yellow-200">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                  PINNED
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              {row.subject || "No topic/subject"}
            </span>
          </div>
        );
      }
    },
    {
      key: "type",
      label: "Type",
      render: (_, row) => (
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">
          {row.type}
        </span>
      ),
    },
    {
      key: "program",
      label: "Program",
      render: (_, row) => (
        <span className="text-gray-900 dark:text-white text-xs font-medium">
          {row.program_name || "General"}
        </span>
      ),
    },
    {
      key: "subprogram",
      label: "Subprogram",
      render: (_, row) => (
        <span className="text-gray-900 dark:text-white text-xs font-medium">
          {row.subprogram_name || "All Levels"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        // Visual Status Badges: Green for Published, Gray for Drafts (Requirement 1.47)
        const displayStatus = row.status === 'Active' || row.status === 'Published' ? 'Published' : 'Draft';
        const isPublished = displayStatus === 'Published';
        return (
          <span className={`px-3 py-1 inline-flex text-xs font-bold leading-5 rounded-full border transition-all ${
            isPublished
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 border-gray-250 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {displayStatus}
          </span>
        );
      },
    },
    {
      key: "url",
      label: "Link",
      render: (_, row) => {
        const resolvedUrl = row.url?.startsWith('http') ? row.url : resolveMediaUrl(row.url);
        return (
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {row.type === 'Drive' ? 'Open Drive' : 'Open Link'}
        </a>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        const isPinned = pinnedMaterialIds.includes(Number(row.id));
        return (
          <div className="flex gap-2">
            {/* Pinning Toggle Icon (Requirement 1.46) */}
            <button
              onClick={() => togglePinMaterial(row.id)}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isPinned ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={isPinned ? "Unpin this file" : "Pin this file"}
            >
              <svg className="w-5 h-5" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
            </button>

            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={() => handleDelete(row.id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  if (materialsLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-6 py-6 flex justify-center py-20">
          <Loader />
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-8 py-6">
          <DataTable
            title="Course Materials"
            columns={columns}
            data={sortedMaterials}
            onAddClick={handleAddMaterial}
            showAddButton={false}
            customActions={
              <>
                {/* Search query box inside actions line */}
                <div className="relative w-[180px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] h-[38px] outline-none focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] transition-all shadow-sm"
                  />
                </div>

                {/* Show All Button (Requirement 1.43) */}
                <button
                  onClick={() => {
                    setSelectedProgramId("");
                    setSelectedSubprogramId("");
                    setSelectedStatus("");
                    setSortBy("newest");
                    setSearchQuery("");
                    setRowsPerPage(10000); // Clears all filters and sets limit to high value to show all rows
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-250 cursor-pointer text-xs h-[38px] shadow-sm"
                  title="Clear all filters"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                  </svg>
                  Show All
                </button>

                {/* Bulk Actions Button (Requirement 1.44) */}
                <button
                  onClick={() => setIsBulkActionsModalOpen(true)}
                  disabled={selectedMaterials.length === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold ${
                    selectedMaterials.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#010080] hover:bg-[#010080]/90 text-white'
                  }`}
                  title={selectedMaterials.length === 0 ? "Select materials to perform actions" : "Perform bulk actions"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Actions
                </button>

                <button
                  onClick={handleAddMaterial}
                  className="bg-[#010080] hover:bg-[#010080]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors h-[38px] text-xs font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </>
            }
            customHeaderLeft={
              <div className="flex gap-2 flex-wrap items-center">
                {/* Selection Counter Box */}
                {selectedMaterials.length > 0 && (
                  <div className="px-3 py-1 bg-[#010080] text-white rounded-lg shadow-sm flex items-center gap-2 h-[32px]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-[11px]">{selectedMaterials.length} selected</span>
                    <button
                      onClick={() => setSelectedMaterials([])}
                      className="ml-1 text-white hover:text-gray-200 transition-colors"
                      title="Clear selection"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Program Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => {
                      setSelectedProgramId(e.target.value);
                      setSelectedSubprogramId(""); // Reset subprogram
                    }}
                    className="w-full pl-8 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="">All Programs</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Subprogram Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <select
                    value={selectedSubprogramId}
                    onChange={(e) => setSelectedSubprogramId(e.target.value)}
                    disabled={!selectedProgramId}
                    className="w-full pl-8 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px] disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-60"
                  >
                    <option value="">All Levels</option>
                    {(subprograms || [])
                      .filter(sp => String(sp.program_id) === String(selectedProgramId))
                      .map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.subprogram_name || sp.title}</option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sorting options dropdown */}
                <div className="relative group w-[130px]">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-white font-bold text-[11px] focus:ring-2 focus:ring-[#010080]/20 focus:border-[#010080] outline-none appearance-none transition-all shadow-sm hover:border-gray-300 cursor-pointer h-[32px]"
                  >
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                  <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            }
            selectable={true}
            selectedItems={selectedMaterials}
            onSelectionChange={setSelectedMaterials}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 border-2 border-gray-100 dark:border-gray-700 transform transition-all animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#010080] dark:text-white">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>



            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Material Information Section */}
              <div className="p-5 rounded-lg border bg-blue-50/20 border-blue-100 dark:bg-gray-750 dark:border-gray-700">
                <h3 className="text-sm font-extrabold mb-4 text-[#010080] dark:text-white uppercase tracking-wider">
                  Material Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Intermediate English Unit 1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      <option value="Document">Document</option>
                      <option value="Drive">Google Drive</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="program_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Program Alignment
                    </label>
                    <select
                      id="program_id"
                      name="program_id"
                      value={formData.program_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="">General Alignment</option>
                      {programs?.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subprogram_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subprogram Level
                    </label>
                    <select
                      id="subprogram_id"
                      name="subprogram_id"
                      value={formData.subprogram_id}
                      onChange={handleInputChange}
                      disabled={!formData.program_id}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:opacity-70 cursor-pointer"
                    >
                      <option value="">All Levels</option>
                      {filteredSubprograms.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.subprogram_name || sp.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subject / Topic Name
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Grammar Fundamentals"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resource Details */}
              <div className="space-y-4">
                {formData.type === "Document" ? (
                  <div className="space-y-1.5 w-full">
                    <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Upload File
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-sm font-semibold cursor-pointer"
                      >
                        Browse File...
                      </label>
                      {formData.url ? (
                        <span className="text-xs text-green-600 font-semibold truncate max-w-[200px] md:max-w-md">
                          Selected: {formData.url.split("/").pop()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No file selected</span>
                      )}
                    </div>
                    {isUploading && (
                      <div className="mt-2 w-full max-w-xs">
                        <div className="flex justify-between text-xs text-gray-500 mb-1 font-bold">
                          <span>Uploading file...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#010080] h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label htmlFor="url" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resource Link / URL
                    </label>
                    <input
                      type="text"
                      id="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://google.drive/..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description / Extra Info
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add a helpful description about this resource..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010080] bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#010080] text-white rounded-lg hover:bg-[#0200a0] transition-colors shadow-lg shadow-blue-500/20 text-sm font-semibold flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed min-w-[130px] justify-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    editingMaterial ? "Update Material" : "Save Material"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {isBulkActionsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsBulkActionsModalOpen(false)}
          />
          <div className="relative rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-2xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-lg font-bold mb-4 text-[#010080] dark:text-white">
              Bulk Actions ({selectedMaterials.length} selected)
            </h3>
            <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">
              Apply actions to all selected course materials instantly.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleBulkStatusChange("Published")}
                className="w-full py-2.5 px-4 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm transition-colors border border-green-200"
              >
                Set Status to Published
              </button>
              <button
                onClick={() => handleBulkStatusChange("Draft")}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors border border-gray-250"
              >
                Set Status to Draft
              </button>
              <button
                onClick={() => handleBulkPinChange(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-750 font-semibold text-sm transition-colors border border-yellow-250"
              >
                Pin Selected Materials
              </button>
              <button
                onClick={() => handleBulkPinChange(false)}
                className="w-full py-2.5 px-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-750 font-semibold text-sm transition-colors border border-yellow-250"
              >
                Unpin Selected Materials
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all selected materials? This action cannot be undone.")) {
                    handleBulkDelete();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm transition-colors border border-red-200"
              >
                Delete Selected Materials
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsBulkActionsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}
