import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const uploadApi = createApi({
    reducerPath: "uploadApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/uploads`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        uploadFile: builder.mutation({
            query: (formData) => ({
                url: "/",
                method: "POST",
                body: formData,
            }),
        }),
    }),
});

export const { useUploadFileMutation } = uploadApi;
