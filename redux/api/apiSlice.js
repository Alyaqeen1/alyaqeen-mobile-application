import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Dummy API slice - no endpoints implemented yet
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }), // Placeholder base URL
  tagTypes: [],
  endpoints: () => ({}),
});

export const {} = apiSlice;
