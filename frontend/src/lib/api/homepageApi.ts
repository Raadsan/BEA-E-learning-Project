import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants';
export const homepageApi = createApi({
  reducerPath: 'homepageApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL, prepareHeaders: (headers) => { const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; if (token) headers.set('Authorization', `Bearer ${token}`); return headers; } }),
  tagTypes: ['Homepage'],
  endpoints: (builder) => ({
    getHomepage: builder.query<any, void>({ query: () => '/homepage', providesTags: ['Homepage'] }),
    updateHomepage: builder.mutation<any, any>({ query: (body) => ({ url: '/homepage', method: 'PUT', body }), invalidatesTags: ['Homepage'] }),
  }),
});
export const { useGetHomepageQuery, useUpdateHomepageMutation } = homepageApi;
