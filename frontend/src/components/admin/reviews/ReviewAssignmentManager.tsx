
"use client";

import { useMemo, useState } from "react";
import { format, isValid } from "date-fns";
import toast from "react-hot-toast";
import DataTable from "@/components/DataTable";
import { useDarkMode } from "@/context/ThemeContext";
import { usePagePermissions } from "@/hooks/usePagePermissions";
import { useGetClassesQuery } from "@/lib/api/classApi";
import {
  useCreateReviewAssignmentMutation,
  useDeleteReviewAssignmentMutation,
  useGetAllStudentReviewsQuery,
  useGetAllTeacherReviewsQuery,
  useGetReviewAssignmentsQuery,
  useUpdateReviewAssignmentMutation,
} from "@/lib/api/reviewApi";

type ReviewType = "student" | "teacher";
type Props = { reviewType: ReviewType };

const emptyForm = {
  title: "",
  description: "",
  program_id: "",
  subprogram_id: "",
  class_id: "",
  start_date: "",
  end_date: "",
  status: "active",
  questionnaire_url: "",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return isValid(date) ? format(date, "dd MMM yyyy") : "-";
};

const formatDateTimeInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return isValid(date) ? format(date, "yyyy-MM-dd'T'HH:mm") : "";
};

const statusClass = (status?: string) => {
  if (status === "open") return "bg-green-100 text-green-700 border-green-200";
  if (status === "upcoming") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "inactive") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-red-100 text-red-700 border-red-200";
};

