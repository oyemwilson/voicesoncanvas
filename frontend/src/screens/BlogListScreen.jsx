import React from 'react';
import { Link } from 'react-router-dom';
import { useGetBlogsQuery } from '../slices/blogsApiSlice';
import Loader from '../components/Loader';

const BlogListScreen = () => {
  const { data: blogs, isLoading } = useGetBlogsQuery();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Recent Blogs</h1>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              to={`/blog/${blog._id}`}
              key={blog._id}
              className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Image container */}
              <div className="relative h-64"> {/* 👈 taller image */}
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Type badge (top-left) */}
                <div className="absolute top-2 left-2  text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  {blog.type || 'Article'}
                </div>

                {/* Title overlay ALWAYS visible */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
<h2 className="text-white text-lg font-semibold line-clamp-2">
  {blog.title}
</h2>

                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogListScreen;
