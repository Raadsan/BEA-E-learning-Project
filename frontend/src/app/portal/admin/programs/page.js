"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import DataTable from "@/components/DataTable";
import { useGetProgramsQuery, useCreateProgramMutation, useUpdateProgramMutation, useDeleteProgramMutation } from "@/redux/api/programApi";
import { studentApi } from "@/redux/api/studentApi";
import { useDarkMode } from "@/context/ThemeContext";

// Extracted Components
import ProgramForm from "./components/ProgramForm";
import ViewProgramModal from "./components/ViewProgramModal";
import ProgramConfirmationModal from "./components/ProgramConfirmationModal";

export default function ProgramsPage() {
  const { isDark } = useDarkMode();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isLoading: false,
    confirmButtonColor: "blue"
  });

  const [formData, setFormData] = useState({
    title: "", description: "", status: "active", image: null, video: null, price: "", discount: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const { data: backendPrograms, isLoading, isError, error } = useGetProgramsQuery();
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();

  const programs = backendPrograms?.map((program) => ({
    ...program,
    image: program.image ? `http://localhost:5000${program.image}` : null,
    video: program.video ? `http://localhost:5000${program.video}` : null,
  })) || [];

  const handleAddProgram = () => {
    setEditingProgram(null);
    setFormData({ title: "", description: "", status: "active", image: null, video: null, price: "", discount: "" });
    setImagePreview(null); setVideoPreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title || "", description: program.description || "",
      status: program.status || "active", image: null, video: null,
      price: program.price || "", discount: program.discount || "",
    });
    setImagePreview(program.image || null); setVideoPreview(program.video || null);
    setIsModalOpen(true);
  };

  const handleStatusToggle = (program) => {
    const newStatus = program.status === 'active' ? 'inactive' : 'active';
    setConfirmationModal({
      isOpen: true, title: "Confirm Status Change",
      message: `Do you want to change status of ${program.title} to ${newStatus}?`,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          const submitFormData = new FormData();
          submitFormData.append("status", newStatus);
          await updateProgram({ id: program.id, formData: submitFormData }).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "blue" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert("Failed to update status.");
        }
      },
      isLoading: false, confirmButtonColor: "blue"
    });
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true, title: "Delete Program", message: "Are you sure? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          await deleteProgram(id).unwrap();
          setConfirmationModal({ isOpen: false, title: "", message: "", onConfirm: null, isLoading: false, confirmButtonColor: "red" });
        } catch (error) {
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
          alert("Failed to delete program.");
        }
      },
      isLoading: false, confirmButtonColor: "red"
    });
  };

  const handleView = (program) => { setSelectedProgram(program); setIsViewModalOpen(true); };
  const handleCloseViewModal = () => { setIsViewModalOpen(false); setSelectedProgram(null); };

  const handleCloseModal = () => {
    setIsModalOpen(false); setEditingProgram(null);
    setFormData({ title: "", description: "", status: "active", image: null, video: null, price: "", discount: "" });
    setImagePreview(null); setVideoPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "image") setImagePreview(reader.result);
        else if (name === "video") setVideoPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      if (!editingProgram || formData.status !== editingProgram.status) submitFormData.append("status", formData.status);
      if (formData.image) submitFormData.append("image", formData.image);
      if (formData.video) submitFormData.append("video", formData.video);
      submitFormData.append("price", formData.price || 0);
      submitFormData.append("discount", formData.discount || 0);

      if (editingProgram) {
        await updateProgram({ id: editingProgram.id, formData: submitFormData }).unwrap();
        dispatch(studentApi.util.invalidateTags(["Students"]));
      } else {
        await createProgram(submitFormData).unwrap();
      }
      handleCloseModal();
    } catch (error) { alert("Failed to save program."); }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", render: (row) => <span className="truncate block max-w-xs">{row.description || "No description"}</span> },
    { key: "price", label: "Price", render: (row) => <div><span>${(parseFloat(row.price || 0) - parseFloat(row.discount || 0)).toFixed(2)}</span>{parseFloat(row.discount || 0) > 0 && <span className="block text-[10px] text-gray-400 line-through">${parseFloat(row.price || 0).toFixed(2)}</span>}</div> },
    { key: "status", label: "Status", render: (row) => <button onClick={() => handleStatusToggle(row)} className={`px-4 py-1.5 text-xs font-bold rounded-full ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}</button> },
    {
      key: "actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="View"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
          <button onClick={() => handleEdit(row)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Delete" disabled={isDeleting}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <main className="flex-1 bg-gray-50 text-center py-12">Loading programs...</main>;
  if (isError) return <main className="flex-1 bg-gray-50 text-center py-12 text-red-600">Error: {error?.data?.message || "Unknown error"}</main>;

  return (
    <>
      <main className="flex-1 bg-gray-50"><div className="w-full px-8 py-6"><DataTable title="Program Management" columns={columns} data={programs} onAddClick={handleAddProgram} showAddButton={true} /></div></main>
      <ProgramForm isOpen={isModalOpen} onClose={handleCloseModal} editingProgram={editingProgram} formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} handleSubmit={handleSubmit} isDark={isDark} isCreating={isCreating} isUpdating={isUpdating} imagePreview={imagePreview} videoPreview={videoPreview} />
      {isViewModalOpen && selectedProgram && (
        <ViewProgramModal program={selectedProgram} onClose={handleCloseViewModal} isDark={isDark} />
      )}
      <ProgramConfirmationModal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))} title={confirmationModal.title} message={confirmationModal.message} onConfirm={confirmationModal.onConfirm} isLoading={confirmationModal.isLoading} confirmButtonColor={confirmationModal.confirmButtonColor} isDark={isDark} />
    </>
  );
}
