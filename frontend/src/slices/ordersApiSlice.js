import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),

    // Get single order details
    getOrderDetails: builder.query({
      query: (id) => `${ORDERS_URL}/${id}`,
      keepUnusedDataFor: 5,
    }),

    // Pay for order
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),

    // Get PayPal client ID
    getPaypalClientId: builder.query({
      query: () => PAYPAL_URL,
      keepUnusedDataFor: 5,
    }),

    // Get logged-in user's orders
    getMyOrders: builder.query({
      query: () => `${ORDERS_URL}/myorders`,
      keepUnusedDataFor: 5,
    }),

    // Get all orders (admin)
    getOrders: builder.query({
      query: () => ORDERS_URL,
      keepUnusedDataFor: 5,
    }),

    // Mark order as delivered (admin)
    // deliverOrder: builder.mutation({
    //   query: (orderId) => ({
    //     url: `${ORDERS_URL}/${orderId}/deliver`,
    //     method: 'PUT',
    //   }),
    // }),

    // Update order status (admin)
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${ORDERS_URL}/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
    }),

    // Cancel order (user or admin)
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
      }),
    }),

    // Get order statistics (admin)
    getOrderStats: builder.query({
      query: () => `${ORDERS_URL}/stats`,
      keepUnusedDataFor: 5,
    }),

    // Get recent orders (admin)
    getRecentOrders: builder.query({
      query: ({ limit = 10 } = {}) => `${ORDERS_URL}/recent?limit=${limit}`,
      keepUnusedDataFor: 5,
    }),

    // Mark order as shipped (seller)
    shipOrder: builder.mutation({
      query: ({ orderId, trackingNumber, carrier, shippingDate }) => ({
        url: `${ORDERS_URL}/${orderId}/ship`,
        method: 'PUT',
        body: { trackingNumber, carrier, shippingDate },
      }),
    }),

    // Confirm receipt (buyer)
    // confirmReceipt: builder.mutation({
    //   query: (orderId) => ({
    //     url: `${ORDERS_URL}/${orderId}/received`,
    //     method: 'PUT',
    //   }),
    // }),

    // Create a dispute (buyer or seller)
    // createDispute: builder.mutation({
    //   query: ({ orderId, reason, description, disputeType }) => ({
    //     url: `${ORDERS_URL}/${orderId}/dispute`,
    //     method: 'POST',
    //     body: { reason, description, disputeType },
    //   }),
    // }),

    // // Update a dispute (admin)
    // updateDispute: builder.mutation({
    //   query: ({ orderId, status, resolution, adminNotes }) => ({
    //     url: `${ORDERS_URL}/${orderId}/dispute`,
    //     method: 'PUT',
    //     body: { status, resolution, adminNotes },
    //   }),
    // }),

        getSellerOrders: builder.query({
      query: () => `${ORDERS_URL}/seller`,
      providesTags: ['Orders'],
      keepUnusedDataFor: 5,
    }),
getSellerOpenSales: builder.query({
      query: () => `${ORDERS_URL}/my-open-sales`, // backend path we created
      keepUnusedDataFor: 5,
    }),
    // ordersApiSlice.js
// getSellerNewOrders: builder.query({
//   query: () => `${ORDERS_URL}/my-open-sales`,   // new path
// }),

       // Buyer “Mark as Delivered”
//  confirmReceipt: builder.mutation({
//      query: (orderId) => ({
//        url: `${ORDERS_URL}/${orderId}/deliver`,
//        method: 'PUT',
//      }),
//      invalidatesTags: ['Orders'],   }),
     confirmReceipt: builder.mutation({
     query: (orderId) => ({
       url: `${ORDERS_URL}/${orderId}/deliver`,
       method: 'PUT',
     }),
     invalidatesTags: ['Order', 'Orders'],
   }),
//    getDisputes: builder.query({
//   query: () => `${ORDERS_URL}/disputes`,
// }),


    // // Get all disputes (admin)
    // getDisputes: builder.query({
    //   query: () => `${ORDERS_URL}/disputes`,
    //   keepUnusedDataFor: 5,
    // }),

        // All disputes (admin)
    // getDisputes: builder.query({
    //   query: () => `${ORDERS_URL}/disputes`,
    //   keepUnusedDataFor: 5,
    // }),

    getDisputes: builder.query({
      query: () => `${ORDERS_URL}/disputes`,
      providesTags: (result) =>
        result
          ? [
              { type: 'Disputes', id: 'LIST' },
              ...result.map((d) => ({ type: 'Disputes', id: d._id })),
            ]
          : [{ type: 'Disputes', id: 'LIST' }],
    }),

    // Create a new dispute
    createDispute: builder.mutation({
      query: ({ orderId, reason, description, disputeType }) => ({
        url: `${ORDERS_URL}/${orderId}/dispute`,
        method: 'POST',
        body: { reason, description, disputeType },
      }),
      invalidatesTags: [{ type: 'Disputes', id: 'LIST' }],
    }),

    closeDispute: builder.mutation({
  query: ({ orderId }) => ({
    url: `${ORDERS_URL}/${orderId}/dispute/close`,
    method: 'PUT',
  }),
  invalidatesTags: ['Order','Disputes'],
}),

    // Update an existing dispute (admin)
    updateDispute: builder.mutation({
      query: ({ orderId, status, resolution, adminNotes }) => ({
        url: `${ORDERS_URL}/${orderId}/dispute`,
        method: 'PUT',
        body: { status, resolution, adminNotes },
      }),
      invalidatesTags: [{ type: 'Disputes', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  // useDeliverOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetOrderStatsQuery,
  useGetRecentOrdersQuery,
  useShipOrderMutation,
  useConfirmReceiptMutation,
    useGetSellerOrdersQuery,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
  useGetDisputesQuery,
  useGetSellerOpenSalesQuery,
  
  
} = orderApiSlice;
