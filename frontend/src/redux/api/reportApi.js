import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const reportApi = createApi({
  reducerPath: "reportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/reports",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    getStudentStats: builder.query({
      query: () => "/student-stats",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getProgramDistribution: builder.query({
      query: () => "/program-distribution",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getSubprogramDistribution: builder.query({
      query: () => "/subprogram-distribution",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getPerformanceOverview: builder.query({
      query: () => "/performance-overview",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getDetailedStudentList: builder.query({
      query: (params) => ({
        url: "/detailed-students",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getStudentDetailedReport: builder.query({
      query: (studentId) => `/student/${studentId}`,
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getAttendanceAnalytics: builder.query({
      query: (params) => ({
        url: "/attendance-analytics",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getAssignmentCompletionAnalytics: builder.query({
      query: (params) => ({
        url: "/assignment-completion",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getConsolidatedStats: builder.query({
      query: () => "/consolidated-stats",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    })
  }),
});

export const {
  useGetStudentStatsQuery,
  useGetProgramDistributionQuery,
  useGetSubprogramDistributionQuery,
  useGetPerformanceOverviewQuery,
  useGetDetailedStudentListQuery,
  useGetStudentDetailedReportQuery,
  useGetAttendanceAnalyticsQuery,
  useGetAssignmentCompletionAnalyticsQuery,
  useGetConsolidatedStatsQuery
} = reportApi;