const stars = (value = 0) => (
  <div className="flex text-amber-400">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`h-4 w-4 ${i < value ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ReviewAssignmentManager({ reviewType }: Props) {
  const { isDark } = useDarkMode();
  const permissionKey = reviewType === "student" ? "student_reviews" : "teacher_questions";
  const { canAdd, canEdit, canDelete, canView } = usePagePermissions("reviews", permissionKey);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [view, setView] = useState<"list" | "submissions">("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [formData, setFormData] = useState<any>(emptyForm);

  const { data: assignments = [], isLoading: assignmentsLoading, refetch } = useGetReviewAssignmentsQuery(reviewType);
  const studentReviews = useGetAllStudentReviewsQuery(
    reviewType === "student" && selectedAssignmentId ? { assignment_id: selectedAssignmentId } : undefined,
    { skip: reviewType !== "student" || !selectedAssignmentId }
  );
  const teacherReviews = useGetAllTeacherReviewsQuery(
    reviewType === "teacher" && selectedAssignmentId ? { assignment_id: selectedAssignmentId } : undefined,
    { skip: reviewType !== "teacher" || !selectedAssignmentId }
  );
  const { data: classes = [] } = useGetClassesQuery();
  const [createAssignment, { isLoading: creating }] = useCreateReviewAssignmentMutation();
  const [updateAssignment, { isLoading: updating }] = useUpdateReviewAssignmentMutation();
  const [deleteAssignment, { isLoading: deleting }] = useDeleteReviewAssignmentMutation();

  const selectedAssignment = assignments.find((a: any) => String(a.id) === selectedAssignmentId) || null;
  const reviews = reviewType === "student" ? studentReviews.data || [] : teacherReviews.data || [];
  const reviewsLoading = reviewType === "student" ? studentReviews.isLoading : teacherReviews.isLoading;
  const pageTitle = reviewType === "student" ? "Student Reviews" : "Teacher Reviews";
  const pageSubtitle = reviewType === "student"
    ? "Manage review boxes assigned to teachers for student evaluation."
    : "Manage teacher review boxes assigned to students.";

  const uniquePrograms = useMemo(() => {
    const map = new Map<string, any>();
    classes.forEach((cls: any) => {
      const id = cls.program_id || cls.subprograms?.program_id;
      const name = cls.program_name || cls.subprograms?.programs?.title || cls.subprograms?.programs?.program_name;
      if (id && name) map.set(String(id), { id: String(id), name });
    });
    return Array.from(map.values());
  }, [classes]);

  const filteredSubprograms = useMemo(() => {
    const map = new Map<string, any>();
    classes.forEach((cls: any) => {
      const programId = String(cls.program_id || cls.subprograms?.program_id || "");
      const id = cls.subprogram_id || cls.subprograms?.id;
      const name = cls.subprogram_name || cls.subprograms?.subprogram_name;
      if ((!formData.program_id || programId === String(formData.program_id)) && id && name) {
        map.set(String(id), { id: String(id), name });
      }
    });
    return Array.from(map.values());
  }, [classes, formData.program_id]);

  const filteredClasses = useMemo(() => classes.filter((cls: any) => {
    const programOk = !formData.program_id || String(cls.program_id || cls.subprograms?.program_id || "") === String(formData.program_id);
    const subprogramOk = !formData.subprogram_id || String(cls.subprogram_id || cls.subprograms?.id || "") === String(formData.subprogram_id);
    return programOk && subprogramOk;
  }), [classes, formData.program_id, formData.subprogram_id]);

  const visibleAssignments = useMemo(() => {
    if (!selectedClassId) return assignments;
    const cls = classes.find((item: any) => String(item.id) === selectedClassId);
    return assignments.filter((assignment: any) => {
      const classOk = !assignment.class_id || String(assignment.class_id) === selectedClassId;
      const subprogramOk = !assignment.subprogram_id || String(assignment.subprogram_id) === String(cls?.subprogram_id || cls?.subprograms?.id || "");
      const programOk = !assignment.program_id || String(assignment.program_id) === String(cls?.program_id || cls?.subprograms?.program_id || "");
      return classOk && subprogramOk && programOk;
    });
  }, [assignments, classes, selectedClassId]);

  const questionLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    (selectedReview?.assignment?.questions || selectedAssignment?.questions || []).forEach((q: any) => {
      lookup[String(q.id)] = q.question_text;
    });
    return lookup;
  }, [selectedAssignment, selectedReview]);

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev: any) => {
      const next = { ...prev, [name]: value };
      if (name === "program_id") {
        next.subprogram_id = "";
        next.class_id = "";
      }
      if (name === "subprogram_id") {
        next.class_id = "";
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditingAssignment(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const openEdit = (assignment: any) => {
    const cls = classes.find((item: any) => String(item.id) === String(assignment.class_id));
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      program_id: assignment.program_id || cls?.program_id || cls?.subprograms?.program_id || "",
      subprogram_id: assignment.subprogram_id || cls?.subprogram_id || cls?.subprograms?.id || "",
      class_id: assignment.class_id || "",
      start_date: formatDateTimeInput(assignment.start_date),
      end_date: formatDateTimeInput(assignment.end_date),
      status: assignment.status || "active",
      questionnaire_url: assignment.questionnaire_url || "",
    });
    setIsFormOpen(true);
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        type: reviewType,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        program_id: formData.program_id || null,
        subprogram_id: formData.subprogram_id || null,
        class_id: formData.class_id || null,
        course_id: null,
        status: formData.status,
        questionnaire_url: formData.questionnaire_url || null,
        questions: [],
      };
      const request = editingAssignment
        ? updateAssignment({ ...payload, id: editingAssignment.id })
        : createAssignment(payload);
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          request.abort();
          reject(new Error("Save request timed out. Please try again."));
        }, 15000);
      });
      const response = request.unwrap();

      try {
        await Promise.race([response, timeout]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
      toast.success(editingAssignment ? "Review box updated successfully" : "Review box created successfully");
      setIsFormOpen(false);
      setEditingAssignment(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || error?.data?.error || "Failed to save review box");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAssignment({ type: reviewType, id: deleteTarget.id }).unwrap();
      if (selectedAssignmentId === String(deleteTarget.id)) {
        setSelectedAssignmentId("");
        setView("list");
      }
      setDeleteTarget(null);
      toast.success("Review box deleted successfully");
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to delete review box");
    }
  };

  const columns = [
    { key: "student_id", label: "Student ID", sortable: true },
    { key: "student_name", label: "Student", sortable: true },
    { key: "teacher_name", label: "Teacher", sortable: true },
    { key: "class_name", label: "Class", sortable: true },
    { key: "program_name", label: "Program", sortable: true },
    { key: "subprogram_name", label: "Subprogram", sortable: true },
    { key: "rating", label: "Rating", render: (value: number) => stars(value), sortable: true },
    { key: "created_at", label: "Submitted", render: (value: string) => formatDate(value), sortable: true },
    {
      key: "actions",
      label: "View",
      render: (_: any, row: any) => canView ? (
        <button type="button" onClick={() => setSelectedReview(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="View answers">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </button>
      ) : null,
      sortable: false,
    },
  ];

  const renderAnswerModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-850 dark:text-white">Review Answers</h3>
          <button onClick={() => setSelectedReview(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="grid gap-3 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800 md:grid-cols-2">
            <div><span className="text-xs text-gray-500">Student ID</span><div className="font-mono">{selectedReview.student_id}</div></div>
            <div><span className="text-xs text-gray-500">Student</span><div className="font-semibold">{selectedReview.student_name}</div></div>
            <div><span className="text-xs text-gray-500">Class</span><div>{selectedReview.class_name || "-"}</div></div>
            <div><span className="text-xs text-gray-500">Program</span><div>{selectedReview.program_name || "-"}</div></div>
            <div><span className="text-xs text-gray-500">Subprogram</span><div>{selectedReview.subprogram_name || "-"}</div></div>
          </div>
          <div className="mt-5 space-y-3">
            {(selectedReview.answers || []).map((answer: any, index: number) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <p className="font-semibold text-gray-850 dark:text-white">{questionLookup[String(answer.question_id)] || answer.question_text || `Question ${answer.question_id || index + 1}`}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><span>Rating:</span>{stars(answer.rating)}</div>
              </div>
            ))}
            {(!selectedReview.answers || !selectedReview.answers.length) && <div className="text-sm text-gray-500">No detailed answers were submitted.</div>}
          </div>
          {selectedReview.comment && (
            <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <div className="mb-1 text-xs font-bold uppercase text-gray-500">Comment</div>
              {selectedReview.comment}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (view === "submissions") {
    return (
      <div className={`min-h-screen p-6 ${isDark ? "bg-[#03002e] text-white" : "bg-gray-100/70 text-gray-900"}`}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button onClick={() => setView("list")} className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Boxes
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedAssignment?.title || "Review Submissions"}</h1>
            <p className="text-sm text-gray-500">Students who submitted this teacher review box.</p>
          </div>
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#010080] shadow-sm dark:bg-gray-900 dark:text-blue-300">
            {reviews.length} Submissions
          </div>
        </div>
        <DataTable title="Teacher Review Submissions" columns={columns} data={reviews} isLoading={reviewsLoading} rowsPerPage={10} />
        {selectedReview && renderAnswerModal()}
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#03002e] text-white" : "bg-gray-100/70 text-gray-900"}`}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{pageSubtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="h-11 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold uppercase text-gray-700 shadow-sm outline-none focus:border-[#010080] dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">All Classes</option>
            {classes.map((cls: any) => <option key={cls.id} value={cls.id}>{cls.class_name}</option>)}
          </select>
          {canAdd && (
            <button onClick={openCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#010080] px-5 text-sm font-black text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-800 active:scale-95">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Add Teacher Review
            </button>
          )}
        </div>
      </div>

      {assignmentsLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">Loading review boxes...</div>
      ) : visibleAssignments.length ? (
        <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          {visibleAssignments.map((assignment: any) => (
            <div key={assignment.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${statusClass(assignment.computed_status)}`}>{assignment.computed_status || assignment.status}</span>
              </div>
              <h2 className="mb-1 font-serif text-xl font-black text-[#05004e] dark:text-white">{assignment.title}</h2>
              <p className="mb-5 text-xs font-bold text-blue-600">{assignment.class_name || "All Classes"}</p>
              <div className="mb-4 grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 text-sm dark:border-gray-800">
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400">Program</div>
                  <div className="truncate font-bold text-gray-700 dark:text-gray-200">{assignment.program_name || "All Programs"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-gray-400">Subprogram</div>
                  <div className="truncate font-bold text-gray-700 dark:text-gray-200">{assignment.subprogram_name || "All Subprograms"}</div>
                </div>
              </div>
              <div className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-indigo-600">Start Date:</span><b>{formatDate(assignment.start_date)}</b></div>
                <div className="flex justify-between"><span className="text-indigo-600">End Date:</span><b>{formatDate(assignment.end_date)}</b></div>
                <div className="flex justify-between"><span className="text-indigo-600">Questionnaire:</span><b>{assignment.questionnaire_url ? "Linked" : "Not linked"}</b></div>
                <div className="flex justify-between"><span className="text-indigo-600">Submissions:</span><b>{assignment.response_count || 0}</b></div>
              </div>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button onClick={() => { setSelectedAssignmentId(String(assignment.id)); setView("submissions"); }} className="h-11 flex-1 rounded-xl bg-[#010080] text-sm font-black text-white transition hover:bg-blue-800 active:scale-95">View Submissions</button>
                {canEdit && (
                  <button onClick={() => openEdit(assignment)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/30" title="Edit">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => setDeleteTarget(assignment)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30" title="Delete">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900">No teacher review boxes found.</div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-2xl ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-100 bg-white text-gray-900"}`}>
            <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50/50"}`}>
              <h2 className="text-xl font-bold">{editingAssignment ? "Edit Teacher Review" : "Create New Teacher Review"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 transition-colors hover:text-gray-600" title="Close">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Program</label>
                  <select value={formData.program_id} onChange={(e) => handleFormChange("program_id", e.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`}>
                    <option value="">All Programs</option>
                    {uniquePrograms.map((program: any) => <option key={program.id} value={program.id}>{program.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Subprogram</label>
                  <select value={formData.subprogram_id} onChange={(e) => handleFormChange("subprogram_id", e.target.value)} disabled={!formData.program_id} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`}>
                    <option value="">All Subprograms</option>
                    {filteredSubprograms.map((subprogram: any) => <option key={subprogram.id} value={subprogram.id}>{subprogram.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Class</label>
                  <select value={formData.class_id} onChange={(e) => handleFormChange("class_id", e.target.value)} disabled={!formData.program_id} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`}>
                    <option value="">All Classes</option>
                    {filteredClasses.map((cls: any) => <option key={cls.id} value={cls.id}>{cls.class_name || cls.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Name</label>
                  <input required value={formData.title} onChange={(e) => handleFormChange("title", e.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Description</label>
                  <textarea value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)} rows={4} className={`w-full resize-none rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium opacity-80">Start Date & Time</label>
                    <input required type="datetime-local" value={formData.start_date} onChange={(e) => handleFormChange("start_date", e.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium opacity-80">End Date & Time</label>
                    <input required type="datetime-local" value={formData.end_date} onChange={(e) => handleFormChange("end_date", e.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Questionnaire Link</label>
                  <input type="url" value={formData.questionnaire_url} onChange={(e) => handleFormChange("questionnaire_url", e.target.value)} placeholder="https://..." className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium opacity-80">Status</label>
                  <select value={formData.status} onChange={(e) => handleFormChange("status", e.target.value)} className={`w-full rounded-lg border px-3 py-2 outline-none transition-all ${isDark ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500" : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"}`}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className={`flex justify-end gap-3 border-t px-6 py-4 ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50/50"}`}>
                <button type="button" onClick={() => setIsFormOpen(false)} className={`rounded-lg border px-4 py-2 font-semibold transition-all ${isDark ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
                <button type="submit" disabled={creating || updating} className="rounded-lg bg-[#010080] px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-800 active:scale-95 disabled:opacity-50">{creating || updating ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative w-full max-w-md rounded-xl border p-6 shadow-2xl ${isDark ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"}`}>
            <h3 className="mb-2 text-lg font-bold">Delete Teacher Review</h3>
            <p className="mb-6 text-sm opacity-75">Are you sure you want to delete this review box? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`rounded-lg border px-4 py-2 ${isDark ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-60">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












