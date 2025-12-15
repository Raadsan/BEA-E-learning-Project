import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/admins",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Admins"],
  endpoints: (builder) => ({
    // GET ALL admins
    getAdmins: builder.query({
      query: () => "/",
      providesTags: ["Admins"],
      transformResponse: (response) => {
        console.log("📥 Admin API Response:", response);
        if (response && response.success && Array.isArray(response.admins)) {
          return response.admins;
        }
        // If response is not in expected format, return empty array
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("❌ Admin API Error:", response);
        return response;
      },
    }),

    // GET SINGLE admin
    getAdmin: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "Admins", id }],
      transformResponse: (response) => {
        if (response.success) {
          return response.admin;
        }
        return response;
      },
    }),

    // CREATE admin
    createAdmin: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admins"],
    }),

    // UPDATE admin
    updateAdmin: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Admins"],
    }),

    // DELETE admin
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admins"],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetAdminQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminApi;

