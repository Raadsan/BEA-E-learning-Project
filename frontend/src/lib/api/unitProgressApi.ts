import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants";

export const unitProgressApi = createApi({
    reducerPath: "unitProgressApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/unit-progress`,
        prepareHeaders: (headers) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["UnitProgress"],
    endpoints: (builder) => ({
        checkUnitEligibility: builder.query({
            query: () => "/eligibility",
            providesTags: ["UnitProgress"],
        }),
        completeCurrentUnit: builder.mutation({
            query: () => ({
                url: "/complete",
                method: "POST",
            }),
            invalidatesTags: ["UnitProgress"],
        }),
    }),
});

export const { useCheckUnitEligibilityQuery, useCompleteCurrentUnitMutation } = unitProgressApi;
