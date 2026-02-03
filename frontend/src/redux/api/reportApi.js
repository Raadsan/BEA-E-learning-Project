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
      query: (params) => ({
        url: "/student-stats",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getProgramDistribution: builder.query({
      query: (params) => ({
        url: "/program-distribution",
        params
      }),
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
      query: (params) => ({
        url: "/consolidated-stats",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getAssessmentStats: builder.query({
      query: (params) => ({
        url: "/assessment-stats",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getAssessmentDistribution: builder.query({
      query: (params) => ({
        url: "/assessment-distribution",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getRecentAssessments: builder.query({
      query: () => "/recent-assessments",
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getAssessmentGenderStats: builder.query({
      query: (params) => ({
        url: "/assessment-gender",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getClassAssessmentActivity: builder.query({
      query: (params) => ({
        url: "/class-assessment-activity",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getPaymentStats: builder.query({
      query: (params) => ({
        url: "/payment-stats",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getPaymentDistribution: builder.query({
      query: (params) => ({
        url: "/payment-distribution",
        params
      }),
      providesTags: ["Reports"],
      transformResponse: (response) => response.success ? response.data : response
    }),
    getDetailedPaymentList: builder.query({
      query: (params) => ({
        url: "/payment-detailed",
        params
      }),
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
  useLazyGetDetailedStudentListQuery,
  useGetStudentDetailedReportQuery,
  useGetAttendanceAnalyticsQuery,
  useGetAssignmentCompletionAnalyticsQuery,
  useGetConsolidatedStatsQuery,
  useGetAssessmentStatsQuery,
  useGetAssessmentDistributionQuery,
  useGetRecentAssessmentsQuery,
  useGetAssessmentGenderStatsQuery,
  useGetClassAssessmentActivityQuery,
  useGetPaymentStatsQuery,
  useGetPaymentDistributionQuery,
  useGetDetailedPaymentListQuery,
  useLazyGetDetailedPaymentListQuery
} = reportApi;
