import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classApi = createApi({
  reducerPath: "classApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/classes",
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Classes"],
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: () => "/",
      providesTags: ["Classes"],
    }),
    getClassesByCourseId: builder.query({
      query: (courseId) => `/course/${courseId}`,
      providesTags: ["Classes"],
    }),
    getClass: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Classes", id }],
    }),
    createClass: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes"],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassesByCourseIdQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;

