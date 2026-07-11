import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ['StudentReviews', 'TeacherReviews', 'Reviews', 'ReviewWindows', 'ReviewAssignments'],
    endpoints: (builder) => ({
        submitStudentReview: builder.mutation({
            query: (data) => ({ url: '/student-reviews', method: 'POST', body: data }),
            invalidatesTags: ['StudentReviews', 'ReviewAssignments'],
        }),
        getStudentReviews: builder.query({
            query: (student_id) => student_id ? `/student-reviews/my/${student_id}` : '/student-reviews',
            providesTags: ['StudentReviews'],
        }),
        getStudentReviewsByTeacher: builder.query<any, void>({
            query: () => '/student-reviews/submitted-by-me',
            providesTags: ['StudentReviews'],
        }),
        getAllStudentReviews: builder.query<any, any | void>({
            query: (params) => ({ url: "/student-reviews/admin/all", params: params || undefined }),
            providesTags: ["StudentReviews"],
        }),

        submitTeacherReview: builder.mutation({
            query: (data) => ({ url: '/teacher-reviews', method: 'POST', body: data }),
            invalidatesTags: ['TeacherReviews', 'ReviewAssignments'],
        }),
        getTeacherReviews: builder.query({
            query: (teacher_id) => `/teacher-reviews/teacher/${teacher_id}`,
            providesTags: ['TeacherReviews'],
        }),
        getTeachersToReview: builder.query<any, void>({
            query: () => "/teacher-reviews/teachers-to-review",
            providesTags: ["Reviews"],
        }),
        getAllTeacherReviews: builder.query<any, any | void>({
            query: (params) => ({ url: "/teacher-reviews/admin/all", params: params || undefined }),
            providesTags: ["TeacherReviews"],
        }),

        getReviewAssignments: builder.query<any, 'student' | 'teacher'>({
            query: (type) => `/${type}-reviews/admin/assignments`,
            providesTags: (_result, _error, type) => [{ type: 'ReviewAssignments', id: type }],
        }),
        getActiveReviewAssignment: builder.query<any, { type: 'student' | 'teacher'; class_id?: number | string; course_id?: number | string; subprogram_id?: number | string }>({
            query: ({ type, ...params }) => ({ url: `/${type}-reviews/assignments/active`, params }),
            providesTags: (_result, _error, arg) => [{ type: 'ReviewAssignments', id: `${arg.type}-active` }],
        }),
        createReviewAssignment: builder.mutation({
            query: ({ type, ...body }) => ({ url: `/${type}-reviews/admin/assignments`, method: 'POST', body }),
            invalidatesTags: (_result, _error, { type }) => [{ type: 'ReviewAssignments', id: type }],
        }),
        updateReviewAssignment: builder.mutation({
            query: ({ type, id, ...body }) => ({ url: `/${type}-reviews/admin/assignments/${id}`, method: 'PUT', body }),
            invalidatesTags: (_result, _error, { type }) => [{ type: 'ReviewAssignments', id: type }, 'StudentReviews', 'TeacherReviews'],
        }),
        deleteReviewAssignment: builder.mutation({
            query: ({ type, id }) => ({ url: `/${type}-reviews/admin/assignments/${id}`, method: 'DELETE' }),
            invalidatesTags: (_result, _error, { type }) => [{ type: 'ReviewAssignments', id: type }, 'StudentReviews', 'TeacherReviews'],
        }),

        getQuestions: builder.query({
            query: (type) => `/${type}-reviews/questions`,
            providesTags: ["Reviews"],
        }),
        getAllQuestions: builder.query({
            query: (type) => `/${type}-reviews/admin/questions/all`,
            providesTags: ["Reviews"],
        }),
        createQuestion: builder.mutation({
            query: ({ type, ...body }) => ({ url: `/${type}-reviews/admin/questions/create`, method: "POST", body }),
            invalidatesTags: ["Reviews"],
        }),
        updateQuestion: builder.mutation({
            query: ({ type, id, ...body }) => ({ url: `/${type}-reviews/admin/questions/update/${id}`, method: "PUT", body }),
            invalidatesTags: ["Reviews"],
        }),
        deleteQuestion: builder.mutation({
            query: ({ type, id }) => ({ url: `/${type}-reviews/admin/questions/delete/${id}`, method: "DELETE" }),
            invalidatesTags: ["Reviews"],
        }),

        getReviewWindow: builder.query({
            query: (type: 'teacher' | 'student') => `/reviews/windows/${type}`,
            providesTags: (_result, _error, type) => [{ type: 'ReviewWindows', id: type }],
        }),
        updateReviewWindow: builder.mutation({
            query: ({ type, ...body }) => ({ url: `/reviews/windows/${type}`, method: 'PUT', body }),
            invalidatesTags: (_result, _error, { type }) => [{ type: 'ReviewWindows', id: type }],
        }),
    }),
});

export const {
    useSubmitStudentReviewMutation,
    useGetStudentReviewsQuery,
    useGetStudentReviewsByTeacherQuery,
    useSubmitTeacherReviewMutation,
    useGetTeacherReviewsQuery,
    useGetQuestionsQuery,
    useGetAllQuestionsQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
    useGetTeachersToReviewQuery,
    useGetAllTeacherReviewsQuery,
    useGetAllStudentReviewsQuery,
    useGetReviewAssignmentsQuery,
    useGetActiveReviewAssignmentQuery,
    useCreateReviewAssignmentMutation,
    useUpdateReviewAssignmentMutation,
    useDeleteReviewAssignmentMutation,
    useGetReviewWindowQuery,
    useUpdateReviewWindowMutation,
} = reviewApi;
