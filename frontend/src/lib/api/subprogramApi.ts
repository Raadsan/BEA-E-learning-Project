import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const subprogramApi = createApi({
  reducerPath: "subprogramApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/subprograms`,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Subprograms"],
  endpoints: (builder) => ({
    getSubprograms: builder.query({
      query: () => "/",
      providesTags: ["Subprograms"],
    }),
    getSubprogramsByProgramId: builder.query({
      query: (programId) => `/program/${programId}`,
      providesTags: ["Subprograms"],
    }),
    getSubprogram: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Subprograms", id }],
    }),
    createSubprogram: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subprograms"],
    }),
    updateSubprogram: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subprograms"],
    }),
    deleteSubprogram: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subprograms"],
    }),
  }),
});

export const {
  useGetSubprogramsQuery,
  useGetSubprogramsByProgramIdQuery,
  useGetSubprogramQuery,
  useCreateSubprogramMutation,
  useUpdateSubprogramMutation,
  useDeleteSubprogramMutation,
} = subprogramApi;

