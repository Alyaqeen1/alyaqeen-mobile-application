import { apiSlice } from "../../api/apiSlice";

export const classesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ✅ KEEP - Get all classes (for dropdown/selection)
    getClasses: builder.query({
      query: () => "/classes",
      providesTags: ["Class"],
    }),
    
    // ✅ KEEP - Get single class details
    getClass: builder.query({
      query: (id) => `/classes/${id}`,
      providesTags: ["Class"],
    }),
    
    // ✅ KEEP - Find class by parameters (Teacher/Admin)
    getClassByParams: builder.query({
      query: ({ dept_id, class_id, session, time }) =>
        `/classes/find-one?dept_id=${dept_id}&class_id=${class_id}&session=${session}&time=${time}`,
      providesTags: ["Class"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (add new class)
    addClass: builder.mutation({
      query: (class_name) => ({
        url: "/classes",
        method: "POST",
        body: class_name,
      }),
      invalidatesTags: ["Class"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update class)
    updateClass: builder.mutation({
      query: ({ id, ...classData }) => ({
        url: `/classes/${id}`,
        method: "PUT",
        body: classData,
      }),
      invalidatesTags: ["Class"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (delete class)
    removeClass: builder.mutation({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Class"],
    }),
    
  }),
});

export const {
  // Query hooks - Available for all users (read-only)
  useGetClassesQuery,
  useGetClassQuery,
  useGetClassByParamsQuery,
  
  // Mutation hooks - Admin only
  useAddClassMutation,
  useUpdateClassMutation,
  useRemoveClassMutation,
} = classesApi;
