import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const programApi = createApi({
  reducerPath: "programApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/programs`,
    prepareHeaders: (headers) => {
      // Let the browser set the Content-Type for FormData (multipart/form-data)
      return headers;
    },
  }),
  tagTypes: ["Programs"],
  endpoints: (builder) => ({

    // ✔ GET ALL programs
    getPrograms: builder.query({
      query: () => "/",
      providesTags: ["Programs"],
    }),

    // ✔ GET SINGLE program
    getProgram: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Programs", id }],
    }),

    // ✔ CREATE program (image + video)
    createProgram: builder.mutation({
      query: (formData) => ({
        url: "/",
        method: "POST",
        body: formData, // must be FormData
      }),
      invalidatesTags: ["Programs"],
    }),

    // ✔ UPDATE program
    updateProgram: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData, // FormData again
      }),
      invalidatesTags: ["Programs"],
    }),

    // ✔ DELETE program
    deleteProgram: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Programs"],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programApi;
