import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/users",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // GET ALL users (admins, teachers, students)
    getUsers: builder.query({
      query: () => "/",
      providesTags: ["Users"],
      transformResponse: (response) => {
        console.log("📥 User API Response:", response);
        if (response && response.success && Array.isArray(response.users)) {
          return response.users;
        }
        // If response is not in expected format, return empty array
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("❌ User API Error:", response);
        return response;
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
} = userApi;


