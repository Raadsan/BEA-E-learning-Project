import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/students`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Students"],
  endpoints: (builder) => ({
    // GET STUDENTS BY CLASS
    getStudentsByClass: builder.query({
      query: (classId) => `/class/${classId}`,
      providesTags: (classId) => [{ type: "Students", id: `Class_${classId}` }],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET ALL students (supports status filter e.g. status=trash)
    getStudents: builder.query<any, { status?: string } | void>({
      query: (params) => {
        if (params && typeof params === "object" && "status" in params && params.status) {
          return `/?status=${params.status}`;
        }
        return "/";
      },
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET DELETED STUDENTS (Trash)
    getDeletedStudents: builder.query<any, void>({
      query: () => "/?status=trash",
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET SINGLE student
    getStudent: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Students", id }],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.student;
        }
        return response;
      },
    }),

    // CREATE student
    createStudent: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    // UPDATE student
    updateStudent: builder.mutation({
      query: (data) => {
        let id;
        let body;

        if (data && typeof data === 'object' && 'id' in data && 'body' in data) {
          id = data.id;
          body = data.body;
        } else if (data instanceof FormData) {
          id = data.get("id");
          body = data;
        } else {
          // Fallback for simple JSON updates if used elsewhere
          const { id: dataId, ...rest } = data || {};
          id = dataId;
          body = rest;
        }

        return {
          url: `/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Students"],
    }),

    // DELETE student (Soft Delete / Move to Trash)
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),

    // RESTORE student from trash
    restoreStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "PUT",
      }),
      invalidatesTags: ["Students"],
    }),

    // PERMANENTLY DELETE student
    permanentDeleteStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),

    // EMPTY TRASH
    emptyTrash: builder.mutation<any, void>({
      query: () => ({
        url: "/trash/empty",
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),

    // APPROVE student
    approveStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),

    // REJECT student
    rejectStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Students"],
    }),
    // EXTEND student deadline
    extendStudentDeadline: builder.mutation({
      query: ({ id, durationMinutes }) => ({
        url: `/${id}/extend`,
        method: "PATCH",
        body: { durationMinutes },
      }),
      invalidatesTags: ["Students"],
    }),

    // GET STUDENT PROGRESS
    getStudentProgress: builder.query<any, void>({
      query: () => "/progress",
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET SEX DISTRIBUTION
    getSexDistribution: builder.query({
      query: ({ program_id, class_id }: { program_id?: string; class_id?: string } = {}) => {
        const params = new URLSearchParams();
        if (program_id) params.append("program_id", program_id);
        if (class_id) params.append("class_id", class_id);
        return `/sex-distribution?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        return response;
      },
    }),

    // GET TOP STUDENTS
    getTopStudents: builder.query({
      query: ({ limit = 10, program_id, class_id }: { limit?: number | string; program_id?: string; class_id?: string } = {}) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        if (program_id) params.append("program_id", program_id);
        if (class_id) params.append("class_id", class_id);
        return `/top-students?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.students;
        }
        return response;
      },
    }),

    // GET STUDENT LOCATIONS
    getStudentLocations: builder.query({
      query: ({ program_id, class_id }: { program_id?: string; class_id?: string } = {}) => {
        const params = new URLSearchParams();
        if (program_id) params.append("program_id", program_id);
        if (class_id) params.append("class_id", class_id);
        return `/locations?${params.toString()}`;
      },
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.locations;
        }
        return response;
      },
    }),
    // GET MY CLASSES (History)
    getMyClasses: builder.query<any, void>({
      query: () => "/my-classes",
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.classes;
        }
        return response;
      },
    }),

    // GET DETAILED REPORT (For Student Progress Page)
    getDetailedReport: builder.query<any, void>({
      query: () => "/detailed-report",
      providesTags: ["Students"],
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetStudentsByClassQuery,
  useGetStudentsQuery,
  useGetDeletedStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useRestoreStudentMutation,
  usePermanentDeleteStudentMutation,
  useEmptyTrashMutation,
  useApproveStudentMutation,
  useRejectStudentMutation,
  useExtendStudentDeadlineMutation,
  useGetStudentProgressQuery,
  useGetSexDistributionQuery,
  useGetTopStudentsQuery,
  useGetStudentLocationsQuery,
  useGetMyClassesQuery,
  useGetDetailedReportQuery,
} = studentApi;

