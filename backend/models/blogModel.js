import mongoose from 'mongoose';

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // store image URL/path
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // link to admin user
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
