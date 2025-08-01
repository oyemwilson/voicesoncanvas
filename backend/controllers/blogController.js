import asyncHandler from '../middleware/asyncHandler.js';
import Blog from '../models/blogModel.js';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({}).sort({ createdAt: -1 }).populate('author', 'name');
  res.json(blogs);
});

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name');
  if (blog) res.json(blog);
  else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

// @desc    Create blog (Admin)
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, image } = req.body;
  const blog = new Blog({
    title,
    content,
    image,
    author: req.user._id,
  });
  const createdBlog = await blog.save();
  res.status(201).json(createdBlog);
});

// @desc    Update blog (Admin)
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = asyncHandler(async (req, res) => {
  const { title, content, image } = req.body;
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    const updated = await blog.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

// @desc    Delete blog (Admin)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) {
    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } else {
    res.status(404);
    throw new Error('Blog not found');
  }
});

export { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
