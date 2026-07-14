import { apiSlice } from "../../api/apiSlice";

export const familiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // ⚠️ PARTIAL - Keep for Admin only (all families list)
    getFamilies: builder.query({
      query: () => "/families",
      providesTags: ["Family"],
    }),
    
    // ✅ KEEP - View family details
    getFamily: builder.query({
      query: (id) => `/families/${id}`,
      providesTags: ["Family"],
    }),
    
    // ✅ KEEP - Parent view own family with children
    getFullFamily: builder.query({
      query: () => `/families/with-children/enrolled`,
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (view all families with children)
    getAllFullFamily: builder.query({
      query: (email) => `/families/with-children/all/${email}`,
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (approved families)
    getApprovedFullFamily: builder.query({
      query: (email) => `/families/with-children/approved/${email}`,
      providesTags: ["Family"],
    }),
    
    // ✅ KEEP - Parent view enrolled children
    getEnrolledFullFamily: builder.query({
      query: (email) => `/families/with-children/enrolled/${email}`,
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (hold families)
    getHoldFullFamily: builder.query({
      query: () => `/families/with-children/hold`,
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (fee summary)
    getEnrolledFullFamilyWithFees: builder.query({
      query: () => `/families/with-children/enrolled-fee-summary`,
      providesTags: ["Family"],
    }),
    
    // ✅ KEEP - View enrolled family by ID
    getEnrolledFullFamilyById: builder.query({
      query: (id) => `/families/with-children/enrolled/by-id/${id}`,
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (direct debit families)
    getAdminDirectDebitFamilies: builder.query({
      query: () => "/families/admin/direct-debit-families-with-fees",
      providesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (specific direct debit family)
    getAdminDirectDebitFamily: builder.query({
      query: (id) => `/families/admin/direct-debit-family/${id}`,
      providesTags: (result, error, id) => [{ type: "Family", id }, "Family"],
    }),
    
    // ✅ KEEP - Check if family has direct debit setup
    getFamilyDebit: builder.query({
      query: (familyId) =>
        `/families/check-direct-debit-setup?familyId=${familyId}`,
      providesTags: (result, error, familyId) => [
        { type: "Family", id: familyId },
        "Family",
      ],
      transformResponse: (response) => {
        return {
          hasDirectDebit:
            response.hasDirectDebit !== undefined
              ? response.hasDirectDebit
              : response.directDebit &&
                response.directDebit.status === "active",
          directDebit: response.directDebit || null,
        };
      },
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (unpaid families)
    getUnpaidFamily: builder.query({
      query: ({ month, year }) => `/families/unpaid-families/${month}/${year}`,
      providesTags: (result, error, { month, year }) =>
        result
          ? [
              ...result.map((family) => ({
                type: "Family",
                id: family.familyId,
              })),
              { type: "UnpaidFamily", id: `${month}-${year}` },
              "Family",
              "Fee",
            ]
          : ["Family", "Fee", { type: "UnpaidFamily", id: `${month}-${year}` }],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update family data)
    updateFamilyData: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/families/update-by-admin/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (update fee choice)
    updateFamilyFeeChoice: builder.mutation({
      query: ({ email, ...patch }) => ({
        url: `/families/update-fee-choice/${email}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Family"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (delete family)
    deleteFamilyData: builder.mutation({
      query: (id) => ({
        url: `/families/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Family", "Student"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (manual payment collection)
    collectAdminPayment: builder.mutation({
      query: ({ familyId, amount, description }) => ({
        url: "/families/admin/collect-payment",
        method: "POST",
        body: { familyId, amount, description },
      }),
      invalidatesTags: (result, error, { familyId }) => [
        { type: "Family", id: familyId },
        "Fee",
        "Family",
      ],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (check pending payments)
    checkPayment: builder.mutation({
      query: () => ({
        url: "/families/refresh-all-pending-payments",
        method: "POST",
      }),
      invalidatesTags: ["Family", "Fee"],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (cancel direct debit)
    cancelFamilyDebit: builder.mutation({
      query: (familyId) => ({
        url: `/families/cancel-direct-debit`,
        method: "PATCH",
        body: { familyId: familyId },
      }),
      invalidatesTags: (result, error, familyId) => [
        { type: "Family", id: familyId },
        "Family",
      ],
    }),
    
    // ⚠️ PARTIAL - Keep for Admin only (migrate family data)
    migrateFamilyData: builder.mutation({
      query: ({ familyId, email, password }) => ({
        url: `/families/admin/migrate-family/${familyId}`,
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["Family", "Fee"],
    }),
    
  }),
});

export const {
  // Query hooks
  useGetFamiliesQuery,                    // ⚠️ Admin only
  useGetFamilyQuery,                      // ✅ All roles
  useGetFullFamilyQuery,                  // ✅ Parent
  useGetFamilyDebitQuery,                 // ✅ Parent/Admin
  useGetEnrolledFullFamilyQuery,          // ✅ Parent
  useGetEnrolledFullFamilyByIdQuery,      // ✅ Parent/Admin
  useGetEnrolledFullFamilyWithFeesQuery,  // ⚠️ Admin only
  useGetUnpaidFamilyQuery,                // ⚠️ Admin only
  useGetAllFullFamilyQuery,               // ⚠️ Admin only
  useGetApprovedFullFamilyQuery,          // ⚠️ Admin only
  useGetHoldFullFamilyQuery,              // ⚠️ Admin only
  useGetAdminDirectDebitFamiliesQuery,    // ⚠️ Admin only
  useGetAdminDirectDebitFamilyQuery,      // ⚠️ Admin only
  
  // Mutation hooks
  useUpdateFamilyDataMutation,            // ⚠️ Admin only
  useUpdateFamilyFeeChoiceMutation,       // ⚠️ Admin only
  useCancelFamilyDebitMutation,           // ⚠️ Admin only
  useDeleteFamilyDataMutation,            // ⚠️ Admin only
  useCheckPaymentMutation,                // ⚠️ Admin only
  useCollectAdminPaymentMutation,         // ⚠️ Admin only
  useMigrateFamilyDataMutation,           // ⚠️ Admin only
} = familiesApi;
