import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetBlogDetailsQuery } from '../slices/blogsApiSlice';
import Loader from '../components/Loader';

const BlogDetailScreen = () => {
  const { id } = useParams();
  const { data: blog, isLoading } = useGetBlogDetailsQuery(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!blog) {
    return <p>Blog not found.</p>;
  }

  const author = blog.writer || blog.author?.name || 'Unknown';
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        to="/blogs"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to Blogs
      </Link>
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-72 object-cover rounded-lg shadow-md mb-6"
        />
      )}
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        By {author} • {formattedDate}
      </p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
      />
    </div>
  );
};

export default BlogDetailScreen;