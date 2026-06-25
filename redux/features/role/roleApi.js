import { apiSlice } from "../../api/apiSlice";

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRole: builder.query({
      query: (email) => `/users/role/${email}`,
    }),
    getUser: builder.query({
      query: (email) => `/users/by-email/${email}`,
    }),
  }),
});

export const { useGetRoleQuery, useGetUserQuery } = roleApi;
