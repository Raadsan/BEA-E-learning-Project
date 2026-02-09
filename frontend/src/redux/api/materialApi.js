import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const materialApi = createApi({
    reducerPath: "materialApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/materials`,
        prepareHeaders: (headers) => {
            const token = typeof window !== `undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Materials"],
    endpoints: (builder) => ({
        getMaterials: builder.query({
            query: () => "/",
            providesTags: ["Materials"],
        }),
        getStudentMaterials: builder.query({
            query: () => "/student",
            providesTags: ["Materials"],
        }),
        createMaterial: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Materials"],
        }),
        updateMaterial: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Materials"],
        }),
        deleteMaterial: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Materials"],
        }),
    }),
});

export const {
    useGetMaterialsQuery,
    useGetStudentMaterialsQuery,
    useCreateMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialMutation,
} = materialApi;
