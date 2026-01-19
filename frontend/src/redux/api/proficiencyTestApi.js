import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const proficiencyTestApi = createApi({
    reducerPath: 'proficiencyTestApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['ProficiencyTest'],
    endpoints: (builder) => ({
        getProficiencyTests: builder.query({
            query: () => '/proficiency-tests',
            providesTags: ['ProficiencyTest'],
        }),
        getProficiencyTestById: builder.query({
            query: (id) => `/proficiency-tests/${id}`,
            providesTags: (result, error, id) => [{ type: 'ProficiencyTest', id }],
        }),
        createProficiencyTest: builder.mutation({
            query: (newTest) => ({
                url: '/proficiency-tests',
                method: 'POST',
                body: newTest,
            }),
            invalidatesTags: ['ProficiencyTest'],
        }),
        updateProficiencyTest: builder.mutation({
            query: ({ id, ...updatedTest }) => ({
                url: `/proficiency-tests/${id}`,
                method: 'PUT',
                body: updatedTest,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'ProficiencyTest', id }, 'ProficiencyTest'],
        }),
        deleteProficiencyTest: builder.mutation({
            query: (id) => ({
                url: `/proficiency-tests/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProficiencyTest'],
        }),
        submitProficiencyTest: builder.mutation({
            query: (data) => ({
                url: '/proficiency-tests/submit',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ProficiencyTest'],
        }),
        getStudentProficiencyResults: builder.query({
            query: (studentId) => `/proficiency-tests/student/${studentId}/results`,
            providesTags: ['ProficiencyTest'],
        }),
        gradeProficiencyTest: builder.mutation({
            query: ({ resultId, ...patch }) => ({
                url: `/proficiency-tests/results/${resultId}/grade`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: ['ProficiencyTest'],
        }),
        getAllProficiencyResults: builder.query({
            query: () => '/proficiency-tests/results/all',
            providesTags: ['ProficiencyTest'],
        }),
    }),
});

export const {
    useGetProficiencyTestsQuery,
    useGetProficiencyTestByIdQuery,
    useCreateProficiencyTestMutation,
    useUpdateProficiencyTestMutation,
    useDeleteProficiencyTestMutation,
    useSubmitProficiencyTestMutation,
    useGetStudentProficiencyResultsQuery,
    useGradeProficiencyTestMutation,
    useGetAllProficiencyResultsQuery,
} = proficiencyTestApi;
