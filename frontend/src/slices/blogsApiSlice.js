import { apiSlice } from './apiSlice';
const BLOGS_URL = '/api/blogs';

export const blogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => BLOGS_URL,
      providesTags: ['Blogs'],
    }),
    getBlogDetails: builder.query({
      query: (id) => `${BLOGS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blogs', id }],
    }),
    createBlog: builder.mutation({
      query: (data) => ({
        url: BLOGS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Blogs'],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${BLOGS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Blogs'],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `${BLOGS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blogs'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogDetailsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApiSlice;
