import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export type PolicyRecord = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    content?: string | null;
    status?: string | null;
    sort_order?: number | null;
    created_at?: string;
    updated_at?: string;
};

export const policyApi = createApi({
    reducerPath: "policyApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/policies`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Policies"],
    endpoints: (builder) => ({
        getPolicies: builder.query<PolicyRecord[], boolean | { all?: boolean; systemOnly?: boolean } | void>({
            query: (arg) => {
                const params = new URLSearchParams();
                const opts = typeof arg === "object" && arg !== null ? arg : {};
                if (opts.all || arg === true) params.set("all", "true");
                if (opts.systemOnly) params.set("system_only", "true");
                const qs = params.toString();
                return qs ? `/?${qs}` : "/";
            },
            providesTags: ["Policies"],
        }),
        getPolicyBySlug: builder.query<PolicyRecord, string>({
            query: (slug) => `/slug/${slug}`,
            providesTags: (_r, _e, slug) => [{ type: "Policies", id: slug }],
        }),
        getPolicyById: builder.query<PolicyRecord, number>({
            query: (id) => `/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Policies", id }],
        }),
        createPolicy: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Policies"],
        }),
        updatePolicy: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
            invalidatesTags: ["Policies"],
        }),
        deletePolicy: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Policies"],
        }),
    }),
});

export const {
    useGetPoliciesQuery,
    useGetPolicyBySlugQuery,
    useGetPolicyByIdQuery,
    useCreatePolicyMutation,
    useUpdatePolicyMutation,
    useDeletePolicyMutation,
} = policyApi;
