import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const programApi = createApi({
  reducerPath: "programApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/programs`,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Do not set Content-Type — browser sets multipart boundary for FormData
      return headers;
    },
  }),
  tagTypes: ["Programs"],
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({

    // ✔ GET ALL programs
    getPrograms: builder.query<any, void>({
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
