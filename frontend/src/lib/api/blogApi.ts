import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Blogs"],
  endpoints: (builder) => ({
    getBlogPage: builder.query<any, boolean | void>({
      query: (all = false) => `/blogs${all ? "/admin" : ""}`,
      providesTags: ["Blogs"],
    }),
    updateBlogSettings: builder.mutation<any, any>({
      query: (body) => ({ url: "/blogs/settings", method: "PUT", body }),
      invalidatesTags: ["Blogs"],
    }),
    createBlog: builder.mutation<any, any>({
      query: (body) => ({ url: "/blogs", method: "POST", body }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: builder.mutation<any, any>({
      query: ({ id, ...body }) => ({ url: `/blogs/${id}`, method: "PUT", body }),
      invalidatesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation<any, number>({
      query: (id) => ({ url: `/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});

export const { useGetBlogPageQuery, useUpdateBlogSettingsMutation, useCreateBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation } = blogApi;
