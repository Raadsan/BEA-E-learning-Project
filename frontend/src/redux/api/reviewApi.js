import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api', // Changed from /api/reviews
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['StudentReviews', 'TeacherReviews', 'Reviews'],
    endpoints: (builder) => ({
        // --- STUDENT REVIEWS (Teachers reviewing Students) ---
        submitStudentReview: builder.mutation({
            query: (data) => ({
                url: '/student-reviews/submit',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['StudentReviews'],
        }),
        getStudentReviews: builder.query({
            query: (student_id) => student_id ? `/student-reviews/student/${student_id}` : '/student-reviews/my-reviews',
            providesTags: ['StudentReviews'],
        }),
        getStudentReviewsByTeacher: builder.query({
            query: () => '/student-reviews/my-reviews',
            providesTags: ['StudentReviews'],
        }),

        // --- TEACHER REVIEWS (Students reviewing Teachers) ---
        submitTeacherReview: builder.mutation({
            query: (data) => ({
                url: '/teacher-reviews/submit',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeacherReviews'],
        }),
        getTeacherReviews: builder.query({
            query: (teacher_id) => teacher_id ? `/teacher-reviews/teacher/${teacher_id}` : '/teacher-reviews/my-reviews',
            providesTags: ['TeacherReviews'],
        }),
        getTeachersToReview: builder.query({
            query: () => "/teacher-reviews/to-review",
            providesTags: ["Reviews"],
        }),
        getAllTeacherReviews: builder.query({
            query: () => "/teacher-reviews/admin/all",
            providesTags: ["TeacherReviews"],
        }),
        getAllStudentReviews: builder.query({
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
} = reviewApi;
