import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from "@/constants";

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}`, // Changed from /api/reviews
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['StudentReviews', 'TeacherReviews', 'Reviews', 'ReviewWindows'],
    endpoints: (builder) => ({
        // --- STUDENT REVIEWS (Teachers reviewing Students) ---
        submitStudentReview: builder.mutation({
            query: (data) => ({
                url: '/student-reviews',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['StudentReviews'],
        }),
        getStudentReviews: builder.query({
            query: (student_id) => student_id ? `/student-reviews/my/${student_id}` : '/student-reviews',
            providesTags: ['StudentReviews'],
        }),
        getStudentReviewsByTeacher: builder.query<any, void>({
            query: () => '/student-reviews/submitted-by-me',
            providesTags: ['StudentReviews'],
        }),

        // --- TEACHER REVIEWS (Students reviewing Teachers) ---
        submitTeacherReview: builder.mutation({
            query: (data) => ({
                url: '/teacher-reviews',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeacherReviews'],
        }),
        getTeacherReviews: builder.query({
            query: (teacher_id) => `/teacher-reviews/teacher/${teacher_id}`,
            providesTags: ['TeacherReviews'],
        }),
        getTeachersToReview: builder.query<any, void>({
            query: () => "/teacher-reviews/teachers-to-review",
            providesTags: ["Reviews"],
        }),
        getAllTeacherReviews: builder.query<any, void>({
            query: () => "/teacher-reviews/admin/all",
            providesTags: ["TeacherReviews"],
        }),
        getAllStudentReviews: builder.query<any, void>({
            query: () => "/student-reviews/admin/all",
            providesTags: ["StudentReviews"],
        }),

        // --- REVIEW QUESTIONS (Admin & Portal) ---
        getQuestions: builder.query({
            query: (type) => `/${type}-reviews/questions`, // e.g. /teacher-reviews/questions
            providesTags: ["Reviews"],
        }),
        getAllQuestions: builder.query({
            query: (type) => `/${type}-reviews/admin/questions/all`,
            providesTags: ["Reviews"],
        }),
        createQuestion: builder.mutation({
            query: ({ type, ...body }) => ({
                url: `/${type}-reviews/admin/questions/create`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Reviews"],
        }),
        updateQuestion: builder.mutation({
            query: ({ type, id, ...body }) => ({
                url: `/${type}-reviews/admin/questions/update/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Reviews"],
        }),
        deleteQuestion: builder.mutation({
            query: ({ type, id }) => ({
                url: `/${type}-reviews/admin/questions/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Reviews"],
        }),

        // --- REVIEW PERIODS (Admin windows) ---
        getReviewWindow: builder.query({
            query: (type: 'teacher' | 'student') => `/reviews/windows/${type}`,
            providesTags: (_result, _error, type) => [{ type: 'ReviewWindows', id: type }],
        }),
        updateReviewWindow: builder.mutation({
            query: ({ type, ...body }) => ({
                url: `/reviews/windows/${type}`,
                method: 'PUT',
                body,
            }),
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
    useGetReviewWindowQuery,
    useUpdateReviewWindowMutation,
} = reviewApi;
