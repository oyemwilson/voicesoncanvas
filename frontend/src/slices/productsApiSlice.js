import { PRODUCTS_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Existing
    getProducts: builder.query({
      query: ({ keyword, pageNumber }) => ({
        url: PRODUCTS_URL,
        params: { keyword, pageNumber },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Products'],
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    // In your productsApiSlice.js
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    uploadProductImage: builder.mutation({
      query: (formData) => ({
        url: '/api/upload', // ✅ match backend
        method: 'POST',
        body: formData,
      }),
    }),
    updateProduct: builder.mutation({
  query: (data) => ({
    url: `${PRODUCTS_URL}/${data.productId}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['Products'],
}),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    getTopProducts: builder.query({
      query: () => `${PRODUCTS_URL}/top`,
      keepUnusedDataFor: 5,
    }),

    // ✨ NEW ENDPOINTS BASED ON YOUR CONTROLLER ✨

    // Featured products
    getFeaturedProducts: builder.query({
      query: () => `${PRODUCTS_URL}/featured`,
      keepUnusedDataFor: 5,
    }),

    // Sale products
    getSaleProducts: builder.query({
      query: () => `${PRODUCTS_URL}/sale`,
      keepUnusedDataFor: 5,
    }),

    // Best sellers
    getBestSellers: builder.query({
      query: () => `${PRODUCTS_URL}/best-sellers`,
      keepUnusedDataFor: 5,
    }),

    // New arrivals
    getNewArrivals: builder.query({
      query: () => `${PRODUCTS_URL}/new-arrivals`,
      keepUnusedDataFor: 5,
    }),

    // Products by category
    getProductsByCategory: builder.query({
      query: ({ category, pageNumber = 1, keyword = '' }) => ({
        url: `${PRODUCTS_URL}/category/${category}`,
        params: { pageNumber, keyword },
      }),
      keepUnusedDataFor: 5,
    }),

    // Products by brand
    getProductsByBrand: builder.query({
      query: ({ brand, pageNumber = 1, keyword = '' }) => ({
        url: `${PRODUCTS_URL}/brand/${brand}`,
        params: { pageNumber, keyword },
      }),
      keepUnusedDataFor: 5,
    }),

    // Get categories list
    getCategories: builder.query({
      query: () => `${PRODUCTS_URL}/categories`,
      keepUnusedDataFor: 5,
    }),

    // Get brands list
    getBrands: builder.query({
      query: () => `${PRODUCTS_URL}/brands`,
      keepUnusedDataFor: 5,
    }),

    // Recommended products for a specific product
    getRecommendedProducts: builder.query({
      query: (productId) => `${PRODUCTS_URL}/recommended/${productId}`,
      keepUnusedDataFor: 5,
    }),

    // Product statistics (admin)
    getProductStats: builder.query({
      query: () => `${PRODUCTS_URL}/stats`,
      keepUnusedDataFor: 5,
    }),

    // Toggle featured status (admin)
    toggleFeaturedProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: ['Products'], // 🔥 auto refetch products list
    }),

    // Search suggestions
    searchProducts: builder.query({
      query: (keyword) => ({
        url: `${PRODUCTS_URL}/search`,
        params: { keyword },
      }),
    }),
    approveProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Products'],
    }),

    declineProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,    // your DELETE route
        method: 'DELETE',
      }),
          invalidatesTags: ['UnapprovedProducts'],
    }),

    // ⭐ Toggle featured collection (Admin)
    toggleFeaturedCollection: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}/feature-collection`,
        method: 'PUT',
      }),
      invalidatesTags: ['Products'],
    }),

    // 📦 Get featured collections
    getFeaturedCollections: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/featured-collections`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    // 🎨 Get products by artist
    getProductsByArtist: builder.query({
      query: (artistId) => ({
        url: `${PRODUCTS_URL}/artist/${artistId}`,
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    getUnapprovedProducts: builder.query({
  query: () => ({
    url: `${PRODUCTS_URL}/unapproved`,
  }),
  providesTags: ['Products'],
}),




  }),
});

export const {
  // ✅ existing
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,

  // ✅ new ones
  useGetFeaturedProductsQuery,
  useGetSaleProductsQuery,
  useGetBestSellersQuery,
  useGetNewArrivalsQuery,
  useGetProductsByCategoryQuery,
  useGetProductsByBrandQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetRecommendedProductsQuery,
  useGetProductStatsQuery,
  useToggleFeaturedProductMutation,
  useSearchProductsQuery,
  useApproveProductMutation,           // ✅ added
  useDeclineProductMutation,
  useToggleFeaturedCollectionMutation, // ✅ added
  useGetFeaturedCollectionsQuery,      // ✅ added
  useGetProductsByArtistQuery,          // ✅ added
  useGetUnapprovedProductsQuery
} = productsApiSlice;

